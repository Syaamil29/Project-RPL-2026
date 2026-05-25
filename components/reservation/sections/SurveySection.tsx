import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ReservationFormValues } from "@/lib/reservation";
import { FileUpload, FormField, inputClass } from "../FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  errors: Record<string, { message?: string }>;
}

export default function SurveySection({ register, setValue, errors }: Props) {
  return (
    <div className="space-y-5">
      <FormField label="Kebutuhan Survey" error={errors.kebutuhan_survey?.message}>
        <input
          type="text"
          placeholder="Jelaskan kebutuhan survey atau wawancara"
          {...register("kebutuhan_survey", { required: "Kebutuhan survey wajib diisi" })}
          className={inputClass}
        />
      </FormField>
      <FormField label="Waktu Survey" hint="Format 24 jam (contoh: 09:00)" error={errors.waktu_survey?.message}>
        <input
          type="time"
          {...register("waktu_survey", { required: "Waktu survey wajib diisi" })}
          className={inputClass}
        />
      </FormField>
      <FileUpload
        label="Surat Kegiatan"
        error={errors.surat_kegiatan?.message}
        onChange={(files) => files && setValue("surat_kegiatan", files)}
      />
    </div>
  );
}
