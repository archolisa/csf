import { NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    // Get stats from database
    const totalApplicants = await ScholarshipApplication.countDocuments();
    const pendingApplications = await ScholarshipApplication.countDocuments({ status: "pending" });
    const underReview = await ScholarshipApplication.countDocuments({ status: "under_review" });
    const awarded = await ScholarshipApplication.countDocuments({ status: "awarded" });
    const rejected = await ScholarshipApplication.countDocuments({ status: "rejected" });
    const totalDocuments = await Document.countDocuments({ uploaded_by_student: { $ne: true } });

    // Count applications from this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthApplications = await ScholarshipApplication.countDocuments({
      submitted_at: { $gte: monthStart }
    });

    const stats = {
      total_applicants: totalApplicants,
      pending_applications: pendingApplications,
      under_review: underReview,
      awarded: awarded,
      rejected: rejected,
      total_documents: totalDocuments,
      this_month_applications: thisMonthApplications,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
