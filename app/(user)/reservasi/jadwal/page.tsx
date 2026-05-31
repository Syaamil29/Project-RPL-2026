"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  type ReservationRow,
  ReservationKebutuhan,
  normalizeStatus,
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

export default function UserJadwalPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
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
        .or("status.eq.approved,status.eq.pending")

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

  const filteredReservations = reservations.filter((res) => {
    if (filterKebutuhan === "All") return true
    return res.kebutuhan === filterKebutuhan
  })

  const selectedDateBookings = filteredReservations.filter((res) =>
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
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <header className="mb-8 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2D24B5]">
            Agribusiness and Technology Park IPB
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Jadwal Ketersediaan Layanan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Periksa ketersediaan tanggal dan slot waktu untuk fasilitas dan layanan ATP IPB sebelum mengajukan reservasi.
          </p>
        </header>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Layanan</span>
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
            <span className="text-xs font-semibold text-slate-500">Keterangan:</span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Tersedia</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="text-slate-600 font-medium">Menunggu</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-slate-600 font-medium">Penuh</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            Gagal mengambil data jadwal: {error}
          </p>
        )}

        {/* Main Content Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          
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

          {/* Details Section */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-1">
            <header className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Detail Status Ketersediaan</h2>
              <p className="mt-1 text-sm font-semibold text-[#2D24B5]">
                {formatIndoDate(selectedDateStr)}
              </p>
            </header>

            {loading ? (
              <div className="flex flex-1 items-center justify-center py-10 text-slate-400">
                Memuat data slot...
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                
                {/* 1. Agroedutourism Sesi */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Agroedutourism</h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1">
                    {resourceSlots.agroedutourism.map((slotName) => {
                      const stat = getResourceStatus(ReservationKebutuhan.Agroedutourism, slotName)
                      return (
                        <div key={slotName} className="flex items-center justify-between py-2.5 text-xs">
                          <span className="font-semibold text-slate-700">{slotName}</span>
                          {stat === "approved" ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">Penuh (Disetujui)</span>
                          ) : stat === "pending" ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-700">Menunggu Approval</span>
                          ) : (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Tersedia</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Agripreneurcamp Sesi */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Agripreneurcamp</h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1">
                    {resourceSlots.agripreneurcamp.map((slotName) => {
                      const stat = getResourceStatus(ReservationKebutuhan.Agripreneurcamp, slotName)
                      return (
                        <div key={slotName} className="flex items-center justify-between py-2.5 text-xs">
                          <span className="font-semibold text-slate-700">{slotName}</span>
                          {stat === "approved" ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">Penuh (Disetujui)</span>
                          ) : stat === "pending" ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-700">Menunggu Approval</span>
                          ) : (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Tersedia</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Peminjaman Ruangan */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Peminjaman Ruangan</h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1">
                    {resourceSlots.ruangan.map((slotName) => {
                      const stat = getResourceStatus(ReservationKebutuhan.PeminjamanRuangan, slotName)
                      return (
                        <div key={slotName} className="flex items-center justify-between py-2.5 text-xs">
                          <span className="font-semibold text-slate-700">{slotName}</span>
                          {stat === "approved" ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">Terpesan</span>
                          ) : stat === "pending" ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-700">Booking Tentative</span>
                          ) : (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Tersedia</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Camping */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Paket Camping</h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1">
                    {resourceSlots.camping.map((slotName) => {
                      const stat = getResourceStatus(ReservationKebutuhan.PaketCamping, slotName)
                      return (
                        <div key={slotName} className="flex items-center justify-between py-2.5 text-xs">
                          <span className="font-semibold text-slate-700">{slotName}</span>
                          {stat === "approved" ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">Terpakai</span>
                          ) : stat === "pending" ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-700">Menunggu Approval</span>
                          ) : (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">Tersedia</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 5. Survey / Wawancara (Custom list for scheduled time strings) */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Survey / Wawancara</h3>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-xs">
                    {selectedDateBookings.filter(b => b.kebutuhan === ReservationKebutuhan.SurveyWawancara).length === 0 ? (
                      <div className="text-emerald-700 font-semibold flex items-center justify-between">
                        <span>Semua Jam Tersedia</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold">Tersedia</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedDateBookings
                          .filter(b => b.kebutuhan === ReservationKebutuhan.SurveyWawancara)
                          .map((b) => {
                            const isApp = normalizeStatus(b.status) === "approved"
                            return (
                              <div key={b.id} className="flex items-center justify-between">
                                <span className="font-medium text-slate-700">
                                  Jam {b.waktu_kunjungan || "-"} WIB
                                </span>
                                <span className={`rounded px-2 py-0.5 font-bold ${
                                  isApp ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isApp ? "Terisi" : "Tentative"}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Removed redirect button */}
              </div>
            )}
          </section>

        </div>

      </div>
    </main>
  )
}
