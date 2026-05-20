"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { isAdmin } from "@/lib/auth"
import { createBrowserClient as createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"

export function KatalogHeader() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase =
    supabaseUrl && supabaseAnonKey
      ? createClientComponentClient(supabaseUrl, supabaseAnonKey)
      : null

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    if (!supabase) return

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const email = user?.email ?? null
      setUserEmail(email)
      setIsAdminUser(email ? isAdmin(email) : false)
    }

    void syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const email = session?.user.email ?? null
      setUserEmail(email)
      setIsAdminUser(email ? isAdmin(email) : false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b border-blue-800 bg-blue-900 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight">ATP IPB University</p>
          <p className="text-xs text-blue-100 sm:text-sm">Agribusiness and Technology Park</p>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="rounded-lg border border-blue-500 px-3 py-1.5 text-sm font-semibold text-blue-100 transition hover:bg-blue-800 sm:px-4 sm:py-2"
          >
            Kembali ke Beranda
          </Link>

          {userEmail ? (
            <>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-blue-100 sm:inline">{userEmail}</span>
                {isAdminUser ? (
                  <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-900">
                    Admin
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800 sm:px-4 sm:py-2"
              >
                Logout
              </button>
            </>
          ) : null}
        </nav>
      </div>
      <p className="mx-auto w-full max-w-6xl px-4 pb-3 text-xs text-blue-100 sm:px-6">Katalog Produk</p>
    </header>
  )
}
