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