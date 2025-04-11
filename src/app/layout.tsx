import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoomProvider } from "@/context/LoomContext";
import Header from "@/components/Header";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ToastProvider from "@/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loomify - Loom Transcript Analysis",
  description: "Analyze Loom video transcripts and create tasks automatically",
  keywords: [
    "loom",
    "transcription",
    "task management",
    "trello",
    "automation",
  ],
  authors: [{ name: "Loomify Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ToastProvider>
            <LoomProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <Header />
                <main className="container mx-auto px-4 py-8">{children}</main>
              </div>
            </LoomProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
