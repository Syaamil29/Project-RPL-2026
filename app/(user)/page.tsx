"use client"

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type TouchEvent, useMemo, useState, useEffect} from "react";
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
    "hidroponik-nft", 
    "smart-greenhouse-nursery"
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
                {DATA_PROFIL_ATP.deskripsi[0]}
              </p>
              
              <Link href="/profil" className="font-body w-fit mt-2 rounded-full bg-[#2D24B5] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]">
                Detail Profil
              </Link>
            </div>
            <div className="relative h-[250px] w-full overflow-hidden rounded-2xl md:h-[320px] shadow-md">
              <Image src="/images/profil/ProfilATP.webp" alt="ATP IPB" fill className="object-cover" />
            </div>
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
                  <Image src={item.gambarUtama} alt={item.nama} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-heading text-base md:text-lg font-bold text-[#1F17A1]">{item.nama}</h3>
                    <div className="font-body flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 whitespace-nowrap">
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
      <div className="w-full bg-white">
        <section id="produk" className="w-full py-16">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#1F17A1]">Produk Kami</h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                Temukan produk unggulan ATP IPB<br/>
                hasil inovasi dan riset pertanian modern
              </p>
            </div>

            {/* Carousel container — buttons absolutely placed inside, track is full width */}
            <div
              className="relative mx-auto h-[460px] w-full overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Cards — left-1/2 now resolves to true center of full-width container */}
              {topProducts.map((item, idx) => {
                const rawOffset = idx - currentProductIdx;
                const circularOffset =
                  Math.abs(rawOffset) > productCount / 2
                    ? rawOffset > 0
                      ? rawOffset - productCount
                      : rawOffset + productCount
                    : rawOffset;

                if (Math.abs(circularOffset) > sideSlots) return null;

                const absOffset = Math.abs(circularOffset);
                const translateX = circularOffset * 60;
                const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.84 : 0.70;
                const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.65;
                const zIndex = 30 - absOffset;

                return (
                  <article
                    key={item.id}
                    className="absolute left-1/2 top-1/2 w-[280px] rounded-2xl border-2 border-slate-200 bg-white shadow-md transition-all duration-500 ease-out"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                      opacity,
                      zIndex,
                    }}
                  >
                    <Link href={`/katalog/${item.id}`} className="group block">
                      <div className="h-[260px] w-full overflow-hidden rounded-t-2xl bg-slate-100">
                        <Image
                          src={item.imagePath}
                          alt={item.nama}
                          width={640}
                          height={640}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="font-body bg-white p-3 rounded-b-2xl">
                      <h3 className="font-heading text-sm font-bold text-[#1F17A1] line-clamp-1">
                        {item.nama}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                        {item.description}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">Stok: {item.stock}</p>
                    </div>
                  </article>
                );
              })}

              {/* Buttons absolutely positioned INSIDE the container, not in flex flow */}
              <button
                type="button"
                onClick={prevProduct}
                aria-label="Produk sebelumnya"
                className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:text-[#1F17A1]"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={nextProduct}
                aria-label="Produk berikutnya"
                className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:text-[#1F17A1]"
              >
                &gt;
              </button>
            </div>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
              {topProducts.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentProductIdx(idx)}
                  aria-label={`Lihat produk ${idx + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === currentProductIdx ? "bg-[#2D24B5] scale-110" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            {/* Details button */}
            <div className="mt-6 flex justify-center">
              <Link href="/katalog" className="font-body rounded-full bg-[#2D24B5] px-8 py-3 text-sm md:text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#20188A]">
                Details -&gt;
              </Link>
            </div>

          </div>
        </section>
      </div>

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
