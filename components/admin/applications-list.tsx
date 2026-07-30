"use client";

import { ScholarshipApplication } from "@/lib/interfaces";

interface ApplicationsListProps {
  applications: ScholarshipApplication[];
  selectedApp: ScholarshipApplication | null;
  onSelectApp: (app: ScholarshipApplication) => void;
  isLoading: boolean;
  error: string;
}

export default function ApplicationsList({
  applications,
  selectedApp,
  onSelectApp,
  isLoading,
  error,
}: ApplicationsListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b-2 border-light-red border-opacity-20 bg-background">
        <h2 className="text-2xl font-bold text-fontcolor">
          Scholarship Applications
        </h2>
        <p className="text-sm text-gray mt-1">
          Total: {applications.length}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-light-red bg-opacity-10 text-light-red text-sm border-l-4 border-light-red">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-6 text-center text-gray">
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-6 text-center text-gray">
          No applications yet
        </div>
      ) : (
        <div className="divide-y max-h-96 overflow-y-auto">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelectApp(app)}
              className={`w-full text-left p-4 hover:bg-background transition ${
                selectedApp?.id === app.id ? "bg-background border-l-4 border-accent-color-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-fontcolor">
                    {app.applicant_name}
                  </p>
                  <p className="text-xs text-gray truncate">
                    {app.email}
                  </p>
                  <p className="text-xs text-gray mt-1">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`ml-2 inline-flex items-center justify-center text-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  app.status === "awarded" ? "bg-green-100 text-green-800" :
                  app.status === "rejected" ? "bg-light-red bg-opacity-20 text-light-red" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
