import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  getMinReservationDate,
  ReservationFormValues,
  validateEndDateOnOrAfterStart,
} from "@/lib/reservation";
import { ChoiceGrid, ChoiceCard, FileUpload, FormField, inputClass, labelClass } from "../FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  errors: Record<string, { message?: string }>;
}

export default function CampingSection({ register, setValue, watch, errors }: Props) {
  const tanggalMulai = watch("tanggalKunjungan");
  const minEndDate =
    tanggalMulai && tanggalMulai >= getMinReservationDate()
      ? tanggalMulai
      : getMinReservationDate();

  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Paket Camping</p>
        <ChoiceGrid>
          {(["Basic", "Premium", "Custom"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              {...register("paket_camping", { required: "Paket camping wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceGrid>
        {errors.paket_camping && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.paket_camping.message}</p>
        )}
      </div>
      <FormField
        label="Tanggal Selesai Acara"
        hint="Tidak boleh sebelum tanggal mulai kegiatan"
        error={errors.tanggal_selesai_acara?.message}
      >
        <input
          type="date"
          min={minEndDate}
          {...register("tanggal_selesai_acara", {
            required: "Tanggal selesai acara wajib diisi",
            validate: (value) => validateEndDateOnOrAfterStart(value, tanggalMulai),
          })}
          className={inputClass}
        />
      </FormField>
      <FileUpload
        label="Surat Permohonan Acara"
        error={errors.surat_permohonan_acara?.message}
        {...register("surat_permohonan_acara", { required: "Surat permohonan acara wajib diunggah" })}
      />
    </div>
  );
}
