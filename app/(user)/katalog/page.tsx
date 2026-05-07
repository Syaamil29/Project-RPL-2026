"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { CatalogProduct } from "@/lib/catalog-products"
import { CATALOG_PRODUCTS } from "@/lib/catalog-products"

type ChipId = "all" | "organik" | "sayuran" | "biji"

const CHIPS: { id: ChipId; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "organik", label: "Organik" },
  { id: "sayuran", label: "Sayuran" },
  { id: "biji", label: "Kacang & biji" },
]

const SAYURAN_KEYWORDS = ["bayam", "wortel", "tomat", "kale", "sayur"]

// Wide hysteresis prevents compact/expand bounce from layout shifts.
const COMPACT_ENTER_SCROLL_PX = 180
const COMPACT_EXIT_SCROLL_PX = 24

type SortKey = "default" | "stock_desc" | "name_asc"

function productMatchesChip(p: CatalogProduct, chip: ChipId): boolean {
  if (chip === "all") return true
  const n = p.nama.toLowerCase()
  if (chip === "organik") return n.includes("organik")
  if (chip === "sayuran") return SAYURAN_KEYWORDS.some((k) => n.includes(k))
  if (chip === "biji") return n.includes("kacang") || n.includes("beras")
  return true
}

function sortProducts(list: CatalogProduct[], sort: SortKey): CatalogProduct[] {
  const copy = [...list]
  if (sort === "stock_desc") {
    copy.sort((a, b) => b.stock - a.stock)
  } else if (sort === "name_asc") {
    copy.sort((a, b) => a.nama.localeCompare(b.nama, "id"))
  }
  return copy
}

export default function KatalogFullPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [chip, setChip] = useState<ChipId>("all")
  const [sort, setSort] = useState<SortKey>("default")
  const [compactBar, setCompactBar] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const compactRef = useRef(false)
  const rafRef = useRef<number | null>(null)

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const applyCompactState = () => {
      const y = window.scrollY
      const nextCompact = compactRef.current
        ? y > COMPACT_EXIT_SCROLL_PX
        : y > COMPACT_ENTER_SCROLL_PX

      if (nextCompact !== compactRef.current) {
        compactRef.current = nextCompact
        setCompactBar(nextCompact)
      }
      rafRef.current = null
    }

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(applyCompactState)
    }

    applyCompactState()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = CATALOG_PRODUCTS.filter((p) => productMatchesChip(p, chip))
    if (q) {
      list = list.filter((p) => p.nama.toLowerCase().includes(q))
    }
    return sortProducts(list, sort)
  }, [searchQuery, chip, sort])

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length === 0) return []
    const pool = CATALOG_PRODUCTS.filter((p) => productMatchesChip(p, chip))
    const matches = pool.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
    return matches.slice(0, 8)
  }, [searchQuery, chip])

  const showSuggestions =
    searchFocused && searchQuery.trim().length > 0 && searchSuggestions.length > 0

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Shopee-style top band + search */}
      <div className="sticky top-[4.5rem] z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md sm:top-20">
        <div
          className={`bg-gradient-to-r from-[#2D24B5] to-[#1F17A1] px-4 transition-[padding] duration-150 sm:px-6 ${
            compactBar ? "py-2 sm:py-3" : "py-5 sm:py-7"
          }`}
        >
          <div
            className={`mx-auto flex max-w-6xl flex-col transition-all duration-150 sm:flex-row sm:items-center sm:justify-between ${
              compactBar ? "gap-1" : "gap-3"
            }`}
          >
            <div>
              <p
                className={`font-semibold uppercase tracking-wide text-white/85 transition-all duration-150 ${
                  compactBar ? "text-[10px] sm:text-xs" : "text-sm sm:text-base"
                }`}
              >
                ATP IPB
              </p>
              <h1
                className={`font-bold tracking-tight text-white transition-all duration-150 ${
                  compactBar
                    ? "mt-0 text-base sm:text-lg"
                    : "mt-1 text-2xl sm:text-3xl md:text-4xl"
                }`}
              >
                Katalog produk
              </h1>
            </div>
            <p
              className={`hidden text-base leading-relaxed text-white/90 transition-opacity duration-150 sm:block sm:max-w-lg sm:text-right sm:text-lg ${
                compactBar ? "pointer-events-none opacity-0 sm:hidden" : "opacity-100"
              }`}
            >
              Hasil panen segar & berkualitas — cari cepat seperti di marketplace.
            </p>
          </div>
        </div>

        <div
          className={`mx-auto max-w-6xl px-4 transition-[padding] duration-150 sm:px-6 ${
            compactBar ? "pb-2 pt-2 sm:pb-3 sm:pt-3" : "pb-4 pt-4 sm:pb-5 sm:pt-5"
          }`}
        >
          <div className={`relative ${compactBar ? "-mt-1 sm:-mt-2" : "-mt-2 sm:-mt-3"}`}>
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-150 ${
                compactBar ? "left-3 sm:left-4" : "left-4 sm:left-5"
              }`}
              aria-hidden
            >
              <svg
                className={`transition-all duration-150 ${
                  compactBar ? "h-4 w-4 sm:h-5 sm:w-5" : "h-6 w-6 sm:h-7 sm:w-7"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              id="katalog-search"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                clearBlurTimeout()
                setSearchFocused(true)
              }}
              onBlur={() => {
                blurTimeoutRef.current = setTimeout(() => setSearchFocused(false), 180)
              }}
              placeholder="Cari produk di katalog ATP…"
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="katalog-search-suggestions"
              aria-autocomplete="list"
              className={`w-full rounded-2xl border-2 border-slate-200 bg-white font-semibold text-slate-900 shadow-md outline-none ring-[#2D24B5]/15 placeholder:font-medium placeholder:text-slate-400/80 focus:border-[#2D24B5] focus:ring-2 transition-[padding,font-size] duration-150 ${
                compactBar
                  ? "py-2 pl-9 pr-3 text-xs sm:py-2.5 sm:pl-11 sm:pr-4 sm:text-sm"
                  : "py-3.5 pl-12 pr-4 text-sm sm:py-4 sm:pl-14 sm:pr-5 sm:text-base"
              }`}
            />

            {showSuggestions ? (
              <ul
                id="katalog-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                {searchSuggestions.map((p) => (
                  <li
                    key={p.id}
                    role="option"
                    className="border-b border-slate-200 last:border-b-0"
                  >
                    <Link
                      href={`/katalog/${p.id}`}
                      className="block px-4 py-3 text-base text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:text-lg"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className="font-semibold text-slate-900">{p.nama}</span>
                      <span className="mt-1 block text-sm font-normal text-slate-500 line-clamp-1 sm:text-base">
                        {p.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className={`mt-3 flex flex-col gap-3 transition-all duration-150 sm:flex-row sm:items-center sm:justify-between ${
              compactBar ? "mt-2 gap-2" : ""
            }`}
          >
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:gap-3">
              {CHIPS.map((c) => {
                const active = chip === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChip(c.id)}
                    className={`shrink-0 rounded-full font-semibold transition-all duration-150 ${
                      compactBar
                        ? `px-3 py-1 text-[11px] sm:px-4 sm:py-1.5 sm:text-xs ${
                            active
                              ? "bg-[#2D24B5] text-white shadow-sm shadow-[#2D24B5]/25"
                              : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-[#2D24B5]/35 hover:bg-[#EEF2FF]"
                          }`
                        : `px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base ${
                            active
                              ? "bg-[#2D24B5] text-white shadow-md shadow-[#2D24B5]/30"
                              : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-[#2D24B5]/35 hover:bg-[#EEF2FF] hover:text-[#1F17A1] hover:shadow"
                          }`
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>

            <div
              className={`flex shrink-0 items-center gap-2 transition-all duration-150 ${
                compactBar ? "scale-95 origin-right" : ""
              }`}
            >
              <label
                htmlFor="katalog-sort"
                className={`font-semibold text-slate-600 transition-all duration-150 ${
                  compactBar ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                }`}
              >
                Urutkan
              </label>
              <select
                id="katalog-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`rounded-lg border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-[#2D24B5] focus:ring-2 focus:ring-[#2D24B5]/25 transition-all duration-150 ${
                  compactBar
                    ? "py-1 pl-2 pr-7 text-xs sm:py-1.5 sm:pl-2.5 sm:pr-8 sm:text-sm"
                    : "py-2 pl-3 pr-9 text-sm sm:text-base"
                }`}
              >
                <option value="default">Paling relevan</option>
                <option value="stock_desc">Stok terbanyak</option>
                <option value="name_asc">Nama A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <p className="mb-3 text-xs text-slate-600 sm:text-sm" aria-live="polite">
          {searchQuery.trim() === "" ? (
            <>
              Menampilkan{" "}
              <span className="font-semibold text-[#1F17A1]">{filteredProducts.length}</span>{" "}
              produk
              {chip !== "all" ? (
                <>
                  {" "}
                  di kategori{" "}
                  <span className="font-semibold text-slate-900">
                    {CHIPS.find((c) => c.id === chip)?.label}
                  </span>
                </>
              ) : null}
              .
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-900">&quot;{searchQuery.trim()}&quot;</span>
              {": "}
              <span className="font-semibold text-[#1F17A1]">{filteredProducts.length}</span> hasil.
            </>
          )}
        </p>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-900">Produk tidak ditemukan</p>
            <p className="mt-2 text-sm text-slate-600">
              Coba ubah kata kunci atau pilih kategori &quot;Semua&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setChip("all")
              }}
              className="mt-6 inline-flex rounded-full bg-[#2D24B5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20188A]"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-slate-300 bg-white p-3 shadow-[0_10px_40px_-10px_rgba(31,23,161,0.14),0_4px_16px_-4px_rgba(0,0,0,0.06)] sm:p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((item) => {
                const lowStock = item.stock <= 8
                return (
                  <Link
                    key={item.id}
                    href={`/katalog/${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-[#2D24B5] hover:shadow-[0_20px_40px_-12px_rgba(45,36,181,0.28),0_12px_24px_-8px_rgba(0,0,0,0.15)]"
                  >
                    <div className="relative aspect-square w-full cursor-pointer bg-slate-100">
                      <Image
                        src={item.imagePath}
                        alt={item.nama}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.06]"
                      />
                      {lowStock ? (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-[11px]">
                          Stok terbatas
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 cursor-pointer flex-col p-2 sm:p-2.5">
                      <h2 className="line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug text-slate-900 sm:min-h-[2.75rem] sm:text-sm">
                        {item.nama}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                        {item.description}
                      </p>

                      <div className="mt-auto pt-2">
                        <p className="text-[11px] font-medium text-slate-500 sm:text-xs">Stok</p>
                        <p className="text-sm font-bold text-[#1F17A1] sm:text-base">{item.stock}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
