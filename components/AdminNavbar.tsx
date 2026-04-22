"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const menuItems = [
  { label: "Reservasi", href: "/admin/reservasi" },
  { label: "Landing Page", href: "/" },
] as const

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-blue-900 text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/admin" className="leading-tight">
          <p className="text-lg font-semibold tracking-tight sm:text-xl">
            ATP IPB University
          </p>
          <p className="text-xs text-blue-100 sm:text-sm">
            Agribusiness and Technology Park
          </p>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin/reservasi"
                ? pathname.startsWith("/admin/reservasi")
                : pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`border-b-2 pb-1 text-sm font-medium transition ${
                  isActive
                    ? "border-white font-bold text-white"
                    : "border-transparent text-blue-100 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-white md:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
    </header>
  )
}
