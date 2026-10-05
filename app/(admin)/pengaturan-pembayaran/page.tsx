"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import ImageField from "@/components/ImageField";
import { useToast } from "@/components/Toast";

interface Settings {
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrisMerchantName: string;
  qrisImage: string;
  whatsapp: string;
}

const EMPTY: Settings = { bankName: "", accountNumber: "", accountName: "", qrisMerchantName: "", qrisImage: "", whatsapp: "" };

export default function PengaturanPembayaranPage() {
  const toast = useToast();
  const { data, loading, error } = useLoad(() => api<{ settings: Settings }>("/payments/settings"));
  const [s, setS] = useState<Settings>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setS({ ...EMPTY, ...data.settings });
  }, [data]);

  const set = (k: keyof Settings) => (v: string) => setS((old) => ({ ...old, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/payments/settings", { method: "PATCH", body: s });
      toast("Pengaturan pembayaran disimpan.");
    } catch (err: any) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <div className="a-empty">Memuat...</div>;
  if (error) return <div className="a-empty">{error}</div>;

  return (
    <form className="a-card a-card-pad" style={{ maxWidth: 620 }} onSubmit={submit}>
      <h3 style={{ marginBottom: 12 }}>Rekening bank</h3>
      <div className="a-field"><label>Nama bank</label><input value={s.bankName} onChange={(e) => set("bankName")(e.target.value)} /></div>
      <div className="a-field"><label>Nomor rekening</label><input value={s.accountNumber} onChange={(e) => set("accountNumber")(e.target.value)} /></div>
      <div className="a-field"><label>Atas nama</label><input value={s.accountName} onChange={(e) => set("accountName")(e.target.value)} /></div>

      <h3 style={{ margin: "18px 0 12px" }}>QRIS umum</h3>
      <div className="a-field"><label>Nama merchant</label><input value={s.qrisMerchantName} onChange={(e) => set("qrisMerchantName")(e.target.value)} /></div>
      <ImageField label="Gambar QRIS" value={s.qrisImage} onChange={set("qrisImage")} />
      <div className="a-field-hint" style={{ marginBottom: 14 }}>Bila kosong, aplikasi menampilkan QR simulasi (untuk demo).</div>

      <h3 style={{ margin: "18px 0 12px" }}>Kontak</h3>
      <div className="a-field">
        <label>Nomor WhatsApp admin</label>
        <input value={s.whatsapp} onChange={(e) => set("whatsapp")(e.target.value)} placeholder="6281234567890" />
        <div className="a-field-hint">Format internasional tanpa + dan tanpa 0 di depan.</div>
      </div>
      <button className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan pengaturan"}</button>
    </form>
  );
}
