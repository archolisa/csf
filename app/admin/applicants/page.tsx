"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import ApplicantsTable from "@/components/admin/applicants-table";
import ApplicantsCards from "@/components/admin/applicants-cards";
import { AdminSession } from "@/lib/interfaces";
import { ApplicantWithStatus } from "@/lib/admin-utils";
import { Download, LayoutGrid, List, RefreshCw, X, AlertTriangle, CheckCircle, Database } from "lucide-react";

interface ApplicationApiResponse {
  id: string;
  applicant_name: string;
  email: string;
  phone?: string;
  submitted_at: string;
  status: "pending" | "under_review" | "awarded" | "rejected";
  updated_at: string;
  documents_count?: number;
  notes_count?: number;
  batch?: string;
  age?: number;
  village?: string;
  jamb_score?: number;
  passport_photo_url?: string;
  jamb_result_url?: string;
  waec_result_url?: string;
  admission_letter_url?: string;
}

export default function ApplicantsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [applicants, setApplicants] = useState<ApplicantWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("2026/2027");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "cards">("cards");

  // Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncSheetUrl, setSyncSheetUrl] = useState("https://docs.google.com/spreadsheets/d/10SnAQu42_hZdA94coIIxU894u94eA8B9YFHjCznVAPk/edit?resourcekey=&gid=1435963208#gid=1435963208");
  const [syncBatch, setSyncBatch] = useState("2026/2027");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ total_processed: number; created: number; updated: number } | null>(null);
  const [syncError, setSyncError] = useState("");

  const fetchApplicants = useCallback(async (batch: string) => {
    setIsLoading(true);
    try {
      const url = `/api/admin/applications?batch=${batch}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const formattedApplicants = data.applications.map((app: ApplicationApiResponse) => ({
          id: app.id,
          full_name: app.applicant_name,
          email: app.email,
          phone: app.phone || "",
          application_year: app.batch || new Date(app.submitted_at).getFullYear().toString(),
          status: app.status,
          documents_count: app.documents_count || 0,
          submitted_at: app.submitted_at,
          updated_at: app.updated_at,
          notes_count: app.notes_count || 0,
          has_all_documents: !!(app.jamb_result_url && app.waec_result_url && app.admission_letter_url),
          // Stored fields for card display
          age: app.age,
          village: app.village,
          jamb_score: app.jamb_score,
          passport_photo_url: app.passport_photo_url,
          jamb_result_url: app.jamb_result_url,
          waec_result_url: app.waec_result_url,
          admission_letter_url: app.admission_letter_url,
          batch: app.batch,
        }));
        setApplicants(formattedApplicants);
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

        // Initial fetch
        await fetchApplicants(batchFilter);
      } catch (err) {
        console.error("Session check error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router, batchFilter, fetchApplicants]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError("");
    setSyncResult(null);

    try {
      const response = await fetch("/api/admin/applications/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetUrl: syncSheetUrl,
          batch: syncBatch,
          adminId: adminSession?.adminId,
          adminName: adminSession?.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setSyncError(data.error || "Failed to synchronize applicant records");
      } else {
        setSyncResult({
          total_processed: data.total_processed,
          created: data.created,
          updated: data.updated,
        });
        await fetchApplicants(batchFilter);
      }
    } catch (err) {
      console.error("Sync request error:", err);
      setSyncError("A network error occurred. Please check database connectivity.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.village && app.village.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const csv = [
      ["Full Name", "Email", "Phone", "Age", "Village", "Batch", "Status", "Submitted Date"],
      ...filteredApplicants.map((app) => [
        app.full_name,
        app.email,
        app.phone,
        app.age || "N/A",
        app.village || "N/A",
        app.batch || "N/A",
        app.status,
        new Date(app.submitted_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applicants_batch_${batchFilter}.csv`;
    a.click();
  };

  if (isLoading && applicants.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar adminName={adminSession?.name || ""} userRole={adminSession?.role || "reviewer"} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopBar adminName={adminSession?.name || ""} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading applicants workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        adminName={adminSession?.name || "Admin"}
        userRole={adminSession?.role || "admin"}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <AdminTopBar adminName={adminSession?.name || "Admin"} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-red-600 font-semibold">Scholarship foundation</span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Beneficiary Applications</h1>
              <p className="text-slate-600 mt-2">
                Manage, audit, and preview applicant profiles and documents.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Sync Button */}
              <button
                onClick={() => {
                  setIsSyncModalOpen(true);
                  setSyncResult(null);
                  setSyncError("");
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-full hover:from-red-700 hover:to-red-800 transition duration-300 font-semibold shadow-md shadow-red-600/15 text-sm"
              >
                <RefreshCw size={16} className="animate-pulse" />
                <span>Sync Google Sheet</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-full hover:bg-slate-50 transition font-semibold text-sm shadow-sm"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters & Toggle */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Search and Filters */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search by name, email, village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50/50 text-sm"
                  />
                </div>
                
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-700 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="awarded">Awarded</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-700 text-sm"
                  >
                    <option value="all">All Batches</option>
                    <option value="2026/2027">2026/2027 Session</option>
                    <option value="2025">2025 Session</option>
                  </select>
                </div>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setViewType("cards")}
                  className={`p-2 rounded-xl transition duration-200 ${
                    viewType === "cards"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewType("table")}
                  className={`p-2 rounded-xl transition duration-200 ${
                    viewType === "table"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

            </div>
          </div>

          {/* Main View Area */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
              <p className="text-slate-500">Syncing database and loading records...</p>
            </div>
          ) : viewType === "table" ? (
            <ApplicantsTable
              applicants={filteredApplicants}
              isLoading={false}
            />
          ) : (
            <ApplicantsCards
              applicants={filteredApplicants}
              isLoading={false}
            />
          )}
        </main>
      </div>

      {/* Sync Google Sheet Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-65 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100 animate-[fadeInUp_0.3s_ease-out]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Synchronize Beneficiaries</h2>
                  <p className="text-xs text-slate-500">Pull fresh records from Google Spreadsheets</p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-4">
              {syncError && (
                <div className="flex items-start space-x-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Sync Error</p>
                    <p className="text-xs text-red-700 mt-1">{syncError}</p>
                  </div>
                </div>
              )}

              {syncResult && (
                <div className="flex items-start space-x-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="font-bold">Import Completed Successfully</p>
                    <div className="text-xs text-emerald-700 mt-1 space-y-1">
                      <p>• Total records processed: <strong>{syncResult.total_processed}</strong></p>
                      <p>• New applications added: <strong>{syncResult.created}</strong></p>
                      <p>• Existing records updated: <strong>{syncResult.updated}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Google Sheet Address
                </label>
                <input
                  type="text"
                  value={syncSheetUrl}
                  onChange={(e) => setSyncSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  disabled={isSyncing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-500">
                  Ensure link permissions are set to &quot;Anyone with the link can view&quot;.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Target Batch
                  </label>
                  <select
                    value={syncBatch}
                    onChange={(e) => setSyncBatch(e.target.value)}
                    disabled={isSyncing}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white text-slate-700"
                  >
                    <option value="2026/2027">2026/2027 Session</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2027">2027 Batch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                disabled={isSyncing}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition text-sm font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition text-sm font-semibold flex items-center space-x-2 shadow-md shadow-red-600/10 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Start Sync</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

