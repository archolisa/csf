"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Footer } from "@/components/ui/footer";
import {
  Upload,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  User,
  GraduationCap,
  FileText,
  ClipboardCheck,
  X,
  ChevronDown,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────

const VILLAGES = ["Umueze", "Ozalla", "Isiaku", "Ezioka", "Okpoko", "Akulu"];

const LEVELS = ["Undergraduate", "Post-Graduate", "Other"];

const WAEC_SUBJECTS = [
  "English Language", "Mathematics", "Physics", "Chemistry", "Biology",
  "Economics", "Agricultural Science", "Geography", "Government",
  "Literature in English", "Further Mathematics", "Civic Education",
  "Computer Studies", "Commerce", "Financial Accounting",
];

const WAEC_GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9", "—"];

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Academics", icon: GraduationCap },
  { label: "Documents", icon: FileText },
  { label: "Review", icon: ClipboardCheck },
];

// ─── Types ───────────────────────────────────────────────────────────────

interface FormData {
  applicant_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  is_indigene: string;
  village: string;
  home_address: string;
  sponsor_name: string;
  sponsor_address: string;
  sponsor_phone: string;
  institution: string;
  level: string;
  course_of_study: string;
  jamb_score: string;
  waec_grades: Record<string, string>;
  personal_statement: string;
}

interface FileState {
  jamb_result: File | null;
  waec_result: File | null;
  admission_letter: File | null;
  passport_photo: File | null;
}

// ─── Component ───────────────────────────────────────────────────────────

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    applicant_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    is_indigene: "",
    village: "",
    home_address: "",
    sponsor_name: "",
    sponsor_address: "",
    sponsor_phone: "",
    institution: "",
    level: "",
    course_of_study: "",
    jamb_score: "",
    waec_grades: {},
    personal_statement: "",
  });

  const [files, setFiles] = useState<FileState>({
    jamb_result: null,
    waec_result: null,
    admission_letter: null,
    passport_photo: null,
  });

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWaecGrade = (subject: string, grade: string) => {
    setFormData((prev) => ({
      ...prev,
      waec_grades: { ...prev.waec_grades, [subject]: grade },
    }));
  };

  const handleFileChange = (key: keyof FileState, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Validation ─────────────────────────────────────────────────

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!formData.applicant_name.trim() || formData.applicant_name.trim().length < 3) return "Please enter a valid full name.";
      if (!formData.email.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Please enter a valid email address.";
      if (!formData.phone.trim()) return "Phone number is required.";
      if (!/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone.trim())) return "Please enter a valid phone number.";
      if (!formData.date_of_birth) return "Date of birth is required.";
      if (new Date(formData.date_of_birth) > new Date()) return "Date of birth cannot be in the future.";
      if (!formData.gender) return "Please select your gender.";
      if (!formData.is_indigene) return "Please indicate if you are an indigene.";
      if (formData.is_indigene === "Yes" && !formData.village) return "Please select your village.";
      if (!formData.home_address.trim()) return "Home address is required.";
      if (!formData.sponsor_name.trim()) return "Sponsor's name is required.";
      if (!formData.sponsor_address.trim()) return "Sponsor's address is required.";
      if (!formData.sponsor_phone.trim()) return "Sponsor's phone is required.";
    }
    if (s === 1) {
      if (!formData.institution.trim()) return "Institution is required.";
      if (!formData.level) return "Please select your level of study.";
      if (!formData.course_of_study.trim()) return "Course of study is required.";
      if (!formData.jamb_score.trim()) return "JAMB score is required.";
      const jambNum = parseInt(formData.jamb_score, 10);
      if (isNaN(jambNum) || jambNum < 0 || jambNum > 400) return "JAMB score must be between 0 and 400.";

      const hasWaecGrades = Object.values(formData.waec_grades).some(grade => grade !== "—" && grade !== "");
      if (!hasWaecGrades) return "O'Level (WAEC) result grades are required. Please select at least one grade.";
    }
    if (s === 2) {
      if (!files.jamb_result) return "JAMB result document is required.";
      if (!files.waec_result) return "WAEC result document is required.";
      if (!files.admission_letter) return "Admission letter is required.";
      if (!files.passport_photo) return "Passport photograph is required.";
      if (!formData.personal_statement.trim()) return "Personal statement is required.";
      if (formData.personal_statement.trim().split(/\s+/).length > 250) return "Personal statement should be under 200 words.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      scrollToTop();
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
    scrollToTop();
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
    scrollToTop();
  };

  // ─── Submit ───────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = new FormData();
      // Text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "waec_grades") {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });
      // Files
      if (files.jamb_result) data.append("jamb_result", files.jamb_result);
      if (files.waec_result) data.append("waec_result", files.waec_result);
      if (files.admission_letter) data.append("admission_letter", files.admission_letter);
      if (files.passport_photo) data.append("passport_photo", files.passport_photo);

      const response = await fetch("/api/applications/apply", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to submit application.");
        scrollToTop();
        return;
      }

      setSuccess(
        "Your application for the 2026/2027 Cyril & Susanna Foundation Scholarship has been submitted successfully! We will review your materials and get back to you."
      );
      scrollToTop();

      setTimeout(() => {
        router.push("/scholarships");
      }, 5000);
    } catch (err) {
      console.error("Submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Shared Input Classes ─────────────────────────────────────────

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50/50 transition text-slate-800 placeholder:text-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";
  const selectClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition text-slate-800 appearance-none";

  // ─── File Upload Component ────────────────────────────────────────

  const FileUpload = ({
    label,
    fileKey,
    accept = ".pdf,.jpg,.jpeg,.png",
    hint,
  }: {
    label: string;
    fileKey: keyof FileState;
    accept?: string;
    hint?: string;
  }) => {
    const file = files[fileKey];
    return (
      <div>
        <label className={labelClass}>
          {label} <span className="text-red-500">*</span>
        </label>
        {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/50 flex flex-col items-center justify-center transition hover:border-red-400 hover:bg-red-50/30 min-h-[80px]">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(fileKey, e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {file ? (
            <div className="flex items-center gap-3 text-emerald-700 font-medium w-full">
              <FileCheck className="w-5 h-5 shrink-0" />
              <span className="truncate text-sm flex-1">{file.name}</span>
              <span className="text-xs text-slate-500 shrink-0">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileChange(fileKey, null);
                }}
                className="p-1 rounded-full hover:bg-red-100 text-red-500 z-20 relative"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
              <Upload className="w-7 h-7 text-slate-400" />
              <span>Click to upload or drag file here</span>
              <span className="text-xs text-slate-400">PDF, JPG, JPEG, PNG • Max 10MB</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Step Renderers ───────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Full Name (Surname, First name.. others) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="applicant_name"
            value={formData.applicant_name}
            onChange={handleChange}
            placeholder="e.g. Nwankwo Akaolisa"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. student@email.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +234 801 234 5678"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Date of Birth (DD-MM-YYYY) <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {["Male", "Female"].map((g) => (
            <label
              key={g}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition ${formData.gender === g
                  ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
            >
              <input
                type="radio"
                name="gender"
                value={g}
                checked={formData.gender === g}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.gender === g ? "border-red-500" : "border-slate-400"
                  }`}
              >
                {formData.gender === g && (
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className="text-sm">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Are you an indigene of Isuofia, Aguata L.G.A ? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {["Yes", "No"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition ${formData.is_indigene === opt
                  ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
            >
              <input
                type="radio"
                name="is_indigene"
                value={opt}
                checked={formData.is_indigene === opt}
                onChange={handleChange}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.is_indigene === opt ? "border-red-500" : "border-slate-400"
                  }`}
              >
                {formData.is_indigene === opt && (
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {formData.is_indigene === "Yes" && (
        <div className="relative">
          <label className={labelClass}>
            What village in Isuofia are you from? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="village"
              value={formData.village}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">— Select Village —</option>
              {VILLAGES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>
          Home Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="home_address"
          value={formData.home_address}
          onChange={handleChange}
          rows={2}
          className={inputClass + " resize-none"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200">
        <div className="md:col-span-2">
          <label className={labelClass}>
            Parent/Sponsor&apos;s Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sponsor_name"
            value={formData.sponsor_name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>
            Parent/Sponsor&apos;s Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="sponsor_address"
            value={formData.sponsor_address}
            onChange={handleChange}
            rows={2}
            className={inputClass + " resize-none"}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>
            Parent/Sponsor&apos;s Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="sponsor_phone"
            value={formData.sponsor_phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          Name of your University/ Institution ? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="relative">
        <label className={labelClass}>
          Which level of study are you? <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">— Select Level —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Course of Study <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="course_of_study"
          value={formData.course_of_study}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Enter your Jamb Score <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="jamb_score"
          value={formData.jamb_score}
          onChange={handleChange}
          min={0}
          max={400}
          className={inputClass}
        />
      </div>

      <div className="mt-6">
        <label className={labelClass}>
          Enter your O&apos;Level (WAEC) Result Grades <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          (Select grades for each subject, select &ldquo;—&rdquo; if subject wasn&apos;t offered.)
        </p>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2.5 grid grid-cols-[1fr_120px] gap-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Subject</span>
            <span className="text-center">Grade</span>
          </div>
          <div className="divide-y divide-slate-100">
            {WAEC_SUBJECTS.map((subject) => (
              <div
                key={subject}
                className="px-4 py-2.5 grid grid-cols-[1fr_120px] gap-4 items-center hover:bg-slate-50/50 transition"
              >
                <span className="text-sm text-slate-700">{subject}</span>
                <div className="relative">
                  <select
                    value={formData.waec_grades[subject] || "—"}
                    onChange={(e) => handleWaecGrade(subject, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none text-center"
                  >
                    {WAEC_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload
          label="Upload your JAMB result"
          fileKey="jamb_result"
          hint="(PDF, JPG, jpeg formats only)"
        />
        <FileUpload
          label="Upload your WAEC result"
          fileKey="waec_result"
          hint="(PDF, JPG, jpeg formats only)"
        />
        <FileUpload
          label="Upload your Admission Letter"
          fileKey="admission_letter"
        />
        <FileUpload
          label="Upload your Passport photograph"
          fileKey="passport_photo"
          accept=".jpg,.jpeg,.png"
          hint="(white or red background)"
        />
      </div>

      <div className="mt-2">
        <label className={labelClass}>
          Personal Statement <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          (Why should you be awarded this scholarship?)<br />
          ..in less than 200 words
        </p>
        <textarea
          name="personal_statement"
          value={formData.personal_statement}
          onChange={handleChange}
          rows={6}
          className={inputClass + " resize-none"}
        />
        <p className="text-xs text-slate-400 mt-1.5 text-right">
          {formData.personal_statement.trim().split(/\s+/).filter(Boolean).length} / 200 words
        </p>
      </div>
    </div>
  );

  const ReviewField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider sm:w-44 shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">
          Personal Information
        </h3>
        <div className="divide-y divide-slate-100">
          <ReviewField label="Full Name" value={formData.applicant_name} />
          <ReviewField label="Email" value={formData.email} />
          <ReviewField label="Phone" value={formData.phone} />
          <ReviewField label="Date of Birth" value={formData.date_of_birth} />
          <ReviewField label="Gender" value={formData.gender} />
          <ReviewField label="Indigene" value={formData.is_indigene} />
          {formData.is_indigene === "Yes" && (
            <ReviewField label="Village" value={formData.village} />
          )}
          <ReviewField label="Home Address" value={formData.home_address} />
          <ReviewField label="Sponsor Name" value={formData.sponsor_name} />
          <ReviewField label="Sponsor Address" value={formData.sponsor_address} />
          <ReviewField label="Sponsor Phone" value={formData.sponsor_phone} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">
          Academic Details
        </h3>
        <div className="divide-y divide-slate-100">
          <ReviewField label="Institution" value={formData.institution} />
          <ReviewField label="Level" value={formData.level} />
          <ReviewField label="Course of Study" value={formData.course_of_study} />
          <ReviewField label="JAMB Score" value={formData.jamb_score} />
        </div>
        {Object.keys(formData.waec_grades).filter(k => formData.waec_grades[k] !== "—").length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              WAEC Grades
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formData.waec_grades)
                .filter(([, grade]) => grade !== "—")
                .map(([subject, grade]) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700"
                  >
                    {subject}: <span className="font-bold text-slate-900">{grade}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">
          Uploaded Documents
        </h3>
        <div className="divide-y divide-slate-100">
          {(Object.entries(files) as [keyof FileState, File | null][]).map(([key, file]) => (
            <div key={key} className="flex items-center gap-3 py-2.5">
              {file ? (
                <>
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-slate-800 font-medium truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-slate-500">
                    {key.replace(/_/g, " ")} — not uploaded
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">
          Personal Statement
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {formData.personal_statement || "—"}
        </p>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <NavigationBar />
        <main className="flex-1 mt-28 px-4 py-8 max-w-3xl mx-auto w-full flex items-center justify-center">
          <Card className="p-10 md:p-14 shadow-xl border border-emerald-200 bg-white rounded-3xl text-center max-w-lg">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Application Submitted!
            </h1>
            <p className="text-slate-600 leading-relaxed">{success}</p>
            <p className="text-sm text-slate-400 mt-6">
              Redirecting to scholarships page...
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <NavigationBar />

      {/* Background decorations */}
      <div className="fixed top-[-100px] left-[-100px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-[0.07] -z-10" />
      <div className="fixed bottom-[-100px] right-[-150px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-[0.07] -z-10" />

      <main ref={formRef} className="flex-1 mt-28 px-4 py-8 max-w-3xl mx-auto w-full font-raleway">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </button>

        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            2026/2027 Scholarship Application
          </h1>
          <p className="text-slate-500 mt-2">
            Please provide your details below to apply for the Cyril & Susanna Foundation Scholarship.
          </p>
        </div>

        {/* ─── Progress Bar ─────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (i < step) {
                      setStep(i);
                      scrollToTop();
                    }
                  }}
                  className={`flex items-center gap-2 text-sm font-semibold transition ${isActive
                      ? "text-red-600"
                      : isCompleted
                        ? "text-emerald-600 cursor-pointer hover:text-emerald-700"
                        : "text-slate-400 cursor-default"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${isActive
                        ? "bg-red-600 text-white"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ─── Form Card ─────────────────────────────────────── */}
        <Card className="p-6 md:p-10 shadow-xl border border-slate-200 bg-white rounded-3xl">
          <div className="mb-6">
            <p className="text-xs font-bold text-red-600 uppercase tracking-[0.2em]">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
              {STEPS[step].label}
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Step content */}
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* ─── Navigation Buttons ─────────────────────────── */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <Button
                type="button"
                onClick={goBack}
                variant="outline"
                className="px-6 py-3 rounded-xl font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Session tag */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Cyril &amp; Susanna Foundation — 2026/2027 Scholarship Application
        </p>
      </main>

      <Footer />
    </div>
  );
}
