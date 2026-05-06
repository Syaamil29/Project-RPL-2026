"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const [activeSection, setActiveSection] = useState("home")
  
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

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

    onScroll(); 
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, []);

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
        // Abaikan silent failure saat user menekan 'Back' secara paksa
      } finally {
        // Pastikan loading state selalu dilepas apapun kondisinya
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
        
        // Pindahkan ke luar agar selalu tereksekusi saat state berubah
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
            userName ? ( 
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 hidden lg:flex">
                  
                  {/* BAGIAN FOTO PROFIL SAJA */}
                  <div 
                    className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 flex-shrink-0 cursor-pointer transition hover:ring-2 hover:ring-[#2D24B5] hover:ring-offset-2" 
                    title={userName} // Tampilkan nama saat di-hover
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

                  {/* BADGE ADMIN (Langsung di sebelah avatar jika admin) */}
                  {isAdminUser && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#2D24B5]">
                      Admin
                    </span>
                  )}

                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-red-50 text-red-600 border border-red-100 px-5 py-2 text-sm font-semibold transition-all hover:bg-red-600 hover:text-white"
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