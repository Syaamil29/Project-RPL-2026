"use client"

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type TouchEvent, useMemo, useState, useEffect, useEffect} from "react";
import { supabase } from "@/lib/supabase";
import { CATALOG_PRODUCTS } from "@/lib/catalog-products";
import { DATA_PROFIL_ATP } from '@/src/modules/profil/data';
import { DATA_FASILITAS } from '@/src/modules/fasilitas/data';
import FasilitasModal from '@/src/modules/fasilitas/components/FasilitasModal';

const langkahReservasi = [
  { step: "1", title: "Isi Form Reservasi", description: "Lengkapi data kunjungan melalui form online dengan mudah." },
  { step: "2", title: "Tunggu Konfirmasi", description: "Tim ATP IPB akan meninjau pengajuan dan mengirim konfirmasi." },
  { step: "3", title: "Kunjungi ATP IPB", description: "Datang sesuai jadwal untuk pengalaman kunjungan yang terarah." },
];

const heroSlides = [
  { src: "/images/hero/hero-image2.webp", alt: "Tampilan Depan ATP" },
  { src: "/images/hero/hero-image3.webp", alt: "Aktivitas Edukasi ATP" },
  { src: "/images/hero/hero-image4.webp", alt: "Aktivitas ATP" },
];


export default function HomePage() {
  const router = useRouter();
  
  const [productList, setProductList] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const defaultKegiatan = [
    { id: "fallback-1", nama: "Agroedutourism", deskripsi: "Wisata pertanian edukatif terlengkap di Bogor. Pelajari rantai pasok agribisnis dari pembibitan modern hingga pemasaran.", src: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80" },
    { id: "fallback-2", nama: "Agripreneur Camp", deskripsi: "Pelatihan wirausaha tani muda.", src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80" },
    { id: "fallback-3", nama: "Peminjaman Ruangan", deskripsi: "Sewa ruang rapat, aula, dan lab.", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80" },
    { id: "fallback-4", nama: "Camping", deskripsi: "Bermalam di alam bebas nan sejuk.", src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80" },
    { id: "fallback-5", nama: "Survey / Wawancara", deskripsi: "Riset & pengambilan data terarah.", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" },
  ];

  const [kegiatanList, setKegiatanList] = useState<any[]>(defaultKegiatan);
  const [isLoadingKegiatan, setIsLoadingKegiatan] = useState(true);

  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const { data, error } = await supabase
          .from("katalog_produk")
          .select("*")
          .eq("status", "published")
          .limit(4);

        if (error) throw error;

        if (data) {
          const mapped = data.map((row) => ({
            id: String(row.id),
            nama: row.nama_produk || "",
            harga: Number(row.harga) || 0,
            deskripsi: row.deskripsi || "Tidak ada deskripsi produk.",
            src: (row.gambar && row.gambar[0]) || "/images-1-facilities.png"
          }));
          setProductList(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat produk di landing page:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    const fetchLandingKegiatan = async () => {
      try {
        setIsLoadingKegiatan(true);
        const { data, error } = await supabase
          .from("kegiatan")
          .select("*")
          .eq("status", "published");

        if (error) throw error;

        if (data) {
          const mapped = data.map((row) => ({
            id: String(row.id),
            nama: row.nama_kegiatan || "",
            deskripsi: row.deskripsi || "",
            src: (row.gambar && row.gambar[0]) || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
          }));

          let sorted = [...mapped];
          const agroIndex = sorted.findIndex(item => 
            (item.nama || "").toLowerCase().includes("agroedutourism")
          );
          if (agroIndex > 0) {
            const [agroItem] = sorted.splice(agroIndex, 1);
            sorted.unshift(agroItem);
          }

          const finalItems = [...sorted];
          defaultKegiatan.forEach((fallback) => {
            if (finalItems.length < 5 && !finalItems.some(item => item.nama.toLowerCase() === fallback.nama.toLowerCase())) {
              finalItems.push(fallback);
            }
          });
          
          const finalAgroIndex = finalItems.findIndex(item => 
            (item.nama || "").toLowerCase().includes("agroedutourism")
          );
          if (finalAgroIndex > 0) {
            const [agroItem] = finalItems.splice(finalAgroIndex, 1);
            finalItems.unshift(agroItem);
          }

          setKegiatanList(finalItems.slice(0, 5));
        }
      } catch (err) {
        console.error("Gagal memuat kegiatan di landing page:", err);
      } finally {
        setIsLoadingKegiatan(false);
      }
    };

    fetchLandingProducts();
    fetchLandingKegiatan();
  }, []);
  const topProducts = useMemo(() => CATALOG_PRODUCTS.slice(0, 10), []);
  const [currentProductIdx, setCurrentProductIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);


  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const fasilitasUnggulanIds = [
    "hidroponik-substrat", 
    "plant-factory", 
    "sobatani-fresh"
  ];

  const topFasilitas = fasilitasUnggulanIds
    .map(id => DATA_FASILITAS.find(item => item.id === id))
    .filter(item => item !== undefined);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedFasilitas = DATA_FASILITAS.find(item => item.id === selectedId);

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

  const productCount = topProducts.length;
  const visibleCount =
    productCount >= 5 ? 5 : productCount >= 3 ? 3 : Math.max(1, productCount);
  const sideSlots = Math.floor(visibleCount / 2);

  const wrapIndex = (idx: number) =>
    (idx + productCount) % (productCount === 0 ? 1 : productCount);

  const nextProduct = () => {
    if (productCount <= 1) return;
    setCurrentProductIdx((prev) => wrapIndex(prev + 1));
  };

  const prevProduct = () => {
    if (productCount <= 1) return;
    setCurrentProductIdx((prev) => wrapIndex(prev - 1));
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) nextProduct();
      if (delta > 0) prevProduct();
    }
    setTouchStartX(null);
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
        <div className="relative w-full h-[40vh] min-h-[300px] sm:h-[450px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentHeroIdx ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image 
                src={slide.src} 
                alt={slide.alt} 
                fill 
                className="object-cover" 
                priority={index === 0} 
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentHeroIdx(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentHeroIdx ? "bg-[#2D24B5] w-4" : "bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 pt-10 sm:pt-12 text-center">
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-[#1F17A1] leading-snug sm:leading-tight tracking-tight">
            Wisata Edukasi dan Inovasi <br className="hidden sm:inline" />Pertanian di ATP IPB
          </h1>
          <p className="font-body mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 font-light leading-relaxed px-2 sm:px-0">
            Jelajahi fasilitas Agribusiness Technology Park, lihat produk unggulan, <br className="hidden md:inline" />
            dan lakukan reservasi kunjungan secara online dengan mudah.
          </p>

          <div className="font-body mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none px-4 sm:px-0">
            <button
              onClick={() => void handleReservasiHero()}
              className="w-auto rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white transition-all hover:bg-[#20188A] shadow-sm hover:shadow-md active:scale-98"
            >
              Reservasi Sekarang
            </button>
            <button
              onClick={() => void handleCekRiwayat()}
              className="w-auto rounded-full border border-[#2D24B5] bg-white px-8 py-3 text-sm md:text-base font-semibold text-[#2D24B5] transition-all hover:bg-blue-50 active:scale-98"
            >
              Cek Riwayat Reservasi
            </button>
          </div>
        </div>
      </section>

      {/* TENTANG SECTION */}
      <section id="tentang" className="w-full bg-[#F5F7FF] py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          
          {/* ================= TAMPILAN MOBILE (Title -> Photo -> Explanation -> Button) ================= */}
          <div className="block md:hidden text-center space-y-6">
            {/* 1. JUDUL */}
            <div className="space-y-2">
              <h2 className="font-heading text-3xl font-bold text-[#1F17A1] leading-tight">
                Tentang ATP
              </h2>
              <div className="h-1 w-12 bg-[#2D24B5] mx-auto rounded-full"></div>
            </div>
            
            {/* 2. FOTO */}
            <div className="relative w-full h-[220px] overflow-hidden rounded-2xl shadow-md">
              <Image 
                src="/images/profil/ProfilATP.webp" 
                alt="ATP IPB" 
                fill 
                className="object-cover" 
                 sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            
            {/* 3. PENJELASAN */}
            <p className="font-body text-sm leading-relaxed text-slate-700 text-left">
              {DATA_PROFIL_ATP.deskripsi[0]}
            </p>
            
            {/* 4. TOMBOL */}
            <div className="pt-1">
              <Link 
                href="/profil" 
                className="font-body inline-flex items-center justify-center rounded-full bg-[#2D24B5] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#20188A]"
              >
                Detail Profil
              </Link>
            </div>
          </div>

          {/* ================= TAMPILAN DESKTOP (Side-by-Side - Kiri: Info, Kanan: Foto) ================= */}
          <div className="hidden md:grid md:grid-cols-2 items-center gap-10">
            {/* Kiri: Title, Explanation, Button */}
            <div className="flex flex-col gap-5 text-left">
              <h2 className="font-heading text-4xl font-bold text-[#1F17A1] lg:text-5xl leading-tight">
                Tentang ATP
              </h2>
              
              <p className="font-body text-sm lg:text-base leading-relaxed text-slate-700">
                {DATA_PROFIL_ATP.deskripsi[0]}
              </p>
              
              <Link 
                href="/profil" 
                className="font-body w-fit mt-2 rounded-full bg-[#2D24B5] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]"
              >
                Detail Profil
              </Link>
            </div>

            {/* Kanan: Foto */}
            <div className="relative h-[320px] lg:h-[380px] w-full overflow-hidden rounded-2xl shadow-md group">
              <Image 
                src="/images/profil/ProfilATP.webp" 
                alt="ATP IPB" 
                fill 
                className="object-cover transform group-hover:scale-105 transition duration-700 ease-in-out"  
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* KEGIATAN BENTO GRID SECTION */}
      <section id="kegiatan" className="w-full bg-[#F5F7FF] py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-body text-xs font-bold uppercase tracking-wider text-[#2D24B5] bg-blue-50 px-3 py-1 rounded-full">
              Kegiatan Kami
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1] mt-3">
              Jelajahi Kegiatan di ATP
            </h2>
            <p className="font-body mx-auto mt-3 max-w-xl text-slate-600 text-sm md:text-base leading-relaxed">
              Ikuti berbagai program edukatif, petualangan luar ruangan, riset, dan bisnis pertanian modern langsung bersama para pakar IPB.
            </p>
          </div>

          {/* Asymmetrical Bento Box Grid layout */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2 md:h-[500px] w-full">
            
            {/* Card 1: Agroedutourism (Hero Card - col-span-2 row-span-2) */}
            {kegiatanList[0] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 h-[300px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[0].src}
                  alt={kegiatanList[0].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-6 md:p-8 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                    {kegiatanList[0].nama}
                  </h3>
                  <p className="font-body text-xs text-slate-200 mt-2 line-clamp-2 max-w-md font-light leading-relaxed">
                    {kegiatanList[0].deskripsi}
                  </p>
                  <div className="font-body mt-4 text-xs font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 2: Agripreneur Camp (col-span-1 row-span-1) */}
            {kegiatanList[1] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[1].src}
                  alt={kegiatanList[1].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[1].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[1].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 3: Peminjaman Ruangan (col-span-1 row-span-1) */}
            {kegiatanList[2] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[2].src}
                  alt={kegiatanList[2].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[2].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[2].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 4: Camping (col-span-1 row-span-1) */}
            {kegiatanList[3] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[3].src}
                  alt={kegiatanList[3].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[3].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[3].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 5: Survey / Wawancara (col-span-1 row-span-1) */}
            {kegiatanList[4] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[4].src}
                  alt={kegiatanList[4].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[4].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[4].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

          </div>
        </div>
      </section>

      {/* KEGIATAN BENTO GRID SECTION */}
      <section id="kegiatan" className="w-full bg-[#F5F7FF] py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="font-body text-xs font-bold uppercase tracking-wider text-[#2D24B5] bg-blue-50 px-3 py-1 rounded-full">
              Kegiatan Kami
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1] mt-3">
              Jelajahi Kegiatan di ATP
            </h2>
            <p className="font-body mx-auto mt-3 max-w-xl text-slate-600 text-sm md:text-base leading-relaxed">
              Ikuti berbagai program edukatif, petualangan luar ruangan, riset, dan bisnis pertanian modern langsung bersama para pakar IPB.
            </p>
          </div>

          {/* Asymmetrical Bento Box Grid layout */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2 md:h-[500px] w-full">
            
            {/* Card 1: Agroedutourism (Hero Card - col-span-2 row-span-2) */}
            {kegiatanList[0] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 h-[300px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[0].src}
                  alt={kegiatanList[0].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-6 md:p-8 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                    {kegiatanList[0].nama}
                  </h3>
                  <p className="font-body text-xs text-slate-200 mt-2 line-clamp-2 max-w-md font-light leading-relaxed">
                    {kegiatanList[0].deskripsi}
                  </p>
                  <div className="font-body mt-4 text-xs font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 2: Agripreneur Camp (col-span-1 row-span-1) */}
            {kegiatanList[1] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[1].src}
                  alt={kegiatanList[1].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[1].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[1].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 3: Peminjaman Ruangan (col-span-1 row-span-1) */}
            {kegiatanList[2] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[2].src}
                  alt={kegiatanList[2].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[2].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[2].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 4: Camping (col-span-1 row-span-1) */}
            {kegiatanList[3] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[3].src}
                  alt={kegiatanList[3].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[3].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[3].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

            {/* Card 5: Survey / Wawancara (col-span-1 row-span-1) */}
            {kegiatanList[4] && (
              <Link
                href="/reservasi"
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl h-[200px] md:h-full shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={kegiatanList[4].src}
                  alt={kegiatanList[4].nama}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="font-heading text-base md:text-lg font-bold text-white leading-tight">
                    {kegiatanList[4].nama}
                  </h3>
                  <p className="font-body text-[10px] text-slate-300 mt-1 line-clamp-1 font-light">
                    {kegiatanList[4].deskripsi}
                  </p>
                  <div className="font-body mt-3 text-[11px] font-bold text-white flex items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Daftar Sekarang! &rarr;
                  </div>
                </div>
              </Link>
            )}

          </div>
        </div>
      </section>

      {/* FASILITAS SECTION */}
      <div className="w-full bg-white border-b-2 border-slate-100">
        <section id="fasilitas" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 relative">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">
              Fasilitas
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Jelajahi fasilitas utama ATP IPB <br/>
              untuk kunjungan edukatif dan penelitian
            </p>
          </div>
          
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {topFasilitas.map((item) => (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                  <Image src={item.gambarUtama} alt={item.nama} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h3 className="font-heading text-base md:text-lg font-bold text-[#1F17A1]">{item.nama}</h3>
                    <div className="font-body self-start sm:self-auto flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
                      🌱 {item.kategori.split(' ')[0]}
                    </div>
                  </div>
                  
                  <p className="font-body text-xs md:text-sm text-slate-600 flex-1 line-clamp-2">
                    {item.deskripsiSingkat}
                  </p>
                  
                  <button 
                    onClick={() => setSelectedId(item.id)} 
                    className="font-body mt-auto inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-50 text-[#231896] text-sm font-bold rounded-xl border border-slate-200 hover:bg-[#231896] hover:text-white transition-all duration-300"
                  >
                    Detail
                  </button>
                </div>
              </article>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <Link 
              href="/fasilitas" 
              className="rounded-full bg-[#2D24B5] px-8 py-3 text-white font-semibold hover:bg-blue-800 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow"
            >
              Lihat Semua Fasilitas ({DATA_FASILITAS.length})
            </Link>
          </div>

          {selectedFasilitas && (
            <FasilitasModal 
              item={selectedFasilitas} 
              onClose={() => setSelectedId(null)} 
            />
          )}

        </section>
      </div>

      {/* PRODUK SECTION */}
      <section id="produk" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 bg-white">
        <div className="text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">Produk Kami</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoadingProducts ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square w-full bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-slate-200 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-200 rounded-full w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : productList.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 font-body">Belum ada produk yang dipublikasikan.</div>
          ) : (
            productList.map((item) => (
              <Link key={item.id} href={`/katalog/${item.id}`} className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="aspect-square w-full bg-slate-100 overflow-hidden">
                  <img src={item.src} alt={item.nama} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="font-body p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-heading text-sm md:text-base font-bold text-[#1F17A1] line-clamp-2">{item.nama}</h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.harga)}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-[#2D24B5] transition-colors group-hover:text-[#1F17A1]">Detail &rarr;</span>
                  </div>
                </div>
              </Link>
            ))
          )}
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
            <article 
              key={item.step} 
              className="flex flex-row md:flex-col items-start md:items-center p-5 md:p-8 rounded-2xl bg-[#EEF2FF] text-left md:text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md gap-4 md:gap-0"
            >
              {/* Step Bubble */}
              <div className="font-body flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D24B5] text-sm font-bold text-white shadow-sm md:mb-4">
                {item.step}
              </div>
              
              {/* Text Content */}
              <div className="flex-1">
                <h3 className="font-heading text-base md:text-lg font-bold text-[#1F17A1]">
                  {item.title}
                </h3>
                <p className="font-body mt-1 md:mt-2 text-xs md:text-sm text-[#1F17A1]/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
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
