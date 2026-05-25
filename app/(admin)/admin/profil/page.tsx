"use client"

import AdminProfilForm from "@/src/modules/profil/components/AdminProfilForm"

export default function AdminProfilPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Pengaturan Profil ATP</h1>
          <p className="mt-2 text-sm text-slate-600">
            Perbarui informasi kontak dan profil Agribusiness and Technology Park (ATP) IPB University yang tampil di website utama.
          </p>
        </header>

        <AdminProfilForm />
      </section>
    </main>
  )
}
