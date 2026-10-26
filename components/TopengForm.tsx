"use client";

import { useActionState } from "react";
import { createTopengAction } from "@/app/actions";
import type { ActionState } from "@/lib/schemas";

const initialState: ActionState = { success: false };

const RED = "#c0392b";

// Pesan error merah tepat di bawah field
function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p style={{ color: RED, fontSize: 12, marginTop: 4 }}>{messages[0]}</p>;
}

// Border merah kalau field punya error
function borderOf(messages?: string[]) {
  return messages?.length ? { border: `1.5px solid ${RED}`, outlineColor: RED } : undefined;
}

export function TopengForm() {
  const [state, formAction, isPending] = useActionState(createTopengAction, initialState);
  const err = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={formAction} className="a-card" style={{ maxWidth: 560, padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Tambah Topeng Baru</h2>

      {/* Banner pesan umum (gagal = merah, berhasil = hijau) */}
      {state.message && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            background: state.success ? "#e8f5e9" : "#fdecea",
            border: `1px solid ${state.success ? "#81c784" : "#e57373"}`,
            color: state.success ? "#2e7d32" : RED,
          }}
        >
          {state.message}
        </div>
      )}

      <div className="a-field">
        <label htmlFor="name">
          Nama topeng <span style={{ color: RED }}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={v.name}
          placeholder="mis. Topeng Panji"
          style={borderOf(err.name)}
        />
        <FieldError messages={err.name} />
      </div>

      <div className="a-field">
        <label htmlFor="character">Karakter</label>
        <input
          id="character"
          name="character"
          type="text"
          defaultValue={v.character}
          style={borderOf(err.character)}
        />
        <FieldError messages={err.character} />
      </div>

      <div className="a-field">
        <label htmlFor="price">
          Harga (Rp) <span style={{ color: RED }}>*</span>
        </label>
        <input
          id="price"
          name="price"
          type="number"
          defaultValue={v.price}
          placeholder="350000"
          style={borderOf(err.price)}
        />
        <FieldError messages={err.price} />
      </div>

      <div className="a-field">
        <label htmlFor="stock">Stok</label>
        <input
          id="stock"
          name="stock"
          type="number"
          defaultValue={v.stock ?? "0"}
          style={borderOf(err.stock)}
        />
        <FieldError messages={err.stock} />
      </div>

      <div className="a-field">
        <label htmlFor="color">Warna</label>
        <input id="color" name="color" type="text" defaultValue={v.color} style={borderOf(err.color)} />
        <FieldError messages={err.color} />
      </div>

      <div className="a-field">
        <label htmlFor="desc">Deskripsi</label>
        <textarea id="desc" name="desc" rows={3} defaultValue={v.desc} style={borderOf(err.desc)} />
        <FieldError messages={err.desc} />
      </div>

      {/* Gambar belum dibuat; backend memakai gambar bawaan kalau kosong */}
      <input type="hidden" name="image" value="" />

      <button
        type="submit"
        disabled={isPending}
        className="a-btn a-btn-primary"
        style={{ width: "100%", opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Sedang Menyimpan..." : "Simpan Topeng"}
      </button>
    </form>
  );
}