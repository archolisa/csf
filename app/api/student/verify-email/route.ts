import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const application = await ScholarshipApplication.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).lean();

    if (!application) {
      return NextResponse.json(
        { error: "No scholarship application found for this email address" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application._id.toString(),
        applicant_name: application.applicant_name,
        email: application.email,
        field_of_study: application.field_of_study || "",
        gpa: application.gpa || 0,
        status: application.status,
      },
    });

  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
