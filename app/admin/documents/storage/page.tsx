"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import DocumentUpload from "@/components/admin/document-upload";
import FilePreviewModal from "@/components/admin/file-preview-modal";
import ConfirmModal from "@/components/admin/confirm-modal";
import { AdminSession } from "@/lib/interfaces";
import { AdminFile, FileCategory, formatFileSize, getFileIcon, getFileCategoryLabel } from "@/lib/admin-utils";
import { Upload, FolderPlus, Trash2, Download, Eye, MoreVertical, Edit2, Check, X } from "lucide-react";

export default function AdminStoragePage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
  } | null>(null);

  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const refreshFiles = async () => {
    try {
      const response = await fetch("/api/admin/documents?storageOnly=true");
      if (response.ok) {
        const data = await response.json();
        setFiles(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to refresh files:", err);
    }
  };

  const categories: FileCategory[] = [
    "meeting_notes",
    "scholarship_guidelines",
    "applicant_review_files",
    "financial_documents",
    "reports",
    "templates",
    "media",
    "admin_files",
  ];

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

        // Fetch files
        const response = await fetch("/api/admin/documents?storageOnly=true");
        if (response.ok) {
          const data = await response.json();
          setFiles(data.documents || []);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router]);

  const filteredFiles = files.filter((file) => {
    const matchesCategory =
      selectedCategory === "all" || file.category === selectedCategory;
    const matchesSearch = file.file_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePreview = (file: AdminFile) => {
    setSelectedFile({
      id: file.id,
      file_name: file.file_name,
      file_type: file.file_type,
      file_path: file.file_path,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    });
    setIsPreviewOpen(true);
  };

  const handleDownload = async (file: AdminFile) => {
    try {
      const response = await fetch(file.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId));
      } else {
        console.error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const submitRename = async (fileId: string) => {
    if (!newFileName || newFileName.trim() === "") {
      setRenamingFileId(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_name: newFileName }),
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(files.map(f => f.id === fileId ? { ...f, file_name: data.document.file_name } : f));
      }
    } catch (err) {
      console.error("Rename failed:", err);
    } finally {
      setRenamingFileId(null);
    }
  };

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
        userRole={(adminSession?.role as string) || "admin"}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <AdminTopBar adminName={adminSession.name} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin File Storage</h1>
            <p className="text-slate-600 mt-2">
              Organize and manage internal foundation documents and resources
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <DocumentUpload 
              title="Upload to Admin Storage"
              description="Upload foundation documents, financial records, meeting notes, etc."
              onUploadSuccess={refreshFiles}
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-red-500 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                All Files
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-red-500 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {getFileCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Files Grid */}
          {filteredFiles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <FolderPlus size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">No files in this category</p>
              <p className="text-slate-500 text-sm mt-2">
                Start uploading documents to organize your foundation&apos;s resources
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow group"
                >
                  {/* File Icon and Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getFileIcon(file.file_type)}</div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded">
                      <MoreVertical size={16} className="text-slate-600" />
                    </button>
                  </div>

                  {/* File Name */}
                  {renamingFileId === file.id ? (
                    <div className="flex items-center space-x-1 mb-1">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-red-500 rounded focus:outline-none bg-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRename(file.id);
                          if (e.key === "Escape") setRenamingFileId(null);
                        }}
                      />
                      <button onClick={() => submitRename(file.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setRenamingFileId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-slate-900 text-sm truncate mb-1">
                      {file.file_name}
                    </p>
                  )}

                  {/* Category and Size */}
                  <div className="text-xs text-slate-600 space-y-1 mb-3">
                    <p>{getFileCategoryLabel(file.category)}</p>
                    <p>{formatFileSize(file.file_size)}</p>
                    <p>{new Date(file.uploaded_at).toLocaleDateString()}</p>
                  </div>

                  {/* Description */}
                  {file.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {file.description}
                    </p>
                  )}

                  {/* Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {file.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handlePreview(file)}
                      title="Preview"
                      className="flex-1 flex items-center justify-center space-x-1 p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs"
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      title="Download"
                      className="flex-1 flex items-center justify-center space-x-1 p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs transition-colors"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        setRenamingFileId(file.id);
                        setNewFileName(file.file_name);
                      }}
                      title="Rename"
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setFileToDelete(file.id);
                        setDeleteConfirmOpen(true);
                      }}
                      title="Delete"
                      className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 text-center text-slate-600 text-sm">
            <p>Showing {filteredFiles.length} of {files.length} files</p>
          </div>
        </main>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          file={selectedFile}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setFileToDelete(null);
          }}
          onConfirm={() => {
            if (fileToDelete) handleDelete(fileToDelete);
          }}
          title="Delete Document"
          message="Are you sure you want to delete this file? This cannot be undone."
          confirmText="Delete"
        />
      </div>
    </div>
  );
}
