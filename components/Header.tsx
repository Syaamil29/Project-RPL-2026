"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react" // Tambah useCallback
import { supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/auth"

const menuItems = [
  { label: "Home", href: "/#home" },
  { label: "Profil", href: "/#tentang" },
  { label: "Fasilitas", href: "/#fasilitas" }, 
  { label: "Produk", href: "/#produk" },
] as const;

export default function Header() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("home")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 1. Pindahkan handleRouting ke useCallback agar tidak berubah-ubah setiap render
  const handleRouting = useCallback((email: string | null) => {
    if (!email) return;

    const adminStatus = isAdmin(email);

    // Cek apakah ada niat login (intent) yang tersimpan
    const intent = sessionStorage.getItem("loginIntent");

    if (adminStatus) {
      sessionStorage.removeItem("loginIntent");
      // Hanya push jika saat ini tidak di halaman admin untuk mencegah loop
      if (window.location.pathname !== "/admin") {
        router.push("/admin");
      }
    } else if (intent) {
      sessionStorage.removeItem("loginIntent");
      router.push(intent);
    }
  }, [router]);

  // 2. Logika Scroll Spy (Tetap sama)
  useEffect(() => {
    const sections = ["home", "tentang", "fasilitas", "produk"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    const onScroll = () => {
      const viewportPoint = window.scrollY + 120
      let current = "home"
      for (const section of sections) {
        if (viewportPoint >= section.offsetTop) {
          current = section.id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, []);

  // 3. Logika Autentikasi yang AMAN
  useEffect(() => {
    let isMounted = true;

    const getInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        const email = session?.user?.email ?? null;
        setUserEmail(email);
        if (email) handleRouting(email);
        setAuthLoading(false);
      }
    };

    getInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        const email = session?.user?.email ?? null;
        setUserEmail(email);
        
        // Hanya jalankan routing jika terjadi event SIGN_IN
        if (event === "SIGNED_IN" && email) {
          handleRouting(email);
        }
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleRouting]); // Sekarang dependensi ini stabil

  const handleLogout = async () => {
    setUserEmail(null);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGoogleLogin = async () => {
    sessionStorage.setItem("loginIntent", window.location.pathname);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // Fungsi reusable untuk tombol reservasi/riwayat
  const handleProtectedAction = async (targetPath: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      sessionStorage.setItem("loginIntent", targetPath);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      router.push(targetPath);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm transition-all">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" className="flex items-center gap-4 transition hover:opacity-80">
            <img src="/logo-ipb.svg" alt="IPB Logo" className="h-10 w-auto sm:h-12" />
          </Link>
        </div>

        <nav className="font-body hidden items-center gap-8 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-semibold transition duration-300 hover:text-[#2D24B5] ${
                activeSection === item.href.replace("/#", "") ? "text-[#2D24B5]" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="font-body hidden flex-1 items-center justify-end gap-6 md:flex">
          <button
            onClick={() => handleProtectedAction("/reservasi")}
            className="rounded-full bg-[#2D24B5] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
          >
            Reservasi
          </button>

          <button 
            onClick={() => handleProtectedAction("/reservasi/riwayat")}
            className="text-sm font-semibold text-slate-700 transition hover:text-[#2D24B5]"
          >
            Riwayat
          </button>

          <div className="h-5 border-l border-gray-300"></div>

          {!authLoading && (
            userEmail ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 hidden lg:inline">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="rounded-full bg-[#2D24B5] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </header>
  )
}