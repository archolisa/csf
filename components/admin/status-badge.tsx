"use client";

import { statusStyles } from "@/lib/admin-utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const style =
    statusStyles[status as keyof typeof statusStyles] ||
    statusStyles.pending;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const labelMap: Record<string, string> = {
    pending: "Pending",
    under_review: "Under Review",
    awarded: "Awarded",
    rejected: "Rejected",
  };

  return (
    <div
      className={`inline-flex items-center justify-center text-center space-x-1.5 ${sizeClasses[size]} ${style.bg} ${style.text} border ${style.border} rounded-full font-medium ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
      <span>{labelMap[status] || status}</span>
      <span className="w-2 h-2"></span>
    </div>
  );
}
