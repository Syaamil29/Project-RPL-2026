"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  buildReservasiInsert,
  ReservationFormValues,
  ReservationKebutuhan,
  uploadFileToStorage,
} from "@/lib/reservation";
import { supabase } from "@/lib/supabase";
import AgroedutourismSection from "./sections/AgroedutourismSection";
import AgripreneurcampSection from "./sections/AgripreneurcampSection";
import RuanganSection from "./sections/RuanganSection";
import CampingSection from "./sections/CampingSection";
import SurveySection from "./sections/SurveySection";
import ServiceCommonFields from "./ServiceCommonFields";
import {
  ChoiceCard,
  ChoiceGrid,
  FormField,
  FormSection,
  inputClass,
} from "./FormUI";

export default function ReservationForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      namaLengkap: "",
      instansi: "",
      email: "",
      nomorTelepon: "",
      kebutuhan: "" as ReservationKebutuhan,
      tanggalKunjungan: "",
      jumlahPengunjung: undefined as unknown as number,
    },
  });

  const selectedKebutuhan = watch("kebutuhan");
  const kebutuhanRegister = register("kebutuhan", { required: "Pilih kebutuhan" });

  const onSubmit: SubmitHandler<ReservationFormValues> = async (data) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      alert("Silakan login terlebih dahulu untuk mengirim reservasi.");
      return;
    }

    const fileFields = [
      "surat_kunjungan",
      "surat_pelatihan",
      "surat_peminjaman",
      "surat_permohonan_acara",
      "surat_kegiatan",
    ] as const;
    const fileUrls: Record<string, string> = {};

    try {
      for (const field of fileFields) {
        const files = data[field as keyof ReservationFormValues] as FileList | undefined;
        if (files && files.length > 0) {
          fileUrls[field] = await uploadFileToStorage(files[0]);
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      alert("Gagal mengunggah dokumen. Periksa ukuran file dan coba lagi.");
      return;
    }

    const payload = buildReservasiInsert(data, session.user.id, fileUrls);

    const { error } = await supabase.from("reservasi").insert(payload);
    if (error) {
      console.error("Supabase insert error:", error.message, error.details, error.hint);
      alert(`Gagal menyimpan reservasi: ${error.message}`);
      return;
    }

    alert("Reservasi berhasil terkirim");
    reset();
    router.push("/reservasi/riwayat");
  };

  const handleKebutuhanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as ReservationKebutuhan;
    const [namaLengkap, instansi, email, nomorTelepon] = watch([
      "namaLengkap",
      "instansi",
      "email",
      "nomorTelepon",
    ]);
    reset({
      namaLengkap,
      instansi,
      email,
      nomorTelepon,
      kebutuhan: value,
      tanggalKunjungan: "",
      jumlahPengunjung: undefined as unknown as number,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
    >
      <div className="border-b border-slate-200 bg-[#2D24B5] px-6 py-5 sm:px-8">
        <h2 className="text-lg font-bold text-white">Data Reservasi</h2>
        <p className="mt-1 text-sm text-white/80">
          Pilih jenis layanan, lalu isi informasi kontak dan detail tambahan.
        </p>
      </div>

      <div className="space-y-0 p-6 sm:p-8">
        <FormSection
          title="Jenis Kebutuhan"
          description="Pilih satu layanan yang ingin Anda reservasi."
        >
          <ChoiceGrid>
            {(Object.values(ReservationKebutuhan) as string[]).map((opt) => (
              <ChoiceCard
                key={opt}
                value={opt}
                {...kebutuhanRegister}
                onChange={(e) => {
                  kebutuhanRegister.onChange(e);
                  handleKebutuhanChange(e);
                }}
              >
                {opt}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
          {errors.kebutuhan && (
            <p className="text-xs font-medium text-red-600">{errors.kebutuhan.message}</p>
          )}
        </FormSection>

        <FormSection
          title="Informasi Kontak"
          description="Data diri dan instansi untuk keperluan konfirmasi reservasi."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Nama Lengkap" error={errors.namaLengkap?.message}>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                {...register("namaLengkap", { required: "Nama lengkap wajib diisi" })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Instansi" error={errors.instansi?.message}>
              <input
                type="text"
                placeholder="Nama universitas / perusahaan / lembaga"
                {...register("instansi", { required: "Instansi wajib diisi" })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="nama@email.com"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Format email tidak valid",
                  },
                })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Nomor Telepon" error={errors.nomorTelepon?.message}>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                {...register("nomorTelepon", {
                  required: "Nomor telepon wajib diisi",
                  minLength: { value: 10, message: "Minimal 10 digit" },
                })}
                className={inputClass}
              />
            </FormField>
          </div>
        </FormSection>

        {selectedKebutuhan && (
          <FormSection
            title="Detail Layanan"
            description={`Informasi tambahan untuk ${selectedKebutuhan}.`}
          >
            <ServiceCommonFields register={register} errors={errors} />
            {selectedKebutuhan === ReservationKebutuhan.Agroedutourism && (
              <AgroedutourismSection register={register} setValue={setValue} watch={watch} errors={errors} />
            )}
            {selectedKebutuhan === ReservationKebutuhan.Agripreneurcamp && (
              <AgripreneurcampSection register={register} setValue={setValue} watch={watch} errors={errors} />
            )}
            {selectedKebutuhan === ReservationKebutuhan.PeminjamanRuangan && (
              <RuanganSection register={register} setValue={setValue} watch={watch} errors={errors} />
            )}
            {selectedKebutuhan === ReservationKebutuhan.PaketCamping && (
              <CampingSection register={register} setValue={setValue} watch={watch} errors={errors} />
            )}
            {selectedKebutuhan === ReservationKebutuhan.SurveyWawancara && (
              <SurveySection register={register} setValue={setValue} watch={watch} errors={errors} />
            )}
          </FormSection>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isSubmitting}
          className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#2D24B5] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20188A] disabled:opacity-50"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Reservasi"}
        </button>
      </div>
    </form>
  );
}
