"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { MenuSVG, CloseSVG } from "@/app/svgs";
import Image from "next/image";
import Link from "next/link";

export const NavigationBar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/programmes", label: "Programmes" },
    { href: "/scholarships", label: "Scholarships" },
    { href: "/our-sponsor", label: "Our Sponsor" },
    { href: "/team", label: "Team" },
    { href: "/beneficiaries", label: "Beneficiaries" },
    { href: "/contact", label: "Contact Us" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "z-50 w-full fixed top-0 left-0 px-6 lg:px-24 bg-background flex justify-center items-center transition-all duration-300",
        isScrolled ? "h-20" : "h-24"
      )}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo + Text */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/assets/cyril-susanna-logo.png"
            alt="Logo"
            width={isScrolled ? 60 : 70}
            height={isScrolled ? 60 : 70}
            className="transition-all duration-300"
          />
         <div
  className={clsx(
    "flex flex-col items-center sm:items-start justify-center font-montserrat font-semibold text-gray-900 leading-tight transition-all duration-300",
    isScrolled ? "text-base" : "text-lg"
  )}
>
  <span>CYRIL & SUSANNA</span>
  <span className="sm:pl-3 lg:pl-5 xl:pl-5">FOUNDATION</span>
</div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6 text-md font-montserrat">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={clsx(
                "pb-px border-b border-transparent font-semibold hover:text-accent-color-primary",
                pathname === link.href && "text-accent-color-primary active-link"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <MenuSVG />
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={clsx(
            "fixed inset-0 bg-background z-50 transition-transform duration-300 ease-in-out lg:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Close button */}
            <div className="flex justify-end p-6">
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <CloseSVG />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col items-center justify-center flex-1 space-y-8 font-montserrat">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "text-xl font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-accent-color-primary active-link"
                      : "text-gray-900 hover:text-accent-color-primary"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
