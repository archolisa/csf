import { Raleway } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyril & Susanna Foundation",
  icons: [
    {
      rel: "icon",
      url: "https://img.icons8.com/?size=100&id=39020&format=png&color=000000",
    },
  ],
  description:
    "The Official Website of Cyril and Susanna Foundation",
  keywords: [
    "Cyril and Susanna Foundation",
    "C&S Foundation",
    "C&S",
    "Cyril and Susanna Foundation Isuofia",
    "Scholarship Anambra",
    "Scholarship Isuofia",
    "Cyril Susanna"
  ],
  // authors: [{ name: "Cyril and Susanna Foundation", url: "https://cyrilandsusannafoundation.org" }],
  // openGraph: {
  //   title: "Cyril and Susanna Foundation",
  //   description:
  //     "The Official Website of Cyril and Susanna Foundation",
  //   url: "https://cyrilandsusannafoundation.org/",
  //   siteName: "Cyril and Susanna Foundation",
  //   images: [
  //     {
  //       url: "../public/assets/cyril-susanna-logo.png",
  //       width: 800,
  //       height: 600,
  //     },
  //   ],
  //   locale: "en_US",
  //   type: "website",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Cyril and Susanna Foundation",
  //   description:
  //     "The Official Website of Cyril and Susanna Foundation",
  //   images: ["../public/assets/cs_logo.png"],
  // },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: true,
      follow: false,
    },
  },
};

// The fonts
const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
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
      <body className={`${raleway.variable} ${breeSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
