"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import { AdminSession } from "@/lib/interfaces";
import { AuditLog } from "@/lib/admin-utils";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");

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

        // Fetch audit logs
        const response = await fetch("/api/admin/activity/audit");
        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data.logs || []);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router]);

  const actionIcons: Record<string, string> = {
    upload: "📤",
    delete: "🗑️",
    edit: "✏️",
    view: "👁️",
    approve: "✅",
    reject: "❌",
    download: "📥",
    login: "🔓",
    logout: "🔒",
  };

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === "all" || log.action === filterAction
  );

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
      <AdminSidebar
        adminName={adminSession.name}
        userRole={adminSession.role || "admin"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar adminName={adminSession.name} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Recent Activity</h1>
            <p className="text-slate-600 mt-2">
              Track all admin actions and system events
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <label className="text-sm font-medium text-slate-700">Filter by action:</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="mt-2 sm:mt-0 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Actions</option>
                <option value="upload">Uploads</option>
                <option value="delete">Deletions</option>
                <option value="edit">Edits</option>
                <option value="approve">Approvals</option>
                <option value="login">Logins</option>
              </select>
            </div>
          </div>

          {/* Activity Timeline */}
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <Activity size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">No activity found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="text-2xl">
                      {actionIcons[log.action] || "📌"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {log.admin_name}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {log.details}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 sm:mt-0">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Badge */}
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 text-center text-slate-600 text-sm">
            <p>Showing {filteredLogs.length} of {auditLogs.length} activities</p>
          </div>
        </main>
      </div>
    </div>
  );
}
