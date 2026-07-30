import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";
import { ScholarshipApplication as IScholarshipApplication } from "@/lib/interfaces";
import { Types } from "mongoose";

interface MongooseDocumentLean {
  _id: Types.ObjectId;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: Date;
  uploaded_by_student: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const applicationRaw = await ScholarshipApplication.findById(id).lean();
    if (!applicationRaw) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = applicationRaw as unknown as IScholarshipApplication & {
      _id: Types.ObjectId;
      notes?: { author: string; text: string; createdAt: Date }[];
    };

    // Fetch documents linked to this application
    const documents = await Document.find({ application_id: new Types.ObjectId(id) })
      .sort({ uploaded_at: -1 })
      .lean();

    const formattedDocs = (documents as unknown as MongooseDocumentLean[]).map((doc) => ({
      id: doc._id.toString(),
      name: doc.file_name,
      type: doc.file_type,
      size: doc.file_size,
      url: doc.file_path,
      uploadedAt: doc.uploaded_at,
      uploaded_by_student: doc.uploaded_by_student || false,
    }));

    return NextResponse.json({
      success: true,
      application: {
        id: application._id.toString(),
        applicant_name: application.applicant_name,
        email: application.email,
        phone: application.phone || "",
        field_of_study: application.field_of_study || "",
        gpa: application.gpa || 0,
        status: application.status,
        submitted_at: application.submitted_at,
        updated_at: application.updated_at,
        notes: application.notes || [],
        
        // Google Sheets fields
        date_of_birth: application.date_of_birth || "",
        age: application.age || 0,
        village: application.village || "",
        jamb_score: application.jamb_score || 0,
        is_indigene: application.is_indigene || "",
        home_address: application.home_address || "",
        sponsor_name: application.sponsor_name || "",
        sponsor_phone: application.sponsor_phone || "",
        institution: application.institution || "",
        level: application.level || "",
        personal_statement: application.personal_statement || "",
        jamb_result_url: application.jamb_result_url || "",
        waec_result_url: application.waec_result_url || "",
        admission_letter_url: application.admission_letter_url || "",
        passport_photo_url: application.passport_photo_url || "",
        batch: application.batch || "2025",
      },
      documents: formattedDocs,
    });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      { error: "Failed to fetch application details" },
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
    const { status } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    if (!["pending", "under_review", "awarded", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedApp = await ScholarshipApplication.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    );

    if (!updatedApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { text, author } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    if (!text || !author) {
      return NextResponse.json(
        { error: "Note text and author are required" },
        { status: 400 }
      );
    }

    const application = await ScholarshipApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const newNote = {
      author,
      text,
      createdAt: new Date(),
    };

    application.notes = application.notes || [];
    application.notes.push(newNote);
    await application.save();

    return NextResponse.json({
      success: true,
      notes: application.notes,
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}
