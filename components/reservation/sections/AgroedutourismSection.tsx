import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ReservationFormValues } from "@/lib/reservation";
import { ChoiceCard, ChoiceList, FileUpload, labelClass } from "../FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  errors: Record<string, { message?: string }>;
}

const sesiWaktu: Record<"Sesi 1" | "Sesi 2" | "Sesi 3", string> = {
  "Sesi 1": "08.00 – 10.00 WIB",
  "Sesi 2": "10.30 – 12.30 WIB",
  "Sesi 3": "13.30 – 15.30 WIB",
};

export default function AgroedutourismSection({ register, setValue, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Waktu Kunjungan</p>
        <ChoiceList>
          {(["Sesi 1", "Sesi 2", "Sesi 3"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              description={sesiWaktu[opt]}
              {...register("waktu_kunjungan", { required: "Waktu kunjungan wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceList>
        {errors.waktu_kunjungan && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.waktu_kunjungan.message}</p>
        )}
      </div>
      <FileUpload
        label="Surat Kunjungan"
        error={errors.surat_kunjungan?.message}
        {...register("surat_kunjungan", { required: "Surat kunjungan wajib diunggah" })}
      />
    </div>
  );
}
