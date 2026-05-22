// src/modules/fasilitas/components/FasilitasModal.tsx
import Image from 'next/image';
import { Fasilitas } from '../data';

interface Props {
  item: Fasilitas;
  onClose: () => void;
}

export default function FasilitasModal({ item, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full h-48 sm:h-64 bg-slate-100">
          <Image
            src={item.gambarUtama}
            alt={item.nama}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 font-body">
          
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#231896] text-xs font-bold rounded-full border border-blue-100 mb-3">
            {item.kategori}
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading mb-6 leading-tight">
            {item.nama}
          </h2>

          <div className="space-y-8">
            
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Penjelasan</h3>
              <p className="text-slate-700 leading-relaxed text-[15px]">
                {item.deskripsiLengkap}
              </p>
            </div>

            <div className="bg-[#f8f9ff] border border-blue-100 rounded-xl p-5 sm:p-6">
              <h3 className="text-sm font-bold text-[#231896] uppercase tracking-wider mb-3">Informasi Tambahan</h3>
              <ul className="space-y-3">
                {item.highlights.map((poin, index) => (
                  <li key={index} className="flex items-start gap-3 text-[15px] text-slate-700">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="leading-snug">{poin}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Komoditas</h3>
              <div className="flex flex-wrap gap-2">
                {item.komoditas.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}