import Navbar from "@/components/Header";
import Footer from "@/components/Footer";

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