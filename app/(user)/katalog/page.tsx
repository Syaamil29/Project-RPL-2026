"use client"

import { ChangeEvent, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function KatalogFullPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("katalog_produk")
          .select("*")
          .eq("status", "published")

        if (error) throw error

        if (data) {
          const mapped = data.map((row) => ({
            id: String(row.id),
            nama: row.nama_produk || "",
            harga: Number(row.harga) || 0,
            imagePath: (row.gambar && row.gambar[0]) || "/images-1-facilities.png"
          }))
          setProducts(mapped)
        }
      } catch (err) {
        console.error("Gagal mengambil katalog produk:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.nama.toLowerCase().includes(q))
  }, [searchQuery, products])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
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
          {isLoading ? (
            <span className="text-slate-400 font-medium">Memuat katalog...</span>
          ) : searchQuery.trim() === "" ? (
            <>
              Menampilkan{" "}
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> produk.
            </>
          ) : (
            <>
              Hasil pencarian untuk{" "}
              <span className="font-semibold text-slate-900">&quot;{searchQuery.trim()}&quot;</span>
              {": "}
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span> produk ditemukan.
            </>
          )}
        </p>

        {isLoading ? (
          /* High-Fidelity Pulse Skeleton grid */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 animate-pulse">
                <div className="aspect-square w-full rounded-xl bg-slate-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-6 bg-slate-200 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-base text-slate-900 shadow-sm">
            {searchQuery.trim() === "" ? "Belum ada produk yang diterbitkan." : (
              <>
                Tidak ada produk yang cocok dengan{" "}
                <span className="font-semibold text-blue-900">&quot;{searchQuery.trim()}&quot;</span>.
              </>
            )}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((item) => (
              <Link
                key={item.id}
                href={`/katalog/${item.id}`}
                className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={item.imagePath}
                    alt={item.nama}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex flex-grow flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {item.nama}
                    </h3>
                    <p className="mt-1.5 text-base font-medium text-slate-600">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.harga)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

