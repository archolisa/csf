import { NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentApplications = await ScholarshipApplication.find({
      submitted_at: { $gte: sevenDaysAgo }
    })
      .sort({ submitted_at: -1 })
      .limit(5);

    // Get recent documents (last 7 days)
    const recentDocuments = await Document.find({
      uploaded_at: { $gte: sevenDaysAgo }
    })
      .sort({ uploaded_at: -1 })
      .limit(5);

    // Combine and format activities
    const activities = [
      ...recentApplications.map((app) => ({
        id: app._id?.toString(),
        type: "application",
        description: `New application submitted by ${app.applicant_name}`,
        timestamp: app.submitted_at.toISOString(),
        applicant_name: app.applicant_name,
      })),
      ...recentDocuments.map((doc) => ({
        id: doc._id?.toString(),
        type: "document",
        description: `Document uploaded: ${doc.file_name}`,
        timestamp: doc.uploaded_at.toISOString(),
        applicant_name: "Admin",
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
