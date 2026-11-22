// Mengubah catatan error teknis menjadi bahasa yang mudah dimengerti admin.

const AREA = [
  [/\/auth/i, "Login / akun"],
  [/\/notifications/i, "Notifikasi"],
  [/\/facilities|\/layanan/i, "Layanan"],
  [/\/bookings/i, "Booking kelas"],
  [/\/orders|\/topeng/i, "Pesanan topeng"],
  [/\/payments/i, "Pembayaran"],
  [/\/forum/i, "Forum"],
  [/\/articles/i, "Artikel"],
  [/\/gallery/i, "Galeri"],
  [/\/announcements/i, "Pengumuman"],
  [/\/culture|\/faqs/i, "Edukasi / FAQ"],
  [/\/reviews/i, "Ulasan"],
  [/\/ai|\/knowledge/i, "Chatbot AI"],
  [/\/uploads|\/upload/i, "Unggah gambar"],
];

const SOURCE_LABEL = { backend: "Server", user: "Aplikasi user", admin: "Halaman admin" };

// Urutan penting: aturan yang lebih spesifik di atas.
const RULES = [
  {
    test: (m) => /ETIMEDOUT|ECONNREFUSED|ECONNRESET|PROTOCOL_CONNECTION_LOST|ENOTFOUND|too many connections/i.test(m),
    title: "Server gagal terhubung ke database",
    hint: "Biasanya sementara. Kalau terus muncul, cek database atau hosting.",
    level: "tinggi",
  },
  {
    test: (m) => /layanan ai|ai terlalu lama|api key|gagal menghubungi layanan ai|keluaran ai/i.test(m),
    title: "Chatbot AI sedang bermasalah",
    hint: "Cek API key dan kuota AI. Chatbot mungkin tidak menjawab.",
    level: "sedang",
  },
  {
    test: (m) => /RenderFlex|overflowed/i.test(m),
    title: "Ada tampilan yang terpotong di aplikasi",
    hint: "Tidak mengganggu fungsi. Perlu diperbaiki developer.",
    level: "rendah",
  },
  {
    test: (m) => /SocketException|Failed host lookup|Connection refused|Network is unreachable|XMLHttpRequest|Failed to fetch/i.test(m),
    title: "Aplikasi tidak bisa terhubung ke server",
    hint: "Biasanya karena internet pengguna atau server sedang mati.",
    level: "sedang",
  },
  {
    test: (m) => /timeout|timed out/i.test(m),
    title: "Server terlalu lama merespons",
    hint: "Bisa terjadi saat server sibuk.",
    level: "sedang",
  },
  {
    test: (m) => /jwt|token|unauthorized/i.test(m),
    title: "Masalah sesi login",
    hint: "Pengguna perlu login ulang.",
    level: "rendah",
  },
  {
    test: (m) => /null|undefined|is not a function|type ?error|NoSuchMethod/i.test(m),
    title: "Ada kesalahan program",
    hint: "Perlu diperiksa developer.",
    level: "sedang",
  },
];

export function areaOf(path) {
  const p = String(path || "");
  const hit = AREA.find(([re]) => re.test(p));
  return hit ? hit[1] : null;
}

export function describeLog(log) {
  const msg = String(log.message || "");
  const rule = RULES.find((r) => r.test(msg));
  const area = areaOf(log.path);

  let title;
  let hint;
  let level;
  if (rule) {
    ({ title, hint, level } = rule);
  } else if ((log.status || 0) >= 500) {
    title = "Terjadi gangguan di server";
    hint = "Kalau sering muncul, minta developer memeriksa.";
    level = "sedang";
  } else {
    title = "Terjadi kesalahan";
    hint = "Kalau sering muncul, minta developer memeriksa.";
    level = "rendah";
  }

  return {
    title,
    hint,
    level, // "tinggi" | "sedang" | "rendah"
    area,
    sourceLabel: SOURCE_LABEL[log.source] || "Sistem",
    // Detail teknis tetap disimpan untuk developer
    technical: [msg, log.path, log.status].filter(Boolean).join(" · "),
  };
}

// Gabungkan error yang sama (judul + area + sumber) jadi satu baris dengan jumlahnya.
export function groupLogs(logs) {
  const map = new Map();
  for (const log of logs) {
    const d = describeLog(log);
    const key = `${d.title}|${d.area}|${log.source}`;
    const g = map.get(key);
    if (g) {
      g.count += 1;
      g.unread = g.unread || !log.read;
    } else {
      map.set(key, { key, ...d, count: 1, unread: !log.read, createdAt: log.createdAt, ids: [] });
    }
    map.get(key).ids.push(log.id);
  }
  return Array.from(map.values()); // urutan sudah dari terbaru
}