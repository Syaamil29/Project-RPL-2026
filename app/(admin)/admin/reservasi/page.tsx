"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  getKebutuhanBadge,
  getReservationDetail,
  getReservationDocument,
  getReservationJumlahOrang,
  getReservationSchedule,
  normalizeStatus,
  RESERVASI_SELECT_COLUMNS,
  statusLabels,
  statusStyles,
  type ReservationRow,
  type ReservationStatus,
} from "@/lib/reservation"

function CellText({ children }: { children: React.ReactNode }) {
  return (
    <span className="block max-w-[200px] break-words text-sm text-slate-700 sm:max-w-none">
      {children}
    </span>
  )
}

function KebutuhanBadge({ kebutuhan }: { kebutuhan: string | null }) {
  const badge = getKebutuhanBadge(kebutuhan)
  return (
    <span
      className={`inline-flex max-w-full whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
      title={kebutuhan ?? undefined}
    >
      {badge.label}
    </span>
  )
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
      .select(RESERVASI_SELECT_COLUMNS)
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setReservations([])
      setLoading(false)
      return
    }

    setReservations((data ?? []) as unknown as ReservationRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchReservations()
  }, [fetchReservations])

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const confirmed = window.confirm(
      `Yakin ingin mengubah status reservasi menjadi "${statusLabels[status]}"?`
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
    (item) => normalizeStatus(item.status) === "pending"
  )
  const historyData = reservations.filter((item) => {
    const s = normalizeStatus(item.status)
    return s === "approved" || s === "rejected"
  })

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
        <table className="w-full min-w-[1320px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Instansi</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Nomor Telepon</th>
              <th className="px-3 py-3">Pengunjung</th>
              <th className="px-3 py-3">Kebutuhan</th>
              <th className="min-w-[140px] px-3 py-3">Detail</th>
              <th className="min-w-[140px] px-3 py-3">Tanggal Kegiatan</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Dokumen</th>
              {showActions ? <th className="px-3 py-3">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const currentStatus = normalizeStatus(item.status)
              const documentUrl = getReservationDocument(item)
              const isUpdating = updatingId === item.id

              return (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 align-top transition hover:bg-slate-50/80"
                >
                  <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                    <CellText>{item.nama_lengkap}</CellText>
                  </td>
                  <td className="px-3 py-4">
                    <CellText>{item.instansi?.trim() || "-"}</CellText>
                  </td>
                  <td className="px-3 py-4">
                    <CellText>{item.email}</CellText>
                  </td>
                  <td className="px-3 py-4">
                    <CellText>{item.nomor_telepon}</CellText>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <CellText>{getReservationJumlahOrang(item)}</CellText>
                  </td>
                  <td className="px-3 py-4">
                    <KebutuhanBadge kebutuhan={item.kebutuhan} />
                  </td>
                  <td className="px-3 py-4">
                    <CellText>{getReservationDetail(item)}</CellText>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <CellText>{getReservationSchedule(item)}</CellText>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[currentStatus]}`}
                    >
                      {statusLabels[currentStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    {documentUrl ? (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex whitespace-nowrap font-semibold text-[#2D24B5] underline-offset-4 hover:underline"
                      >
                        Lihat Dokumen
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  {showActions ? (
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(item.id, "approved")}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleUpdateStatus(item.id, "rejected")}
                          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  ) : null}
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
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Reservasi</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola status pengajuan reservasi ATP IPB.
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
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            Terjadi kesalahan: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-md">
            Memuat data reservasi...
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Menunggu Persetujuan</h2>
                <p className="text-sm text-slate-600">Reservasi yang belum diproses</p>
              </div>
              {renderTable(pendingData, true)}
            </section>

            <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Riwayat Reservasi</h2>
                <p className="text-sm text-slate-600">Reservasi yang sudah disetujui atau ditolak</p>
              </div>
              {renderTable(historyData, false)}
            </section>
          </div>
        )}
      </section>
    </main>
  )
}
