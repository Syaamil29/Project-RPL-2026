import Image from 'next/image';
import { Fasilitas } from '../data';

interface Props {
  item: Fasilitas;
  onClick: () => void;
}

export default function FasilitasCard({ item, onClick }: Props) {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-slate-200 transition-all duration-300 group h-full">
      
      <div className="relative w-full h-52 bg-slate-200 overflow-hidden">
        <Image
          src={item.gambarUtama}
          alt={item.nama}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      <div className="flex flex-col flex-grow p-6">
        
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#231896] text-xs font-bold rounded-full border border-blue-100">
            {item.kategori}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug font-heading">
          {item.nama}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow font-body leading-relaxed">
          {item.deskripsiSingkat}
        </p>

        <button
          onClick={onClick}
          className="mt-auto inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-50 text-[#231896] text-sm font-bold rounded-xl border border-slate-200 hover:bg-[#231896] hover:text-white hover:border-[#231896] transition-all duration-300"
        >
          Baca Selengkapnya
        </button>
      </div>
    </div>
  );
}