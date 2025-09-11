import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 工具集",
  description: "打造智能化的 AI 工具集，帮助您在学习、创作、交流和语音交互等场景中更高效、更好用。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 lg:ml-0 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
