"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
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
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("home")
  
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleRouting = useCallback((email: string | null) => {
    if (!email) return;

    const adminStatus = isAdmin(email);
    setIsAdminUser(adminStatus);

    const intent = sessionStorage.getItem("loginIntent");

    if (adminStatus) {
      sessionStorage.removeItem("loginIntent");
      if (window.location.pathname !== "/admin") {
        router.push("/admin");
      }
    } else if (intent) {
      sessionStorage.removeItem("loginIntent");
      router.push(intent);
    }
  }, [router]);

useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      const sectionIds = ["home", "tentang", "fasilitas", "produk"];
      const viewportPoint = window.scrollY + 120;
      let current = "home";

      // Cari elemen secara real-time saat di-scroll
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && viewportPoint >= element.offsetTop) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll(); 
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    const getInitialAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (isMounted) {
          const email = user?.email ?? null;
          const name = user?.user_metadata?.full_name ?? email?.split('@')[0] ?? null; 
          const avatar = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null; 
          
          setUserEmail(email);
          setUserName(name);
          setUserAvatar(avatar);
          
          if (email) {
            setIsAdminUser(isAdmin(email));
            handleRouting(email);
          }
        }
      } catch (error) {
        // Silent failure
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    getInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        const email = session?.user?.email ?? null;
        const name = session?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? null;
        const avatar = session?.user?.user_metadata?.avatar_url ?? session?.user?.user_metadata?.picture ?? null;

        setUserEmail(email);
        setUserName(name);
        setUserAvatar(avatar);
        setIsAdminUser(email ? isAdmin(email) : false);
        
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
  }, [handleRouting]);

  const handleLogout = async () => {
    setUserEmail(null);
    setUserName(null);
    setUserAvatar(null);
    setIsAdminUser(false);
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

  const handleProtectedAction = async (targetPath: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem("loginIntent", targetPath);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      router.push(targetPath);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);

  const checkIsActive = (href: string) => {
    if (pathname === "/") {
      return activeSection === href.replace("/#", "");
    }
    
    if (href === "/#tentang" && pathname.startsWith("/profil")) return true;
    if (href === "/#fasilitas" && pathname.startsWith("/fasilitas")) return true;
    if (href === "/#produk" && (pathname.startsWith("/katalog") || pathname.startsWith("/produk"))) return true;
    
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm transition-all">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          
          <div className="flex flex-1 items-center justify-start gap-2 sm:gap-4">
            {/* Tombol Hamburger Mobile (Hanya muncul di md ke bawah) */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 -ml-1 text-slate-700 focus:outline-none"
                aria-label="Buka Menu"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <Link href="/" className="flex items-center gap-4 transition hover:opacity-80">
              <img src="/logo-ipb.svg" alt="IPB Logo" className="h-10 w-auto sm:h-12" />
            </Link>
          </div>

          {/* Navigasi Desktop (Disembunyikan di Mobile) */}
          <nav className="font-body hidden items-center gap-8 md:flex">
            {menuItems.map((item) => {
              const isActive = checkIsActive(item.href); 
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-semibold transition duration-300 hover:text-[#2D24B5] ${
                    isActive ? "text-[#2D24B5]" : "text-slate-700"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Action Desktop (Disembunyikan di Mobile)  */}
          <div className="font-body flex flex-1 items-center justify-end gap-3 md:gap-6">
            
            {/* Menu Aksi Khusus Desktop */}
            <div className="hidden items-center gap-6 md:flex">
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
            </div>

            {!authLoading && (
              userName ? ( 
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 flex-shrink-0 cursor-pointer transition hover:ring-2 hover:ring-[#2D24B5] hover:ring-offset-2" 
                      title={userName}
                    >
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt={userName} 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isAdminUser && (
                      <span className="hidden md:inline-block rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#2D24B5]">
                        Admin
                      </span>
                    )}
                  </div>
                  {/* Logout di Header HANYA tampil di Desktop (Mobile pindah ke Sidebar) */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:block rounded-full bg-red-50 text-red-600 border border-red-100 px-5 py-2 text-sm font-semibold transition-all hover:bg-red-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="rounded-full bg-[#2D24B5] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
                >
                  Login
                </button>
              )
            )}
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

        {/* List Menu Sidebar */}
        <div className="font-heading flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-6">
            {menuItems.map((item) => {
              const isActive = checkIsActive(item.href); 
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

            <hr className="my-2 border-slate-200" />

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleProtectedAction("/reservasi");
              }}
              className="text-left text-lg font-bold text-[#0a0187] hover:text-[#2D24B5] transition-colors"
            >
              Reservasi
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleProtectedAction("/reservasi/riwayat");
              }}
              className="text-left text-lg font-bold text-[#667085] hover:text-[#2D24B5] transition-colors"
            >
              Riwayat Reservasi
            </button>

            {/* Area Login/Logout di Sidebar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {!authLoading && (
                userName ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                        {userAvatar ? (
                          <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#2D24B5] text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#101828] text-sm truncate w-40">{userName}</span>
                        {isAdminUser && <span className="text-[10px] text-[#2D24B5] font-bold">Admin</span>}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-left text-lg font-bold text-[#E02424] hover:text-red-800 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleGoogleLogin();
                    }}
                    className="text-left text-lg font-bold text-[#2D24B5] hover:text-[#1A156B] transition-colors"
                  >
                    Login
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}