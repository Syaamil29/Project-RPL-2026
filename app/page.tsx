"use client"

import Image from "next/image";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/auth"

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Profil", href: "#tentang" },
  { label: "Fasilitas", href: "#fasilitas" }, 
  { label: "Produk", href: "#produk" },
] as const;

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
    value: "Jl. Carang Pulang No. 1, Cikarawang, Kec. Dramaga, Bogor 16680",
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
  { label: "Lembaga Pengembangan Agromaritim dan Akselerasi Innopreneurship", href: "#" },
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
    // Buat fungsi pembantu agar kode tidak berulang di syncUser dan onAuthStateChange
    const handleRouting = (email: string | null) => {
      if (!email) return;

      const adminStatus = isAdmin(email);
      setIsAdminUser(adminStatus);

      // 1. JIKA ADMIN: Selalu tendang ke dashboard admin
      if (adminStatus) {
        sessionStorage.removeItem("loginIntent"); // Hapus jejak
        router.push("/admin"); // Pastikan path ini konsisten
        return; 
      }

      // 2. JIKA USER BIASA: Cek apakah dia tadi klik tombol Reservasi
      const intent = sessionStorage.getItem("loginIntent");
      if (intent === "/reservasi") {
        sessionStorage.removeItem("loginIntent"); // Bersihkan jejak
        router.push("/reservasi"); // Bawa ke halaman form reservasi
      }
      // Jika intent kosong atau "/", fungsi berhenti di sini,
      // artinya user biasa tetap di halaman Home.
    };

    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? null;
      
      setUserEmail(email);
      handleRouting(email);
      setAuthLoading(false);
    };

    void syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email ?? null;
      
      setUserEmail(email);
      handleRouting(email);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleReservasi = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // User belum login, simpan niatnya bahwa dia ingin ke reservasi
      sessionStorage.setItem("loginIntent", "/reservasi");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      // User sudah login, gunakan router.push agar transisi instan tanpa reload
      router.push("/reservasi");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleGoogleLogin = async () => {
    // User klik login di pojok kanan atas, simpan niat tetap di home
    sessionStorage.setItem("loginIntent", "/");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Data produk ditambahkan harga, rating, dan ulasan agar mapping sempurna
  const [productList, setProductList] = useState([
    { id: 1, nama: "Beras Organik", stock: 15, src: "/beras.png"},
    { id: 2, nama: "Kacang Organik", stock: 15, src: "/kacang.jpg" },
    { id: 3, nama: "Bayam Organik", stock: 15, src: "/bayam.jpg" },
    { id: 4, nama: "Wortel Manis", stock: 25, src: "/wortel.jpg" },
    { id: 5, nama: "Tomat Ceri", stock: 10, src: "/tomat.jpg" },
    { id: 6, nama: "Sayur Kale", stock: 5, src: "/kale.jpg" }
  ]);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700;800&family=Poppins:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .font-heading { font-family: 'DM Sans', sans-serif; }
        .font-body { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm transition-all">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center gap-4 transition hover:opacity-80">
              <img src="/logo-ipb.svg" alt="IPB Logo" className="h-10 w-auto sm:h-12" />
            </Link>
          </div>

          <nav className="font-body hidden items-center gap-8 md:flex">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold transition duration-300 hover:text-[#2D24B5] ${
                  activeSection === item.href.replace("#", "")
                    ? "text-[#2D24B5]"
                    : "text-slate-700"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="font-body hidden flex-1 items-center justify-end gap-6 md:flex">
            <button
              type="button"
              onClick={() => void handleReservasi()}
              className="rounded-full bg-[#2D24B5] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
            >
              Reservasi
            </button>

            <a 
              href="/reservasi/riwayat" 
              className="text-sm font-semibold text-slate-700 transition hover:text-[#2D24B5]"
            >
              Riwayat
            </a>

            <div className="h-5 border-l border-gray-300"></div>

            {userEmail ? (
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleGoogleLogin()}
                className="rounded-full bg-[#2D24B5] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
              >
                Login
              </button>
            )}
          </div>
          
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="w-full bg-white pb-16">
        <div className="relative w-full h-[40vh] min-h-[300px] sm:h-[450px]">
          <Image
            src="/hero-image.png"
            alt="ATP Slider Full"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
             <div className="h-2 w-2 rounded-full bg-[#2D24B5]"></div>
             <div className="h-2 w-2 rounded-full bg-white/70"></div>
             <div className="h-2 w-2 rounded-full bg-white/70"></div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 pt-12 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#1C147A] sm:text-4xl md:text-5xl leading-tight tracking-tight">
            Wisata Edukasi dan Inovasi<br/> 
            Pertanian di ATP IPB
          </h1>

          <p className="font-body mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-600 font-light leading-relaxed">
            Jelajahi fasilitas Agribusiness Technology Park, lihat produk unggulan,<br/>
            dan lakukan reservasi kunjungan secara online dengan mudah.
          </p>

          <div className="font-body mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => void handleReservasi()}
              className="rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white transition-all hover:bg-[#20188A] shadow-sm hover:shadow-md"
            >
              Reservasi Sekarang
            </button>

            <Link
              href="/reservasi/riwayat"
              className="rounded-full border border-[#2D24B5] bg-white px-8 py-3 text-sm md:text-base font-semibold text-[#2D24B5] transition-all hover:bg-blue-50"
            >
              Cek Riwayat Reservasi
            </Link>
          </div>
        </div>
      </section>

      {/* TENTANG SECTION */}
      <section id="tentang" className="w-full bg-[#F5F7FF] py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">

            <div className="flex flex-col gap-5 text-left">
              <h2 className="font-heading text-4xl font-bold text-[#1C147A] sm:text-5xl leading-tight">
                Tentang ATP
              </h2>
              <p className="font-body text-sm md:text-base leading-relaxed text-slate-700">
                Agribusiness and Technology Park (ATP) IPB merupakan pusat pengembangan
                pertanian modern yang menggabungkan edukasi, inovasi, dan produksi.
                ATP menyediakan fasilitas pembelajaran, kunjungan edukatif, serta produk
                pertanian unggulan.
              </p>
              <button
                type="button"
                className="font-body w-fit mt-2 rounded-full bg-[#2D24B5] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]"
              >
                Detail Profil
              </button>
            </div>

            <div className="relative h-[250px] w-full overflow-hidden rounded-2xl md:h-[320px] shadow-md">
              <Image
                src="/tentang-image.png"
                alt="ATP IPB"
                fill
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* FASILITAS SECTION */}
      <section id="fasilitas" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1C147A]">
            Fasilitas
          </h2>
          <p className="font-body mx-auto mt-2 max-w-xl text-sm md:text-base text-slate-600">
            Jelajahi fasilitas utama ATP IPB untuk kunjungan edukatif dan penelitian
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {facilities.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading text-base md:text-lg font-bold text-[#1C147A]">
                    {item.title}
                  </h3>
                  {/* LOGO ORANG DIKEMBALIKAN */}
                  <div className="font-body flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">
                    👤 {item.capacity}
                  </div>
                </div>

                <p className="font-body text-xs md:text-sm text-slate-600 flex-1 line-clamp-2">
                  {item.description}
                </p>

                <button
                  className="font-body mt-5 w-full rounded-full bg-[#2D24B5] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#20188A]"
                >
                  Detail
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button className="font-body rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]">
            Lihat Semua Fasilitas
          </button>
        </div>
      </section>

{/* PRODUK SECTION */}
      <section id="produk" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="font-body text-sm text-slate-500 mb-1">Paling Populer</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1C147A]">
            Produk Kami
          </h2>
        </div>
          
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Mapping hanya 4 item teratas */}
          {productList.slice(0,4).map((item) => (
            <Link
              key={item.id}
              href={`/katalog/${item.id}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              {/* Gambar Produk */}
              <div className="aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.src}
                  alt={item.nama}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Konten Card (Nama, Stok, Detail) */}
              <div className="font-body p-4 flex flex-col flex-grow justify-between">
                <h3 className="font-heading text-sm md:text-base font-bold text-slate-900 line-clamp-2">
                  {item.nama}
                </h3>
                
                {/* Flex antara Stok dan Teks Detail */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-slate-500">
                    Stok: {item.stock}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-[#2D24B5] transition-colors group-hover:text-[#1C147A]">
                    Detail &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/katalog"
            className="font-body rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]"
          >
            Produk Lainnya
          </Link>
        </div>
      </section>

      {/* CARA RESERVASI SECTION */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl font-bold text-[#1C147A]">Cara Reservasi</h2>
        
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {langkahReservasi.map((item) => (
            <article
              key={item.step}
              className="flex flex-col items-center justify-center rounded-2xl bg-[#EEF2FF] p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-sm"
            >
              <div className="font-body flex h-10 w-10 items-center justify-center rounded-full bg-[#2D24B5] text-sm font-bold text-white shadow-sm">
                {item.step}
              </div>
              <h3 className="font-heading mt-4 text-lg font-bold text-[#1C147A]">{item.title}</h3>
              <p className="font-body mt-2 text-xs md:text-sm text-[#1C147A]/80 leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

{/* LOKASI KAMI SECTION */}
      <section id="lokasi" className="w-full bg-white py-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1C147A]">
              Lokasi Kami
            </h2>
            <p className="font-body mt-2 text-sm md:text-base text-slate-600">
              Kunjungi kami di Agribusiness and Technology Park IPB University
            </p>
          </div>

          {/* Container Map dengan Shadow dan Rounded */}
          <div className="w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-lg border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.788307145985!2d106.73251870000001!3d-6.5483918999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c357db1b8b03%3A0xd67648ed8dcc8e14!2sAgribusiness%20and%20Technology%20Park%20(ATP)%20IPB!5e0!3m2!1sid!2sid!4v1777529789420!5m2!1sid!2sid"
              className="w-full h-full border-0 grayscale transition-all duration-700 hover:grayscale-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Info Singkat Alamat di Bawah Map */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-[#F5F7FF] p-6 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="text-2xl">📍</div>
              <div>
                <h4 className="font-heading font-bold text-[#1C147A]">Alamat Lengkap</h4>
                <p className="font-body text-sm text-slate-600 mt-1">
                  Jl. Carang Pulang No. 1, Cikarawang, Kec. Dramaga, Bogor 16680
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#F5F7FF] p-6 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="text-2xl">🕒</div>
              <div>
                <h4 className="font-heading font-bold text-[#1C147A]">Jam Operasional</h4>
                <p className="font-body text-sm text-slate-600 mt-1">
                  Senin - Jumat: 08.00 - 16.00 WIB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER: Dikembalikan ke layout awal (3 kolom terpisah) & Warna Gelap Menarik */}
      <footer className="bg-[#231896] text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">

          {/* BRAND */}
          <div>
            <h2 className="font-heading text-xl font-bold tracking-wide">
              Agribusiness and Technology Park
            </h2>
            <p className="font-body mt-4 text-sm text-white/80 leading-relaxed">
              Pusat inovasi dan edukasi pertanian modern IPB University. Menghubungkan riset akademik dengan praktik agrobisnis nyata.
            </p>
          </div>

          {/* CONTACT */}
          <div className="font-body">
            <h3 className="font-heading text-lg font-semibold text-white">Kontak Kami</h3>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              {contactItems.map((item) => (
                <div key={item.label}>
                  <p className="font-semibold text-white">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="hover:text-blue-300 hover:underline transition">
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
          <div className="font-body">
            <h3 className="font-heading text-lg font-semibold text-white">Quick Links</h3>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              {quickLinks.map((link) => (
                <a key={link.label} href={link.href} className="block hover:text-white hover:underline">
                  {link.label}
                </a>
              ))}
            </div>

            {/* SOCIAL */}
            <div className="mt-6">
              <a href="#" className="inline-flex items-center gap-2 hover:opacity-80 transition">
                <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} className="invert" />
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="font-body border-t border-white/10 bg-[#181070] py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} ATP IPB Reservation System. All rights reserved.
        </div>
      </footer>

    </main>
  )
}