"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  type ReservationRow,
  type ReservationStatus,
  ReservationKebutuhan,
  normalizeStatus,
  statusStyles,
  statusLabels,
  getKebutuhanBadge,
  getReservationDetail,
  getReservationJumlahOrang,
} from "@/lib/reservation"

/** Memformat tanggal ISO ke format Indonesia. */
function formatIndoDate(dateStr: string): string {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** Memeriksa apakah reservasi aktif pada tanggal yang ditentukan. */
function isReservationOnDate(row: ReservationRow, dateStr: string): boolean {
  if (!row.tanggal_kunjungan) return false
  if (row.kebutuhan === ReservationKebutuhan.PaketCamping && row.tanggal_selesai_acara) {
    return dateStr >= row.tanggal_kunjungan && dateStr <= row.tanggal_selesai_acara
  }
  return row.tanggal_kunjungan === dateStr
}

export default function AdminJadwalPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [filterKebutuhan, setFilterKebutuhan] = useState<string>("All")

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from("reservasi")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setReservations((data ?? []) as ReservationRow[])
    } catch (err: any) {
      setError(err.message || "Gagal memuat data jadwal")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchReservations()
  }, [fetchReservations])

  /** Mengupdate status reservasi (quick action). */
  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    const confirmed = window.confirm(
      `Yakin ingin mengubah status reservasi menjadi "${statusLabels[status]}"?`
    )
    if (!confirmed) return

    setUpdatingId(id)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("reservasi")
        .update({ status })
        .eq("id", id)

      if (updateError) throw updateError
      
      await fetchReservations()
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate status reservasi")
    } finally {
      setUpdatingId(null)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  let startDayOfWeek = firstDayOfMonth.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDateStr(today.toISOString().split("T")[0])
  }

  const selectDate = (dayNum: number) => {
    const d = new Date(year, month, dayNum)
    const offset = d.getTimezoneOffset()
    const localD = new Date(d.getTime() - offset * 60 * 1000)
    setSelectedDateStr(localD.toISOString().split("T")[0])
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  const activeReservations = reservations.filter(res => normalizeStatus(res.status) !== "rejected")

  const filteredReservations = activeReservations.filter((res) => {
    if (filterKebutuhan === "All") return true
    return res.kebutuhan === filterKebutuhan
  })

  const selectedDateBookings = filteredReservations.filter((res) =>
    isReservationOnDate(res, selectedDateStr)
  )

  const selectedDateAllBookings = reservations.filter((res) =>
    isReservationOnDate(res, selectedDateStr)
  )

  /** Mendapatkan status ketersediaan umum untuk tanggal tertentu. */
  const getAvailabilityStatus = (dateStr: string) => {
    const dateBookings = filteredReservations.filter((res) =>
      isReservationOnDate(res, dateStr)
    )

    if (dateBookings.length === 0) return "free"
    
    const hasApproved = dateBookings.some((b) => normalizeStatus(b.status) === "approved")
    if (hasApproved) return "booked"
    
    return "pending"
  }

  const resourceSlots = {
    agroedutourism: ["Sesi 1 (08.00 - 10.00)", "Sesi 2 (10.00 - 12.00)", "Sesi 3 (13.00 - 15.00)"],
    agripreneurcamp: ["Sesi 1 (Pagi)", "Sesi 2 (Siang)"],
    ruangan: ["Balai Rakyat Indonesia", "Ruang Meeting", "Ruang VIP"],
    camping: ["Paket Camping / Area Acara"],
  }

  /** Mendapatkan status ketersediaan spesifik slot/resource. */
  const getResourceStatus = (kebutuhan: ReservationKebutuhan, name: string) => {
    const matchingBookings = selectedDateBookings.filter((b) => b.kebutuhan === kebutuhan)

    if (kebutuhan === ReservationKebutuhan.Agroedutourism) {
      const match = matchingBookings.find((b) => name.startsWith(b.waktu_kunjungan || ""))
      if (match) return normalizeStatus(match.status)
    }

    if (kebutuhan === ReservationKebutuhan.Agripreneurcamp) {
      const match = matchingBookings.find((b) => name.startsWith(b.waktu_kunjungan || ""))
      if (match) return normalizeStatus(match.status)
    }

    if (kebutuhan === ReservationKebutuhan.PeminjamanRuangan) {
      const match = matchingBookings.find((b) => b.ruangan === name)
      if (match) return normalizeStatus(match.status)
    }

    if (kebutuhan === ReservationKebutuhan.PaketCamping) {
      const match = matchingBookings.find((b) => b.kebutuhan === ReservationKebutuhan.PaketCamping)
      if (match) return normalizeStatus(match.status)
    }

    return "free"
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Visualisasi Jadwal Reservasi</h1>
            <p className="mt-1 text-sm text-slate-600">
              Pantau jadwal free/booked ATP IPB dan proses approval reservasi langsung dari kalender.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/reservasi"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Daftar Tabel Reservasi
            </Link>
            <button
              type="button"
              onClick={() => void fetchReservations()}
              className="rounded-lg bg-[#2D24B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#20188A]"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Layanan Kalender</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterKebutuhan("All")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filterKebutuhan === "All"
                    ? "bg-[#2D24B5] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua Layanan
              </button>
              {Object.values(ReservationKebutuhan).map((keb) => (
                <button
                  key={keb}
                  type="button"
                  onClick={() => setFilterKebutuhan(keb)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    filterKebutuhan === keb
                      ? "bg-[#2D24B5] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {keb.replace("Kunjungan ", "").replace("Pelatihan ", "")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-500">Status Hari:</span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Tersedia</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 font-medium">Ada Pending</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-slate-600 font-medium">Disetujui / Penuh</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            Terjadi kesalahan: {error}
          </p>
        )}

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Calendar Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-2">
            
            {/* Calendar Controls */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  title="Bulan Sebelumnya"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  title="Bulan Berikutnya"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              
              {/* Day Headers */}
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((dayName) => (
                <div key={dayName} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  {dayName}
                </div>
              ))}

              {/* Grid Padding */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square rounded-xl bg-slate-50/50"></div>
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const d = new Date(year, month, dayNum)
                const offset = d.getTimezoneOffset()
                const localD = new Date(d.getTime() - offset * 60 * 1000)
                const cellDateStr = localD.toISOString().split("T")[0]

                const isSelected = cellDateStr === selectedDateStr
                const isToday = new Date().toISOString().split("T")[0] === cellDateStr
                
                const status = getAvailabilityStatus(cellDateStr)
                const statusColors = {
                  free: "border-emerald-100 hover:border-emerald-300 bg-emerald-50/30",
                  pending: "border-amber-100 hover:border-amber-300 bg-amber-50/30",
                  booked: "border-red-100 hover:border-red-300 bg-red-50/30",
                }

                // Gather list of item icons to show inside cell
                const cellBookings = filteredReservations.filter((res) =>
                  isReservationOnDate(res, cellDateStr)
                )

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => selectDate(dayNum)}
                    className={`relative flex aspect-square flex-col justify-between rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? "border-[#2D24B5] bg-blue-50/60 ring-2 ring-[#2D24B5]"
                        : statusColors[status]
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${
                        isToday 
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#2D24B5] text-white" 
                          : isSelected 
                            ? "text-[#2D24B5]" 
                            : "text-slate-700"
                      }`}>
                        {dayNum}
                      </span>
                      {cellBookings.length > 0 && (
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          cellBookings.some(b => normalizeStatus(b.status) === "approved")
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`} />
                      )}
                    </div>

                    {/* Small list of booked badges on desktop */}
                    <div className="hidden sm:flex flex-col gap-0.5 mt-1 overflow-hidden max-h-[60%]">
                      {cellBookings.slice(0, 2).map((booking) => {
                        const s = normalizeStatus(booking.status)
                        const isApp = s === "approved"
                        let label = ""
                        
                        if (booking.kebutuhan === ReservationKebutuhan.Agroedutourism) label = "Agro"
                        else if (booking.kebutuhan === ReservationKebutuhan.Agripreneurcamp) label = "Agri"
                        else if (booking.kebutuhan === ReservationKebutuhan.PeminjamanRuangan) label = booking.ruangan?.split(" ")[0] || "Ruang"
                        else if (booking.kebutuhan === ReservationKebutuhan.PaketCamping) label = "Camping"
                        else label = "Survey"

                        return (
                          <span
                            key={booking.id}
                            className={`block truncate rounded px-1 py-0.5 text-[9px] font-semibold ${
                              isApp
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                            title={`${booking.nama_lengkap} (${booking.instansi})`}
                          >
                            {label}
                          </span>
                        )
                      })}
                      {cellBookings.length > 2 && (
                        <span className="text-[8px] font-medium text-slate-500">
                          +{cellBookings.length - 2} lainnya
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Details / Operations Section */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-1">
            <header className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Detail Layanan & Booking</h2>
              <p className="mt-1 text-sm font-semibold text-[#2D24B5]">
                {formatIndoDate(selectedDateStr)}
              </p>
            </header>

            {loading ? (
              <div className="flex flex-1 items-center justify-center py-10 text-slate-400">
                Memuat data slot...
              </div>
            ) : (
              <div className="flex-1 space-y-6 overflow-y-auto max-h-[600px] pr-1">
                
                {/* Bookings Lists (Admin gets complete breakdown) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Daftar Pengaju Reservasi ({selectedDateAllBookings.length})
                  </h3>
                  
                  {selectedDateAllBookings.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                      Tidak ada reservasi pada tanggal ini
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateAllBookings.map((booking) => {
                        const currentStatus = normalizeStatus(booking.status)
                        const isUpdating = updatingId === booking.id
                        const kebutuhanBadge = getKebutuhanBadge(booking.kebutuhan)

                        return (
                          <div
                            key={booking.id}
                            className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs shadow-sm space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${kebutuhanBadge.className}`}>
                                  {kebutuhanBadge.label}
                                </span>
                                <p className="mt-1 font-semibold text-slate-700">
                                  Detail: {getReservationDetail(booking)}
                                </p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyles[currentStatus]}`}>
                                {statusLabels[currentStatus]}
                              </span>
                            </div>

                            <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-600">
                              <p><span className="font-medium text-slate-800">Nama:</span> {booking.nama_lengkap}</p>
                              <p><span className="font-medium text-slate-800">Instansi:</span> {booking.instansi || "-"}</p>
                              <p><span className="font-medium text-slate-800">Email:</span> {booking.email}</p>
                              <p><span className="font-medium text-slate-800">No. Telp:</span> {booking.nomor_telepon}</p>
                              <p><span className="font-medium text-slate-800">Pengunjung:</span> {getReservationJumlahOrang(booking)}</p>
                            </div>

                            {/* Action Buttons for Pending */}
                            {currentStatus === "pending" && (
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleUpdateStatus(booking.id, "approved")}
                                  className="flex-1 rounded bg-emerald-600 py-1.5 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Setujui
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleUpdateStatus(booking.id, "rejected")}
                                  className="flex-1 rounded border border-red-300 bg-white py-1.5 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Slots Breakdown (Same as user view) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ketersediaan Slot Layanan
                  </h3>

                  {/* Agroedutourism */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Agroedutourism</span>
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-0.5">
                      {resourceSlots.agroedutourism.map((slotName) => {
                        const stat = getResourceStatus(ReservationKebutuhan.Agroedutourism, slotName)
                        return (
                          <div key={slotName} className="flex items-center justify-between py-1.5 text-[11px]">
                            <span className="text-slate-600 font-medium">{slotName}</span>
                            {stat === "approved" ? (
                              <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">Penuh (Disetujui)</span>
                            ) : stat === "pending" ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">Menunggu Approval</span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700">Tersedia</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Peminjaman Ruangan */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">Peminjaman Ruangan</span>
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-0.5">
                      {resourceSlots.ruangan.map((slotName) => {
                        const stat = getResourceStatus(ReservationKebutuhan.PeminjamanRuangan, slotName)
                        return (
                          <div key={slotName} className="flex items-center justify-between py-1.5 text-[11px]">
                            <span className="text-slate-600 font-medium">{slotName}</span>
                            {stat === "approved" ? (
                              <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">Terpesan</span>
                            ) : stat === "pending" ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">Booking Tentative</span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700">Tersedia</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </section>

        </div>

      </section>
    </main>
  )
}
