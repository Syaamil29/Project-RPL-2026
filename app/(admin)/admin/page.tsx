import Link from "next/link"

const adminMenus = [
  {
    icon: "📋",
    title: "Reservasi",
    description: "Kelola approval/reject reservasi",
    href: "/admin/reservasi",
    cta: "Buka Reservasi",
  },
  {
    icon: "🛠️",
    title: "Landing Page",
    description: "Edit konten fasilitas, produk, dan profil",
    href: "/admin",
    cta: "Kelola Landing",
  },
  {
    icon: "📊",
    title: "Statistik",
    description: "Pantau ringkasan performa dan laporan kunjungan",
    href: "#",
    cta: "Segera Hadir",
  },
] as const

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Kelola seluruh sistem ATP IPB</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adminMenus.map((menu) => (
            <article
              key={menu.title}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-md transition duration-200 hover:scale-[1.01] hover:shadow-lg"
            >
              <p className="text-2xl">{menu.icon}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{menu.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{menu.description}</p>
              <Link
                href={menu.href}
                className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                {menu.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
