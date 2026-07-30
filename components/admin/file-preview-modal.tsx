"use client";

import { useState } from "react";
import { X, Download, AlertCircle } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file?: {
    id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
  } | null;
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImage = file.file_type.startsWith("image/");
  const isPdf = file.file_type === "application/pdf";
  const isWord =
    file.file_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.file_type === "application/msword";

  const extractDriveId = (url: string): string | null => {
    if (!url) return null;
    const openMatch = url.match(/id=([a-zA-Z0-9_-]{25,})/);
    if (openMatch) return openMatch[1];
    const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
    if (fileMatch) return fileMatch[1];
    return null;
  };

  const driveId = extractDriveId(file.file_path);
  const isGoogleDrive = !!driveId;

  const handleDownload = async () => {
    try {
      if (isGoogleDrive) {
        // Redirect to google drive download link
        window.open(`https://docs.google.com/uc?export=download&id=${driveId}`, "_blank");
        return;
      }
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
    } catch {
      setError("Failed to download file");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{file.file_name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isGoogleDrive ? "Remote Google Drive File" : `${formatFileSize(file.file_size)} • ${new Date(file.uploaded_at).toLocaleDateString()}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Google Drive Preview */}
          {isGoogleDrive ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <iframe
                src={`https://drive.google.com/file/d/${driveId}/preview`}
                width="100%"
                height="600"
                className="rounded-lg border-0"
                allow="autoplay"
              />
            </div>
          ) : (
            <>
              {/* Image Preview */}
              {isImage && (
                <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.file_path}
                    alt={file.file_name}
                    className="max-w-full max-h-96 rounded-lg shadow-sm"
                    onError={() => setError("Failed to load image")}
                  />
                </div>
              )}

              {/* PDF Preview */}
              {isPdf && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <embed
                    src={file.file_path}
                    type="application/pdf"
                    width="100%"
                    height="600"
                    className="rounded-lg"
                  />
                </div>
              )}

              {/* Word Document */}
              {isWord && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="text-blue-600 text-sm mb-4">
                    <p className="font-semibold">Word Document Preview</p>
                    <p>Word documents cannot be previewed directly. Please download to view.</p>
                  </div>
                </div>
              )}

              {/* Unsupported File Type */}
              {!isImage && !isPdf && !isWord && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-800 text-sm">
                    <span className="font-semibold">Unsupported Preview</span>
                    <br />
                    File type: {file.file_type}
                  </p>
                </div>
              )}
            </>
          )}

          {/* File Details */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">File Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">File Name</p>
                <p className="text-gray-900 font-mono break-all">{file.file_name}</p>
              </div>
              <div>
                <p className="text-gray-600">File Type</p>
                <p className="text-gray-900">{file.file_type}</p>
              </div>
              <div>
                <p className="text-gray-600">File Size</p>
                <p className="text-gray-900">{formatFileSize(file.file_size)}</p>
              </div>
              <div>
                <p className="text-gray-600">Uploaded</p>
                <p className="text-gray-900">{new Date(file.uploaded_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
