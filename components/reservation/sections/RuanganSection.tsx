import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ReservationFormValues } from "@/lib/reservation";
import { ChoiceCard, ChoiceList, FileUpload, labelClass } from "../FormUI";

interface Props {
  register: UseFormRegister<ReservationFormValues>;
  setValue: UseFormSetValue<ReservationFormValues>;
  watch: UseFormWatch<ReservationFormValues>;
  errors: Record<string, { message?: string }>;
}

export default function RuanganSection({ register, setValue, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Ruangan</p>
        <ChoiceList>
          {(["Balai Rakyat Indonesia", "Ruang Meeting", "Ruang VIP"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              {...register("ruangan", { required: "Ruangan wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceList>
        {errors.ruangan && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.ruangan.message}</p>
        )}
      </div>
      <div>
        <p className={labelClass}>Waktu Peminjaman</p>
        <ChoiceList>
          {(["Half day", "Full day"] as const).map((opt) => (
            <ChoiceCard
              key={opt}
              value={opt}
              description={opt === "Half day" ? "Setengah hari (pagi atau siang)" : "Satu hari penuh"}
              {...register("waktu_peminjaman", { required: "Waktu peminjaman wajib dipilih" })}
            >
              {opt}
            </ChoiceCard>
          ))}
        </ChoiceList>
        {errors.waktu_peminjaman && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.waktu_peminjaman.message}</p>
        )}
      </div>
      <FileUpload
        label="Surat Peminjaman"
        error={errors.surat_peminjaman?.message}
        {...register("surat_peminjaman", { required: "Surat peminjaman wajib diunggah" })}
      />
    </div>
  );
}
