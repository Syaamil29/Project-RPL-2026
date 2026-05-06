import type { ReactNode } from "react"
import AdminNavbar from "@/components/AdminNavbar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNavbar />
      <main className="pt-4">{children}</main>
    </div>
  )
}
