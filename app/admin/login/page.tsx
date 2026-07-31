"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Decorative blurred circles */}
      <div className="absolute top-20 right-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-20"></div>
      <div className="absolute bottom-20 left-[-100px] w-80 h-80 bg-light-red rounded-full blur-[80px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/assets/cyril-susanna-logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-3xl lg:text-4xl font-bold text-fontcolor mb-2">Admin Portal</h1>
          <p className="text-gray text-lg">Cyril & Susanna Foundation</p>
          <p className="text-xs text-gray mt-2">Sign in Below:</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-xl mb-6 font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-fontcolor mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cyrilandsusannafoundation.org"
                className="w-full px-4 py-3 border-2 border-gray border-opacity-20 rounded-xl focus:outline-none focus:border-accent-color-primary transition bg-background placeholder-gray placeholder-opacity-50"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-fontcolor mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray border-opacity-20 rounded-xl focus:outline-none focus:border-accent-color-primary transition bg-background placeholder-gray placeholder-opacity-50"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-color-primary hover:bg-accent-color-secondary text-white font-bold py-3 rounded-xl transition text-base mt-6"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
