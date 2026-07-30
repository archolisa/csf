import { NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ applicants: [], documents: [] });
    }

    await connectDB();
    const regex = new RegExp(query.trim(), "i");

    // Search for applicants
    const applicants = await ScholarshipApplication.find({
      $or: [{ applicant_name: regex }, { email: regex }, { phone: regex }],
    })
      .sort({ submitted_at: -1 })
      .limit(5)
      .select("_id applicant_name email status");

    // Search for documents
    const documents = await Document.find({
      $or: [{ file_name: regex }, { description: regex }],
    })
      .sort({ uploaded_at: -1 })
      .limit(5)
      .select("_id file_name file_type category application_id");

    return NextResponse.json({
      applicants: applicants.map(app => ({
        id: app._id.toString(),
        name: app.applicant_name,
        email: app.email,
        status: app.status
      })),
      documents: documents.map(doc => ({
        id: doc._id.toString(),
        name: doc.file_name,
        type: doc.file_type,
        category: doc.category,
        applicationId: doc.application_id?.toString()
      }))
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
