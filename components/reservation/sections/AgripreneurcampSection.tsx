import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ReservationFormValues } from "@/lib/reservation";
import { ChoiceCard, ChoiceGrid, ChoiceList, FileUpload, labelClass } from "../FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  errors: Record<string, { message?: string }>;
}

export default function AgripreneurcampSection({ register, setValue, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Paket Agripreneurcamp</p>
        <ChoiceGrid>
          {(["Beginner", "Middle", "Custom"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              {...register("paket_agripreneurcamp", { required: "Paket wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceGrid>
        {errors.paket_agripreneurcamp && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.paket_agripreneurcamp.message}</p>
        )}
      </div>
      <div>
        <p className={labelClass}>Waktu Pelatihan</p>
        <ChoiceList>
          {(["Sesi 1", "Sesi 2"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              description={opt === "Sesi 1" ? "Pagi" : "Siang"}
              {...register("waktu_pelatihan", { required: "Waktu pelatihan wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceList>
        {errors.waktu_pelatihan && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.waktu_pelatihan.message}</p>
        )}
      </div>
      <FileUpload
        label="Surat Pelatihan"
        error={errors.surat_pelatihan?.message}
        {...register("surat_pelatihan", { required: "Surat pelatihan wajib diunggah" })}
      />
    </div>
  );
}
