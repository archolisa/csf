"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import { AdminSession } from "@/lib/interfaces";
import { BarChart3, Download, FileText } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router]);

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

  const reportTemplates = [
    {
      title: "Application Summary",
      description: "Overview of all applications by status",
      icon: BarChart3,
    },
    {
      title: "Applicant Demographics",
      description: "Age, location, and education breakdown",
      icon: FileText,
    },
    {
      title: "Approval Rate",
      description: "Year-over-year approval statistics",
      icon: BarChart3,
    },
    {
      title: "Document Completeness",
      description: "Files missing and submission quality",
      icon: FileText,
    },
  ];

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
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 mt-2">
              Generate and export scholarship program insights
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">Approval Rate</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">-</p>
              <p className="text-xs text-slate-500 mt-1">Current year</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">Avg Processing Time</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">-</p>
              <p className="text-xs text-slate-500 mt-1">Days</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <p className="text-slate-600 text-sm font-medium">Active Admins</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
              <p className="text-xs text-slate-500 mt-1">Total users</p>
            </div>
          </div>

          {/* Report Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((report) => {
                const Icon = report.icon;
                return (
                  <div
                    key={report.title}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Icon size={24} className="text-red-500" />
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors">
                        <Download size={18} className="text-slate-600" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-slate-900">{report.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Reports */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Custom Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">Create custom reports</p>
              <p className="text-slate-500 text-sm mt-2">
                Use advanced filters to generate tailored reports
              </p>
              <button className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                Build Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
