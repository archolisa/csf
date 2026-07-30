import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { Types } from "mongoose";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "documents");
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/gif"];

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;
    const session = formData.get("session") as string;

    if (!file || !applicationId || !session) {
      return NextResponse.json(
        { error: "File, applicationId, and session are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { error: "Invalid applicationId" },
        { status: 400 }
      );
    }

    // Check if application is awarded (successful candidate)
    const application = await ScholarshipApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "awarded") {
      return NextResponse.json(
        { error: "Only successful candidates can upload semester results" },
        { status: 403 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, Word, Images" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-semester-${originalName}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create Document record
    const document = await Document.create({
      application_id: new Types.ObjectId(applicationId),
      file_name: `Semester Result (${session}) - ${file.name}`,
      file_type: file.type,
      file_path: `/uploads/documents/${fileName}`,
      file_size: file.size,
      uploaded_by_student: true,
    });

    return NextResponse.json({
      success: true,
      document,
    }, { status: 201 });

  } catch (error) {
    console.error("Student result upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload semester result" },
      { status: 500 }
    );
  }
}
