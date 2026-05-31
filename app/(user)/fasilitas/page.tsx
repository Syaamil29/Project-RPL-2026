"use client"

import { useState } from 'react';
import Link from 'next/link'; 
import { DATA_FASILITAS } from '@/src/modules/fasilitas/data';
import FasilitasCard from '@/src/modules/fasilitas/components/FasilitasCard';
import FasilitasModal from '@/src/modules/fasilitas/components/FasilitasModal';

export default function FasilitasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedFasilitas = DATA_FASILITAS.find((item) => item.id === selectedId);

  return (
    
    <main className="bg-[#F8FAFC] min-h-screen pb-20 font-body relative">
      
      {/*  BREADCRUMB  */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-blue-50 hover:border-[#231896] transition-all text-[#231896]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </Link>
          <nav className="text-sm font-medium">
            <span className="text-gray-400">Home</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-[#231896]">Fasilitas ATP</span>
          </nav>
        </div>
      </div>

      {/* KONTEN UTAMA HALAMAN */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#231896] font-heading mb-4 tracking-tight">
            Fasilitas ATP IPB
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Pusat inovasi pertanian modern yang memadukan teknologi cerdas, efisiensi sumber daya, dan praktik budidaya berkelanjutan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DATA_FASILITAS.map((fasilitas) => (
            <FasilitasCard 
              key={fasilitas.id} 
              item={fasilitas} 
              onClick={() => setSelectedId(fasilitas.id)} 
            />
          ))}
        </div>

      </div>

      {selectedFasilitas && (
        <FasilitasModal 
          item={selectedFasilitas} 
          onClose={() => setSelectedId(null)} 
        />
      )}
    </main>
  );
}