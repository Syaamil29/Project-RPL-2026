import { supabase } from "@/lib/supabase";

const STORAGE_BUCKET = "dokumen";

/**
 * Uploads a file to the Supabase storage bucket "dokumen".
 * Returns the public URL of the uploaded file.
 */
export async function uploadFileToStorage(file: File): Promise<string> {
  const sanitized = file.name.replace(/\s+/g, "-");
  const path = `reservasi/${Date.now()}-${sanitized}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
  if (error) {
    console.error("Supabase file upload error:", error);
    throw error;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
