"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// Sesuaikan kapitalisasi dengan gambar (Title Case)
const menuItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profil", href: "/admin/profil" },
  { label: "Fasilitas", href: "/admin/fasilitas" },
  { label: "Katalog", href: "/admin/katalog" },
  { label: "Reservasi", href: "/admin/reservasi" },
  { label: "Jadwal", href: "/admin/jadwal" },
] as const

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Ambil data foto profil Google dari Supabase Session
// Ambil data foto profil Google dari Supabase Session
  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        // Pindahkan ke dalam blok try
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error; // Lempar error jika ada masalah lain

        if (user && isMounted) {
          const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? "Admin";
          const avatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;
          
          setUserName(name);
          setUserAvatar(avatar);
        }
      } catch (err: any) {
        // Tangkap error "lock" agar tidak membuat aplikasi crash
        if (err?.message?.includes("stole it") || err?.name === "LockAcquisitionError") {
          console.warn("Supabase lock warning diabaikan.");
        } else {
          console.error("Gagal mengambil data user:", err);
        }
      }
    };

    fetchUser();
    
    return () => { 
      isMounted = false; 
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* LOGO GABUNGAN (IPB + Agribusiness) */}
        <div className="flex w-[250px] items-center justify-start">
          <Link href="/admin" className="transition hover:opacity-80">
            <img 
              src="/logo-ipb.svg" 
              alt="ATP IPB University" 
              className="h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* NAVIGASI MENU */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {menuItems.map((item) => {
            // Logika active: exact match untuk dashboard, startsWith untuk sisanya
            const isActive = 
              item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm transition-all ${
                  isActive
                    ? "font-bold text-slate-900"
                    : "font-semibold text-slate-600 hover:text-[#2D24B5]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* BAGIAN KANAN: PROFIL & LOGOUT */}
        <div className="flex w-[250px] items-center justify-end gap-6">
          
          {/* Avatar & Badge Admin Container */}
          <div className="flex flex-col items-center justify-center">
            <div 
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#5A5A5A] ring-2 ring-transparent transition-all hover:ring-blue-200"
              title={userName || "Admin"}
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="Admin Avatar" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                // Fallback icon seperti di gambar referensi (Icon User default)
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              )}
            </div>
            {/* Badge Admin */}
            <span className="mt-1 rounded-full bg-[#E0E0F8] px-2.5 py-0.5 text-[10px] font-bold text-[#2D24B5]">
              Admin
            </span>
          </div>

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
          >
            Logout
          </button>

        </div>

        {/* Tombol Mobile Menu (Opsional jika layar kecil) */}
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 md:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
    </header>
  )
}