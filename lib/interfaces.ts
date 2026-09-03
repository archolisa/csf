export interface Event {
    name: string; // Event title
    description: string; // Event details
    date: string; // Event start date
    endDate: string; // Event end date
    location: string; // Event location
    place: string; // Event place
    timezone: string; // Event timezone
    link: string | null; // Event link
}

interface SocialLinks {
    linkedin?: string;
    portfolio?: string;
    instagram?: string;
    twitter?: string;
    github?: string;
}

export type TeamCategory = "Leadership Team" | "Operations Team" | "Technical Team";

export interface BoardMember {
    name: string;
    position: string;
    more_info: string;
    picture: string;
    year: string;
    major: string;
    minor?: string;
    socials: SocialLinks;
    category: TeamCategory;
}

// Admin Dashboard Interfaces
export interface Admin {
    id: number;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ScholarshipApplication {
    id: string;
    applicant_name: string;
    email: string;
    phone?: string;
    field_of_study?: string;
    gpa?: number;
    status: "pending" | "under_review" | "awarded" | "rejected";
    submitted_at: string;
    updated_at: string;
    // New fields from Google Sheet
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

export interface Document {
    id: string;
    application_id?: string | null;
    admin_id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
}

export interface AdminSession {
    adminId: string | number;
    email: string;
    name: string;
    role?: string;
}
  