"use client";

import { ApplicantWithStatus, getGoogleDriveThumbnail } from "@/lib/admin-utils";
import StatusBadge from "@/components/admin/status-badge";
import {
  Phone,
  MapPin,
  Calendar,
  Eye,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface ApplicantsCardsProps {
  applicants: ApplicantWithStatus[];
  isLoading: boolean;
}

export default function ApplicantsCards({
  applicants,
  isLoading
}: ApplicantsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-slate-200 p-6 h-80 animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-100"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3 py-4">
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-slate-100 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center max-w-xl mx-auto mt-8">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Applicants Found</h3>
        <p className="text-slate-600">
          Try adjusting your filters or sync new applicant records from the Google Sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {applicants.map((applicant, index) => {
        const initials = applicant.full_name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const passportUrl = applicant.passport_photo_url?.startsWith("/") 
          ? applicant.passport_photo_url 
          : getGoogleDriveThumbnail(applicant.passport_photo_url);

        // Check which key documents are available
        const hasJamb = !!applicant.jamb_result_url;
        const hasWaec = !!applicant.waec_result_url;
        const hasAdmission = !!applicant.admission_letter_url;


        return (
          <div
            key={applicant.id}
            className="group bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-red-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out"
            style={{
              animation: "fadeInUp 0.4s ease-out forwards",
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            <div>
              {/* Card Header: Avatar & Name */}
              <div className="flex items-center space-x-4 mb-4">
                {passportUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={passportUrl}
                    alt={applicant.full_name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 group-hover:border-red-400 transition-colors duration-300"
                    onError={(e) => {
                      // fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm"
                  style={{ display: passportUrl ? "none" : "flex" }}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors duration-300 truncate" title={applicant.full_name}>
                    {applicant.full_name}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                      {applicant.batch || "2025"} Batch
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4 flex justify-center">
                <StatusBadge status={applicant.status} size="sm" />
              </div>

              {/* Quick Info */}
              <div className="space-y-2.5 text-sm text-slate-600 mb-6">
                {applicant.age ? (
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{applicant.age} years old</span>
                  </div>
                ) : applicant.date_of_birth ? (
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>DOB: {applicant.date_of_birth}</span>
                  </div>
                ) : null}

                {applicant.village && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate" title={applicant.village}>Village: {applicant.village}</span>
                  </div>
                )}

                {applicant.jamb_score && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-400 rounded-full">J</div>
                    <span>JAMB: {applicant.jamb_score}</span>
                  </div>
                )}

                {applicant.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-slate-400" />
                    <span>{applicant.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              {/* Document Checkpoints */}
              <div className="border-t border-slate-100 pt-4 mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Required Documents
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    className={`p-1.5 rounded-xl border ${
                      hasJamb
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                    title={hasJamb ? "JAMB result attached" : "JAMB result missing"}
                  >
                    <span className="font-bold block">JAMB</span>
                  </div>
                  <div
                    className={`p-1.5 rounded-xl border ${
                      hasWaec
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                    title={hasWaec ? "WAEC result attached" : "WAEC result missing"}
                  >
                    <span className="font-bold block">WAEC</span>
                  </div>
                  <div
                    className={`p-1.5 rounded-xl border ${
                      hasAdmission
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                    title={hasAdmission ? "Admission letter attached" : "Admission letter missing"}
                  >
                    <span className="font-bold block">ADM</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/admin/applicants/${applicant.id}`}
                className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-700 px-4 py-2.5 rounded-2xl transition duration-300 font-semibold text-sm"
              >
                <Eye size={16} />
                <span>Review Profile</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
