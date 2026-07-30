"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import DocumentUpload from "@/components/admin/document-upload";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminSession, ScholarshipApplication, Document } from "@/lib/interfaces";
import {
  Users,
  Folder,
  Download,
  Trash2,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total_applicants: number;
  pending_applications: number;
  under_review: number;
  awarded: number;
  rejected: number;
  total_documents: number;
  this_month_applications: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  applicant_name?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_applicants: 0,
    pending_applications: 0,
    under_review: 0,
    awarded: 0,
    rejected: 0,
    total_documents: 0,
    this_month_applications: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [docError, setDocError] = useState("");
  const [docMessage, setDocMessage] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
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
        ) as AdminSession & { role?: string };

        setAdminSession({
          ...sessionData,
          adminId: sessionData.adminId || 0,
        });

        await Promise.all([
          fetchStats(),
          fetchRecentActivity(),
          fetchApplications(),
          fetchDocuments(),
        ]);
      } catch (err) {
        console.error("Error:", err);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch("/api/admin/activity/recent");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents?adminOnly=true");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDocError("");
      setDocMessage("");

      const response = await fetch(`/api/admin/documents?documentId=${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        setDocError(data.error || "Could not delete document");
        return;
      }

      setDocMessage("Document removed from the library.");
      fetchDocuments();
    } catch (error) {
      console.error("Document delete failed:", error);
      setDocError("Document delete failed. Please try again.");
    }
  };

  if (isLoading || !adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar
        adminName={adminSession.name}
        userRole={adminSession.role || "reviewer"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar adminName={adminSession.name} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-600 font-semibold">
                  Admin dashboard
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-3">
                  Manage applications and working documents
                </h1>
                <p className="text-slate-600 mt-2 max-w-2xl">
                  Centralized control for scholarships, applicant review, and document storage in one modern admin workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/applicants"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                >
                  <Users size={16} />
                  Application center
                </Link>
                <Link
                  href="/admin/documents/storage"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                >
                  <Folder size={16} />
                  Working documents
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6 mb-8">
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300 hover:-translate-y-1">
                  <p className="text-sm font-medium text-slate-500 group-hover:text-red-500 transition-colors">Total applicants</p>
                  <p className="mt-4 text-4xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">{stats.total_applicants}</p>
                  <p className="mt-2 text-sm text-slate-500">Applicants under review and awarded.</p>
                </div>
                <div className="group rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300 hover:-translate-y-1">
                  <p className="text-sm font-medium text-slate-500 group-hover:text-red-500 transition-colors">Working documents</p>
                  <p className="mt-4 text-4xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">{stats.total_documents}</p>
                  <p className="mt-2 text-sm text-slate-500">Documents stored for admin use and reference.</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Application hub</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Recent submissions and review status.
                    </p>
                  </div>
                  <Link
                    href="/admin/applicants"
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    View all applicants
                  </Link>
                </div>

                <div className="space-y-4">
                  {applications.slice(0, 4).map((application) => (
                    <div
                      key={application.id}
                      className="rounded-3xl border border-slate-200 p-4 hover:border-red-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {application.applicant_name}
                          </p>
                          <p className="text-sm text-slate-500 mt-1 truncate">
                            {application.email}
                          </p>
                        </div>
                        <span className={`inline-flex items-center justify-center text-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "awarded"
                            ? "bg-green-100 text-green-800"
                            : application.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {applications.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                      No recent applications available.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
                      Working document library
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                      Store files for admin workflows
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    {stats.total_documents} files
                  </span>
                </div>

                <DocumentUpload
                  onUploadSuccess={() => {
                    fetchDocuments();
                    setDocMessage("Document uploaded successfully.");
                    setDocError("");
                  }}
                  title="Upload working document"
                  description="Add internal files for your team, board reports, and reference materials."
                />

                {docError && (
                  <div className="mt-4 rounded-2xl bg-light-red bg-opacity-10 border border-light-red/30 px-4 py-3 text-sm text-light-red">
                    {docError}
                  </div>
                )}

                {docMessage && (
                  <div className="mt-4 rounded-2xl bg-emerald-100 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                    {docMessage}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Stored documents</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Manage the files saved to the admin library.
                    </p>
                  </div>
                  <Link
                    href="/admin/documents/storage"
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Open storage
                  </Link>
                </div>

                <div className="space-y-4">
                  {documents.length > 0 ? (
                    documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-3xl border border-slate-200 p-4 hover:border-red-300 transition"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {doc.file_name}
                            </p>
                            <p className="text-sm text-slate-500 mt-1 truncate">
                              {doc.file_type} · {(doc.file_size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition"
                            >
                              <Download size={16} />
                              Download
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setDocumentToDelete(doc.id);
                                setDeleteConfirmOpen(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Folder size={24} />
                      </div>
                      <p className="text-sm">
                        No working documents stored yet. Upload files to start building the library.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Recent activity</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Actions taken in the admin portal.
                  </p>
                </div>
                <Link
                  href="/admin/activity"
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="group rounded-3xl border border-slate-200 p-5 hover:border-red-300 hover:shadow-sm transition-all flex items-start gap-4 bg-slate-50/50 hover:bg-white">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:border-red-200 group-hover:text-red-500 transition-colors">
                        <Activity size={18} className="text-slate-400 group-hover:text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {activity.description}
                        </p>
                        {activity.applicant_name && (
                          <p className="text-xs font-medium text-red-600 mt-1">
                            {activity.applicant_name}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          {new Date(activity.timestamp).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    No recent activity yet.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-sm">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-red-200 font-semibold">
                  Admin Zone
                </p>
                <h3 className="text-2xl font-bold mt-3">Keep the foundation moving</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="font-semibold">Organize working files</p>
                  <p className="mt-1 text-red-100">Upload working documents, reports, and templates in one place.</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="font-semibold">Process Applications</p>
                  <p className="mt-1 text-red-100">Track the latest applicants and review their applications.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDocumentToDelete(null);
        }}
        onConfirm={() => {
          if (documentToDelete) handleDeleteDocument(documentToDelete);
        }}
        title="Delete Document"
        message="Delete this working document? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
