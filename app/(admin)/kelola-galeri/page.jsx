"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { toGaleriView } from "@/lib/galeri";
import DaftarGaleri from "./DaftarGaleri";
import TambahFoto from "./TambahFoto";

export default function KelolaGaleriPage() {
  const { data, error, reload } = useLoad(() => api("/gallery"));
  const galeriList = (Array.isArray(data) ? data : data?.gallery ?? []).map(toGaleriView);
  const [editing, setEditing] = useState(null); // null | "new" | item galeri

  return (
    <div
      style={{
        fontFamily: "var(--font-poppins), sans-serif",
        color: "#3A2A1A",
        padding: "24px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          fontFamily: "var(--font-margarine), cursive, sans-serif",
        }}
      >
        Kelola Galeri
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      <button
        type="button"
        onClick={() => setEditing("new")}
        style={{
          backgroundColor: "#5C3A21",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah Foto
      </button>

      <DaftarGaleri list={galeriList} onEdit={setEditing} onChanged={reload} />

      <TambahFoto editing={editing} onClose={() => setEditing(null)} onSaved={reload} />
    </div>
  );
}