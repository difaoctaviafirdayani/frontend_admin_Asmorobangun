"use client";
import { useLoad } from "@/lib/useLoad";
import { api } from "@/lib/api";

// ====== SESUAIKAN BAGIAN INI (tebakan, cek di page.jsx pesanan & pendaftar) ======
const ENDPOINT_PESANAN = ["/topeng-orders", "/orders", "/topeng/orders"];
const ENDPOINT_PENDAFTAR = ["/bookings"];

// Nilai status yang dihitung sebagai "sudah dibayar" (masuk pendapatan)
const STATUS_LUNAS = ["paid", "confirmed", "processing", "shipped", "completed", "done", "selesai", "lunas", "approved"];
// Nilai status yang berarti "menunggu konfirmasi pembayaran"
const STATUS_MENUNGGU = ["pending", "waiting", "menunggu", "waiting_payment", "awaiting_confirmation"];
// Nilai status pesanan yang belum dikirim
const STATUS_BELUM_KIRIM = ["paid", "confirmed", "processing"];
// Status yang tidak dihitung sama sekali
const STATUS_BATAL = ["cancelled", "canceled", "rejected", "dibatalkan", "ditolak"];
// ================================================================================

const CARD = { backgroundColor: "#FDFCEA", border: "1.5px solid #D4BBA5", borderRadius: "12px", padding: "20px" };

const norm = (s) => String(s ?? "").toLowerCase();
const inList = (s, list) => list.includes(norm(s));

function toList(res) {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    for (const v of Object.values(res)) if (Array.isArray(v)) return v;
  }
  return [];
}

async function ambilDaftar(endpoints) {
  let lastErr = null;
  for (const ep of endpoints) {
    try {
      return { list: toList(await api(ep)), ep, err: null };
    } catch (e) {
      lastErr = e;
    }
  }
  return { list: [], ep: null, err: lastErr?.message || "gagal" };
}

async function muatSemua() {
  const [p, b] = await Promise.all([ambilDaftar(ENDPOINT_PESANAN), ambilDaftar(ENDPOINT_PENDAFTAR)]);
  return { pesanan: p, pendaftar: b };
}

function nilaiPesanan(o) {
  const total = o.total ?? o.totalPrice ?? o.amount ?? o.totalAmount;
  if (total != null) return Number(total) || 0;
  return (Number(o.price) || 0) * (Number(o.qty) || 1);
}

function tgl(v) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function ymd(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function singkatRupiah(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (v >= 1_000) return `Rp ${Math.round(v / 1_000)} rb`;
  return `Rp ${v}`;
}

function lalu(d) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const j = Math.floor(m / 60);
  if (j < 24) return `${j} jam lalu`;
  return `${Math.floor(j / 24)} hari lalu`;
}

function hitung(pesananRaw, pendaftarRaw) {
  const pesanan = pesananRaw.filter((o) => !inList(o.status, STATUS_BATAL));
  const pendaftar = pendaftarRaw.filter((b) => !inList(b.status, STATUS_BATAL));
  const now = new Date();
  const bulanIni = (d) => d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

  const pesananLunas = pesanan.filter((o) => inList(o.status, STATUS_LUNAS));
  const pendaftarLunas = pendaftar.filter((b) => inList(b.status, STATUS_LUNAS));

  const tglPesanan = (o) => tgl(o.createdAt ?? o.date);
  const tglDaftar = (b) => tgl(b.createdAt ?? b.date);

  // Kartu ringkasan
  const revenueMonth =
    pesananLunas.filter((o) => bulanIni(tglPesanan(o))).reduce((s, o) => s + nilaiPesanan(o), 0) +
    pendaftarLunas.filter((b) => bulanIni(tglDaftar(b))).reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const ordersTopeng = pesanan.filter((o) => bulanIni(tglPesanan(o))).length;
  const lesAktif = pendaftarLunas.filter(
    (b) => /les|kelas|karawitan|tari/i.test(b.facilityName || "") || norm(b.bookingType) === "reguler",
  );
  const activeStudents = new Set(lesAktif.map((b) => b.userName)).size;

  // Agenda hari ini
  const hariIni = ymd(now);
  const agenda = pendaftar
    .filter((b) => typeof b.date === "string" && b.date.startsWith(hariIni))
    .map((b) => ({
      time: b.time || "--.--",
      title: b.facilityName || "Layanan",
      place: b.userName || "-",
      status: inList(b.status, STATUS_MENUNGGU) ? "Menunggu" : "Terjadwal",
    }));

  // Pendapatan 7 hari terakhir vs 7 hari sebelumnya
  const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const labels = [];
  const thisWeek = [];
  const lastWeek = [];
  const semuaLunas = [
    ...pesananLunas.map((o) => ({ d: tglPesanan(o), v: nilaiPesanan(o) })),
    ...pendaftarLunas.map((b) => ({ d: tglDaftar(b), v: Number(b.amount) || 0 })),
  ].filter((x) => x.d);
  const jumlahPada = (day) => semuaLunas.filter((x) => ymd(x.d) === ymd(day)).reduce((s, x) => s + x.v, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const d2 = new Date(d);
    d2.setDate(d2.getDate() - 7);
    labels.push(NAMA_HARI[d.getDay()]);
    thisWeek.push(jumlahPada(d));
    lastWeek.push(jumlahPada(d2));
  }

  // Perlu diperhatikan
  const menunggu = [...pesanan, ...pendaftar].filter((x) => inList(x.status, STATUS_MENUNGGU)).length;
  const attention = [];
  if (menunggu > 0) attention.push({ label: "Menunggu", text: `${menunggu} pembayaran belum dikonfirmasi` });

  // Per lini
  const hitungPer = (arr, key) => {
    const m = {};
    arr.forEach((x) => {
      const k = x[key];
      if (k) m[k] = (m[k] || 0) + (Number(x.qty) || 1);
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const topTopeng = hitungPer(pesanan.filter((o) => bulanIni(tglPesanan(o))), "topengName").slice(0, 3);
  const perKelas = hitungPer(lesAktif, "facilityName").slice(0, 4);
  const belumKirim = pesanan.filter((o) => inList(o.status, STATUS_BELUM_KIRIM)).length;
  const lines = [
    {
      title: "Topeng",
      subtitle: "terlaris bulan ini",
      items: topTopeng.length ? topTopeng.map(([n, c], i) => `${i + 1}. ${n} (${c})`) : ["Belum ada pesanan"],
      footer: `Menunggu dikirim: ${belumKirim}`,
    },
    {
      title: "Les Tari & Karawitan",
      subtitle: "murid per-kelas",
      items: perKelas.length ? perKelas.map(([n, c]) => `${n}: ${c}`) : ["Belum ada murid"],
      footer: `Murid aktif: ${activeStudents}`,
    },
  ];

  // Aktivitas terkini
  const activity = [
    ...pesanan.map((o) => ({ d: tglPesanan(o), text: `pemesanan baru : ${o.topengName || "topeng"} (${o.userName || "-"})` })),
    ...pendaftar.map((b) => ({ d: tglDaftar(b), text: `pendaftaran : ${b.facilityName || "layanan"} (${b.userName || "-"})` })),
  ]
    .filter((x) => x.d)
    .sort((a, b) => b.d - a.d)
    .slice(0, 5)
    .map((x) => ({ text: x.text, ago: lalu(x.d) }));

  return { revenueMonth, ordersTopeng, activeStudents, agenda, revenue7: { labels, thisWeek, lastWeek }, attention, lines, activity };
}

const BADGE = {
  Berlangsung: { bg: "#DCEFE3", fg: "#2F6B4A" },
  Menunggu: { bg: "#E8C97A", fg: "#6A4A10" },
  Terjadwal: { bg: "#DCEFE3", fg: "#2F6B4A" },
};

function judul(teks) {
  return <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: 700, color: "#3A2A1A" }}>{teks}</h2>;
}

function KartuAngka({ label, nilai }) {
  return (
    <div style={{ ...CARD, padding: "16px 18px" }}>
      <div style={{ fontSize: "12px", color: "#5A4A3A", letterSpacing: "0.3px", marginBottom: "10px" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: "#3A2A1A" }}>{nilai}</div>
    </div>
  );
}

function Agenda({ list }) {
  return (
    <div style={CARD}>
      {judul("AGENDA HARI INI")}
      <div style={{ fontSize: "12px", color: "#7A6A5A", marginTop: "-10px", marginBottom: "14px" }}>Pendaftaran dengan jadwal hari ini</div>
      {list.length === 0 && <div style={{ color: "#7A6A5A", fontSize: "14px" }}>Tidak ada agenda hari ini.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {list.map((a, i) => {
          const b = BADGE[a.status] || { bg: "#EADCCB", fg: "#5A4A3A" };
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "#FDF0CF", borderRadius: "8px", padding: "10px 16px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#3A2A1A", minWidth: "62px" }}>{a.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#3A2A1A" }}>{a.title}</div>
                <div style={{ fontSize: "12px", color: "#5A4A3A" }}>{a.place}</div>
              </div>
              <span style={{ backgroundColor: b.bg, color: b.fg, fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "4px", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>
                {String(a.status).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrafikPendapatan({ data }) {
  const { labels = [], thisWeek = [], lastWeek = [] } = data || {};
  const max = Math.max(1, ...thisWeek, ...lastWeek);
  const TINGGI = 170;
  return (
    <div style={{ ...CARD, flex: "2 1 420px", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          {judul("PENDAPATAN 7 HARI")}
          <div style={{ fontSize: "12px", color: "#7A6A5A", marginTop: "-10px" }}>Gabungan pesanan dan pendaftaran</div>
        </div>
        <div style={{ fontSize: "11px", color: "#5A4A3A" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#9A7B6A", marginRight: 6 }} />
          Minggu ini
          <br />
          <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#3A2418", marginRight: 6 }} />
          Minggu lalu
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", height: TINGGI + 10, marginTop: "18px", borderBottom: "1px solid #D4BBA5" }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px", height: "100%" }}>
            <div title={`Minggu ini: ${singkatRupiah(thisWeek[i])}`} style={{ width: "40%", height: `${((thisWeek[i] || 0) / max) * TINGGI}px`, backgroundColor: "#9A7B6A", borderRadius: "2px 2px 0 0" }} />
            <div title={`Minggu lalu: ${singkatRupiah(lastWeek[i])}`} style={{ width: "40%", height: `${((lastWeek[i] || 0) / max) * TINGGI}px`, backgroundColor: "#3A2418", borderRadius: "2px 2px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "18px", marginTop: "6px" }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#3A2A1A" }}>{l.toLowerCase()}</div>
        ))}
      </div>
    </div>
  );
}

function PerluDiperhatikan({ list }) {
  return (
    <div style={{ ...CARD, flex: "1 1 280px", minWidth: 0 }}>
      {judul("PERLU DIPERHATIKAN")}
      <div style={{ fontSize: "12px", color: "#7A6A5A", marginTop: "-10px", marginBottom: "18px" }}>butuh tindakan admin</div>
      {list.length === 0 && <div style={{ color: "#7A6A5A", fontSize: "14px" }}>Tidak ada yang perlu ditindaklanjuti.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {list.map((a, i) => (
          <div key={i} style={{ backgroundColor: "#5A1A1A", color: "#FFFFFF", borderRadius: "6px", padding: "12px 14px", fontSize: "12px" }}>
            <strong>{a.label} :</strong> &nbsp;{a.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function PerLini({ list }) {
  return (
    <div style={{ marginTop: "24px" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700, color: "#3A2A1A" }}>STATISTIK PER LINI</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {list.map((l) => (
          <div key={l.title} style={{ ...CARD, padding: "14px 16px", backgroundColor: "#FFFEF5" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#3A2A1A" }}>{l.title}</div>
            <div style={{ fontSize: "11px", fontStyle: "italic", color: "#7A6A5A", marginBottom: "10px" }}>{l.subtitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#3A2A1A", marginBottom: "14px" }}>
              {l.items.map((it, i) => <div key={i}>{it}</div>)}
            </div>
            {l.footer && <div style={{ fontSize: "12px", color: "#3A2A1A" }}>{l.footer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Aktivitas({ list }) {
  return (
    <div style={{ ...CARD, marginTop: "24px" }}>
      {judul("Aktivitas Terkini")}
      {list.length === 0 && <div style={{ color: "#7A6A5A", fontSize: "14px" }}>Belum ada aktivitas.</div>}
      {list.map((a, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "12px", color: "#3A2A1A", padding: "6px 0" }}>
          <span>{a.text}</span>
          <span style={{ whiteSpace: "nowrap" }}>{a.ago}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatistikPage() {
  const { data, error } = useLoad(muatSemua);
  const pesanan = data?.pesanan;
  const pendaftar = data?.pendaftar;
  const d = data ? hitung(pesanan.list, pendaftar.list) : null;

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "normal", color: "#3A2A1A", marginBottom: "20px", fontFamily: "'Margarine', cursive, sans-serif" }}>
        Statistik
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}
      {pesanan?.err && (
        <div style={{ color: "#A84C4C", marginBottom: "8px", fontSize: "13px" }}>
          Data pesanan gagal dimuat ({pesanan.err}). Cek ENDPOINT_PESANAN di bagian atas file.
        </div>
      )}
      {pendaftar?.err && (
        <div style={{ color: "#A84C4C", marginBottom: "8px", fontSize: "13px" }}>
          Data pendaftar gagal dimuat ({pendaftar.err}). Cek ENDPOINT_PENDAFTAR di bagian atas file.
        </div>
      )}

      {!d ? (
        <div style={{ color: "#7A6A5A" }}>Memuat...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <KartuAngka label="Pendapatan bulan ini" nilai={singkatRupiah(d.revenueMonth)} />
            <KartuAngka label="Pesanan topeng bulan ini" nilai={d.ordersTopeng} />
            <KartuAngka label="Murid les aktif" nilai={d.activeStudents} />
          </div>

          <Agenda list={d.agenda} />

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
            <GrafikPendapatan data={d.revenue7} />
            <PerluDiperhatikan list={d.attention} />
          </div>

          <PerLini list={d.lines} />
          <Aktivitas list={d.activity} />
        </>
      )}
    </div>
  );
}