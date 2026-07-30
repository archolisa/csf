"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import { AdminSession } from "@/lib/interfaces";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin session
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
        console.error("Session error:", err);
        router.push("/admin/login");
      }
    };

    checkSession();
  }, [router]);

  if (isLoading || !adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
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
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top Bar */}
        <AdminTopBar adminName={adminSession.name} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
