"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StatusBadge from "@/components/admin/status-badge";
import DocumentUpload from "@/components/admin/document-upload";
import FilePreviewModal from "@/components/admin/file-preview-modal";
import ConfirmModal from "@/components/admin/confirm-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime, getGoogleDriveThumbnail } from "@/lib/admin-utils";
import { LucideArrowLeft, LucideFileText, LucideDownload, LucideTrash2, LucideEye, Award, Building, User, Edit2 } from "lucide-react";
import { AdminSession } from "@/lib/interfaces";

interface Note {
  _id?: string;
  author: string;
  text: string;
  createdAt: string;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploaded_by_student: boolean;
}

interface ApplicantData {
  id: string;
  applicant_name: string;
  email: string;
  phone: string;
  field_of_study: string;
  gpa: number;
  status: "pending" | "under_review" | "awarded" | "rejected";
  submitted_at: string;
  updated_at: string;
  notes: Note[];
  
  // Sheet fields
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
}

export default function ApplicantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  
  // UI Feedback states
  const [statusMessage, setStatusMessage] = useState("");
  const [noteFeedback, setNoteFeedback] = useState({ type: "", message: "" });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // File Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Confirm Modal state
  const [deleteConfirmType, setDeleteConfirmType] = useState<"note" | "document" | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
  } | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("adminSession="));

        if (!sessionCookie) {
          router.push("/admin/login");
          return;
        }

        const sessionData = JSON.parse(
          decodeURIComponent(sessionCookie.split("=")[1])
        );
        setAdminSession(sessionData);

        // Fetch application details
        const response = await fetch(`/api/admin/applications/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch applicant details");
        }

        const data = await response.json();
        setApplicant(data.application);
        setDocuments(data.documents || []);
      } catch (err: unknown) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      initPage();
    }
  }, [id, router]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusMessage("Updating...");
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplicant((prev) =>
          prev ? { ...prev, status: data.application.status } : null
        );
        setStatusMessage("Status updated successfully.");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        setStatusMessage("Failed to update status.");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setStatusMessage("Error updating status.");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setNoteFeedback({ type: "loading", message: "Saving note..." });

    try {
      const author = adminSession?.name || "Admin";
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText, author }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplicant((prev) =>
          prev ? { ...prev, notes: data.notes || [] } : null
        );
        setNoteText("");
        setNoteFeedback({ type: "success", message: "Note added successfully!" });
        setTimeout(() => setNoteFeedback({ type: "", message: "" }), 3000);
      } else {
        setNoteFeedback({ type: "error", message: "Failed to save note." });
        setTimeout(() => setNoteFeedback({ type: "", message: "" }), 3000);
      }
    } catch (err) {
      console.error("Note submission error:", err);
      setNoteFeedback({ type: "error", message: "Error adding note." });
      setTimeout(() => setNoteFeedback({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/admin/documents?documentId=${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error("Document delete error:", err);
      alert("Error deleting document");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setApplicant((prev) => prev ? { ...prev, notes: data.notes || [] } : null);
      } else {
        alert("Failed to delete note.");
      }
    } catch (err) {
      console.error("Delete note error:", err);
      alert("Error deleting note.");
    }
  };

  const submitEditNote = async (noteId: string) => {
    if (!editingNoteText.trim()) {
      setEditingNoteId(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/applications/${id}/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingNoteText }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplicant((prev) => prev ? { ...prev, notes: data.notes || [] } : null);
      } else {
        alert("Failed to update note.");
      }
    } catch (err) {
      console.error("Edit note error:", err);
      alert("Error editing note.");
    } finally {
      setEditingNoteId(null);
    }
  };

  const handlePreview = (doc: DocumentItem) => {
    setSelectedFile({
      id: doc.id,
      file_name: doc.name,
      file_type: doc.type || (doc.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      file_path: doc.url,
      file_size: doc.size || 0,
      uploaded_at: doc.uploadedAt,
    });
    setIsPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center p-6">
        <Card className="max-w-md p-6 text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Profile</p>
          <p className="text-slate-600 mb-4">{error || "Applicant not found"}</p>
          <Button onClick={() => router.push("/admin/applicants")}>
            Back to Applicants
          </Button>
        </Card>
      </div>
    );
  }

  const initials = applicant.applicant_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const passportUrl = applicant.passport_photo_url?.startsWith("/") 
    ? applicant.passport_photo_url 
    : getGoogleDriveThumbnail(applicant.passport_photo_url);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2 hover:bg-slate-100 rounded-xl"
        onClick={() => router.push("/admin/applicants")}
      >
        <LucideArrowLeft className="w-4 h-4" /> Back to Applicants
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center shadow-sm rounded-3xl bg-white border border-slate-200">
          {passportUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={passportUrl}
              alt={applicant.applicant_name}
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-slate-100 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white shadow-md"
            style={{ display: passportUrl ? "none" : "flex" }}
          >
            {initials}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{applicant.applicant_name}</h2>
          <p className="text-slate-600 text-sm mb-2 break-all">{applicant.email}</p>
          {applicant.phone && <p className="text-slate-600 text-sm mb-4 font-mono">{applicant.phone}</p>}
          
          <div className="mb-4 flex justify-center">
            <StatusBadge status={applicant.status} size="md" />
          </div>

          <div className="text-xs text-slate-500 mb-6 bg-slate-100 px-3 py-1 rounded-full">
            Batch: {applicant.batch || "2025"} • Applied: {formatDate(applicant.submitted_at)}
          </div>

          <div className="w-full border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Application Status
              </label>
              {statusMessage && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  statusMessage.includes("success") ? "bg-emerald-100 text-emerald-700" :
                  statusMessage.includes("Updating") ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {statusMessage}
                </span>
              )}
            </div>
            <select
              value={applicant.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-700 font-semibold"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="awarded">Awarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Details Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Academic & Personal Info */}
          <Card className="p-6 shadow-sm rounded-3xl bg-white border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-500" /> Academic & Personal Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Institution</p>
                <p className="font-bold text-slate-800">{applicant.institution || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Level of Study</p>
                <p className="font-bold text-slate-800 capitalize">{applicant.level || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Course of Study</p>
                <p className="font-bold text-slate-800">{applicant.field_of_study || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">JAMB Score</p>
                <p className="font-bold text-slate-800 font-mono">{applicant.jamb_score || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Village</p>
                <p className="font-bold text-slate-800">{applicant.village || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Is Indigene of Isuofia?</p>
                <p className="font-bold text-slate-800">{applicant.is_indigene || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Age & Date of Birth</p>
                <p className="font-bold text-slate-800">
                  {applicant.date_of_birth || "N/A"} {applicant.age ? `(${applicant.age} years old)` : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Home Address</p>
                <p className="font-bold text-slate-800">{applicant.home_address || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sponsor / Parent Name</p>
                <p className="font-bold text-slate-800">{applicant.sponsor_name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sponsor Phone</p>
                <p className="font-bold text-slate-800 font-mono">{applicant.sponsor_phone || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Personal Statement */}
          {applicant.personal_statement && (
            <Card className="p-6 shadow-sm rounded-3xl bg-white border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" /> Personal Statement
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                &ldquo;{applicant.personal_statement}&rdquo;
              </p>
            </Card>
          )}

          {/* Uploaded Documents */}
          <Card className="p-6 shadow-sm rounded-3xl bg-white border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <LucideFileText className="w-5 h-5 text-red-500" /> Uploaded Documents
            </h3>
            {(() => {
              const displayedDocuments = documents.filter(doc => doc.name !== "Passport Photograph");
              if (displayedDocuments.length === 0) {
                return <p className="text-slate-500 text-sm py-4 text-center">No documents uploaded for this applicant.</p>;
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {displayedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-2xl hover:border-red-200 transition-colors bg-white">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-red-500">
                        <LucideFileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate text-sm" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Remote Link"} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-600 hover:text-red-500"
                          title="Preview File"
                        >
                          <LucideEye className="w-4.5 h-4.5" />
                        </button>
                        <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-red-500 rounded-xl">
                            <LucideDownload className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                          onClick={() => {
                            setItemToDelete(doc.id);
                            setDeleteConfirmType("document");
                          }}
                        >
                          <LucideTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Document Upload Widget */}
            <DocumentUpload
              applicationId={applicant.id}
              title="Upload Stored Document"
              description="Store extra PDF certificates, review sheets, or reference files on this beneficiary profile."
              onUploadSuccess={async () => {
                const response = await fetch(`/api/admin/applications/${id}`);
                if (response.ok) {
                  const data = await response.json();
                  setDocuments(data.documents || []);
                }
              }}
            />
          </Card>

          {/* Admin Notes */}
          <Card className="p-6 shadow-sm rounded-3xl bg-white border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Internal Reviews & Notes</h3>
            
            <form onSubmit={handleAddNote} className="flex flex-col gap-3 mb-6">
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50"
                  placeholder="Type a new review or administrative note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  disabled={noteFeedback.type === "loading"}
                />
                <Button type="submit" size="sm" disabled={noteFeedback.type === "loading"} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition">
                  {noteFeedback.type === "loading" ? "Saving..." : "Add Note"}
                </Button>
              </div>
              {noteFeedback.message && (
                <p className={`text-xs font-semibold ${noteFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {noteFeedback.message}
                </p>
              )}
            </form>

            <ul className="space-y-3">
              {applicant.notes && applicant.notes.length > 0 ? (
                [...applicant.notes].reverse().map((n, i) => (
                  <li key={n._id || i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" /> {n.author}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                        {n._id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(n._id as string);
                                setEditingNoteText(n.text);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                              title="Edit Note"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(n._id as string);
                                setDeleteConfirmType("note");
                              }}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Note"
                            >
                              <LucideTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingNoteId === n._id ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          className="w-full border border-red-500 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white min-h-[80px]"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)} className="h-7 text-xs rounded-lg">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => submitEditNote(n._id as string)} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{n.text}</div>
                    )}
                  </li>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No reviews or notes yet.</p>
              )}
            </ul>
          </Card>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={selectedFile}
      />

      <ConfirmModal
        isOpen={deleteConfirmType !== null}
        onClose={() => {
          setDeleteConfirmType(null);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (!itemToDelete) return;
          if (deleteConfirmType === "note") {
            handleDeleteNote(itemToDelete);
          } else if (deleteConfirmType === "document") {
            handleDeleteDocument(itemToDelete);
          }
        }}
        title={deleteConfirmType === "note" ? "Delete Note" : "Delete Document"}
        message={
          deleteConfirmType === "note"
            ? "Are you sure you want to delete this note?"
            : "Delete this working document? This cannot be undone."
        }
        confirmText="Delete"
      />
    </div>
  );
}
