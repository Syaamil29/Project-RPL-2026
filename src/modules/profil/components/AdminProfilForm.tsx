"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { getProfilSettings, updateProfilSettings } from "../service"

// Definisikan Zod Schema untuk validasi form profil
const profilSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format alamat email tidak valid (contoh: atp@apps.ipb.ac.id atau atp@gmail.com)"),
  no_telepon: z
    .string()
    .min(8, "Nomor telepon minimal terdiri dari 8 karakter")
    .regex(/^[+0-9\s-]+$/, "Nomor telepon hanya boleh berisi angka, tanda hubung (-), spasi, atau awalan (+)"),
  jam_operasional: z
    .string()
    .min(1, "Jam operasional wajib diisi"),
  link_instagram: z
    .string()
    .min(1, "Link Instagram wajib diisi")
    .url("Link Instagram harus berupa URL valid (contoh: https://instagram.com/akun)")
})

export default function AdminProfilForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [email, setEmail] = useState("")
  const [noTelepon, setNoTelepon] = useState("")
  const [jamOperasional, setJamOperasional] = useState("")
  const [linkInstagram, setLinkInstagram] = useState("")

  // State untuk menyimpan error validasi per kolom
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setValidationErrors({})
      const data = await getProfilSettings()
      
      if (data) {
        setEmail(data.email || "")
        setNoTelepon(data.no_telepon || "")
        setJamOperasional(data.jam_operasional || "")
        setLinkInstagram(data.link_instagram || "")
      } else {
        setError("Gagal memuat data profil. Pastikan data profil_settings dengan ID 1 telah tersedia.")
      }
    } catch (err: any) {
      console.error("Gagal memuat profil:", err)
      setError(err.message || "Gagal mengambil data dari database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    // 2. Validasi input menggunakan Zod
    const validationResult = profilSchema.safeParse({
      email,
      no_telepon: noTelepon,
      jam_operasional: jamOperasional,
      link_instagram: linkInstagram,
    })

    // Jika validasi gagal, simpan list error dan hentikan proses
    if (!validationResult.success) {
      const errors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        errors[path] = issue.message
      })
      setValidationErrors(errors)
      setSaving(false)
      return
    }

    try {
      // 3. Jika validasi lolos, lakukan update ke database
      await updateProfilSettings({
        email,
        no_telepon: noTelepon,
        jam_operasional: jamOperasional,
        link_instagram: linkInstagram,
      })

      setSuccess("Profil ATP berhasil diperbarui!")
      void loadData()
    } catch (err: any) {
      console.error("Gagal memperbarui profil:", err)
      setError(
        err.message || "Gagal menyimpan perubahan. Pastikan Anda memiliki hak akses admin di Supabase RLS."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-200 shadow-sm flex items-start gap-3 animate-fade-in">
          <svg
            className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <span className="font-semibold block">Gagal Menyimpan / Memuat Data:</span>
            <p className="mt-1 text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-600 font-medium leading-relaxed">
              Tip: Pastikan tabel <code className="bg-red-100 px-1 py-0.5 rounded">profil_settings</code> dengan <code className="bg-red-100 px-1 py-0.5 rounded">id = 1</code> sudah ada di Supabase dan RLS (Row Level Security) telah diizinkan untuk UPDATE.
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 shadow-sm flex items-center gap-3 animate-fade-in">
          <svg
            className="h-5 w-5 text-emerald-600 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-md flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[#2D24B5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Memuat informasi profil dari database...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-8 space-y-6"
        >
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            Informasi Kontak & Detail
          </h2>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Alamat Email ATP
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {/* SVG Icon Email */}
                <svg className={`w-5 h-5 transition-colors ${validationErrors.email ? "text-red-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: "" }))
                  }
                }}
                placeholder="contoh: atp@apps.ipb.ac.id"
                className={`w-full rounded-lg border pl-11 pr-4 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-1 ${
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                    : "border-slate-300 focus:border-[#2D24B5] focus:ring-[#2D24B5]"
                }`}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* No Telepon Field */}
          <div>
            <label htmlFor="no_telepon" className="block text-sm font-semibold text-slate-700 mb-2">
              Nomor Telepon / Handphone
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {/* SVG Icon Phone */}
                <svg className={`w-5 h-5 transition-colors ${validationErrors.no_telepon ? "text-red-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="no_telepon"
                type="text"
                value={noTelepon}
                onChange={(e) => {
                  setNoTelepon(e.target.value)
                  if (validationErrors.no_telepon) {
                    setValidationErrors(prev => ({ ...prev, no_telepon: "" }))
                  }
                }}
                placeholder="contoh: +62 812-3456-7890"
                className={`w-full rounded-lg border pl-11 pr-4 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-1 ${
                  validationErrors.no_telepon
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                    : "border-slate-300 focus:border-[#2D24B5] focus:ring-[#2D24B5]"
                }`}
              />
            </div>
            {validationErrors.no_telepon && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.no_telepon}
              </p>
            )}
          </div>

          {/* Jam Operasional Field */}
          <div>
            <label htmlFor="jam_operasional" className="block text-sm font-semibold text-slate-700 mb-2">
              Jam Operasional
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {/* SVG Icon Clock */}
                <svg className={`w-5 h-5 transition-colors ${validationErrors.jam_operasional ? "text-red-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="jam_operasional"
                type="text"
                value={jamOperasional}
                onChange={(e) => {
                  setJamOperasional(e.target.value)
                  if (validationErrors.jam_operasional) {
                    setValidationErrors(prev => ({ ...prev, jam_operasional: "" }))
                  }
                }}
                placeholder="contoh: Senin - Jumat, 08:00 - 16:00 WIB"
                className={`w-full rounded-lg border pl-11 pr-4 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-1 ${
                  validationErrors.jam_operasional
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                    : "border-slate-300 focus:border-[#2D24B5] focus:ring-[#2D24B5]"
                }`}
              />
            </div>
            {validationErrors.jam_operasional && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.jam_operasional}
              </p>
            )}
          </div>

          {/* Link Instagram Field */}
          <div>
            <label htmlFor="link_instagram" className="block text-sm font-semibold text-slate-700 mb-2">
              Link Instagram
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                {/* SVG Icon Instagram */}
                <svg className={`w-5 h-5 transition-colors ${validationErrors.link_instagram ? "text-red-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} />
                  <path strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </div>
              <input
                id="link_instagram"
                type="text"
                value={linkInstagram}
                onChange={(e) => {
                  setLinkInstagram(e.target.value)
                  if (validationErrors.link_instagram) {
                    setValidationErrors(prev => ({ ...prev, link_instagram: "" }))
                  }
                }}
                placeholder="contoh: https://instagram.com/atp.ipb"
                className={`w-full rounded-lg border pl-11 pr-4 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-1 ${
                  validationErrors.link_instagram
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                    : "border-slate-300 focus:border-[#2D24B5] focus:ring-[#2D24B5]"
                }`}
              />
            </div>
            {validationErrors.link_instagram && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.link_instagram}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset Data
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-[#2D24B5] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20188A] disabled:cursor-not-allowed disabled:opacity-60 gap-2 min-w-[140px]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
