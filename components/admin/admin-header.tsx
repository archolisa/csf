"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AdminHeaderProps {
  adminName: string;
}

export default function AdminHeader({ adminName }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear session cookie
    document.cookie = "adminSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-24 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src="/assets/cyril-susanna-logo.png"
            alt="Logo"
            width={50}
            height={50}
          />
          <div>
            <h1 className="text-2xl font-bold text-accent-color-primary">Admin Dashboard</h1>
            <p className="text-xs text-gray">Welcome, {adminName}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-light-red hover:bg-accent-color-secondary text-white font-semibold px-6 py-2 rounded-lg"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
