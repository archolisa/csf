import { NextResponse } from "next/server";
import { ScholarshipApplication, Document, Admin, connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const adminCount = await Admin.countDocuments();
    const appCount = await ScholarshipApplication.countDocuments();
    const docCount = await Document.countDocuments();

    // Get all documents with their details
    const allDocs = await Document.find().populate("application_id").lean();
    const allApps = await ScholarshipApplication.find().lean();
    const allAdmins = await Admin.find().select("email name role").lean();

    return NextResponse.json({
      counts: {
        admins: adminCount,
        applications: appCount,
        documents: docCount,
      },
      data: {
        admins: allAdmins,
        applications: allApps,
        documents: allDocs,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
