"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import FilePreviewModal from "@/components/admin/file-preview-modal";
import { AdminSession } from "@/lib/interfaces";
import { formatFileSize, getFileIcon } from "@/lib/admin-utils";
import { FileUp, Eye, Trash2, Download } from "lucide-react";

interface DocumentItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  applicant_id: string;
  applicant_name: string;
  file_path: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentItem | null>(null);

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

        // Fetch documents
        const response = await fetch("/api/admin/documents?adminOnly=true");
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents || []);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router]);

  const handlePreview = async (doc: DocumentItem) => {
    setSelectedFile(doc);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const response = await fetch(doc.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    } else if (sortBy === "size") {
      return b.file_size - a.file_size;
    } else {
      return a.file_name.localeCompare(b.file_name);
    }
  });

  if (isLoading || !adminSession) {
    return (
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar adminName={adminSession?.name || ""} userRole={adminSession?.role || "reviewer"} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopBar adminName={adminSession?.name || ""} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading...</p>
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
        adminName={adminSession.name}
        userRole={adminSession.role || "admin"}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <AdminTopBar adminName={adminSession.name} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Stored Documents</h1>
            <p className="text-slate-600 mt-2">
              Manage internal foundation files uploaded by administrators for board members
            </p>
          </div>

          {/* Search and Sort */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Search Documents
                </label>
                <input
                  type="text"
                  placeholder="Search by file name or applicant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "size" | "name")}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="date">Upload Date</option>
                  <option value="size">File Size</option>
                  <option value="name">File Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          {sortedDocuments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <FileUp size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* File Icon and Name */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="text-2xl">{getFileIcon(doc.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatFileSize(doc.file_size)}
                      </p>
                    </div>
                  </div>

                  {/* Applicant and Date */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-600">Applicant</p>
                      <p className="text-slate-900 font-medium">{doc.applicant_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Uploaded</p>
                      <p className="text-slate-900">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handlePreview(doc)}
                      title="Preview"
                      className="flex-1 flex items-center justify-center space-x-1 p-2 hover:bg-slate-100 rounded transition-colors text-slate-600 text-sm"
                    >
                      <Eye size={16} />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      title="Download"
                      className="flex-1 flex items-center justify-center space-x-1 p-2 hover:bg-slate-100 rounded transition-colors text-slate-600 text-sm"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                    <button
                      title="Delete"
                      className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 text-center text-slate-600 text-sm">
            <p>Showing {sortedDocuments.length} of {documents.length} documents</p>
          </div>
        </main>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={selectedFile}
      />
    </div>
  );
}
