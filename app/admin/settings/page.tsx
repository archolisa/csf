"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import { AdminSession } from "@/lib/interfaces";
import { Bell, Lock, Palette } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

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

  const tabs = [
    { id: "general", label: "General", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
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
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">
              Manage your account and application preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
            <div className="flex border-b border-slate-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "text-red-500 border-red-500"
                        : "text-slate-600 border-transparent hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "general" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Foundation Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Cyril & Susanna Foundation"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@cyrilandsusannafoundation.org"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                    Save Changes
                  </button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">New Applications</p>
                      <p className="text-sm text-slate-600">
                        Receive notifications when new applications are submitted
                      </p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Document Uploads</p>
                      <p className="text-sm text-slate-600">
                        Receive notifications when documents are uploaded
                      </p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                  </div>

                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                    Save Preferences
                  </button>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                    Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
