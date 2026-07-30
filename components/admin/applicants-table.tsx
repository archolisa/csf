"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/status-badge";
import { ApplicantWithStatus } from "@/lib/admin-utils";
import {
  ChevronDown,
  Eye,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

interface ApplicantsTableProps {
  applicants: ApplicantWithStatus[];
  isLoading: boolean;
  onStatusChange?: (applicantId: string, newStatus: string) => void;
}

export default function ApplicantsTable({
  applicants,
  isLoading,
}: ApplicantsTableProps) {
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "name" | "date" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "name") {
      comparison = a.full_name.localeCompare(b.full_name);
    } else if (sortBy === "date") {
      comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-600 text-lg">No applicants found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-2 font-semibold text-slate-900 hover:text-slate-600"
                >
                  <span>Applicant</span>
                  {sortBy === "name" && (
                    <ChevronDown
                      size={16}
                      className={`transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center space-x-2 font-semibold text-slate-900 hover:text-slate-600"
                >
                  <span>Submitted</span>
                  {sortBy === "date" && (
                    <ChevronDown
                      size={16}
                      className={`transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-center">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center justify-center space-x-2 font-semibold text-slate-900 hover:text-slate-600 w-full"
                >
                  <span>Status</span>
                  {sortBy === "status" && (
                    <ChevronDown
                      size={16}
                      className={`transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left font-semibold text-slate-900">Documents</th>
              <th className="px-6 py-4 text-center font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedApplicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{applicant.full_name}</p>
                    <p className="text-sm text-slate-600">{applicant.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(applicant.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={applicant.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {applicant.documents_count} file{applicant.documents_count !== 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      href={`/admin/applicants/${applicant.id}`}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                      title="View applicant"
                    >
                      <Eye size={18} />
                    </Link>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-sm text-slate-600">
        <span>Showing {sortedApplicants.length} applicants</span>
        <div className="space-x-2">
          <button className="px-3 py-1 hover:bg-slate-200 rounded transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 hover:bg-slate-200 rounded transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
