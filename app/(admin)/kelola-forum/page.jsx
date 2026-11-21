"use client";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import FilterForum from "./FilterForum";
import TabelForum from "./TabelForum";

const CATEGORIES = ["Umum", "Layanan"];

export default function KelolaForumPage() {
  const { data, error, reload } = useLoad(() => api("/forum"));
  const forumList = (data?.threads || []).map((t) => ({
    id: t.id,
    topic: t.title,
    category: t.category,
    username: t.userName,
    date: formatDate(t.date),
  }));

  const [fKategori, setFKategori] = useState("");
  const tampil = fKategori ? forumList.filter((r) => r.category === fKategori) : forumList;

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "normal",
          color: "#3A2A1A",
          marginBottom: "12px",
          fontFamily: "'Margarine', cursive, sans-serif",
        }}
      >
        Kelola Forum
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      <FilterForum categories={CATEGORIES} fKategori={fKategori} onKategoriChange={setFKategori} />

      <TabelForum rows={tampil} onChanged={reload} />
    </div>
  );
}