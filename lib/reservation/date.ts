/** Tanggal minimum reservasi: H+1 (besok), format YYYY-MM-DD. */
export function getMinReservationDate(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function validateMinReservationDate(value: string | undefined): true | string {
  if (!value) return "Tanggal wajib diisi";
  const min = getMinReservationDate();
  if (value < min) return "Tanggal minimal H+1 (mulai besok)";
  return true;
}

export function validateEndDateOnOrAfterStart(
  endValue: string | undefined,
  startValue: string | undefined
): true | string {
  const endCheck = validateMinReservationDate(endValue);
  if (endCheck !== true) return endCheck;
  if (startValue && endValue && endValue < startValue) {
    return "Tanggal selesai tidak boleh sebelum tanggal mulai";
  }
  return true;
}
