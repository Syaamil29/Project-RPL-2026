
"use server"

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfilSettings(formData: FormData) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
          }
        },
      },
    }
  );

  // ... (kode createServerClient di atasnya)

  // TAMBAHKAN RADAR INI:
  const { data: { user } } = await supabase.auth.getUser();
  console.log("STATUS LOGIN DI SERVER ACTION:", user ? `Berhasil, Email: ${user.email}` : "KOSONG/TIDAK LOGIN");

  // ... (kode const email = formData.get('email') di bawahnya)
  try {
    const email = formData.get('email') as string;
    const no_telepon = formData.get('no_telepon') as string;
    const jam_operasional = formData.get('jam_operasional') as string;
    const link_instagram = formData.get('link_instagram') as string;

const { data: updatedData, error } = await supabase
      .from('profil_settings')
      .update({ 
        email, 
        no_telepon, 
        jam_operasional, 
        link_instagram 
      })
      .eq('id', 1)
      .select(); // <--- TAMBAHKAN INI

    if (error) {
      console.error("Gagal update dari Supabase:", error);
      return { success: false, message: `Gagal: ${error.message}` };
    }

    // TAMBAHKAN LOGIKA INI UNTUK MENANGKAP SILENT FAILURE
    if (!updatedData || updatedData.length === 0) {
      return { 
        success: false, 
        message: 'Gagal disimpan: Diblokir oleh keamanan RLS atau ID tidak ditemukan.' 
      };
    }

    // 5. Bersihkan cache agar Footer langsung berubah
    revalidatePath('/', 'layout'); 
    return { success: true, message: 'Profil berhasil diperbarui!' };
    
  } catch (error) {
    console.error("Error internal Server Action:", error);
    return { success: false, message: 'Terjadi kesalahan sistem internal.' };
  }
}