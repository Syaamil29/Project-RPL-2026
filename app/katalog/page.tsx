"use client"

import { ChangeEvent, useMemo, useState } from "react"
import Link from "next/link"
import { KatalogFooter } from "@/components/KatalogFooter"
import { KatalogHeader } from "@/components/KatalogHeader"
import { CATALOG_PRODUCTS } from "@/lib/catalog-products"

export default function KatalogFullPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return CATALOG_PRODUCTS
    return CATALOG_PRODUCTS.filter((p) => p.nama.toLowerCase().includes(q))
  }, [searchQuery])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <KatalogHeader />

      <section className="mx-auto w-full max-w-6xl flex-grow px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Katalog Produk</h1>
          <p className="mt-2 text-slate-600">
            Temukan hasil panen segar dan berkualitas langsung dari kebun ATP IPB.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="katalog-search" className="mb-2 block text-sm font-semibold text-slate-900">
            Cari nama produk
          </label>
          <input
            id="katalog-search"
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari nama produk..."
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 md:max-w-md"
          />
        </div>

        <p className="mb-6 text-sm text-slate-800" aria-live="polite">
          {searchQuery.trim() === "" ? (
            <>
              Menampilkan{" "}
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> produk.
            </>
          ) : (
            <>
              Hasil pencarian untuk{" "}
              <span className="font-semibold text-slate-900">&quot;{searchQuery.trim()}&quot;</span>
              {": "}
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> produk
              ditemukan.
            </>
          )}
        </p>

        {filteredProducts.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-base text-slate-900 shadow-sm">
            Tidak ada produk yang cocok dengan{" "}
            <span className="font-semibold text-blue-900">&quot;{searchQuery.trim()}&quot;</span>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={item.imagePath}
                    alt={item.nama}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex flex-grow flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2">
                      {item.nama}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-600">Stok: {item.stock}</p>
                  </div>

                  <Link
                    href={`/katalog/${item.id}`}
                    className="mt-5 self-center text-lg font-bold text-slate-500 transition-all hover:text-blue-700 hover:underline hover:underline-offset-4"
                  >
                    Selengkapnya
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <KatalogFooter />
    </main>
  )
}
