import { Raleway } from "next/font/google";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import {DonateButton} from "@/components/ui/donate-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyril & Susanna Foundation",
  icons: [
    {
      rel: "icon",
      url: "https://res.cloudinary.com/daxwsoeti/image/upload/v1753216956/favicon_pf2kxu.ico",
    },
  ],
  description:
    "The Official Website of Cyril and Susanna Foundation",
  keywords: [
    "Cyril and Susanna Foundation",
    "C&S Foundation",
    "Cyril Susanna",
    "Cyril and Susanna",
    "Cyril and Susanna Foundation Isuofia",
    "Scholarship Anambra",
    "Scholarship Nigeria",
    "Scholarship Isuofia",
    "Cyril Susanna"
  ],
  authors: [{ name: "Cyril and Susanna Foundation", url: "https://cyrilandsusannafoundation.org" }],
  openGraph: {
    title: "Cyril and Susanna Foundation",
    description:
      "The Official Website of Cyril and Susanna Foundation",
    url: "https://cyrilandsusannafoundation.org/",
    siteName: "Cyril and Susanna Foundation",
    images: [
      {
        url: "https://res.cloudinary.com/daxwsoeti/image/upload/v1753216868/logo_csf_aqtd9o.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyril and Susanna Foundation",
    description:
      "The Official Website of Cyril and Susanna Foundation",
    images: ["https://res.cloudinary.com/daxwsoeti/image/upload/v1753216868/logo_csf_aqtd9o.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// The fonts
const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"], // Include any weights you plan to use
});

const breeSerif = localFont({
  src: "../fonts/BreeSerif-Regular.ttf",
  display: "swap",
  variable: "--font-bree-serif",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${breeSerif.variable} ${montserrat.variable} antialiased`}>
        {children}
        {/* Floating Donate Button */}
        <DonateButton />
      </body>
    </html>
  );
}
