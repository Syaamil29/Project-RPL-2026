import Image from "next/image";
import Link from "next/link";

const contactItems = [
  { label: "Alamat", value: "Jl. Carang Pulang No. 1, Cikarawang, Kec. Dramaga, Bogor 16680" },
  { label: "Jam Operasional", value: "Senin - Jumat (08.00 - 16.00)" },
  { label: "Telepon", value: "+62 85733392949", href: "tel:+6285733392949" },
  { label: "Email", value: "atp@apps.ipb.ac.id", href: "mailto:atp@apps.ipb.ac.id" },
];

const quickLinks = [
  { label: "IPB Official", href: "https://ipb.ac.id" },
  { label: "Lembaga Pengembangan Agromaritim dan Akselerasi Innopreneurship", href: "#" },
  { label: "SobaTani IPB", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#231896] text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        {/* BRAND */}
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
              <a key={link.label} href={link.href} className="block hover:text-white hover:underline">
                {link.label}
              </a>
            ))}
          </div>

          {/* SOCIAL */}
          <div className="mt-6">
            <a href="#" className="inline-flex items-center gap-2 hover:opacity-80 transition">
              <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} className="invert" />
              <span className="text-sm">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="font-body border-t border-white/10 bg-[#181070] py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} ATP IPB Reservation System. All rights reserved.
      </div>
    </footer>
  )
}