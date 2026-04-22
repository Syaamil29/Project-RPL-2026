import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith("/admin")) {
    // Temporary: skip auth/role protection for all /admin routes.
    return NextResponse.next({ request })
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ["/admin/:path*"],

}

