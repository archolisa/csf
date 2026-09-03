import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    // Build query filter — scope by batch when provided
    const query: Record<string, unknown> = {};
    if (batch && batch !== "all") {
      query.batch = batch;
    }

    // Get stats from database, filtered by batch
    const totalApplicants = await ScholarshipApplication.countDocuments(query);
    const pendingApplications = await ScholarshipApplication.countDocuments({ ...query, status: "pending" });
    const underReview = await ScholarshipApplication.countDocuments({ ...query, status: "under_review" });
    const awarded = await ScholarshipApplication.countDocuments({ ...query, status: "awarded" });
    const rejected = await ScholarshipApplication.countDocuments({ ...query, status: "rejected" });
    const totalDocuments = await Document.countDocuments({ uploaded_by_student: { $ne: true } });

    // Count applications from this month (also filtered by batch)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthApplications = await ScholarshipApplication.countDocuments({
      ...query,
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
