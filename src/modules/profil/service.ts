import { supabase } from '@/lib/supabase'; 

export async function getProfilSettings() {
  try {
    const { data, error } = await supabase
      .from('profil_settings')
      .select('*')
      .eq('id', 1)
      .single(); 

    if (error) {
      console.error('Error mengambil data profil:', error.message);
      return null; 
    }
    
    return data;
  } catch (err) {
    console.error('Terjadi kesalahan sistem:', err);
    return null;
  }
}

export async function updateProfilSettings(payload: {
  email: string;
  no_telepon: string;
  jam_operasional: string;
  link_instagram: string;
}) {
  const { data, error } = await supabase
    .from('profil_settings')
    .update(payload)
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    throw error;
  }
  
  return data;
}