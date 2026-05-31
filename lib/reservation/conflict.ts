import { type ReservationRow } from "./row";
import { ReservationKebutuhan } from "./types";
import { normalizeStatus } from "./display";

/** Memeriksa apakah ada tumpang tindih tanggal antara dua reservasi (terutama untuk rentang tanggal). */
export function hasDateOverlap(r1: ReservationRow, r2: ReservationRow): boolean {
  if (!r1.tanggal_kunjungan || !r2.tanggal_kunjungan) return false;
  
  const start1 = r1.tanggal_kunjungan;
  const end1 = (r1.kebutuhan === ReservationKebutuhan.PaketCamping && r1.tanggal_selesai_acara) ? r1.tanggal_selesai_acara : start1;
  
  const start2 = r2.tanggal_kunjungan;
  const end2 = (r2.kebutuhan === ReservationKebutuhan.PaketCamping && r2.tanggal_selesai_acara) ? r2.tanggal_selesai_acara : start2;

  return start1 <= end2 && start2 <= end1;
}

/** Memeriksa apakah reservasi 'target' berkonflik dengan daftar reservasi yang ada. */
export function checkConflict(target: ReservationRow, allReservations: ReservationRow[]): boolean {
  const targetStart = target.tanggal_kunjungan;
  if (!targetStart) return false;

  return allReservations.some((existing) => {
    // Abaikan jika reservasi yang dibandingkan adalah dirinya sendiri
    if (existing.id === target.id) return false;
    
    // Hanya periksa konflik dengan reservasi yang sudah disetujui (approved)
    if (normalizeStatus(existing.status) !== "approved") return false;
    
    // Harus pada kebutuhan/layanan yang sama
    if (existing.kebutuhan !== target.kebutuhan) return false;

    // Periksa apakah tanggalnya bertabrakan
    if (!hasDateOverlap(existing, target)) return false;

    // Periksa slot waktu/ruangan spesifik berdasarkan jenis layanan
    switch (target.kebutuhan) {
      case ReservationKebutuhan.PeminjamanRuangan:
        if (existing.ruangan === target.ruangan) {
            // Asumsikan bentrok jika waktu kunjungan persis sama ATAU salah satu memesan 'Full day'
            if (existing.waktu_kunjungan === target.waktu_kunjungan) return true;
            if (existing.waktu_kunjungan === "Full day" || target.waktu_kunjungan === "Full day") return true;
        }
        return false;
        
      case ReservationKebutuhan.Agroedutourism:
      case ReservationKebutuhan.Agripreneurcamp:
        // Bentrok jika sesinya sama
        return existing.waktu_kunjungan === target.waktu_kunjungan;
        
      case ReservationKebutuhan.PaketCamping:
        // Camping menempati area acara, anggap hanya 1 per area untuk tanggal yang bersinggungan.
        return true;
        
      case ReservationKebutuhan.SurveyWawancara:
        // Bentrok jika waktu (jam) persis sama
        return existing.waktu_kunjungan === target.waktu_kunjungan;
        
      default:
        return false;
    }
  });
}
