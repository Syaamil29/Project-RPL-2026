import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isAdmin } from "@/lib/auth" // Pastikan path ini sesuai dengan lokasi auth.ts kamu

export async function middleware(request: NextRequest) {
  // 1. Buat response awal
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inisialisasi Supabase Client untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Verifikasi Token ke Server Supabase (Sangat Aman)
  const { data: { user } } = await supabase.auth.getUser()

  const isPathAdmin = request.nextUrl.pathname.startsWith("/admin")

  // 4. Logika Proteksi Halaman Admin
  if (isPathAdmin) {
    // Jika user belum login, ATAU emailnya bukan admin (Farrel/kamu)
    if (!user || !user.email || !isAdmin(user.email)) {
      // Tendang kembali ke halaman utama (Landing Page)
      const url = request.nextUrl.clone()
      url.pathname = "/" 
      return NextResponse.redirect(url)
    }
  }

  // Penting: Kembalikan supabaseResponse agar token di cookie bisa terus diperbarui
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Middleware akan berjalan di semua route KECUALI:
     * - _next/static (file statis Next.js)
     * - _next/image (optimasi gambar Next.js)
     * - favicon.ico, logo, dll (file aset statis)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}