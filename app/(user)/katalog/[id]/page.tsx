import Image from "next/image"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

type Props = {
  params: Promise<{ id: string }>
}

export default async function KatalogProductDetailPage({ params }: Props) {
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from("katalog_produk")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Gagal memuat produk detail:", error)
    return (
      <main className="flex min-h-screen flex-col bg-slate-50">
        <section className="mx-auto w-full max-w-6xl flex-grow px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h1 className="text-xl font-bold text-slate-900">Produk tidak ditemukan</h1>
            <p className="mt-2 text-slate-600">ID tidak valid atau produk sudah tidak tersedia.</p>
            <Link
              href="/katalog"
              className="mt-6 inline-block rounded-lg bg-[#2D24B5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Kembali ke katalog
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const product = {
    id: String(data.id),
    nama: data.nama_produk || "",
    imagePath: (data.gambar && data.gambar[0]) || "/images-1-facilities.png",
    description: data.deskripsi || "Tidak ada deskripsi produk.",
    harga: Number(data.harga) || 0
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans antialiased text-slate-800">
      <section className="mx-auto w-full max-w-6xl flex-grow px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center">
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800 transition-all duration-200 shadow-sm"
              title="Kembali ke katalog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative aspect-square sm:aspect-video w-full bg-slate-50 flex items-center justify-center overflow-hidden">
              <Image
                src={product.imagePath}
                alt={product.nama}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl leading-snug">{product.nama}</h1>
              
              <div className="mt-4">
                <span className="text-2xl font-extrabold text-[#2D24B5] sm:text-3xl">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(product.harga)}
                </span>
              </div>

              <section className="mt-8 space-y-8 border-t border-slate-100 pt-8">
                {/* Deskripsi */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Deskripsi Produk</h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>
                </div>

                {/* Tahapan Pemesanan */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cara Pemesanan & Pembelian</h4>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Langkah 1 */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">1</span>
                        <h5 className="font-bold text-slate-800 text-sm">Konfirmasi via Customer Support</h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Hubungi layanan pelanggan resmi kami untuk melakukan konfirmasi pemesanan hasil bumi dan memastikan ketersediaan pasokan.
                      </p>
                      <div className="pt-1">
                        <a
                          href="https://wa.me/6285733392949"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 transition duration-200 shadow-xs"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 2c-5.514 0-9.99 4.493-9.99 10.011 0 1.764.461 3.42 1.267 4.873l-1.308 4.774 4.887-1.282c1.411.77 3.011 1.209 4.707 1.209 5.517 0 9.993-4.494 9.993-10.012 0-5.522-4.476-10.013-9.993-10.013zm0 1.5c4.686 0 8.493 3.819 8.493 8.513 0 4.693-3.807 8.512-8.493 8.512-1.57 0-3.037-.432-4.307-1.182l-.309-.181-2.923.767.781-2.852-.198-.316a8.423 8.423 0 0 1-1.247-4.238c0-4.694 3.807-8.513 8.493-8.513zm-1.897 3.43c-.22 0-.411.084-.564.232-.152.148-.485.474-.485 1.157 0 .684.498 1.344.566 1.437.068.093.978 1.492 2.37 2.094.331.143.59.229.79.292.333.106.637.091.876.055.267-.04.821-.336.938-.66.117-.324.117-.601.082-.66-.035-.058-.129-.093-.272-.164-.143-.07-.821-.406-.948-.452-.127-.047-.22-.07-.312.07-.093.14-.359.452-.44.545-.081.093-.162.105-.305.035-.143-.07-.604-.223-1.151-.711-.426-.38-.713-.848-.797-.993-.083-.14-.009-.216.062-.286.064-.063.143-.166.214-.249.071-.083.095-.142.143-.238.048-.095.024-.179-.012-.249-.036-.071-.312-.751-.428-1.029-.113-.272-.228-.235-.312-.239l-.265-.004z" />
                          </svg>
                          Hubungi CS: +62 857-3339-2949
                        </a>
                      </div>
                    </div>

                    {/* Langkah 2 */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">2</span>
                        <h5 className="font-bold text-slate-800 text-sm">Ambil & Bayar di Tempat</h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Kunjungi ATP IPB sesuai kesepakatan untuk mengambil langsung pesanan hasil tani Anda sekaligus menyelesaikan transaksi pembayaran di kasir.
                      </p>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <p className="font-bold text-slate-700">Alamat ATP IPB:</p>
                        <p>Jl. Carang Pulang No. 1, Cikarawang, Kec. Dramaga, Bogor 16680</p>
                      </div>
                    </div>
                  </div>

                  {/* Google Map View Kecil */}
                  <div className="w-full h-48 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.788307145985!2d106.73251870000001!3d-6.5483918999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c357db1b8b03%3A0xd67648ed8dcc8e14!2sAgribusiness%20and%20Technology%20Park%20(ATP)%20IPB!5e0!3m2!1sid!2sid!4v1777529789420!5m2!1sid!2sid"
                      className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
