"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const menuItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profil", href: "/admin/profil" },
  { label: "Katalog", href: "/admin/katalog" },
  { label: "Kegiatan", href: "/admin/kegiatan" },
  { label: "Reservasi", href: "/admin/reservasi" },
  { label: "Jadwal", href: "/admin/jadwal" },
] as const

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

// Ambil data foto profil Google dari Supabase Session
  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;

        if (user && isMounted) {
          const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? "Admin";
          const avatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;
          
          setUserName(name);
          setUserAvatar(avatar);
        }
      } catch (err: any) {
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          
          <div className="flex items-center justify-start gap-2 md:w-[250px] sm:gap-4">
            {/* Tombol Mobile Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-slate-700 focus:outline-none md:hidden"
              aria-label="Buka Menu"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* LOGO GABUNGAN (IPB + Agribusiness) */}
            <Link href="/admin" className="transition hover:opacity-80">
              <img 
                src="/logo-ipb.svg" 
                alt="ATP IPB University" 
                className="h-10 w-auto object-contain sm:h-12" 
              />
            </Link>
          </div>

          {/* NAVIGASI MENU */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {menuItems.map((item) => {
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
                      ? "font-bold text-[#2D24B5]"
                      : "font-semibold text-slate-600 hover:text-[#2D24B5]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* BAGIAN KANAN: PROFIL & LOGOUT */}
          <div className="flex items-center justify-end gap-6 md:w-[250px]">
            
            {/* Avatar & Badge Admin Container */}
            <div className="flex flex-col items-center justify-center">
              <div 
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#5A5A5A] ring-2 ring-transparent transition-all hover:ring-blue-200 cursor-pointer"
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
              className="hidden md:block rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <img src="/logo-ipb.svg" alt="IPB Logo" className="h-10 w-auto" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 transition"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-6">
            {menuItems.map((item) => {
              const isActive = 
                item.href === "/admin" 
                  ? pathname === "/admin" 
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold transition-colors ${
                    isActive ? "text-[#2D24B5]" : "text-[#667085] hover:text-[#2D24B5]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Area Profil & Logout di Sidebar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#5A5A5A] ring-2 ring-transparent">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName || "Admin"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#101828] text-sm truncate w-40">{userName || "Admin"}</span>
                    <span className="text-[10px] text-[#2D24B5] font-bold">Admin</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    void handleLogout();
                  }}
                  className="text-left text-lg font-bold text-[#E02424] hover:text-red-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}