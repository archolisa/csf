import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
    const applicant_name = formData.get("applicant_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const field_of_study = formData.get("field_of_study") as string;
    const gpaVal = formData.get("gpa") as string;
    const gpa = gpaVal ? parseFloat(gpaVal) : undefined;

    if (!applicant_name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if an application already exists for this email
    const existing = await ScholarshipApplication.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An application with this email already exists" },
        { status: 400 }
      );
    }

    // Create scholarship application
    const application = await ScholarshipApplication.create({
      applicant_name,
      email,
      phone,
      field_of_study,
      gpa,
      status: "pending",
    });

    // Ensure upload directory exists
    await ensureUploadDir();

    // Helper function to save a file and create Document record
    const saveFile = async (fileKey: string, resultName: string) => {
      const file = formData.get(fileKey) as File | null;
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type for ${resultName}. Allowed: PDF, Word, Images`);
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${resultName} exceeds 10MB limit`);
      }

      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${timestamp}-${fileKey}-${originalName}`;
      const filePath = join(UPLOAD_DIR, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      await Document.create({
        application_id: application._id,
        file_name: `${resultName} - ${file.name}`,
        file_type: file.type,
        file_path: `/uploads/documents/${fileName}`,
        file_size: file.size,
        uploaded_by_student: true,
      });
    };

    // Save JAMB, WAEC, and Admission Letter
    try {
      await saveFile("jamb_result", "JAMB Result");
      await saveFile("waec_result", "WAEC Result");
      await saveFile("admission_letter", "Admission Letter");
    } catch (uploadError) {
      // Clean up application if files failed to upload/validate
      await ScholarshipApplication.findByIdAndDelete(application._id);
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload files";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    }, { status: 201 });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
