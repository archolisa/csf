"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UploadCloud, FileText, X } from "lucide-react";

interface DocumentUploadProps {
  applicationId?: string | number;
  title?: string;
  description?: string;
  onUploadSuccess: () => void;
}

export default function DocumentUpload({
  applicationId,
  title = "Upload Document",
  description = "Click the button, or drag a PDF, Word file, or image here.",
  onUploadSuccess,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Two-step upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("admin_files");
  const [customName, setCustomName] = useState<string>("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: PDF, Word, Images");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setError("");
    setSelectedFile(file);
    setCustomName(file.name);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const adminSession = document.cookie
        .split("; ")
        .find((row) => row.startsWith("adminSession="));

      if (!adminSession) {
        setError("Session expired. Please login again.");
        return;
      }

      const sessionData = JSON.parse(decodeURIComponent(adminSession.split("=")[1]));

      const formData = new FormData();
      formData.append("file", selectedFile);
      if (applicationId) {
        formData.append("applicationId", applicationId.toString());
      }
      formData.append("adminId", sessionData.adminId.toString());
      formData.append("category", category);
      formData.append("custom_name", customName.trim());

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Upload failed");
        return;
      }

      setSuccess(`${selectedFile.name} uploaded successfully`);
      setSelectedFile(null);
      setCategory("admin_files");
      onUploadSuccess();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray/10 p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-fontcolor">{title}</h3>
          <p className="text-sm text-gray mt-1">{description}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-accent-color-primary/10 text-accent-color-primary shadow-sm">
          <span className="text-3xl font-bold">+</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-light-red bg-opacity-10 border border-light-red/30 px-4 py-3 text-sm text-light-red">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-2xl bg-emerald-100 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {selectedFile ? (
        <div className="rounded-3xl border-2 border-slate-200 p-6 bg-slate-50 relative overflow-hidden text-left">
          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl">
              <RefreshCw size={36} className="animate-spin text-red-500 mb-4" />
              <p className="font-semibold text-slate-800 text-lg">Uploading document...</p>
              <p className="text-sm text-slate-500 mt-1">Please wait a moment</p>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-200">
              <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={isUploading}
                placeholder="Enter file name"
                className="w-full text-base font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:outline-none transition-colors pb-1 mb-1 truncate"
              />
              <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={() => { setSelectedFile(null); setCustomName(""); }}
              disabled={isUploading}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-700 text-sm shadow-sm"
              >
                <option value="admin_files">General Admin File</option>
                <option value="financial">Financial Record</option>
                <option value="applicant_document">Applicant Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <Button
              onClick={() => uploadFile()}
              disabled={isUploading}
              className="w-full rounded-xl bg-red-600 py-6 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
            >
              Confirm & Upload File
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`group relative cursor-pointer overflow-hidden rounded-3xl border-2 p-8 text-center transition ${
            isDragActive
              ? "border-accent-color-primary bg-accent-color-primary/10"
              : "border-dashed border-gray/30 bg-background hover:border-accent-color-primary/60"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragActive(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              if (file.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit");
                return;
              }
              setError("");
              setSelectedFile(file);
              setCustomName(file.name);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 transition-transform duration-300 group-hover:scale-105">
            <UploadCloud size={28} />
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-fontcolor font-semibold text-lg">
              Drop file here or click to choose
            </p>
            <p className="text-sm text-gray">
              {isDragActive
                ? "Release to select your file"
                : description}
            </p>
          </div>

          <Button
            type="button"
            disabled={isUploading}
            variant="default"
            size="default"
            className="mt-6 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            Browse files
          </Button>
        </div>
      )}
    </div>
  );
}
