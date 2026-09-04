"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScholarshipApplication } from "@/lib/interfaces";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Footer } from "@/components/ui/footer";
import { Upload, FileCheck, ArrowLeft, Search, Loader2 } from "lucide-react";

export default function UploadResultsPage() {
  
  // Verification states
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedApp, setVerifiedApp] = useState<ScholarshipApplication | null>(null);
  
  // Upload states
  const [session, setSession] = useState("Year 1 - First Semester");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSuccess("");
    setIsVerifying(true);
    setVerifiedApp(null);

    try {
      const response = await fetch(`/api/student/verify-email?email=${encodeURIComponent(email.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      const app = data.application;
      if (app.status !== "awarded") {
        setError(`Application status is currently '${app.status}'. Only successful (awarded) candidates are eligible to upload semester results.`);
        return;
      }

      setVerifiedApp(app);
    } catch (err) {
      console.error(err);
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedApp || !file) {
      setError("Please select a file to upload.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", verifiedApp.id);
      formData.append("session", session);

      const response = await fetch("/api/student/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setSuccess(`Your semester result for "${session}" was uploaded successfully!`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const semesters = [
    "Year 1 - First Semester",
    "Year 1 - Second Semester",
    "Year 2 - First Semester",
    "Year 2 - Second Semester",
    "Year 3 - First Semester",
    "Year 3 - Second Semester",
    "Year 4 - First Semester",
    "Year 4 - Second Semester",
    "Year 5 - First Semester",
    "Year 5 - Second Semester",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <NavigationBar />
      
      {/* Background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
      <div className="absolute top-[600px] right-[-150px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-10 -z-10"></div>

      <main className="flex-1 mt-28 px-4 py-8 max-w-2xl mx-auto w-full font-raleway">
        <Link
          href="/scholarships"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </Link>

        <Card className="p-8 shadow-xl border border-slate-200 bg-white rounded-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-michroma text-slate-900 tracking-tight">
              Upload Semester Results
            </h1>
            <p className="text-slate-600 mt-2">
              For successful candidates to upload their session results.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              {success}
            </div>
          )}

          {!verifiedApp ? (
            /* Phase 1: Search & Verify Email */
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Enter Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. johndoe@gmail.com"
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying || !email}
                    className="absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  We will check if you have an awarded scholarship application.
                </p>
              </div>
            </form>
          ) : (
            /* Phase 2: Upload Files for Verified Student */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Applicant Verified</p>
                <p className="mt-1">Name: <span className="font-medium text-slate-900">{verifiedApp.applicant_name}</span></p>
                <p>Email: <span className="font-medium text-slate-900">{verifiedApp.email}</span></p>
                <p>Course/Field: <span className="font-medium text-slate-900">{verifiedApp.field_of_study || "N/A"}</span></p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Academic Session / Semester
                  </label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 text-slate-800 transition"
                  >
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Semester Result File (PDF, Image, Word - Max 10MB)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center transition hover:border-red-500">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <FileCheck className="w-6 h-6" />
                        <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
                        <Upload className="w-10 h-10 text-slate-400 mb-1" />
                        <span>Click or drag your result file here</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setVerifiedApp(null);
                      setFile(null);
                      setError("");
                      setSuccess("");
                    }}
                    className="flex-1 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition"
                  >
                    Change Email
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !file}
                    className="flex-1 py-3.5 rounded-xl font-michroma text-white bg-red-600 hover:bg-red-700 font-bold tracking-wider transition shadow-lg flex justify-center items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>UPLOADING...</span>
                      </>
                    ) : (
                      "UPLOAD RESULT"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
