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

export type Kegiatan = {
  id: string
  name: string
  status: "published" | "draft"
  description: string
  images: string[]
}

/**
 * Fetch all kegiatan from the database, including drafts.
 * Since this runs on the server with supabaseAdmin, it bypasses RLS.
 */
export async function fetchKegiatanAdmin(): Promise<Kegiatan[]> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await (supabaseAdmin
    .from("kegiatan") as any)
    .select("*")

  if (error) {
    console.error("Gagal fetchKegiatanAdmin:", error)
    throw new Error(`Gagal mengambil data kegiatan: ${error.message}`)
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    name: row.nama_kegiatan || "",
    status: String(row.status || "draft").toLowerCase() as "published" | "draft",
    description: row.deskripsi || "",
    images: row.gambar || [],
  }))
}

/**
 * Delete a kegiatan by its ID using supabaseAdmin.
 */
export async function deleteKegiatanAdmin(id: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await (supabaseAdmin
    .from("kegiatan") as any)
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Gagal deleteKegiatanAdmin:", error)
    throw new Error(`Gagal menghapus kegiatan: ${error.message}`)
  }
}

/**
 * Insert or update a kegiatan in the database.
 */
export async function saveKegiatanAdmin(
  dbData: {
    nama_kegiatan: string
    status: "published" | "draft"
    deskripsi: string
    gambar: string[]
  },
  id?: string
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  const table = supabaseAdmin.from("kegiatan") as any
  if (id) {
    // Update existing kegiatan
    const { error } = await table
      .update(dbData)
      .eq("id", id)

    if (error) {
      console.error("Gagal update saveKegiatanAdmin:", error)
      throw new Error(`Gagal memperbarui kegiatan: ${error.message}`)
    }
  } else {
    // Insert new kegiatan
    const { error } = await table
      .insert(dbData)

    if (error) {
      console.error("Gagal insert saveKegiatanAdmin:", error)
      throw new Error(`Gagal membuat kegiatan baru: ${error.message}`)
    }
  }
}

/**
 * Create a Supabase Signed Upload URL for direct uploads from the client browser.
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
