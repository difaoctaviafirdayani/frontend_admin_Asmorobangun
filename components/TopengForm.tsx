"use client";

import { useActionState, useEffect, useState } from "react";
import { saveTopengAction } from "@/app/actions";
import type { ActionState } from "@/lib/schemas";
import { formatRupiah } from "@/lib/format";
import ImageField from "@/components/ImageField";
import { useToast } from "@/components/Toast";

export interface TopengData {
  id: string;
  name: string;
  character?: string;
  color?: string;
  price: number;
  image?: string;
  desc?: string;
}

interface Props {
  topeng?: TopengData | null; // null/undefined = tambah baru, ada isinya = edit
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: ActionState = { success: false };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <div className="a-field-error">{messages[0]}</div>;
}

// Form topeng di dalam popup. Disimpan lewat Server Action (cek login -> role -> Zod -> backend).
export function TopengForm({ topeng, onSuccess, onCancel }: Props) {
  const toast = useToast();
  const [state, formAction, isPending] = useActionState(saveTopengAction, initialState);
  const err = state.errors ?? {};
  const saved: Record<string, string | undefined> = state.values ?? {};

  const [price, setPrice] = useState(String(topeng?.price ?? ""));
  const [image, setImage] = useState(topeng?.image ?? "");

  // Berhasil: tutup popup + muat ulang daftar.
  useEffect(() => {
    if (state.success) {
      toast(state.message || "Tersimpan.");
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Setelah validasi gagal, pulihkan isian yang tadi diketik.
  useEffect(() => {
    if (state.values) {
      setPrice(state.values.price ?? "");
      setImage(state.values.image ?? "");
    }
  }, [state.values]);

  // Nilai awal tiap field: isian terakhir (kalau gagal validasi), kalau tidak ada pakai data topeng.
  const val = (key: keyof TopengData): string => saved[key] ?? String(topeng?.[key] ?? "");

  return (
    <form action={formAction} noValidate className="a-form-grid">
      {topeng && <input type="hidden" name="id" value={topeng.id} />}

      {state.message && !state.success && <div className="a-form-banner error full">{state.message}</div>}

      <div className={`a-field full${err.name ? " has-error" : ""}`}>
        <label htmlFor="name">Nama topeng *</label>
        <input id="name" name="name" type="text" defaultValue={val("name")} placeholder="mis. Topeng Panji" />
        <FieldError messages={err.name} />
      </div>

      <div className={`a-field${err.character ? " has-error" : ""}`}>
        <label htmlFor="character">Karakter / watak</label>
        <input id="character" name="character" type="text" defaultValue={val("character")} />
        <FieldError messages={err.character} />
      </div>

      <div className={`a-field${err.color ? " has-error" : ""}`}>
        <label htmlFor="color">Warna</label>
        <input id="color" name="color" type="text" defaultValue={val("color")} />
        <FieldError messages={err.color} />
      </div>

      <div className={`a-field full${err.price ? " has-error" : ""}`}>
        <label htmlFor="price">Harga *</label>
        <div className="a-money">
          <span>Rp</span>
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={price}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="a-field-hint">
          Tampil sebagai {formatRupiah(price)}. Topeng dibuat sesuai pesanan, jadi tidak ada stok.
        </div>
        <FieldError messages={err.price} />
      </div>

      <div className={`a-field full${err.desc ? " has-error" : ""}`}>
        <label htmlFor="desc">Deskripsi</label>
        <textarea id="desc" name="desc" rows={4} defaultValue={val("desc")} />
        <FieldError messages={err.desc} />
      </div>

      <div className="full">
        <ImageField label="Foto topeng" value={image} onChange={setImage} />
        <input type="hidden" name="image" value={image} />
      </div>

      <div className="a-modal-foot full">
        <button type="button" className="a-btn a-btn-ghost" onClick={onCancel}>
          Batal
        </button>
        <button type="submit" className="a-btn a-btn-primary" disabled={isPending}>
          {isPending ? "Menyimpan..." : topeng ? "Simpan perubahan" : "Simpan topeng"}
        </button>
      </div>
    </form>
  );
}