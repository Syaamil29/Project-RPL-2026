"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type ReservationStatus = "pending" | "approved" | "rejected"

type ReservationRow = {
  id: string
  nama_lengkap: string
  email: string
  nomor_telepon: string
  tanggal_kunjungan: string
  sesi_kunjungan: "Pagi" | "Siang" | null
  jumlah_orang: number | null
  tujuan_kunjungan: string | null
  fasilitas: string[] | null
  status: ReservationStatus | null
  dokumen_url: string | null
  created_at: string
}

const getSesiLabel = (sesi: ReservationRow["sesi_kunjungan"]) => {
  if (sesi === "Pagi") return "Pagi (08:00 - 12:00)"
  if (sesi === "Siang") return "Siang (13:00 - 16:00)"
  return "-"
}

const statusStyles: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function AdminReservasiPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    setError(null)
    setLoading(true)

    const { data, error: fetchError } = await supabase
      .from("reservasi")
      .select(
        "id, nama_lengkap, email, nomor_telepon, tanggal_kunjungan, sesi_kunjungan, jumlah_orang, tujuan_kunjungan, fasilitas, status, dokumen_url, created_at"
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
  }, [])

  useEffect(() => {
    void fetchReservations()
  }, [fetchReservations])

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const confirmed = window.confirm(
      `Yakin ingin mengubah status reservasi menjadi "${status}"?`
    )
    if (!confirmed) return

    setUpdatingId(id)
    setError(null)

    const { error: updateError } = await supabase
      .from("reservasi")
      .update({ status })
      .eq("id", id)

    if (updateError) {
      setError(updateError.message)
      setUpdatingId(null)
      return
    }

    await fetchReservations()
    setUpdatingId(null)
  }

  const pendingData = reservations.filter(
    (item) => (item.status ?? "pending") === "pending"
  )
  const historyData = reservations.filter(
    (item) => item.status === "approved" || item.status === "rejected"
  )

  const renderTable = (data: ReservationRow[], showActions: boolean) => {
    if (data.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Tidak ada data reservasi
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-4">Nama</th>
              <th className="px-3 py-4">Email</th>
              <th className="px-3 py-4">Nomor Telepon</th>
              <th className="px-3 py-4">Tanggal</th>
              <th className="px-3 py-4">Sesi</th>
              <th className="px-3 py-4">Jumlah Orang</th>
              <th className="px-3 py-4">Tujuan</th>
              <th className="px-3 py-4">Fasilitas</th>
              <th className="px-3 py-4">Status</th>
              <th className="px-3 py-4">Dokumen</th>
              <th className="px-3 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const currentStatus: ReservationStatus =
                item.status === "approved" || item.status === "rejected"
                  ? item.status
                  : "pending"
              const isUpdating = updatingId === item.id

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
                  <td className="px-3 py-4 text-sm text-slate-700">{item.jumlah_orang ?? "-"}</td>
                  <td className="px-3 py-4 text-sm text-slate-700">{item.tujuan_kunjungan ?? "-"}</td>
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
                  <td className="px-3 py-4">
                    {showActions ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(item.id, "approved")}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(item.id, "rejected")}
                          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Reservasi</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola status pengajuan reservasi kunjungan ATP IPB.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchReservations()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh Data
          </button>
        </div>

        {error ? (
          <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Terjadi kesalahan: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-md">
            Memuat data reservasi...
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Pending Approval</h2>
                <p className="text-sm text-slate-600">
                  Reservasi yang menunggu persetujuan
                </p>
              </div>
              {renderTable(pendingData, true)}
            </section>

            <section className="mb-12 rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Riwayat Reservasi</h2>
                <p className="text-sm text-slate-600">Reservasi yang sudah diproses</p>
              </div>
              {renderTable(historyData, false)}
            </section>
          </div>
        )}
      </section>
    </main>
  )
}
