// Admin utility functions and helpers

export type AdminRole = "super_admin" | "reviewer" | "document_manager";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_login: string;
  is_active: boolean;
}

export interface ApplicantWithStatus {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  application_year: string;
  status: "pending" | "under_review" | "awarded" | "rejected";
  documents_count: number;
  submitted_at: string;
  updated_at: string;
  notes_count: number;
  has_all_documents: boolean;
  
  // Optional columns from Google Sheets
  date_of_birth?: string;
  age?: number;
  village?: string;
  jamb_score?: number;
  is_indigene?: string;
  home_address?: string;
  sponsor_name?: string;
  sponsor_phone?: string;
  institution?: string;
  level?: string;
  personal_statement?: string;
  jamb_result_url?: string;
  waec_result_url?: string;
  admission_letter_url?: string;
  passport_photo_url?: string;
  batch?: string;
  // 2026/2027 cycle fields
  gender?: string;
  sponsor_address?: string;
  residential_address?: string;
  course_of_study?: string;
  waec_grades?: Record<string, string>;
}

export interface AdminFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: FileCategory;
  uploaded_by: string;
  uploaded_at: string;
  description: string;
  tags: string[];
  folder_path: string;
  file_path: string;
  is_public: boolean;
}

export type FileCategory = 
  | "meeting_notes"
  | "scholarship_guidelines"
  | "applicant_review_files"
  | "financial_documents"
  | "reports"
  | "templates"
  | "media"
  | "admin_files";

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

// Status badge styling
export const statusStyles = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
  },
  under_review: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    dot: "bg-blue-500",
  },
  awarded: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    dot: "bg-green-500",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    dot: "bg-red-500",
  },
};

export const roleLabelMap: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  reviewer: "Reviewer",
  document_manager: "Document Manager",
};

// File type detection
export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("docx")) return "📝";
  if (type.includes("sheet") || type.includes("xlsx")) return "📊";
  if (type.includes("image") || ["jpg", "jpeg", "png", "gif"].some(ext => type.includes(ext))) return "🖼️";
  if (type.includes("zip") || type.includes("rar")) return "📦";
  if (type.includes("video")) return "🎬";
  if (type.includes("audio")) return "🎵";
  return "📁";
};

export const getFileCategoryLabel = (category: FileCategory): string => {
  const labels: Record<FileCategory, string> = {
    meeting_notes: "Meeting Notes",
    scholarship_guidelines: "Scholarship Guidelines",
    applicant_review_files: "Applicant Review Files",
    financial_documents: "Financial Documents",
    reports: "Reports",
    templates: "Templates",
    media: "Media/Images",
    admin_files: "Admin Files",
  };
  return labels[category] || category;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Role-based access control
export const canPerformAction = (role: AdminRole, action: string): boolean => {
  const permissions: Record<AdminRole, string[]> = {
    super_admin: ["view", "edit", "delete", "manage_users", "manage_settings"],
    reviewer: ["view", "edit", "add_notes"],
    document_manager: ["view", "upload", "delete", "manage_documents"],
  };
  
  return permissions[role]?.includes(action) || false;
};

// Google Drive link helpers
export function extractGoogleDriveId(url: string | undefined | null): string | null {
  if (!url) return null;
  const openMatch = url.match(/id=([a-zA-Z0-9_-]{25,})/);
  if (openMatch) return openMatch[1];
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (fileMatch) return fileMatch[1];
  return null;
}

export function getGoogleDriveThumbnail(url: string | undefined | null): string {
  if (!url) return "";
  const driveId = extractGoogleDriveId(url);
  if (driveId) {
    // The thumbnail endpoint forces Google to generate a web-safe image (even for PDFs)
    // and correctly bypasses the strict file download sandboxing headers.
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
  }
  return url;
}

// Calculate age from date of birth (DD-MM-YYYY or DD/MM/YYYY)
export function calculateAge(dobString: string | undefined | null): number {
  if (!dobString) return 0;
  
  // Try matching DD-MM-YYYY or DD/MM/YYYY
  const parts = dobString.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const birthDate = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  }

  // Fallback to standard parsing
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
