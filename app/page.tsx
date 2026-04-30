"use client"

import Image from "next/image";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/auth"

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Tentang", href: "#tentang" },
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Produk", href: "#produk" },
  { label: "Riwayat", href: "/reservasi/riwayat" },
] as const

const facilities = [
  {
    id: 1,
    title: "Green House Nursery",
    description: "Belajar budidaya tanaman dengan teknologi modern.",
    capacity: 20,
    image: "/images-1-facilities.png",
  },
  {
    id: 2,
    title: "Hydroponic Lab",
    description: "Eksplorasi sistem hidroponik berbasis teknologi presisi.",
    capacity: 25,
    image: "/images-1-facilities.png",
  },
  {
    id: 3,
    title: "Biotech Lab",
    description: "Riset bioteknologi untuk inovasi pertanian modern.",
    capacity: 15,
    image: "/images-1-facilities.png",
  },
];

const products = [
  {
    id: 1,
    title: "Bayam Hijau",
    price: "Rp 6.000/ikat",
    reviews: 120,
    image: "/images-1-facilities.png",
  },
  {
    id: 2,
    title: "Bayam Hijau",
    price: "Rp 6.000/ikat",
    reviews: 120,
    image: "/images-1-facilities.png",
  },
  {
    id: 3,
    title: "Bayam Hijau",
    price: "Rp 6.000/ikat",
    reviews: 120,
    image: "/images-1-facilities.png",
  },
  {
    id: 4,
    title: "Bayam Hijau",
    price: "Rp 6.000/ikat",
    reviews: 120,
    image: "/images-1-facilities.png",
  },
];

const langkahReservasi = [
  {
    step: "1",
    title: "Isi Form Reservasi",
    description: "Lengkapi data kunjungan melalui form online dengan mudah.",
  },
  {
    step: "2",
    title: "Tunggu Konfirmasi",
    description: "Tim ATP IPB akan meninjau pengajuan dan mengirim konfirmasi.",
  },
  {
    step: "3",
    title: "Kunjungi ATP IPB",
    description: "Datang sesuai jadwal untuk pengalaman kunjungan yang terarah.",
  },
] as const

const contactItems = [
  {
    label: "Alamat",
    value:
      "Jl. Carang Pulang No. 1, Cikarawang, Kec. Dramaga, Bogor 16680",
  },
  {
    label: "Jam Operasional",
    value: "Senin - Jumat (08.00 - 16.00)",
  },
  {
    label: "Telepon",
    value: "+62 85733392949",
    href: "tel:+6285733392949",
  },
  {
    label: "Email",
    value: "atp@apps.ipb.ac.id",
    href: "mailto:atp@apps.ipb.ac.id",
  },
];

const quickLinks = [
  { label: "IPB Official", href: "#" },
  { label: "Lembaga Pengembangan Agromaritim", href: "#" },
  { label: "SobaTani IPB", href: "#" },
];

export default function HomePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("home")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

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

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const email = user?.email ?? null
      setUserEmail(email)
      setIsAdminUser(email ? isAdmin(email) : false)
      setAuthLoading(false)
    }

    void syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null
      setUserEmail(email)
      setIsAdminUser(email ? isAdmin(email) : false)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleReservasi = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
        redirectTo: `${window.location.origin}/auth/callback`,
       },
    })
    } else {
      window.location.href = "/reservasi"
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleAdminRedirect = () => {
    console.log("redirecting to admin...")
    router.push("/admin/reservasi")
  }

  const [productList, setProductList] = useState([
  { id: 1, nama: "Beras Organik", stock: 15, src: "/beras.png"},
  { id: 2, nama: "Kacang Organik", stock: 15, src: "/kacang.jpg" },
  { id: 3, nama: "Bayam Organik", stock: 15, src: "/bayam.jpg" },
  { id: 4, nama: "Wortel Manis", stock: 25, src: "/wortel.jpg" },
  { id: 5, nama: "Tomat Ceri", stock: 10, src: "/tomat.jpg" },
  { id: 6, nama: "Sayur Kale", stock: 5, src: "/kale.jpg" }
]);

  return (
    <main id="beranda" className="min-h-screen bg-slate-50 text-slate-800">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-blue-800 bg-blue-900 text-white shadow-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <Link href="/" className="leading-tight">
            <p className="text-2xl font-bold tracking-tight">ATP IPB University</p>
            <p className="text-sm text-blue-100">Agribusiness and Technology Park</p>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-lg font-medium underline-offset-8 transition duration-200 hover:text-white hover:underline ${
                  activeSection === item.href.replace("#", "")
                    ? "text-white underline"
                    : "text-blue-100"
                }`}
              >
                {item.label}
              </a>
            ))}

            <button
              type="button"
              onClick={() => void handleReservasi()}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
            >
              Reservasi
            </button>

            {userEmail ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-100">{userEmail}</span>
                  {isAdminUser ? (
                    <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-900">
                      Admin
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void handleGoogleLogin()}
                className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Login with Google
              </button>
            )}
          </nav>
        </div>
      </header>

      <section id="home" className="relative w-full bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="w-full text-center px-0">

          {/* IMAGE SLIDER SIMPLE (NO ERROR VERSION) */}
          <div className="mx-auto mb-8 w-full max-w-4xl overflow-hidden rounded-xl shadow-lg">

            <div className="relative w-full h-[300px]">
              <Image
                src="/hero-image.png"
                alt="ATP 1"
                fill
                className="object-cover"
              />
            </div>

          </div>

          {/* ADMIN */}
          {authLoading ? null : isAdminUser ? (
            <div className="mx-auto mb-8 w-full max-w-3xl rounded-xl border bg-white p-6 text-left shadow-lg">
              <h2 className="text-2xl font-bold text-blue-900">Admin Dashboard</h2>
              <button
                onClick={handleAdminRedirect}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white"
              >
                Buka Admin Dashboard
              </button>
            </div>
          ) : null}

          {/* HEADLINE */}
          <h1 className="text-4xl font-bold text-blue-900 sm:text-5xl">
            Wisata Edukasi dan Inovasi<br/> 
            Pertanian di ATP IPB
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Jelajahi fasilitas Agribusiness Technology Park, lihat produk unggulan,<br/>
            dan lakukan reservasi kunjungan secara online dengan mudah.
          </p>

          {/* BUTTON */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => void handleReservasi()}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Reservasi Sekarang
            </button>

            <Link
              href="/reservasi/riwayat"
              className="rounded-lg border border-blue-600 px-6 py-3 text-blue-700 hover:bg-blue-100"
            >
              Cek Riwayat
            </Link>
          </div>

        </div>
      </section>

      <section
        id="tentang"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
      >
        <div className="grid items-center gap-10 rounded-2xl bg-blue-50 p-8 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">

          {/* TEXT SIDE */}
          <div className="flex flex-col gap-6">

            <h2 className="text-4xl font-bold text-blue-900 sm:text-5xl leading-tight">
              Tentang ATP
            </h2>

            <p className="text-base leading-relaxed text-slate-700">
              Agribusiness and Technology Park (ATP) IPB merupakan pusat pengembangan
              pertanian modern yang menggabungkan edukasi, inovasi, dan produksi.
              ATP menyediakan fasilitas pembelajaran, kunjungan edukatif, serta produk
              pertanian unggulan.
            </p>

            <button
              type="button"
              className="w-fit rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Detail Profil
            </button>

          </div>

          {/* IMAGE SIDE */}
          <div className="relative h-[300px] w-full overflow-hidden rounded-xl md:h-[420px]">
            <Image
              src="/tentang-image.png"
              alt="ATP IPB"
              fill
              className="object-cover"
            />
          </div>

        </div>
      </section>

      <section
        id="fasilitas"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6"
      >
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 sm:text-4xl">
            Fasilitas
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Jelajahi fasilitas utama ATP IPB <br/>
            untuk kunjungan edukatif dan penelitian
          </p>
        </div>

        {/* GRID */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {facilities.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* IMAGE */}
              <div className="relative h-[220px] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-slate-700">
                    👤 {item.capacity}
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>

                {/* BUTTON */}
                <button
                  className="mt-4 w-full rounded-full bg-blue-700 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Detail
                </button>
              </div>
            </article>
          ))}

        </div>

        {/* FOOTER BUTTON */}
        <div className="mt-12 flex justify-center">
          <button className="rounded-full bg-blue-700 px-8 py-3 text-white font-semibold hover:bg-blue-800">
            Lihat Semua Fasilitas
          </button>
        </div>
      </section>

      <section id="produk" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-2xl font-bold text-blue-900">Produk ATP IPB</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((item) => (
              <Link
                key={item.id}
                href={`/katalog/${item.id}`}
                className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={item.src}
                    alt={item.nama}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex flex-col flex-grow justify-between">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">{item.nama}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">Stok: {item.stock}</p>
                  <span className="mt-3 text-sm font-semibold text-blue-800">Lihat detail →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 w-full text-center">
            <Link
              href="/katalog"
              className="inline-block text-xl font-bold text-slate-900 transition-all hover:text-slate-900 hover:underline hover:underline-offset-4"
            >
              Selengkapnya
            </Link>
          </div>
          {/* <p className="mt-3 text-slate-600">
            Section produk akan menampilkan katalog produk unggulan ATP IPB.
            Konten detail produk bisa ditambahkan pada tahap berikutnya.
          </p> */}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-4xl font-bold text-blue-900">Cara Reservasi</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {langkahReservasi.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* <section id="kontak" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl bg-blue-900 p-6 text-blue-50 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Kontak ATP IPB</h2>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <p>
              <span className="font-semibold">Alamat:</span> Jl. Raya Dramaga, Kampus IPB
              Dramaga, Bogor 16680, Jawa Barat
            </p>
            <p>
              <span className="font-semibold">Telepon:</span> (0251) 8628448
            </p>
            <p>
              <span className="font-semibold">Email:</span> atp@ipb.ac.id
            </p>
          </div>
        </div>
      </section> */}
      <footer className="bg-blue-900 text-white">
      
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-bold">
            Agribusiness and Technology Park
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Pusat inovasi dan edukasi pertanian modern IPB University
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold">Kontak Kami</h3>

          <div className="mt-4 space-y-3 text-sm text-white/80">
            {contactItems.map((item) => (
              <div key={item.label}>
                <p className="font-semibold text-white">{item.label}</p>

                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS + SOCIAL */}
        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>

          <div className="mt-4 space-y-2 text-sm text-white/80">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block hover:text-white hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* SOCIAL */}
          <div className="mt-6">
            <a href="#" className="inline-flex items-center gap-2">
              <Image src="logo.svg" alt="Instagram" width={20} height={20} />
              <span className="text-sm">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/20 py-4 text-center text-xs text-white/70">
        {new Date().getFullYear()} ATP IPB Reservation System. All rights reserved.
      </div>
    </footer>


    </main>
  )
}