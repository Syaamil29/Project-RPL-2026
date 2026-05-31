import { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  getMinReservationDate,
  ReservationFormValues,
  validateMinReservationDate,
} from "@/lib/reservation";
import { FormField, inputClass } from "./FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  errors: FieldErrors<ReservationFormValues>;
}

export default function ServiceCommonFields({ register, errors }: Props) {
  const minDate = getMinReservationDate();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <FormField
        label="Tanggal Kegiatan"
        hint="Pengisian Minimal H-1 Kegiatan"
        error={errors.tanggalKunjungan?.message}
      >
        <input
          type="date"
          min={minDate}
          {...register("tanggalKunjungan", {
            required: "Tanggal kegiatan wajib diisi",
            validate: validateMinReservationDate,
          })}
          className={inputClass}
        />
      </FormField>
      <FormField
        label="Jumlah Pengunjung"
        hint="Total peserta yang akan hadir"
        error={errors.jumlahPengunjung?.message}
      >
        <input
          type="number"
          min={1}
          step={1}
          placeholder="Contoh: 25"
          {...register("jumlahPengunjung", {
            required: "Jumlah pengunjung wajib diisi",
            valueAsNumber: true,
            min: { value: 1, message: "Minimal 1 orang" },
          })}
          className={inputClass}
        />
      </FormField>
    </div>
  );
}
