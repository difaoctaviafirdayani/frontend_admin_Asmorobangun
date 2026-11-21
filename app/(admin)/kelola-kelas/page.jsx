"use client";
import { useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatDate, truncate, getErrorMessage } from "@/lib/format";
import { HARI, buildKelasPayload, initialKelasForm, validateKelas } from "@/lib/kelas";
import { formatRupiah } from "@/lib/format";
import Modal from "@/components/Modal";
import DetailList from "@/components/DetailList";
import ImageField from "@/components/ImageField";
import Stars from "@/components/Stars";
import { useToast } from "@/components/Toast";

export default function KelolaKelasPage() {
  const { data, loading, error, reload } = useLoad(() => api("/facilities"));
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const rows = data?.facilities ?? [];

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
                  <td>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="a-thumb" src={assetUrl(f.image)} alt="" onError={(e) => (e.target.style.visibility = "hidden")} /></td>
                  <td><strong>{f.name}</strong><div className="a-muted">{f.category}</div></td>
                  <td>{f.price ? <strong>{formatRupiah(f.price)}</strong> : <span className="a-muted">Belum diatur</span>}<div className="a-muted">{truncate(f.priceInfo, 50)}{Array.isArray(f.availableDays) && f.availableDays.length ? ` · ${f.availableDays.map((d) => HARI.find((h) => h.value === d)?.label).filter(Boolean).join(", ")}` : ""}</div></td>
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

function DetailModal({ facility: f, onClose, onChanged }) {
  const toast = useToast();
  const { data, loading, reload } = useLoad(() => api(`/facilities/${f.id}`), [f.id]);

  async function del(id) {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      await api(`/facilities/${f.id}/reviews/${id}`, { method: "DELETE" });
      toast("Ulasan dihapus.");
      reload();
      onChanged();
    } catch (e) {
      toast(getErrorMessage(e));
    }
  }

  return (
    <Modal title={f.name} onClose={onClose} wide>
      {f.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="a-detail-img" src={assetUrl(f.image)} alt="" onError={(e) => (e.target.style.display = "none")} />
      )}
      <DetailList
        rows={[
          ["Kategori", f.category],
          ["Jenis layanan", f.bookingType],
          ["Harga", f.price ? formatRupiah(f.price) : "Belum diatur"],
          ["Keterangan harga", f.priceInfo],
          ["Hari buka", Array.isArray(f.availableDays) && f.availableDays.length ? f.availableDays.map((d) => HARI.find((h) => h.value === d)?.label).filter(Boolean).join(", ") : "Setiap hari"],
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

function EditModal({ facility: f, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => initialKelasForm(f));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors((old) => {
      if (!old[key]) return old;
      const { [key]: _removed, ...rest } = old;
      return rest;
    });
  }

  async function submit(e) {
    e.preventDefault();
    const found = validateKelas(form);
    if (found) {
      setErrors(found);
      return;
    }
    setSaving(true);
    try {
      await api(`/facilities/${f.id}`, { method: "PATCH", body: buildKelasPayload(form) });
      toast("Fasilitas diperbarui.");
      onSaved();
    } catch (err) {
      toast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit: ${f.name}`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className={`a-field${errors.name ? " has-error" : ""}`}>
          <label>Nama *</label>
          <input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          {errors.name && <div className="a-field-error">{errors.name}</div>}
        </div>
        <div className={`a-field${errors.price ? " has-error" : ""}`}>
          <label>Harga (Rp) *</label>
          <div className="a-money">
            <span>Rp</span>
            <input type="number" inputMode="numeric" min={1} step={1} value={form.price} placeholder="0" onChange={(e) => setField("price", e.target.value)} />
          </div>
          <div className="a-field-hint">Semua layanan berbayar. Pengguna membayar sesuai harga ini (kelas wisata dikali jumlah peserta).</div>
          {errors.price && <div className="a-field-error">{errors.price}</div>}
        </div>
        <div className="a-field">
          <label>Keterangan harga</label>
          <input value={form.priceInfo} placeholder="Opsional. Kosongkan untuk otomatis memakai harga. Contoh: Rp 15.000 per orang" onChange={(e) => setField("priceInfo", e.target.value)} />
        </div>
        <div className="a-field">
          <label>Hari buka</label>
          <div className="a-method-box" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {HARI.map((h) => (
              <label className="a-check-label" key={h.value}>
                <input
                  type="checkbox"
                  checked={form.availableDays.includes(h.value)}
                  onChange={(e) =>
                    setField(
                      "availableDays",
                      e.target.checked ? [...form.availableDays, h.value] : form.availableDays.filter((d) => d !== h.value)
                    )
                  }
                />{" "}
                {h.label}
              </label>
            ))}
          </div>
          <div className="a-field-hint">Kosongkan jika layanan buka setiap hari. Contoh: kelas tari wisata hanya Sabtu, karawitan hanya Minggu. Pengguna hanya bisa memilih tanggal pada hari yang dicentang.</div>
        </div>
        <div className="a-field">
          <label>Deskripsi</label>
          <textarea rows={4} value={form.longDesc} onChange={(e) => setField("longDesc", e.target.value)} />
        </div>

          <div className="a-field">
            <label>Metode pembayaran</label>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={form.cashOn} onChange={(e) => setField("cashOn", e.target.checked)} /> Tunai</label>
              <input placeholder="Catatan, mis. Bayar di sanggar" value={form.cashNote} onChange={(e) => setField("cashNote", e.target.value)} />
            </div>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={form.trfOn} onChange={(e) => setField("trfOn", e.target.checked)} /> Transfer Bank</label>
              <input placeholder="Catatan, mis. 1234567890 (BCA a.n. Sanggar)" value={form.trfNote} onChange={(e) => setField("trfNote", e.target.value)} />
              <div className="a-field-hint">Kosongkan untuk memakai rekening umum dari Pengaturan Pembayaran.</div>
            </div>
            <div className="a-method-box">
              <label className="a-check-label"><input type="checkbox" checked={form.qrisOn} onChange={(e) => setField("qrisOn", e.target.checked)} /> QRIS</label>
              <ImageField label="Gambar QRIS merchant" value={form.qrisImg} onChange={(v) => setField("qrisImg", v)} />
            </div>
          </div>

        <ImageField label="Gambar layanan" value={form.image} onChange={(v) => setField("image", v)} />
        <div className="a-modal-foot">
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}