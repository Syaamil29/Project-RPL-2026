import Image from "next/image"
import Link from "next/link"
import {
  CATALOG_PRODUCTS,
  getCatalogProductById,
  parseCatalogProductId,
} from "@/lib/catalog-products"

type Props = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return CATALOG_PRODUCTS.map((p) => ({ id: String(p.id) }))
}

export default async function KatalogProductDetailPage({ params }: Props) {
  const { id: idParam } = await params
  const id = parseCatalogProductId(idParam)
  const product = id !== null ? getCatalogProductById(id) : undefined

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <section className="mx-auto w-full max-w-6xl flex-grow px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h1 className="text-xl font-bold text-slate-900">Produk tidak ditemukan</h1>
            <p className="mt-2 text-slate-600">ID tidak valid atau produk sudah tidak tersedia.</p>
            <Link
              href="/katalog"
              className="mt-6 inline-block rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Kembali ke katalog
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_-10px_rgba(31,23,161,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
            <div className="relative h-[350px] w-full bg-slate-50 sm:h-[450px]">
              <Link
                href="/katalog"
                aria-label="Kembali ke katalog"
                className="absolute left-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/90 bg-slate-100/85 text-slate-700 shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 sm:left-4 sm:top-4"
              >
                <span className="text-lg leading-none">←</span>
              </Link>
              <Image
                src={product.imagePath}
                alt={product.nama}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2D24B5]/80">
                Produk ATP IPB
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1F17A1] sm:text-3xl">
                {product.nama}
              </h1>
              <p className="mt-2 text-base font-medium text-slate-700 sm:text-lg">
                Stok tersedia: <span className="font-bold text-[#2D24B5]">{product.stock}</span>
              </p>

              <section className="mt-8 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Deskripsi</h2>
                <p className="mt-3 leading-relaxed text-slate-700">{product.description}</p>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Spesifikasi</h2>
                <p className="mt-3 leading-relaxed text-slate-600">
                  Spesifikasi dan informasi kemasan akan diperbarui pada tahap berikutnya.
                </p>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Pemesanan</h2>
                <p className="mt-3 leading-relaxed text-slate-600">
                  Detail cara pemesanan akan ditambahkan. Sementara itu, silakan hubungi admin ATP
                  IPB untuk informasi lebih lanjut.
                </p>
              </section>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
