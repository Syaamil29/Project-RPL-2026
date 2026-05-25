import { ReservationForm } from "@/components/reservation";

export default function ReservasiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2D24B5]">
            Agribusiness and Technology Park
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Formulir Reservasi</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Lengkai data berikut untuk mengajukan reservasi fasilitas dan layanan kami. Semua field
            bertanda wajib diisi sesuai jenis kebutuhan yang dipilih.
          </p>
        </header>
        <ReservationForm />
      </div>
    </main>
  );
}
