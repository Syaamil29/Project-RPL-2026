import ProfilATP from '@/src/modules/profil/components/ProfilATP';

export const metadata = {
  title: 'Detail Profil - ATP IPB',
  description: 'Informasi lengkap mengenai Agribusiness and Technology Park IPB.',
};

export default function ProfilPage() {
  return (
    <main>
      <ProfilATP />
    </main>
  );
}