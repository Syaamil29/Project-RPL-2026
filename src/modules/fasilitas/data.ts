export type KategoriFasilitas = 
  | "Pertanian Modern & IoT" 
  | "Perikanan & Akuakultur" 
  | "Pengolahan & Kebun"
  | "Fasilitas Umum & Edukasi";

export interface Fasilitas {
  id: string;
  nama: string;
  kategori: KategoriFasilitas;
  deskripsiSingkat: string;
  deskripsiLengkap: string;
  komoditas: string[];
  highlights: string[];
  gambarUtama: string; 
}

export const DATA_FASILITAS: Fasilitas[] = [
  {
    id: "smart-greenhouse-nursery",
    nama: "Smart Greenhouse Nursery",
    kategori: "Pertanian Modern & IoT",
    deskripsiSingkat: "Pusat persemaian benih modern dengan pengatur iklim otomatis dan mesin penyemai robotik.",
    deskripsiLengkap: "Fasilitas dengan kapasitas 1.440 tray ini memproduksi bibit mandiri dan komersial. Dilengkapi weather station, rolling screen otomatis, misting system (kabut), dan automatic seedling system berbasis kompresor.",
    komoditas: ["Bibit Daun", "Bibit Cabai", "Bibit Tomat", "Bibit Pepaya", "Bibit Melon"],
    highlights: [
      "Kapasitas masif: 72 tray per meja, total 1.440 tray.",
      "Iklim dikendalikan sensor suhu otomatis (rolling screen & misting).",
      "Mesin penyemai otomatis untuk komoditas biji kecil (cabai/tomat)."
    ],
    gambarUtama: "/images/fasilitas/Nursery.webp",
  },
  {
    id: "plant-factory",
    nama: "Plant Factory",
    kategori: "Pertanian Modern & IoT",
    deskripsiSingkat: "Pertanian dalam ruangan (indoor farming) super intensif yang sepenuhnya terisolasi dan diatur teknologi.",
    deskripsiLengkap: "Sistem tertutup 100% menggunakan AC dan spektrum lampu pintar (putih & ungu) pengganti matahari. Menggunakan hidroponik NFT. Fasilitas eksklusif ini berfungsi khusus untuk riset dan budidaya komoditas premium bebas iklim.",
    komoditas: ["Selada", "Kale", "Pakcoy", "Tanaman Riset"],
    highlights: [
      "Manipulasi spektrum cahaya LED (IoT) untuk fase pertumbuhan.",
      "Lingkungan steril terlindungi mutlak dari hama dan penyakit.",
      "Fokus utama untuk edukasi mahasiswa dan komoditas high-value."
    ],
    gambarUtama: "/images/fasilitas/Plant-factory.webp",
  },
  {
    id: "hidroponik-substrat",
    nama: "Hidroponik Substrat (Greenhouse Melon & Tomat)",
    kategori: "Pertanian Modern & IoT",
    deskripsiSingkat: "Budidaya tanaman tanpa tanah menggunakan irigasi tetes pintar berbasis IoT untuk presisi pemupukan.",
    deskripsiLengkap: "Hidroponik substrat adalah budidaya menggunakan media padat (rockwool, arang sekam, cocopeat 1:4). Nutrisi diberikan menggunakan pupuk AB Mix (hingga 1200 ppm) lewat sistem drip irrigation terintegrasi IoT yang dapat dikendalikan dari ponsel.",
    komoditas: ["Golden Melon", "Tomat Beef"],
    highlights: [
      "Irigasi otomatis via ponsel (6x sehari).",
      "Melon dipanen 65-75 HST (dibuahkan 1 per tanaman untuk kualitas premium).",
      "Tomat dipanen bertahap setiap 3-5 hari pada umur 90-100 HST."
    ],
    gambarUtama: "/images/fasilitas/GHMelon.webp",
  },
  {
    id: "hidroponik-nft",
    nama: "Hidroponik NFT",
    kategori: "Pertanian Modern & IoT",
    deskripsiSingkat: "Budidaya sayuran dalam aliran tipis film nutrisi yang tersirkulasi tanpa henti secara efisien.",
    deskripsiLengkap: "Menggunakan teknik Nutrient Film Technique (NFT). Lapisan air nutrisi pupuk AB Mix (1.000 ppm) mengalir secara berulang. Nutrisi disimpan di ground tank (dalam tanah) untuk menjaga suhu optimal perakaran (25–28°C).",
    komoditas: ["Pakcoy", "Kale", "Selada"],
    highlights: [
      "Kapasitas hingga 600 tanaman per meja (total 10 meja).",
      "Siklus panen sangat singkat (4–5 minggu).",
      "Tangki bawah tanah (Ground Tank) penjaga suhu nutrisi."
    ],
    gambarUtama: "/images/fasilitas/GHNFT.webp",
  },
  {
    id: "budidaya-organik",
    nama: "Budidaya Sayuran Organik",
    kategori: "Pengolahan & Kebun",
    deskripsiSingkat: "Budidaya sayuran premium di screenhouse dengan 100% bahan input organik bersertifikat nasional.",
    deskripsiLengkap: "Dinkelola di dalam screenhouse untuk mencegah kontaminasi. Menggunakan irigasi sprinkler terintegrasi IoT dengan sensor kelembapan media. Telah memperoleh sertifikasi organik dari INOFICE pada September 2023.",
    komoditas: ["Sayuran Daun Organik"],
    highlights: [
      "Sertifikasi Organik Nasional INOFICE.",
      "Biopestisida alami dari ekstrak minyak sereh.",
      "Pupuk cair fermentasi urin kelinci & molase (rutin tiap 5 hari)."
    ],
    gambarUtama: "/images/fasilitas/SayurOrganik.webp",
  },
  {
    id: "kebun-jambu",
    nama: "Kebun Jambu",
    kategori: "Pengolahan & Kebun",
    deskripsiSingkat: "Lahan dua hektare produksi jambu premium yang terintegrasi dengan pemanfaatan teknologi drone.",
    deskripsiLengkap: "Berproduksi sejak 2007. Perawatan meliputi pewiwilan, pembungkusan buah dari lalat buah, dan pembabatan gulma. Panen dilakukan secara rotasi dua kali seminggu. Penyemprotan pestisida dilakukan sangat efisien menggunakan teknologi drone sprayer.",
    komoditas: ["Jambu Kristal", "Jambu Mutiara"],
    highlights: [
      "Aplikasi Drone Sprayer canggih (Kapasitas 20 Liter/terbang).",
      "Satu tanaman (usia 2 tahun) menghasilkan 70-80 kg buah per 6 bulan.",
      "Grading pasca panen ketat (Grade A, B, C, Substandard)."
    ],
    gambarUtama: "/images/fasilitas/KebunJambu.webp",
  },
  {
    id: "aquaponik",
    nama: "Aquaponik",
    kategori: "Perikanan & Akuakultur",
    deskripsiSingkat: "Sistem simbiosis yang memanfaatkan air kolam ikan sebagai nutrisi utama bagi tanaman sayur.",
    deskripsiLengkap: "Air hasil pemeliharaan ikan dialirkan ke pipa tanaman sayur. Sebelum masuk, air difiltrasi secara fisik (media batuan) dan biologi (bioagen EM4). Terdapat juga kolam khusus budidaya lobster air tawar.",
    komoditas: ["Kangkung", "Selada", "Pakcoy", "Kailan", "Lobster Air Tawar"],
    highlights: [
      "Sayuran daun umur panen super cepat (sekitar 30 hari).",
      "Pakan lobster memanfaatkan limbah sayur dan buah (Zero Waste).",
      "Panen lobster pada ukuran 4-5 inch (umur 4-6 bulan)."
    ],
    gambarUtama: "/images/fasilitas/Aquaponik.webp",
  },
  {
    id: "fishery",
    nama: "Fishery (Sistem Budidaya Ikan)",
    kategori: "Perikanan & Akuakultur",
    deskripsiSingkat: "Instalasi 19 kolam ikan bundar dengan automatic feeder IoT dan konsep pertanian sirkular terpadu.",
    deskripsiLengkap: "Terdapat 19 kolam bundar (diameter 3,5m) yang didesain tanpa dead spot. Dilengkapi fine diffuser oksigen dan automatic feeder. Limbah air kolam (10% per minggu) dimanfaatkan kembali untuk irigasi kebun jambu.",
    komoditas: ["Koi", "Sidat", "Nila Merah", "Nila Hitam", "Lele"],
    highlights: [
      "Ikan dijual dalam kondisi siap masak (dibersihkan, dibumbui, di-vacuum).",
      "Panen Nila 5 bulan (250g), Lele 3-4 bulan (100g).",
      "Pakan ikan dicampur limbah sayuran untuk efisiensi."
    ],
    gambarUtama: "/images/fasilitas/fishery.webp",
  },
  {
    id: "packing-house",
    nama: "Packing House",
    kategori: "Pengolahan & Kebun",
    deskripsiSingkat: "Pusat standarisasi, pemilahan, dan pendinginan pasca-panen (Cold Chain System).",
    deskripsiLengkap: "Tempat berkumpulnya hasil panen internal dan petani mitra. Proses operasional dimulai jam 13.00 WIB untuk grading kualitas sayur dan buah. Fasilitas ini sangat vital untuk menjaga umur simpan produk pertanian sebelum dipasarkan.",
    komoditas: ["Produk Organik", "Produk Anorganik", "Buah-buahan"],
    highlights: [
      "Dilengkapi ruang Cold Storage untuk rantai dingin.",
      "Distribusi armada menggunakan mobil Cool Box penahan suhu.",
      "Menyerap dan memberdayakan hasil panen dari petani mitra mingguan."
    ],
    gambarUtama: "/images/fasilitas/Packing-house.webp",
  },
  {
    id: "sobatani-fresh",
    nama: "SobaTani IPB (Fresh, Cafe & Product)",
    kategori: "Pengolahan & Kebun",
    deskripsiSingkat: "Outlet hilir sosiopreneurship IPB di ATP yang mengusung konsep SobaTani Fresh, SobaTani Cafe, dan SobaTani Product.",
    deskripsiLengkap: "Sobatani merupakan model ekosistem bisnis yang berbasis sociopreneurship di kampus IPB. SobaTani yang berlokasi di Agribusiness Technology Park ini menjadi ekosistem hilir dari model komersialisasi produk pertanian dan mitra UMKM binaan IPB. Dalam pelaksanaannya, Sobatani IPB mengusung beberapa kategori kegiatan dan produk, antara lain Sobatani Cafe, Sobatani Fresh, dan Sobatani Product, yang diwujudkan melalui kerja sama UMKM, expo, dan bazar.\n\nMelalui pendekatan tersebut, Sobatani IPB berperan sebagai ruang kolaborasi antara akademisi, pelaku usaha, dan masyarakat dalam mendorong peningkatan nilai tambah produk, perluasan akses pasar, serta penguatan keberlanjutan usaha berbasis pertanian.",
    komoditas: ["SobaTani Fresh", "SobaTani Cafe", "SobaTani Product", "Kemitraan UMKM"],
    highlights: [
      "Model ekosistem bisnis berbasis sociopreneurship di kampus IPB.",
      "Membawahi tiga pilar utama: SobaTani Cafe, Fresh, dan Product.",
      "Ruang kolaborasi akademisi, pelaku usaha UMKM binaan IPB, dan masyarakat luas."
    ],
    gambarUtama: "/images/fasilitas/SobaTani.webp",
  },
  {
    id: "ruang-kantor-pertemuan",
    nama: "Gedung Kantor Utama & Ruang Pertemuan",
    kategori: "Fasilitas Umum & Edukasi",
    deskripsiSingkat: "Pusat administrasi, operasional, dan ruang seminar edukasi agribisnis ATP IPB.",
    deskripsiLengkap: "Gedung utama yang berfungsi sebagai pusat kendali operasional, ruang manajemen, serta Ruang Senat Akademik. Fasilitas meeting room di gedung ini digunakan untuk evaluasi mingguan petani mitra, menyambut kunjungan delegasi internasional, dan pelaksanaan kelas pelatihan digital farming.",
    komoditas: [],
    highlights: [
      "Fasilitas Ruang Senat Akademik dan Meeting Room terintegrasi.",
      "Pusat administrasi kemitraan hulu-hilir dengan ratusan petani lokal.",
      "Ruang orientasi indoor utama sebelum kegiatan tour lapangan."
    ],
    gambarUtama: "/images/fasilitas/ProfilATP.webp",
  },
  {
    id: "balai-rakyat-indonesia",
    nama: "Balai Rakyat Indonesia",
    kategori: "Fasilitas Umum & Edukasi",
    deskripsiSingkat: "Gedung serbaguna pusat pelatihan, pemberdayaan masyarakat, dan rembug petani.",
    deskripsiLengkap: "Fasilitas hasil kolaborasi DPMA IPB University dan YBM BRILiaN yang difungsikan untuk meningkatkan kapasitas SDM. Tempat ini menjadi pusat kegiatan sosial, edukasi, serta pelatihan intensif bagi kelompok tani, nelayan, dan masyarakat agromaritim sekitar.",
    komoditas: [],
    highlights: [
      "Diresmikan bersama YBM BRILiaN sebagai pusat pemberdayaan ekonomi.",
      "Ruang komunal untuk acara besar seperti Rembug Petani Perempuan.",
      "Infrastruktur penunjang utama program sosiopreneurship di ATP."
    ],
    gambarUtama: "/images/fasilitas/BalaiRakyat.webp",
  },
  {
    id: "agroforestry",
    nama: "Agroforestry Kopi-Alpukat",
    kategori: "Pengolahan & Kebun",
    deskripsiSingkat: "Pilot project tumpangsari berbasis pemberdayaan sosial dan pelestarian hutan karbon.",
    deskripsiLengkap: "Model percontohan dari 1000 hektar lahan kerja sama IPB dan Astra di Garut. Sistem tumpangsari kopi dan alpukat dirancang untuk meningkatkan produktivitas, mitigasi iklim (serapan karbon), dan memberdayakan kesejahteraan petani.",
    komoditas: ["Kopi", "Alpukat"],
    highlights: [
      "Bagian dari inisiatif Hutan Karbon IPB-Astra.",
      "Mitigasi perubahan iklim global melalui peningkatan biomassa.",
      "Pemberdayaan langsung perekonomian masyarakat sekitar hutan."
    ],
    gambarUtama: "/images/fasilitas/Agroforestry.webp",
  }
];