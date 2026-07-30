"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { Footer } from "@/components/ui/footer";
import { Upload, FileCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    applicant_name: "",
    email: "",
    phone: "",
    field_of_study: "",
    gpa: "",
  });
  
  const [jambFile, setJambFile] = useState<File | null>(null);
  const [waecFile, setWaecFile] = useState<File | null>(null);
  const [admissionFile, setAdmissionFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "jamb" | "waec" | "admission") => {
    const file = e.target.files?.[0] || null;
    if (fileType === "jamb") setJambFile(file);
    if (fileType === "waec") setWaecFile(file);
    if (fileType === "admission") setAdmissionFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.applicant_name || !formData.email) {
      setError("Name and Email are required fields.");
      return;
    }

    if (!jambFile || !waecFile || !admissionFile) {
      setError("Please upload all three required documents (JAMB Result, WAEC Result, and Admission Letter).");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("applicant_name", formData.applicant_name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("field_of_study", formData.field_of_study);
      data.append("gpa", formData.gpa);
      data.append("jamb_result", jambFile);
      data.append("waec_result", waecFile);
      data.append("admission_letter", admissionFile);

      const response = await fetch("/api/applications/apply", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to submit application");
        return;
      }

      setSuccess("Your scholarship application was submitted successfully! We will review your materials and contact you.");
      setFormData({
        applicant_name: "",
        email: "",
        phone: "",
        field_of_study: "",
        gpa: "",
      });
      setJambFile(null);
      setWaecFile(null);
      setAdmissionFile(null);
      
      // Redirect to scholarships info page after 4 seconds
      setTimeout(() => {
        router.push("/scholarships");
      }, 4000);

    } catch (err) {
      console.error("Submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <NavigationBar />
      
      {/* Background decoration */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-10 -z-10"></div>
      <div className="absolute top-[600px] right-[-150px] w-80 h-80 bg-red-600 rounded-full blur-[120px] opacity-10 -z-10"></div>

      <main className="flex-1 mt-28 px-4 py-8 max-w-3xl mx-auto w-full font-raleway">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </button>

        <Card className="p-8 md:p-12 shadow-xl border border-slate-200 bg-white rounded-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-michroma text-slate-900 tracking-tight">
              Apply for Scholarship
            </h1>
            <p className="text-slate-600 mt-2">
              Fill out the form below and upload your academic credentials to submit your application.
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. johndoe@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Cumulative GPA (if applicable)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="e.g. 4.50"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 transition text-slate-800"
                />
              </div>
            </div>

            <hr className="border-slate-200 my-6" />

            {/* Document Uploads */}
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-slate-900 font-michroma tracking-tight">
                Required Credentials (PDF, Word, or Image - Max 10MB each)
              </h2>

              {/* JAMB Result */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  JAMB Result *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center transition hover:border-red-500">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, "jamb")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {jambFile ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <FileCheck className="w-6 h-6" />
                      <span>{jambFile.name} ({(jambFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span>Click or drag your JAMB Result file here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WAEC Result */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  WAEC Result *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center transition hover:border-red-500">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, "waec")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {waecFile ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <FileCheck className="w-6 h-6" />
                      <span>{waecFile.name} ({(waecFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span>Click or drag your WAEC Result file here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admission Letter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  University Admission Letter *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center transition hover:border-red-500">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, "admission")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {admissionFile ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <FileCheck className="w-6 h-6" />
                      <span>{admissionFile.name} ({(admissionFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span>Click or drag your Admission Letter file here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-4 rounded-xl font-michroma text-white bg-red-600 hover:bg-red-700 font-bold tracking-wider transition shadow-lg flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SUBMITTING APPLICATION...</span>
                </>
              ) : (
                "SUBMIT APPLICATION"
              )}
            </Button>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
