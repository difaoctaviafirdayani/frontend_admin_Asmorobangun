"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { toLayananView } from "@/lib/layanan";
import TabelLayanan from "./TabelLayanan";
import TambahLayanan from "./TambahLayanan";

export default function KelolaLayananPage() {
  const { data, error, reload } = useLoad(() => api("/facilities"));
  const layananList = (data?.facilities ?? []).map(toLayananView);
  const [editing, setEditing] = useState(null); // null | "new" | row layanan

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
        Kelola Layanan
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

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
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah layanan
        </button>
      </div>

      <TambahLayanan editing={editing} onClose={() => setEditing(null)} onSaved={reload} />

      <TabelLayanan list={layananList} onEdit={setEditing} />
    </div>
  );
}