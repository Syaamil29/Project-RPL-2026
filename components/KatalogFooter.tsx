export function KatalogFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-bold text-blue-900">ATP IPB University</p>
          <p className="text-sm text-slate-500">Jl. Raya Dramaga, Kampus IPB Dramaga, Bogor</p>
        </div>
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Agribusiness and Technology Park IPB.
        </p>
      </div>
    </footer>
  )
}
