"use client";

import React, { useState, useEffect, useRef } from "react";

export const DonateButton = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(true);

      // Clear existing timeout if scrolling continues
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set timeout to reset opacity after 100ms of no scrolling
      scrollTimeout.current = setTimeout(() => {
        setIsScrolled(false);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <a
      href="/donate"
      title="Support our mission"
      className={`
        fixed bottom-6 right-6 z-50 flex items-center font-raleway gap-2 bg-accent-color-primary text-white font-semibold 
        px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] text-sm md:px-6 md:py-3 md:text-base
        ${isScrolled ? "opacity-30" : "opacity-100"}
      `}
      style={{ pointerEvents: "auto" }}
    >
      <span>Donate</span>
    </a>
  );
};
