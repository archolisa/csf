import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, connectDB } from "@/lib/db";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/gif"];

const CURRENT_BATCH = "2026/2027";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    // --- Extract text fields ---
    const applicant_name = formData.get("applicant_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const date_of_birth = formData.get("date_of_birth") as string;
    const gender = formData.get("gender") as string;
    const is_indigene = formData.get("is_indigene") as string;
    const village = formData.get("village") as string;
    const home_address = formData.get("home_address") as string;
    const sponsor_name = formData.get("sponsor_name") as string;
    const sponsor_address = formData.get("sponsor_address") as string;
    const sponsor_phone = formData.get("sponsor_phone") as string;
    const institution = formData.get("institution") as string;
    const level = formData.get("level") as string;
    const course_of_study = formData.get("course_of_study") as string;
    const jamb_score_raw = formData.get("jamb_score") as string;
    const jamb_score = jamb_score_raw ? parseInt(jamb_score_raw, 10) : undefined;
    const personal_statement = formData.get("personal_statement") as string;
    const waec_grades_raw = formData.get("waec_grades") as string;

    // Parse WAEC grades JSON
    let waec_grades = null;
    if (waec_grades_raw) {
      try {
        waec_grades = JSON.parse(waec_grades_raw);
      } catch {
        // Ignore parsing errors, leave as null
      }
    }

    // Also support legacy fields to ensure compatibility
    const field_of_study = formData.get("field_of_study") as string || course_of_study;

    // --- Validation ---
    if (!applicant_name || !email) {
      return NextResponse.json(
        { error: "Full name and email address are required." },
        { status: 400 }
      );
    }

    // Check for duplicate email within the SAME batch
    const existing = await ScholarshipApplication.findOne({
      email: email.toLowerCase().trim(),
      batch: CURRENT_BATCH,
    });
    if (existing) {
      return NextResponse.json(
        { error: "An application with this email already exists for the 2026/2027 session. If you believe this is an error, please contact us." },
        { status: 400 }
      );
    }

    // --- Create application record ---
    const application = await ScholarshipApplication.create({
      applicant_name: applicant_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      date_of_birth,
      gender,
      is_indigene,
      village: village?.trim(),
      home_address: home_address?.trim(),
      sponsor_name: sponsor_name?.trim(),
      sponsor_address: sponsor_address?.trim(),
      sponsor_phone: sponsor_phone?.trim(),
      institution: institution?.trim(),
      level,
      course_of_study: course_of_study?.trim(),
      field_of_study: field_of_study?.trim(),
      jamb_score,
      personal_statement: personal_statement?.trim(),
      waec_grades,
      status: "pending",
      batch: CURRENT_BATCH,
    });

    const saveFile = async (fileKey: string, resultName: string, urlField: string) => {
      const file = formData.get(fileKey) as File | null;
      if (!file || file.size === 0) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type for ${resultName}. Allowed: PDF, Word documents, and images (JPG, PNG, GIF).`);
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${resultName} exceeds the 10MB file size limit.`);
      }

      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `applications/${CURRENT_BATCH.replace("/", "-")}/${timestamp}-${fileKey}-${originalName}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const blob = await put(fileName, buffer, {
        access: 'public',
        addRandomSuffix: true
      });

      const publicPath = blob.url;

      // Create Document record
      await Document.create({
        application_id: application._id,
        file_name: `${resultName} - ${file.name}`,
        file_type: file.type,
        file_path: publicPath,
        file_size: file.size,
        uploaded_by_student: true,
      });

      // Store URL directly on application record
      await ScholarshipApplication.findByIdAndUpdate(application._id, {
        [urlField]: publicPath,
      });
    };

    try {
      await saveFile("jamb_result", "JAMB Result", "jamb_result_url");
      await saveFile("waec_result", "WAEC Result", "waec_result_url");
      await saveFile("admission_letter", "Admission Letter", "admission_letter_url");
      await saveFile("passport_photo", "Passport Photograph", "passport_photo_url");
    } catch (uploadError) {
      // Clean up application if files failed
      await ScholarshipApplication.findByIdAndDelete(application._id);
      await Document.deleteMany({ application_id: application._id });
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload files";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your scholarship application has been submitted successfully!",
      applicationId: application._id.toString(),
    }, { status: 201 });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your application. Please try again." },
      { status: 500 }
    );
  }
}
