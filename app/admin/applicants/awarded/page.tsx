"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopBar from "@/components/admin/top-bar";
import ApplicantsTable from "@/components/admin/applicants-table";
import { AdminSession } from "@/lib/interfaces";
import { ApplicantWithStatus } from "@/lib/admin-utils";

interface ApplicationApiResponse {
  id: string;
  applicant_name: string;
  email: string;
  phone?: string;
  submitted_at: string;
  status: "pending" | "under_review" | "awarded" | "rejected";
  updated_at: string;
  documents_count?: number;
  notes_count?: number;
}

export default function AwardedPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [applicants, setApplicants] = useState<ApplicantWithStatus[]>([]);
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

        // Fetch awarded applicants
        const response = await fetch("/api/admin/applications?status=awarded");
        if (response.ok) {
          const data = await response.json();
          const formattedApplicants = data.applications.map((app: ApplicationApiResponse) => ({
            id: app.id,
            full_name: app.applicant_name,
            email: app.email,
            phone: app.phone || "",
            application_year: new Date(app.submitted_at).getFullYear().toString(),
            status: app.status,
            documents_count: app.documents_count || 0,
            submitted_at: app.submitted_at,
            updated_at: app.updated_at,
            notes_count: app.notes_count || 0,
            has_all_documents: false,
          }));
          setApplicants(formattedApplicants);
        }

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
            <h1 className="text-3xl font-bold text-slate-900">Awarded Applicants</h1>
            <p className="text-slate-600 mt-2">
              View all applicants who have been awarded
            </p>
          </div>

          <ApplicantsTable applicants={applicants} isLoading={false} />
        </main>
      </div>
    </div>
  );
}
