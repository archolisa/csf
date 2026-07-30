import { NextRequest, NextResponse } from "next/server";
import { Document, connectDB } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { Types } from "mongoose";

interface PopulatedMongooseDocumentLean {
  _id: Types.ObjectId;
  application_id?: {
    _id: Types.ObjectId;
    applicant_name: string;
  } | null;
  admin_id?: Types.ObjectId | null;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  uploaded_at: Date;
  uploaded_by_student?: boolean;
  category?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
}

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
    const applicationId = formData.get("applicationId") as string | null;
    const adminId = formData.get("adminId") as string;
    const category = formData.get("category") as string | null;
    const customName = formData.get("custom_name") as string | null;
    const description = formData.get("description") as string | null;
    const tagsString = formData.get("tags") as string | null;
    const isPublic = formData.get("is_public") === "true";

    if (!file || !adminId) {
      return NextResponse.json(
        { error: "File and adminId are required" },
        { status: 400 }
      );
    }

    if (applicationId && !Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { error: "Invalid applicationId" },
        { status: 400 }
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

    // Determine final display name and safe file name
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    let finalDisplayName = originalName;
    
    if (customName && customName.trim() !== "") {
       // if custom name doesn't have an extension, append the original extension
       if (!customName.includes('.')) {
          finalDisplayName = `${customName.trim()}${extension}`;
       } else {
          finalDisplayName = customName.trim();
       }
    }

    const safeName = finalDisplayName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const fileName = `${timestamp}-${safeName}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save document record to database
    const documentData: Record<string, unknown> = {
      admin_id: new Types.ObjectId(adminId),
      file_name: finalDisplayName,
      file_type: file.type,
      file_path: `/uploads/documents/${fileName}`,
      file_size: file.size,
      category: category || "admin_files",
      description: description || "",
      tags: tagsString ? tagsString.split(",").map(t => t.trim()).filter(Boolean) : [],
      is_public: isPublic,
    };

    if (applicationId) {
      documentData.application_id = new Types.ObjectId(applicationId);
    }

    const document = await Document.create(documentData);

    return NextResponse.json({
      success: true,
      document,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");
    const storageOnly = searchParams.get("storageOnly") === "true";
    const adminOnly = searchParams.get("adminOnly") === "true";

    // Build query based on parameters
    const query: Record<string, unknown> = {};
    
    if (applicationId) {
      // Get documents for specific application
      query.application_id = new Types.ObjectId(applicationId);
    } else if (storageOnly) {
      // Get only admin storage files (no application)
      query.application_id = { $exists: false };
    }

    // Exclude student-uploaded credentials (synced from sheets or uploaded by students)
    if (adminOnly) {
      query.uploaded_by_student = { $ne: true };
    }

    // Get documents with application info
    const documents = await Document.find(query)
      .populate("application_id")
      .sort({ uploaded_at: -1 });

    const mappedDocuments = (documents as unknown as PopulatedMongooseDocumentLean[]).map((doc) => ({
      id: doc._id.toString(),
      application_id: doc.application_id ? doc.application_id._id.toString() : null,
      admin_id: doc.admin_id ? doc.admin_id.toString() : null,
      file_name: doc.file_name,
      file_type: doc.file_type,
      file_path: doc.file_path,
      file_size: doc.file_size,
      uploaded_at: doc.uploaded_at,
      uploaded_by: doc.application_id?.applicant_name || "Admin Storage",
      applicant_id: doc.application_id ? doc.application_id._id.toString() : "",
      applicant_name: doc.application_id?.applicant_name || "Admin Storage",
      uploaded_by_student: doc.uploaded_by_student || false,
      category: doc.category || "admin_files",
      description: doc.description || "",
      tags: doc.tags || [],
      is_public: doc.is_public || false,
    }));

    return NextResponse.json({
      success: true,
      documents: mappedDocuments,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { documentId, fileName } = await req.json();

    if (!documentId || !fileName) {
      return NextResponse.json(
        { error: "documentId and fileName are required" },
        { status: 400 }
      );
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { file_name: fileName, uploaded_at: new Date() },
      { new: true }
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument._id.toString(),
        application_id: updatedDocument.application_id.toString(),
        admin_id: updatedDocument.admin_id.toString(),
        file_name: updatedDocument.file_name,
        file_type: updatedDocument.file_type,
        file_path: updatedDocument.file_path,
        file_size: updatedDocument.file_size,
        uploaded_at: updatedDocument.uploaded_at,
      },
    });
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const documentPath = join(process.cwd(), "public", document.file_path.replace(/^\//, ""));
    if (existsSync(documentPath)) {
      await unlink(documentPath);
    }

    await Document.findByIdAndDelete(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
