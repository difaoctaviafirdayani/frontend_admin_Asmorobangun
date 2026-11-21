"use client";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { api, assetUrl } from "@/lib/api";
import { useToast } from "@/components/Toast";

const TH = { padding: "16px 20px", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" };

function Thumb({ src, alt, onPreview }) {
  const [gagalMuat, setGagalMuat] = useState(false);
  const url = assetUrl(src);

  if (!url || gagalMuat) {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#EADCCB",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7A6A5A",
          fontSize: "12px",
        }}
      >
        -
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setGagalMuat(true)}
      onClick={() => onPreview?.(url, alt)}
      title="Klik untuk memperbesar"
      style={{
        width: "40px",
        height: "40px",
        objectFit: "cover",
        borderRadius: "6px",
        border: "1px solid #D4BBA5",
        display: "block",
        cursor: "pointer",
      }}
    />
  );
}

function Lightbox({ url, alt, onClose }) {
  // Tutup pakai tombol Esc + kunci scroll halaman selama modal terbuka
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
        cursor: "default",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#FDFCEA",
          color: "#3A2A1A",
          fontSize: "20px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          cursor: "default",
        }}
      />
      <div style={{ marginTop: "14px", color: "#FDFCEA", fontSize: "16px", fontWeight: 600 }}>{alt}</div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel = "Hapus", loading = false, onConfirm, onCancel }) {
  // Tutup pakai tombol Esc + kunci scroll halaman selama dialog terbuka
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel, loading]);

  return (
    <div
      onClick={() => !loading && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#F6E3E3",
            color: "#A84C4C",
            fontSize: "26px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          !
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#3A2A1A" }}>{title}</h2>
        <p style={{ margin: "0 0 22px", fontSize: "14px", lineHeight: 1.5, color: "#7A6A5A" }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              backgroundColor: "#F1E6DF",
              color: "#5A3E2B",
              border: "none",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              backgroundColor: "#A84C4C",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TabelTopeng({ list, onEdit, onChanged }) {
  const toast = useToast();
  const [preview, setPreview] = useState(null); // { url, alt } atau null
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function konfirmasiHapus() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/topeng/${toDelete.id}`, { method: "DELETE" });
      toast("Topeng dihapus.");
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus topeng.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      <div
        style={{
          backgroundColor: "#FDFCEA",
          border: "1.5px solid #D4BBA5",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #D4BBA5", color: "#3A2A1A" }}>
                <th style={TH}>Gambar</th>
                <th style={TH}>Nama</th>
                <th style={TH}>Harga</th>
                <th style={{ ...TH, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "24px 20px", color: "#7A6A5A", textAlign: "center" }}>
                    Belum ada topeng.
                  </td>
                </tr>
              )}
              {list.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <Thumb src={row.image} alt={row.name} onPreview={(url, alt) => setPreview({ url, alt })} />
                  </td>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <strong style={{ color: "#3A2A1A", display: "block" }}>{row.name}</strong>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    {formatRupiah(row.price)}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        style={{
                          backgroundColor: "#E6DCC9",
                          color: "#3A2A1A",
                          border: "1px solid #C4A482",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(row)}
                        style={{
                          backgroundColor: "#A84C4C",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Hapus topeng?"
          message={
            <>
              Anda yakin ingin menghapus topeng <strong style={{ color: "#3A2A1A" }}>{toDelete.name}</strong>?
            </>
          }
          loading={deleting}
          onConfirm={konfirmasiHapus}
          onCancel={() => setToDelete(null)}
        />
      )}

      {preview && <Lightbox url={preview.url} alt={preview.alt} onClose={() => setPreview(null)} />}
    </>
  );
}