import Navbar from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 300; // Meng-cache footer selama 5 menit untuk efisiensi query database Supabase

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar /> {/* Muncul di Landing Page, Katalog, Profil */}
      <main className="flex-1">
        {children}
      </main>
      <Footer /> {/* Muncul di Landing Page, Katalog, Profil */}
    </>
  );
}