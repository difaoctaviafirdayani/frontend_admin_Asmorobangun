"use client";
import { useState } from "react";
import { toArtikelView } from "@/lib/artikel";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import TabelArtikel from "./TabelArtikel";
import TulisArtikel from "./TulisArtikel";

export default function KelolaArtikelPage() {
  const { data, error, reload } = useLoad(() => api("/articles"));
  const artikelList = (data?.articles ?? []).map(toArtikelView);
  const [editing, setEditing] = useState(null); // null | "new" | row artikel

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "normal",
          color: "#3A2A1A",
          marginBottom: "16px",
          fontFamily: "'Margarine', cursive, sans-serif",
        }}
      >
        Kelola Artikel
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      <TulisArtikel editing={editing} onClose={() => setEditing(null)} onSaved={reload} />

      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setEditing("new")}
          style={{
            backgroundColor: "#5A3E2B",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tulis Artikel
        </button>
      </div>

      <TabelArtikel list={artikelList} onEdit={setEditing} onChanged={reload} />
    </div>
  );
}