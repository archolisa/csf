import { NextRequest, NextResponse } from "next/server";
import { Document, connectDB } from "@/lib/db";
import { Types } from "mongoose";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const document = await Document.findById(id).lean();

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document._id?.toString(),
        file_name: document.file_name,
        file_type: document.file_type,
        file_path: document.file_path,
        file_size: document.file_size,
        uploaded_at: document.uploaded_at,
        application_id: document.application_id?.toString(),
        admin_id: document.admin_id?.toString(),
        uploaded_by_student: document.uploaded_by_student || false,
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    const filePath = join(process.cwd(), "public", document.file_path.replace(/^\//, ""));
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (fsErr) {
      console.error("Error unlinking file from disk:", fsErr);
    }

    // Delete record from database
    await Document.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { file_name } = body;

    if (!file_name || file_name.trim() === "") {
      return NextResponse.json(
        { error: "New file name is required" },
        { status: 400 }
      );
    }

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    
    let finalDisplayName = file_name.trim();
    // preserve original extension if not provided
    if (!finalDisplayName.includes(".")) {
       const originalName = document.file_name;
       const extension = originalName.substring(originalName.lastIndexOf('.'));
       finalDisplayName = `${finalDisplayName}${extension}`;
    }

    document.file_name = finalDisplayName;
    await document.save();

    return NextResponse.json({
      success: true,
      document: {
        id: document._id?.toString(),
        file_name: document.file_name,
      }
    });
  } catch (error) {
    console.error("Error renaming document:", error);
    return NextResponse.json(
      { error: "Failed to rename document" },
      { status: 500 }
    );
  }
}
