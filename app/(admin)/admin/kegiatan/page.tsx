"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { fetchKegiatanAdmin, deleteKegiatanAdmin, saveKegiatanAdmin, getUploadTicket } from "./actions"

// Define Kegiatan Type
export type Kegiatan = {
  id: string
  name: string
  status: "published" | "draft"
  description: string
  images: string[] // Dynamic array of strings, index 0 is Cover/Primary
}

// Toast type
type Toast = {
  id: string
  message: string
  type: "success" | "danger" | "info"
}

export default function AdminKegiatanPage() {
  // --- CORE STATE ---
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"list" | "editor">("list")
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)

  // --- FILTERS & SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All") // "All", "published", "draft"
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc">("name-asc")

  // --- FORM STATE ---
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formImages, setFormImages] = useState<string[]>([]) // Dynamic array for carousel

  // Dynamic snapshot state to check dirty values
  const [initialKegiatanState, setInitialKegiatanState] = useState<any | null>(null)

  // Drag & drop file status
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null) // HTML5 drag index reordering
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- UI FLOW STATE ---
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Add Toast helper
  const addToast = (message: string, type: "success" | "danger" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // --- DATA FETCHING & SYNC ---
  async function fetchKegiatan() {
    try {
      setIsLoading(true)
      const mappedKegiatan = await fetchKegiatanAdmin()
      setKegiatanList(mappedKegiatan)
    } catch (err: any) {
      console.error("Gagal mengambil data kegiatan:", err)
      addToast(`Gagal memuat kegiatan: ${err.message || err}`, "danger")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKegiatan()
  }, [])

  // --- UNDO-AWARE DEEP EQUALITY DIRTY STATE ---
  const isDirty = useMemo(() => {
    if (!initialKegiatanState) return false
    const currentFields = {
      name: formName,
      description: formDescription,
      images: formImages.filter(Boolean)
    }
    return JSON.stringify(currentFields) !== JSON.stringify(initialKegiatanState)
  }, [initialKegiatanState, formName, formDescription, formImages])

  const filteredKegiatan = useMemo(() => {
    return kegiatanList
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "All" || p.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        // Priority 1: Published items always appear first
        if (a.status === "published" && b.status === "draft") return -1
        if (a.status === "draft" && b.status === "published") return 1

        // Priority 2: Secondary sort by selected parameter inside status blocks
        if (sortBy === "name-asc") return a.name.localeCompare(b.name)
        if (sortBy === "name-desc") return b.name.localeCompare(a.name)
        return 0
      })
  }, [kegiatanList, searchQuery, statusFilter, sortBy])

  // --- SYNC FORM & INITIAL SNAPSHOT ---
  useEffect(() => {
    if (editingKegiatan) {
      setFormName(editingKegiatan.name)
      setFormDescription(editingKegiatan.description)
      setFormImages(editingKegiatan.images)

      const startState = {
        name: editingKegiatan.name,
        description: editingKegiatan.description,
        images: editingKegiatan.images
      }
      setInitialKegiatanState(startState)
    } else {
      setFormName("")
      setFormDescription("")
      setFormImages([])

      const startState = {
        name: "",
        description: "",
        images: []
      }
      setInitialKegiatanState(startState)
    }
    setErrors({})
  }, [editingKegiatan, currentView])

  // --- SMART MULTI-FILE UPLOAD HANDLER ---
  const handleAddImages = (files: FileList) => {
    const addedUrls: string[] = []
    const limitRemaining = 10 - formImages.length
    const filesToProcess = Array.from(files).slice(0, limitRemaining)

    filesToProcess.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        addedUrls.push(url)
      }
    })

    if (addedUrls.length > 0) {
      setFormImages((prev) => [...prev, ...addedUrls])
      addToast(`${addedUrls.length} gambar berhasil ditambahkan`, "info")
      if (errors.image) setErrors((prev) => ({ ...prev, image: "" }))
    }

    if (files.length > limitRemaining) {
      addToast("Batas maksimal adalah 10 foto. Beberapa file diabaikan.", "danger")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files)
    }
  }

  // --- NATIVE DRAG & DROP REORDERING ---
  const handleImageReorder = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return
    setFormImages((prev) => {
      const next = [...prev]
      const [draggedItem] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, draggedItem)
      return next
    })
    setDraggedIndex(null)
  }

  // --- CRUD ACTIONS ---
  const handleOpenAdd = () => {
    setEditingKegiatan(null)
    setCurrentView("editor")
  }

  const handleOpenEdit = (kegiatan: Kegiatan) => {
    setEditingKegiatan(kegiatan)
    setCurrentView("editor")
  }

  const handleTriggerDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteKegiatanAdmin(deleteConfirmId)
        
        addToast("Kegiatan berhasil dihapus secara permanen!", "danger")
        setDeleteConfirmId(null)
        if (editingKegiatan && editingKegiatan.id === deleteConfirmId) {
          setCurrentView("list")
          setEditingKegiatan(null)
        }
        await fetchKegiatan()
      } catch (err: any) {
        console.error("Gagal menghapus kegiatan:", err)
        addToast(`Gagal menghapus kegiatan: ${err.message || err}`, "danger")
      }
    }
  }

  // --- UPLOAD LOCAL IMAGES TO STORAGE ---
  const uploadLocalImages = async (images: string[]): Promise<string[]> => {
    return Promise.all(
      images.map(async (img) => {
        if (img.startsWith("blob:")) {
          try {
            const res = await fetch(img)
            const blob = await res.blob()
            
            // Extract or generate filename
            const ext = blob.type.split("/")[1] || "jpg"
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
            
            // Convert to a native File object to upload
            const file = new File([blob], fileName, { type: blob.type || "image/jpeg" })
            
            // 1. Get short-lived signed upload URL from Supabase Admin Client
            const { signedUrl, path } = await getUploadTicket(fileName)

            // 2. Direct upload from browser using native fetch PUT to the signed URL
            const uploadRes = await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: {
                "Content-Type": file.type
              }
            })

            if (!uploadRes.ok) {
              const errMsg = await uploadRes.text()
              throw new Error(`Upload storage gagal: ${uploadRes.statusText} ${errMsg}`)
            }

            // 3. Construct the public URL of the uploaded image
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gambar_katalog/${fileName}`
            return publicUrl
          } catch (err: any) {
            console.error("Kesalahan memproses local blob:", img, err)
            throw err
          }
        }
        return img // Return unchanged if already a remote public URL
      })
    )
  }

  // --- SMART SAVE ACTIONS ---
  const executeSave = async (targetStatus: "published" | "draft") => {
    // Validation
    const newErrors: { [key: string]: string } = {}
    
    // Both draft and published require a name
    if (!formName.trim()) {
      newErrors.name = "Nama kegiatan wajib diisi"
    }

    // Validation check is always highly recommended for live published items
    if (targetStatus === "published") {
      if (!formDescription.trim()) {
        newErrors.description = "Deskripsi kegiatan wajib diisi"
      }
      if (formImages.length === 0 || !formImages[0]) {
        newErrors.image = "Foto sampul utama (Cover Image) wajib diunggah"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      addToast(
        targetStatus === "published"
          ? "Mohon lengkapi seluruh kolom wajib untuk mempublikasikan kegiatan"
          : "Mohon isi nama kegiatan untuk menyimpan draf",
        "danger"
      )
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setIsSaving(true)

    try {
      const cleanImages = formImages.filter(Boolean)
      
      // Upload any new local images
      const finalImages = await uploadLocalImages(cleanImages)
      
      const dbData = {
        nama_kegiatan: formName.trim(),
        status: targetStatus,
        deskripsi: formDescription.trim(),
        gambar: finalImages,
      }

      await saveKegiatanAdmin(dbData, editingKegiatan?.id)

      // Sync local kegiatan state with Supabase
      await fetchKegiatan()

      addToast(
        targetStatus === "published"
          ? `Kegiatan "${dbData.nama_kegiatan}" berhasil diterbitkan!`
          : `Draf kegiatan "${dbData.nama_kegiatan}" berhasil disimpan!`,
        "success"
      )

      setCurrentView("list")
      setEditingKegiatan(null)
    } catch (err: any) {
      console.error("Gagal menyimpan kegiatan:", err)
      addToast(`Gagal menyimpan kegiatan: ${err.message || err}`, "danger")
    } finally {
      setIsSaving(false)
    }
  }

  // --- SMART BATAL SAFE EXIT ACTION ---
  const handleBatal = async () => {
    // If not dirty, simply return to the List View (do NOT save anything)
    if (!isDirty) {
      setCurrentView("list")
      setEditingKegiatan(null)
      return
    }

    if (editingKegiatan) {
      // Editing existing kegiatan
      if (editingKegiatan.status === "published") {
        // Trigger window.confirm warning for published live kegiatan
        const confirmDiscard = window.confirm(
          "Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan? Perubahan akan hilang dan kegiatan tetap Live."
        )
        if (!confirmDiscard) return
      }
      // Return and discard changes
      setCurrentView("list")
      setEditingKegiatan(null)
    } else {
      // Auto-draft on "Batal" ONLY happens if it's a completely new kegiatan being created and isDirty is true.
      setIsSaving(true)
      try {
        const cleanImages = formImages.filter(Boolean)
        const finalImages = await uploadLocalImages(cleanImages)
        const draftName = formName.trim() || "Kegiatan Tanpa Nama (Draf Otomatis)"

        const dbData = {
          nama_kegiatan: draftName,
          status: "draft" as const,
          deskripsi: formDescription.trim() || "Tidak ada deskripsi.",
          gambar: finalImages,
        }

        await saveKegiatanAdmin(dbData)

        addToast(`Tindakan dibatalkan. Draf "${draftName}" otomatis disimpan!`, "info")
        await fetchKegiatan()
      } catch (err: any) {
        console.error("Gagal menyimpan draf otomatis:", err)
        addToast(`Gagal menyimpan draf otomatis: ${err.message}`, "danger")
      } finally {
        setIsSaving(false)
        setCurrentView("list")
        setEditingKegiatan(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 text-slate-800 antialiased">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 transform translate-x-0 animate-slide-in-right ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : toast.type === "danger"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.type === "danger" && (
                <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 transition ml-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Outer Layout Container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        
        {/* --- VIEW 1: LIST VIEW (DASHBOARD) --- */}
        {currentView === "list" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header section - Title and add button only */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kegiatan</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Kelola item bento grid kegiatan ATP IPB, perbarui deskripsi dan visibilitas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2D24B5] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/10 transition-all hover:bg-[#20188A] hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Kegiatan
              </button>
            </div>

            {/* Filter Tabs UI */}
            <div className="border-b border-slate-200 mt-2">
              <nav className="flex space-x-8" aria-label="Status Filters">
                <button
                  type="button"
                  onClick={() => setStatusFilter("All")}
                  className={`border-b-2 py-4 px-1 text-sm font-bold transition-all flex items-center gap-2 ${
                    statusFilter === "All"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  Semua
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {kegiatanList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("published")}
                  className={`border-b-2 py-4 px-1 text-sm font-bold transition-all flex items-center gap-2 ${
                    statusFilter === "published"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  Published
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {kegiatanList.filter((p) => p.status === "published").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("draft")}
                  className={`border-b-2 py-4 px-1 text-sm font-bold transition-all flex items-center gap-2 ${
                    statusFilter === "draft"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  Drafts
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {kegiatanList.filter((p) => p.status === "draft").length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Filter and Search Controls Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-12 items-center">
                {/* Search Bar */}
                <div className="md:col-span-9 relative">
                  <label htmlFor="search-input" className="sr-only">Cari kegiatan</label>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search-input"
                    type="search"
                    placeholder="Cari kegiatan berdasarkan nama atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  />
                </div>
 
                {/* Sort By Selector */}
                <div className="md:col-span-3">
                  <label htmlFor="sort-select" className="sr-only">Urutkan</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium bg-white"
                  >
                    <option value="name-asc">Nama (A-Z)</option>
                    <option value="name-desc">Nama (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
 
            {/* Kegiatan Table Card - Sorting priority: Published always first */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {isLoading ? (
                /* Premium Skeleton Loader */
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="h-4 bg-slate-200 rounded-full w-1/4" />
                    <div className="h-4 bg-slate-200 rounded-full w-1/6" />
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded-full w-1/3" />
                        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                      </div>
                      <div className="h-6 bg-slate-100 rounded-full w-20" />
                      <div className="h-8 bg-slate-100 rounded-xl w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredKegiatan.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 ring-8 ring-slate-50/50">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Kegiatan Tidak Ditemukan</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">
                    {searchQuery || statusFilter !== "All"
                      ? "Tidak ada kegiatan yang cocok dengan kriteria pencarian atau penyaringan Anda."
                      : "Belum ada kegiatan terdaftar. Klik tombol Tambah Kegiatan untuk memasukkan item pertama Anda."}
                  </p>
                  {(searchQuery || statusFilter !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("All")
                      }}
                      className="mt-4 rounded-xl border border-slate-200 bg-white px-4.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                /* Table view with clickable rows */
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Gambar Sampul</th>
                        <th className="px-6 py-4">Nama Kegiatan</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredKegiatan.map((p) => (
                        <tr 
                          key={p.id} 
                          onClick={() => handleOpenEdit(p)}
                          className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                        >
                          {/* Image column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shadow-inner border border-slate-200/50 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                              {p.images && p.images.length > 0 ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-slate-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                          </td>

                          {/* Name column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1 max-w-[280px] mt-0.5">
                                {p.description}
                              </div>
                            </div>
                          </td>
 
                          {/* Status column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                p.status === "published"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              {p.status === "published" ? "Published" : "Draft"}
                            </span>
                          </td>

                          {/* Actions column */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent row click trigger
                                  handleOpenEdit(p)
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Kegiatan"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent row click trigger
                                  handleTriggerDelete(p.id)
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Kegiatan"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW 2: EDITOR VIEW (THE FORM) --- */}
        {currentView === "editor" && (
          <div className="max-w-4xl mx-auto w-full animate-fade-in space-y-6">
            
            {/* Header / Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <button
                type="button"
                onClick={handleBatal}
                className="hover:text-blue-700 transition"
              >
                Kegiatan
              </button>
              <span>/</span>
              <span className="text-slate-600">
                {editingKegiatan ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
              </span>
            </div>

            {/* Top Editor Header Area - Trash can placed here on the right */}
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {editingKegiatan ? `Edit Kegiatan: ${editingKegiatan.name}` : "Tambah Kegiatan Baru"}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Unggah media galeri kegiatan, detail deskripsi kegiatan untuk dipublikasikan.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {isDirty && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Ada Perubahan
                  </span>
                )}
                
                {/* Trash can icon relocated here for deleting existing kegiatan */}
                {editingKegiatan && (
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(editingKegiatan.id)}
                    className="p-2.5 text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center bg-white"
                    title="Hapus Kegiatan Permanen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </header>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              
              {/* Smart Media Upload Slider (Reordering & Placeholder) */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Media Galeri Kegiatan</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Unggah hingga 10 file foto kegiatan. Seret dan letakkan foto di dalam slider untuk mengatur urutan. Foto pertama di sebelah kiri menjadi sampul.
                  </p>
                </div>

                {/* Hidden Multi-file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {formImages.length === 0 ? (
                  /* Dynamic Empty State Upload Zone with Camera SVG Icon */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      if (e.dataTransfer.files) {
                        handleAddImages(e.dataTransfer.files)
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/30 scale-[0.99] shadow-inner"
                        : errors.image
                        ? "border-rose-300 bg-rose-50/20 hover:bg-rose-50/30"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="rounded-full bg-white p-4 shadow-md text-slate-400 mb-3 border border-slate-100">
                      <svg className="w-8 h-8 text-slate-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      Seret & lepas beberapa gambar di sini, atau klik untuk memilih file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Mendukung unggahan multi-file sekaligus (Maksimal 10 gambar)
                    </p>
                    {errors.image && (
                      <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1.5 animate-fade-in">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.image}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Drag & Drop Reordering Carousel Slider */
                  <div className="space-y-3">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => setDraggedIndex(idx)}
                          onDragEnd={() => setDraggedIndex(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleImageReorder(idx)}
                          className={`relative flex-shrink-0 w-44 aspect-square rounded-2xl overflow-hidden border shadow-sm bg-slate-100 group transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-md ${
                            draggedIndex === idx 
                              ? "opacity-40 border-blue-500 scale-95" 
                              : "border-slate-200"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Foto Kegiatan ${idx + 1}`}
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                          
                          {/* First Image Indicator Accent Border (Cover) */}
                          {idx === 0 && (
                            <div className="absolute inset-0 border-[3.5px] border-blue-600 rounded-2xl pointer-events-none z-10" />
                          )}


                          {/* Image Deletion (X) Button - Relocated to top right corner, fades in smoothly on hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormImages((prev) => prev.filter((_, i) => i !== idx))
                            }}
                            className="absolute top-1.5 right-1.5 z-20 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full p-1 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md backdrop-blur-xs flex items-center justify-center"
                            title="Hapus Foto"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* n+1 Drag & Drop Add More Box Placeholder */}
                      {formImages.length < 10 && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                            if (e.dataTransfer.files) {
                              handleAddImages(e.dataTransfer.files)
                            }
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex-shrink-0 w-44 aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all duration-200 ${
                            isDragging
                              ? "border-blue-500 bg-blue-50/20 scale-[0.98]"
                              : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-400"
                          }`}
                        >
                          <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[11px] font-bold text-slate-600">Tambah Foto</span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Drop / Pilih File</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1 px-1">
                      <span>Unggah {formImages.length} dari batas maksimal 10 foto (Seret & letakkan foto untuk mengatur urutan)</span>
                      <span>Geser ke samping untuk melihat lebih banyak file</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Card (Nama & Deskripsi Kegiatan - combined into one Detail Kegiatan box) */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-900">Detail Kegiatan</h3>
                
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label htmlFor="prod-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Nama Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    placeholder="Masukkan nama kegiatan..."
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition text-slate-900 bg-white ${
                      errors.name
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs font-semibold text-rose-600">{errors.name}</p>
                  )}
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="prod-desc" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Deskripsi Kegiatan <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {formDescription.length} karakter
                    </span>
                  </div>
                  <textarea
                    id="prod-desc"
                    rows={6}
                    placeholder="Masukkan deskripsi detail mengenai kegiatan, program edukatif, petualangan outdoor, dan manfaat pertanian ATP..."
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value)
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
                    }}
                    className={`w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition text-slate-900 leading-relaxed bg-white ${
                      errors.description
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs font-semibold text-rose-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* --- DECLUTTERED CONTROL BAR --- */}
              <div className="sticky bottom-4 z-40 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 shadow-xl flex items-center justify-between gap-4">
                
                {/* Left side actions */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleBatal}
                    disabled={isSaving}
                    className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition duration-200 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => executeSave("draft")}
                    disabled={isSaving}
                    className="px-5 py-2.5 text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/50 rounded-xl transition duration-200 disabled:opacity-50"
                  >
                    Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => executeSave("published")}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition duration-200 disabled:bg-blue-600/70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>Publish</>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </div>
        )}
      </div>

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteConfirmId(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs animate-fade-in"
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center gap-3.5 text-rose-600 mb-4">
              <div className="rounded-full bg-rose-50 p-2.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Konfirmasi Hapus</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus kegiatan{" "}
              <span className="font-extrabold text-slate-900">
                &quot;{kegiatanList.find((p) => p.id === deleteConfirmId)?.name}&quot;
              </span>{" "}
              ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4.5 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
