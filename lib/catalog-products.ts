export type CatalogProduct = {
  id: number
  nama: string
  stock: number
  imagePath: string
  /** Ringkasan untuk halaman detail */
  description: string
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 1,
    nama: "Beras Organik",
    stock: 15,
    imagePath: "/beras.png",
    description:
      "Beras organik hasil pertanian ATP IPB dengan pengelolaan tanpa pestisida kimia sintetis. Cocok untuk kebutuhan rumah tangga dan riset.",
  },
  {
    id: 2,
    nama: "Kacang Tanah Sangrai",
    stock: 15,
    imagePath: "/kacang.jpg",
    description:
      "Kacang tanah sangrai siap konsumsi, kaya protein dan serat. Diproses higienis dari bahan lokal.",
  },
  {
    id: 3,
    nama: "Bayam Hijau Segar",
    stock: 15,
    imagePath: "/bayam.jpg",
    description:
      "Sayuran daun segar dipetik dari kebun edukatif ATP IPB. Kaya zat besi dan vitamin untuk menu sehari-hari.",
  },
  {
    id: 4,
    nama: "Wortel Manis",
    stock: 25,
    imagePath: "/wortel.jpg",
    description:
      "Wortel segar dengan rasa manis alami. Cocok untuk jus, sup, atau camilan sehat.",
  },
  {
    id: 5,
    nama: "Tomat Ceri",
    stock: 10,
    imagePath: "/tomat.jpg",
    description:
      "Tomat ceri segar dari rumah kedap ATP IPB. Ideal untuk salad dan masakan rumahan.",
  },
  {
    id: 6,
    nama: "Sayur Kale",
    stock: 5,
    imagePath: "/kale.jpg",
    description:
      "Kale nutrisi tinggi dari budidaya terkontrol. Populer untuk smoothie dan hidangan sehat.",
  },
]

export function getCatalogProductById(id: number): CatalogProduct | undefined {
  return CATALOG_PRODUCTS.find((p) => p.id === id)
}

export function parseCatalogProductId(param: string): number | null {
  const n = Number(param)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null
  return n
}
