import Link from 'next/link';
import Image from 'next/image';
import { DATA_PROFIL_ATP } from '../data';

export default function ProfilATP() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </Link>
          <nav className="text-sm font-medium">
            <span className="text-gray-400">Home</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-blue-700">Profil Detail ATP</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image 
                  src="/tentang-image.png" 
                  alt="ATP IPB" 
                  fill 
                  className="object-cover transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider">
                Tentang Kami
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {DATA_PROFIL_ATP.nama}
                <span className="block text-2xl md:text-3xl text-blue-700 font-bold mt-3">
                  {DATA_PROFIL_ATP.tagline}
                </span>
              </h1>
              
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                {DATA_PROFIL_ATP.deskripsi.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Tujuan */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Tujuan</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {DATA_PROFIL_ATP.tujuan}
            </p>
          </div>

          {/* Card: Manfaat */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Manfaat</h3>
            <ul className="space-y-2">
              {DATA_PROFIL_ATP.manfaat.slice(0, 3).map((m, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span> {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Card: Kegiatan */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Kegiatan</h3>
            <div className="flex flex-wrap gap-2">
              {DATA_PROFIL_ATP.agroedutourism.kegiatan.map((k, i) => (
                <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Card: Fasilitas */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Fasilitas</h3>
            <ul className="grid grid-cols-1 gap-2">
              {DATA_PROFIL_ATP.fasilitasHighlight.map((f, i) => (
                <li key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium">
                  {f}
                </li>
              ))}
            </ul>
          </div>

        </section>
      </div>
    </div>
  );
}