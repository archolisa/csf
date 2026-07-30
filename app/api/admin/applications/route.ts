import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const batch = searchParams.get("batch");
    const limit = parseInt(searchParams.get("limit") || "100");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (batch && batch !== "all") {
      query.batch = batch;
    }

    const applications = await ScholarshipApplication.find(query)
      .sort({ submitted_at: -1 })
      .limit(limit);

    const applicationsWithCounts = await Promise.all(
      applications.map(async (app) => {
        const docsCount = await Document.countDocuments({ application_id: app._id });
        return {
          id: app._id.toString(),
          applicant_name: app.applicant_name,
          email: app.email,
          phone: app.phone || "",
          field_of_study: app.field_of_study || "",
          gpa: app.gpa || 0,
          status: app.status,
          submitted_at: app.submitted_at,
          updated_at: app.updated_at,
          documents_count: docsCount,
          notes_count: app.notes ? app.notes.length : 0,
          
          // Google Sheets fields
          date_of_birth: app.date_of_birth || "",
          age: app.age || 0,
          village: app.village || "",
          jamb_score: app.jamb_score || 0,
          is_indigene: app.is_indigene || "",
          home_address: app.home_address || "",
          sponsor_name: app.sponsor_name || "",
          sponsor_phone: app.sponsor_phone || "",
          institution: app.institution || "",
          level: app.level || "",
          personal_statement: app.personal_statement || "",
          jamb_result_url: app.jamb_result_url || "",
          waec_result_url: app.waec_result_url || "",
          admission_letter_url: app.admission_letter_url || "",
          passport_photo_url: app.passport_photo_url || "",
          batch: app.batch || "2025",
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: applicationsWithCounts.length,
      applications: applicationsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { applicant_name, email, phone, field_of_study, gpa } = await req.json();

    if (!applicant_name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const application = await ScholarshipApplication.create({
      applicant_name,
      email,
      phone,
      field_of_study,
      gpa,
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
