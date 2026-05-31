"use server"

import { createClient } from "@supabase/supabase-js"

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.")
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseAdminInstance
}

export type Product = {
  id: string
  name: string
  category: string
  status: "published" | "draft"
  description: string
  images: string[]
  price: number
}

/**
 * Fetch all catalog products from the database, including drafts.
 * Since this runs on the server with supabaseAdmin, it bypasses RLS.
 */
export async function fetchProductsAdmin(): Promise<Product[]> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await (supabaseAdmin
    .from("katalog_produk") as any)
    .select("*")

  if (error) {
    console.error("Gagal fetchProductsAdmin:", error)
    throw new Error(`Gagal mengambil data produk: ${error.message}`)
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    name: row.nama_produk || "",
    category: row.kategori || "",
    status: String(row.status || "draft").toLowerCase() as "published" | "draft",
    description: row.deskripsi || "",
    images: row.gambar || [],
    price: Number(row.harga) || 0,
  }))
}

/**
 * Delete a product by its ID using supabaseAdmin.
 */
export async function deleteProductAdmin(id: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await (supabaseAdmin
    .from("katalog_produk") as any)
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Gagal deleteProductAdmin:", error)
    throw new Error(`Gagal menghapus produk: ${error.message}`)
  }
}

/**
 * Insert or update a product in the database.
 */
export async function saveProductAdmin(
  dbData: {
    nama_produk: string
    kategori: string
    harga: number
    status: "published" | "draft"
    deskripsi: string
    gambar: string[]
  },
  id?: string
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  const table = supabaseAdmin.from("katalog_produk") as any
  if (id) {
    // Update existing product
    const { error } = await table
      .update(dbData)
      .eq("id", id)

    if (error) {
      console.error("Gagal update saveProductAdmin:", error)
      throw new Error(`Gagal memperbarui produk: ${error.message}`)
    }
  } else {
    // Insert new product
    const { error } = await table
      .insert(dbData)

    if (error) {
      console.error("Gagal insert saveProductAdmin:", error)
      throw new Error(`Gagal membuat produk baru: ${error.message}`)
    }
  }
}

/**
 * Create a Supabase Signed Upload URL to allow direct uploads from the client browser.
 * This completely avoids sending large multipart files or arrays through Next.js Server Actions.
 */
export async function getUploadTicket(
  fileName: string
): Promise<{ signedUrl: string; path: string }> {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data, error } = await (supabaseAdmin.storage
    .from("gambar_katalog") as any)
    .createSignedUploadUrl(fileName)

  if (error) {
    console.error("Gagal createSignedUploadUrl:", error)
    throw new Error(`Gagal membuat tiket unggah storage: ${error.message}`)
  }

  if (!data) {
    throw new Error("Tiket unggah storage tidak dapat dibuat.")
  }

  return {
    signedUrl: data.signedUrl,
    path: data.path,
  }
}
