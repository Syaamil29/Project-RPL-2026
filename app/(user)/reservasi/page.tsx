"use client"

import type { ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { isAdmin } from "@/lib/auth"
import { createBrowserClient as createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session } from "@supabase/supabase-js"

const facilityOptions = [
  "Laboratorium Hidroponik",
  "Greenhouse",
  "Kebun Organik",
  "Laboratorium Bioteknologi",
  "Ruang Seminar",
  "Area Penelitian",
] as const

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

const errorInputClassName = 
  "w-full rounded-xl border border-red-500 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-600 focus:ring-4 focus:ring-red-100"

type ReservationForm = {
  namaLengkap: string
  instansi: string
  email: string
  nomorTelepon: string
  tanggalKunjungan: string
  sesiKunjungan: "pagi" | "siang" | ""
  jumlahOrang: string
  tujuanKunjungan: string
}

const initialForm: ReservationForm = {
  namaLengkap: "",
  instansi: "",
  email: "",
  nomorTelepon: "",
  tanggalKunjungan: "",
  sesiKunjungan: "",
  jumlahOrang: "",
  tujuanKunjungan: "",
}

export default function ReservasiPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase =
    supabaseUrl && supabaseAnonKey
      ? createClientComponentClient(supabaseUrl, supabaseAnonKey)
      : null
  const [form, setForm] = useState<ReservationForm>(initialForm)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationForm | "fasilitas" | "dokumen", string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const validatePhone = (phone: string) => {
    const re = /^[0-9]{10,}$/
    return re.test(phone)
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ReservationForm | "fasilitas" | "dokumen", string>> = {}
    
    if (!form.namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi"
    }

    if (!form.instansi.trim()) {
      newErrors.instansi = "Nama instansi wajib diisi"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!form.nomorTelepon.trim() || !validatePhone(form.nomorTelepon)) {
      newErrors.nomorTelepon = "Nomor telepon tidak valid"
    }

    if (!form.jumlahOrang.trim() || !/^\d+$/.test(form.jumlahOrang) || parseInt(form.jumlahOrang, 10) < 1) {
      newErrors.jumlahOrang = "Jumlah orang harus berupa angka dan minimal 1"
    }

    if (!form.tanggalKunjungan) {
      newErrors.tanggalKunjungan = "Tanggal kunjungan wajib diisi"
    }

    if (!form.tujuanKunjungan.trim()) {
      newErrors.tujuanKunjungan = "Tujuan kunjungan wajib diisi"
    }

    if (!form.sesiKunjungan) {
      newErrors.sesiKunjungan = "Sesi kunjungan wajib dipilih"
    }

    if (selectedFacilities.length === 0) {
      newErrors.fasilitas = "Pilih minimal satu fasilitas"
    }

    if (uploadedFile) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!validTypes.includes(uploadedFile.type)) {
        newErrors.dokumen = "Format file tidak didukung"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange =
    (field: keyof ReservationForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      setErrors((prev) => {
        if (prev[field]) {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        }
        return prev
      })
    }

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities((prev) => {
      const newFacilities = prev.includes(facility) ? prev.filter((item) => item !== facility) : [...prev, facility]
      if (newFacilities.length > 0) {
        setErrors((errs) => {
          if (errs.fasilitas) {
            const newErrs = { ...errs }
            delete newErrs.fasilitas
            return newErrs
          }
          return errs
        })
      }
      return newFacilities
    })
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/pjpeg"]
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, dokumen: "Format file tidak didukung" }))
        setUploadedFile(null)
        event.target.value = "" // Reset input
        return
      }
    }
    
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.dokumen
      return newErrors
    })
    setUploadedFile(file)
  }

  const handleCancel = () => {
    setForm(initialForm)
    setSelectedFacilities([])
    setUploadedFile(null)
    setSubmitError(null)
    setSuccessMessage(null)
    setErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSubmitError(null)
    setSuccessMessage(null)

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setIsSubmitting(true)

    if (!supabase) {
      setSubmitError("Supabase environment belum terkonfigurasi.")
      setIsSubmitting(false)
      return
    }

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    console.log("SESSION:", session)

    if (sessionError || !session) {
      setIsSubmitting(false)
      
      alert("Silakan login kembali")

      localStorage.setItem("redirectAfterLogin", "/reservasi")
      localStorage.setItem("formData", JSON.stringify({
        form,
        selectedFacilities
      }))

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return
    }

    let dokumenUrl: string | null = null

    if (uploadedFile) {
      const sanitizedName = uploadedFile.name.replace(/\s+/g, "-")
      const filePath = `${Date.now()}-${sanitizedName}`

      const { error: uploadError } = await supabase
        .storage
        .from("dokumen")
        .upload(filePath, uploadedFile)

      if (uploadError) {
        setSubmitError("Gagal menyimpan reservasi")
        setIsSubmitting(false)
        return
      }

      const { data } = supabase.storage.from("dokumen").getPublicUrl(filePath)
      dokumenUrl = data.publicUrl
    }

    const sesiMap: Record<string, "Pagi" | "Siang"> = {
      pagi: "Pagi",
      siang: "Siang",
    }

    const payload = {
      user_id: session.user.id,
      nama_lengkap: form.namaLengkap,
      instansi: form.instansi,
      email: form.email,
      nomor_telepon: form.nomorTelepon,
      tanggal_kunjungan: form.tanggalKunjungan,
      sesi_kunjungan: form.sesiKunjungan ? sesiMap[form.sesiKunjungan] : null,
      jumlah_orang: form.jumlahOrang ? parseInt(form.jumlahOrang, 10) : null,
      tujuan_kunjungan: form.tujuanKunjungan,
      fasilitas: selectedFacilities,
      status: "pending",
      dokumen_url: dokumenUrl,
    }

    const { error } = await supabase.from("reservasi").insert(payload)

    if (error) {
      setSubmitError("Gagal menyimpan reservasi")
      setIsSubmitting(false)
      return
    }

    setSuccessMessage("Reservasi berhasil dikirim")

    localStorage.removeItem("formData")

    setForm(initialForm)
    setSelectedFacilities([])
    setUploadedFile(null)
    setErrors({})
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">
            Reservasi Kunjungan ATP IPB
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Silakan isi form berikut untuk melakukan reservasi kunjungan.
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-amber-400" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 lg:col-span-2">
            <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
              {successMessage ? (
                <div className="sm:col-span-2 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
                  {successMessage}
                </div>
              ) : null}
              {submitError ? (
                <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
                  {submitError}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="nama_lengkap"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nama Lengkap
                </label>
                <input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className={errors.namaLengkap ? errorInputClassName : inputClassName}
                  value={form.namaLengkap}
                  onChange={handleChange("namaLengkap")}
                />
                {errors.namaLengkap && <p className="mt-1 text-xs text-red-500">{errors.namaLengkap}</p>}
              </div>

              <div>
                <label
                  htmlFor="instansi"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nama Instansi / Organisasi
                </label>
                <input
                  id="instansi"
                  name="instansi"
                  type="text"
                  placeholder="Masukkan nama instansi"
                  className={errors.instansi ? errorInputClassName : inputClassName}
                  value={form.instansi}
                  onChange={handleChange("instansi")}
                />
                {errors.instansi && <p className="mt-1 text-xs text-red-500">{errors.instansi}</p>}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  className={errors.email ? errorInputClassName : inputClassName}
                  value={form.email}
                  onChange={handleChange("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label
                  htmlFor="nomor_telepon"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Nomor Telepon
                </label>
                <input
                  id="nomor_telepon"
                  name="nomor_telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className={errors.nomorTelepon ? errorInputClassName : inputClassName}
                  value={form.nomorTelepon}
                  onChange={handleChange("nomorTelepon")}
                />
                {errors.nomorTelepon && <p className="mt-1 text-xs text-red-500">{errors.nomorTelepon}</p>}
              </div>

              <div>
                <label
                  htmlFor="tanggal_kunjungan"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Tanggal Kunjungan
                </label>
                <input
                  id="tanggal_kunjungan"
                  name="tanggal_kunjungan"
                  type="date"
                  className={errors.tanggalKunjungan ? errorInputClassName : inputClassName}
                  value={form.tanggalKunjungan}
                  onChange={handleChange("tanggalKunjungan")}
                />
                {errors.tanggalKunjungan && <p className="mt-1 text-xs text-red-500">{errors.tanggalKunjungan}</p>}
              </div>

              <div>
                <label
                  htmlFor="jumlah_orang"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Jumlah Orang
                </label>
                <input
                  id="jumlah_orang"
                  name="jumlah_orang"
                  type="number"
                  min="1"
                  placeholder="Misal: 5"
                  className={errors.jumlahOrang ? errorInputClassName : inputClassName}
                  value={form.jumlahOrang}
                  onChange={handleChange("jumlahOrang")}
                />
                {errors.jumlahOrang && <p className="mt-1 text-xs text-red-500">{errors.jumlahOrang}</p>}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="tujuan_kunjungan"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Tujuan Kunjungan
                </label>
                <textarea
                  id="tujuan_kunjungan"
                  name="tujuan_kunjungan"
                  rows={3}
                  placeholder="Ceritakan singkat tujuan kunjungan Anda"
                  className={errors.tujuanKunjungan ? errorInputClassName : inputClassName}
                  value={form.tujuanKunjungan}
                  onChange={handleChange("tujuanKunjungan")}
                />
                {errors.tujuanKunjungan && (
                  <p className="mt-1 text-xs text-red-500">{errors.tujuanKunjungan}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sesi_kunjungan"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Sesi Kunjungan
                </label>
                <select
                  id="sesi_kunjungan"
                  name="sesi_kunjungan"
                  className={errors.sesiKunjungan ? errorInputClassName : inputClassName}
                  value={form.sesiKunjungan}
                  onChange={handleChange("sesiKunjungan")}
                >
                  <option value="">Pilih sesi kunjungan</option>
                  <option value="pagi">Pagi (08:00 - 12:00)</option>
                  <option value="siang">Siang (13:00 - 16:00)</option>
                </select>
                {errors.sesiKunjungan && (
                  <p className="mt-1 text-xs text-red-500">{errors.sesiKunjungan}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Pilih Fasilitas yang Ingin Dikunjungi
                </p>
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                  {facilityOptions.map((facility) => (
                    <label
                      key={facility}
                      htmlFor={facility}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 transition ${
                        errors.fasilitas ? "border-red-500 hover:border-red-600" : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        id={facility}
                        type="checkbox"
                        checked={selectedFacilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className={`h-4 w-4 rounded ${errors.fasilitas ? "border-red-500 text-red-600 focus:ring-red-400" : "border-slate-300 text-blue-700 focus:ring-blue-400"}`}
                      />
                      <span>{facility}</span>
                    </label>
                  ))}
                </div>
                {errors.fasilitas && <p className="mt-1 text-xs text-red-500">{errors.fasilitas}</p>}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="dokumen"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Upload Dokumen (Opsional)
                </label>
                <div className={`rounded-xl border ${errors.dokumen ? "border-red-500" : "border-slate-200"} bg-slate-50 p-2 shadow-sm`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      htmlFor="dokumen"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
                    >
                      Choose File
                    </label>
                    <input
                      id="dokumen"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-slate-600">
                      {uploadedFile ? uploadedFile.name : "No file chosen"}
                    </p>
                  </div>
                </div>
                {errors.dokumen ? (
                  <p className="mt-1 text-xs text-red-500">{errors.dokumen}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">PDF, JPG, PNG</p>
                )}
              </div>

              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : "Kirim Reservasi"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <h2 className="text-xl font-semibold text-blue-900">Informasi Kontak</h2>

            <div className="mt-5 space-y-5 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-800">Alamat</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  Jl. Raya Dramaga, Kampus IPB Dramaga, Bogor 16680, Jawa Barat
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">Telepon</p>
                <p className="mt-1 text-slate-600">(0251) 8628448</p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">Email</p>
                <p className="mt-1 text-slate-600">atp@ipb.ac.id</p>
              </div>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-800">Jam Operasional</p>
              <p className="mt-1 text-sm text-slate-600">Senin - Jumat</p>
              <p className="text-sm text-slate-600">08:00 - 16:00</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
