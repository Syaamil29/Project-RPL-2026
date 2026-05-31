import { ReservationFormValues, ReservationKebutuhan } from "./types";
import type { ReservasiRowInsert } from "./row";

function baseRow(
  data: ReservationFormValues,
  userId: string
): ReservasiRowInsert {
  return {
    user_id: userId,
    nama_lengkap: data.namaLengkap,
    instansi: data.instansi,
    email: data.email,
    nomor_telepon: data.nomorTelepon,
    kebutuhan: data.kebutuhan,
    tanggal_kunjungan: data.tanggalKunjungan,
    jumlah_orang: Number.isFinite(data.jumlahPengunjung) ? data.jumlahPengunjung : null,
    tujuan_kunjungan: null,
    fasilitas: null,
    dokumen_url: null,
    sesi_kunjungan: null,
    status: "pending",
    waktu_kunjungan: null,
    surat_kunjungan_url: null,
    paket_agripreneurcamp: null,
    waktu_pelatihan: null,
    surat_pelatihan_url: null,
    ruangan: null,
    waktu_peminjaman: null,
    surat_peminjaman_url: null,
    paket_camping: null,
    tanggal_selesai_acara: null,
    surat_permohonan_acara_url: null,
    kebutuhan_survey: null,
    waktu_survey: null,
    surat_kegiatan_url: null,
  };
}

/**
 * Maps form values to a row insert matching the Supabase `reservasi` schema.
 */
export function buildReservasiInsert(
  data: ReservationFormValues,
  userId: string,
  fileUrls: Record<string, string>
): ReservasiRowInsert {
  const row = baseRow(data, userId);

  switch (data.kebutuhan) {
    case ReservationKebutuhan.Agroedutourism:
      row.waktu_kunjungan = data.waktu_kunjungan ?? null;
      row.surat_kunjungan_url = fileUrls.surat_kunjungan ?? null;
      row.dokumen_url = row.surat_kunjungan_url;
      break;

    case ReservationKebutuhan.Agripreneurcamp:
      row.paket_agripreneurcamp = data.paket_agripreneurcamp ?? null;
      row.waktu_pelatihan = data.waktu_pelatihan ?? null;
      row.surat_pelatihan_url = fileUrls.surat_pelatihan ?? null;
      row.dokumen_url = row.surat_pelatihan_url;
      break;

    case ReservationKebutuhan.PeminjamanRuangan:
      row.ruangan = data.ruangan ?? null;
      row.waktu_peminjaman = data.waktu_peminjaman ?? null;
      row.surat_peminjaman_url = fileUrls.surat_peminjaman ?? null;
      row.dokumen_url = row.surat_peminjaman_url;
      break;

    case ReservationKebutuhan.PaketCamping:
      row.paket_camping = data.paket_camping ?? null;
      row.tanggal_selesai_acara = data.tanggal_selesai_acara ?? null;
      row.surat_permohonan_acara_url = fileUrls.surat_permohonan_acara ?? null;
      row.dokumen_url = row.surat_permohonan_acara_url;
      break;

    case ReservationKebutuhan.SurveyWawancara:
      row.kebutuhan_survey = data.kebutuhan_survey?.trim() ?? null;
      row.waktu_survey = data.waktu_survey ?? null;
      row.surat_kegiatan_url = fileUrls.surat_kegiatan ?? null;
      row.dokumen_url = row.surat_kegiatan_url;
      break;

    default:
      break;
  }

  return row;
}
