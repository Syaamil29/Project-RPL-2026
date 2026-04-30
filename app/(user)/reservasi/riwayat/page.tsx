"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type ReservationStatus = "pending" | "approved" | "rejected"
type StatusFilter = "all" | ReservationStatus

type ReservationRow = {
  id: string
  nama_lengkap: string
  email: string
  nomor_telepon: string
  tanggal_kunjungan: string
  sesi_kunjungan: "pagi" | "siang" | null
  jumlah_orang: number | null
  fasilitas: string[] | null
  status: ReservationStatus | null
  dokumen_url: string | null
  created_at: string
}

const statusStyles: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

const filterTabs: { label: string; value: StatusFilter }[] = [
  { label: "Semua", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
]

function getSesiLabel(sesi: ReservationRow["sesi_kunjungan"]) {
  if (sesi === "pagi") return "Pagi (08:00 - 12:00)"
  if (sesi === "siang") return "Siang (13:00 - 16:00)"
  return "-"
}

export default function RiwayatReservasiPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailFilter, setEmailFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("reservasi")
        .select(
          "id, nama_lengkap, email, nomor_telepon, tanggal_kunjungan, sesi_kunjungan, jumlah_orang, fasilitas, status, dokumen_url, created_at"
        )
        .order("created_at", { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setReservations([])
        setLoading(false)
        return
      }

      setReservations((data ?? []) as ReservationRow[])
      setLoading(false)
    }

    void fetchReservations()
  }, [])

  const filteredReservations = useMemo(() => {
    const email = emailFilter.trim().toLowerCase()

    return reservations.filter((item) => {
      const normalizedStatus: ReservationStatus =
        item.status === "approved" || item.status === "rejected"
          ? item.status
          : "pending"

      const isEmailMatch = email ? item.email.toLowerCase().includes(email) : true
      const isStatusMatch = statusFilter === "all" ? true : normalizedStatus === statusFilter

      return isEmailMatch && isStatusMatch
    })
  }, [emailFilter, reservations, statusFilter])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Reservasi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Cek status pengajuan reservasi Anda
          </p>
        </header>

        <div className="mb-4">
          <label
            htmlFor="emailFilter"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Masukkan email untuk melihat riwayat reservasi
          </label>
          <input
            id="emailFilter"
            type="text"
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="contoh@email.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Terjadi kesalahan: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Memuat data reservasi...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Belum ada reservasi ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-4">Nama</th>
                  <th className="px-3 py-4">Email</th>
                  <th className="px-3 py-4">Nomor Telepon</th>
                  <th className="px-3 py-4">Tanggal</th>
                  <th className="px-3 py-4">Sesi</th>
                  <th className="px-3 py-4">Jumlah Orang</th>
                  <th className="px-3 py-4">Fasilitas</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Dokumen</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((item) => {
                  const currentStatus: ReservationStatus =
                    item.status === "approved" || item.status === "rejected"
                      ? item.status
                      : "pending"

                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm font-medium text-slate-800">
                        {item.nama_lengkap}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-700">{item.email}</td>
                      <td className="px-3 py-4 text-sm text-slate-700">{item.nomor_telepon}</td>
                      <td className="px-3 py-4 text-sm text-slate-700">{item.tanggal_kunjungan}</td>
                      <td className="px-3 py-4 text-sm text-slate-700">
                        {getSesiLabel(item.sesi_kunjungan)}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-700">
                        {item.jumlah_orang ?? "-"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.fasilitas?.length ? (
                            item.fasilitas.map((fasilitas) => (
                              <span
                                key={fasilitas}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                              >
                                {fasilitas}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[currentStatus]}`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        {item.dokumen_url ? (
                          <a
                            href={item.dokumen_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-blue-700 underline-offset-4 hover:underline"
                          >
                            Lihat Dokumen
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
