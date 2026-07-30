import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, Document, AuditLog, connectDB } from "@/lib/db";
import { calculateAge } from "@/lib/admin-utils";
import { Types } from "mongoose";

// A robust CSV parser that handles double quotes, escaped quotes, and newlines in cells
function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let currentVal = "";
  let insideQuote = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
      row.push(currentVal.trim());
      result.push(row);
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    result.push(row);
  }
  
  return result;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { sheetUrl, batch = "2026", adminId, adminName } = await req.json();

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "Google Sheet URL is required" },
        { status: 400 }
      );
    }

    // Convert Google Sheets URL to CSV export link
    const spreadsheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const gidMatch = sheetUrl.match(/[#&?]gid=([0-9]+)/);
    const id = spreadsheetIdMatch ? spreadsheetIdMatch[1] : "10SnAQu42_hZdA94coIIxU894u94eA8B9YFHjCznVAPk";
    const gid = gidMatch ? gidMatch[1] : "1435963208";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;

    // Fetch the CSV file
    const response = await fetch(csvUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to download Google Sheet. Status: ${response.status}` },
        { status: 400 }
      );
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: "No records found in spreadsheet" },
        { status: 400 }
      );
    }

    // The first row is headers. We map row indices to fields.
    // Skip row 0 (headers)
    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    const dataRows = rows.slice(1).filter((r) => r.length > 5 && r[1] && r[2]);
    const validEmails = new Set(dataRows.map(r => r[2].toLowerCase()));

    for (const r of dataRows) {
      const timestampStr = r[0];
      const name = r[1];
      const email = r[2].toLowerCase();
      const phone = r[3] || "";
      const dob = r[4] || "";
      const isIndigene = r[5] || "";
      const village = r[6] || "";
      const homeAddress = r[7] || "";
      const sponsorName = r[8] || "";
      const sponsorPhone = r[10] || "";
      const institution = r[11] || "";
      const level = r[12] || "";
      const fieldOfStudy = r[13] || "";
      // WAEC grades are Col 14 to 28
      const jambScoreStr = r[29] || "";
      const jambScore = parseInt(jambScoreStr, 10) || 0;
      const jambResultUrl = r[30] || "";
      const waecResultUrl = r[31] || "";
      const admissionLetterUrl = r[32] || "";
      const passportPhotoUrl = r[33] || "";
      const personalStatement = r[34] || "";

      // Calculate age
      const age = calculateAge(dob);

      // Parse submitted date from Timestamp (Format: DD/MM/YYYY HH:MM:SS or MM/DD/YYYY HH:MM:SS)
      let submittedAt = new Date();
      if (timestampStr) {
        // Simple check to parse standard timestamp formats
        const [datePart] = timestampStr.split(" ");
        const parts = datePart.split(/[-/]/);
        if (parts.length === 3) {
          const first = parseInt(parts[0], 10);
          const second = parseInt(parts[1], 10);
          const third = parseInt(parts[2], 10);
          // If third part is 4 digits, it is the year
          if (third > 1000) {
            // Assume format is DD/MM/YYYY or MM/DD/YYYY. Let's default to DD/MM/YYYY as commonly used in Nigeria/UK
            submittedAt = new Date(third, second - 1, first);
          } else if (first > 1000) {
            submittedAt = new Date(first, second - 1, third);
          }
        }
      }

      // Check if application exists for this email and batch
      let app = await ScholarshipApplication.findOne({ email, batch });

      const appData = {
        applicant_name: name,
        email,
        phone,
        date_of_birth: dob,
        age,
        is_indigene: isIndigene,
        village,
        home_address: homeAddress,
        sponsor_name: sponsorName,
        sponsor_phone: sponsorPhone,
        institution,
        level,
        field_of_study: fieldOfStudy,
        gpa: 0, // default
        jamb_score: jambScore,
        jamb_result_url: jambResultUrl,
        waec_result_url: waecResultUrl,
        admission_letter_url: admissionLetterUrl,
        passport_photo_url: passportPhotoUrl,
        personal_statement: personalStatement,
        updated_at: new Date(),
      };

      if (app) {
        await ScholarshipApplication.findByIdAndUpdate(app._id, appData);
        updatedCount++;
      } else {
        app = await ScholarshipApplication.create({
          ...appData,
          status: "pending",
          submitted_at: submittedAt,
          notes: [],
          batch,
        });
        createdCount++;
      }

      // Sync Documents to Document Collection
      const documentsToSync = [
        { name: "JAMB Result", url: jambResultUrl, type: "application/pdf" },
        { name: "WAEC Result", url: waecResultUrl, type: "application/pdf" },
        { name: "Admission Letter", url: admissionLetterUrl, type: "application/pdf" },
        { name: "Passport Photograph", url: passportPhotoUrl, type: "image/jpeg" },
      ];

      for (const doc of documentsToSync) {
        if (doc.url) {
          // Check if document already exists
          const existingDoc = await Document.findOne({
            application_id: app._id,
            file_name: doc.name,
          });

          const docData = {
            application_id: app._id,
            file_name: doc.name,
            file_type: doc.type,
            file_path: doc.url,
            file_size: 0,
            uploaded_by_student: true,
            category: "applicant_review_files",
            description: `Imported from Google Sheet row (${doc.name})`,
            uploaded_at: new Date(),
          };

          if (existingDoc) {
            await Document.findByIdAndUpdate(existingDoc._id, docData);
          } else {
            await Document.create(docData);
          }
        }
      }
    }

    // Handle deleted/orphaned records
    const validEmailsArray = Array.from(validEmails);
    const orphanedApps = await ScholarshipApplication.find({
      batch,
      email: { $nin: validEmailsArray }
    });

    if (orphanedApps.length > 0) {
      const orphanedAppIds = orphanedApps.map(app => app._id);
      await Document.deleteMany({ application_id: { $in: orphanedAppIds } });
      const deleteResult = await ScholarshipApplication.deleteMany({ _id: { $in: orphanedAppIds } });
      deletedCount = deleteResult.deletedCount || 0;
    }

    // Log this action in AuditLog
    if (adminId && adminName) {
      await AuditLog.create({
        admin_id: new Types.ObjectId(adminId),
        admin_name: adminName,
        action: "sync_applicants",
        entity_type: "scholarship_applications",
        details: `Synchronized ${dataRows.length} applications for batch ${batch} (Created: ${createdCount}, Updated: ${updatedCount}, Deleted: ${deletedCount})`,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      total_processed: dataRows.length,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedCount,
      batch,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to synchronize applicant records from sheet", details: String(error) },
      { status: 500 }
    );
  }
}
