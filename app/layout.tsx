import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATP IPB",
  description: "Sistem Informasi Agribusiness and Technology Park IPB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/*  dasar HTML dan Body */}
      <body className="min-h-screen flex flex-col bg-white">
        {children} 
      </body>
    </html>
  );
}