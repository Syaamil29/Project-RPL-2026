"use client"

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const facilities = [
  { id: 1, title: "Green House Nursery", description: "Belajar budidaya tanaman dengan teknologi modern.", capacity: 20, image: "/images-1-facilities.png" },
  { id: 2, title: "Hydroponic Lab", description: "Eksplorasi sistem hidroponik berbasis teknologi presisi.", capacity: 25, image: "/images-1-facilities.png" },
  { id: 3, title: "Biotech Lab", description: "Riset bioteknologi untuk inovasi pertanian modern.", capacity: 15, image: "/images-1-facilities.png" },
];

const langkahReservasi = [
  { step: "1", title: "Isi Form Reservasi", description: "Lengkapi data kunjungan melalui form online dengan mudah." },
  { step: "2", title: "Tunggu Konfirmasi", description: "Tim ATP IPB akan meninjau pengajuan dan mengirim konfirmasi." },
  { step: "3", title: "Kunjungi ATP IPB", description: "Datang sesuai jadwal untuk pengalaman kunjungan yang terarah." },
];

export default function HomePage() {
  const router = useRouter();
  
  const [productList] = useState([
    { id: 1, nama: "Beras Organik", stock: 15, src: "/beras.png"},
    { id: 2, nama: "Kacang Organik", stock: 15, src: "/kacang.jpg" },
    { id: 3, nama: "Bayam Organik", stock: 15, src: "/bayam.jpg" },
    { id: 4, nama: "Wortel Manis", stock: 25, src: "/wortel.jpg" },
  ]);

  const handleReservasiHero = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      sessionStorage.setItem("loginIntent", "/reservasi");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      router.push("/reservasi");
    }
  };

  const handleCekRiwayat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      sessionStorage.setItem("loginIntent", "/reservasi/riwayat");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      router.push("/reservasi/riwayat");
    }
  };

  return (
    <main className="w-full bg-white text-slate-800">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700;800&family=Poppins:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        .font-heading { font-family: 'DM Sans', sans-serif; }
        .font-body { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* HERO SECTION */}
      <section id="home" className="w-full bg-white pb-16">
        <div className="relative w-full h-[40vh] min-h-[300px] sm:h-[450px]">
          <Image src="/hero-image.png" alt="ATP Slider Full" fill className="object-cover" priority />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
             <div className="h-2 w-2 rounded-full bg-[#2D24B5]"></div>
             <div className="h-2 w-2 rounded-full bg-white/70"></div>
             <div className="h-2 w-2 rounded-full bg-white/70"></div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 pt-12 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#1F17A1] sm:text-4xl md:text-5xl leading-tight tracking-tight">
            Wisata Edukasi dan Inovasi<br/> Pertanian di ATP IPB
          </h1>
          <p className="font-body mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-600 font-light leading-relaxed">
            Jelajahi fasilitas Agribusiness Technology Park, lihat produk unggulan,<br/>
            dan lakukan reservasi kunjungan secara online dengan mudah.
          </p>

          <div className="font-body mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => void handleReservasiHero()}
              className="rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white transition-all hover:bg-[#20188A] shadow-sm hover:shadow-md"
            >
              Reservasi Sekarang
            </button>
            {/*  fungsi handleCekRiwayat */}
            <button
              onClick={() => void handleCekRiwayat()}
              className="rounded-full border border-[#2D24B5] bg-white px-8 py-3 text-sm md:text-base font-semibold text-[#2D24B5] transition-all hover:bg-blue-50"
            >
              Cek Riwayat Reservasi
            </button>
          </div>
        </div>
      </section>

      {/* TENTANG SECTION */}
      <section id="tentang" className="w-full bg-[#F5F7FF] py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-5 text-left">
              <h2 className="font-heading text-4xl font-bold text-[#1F17A1] sm:text-5xl leading-tight">
                Tentang ATP
              </h2>
              <p className="font-body text-sm md:text-base leading-relaxed text-slate-700">
                Agribusiness and Technology Park (ATP) IPB merupakan pusat pengembangan
              pertanian modern yang menggabungkan edukasi, inovasi, dan produksi.
              ATP menyediakan fasilitas pembelajaran, kunjungan edukatif, serta produk
              pertanian unggulan.
              </p>
              <Link href="/profil" className="font-body w-fit mt-2 rounded-full bg-[#2D24B5] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]">
                Detail Profil
              </Link>
            </div>
            <div className="relative h-[250px] w-full overflow-hidden rounded-2xl md:h-[320px] shadow-md">
              <Image src="/tentang-image.png" alt="ATP IPB" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FASILITAS SECTION */}
      <section id="fasilitas" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 bg-white">
        <div className="text-center">
          {/* */}
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">
            Fasilitas
          </h2>
          
          {/* */}
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Jelajahi fasilitas utama ATP IPB <br/>
            untuk kunjungan edukatif dan penelitian
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {facilities.map((item) => (
            <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading text-base md:text-lg font-bold text-[#1F17A1]">{item.title}</h3>
                  <div className="font-body flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">
                    👤 {item.capacity}
                  </div>
                </div>
                <p className="font-body text-xs md:text-sm text-slate-600 flex-1 line-clamp-2">{item.description}</p>
                <button className="font-body mt-5 w-full rounded-full bg-[#2D24B5] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#20188A]">Detail</button>
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

      {/* PRODUK SECTION */}
      <section id="produk" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 bg-white">
        <div className="text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">Produk Kami</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {productList.map((item) => (
            <Link key={item.id} href={`/katalog/${item.id}`} className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="aspect-square w-full bg-slate-100 overflow-hidden">
                <img src={item.src} alt={item.nama} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="font-body p-4 flex flex-col flex-grow justify-between">
                <h3 className="font-heading text-sm md:text-base font-bold text-[#1F17A1] line-clamp-2">{item.nama}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-slate-500">Stok: {item.stock}</span>
                  <span className="text-xs md:text-sm font-bold text-[#2D24B5] transition-colors group-hover:text-[#1F17A1]">Detail &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/katalog" className="font-body rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]">
            Produk Lainnya
          </Link>
        </div>
      </section>

      {/* CARA RESERVASI SECTION */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 bg-white">
        <h2 className="font-heading text-center text-3xl md:text-4xl font-bold text-[#1F17A1]">Cara Reservasi</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {langkahReservasi.map((item) => (
            <article key={item.step} className="flex flex-col items-center justify-center rounded-2xl bg-[#EEF2FF] p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-sm">
              <div className="font-body flex h-10 w-10 items-center justify-center rounded-full bg-[#2D24B5] text-sm font-bold text-white shadow-sm">{item.step}</div>
              <h3 className="font-heading mt-4 text-lg font-bold text-[#1F17A1]">{item.title}</h3>
              <p className="font-body mt-2 text-xs md:text-sm text-[#1F17A1]/80 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* LOKASI KAMI SECTION */}
      <section id="lokasi" className="w-full bg-white py-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">Lokasi Kami</h2>
          </div>
          <div className="w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-lg border border-gray-100">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.788307145985!2d106.73251870000001!3d-6.5483918999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c357db1b8b03%3A0xd67648ed8dcc8e14!2sAgribusiness%20and%20Technology%20Park%20(ATP)%20IPB!5e0!3m2!1sid!2sid!4v1777529789420!5m2!1sid!2sid" className="w-full h-full border-0 grayscale transition-all duration-700 hover:grayscale-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
