"use client"

import { useEffect, useMemo, useState } from "react"
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

type StatusFilter = "all" | ReservationStatus

const filterTabs: { label: string; value: StatusFilter }[] = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
]

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

export default function RiwayatReservasiPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError("Anda belum login.")
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("reservasi")
        .select(RESERVASI_SELECT_COLUMNS)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setReservations([])
        setLoading(false)
        return
      }

      setReservations((data ?? []) as unknown as ReservationRow[])
      setLoading(false)
    }

    void fetchReservations()
  }, [])

  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const normalized = normalizeStatus(item.status)
      return statusFilter === "all" ? true : normalized === statusFilter
    })
  }, [reservations, statusFilter])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
        <header className="mb-6 border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2D24B5]">
            Reservasi
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Riwayat Reservasi
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pantau status dan detail pengajuan reservasi Anda berdasarkan jenis layanan.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#2D24B5] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            Terjadi kesalahan: {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Memuat data reservasi...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Belum ada reservasi ditemukan
          </div>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[1240px] border-collapse">
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
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((item) => {
                  const currentStatus = normalizeStatus(item.status)
                  const documentUrl = getReservationDocument(item)

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
