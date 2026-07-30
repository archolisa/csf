"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  userRole: string;
}

export default function AdminSidebar({ adminName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      submenu: null,
    },
    {
      label: "Applicants",
      href: "/admin/applicants",
      icon: Users,
      submenu: [
        { label: "All Applicants", href: "/admin/applicants" },
        { label: "Awarded", href: "/admin/applicants/awarded" },
      ],
    },
    {
      label: "Documents",
      href: "/admin/documents",
      icon: FileText,
      submenu: [
        { label: "Applicant Documents", href: "/admin/documents" },
        { label: "Admin Storage", href: "/admin/documents/storage" },
      ],
    },

    {
      label: "Activity",
      href: "/admin/activity",
      icon: Activity,
      submenu: null,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      submenu: null,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      submenu: null,
    },
  ].filter((item) => {
    if (item.label === "Users" && userRole !== "super_admin") return false;
    return true;
  });

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const handleLogout = () => {
    document.cookie = "adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-[70] bg-white text-slate-800 p-2 rounded-xl shadow-lg border border-slate-200"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl transition-transform duration-300 z-[60] ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700 relative">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 pr-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <Image 
                src="/assets/cyril-susanna-logo.png" 
                alt="CSF Logo" 
                width={36} 
                height={36} 
                className="object-contain" 
              />
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight text-sm">Cyril & Susanna Foundation</h2>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-1/2 -translate-y-1/2 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        expandedMenu === item.label || active
                          ? "bg-red-500 text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span className="flex items-center space-x-3">
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandedMenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedMenu === item.label && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subitem.href, true)
                                ? "bg-red-600 text-white"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                            }`}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-red-500 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700 p-4">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{adminName}</p>
            <p className="text-xs text-slate-400 capitalize">{userRole.replace("_", " ")}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
