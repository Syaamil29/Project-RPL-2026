import Image from "next/image";
import Link from "next/link";
import { getProfilSettings } from "@/src/modules/profil/service";
import { DATA_PROFIL_ATP } from "@/src/modules/profil/data";

const quickLinks = [
  { label: "IPB Official", href: "https://ipb.ac.id" },
  { label: "Lembaga Pengembangan Agromaritim dan Akselerasi Innopreneurship", href: "https://instagram.com/agromaritim.ipb" },
  { label: "SobaTani IPB", href: "https://instagram.com/sobatani.ipb" },
];

export default async function Footer() {
  const dynamicData = await getProfilSettings();
  
  const data = {
    email: dynamicData?.email ?? DATA_PROFIL_ATP.kontak.email,
    telepon: dynamicData?.no_telepon ?? DATA_PROFIL_ATP.kontak.telepon,
    jam: dynamicData?.jam_operasional ?? DATA_PROFIL_ATP.kontak.jam_operasional,
    alamat: DATA_PROFIL_ATP.kontak.alamat, 
    instagram: dynamicData?.link_instagram,
  };

  const contactItems = [
    { label: "Alamat", value: data.alamat },
    { label: "Jam Operasional", value: data.jam },
    { label: "Telepon", value: data.telepon, href: `tel:${data.telepon.replace(/\s+/g, '')}` },
    { label: "Email", value: data.email, href: `mailto:${data.email}` },
  ];

  return (
    <footer className="bg-[#231896] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        
        <div>
          <h2 className="font-heading text-xl font-bold tracking-wide">
            Agribusiness and Technology Park
          </h2>
          <p className="font-body mt-4 text-sm text-white/80 leading-relaxed">
            Pusat inovasi dan edukasi pertanian modern IPB University. Menghubungkan riset akademik dengan praktik agrobisnis nyata.
          </p>
        </div>

        {/* CONTACT */}
        <div className="font-body">
          <h3 className="font-heading text-lg font-semibold text-white">Kontak Kami</h3>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            {contactItems.map((item) => (
              <div key={item.label}>
                <p className="font-semibold text-white">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="hover:text-blue-300 hover:underline transition">
                    {item.value}
                  </a>
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* QUICK LINKS + SOCIAL */}
        <div className="font-body">
          <h3 className="font-heading text-lg font-semibold text-white">Quick Links</h3>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href} className="block hover:text-white hover:underline">
                {link.label}
              </Link>
            ))}
          </div>

          {/* SOCIAL  */}
          {data.instagram && (
            <div className="mt-6">
              <Link href={data.instagram} target="_blank" className="inline-flex items-center gap-2 hover:opacity-80 transition">
                <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} className="invert" />
                <span className="text-sm">Instagram</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="font-body border-t border-white/10 bg-[#181070] py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} ATP IPB Reservation System. All rights reserved.
      </div>
    </footer>
  )
}