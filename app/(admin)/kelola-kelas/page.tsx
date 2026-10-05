"use client";
import { FormEvent, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatDate, truncate } from "@/lib/format";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import ImageField from "@/components/ImageField";
import Stars from "@/components/Stars";
import { useToast } from "@/components/Toast";

interface Methods {
  cash?: { enabled?: boolean; note?: string };
  transfer?: { enabled?: boolean; note?: string };
  qris?: { enabled?: boolean; image?: string };
}
interface Facility {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  priceInfo: string;
  image: string;
  bookingType: string;
  avgRating: number | null;
  reviewCount: number;
  paymentMethods?: Methods;
}
interface Review { id: string; userName: string; rating: number; comment: string; date: string }

export default function KelolaKelasPage() {
  const { data, loading, error, reload } = useLoad(() => api<{ facilities: Facility[] }>("/facilities"));
  const [detail, setDetail] = useState<Facility | null>(null);
  const [edit, setEdit] = useState<Facility | null>(null);
  const rows = data?.facilities || [];

  return (
    <>
      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Gambar</th><th>Nama</th><th>Harga</th><th>Rating</th><th>Aksi</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5}>Memuat...</td></tr>}
              {error && <tr><td colSpan={5} className="a-empty">{error}</td></tr>}
              {rows.map((f) => (
                <tr key={f.id}>
                  <td>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="a-thumb" src={assetUrl(f.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")} /></td>
                  <td><strong>{f.name}</strong><div className="a-muted">{f.category}</div></td>
                  <td>{truncate(f.priceInfo, 50)}</td>
                  <td>{f.avgRating ? <><Stars value={f.avgRating} /> <span className="a-muted">{f.avgRating} ({f.reviewCount})</span></> : <span className="a-muted">Belum ada</span>}</td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setDetail(f)}>Detail</button>
                      <button className="a-btn a-btn-primary a-btn-sm" onClick={() => setEdit(f)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <DetailModal facility={detail} onClose={() => setDetail(null)} onChanged={reload} />}
      {edit && <EditModal facility={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); reload(); }} />}
    </>
  );
}

function DetailModal({ facility: f, onClose, onChanged }: { facility: Facility; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const { data, loading, reload } = useLoad(() => api<{ reviews: Review[] }>(`/facilities/${f.id}`), [f.id]);

  async function del(id: string) {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      await api(`/facilities/${f.id}/reviews/${id}`, { method: "DELETE" });
      toast("Ulasan dihapus.");
      reload();
      onChanged();
    } catch (e: any) {
      toast(e.message);
    }
  }

  return (
    <Modal title={f.name} onClose={onClose} wide>
      {f.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="a-detail-img" src={assetUrl(f.image)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
      )}
      <DetailList
        rows={[
          ["Kategori", f.category],
          ["Jenis layanan", f.bookingType],
          ["Harga", f.priceInfo],
          ["Deskripsi singkat", f.shortDesc],
          ["Deskripsi lengkap", f.longDesc],
        ]}
      />
      <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Ulasan pendaftar</div>
        <div className="a-field-hint" style={{ marginBottom: 8 }}>Ulasan tidak bisa diedit. Admin hanya bisa menghapusnya.</div>
        {loading && <div className="a-muted">Memuat ulasan...</div>}
        {data && data.reviews.length === 0 && <div className="a-empty">Belum ada ulasan.</div>}
        {data?.reviews.map((r) => (
          <div className="a-review-row" key={r.id}>
            <div className="a-review-head"><strong>{r.userName}</strong><span className="a-muted">{formatDate(r.date)}</span></div>
            <Stars value={r.rating} />
            <div style={{ fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{r.comment}</div>
            <div style={{ marginTop: 8 }}>
              <button className="a-btn a-btn-danger a-btn-sm" onClick={() => del(r.id)}>Hapus ulasan</button>
            </div>
          </div>
        ))}
      </div>
      <div className="a-modal-foot"><button className="a-btn a-btn-ghost" onClick={onClose}>Tutup</button></div>
    </Modal>
  );
}

function EditModal({ facility: f, onClose, onSaved }: { facility: Facility; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const isEvent = f.bookingType === "event"; // layanan event memakai penawaran admin, tanpa metode bayar
  const pm = f.paymentMethods || {};
  const [name, setName] = useState(f.name);
  const [priceInfo, setPriceInfo] = useState(f.priceInfo);
  const [longDesc, setLongDesc] = useState(f.longDesc);
  const [image, setImage] = useState(f.image || "");
  const [cashOn, setCashOn] = useState(pm.cash?.enabled !== false);
  const [cashNote, setCashNote] = useState(pm.cash?.note || "");
  const [trfOn, setTrfOn] = useState(pm.transfer?.enabled !== false);
  const [trfNote, setTrfNote] = useState(pm.transfer?.note || "");
  const [qrisOn, setQrisOn] = useState(pm.qris?.enabled !== false);
  const [qrisImg, setQrisImg] = useState(pm.qris?.image || "");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload: Record<string, any> = { name, priceInfo, longDesc, image };
    if (!isEvent) {
      payload.paymentMethods = {
        cash: { enabled: cashOn, note: cashNote },
        transfer: { enabled: trfOn, note: trfNote },
        qris: { enabled: qrisOn, image: qrisImg },
      };
    }
    setSaving(true);
    try {
      await api(`/facilities/${f.id}`, { method: "PATCH", body: payload });
      toast("Fasilitas diperbarui.");
      onSaved();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit: ${f.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="a-field"><label>Nama</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="a-field"><label>Harga</label><input value={priceInfo} onChange={(e) => setPriceInfo(e.target.value)} /></div>
        <div className="a-field"><label>Deskripsi</label><textarea rows={4} value={longDesc} onChange={(e) => setLongDesc(e.target.value)} /></div>

        {isEvent ? (
          <div className="a-field-hint" style={{ marginBottom: 12 }}>
            Layanan ini belum memakai pembayaran di muka (melalui penawaran admin), jadi tidak ada pengaturan metode pembayaran.
          </div>
        ) : (
          <div className="a-field">
            <label>Metode pembayaran</label>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={cashOn} onChange={(e) => setCashOn(e.target.checked)} /> Tunai</label>
              <input placeholder="Catatan, mis. Bayar di sanggar" value={cashNote} onChange={(e) => setCashNote(e.target.value)} />
            </div>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={trfOn} onChange={(e) => setTrfOn(e.target.checked)} /> Transfer Bank</label>
              <input placeholder="Catatan, mis. 1234567890 (BCA a.n. Sanggar)" value={trfNote} onChange={(e) => setTrfNote(e.target.value)} />
              <div className="a-field-hint">Kosongkan untuk memakai rekening umum dari Pengaturan Pembayaran.</div>
            </div>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={qrisOn} onChange={(e) => setQrisOn(e.target.checked)} /> QRIS</label>
              <ImageField label="Gambar QRIS merchant" value={qrisImg} onChange={setQrisImg} />
            </div>
          </div>
        )}

        <ImageField label="Gambar layanan" value={image} onChange={setImage} />
        <div className="a-modal-foot">
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>Batal</button>
          <button className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}
