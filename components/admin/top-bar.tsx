"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Users,
  FileText,
  X
} from "lucide-react";

interface AdminTopBarProps {
  adminName: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
}

export default function AdminTopBar({
  adminName,
  onSearch,
  notificationCount = 0,
}: AdminTopBarProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<{ applicants: any[], documents: any[] } | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    
    function handleScroll() {
      if (showProfile) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [showProfile]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleLogout = () => {
    document.cookie = "adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-rose-100 shadow-[0_4px_30px_rgba(225,29,72,0.06)] bg-gradient-to-r from-red-50/40 via-white/60 to-rose-50/40">
      <div className="pl-16 pr-6 md:px-6 py-4 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative z-50">
          <div className="relative" ref={searchContainerRef}>
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search applicants, documents, files..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2 && !searchResults) {
                  handleSearch(searchQuery);
                }
              }}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 bg-white/80 backdrop-blur-sm shadow-inner text-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown */}
            {(isSearching || searchResults) && (
              <div className="absolute top-full mt-2 left-0 w-full md:w-[150%] max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] flex flex-col">
                <div className="overflow-y-auto p-2">
                  {isSearching && (
                    <div className="p-6 text-center text-sm font-semibold text-slate-400 animate-pulse">
                      Searching...
                    </div>
                  )}

                  {!isSearching && searchResults && (
                    <>
                      {searchResults.applicants.length === 0 && searchResults.documents.length === 0 ? (
                        <div className="p-6 text-center text-sm font-semibold text-slate-500">
                          No results found for &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {searchResults.applicants.length > 0 && (
                            <div>
                              <h4 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicants</h4>
                              <div className="space-y-1">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {searchResults.applicants.map((app: any) => (
                                  <Link
                                    key={app.id}
                                    href={`/admin/applicants/${app.id}`}
                                    onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                      <Users size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">{app.name}</p>
                                      <p className="text-xs text-slate-500 truncate">{app.email}</p>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">{app.status.replace('_', ' ')}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.documents.length > 0 && (
                            <div className={searchResults.applicants.length > 0 ? "pt-2 border-t border-slate-100" : ""}>
                              <h4 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Documents</h4>
                              <div className="space-y-1">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {searchResults.documents.map((doc: any) => (
                                  <Link
                                    key={doc.id}
                                    href={`/admin/documents`}
                                    onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                      <FileText size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                                      <p className="text-xs text-slate-500 truncate">{doc.category || "General"}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {adminName}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    window.location.href = "/admin/settings";
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    window.location.href = "/admin/profile";
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Profile
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
