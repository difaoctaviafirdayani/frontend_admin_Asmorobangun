"use client";
import { useRef, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { useToast } from "./Toast";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/** Pilih foto -> langsung diunggah ke POST /api/uploads/image, URL-nya disimpan di form. */
export default function ImageField({ label, value, onChange }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setBusy(true);
    try {
      const res = await api<{ item: { url: string } }>("/uploads/image", { method: "POST", form: fd });
      onChange(res.item.url);
      toast("Foto terunggah.");
    } catch (e: any) {
      toast(e.message);
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
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
