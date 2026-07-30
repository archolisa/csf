"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import { AdminSession } from "@/lib/interfaces";
import { User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600 mt-2">View and manage your account</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 max-w-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {adminSession.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {adminSession.name}
                  </h2>
                  <p className="text-slate-600">
                    {adminSession.role || "Admin"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!isEditing ? (
                <>
                  {/* Display Mode */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User size={18} className="text-slate-600" />
                      <label className="block text-sm font-medium text-slate-600">
                        Full Name
                      </label>
                    </div>
                    <p className="text-lg text-slate-900">{adminSession.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail size={18} className="text-slate-600" />
                      <label className="block text-sm font-medium text-slate-600">
                        Email Address
                      </label>
                    </div>
                    <p className="text-lg text-slate-900">{adminSession.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={18} className="text-slate-600" />
                      <label className="block text-sm font-medium text-slate-600">
                        Account Created
                      </label>
                    </div>
                    <p className="text-lg text-slate-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={adminSession.name}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={adminSession.email}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
