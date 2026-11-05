"use client";
import { useRef, useState } from "react";
import { assetUrl } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import { useToast } from "./Toast";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/** Pilih foto -> divalidasi (jenis & ukuran) -> diunggah ke backend -> URL-nya disimpan di form. */
export default function ImageField({ label, value, onChange }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadImage(file);
      onChange(uploaded.url);
      toast("Foto terunggah.");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Gagal mengunggah foto.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="a-field a-image-field">
      <label>{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="preview" src={assetUrl(value)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
      )}
      <div className="a-actions">
        <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? "Mengunggah..." : value ? "Ganti foto" : "Pilih foto"}
        </button>
        {value && (
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => onChange("")}>
            Hapus
          </button>
        )}
      </div>
      <div className="a-field-hint">JPG, PNG, WEBP, atau GIF. Maksimal 8 MB.</div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}