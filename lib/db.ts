import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Ensure MONGODB_URI is set
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Singleton connection cache
let cachedConnection: typeof mongoose | null = null;

// Connect to MongoDB using singleton pattern
export async function connectDB() {
  // If already connected and in connected state, return cached connection
  if (
    cachedConnection &&
    mongoose.connection.readyState === 1
  ) {
    return cachedConnection;
  }

  // If disconnected but cached, try to reconnect
  if (
    cachedConnection &&
    mongoose.connection.readyState === 0
  ) {
    try {
      await mongoose.connection.openUri(MONGODB_URI!);
      console.log("Reconnected to MongoDB");
      return cachedConnection;
    } catch (error) {
      console.error("Failed to reconnect to MongoDB:", error);
      cachedConnection = null;
    }
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log("Connected to MongoDB");
    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    cachedConnection = null;
    throw error;
  }
}

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "reviewer", enum: ["super_admin", "reviewer", "document_manager"] },
  is_active: { type: Boolean, default: true },
  last_login: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Scholarship Applications Schema
const scholarshipApplicationSchema = new mongoose.Schema({
  applicant_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  field_of_study: String,
  gpa: Number,
  status: { type: String, default: "pending" },
  submitted_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  notes: [
    {
      author: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  // Extended fields from Google Sheet
  date_of_birth: String,
  age: Number,
  village: String,
  jamb_score: Number,
  is_indigene: String,
  home_address: String,
  sponsor_name: String,
  sponsor_phone: String,
  institution: String,
  level: String,
  personal_statement: String,
  jamb_result_url: String,
  waec_result_url: String,
  admission_letter_url: String,
  passport_photo_url: String,
  batch: { type: String, default: "2025" }
});

// Documents Schema
const documentSchema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: "ScholarshipApplication" },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  file_name: { type: String, required: true },
  file_type: String,
  file_path: String,
  file_size: Number,
  uploaded_at: { type: Date, default: Date.now },
  uploaded_by_student: { type: Boolean, default: false },
  category: { type: String, default: "admin_files" },
  description: { type: String, default: "" },
  tags: { type: [String], default: [] },
  is_public: { type: Boolean, default: false },
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  admin_name: { type: String, required: true },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
  ip_address: String,
});

// Create models
export const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export const ScholarshipApplication =
  mongoose.models.ScholarshipApplication ||
  mongoose.model("ScholarshipApplication", scholarshipApplicationSchema);
export const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

// Default admin users
const DEFAULT_ADMINS = [
  { email: "admin@cyrilandsusannafoundation.org", password: "password123", name: "Admin User", role: "super_admin" },
  { email: "director@cyrilandsusannafoundation.org", password: "director2024", name: "Director", role: "super_admin" },
  { email: "coordinator@cyrilandsusannafoundation.org", password: "coordinator2024", name: "Program Coordinator", role: "reviewer" },
  { email: "reviewer@cyrilandsusannafoundation.org", password: "reviewer2024", name: "Application Reviewer", role: "reviewer" },
  { email: "manager@cyrilandsusannafoundation.org", password: "manager2024", name: "Operations Manager", role: "document_manager" },
];

// Initialize database with default admins
export async function initializeDatabase() {
  try {
    await connectDB();

    // Seed default admin users if they don't exist
    for (const admin of DEFAULT_ADMINS) {
      try {
        const existingAdmin = await Admin.findOne({ email: admin.email });
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          await Admin.create({
            email: admin.email,
            password_hash: hashedPassword,
            name: admin.name,
            role: admin.role,
            is_active: true,
          });
        }
      } catch (err) {
        console.error(`Error seeding admin ${admin.email}:`, err);
      }
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// Call initialization when module loads
if (typeof window === "undefined") {
  initializeDatabase().catch(console.error);
}
