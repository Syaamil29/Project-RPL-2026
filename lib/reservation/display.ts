import { ReservationKebutuhan } from "./types";
import type { ReservationRow } from "./row";

function displayValue(value: string | number | null | undefined): string {
  if (value == null || String(value).trim() === "") return "-";
  return String(value).trim();
}

export function formatReservationDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(mulai: string | null | undefined, selesai: string | null | undefined): string {
  if (mulai && selesai && mulai !== selesai) {
    return `${formatReservationDate(mulai)} – ${formatReservationDate(selesai)}`;
  }
  return formatReservationDate(mulai ?? selesai);
}

function joinDetail(...parts: (string | null | undefined)[]): string {
  const values = parts
    .map((p) => (p == null ? "" : String(p).trim()))
    .filter((p) => p.length > 0);
  return values.length > 0 ? values.join(" · ") : "-";
}

export function getReservationDetail(row: ReservationRow): string {
  switch (row.kebutuhan) {
    case ReservationKebutuhan.Agroedutourism:
      return displayValue(row.waktu_kunjungan);
    case ReservationKebutuhan.Agripreneurcamp:
      return joinDetail(row.paket_agripreneurcamp, row.waktu_pelatihan);
    case ReservationKebutuhan.PeminjamanRuangan:
      return joinDetail(row.ruangan, row.waktu_peminjaman);
    case ReservationKebutuhan.PaketCamping:
      return displayValue(row.paket_camping);
    case ReservationKebutuhan.SurveyWawancara:
      return displayValue(row.kebutuhan_survey);
    default:
      return joinDetail(row.tujuan_kunjungan, row.sesi_kunjungan, row.waktu_kunjungan);
  }
}

export function getReservationJumlahOrang(row: ReservationRow): string {
  if (row.jumlah_orang == null || row.jumlah_orang < 1) return "-";
  return `${row.jumlah_orang} orang`;
}

/** Tanggal kegiatan dari form (`tanggal_kunjungan`, rentang camping, waktu survey). */
export function getReservationSchedule(row: ReservationRow): string {
  const tanggal = row.tanggal_kunjungan;

  switch (row.kebutuhan) {
    case ReservationKebutuhan.PaketCamping:
      return formatDateRange(tanggal, row.tanggal_selesai_acara);
    case ReservationKebutuhan.SurveyWawancara: {
      const datePart = formatReservationDate(tanggal);
      const timePart = row.waktu_survey?.trim();
      if (datePart !== "-" && timePart) return `${datePart}, ${timePart.slice(0, 5)} WIB`;
      if (datePart !== "-") return datePart;
      return displayValue(timePart);
    }
    default:
      return formatReservationDate(tanggal ?? row.created_at);
  }
}

export function getReservationDocument(row: ReservationRow): string | null {
  let url: string | null = null;

  switch (row.kebutuhan) {
    case ReservationKebutuhan.Agroedutourism:
      url = row.surat_kunjungan_url;
      break;
    case ReservationKebutuhan.Agripreneurcamp:
      url = row.surat_pelatihan_url;
      break;
    case ReservationKebutuhan.PeminjamanRuangan:
      url = row.surat_peminjaman_url;
      break;
    case ReservationKebutuhan.PaketCamping:
      url = row.surat_permohonan_acara_url;
      break;
    case ReservationKebutuhan.SurveyWawancara:
      url = row.surat_kegiatan_url;
      break;
    default:
      break;
  }

  return url ?? row.dokumen_url ?? null;
}

type KebutuhanBadgeStyle = { label: string; className: string };

export function getKebutuhanBadge(kebutuhan: string | null | undefined): KebutuhanBadgeStyle {
  const fallback: KebutuhanBadgeStyle = {
    label: displayValue(kebutuhan),
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  if (!kebutuhan) return { label: "-", className: fallback.className };

  switch (kebutuhan) {
    case ReservationKebutuhan.Agroedutourism:
      return {
        label: "Agroedutourism",
        className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
      };
    case ReservationKebutuhan.Agripreneurcamp:
      return {
        label: "Agripreneurcamp",
        className: "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
      };
    case ReservationKebutuhan.PeminjamanRuangan:
      return {
        label: "Peminjaman",
        className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
      };
    case ReservationKebutuhan.PaketCamping:
      return {
        label: "Camping",
        className: "bg-green-100 text-green-800 ring-1 ring-green-200",
      };
    case ReservationKebutuhan.SurveyWawancara:
      return {
        label: "Survey",
        className: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
      };
    default:
      return { label: kebutuhan, className: fallback.className };
  }
}

export const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  rejected: "bg-red-50 text-red-800 ring-1 ring-red-200",
} as const;

export const statusLabels = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
} as const;

export function normalizeStatus(status: ReservationRow["status"]) {
  if (status === "approved" || status === "rejected") return status;
  return "pending" as const;
}
