import Image from "next/image"
import Link from "next/link"
import { KatalogFooter } from "@/components/KatalogFooter"
import { KatalogHeader } from "@/components/KatalogHeader"
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

/** Skeleton bar untuk blok konten yang belum diisi */
function PlaceholderBlock({
  title,
  lines = 3,
}: {
  title: string
  lines?: number
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-sm italic text-slate-500">Konten akan ditambahkan pada tahap berikutnya.</p>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full bg-slate-200"
            style={{ width: `${72 + i * 8}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default async function KatalogProductDetailPage({ params }: Props) {
  const { id: idParam } = await params
  const id = parseCatalogProductId(idParam)
  const product = id !== null ? getCatalogProductById(id) : undefined

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col bg-slate-50">
        <KatalogHeader />
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
        <KatalogFooter />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <KatalogHeader />
      <section className="mx-auto w-full max-w-6xl flex-grow px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/katalog"
            className="text-sm font-semibold text-blue-800 underline-offset-4 hover:underline"
          >
            ← Kembali ke katalog
          </Link>

          <div className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
            Halaman detail — placeholder
          </div>

          <article className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative aspect-video w-full bg-slate-100 sm:aspect-[21/9]">
              <Image
                src={product.imagePath}
                alt={product.nama}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.nama}</h1>
              <p className="mt-2 text-lg font-medium text-slate-700">Stok: {product.stock}</p>

              <section className="mt-10 space-y-4">
                <PlaceholderBlock title="Deskripsi produk" lines={4} />
                <PlaceholderBlock title="Spesifikasi & kemasan" lines={3} />
                <PlaceholderBlock title="Cara pemesanan / kontak" lines={2} />
              </section>
            </div>
          </article>
        </div>
      </section>
      <KatalogFooter />
    </main>
  )
}
