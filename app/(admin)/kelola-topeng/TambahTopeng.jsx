"use client";
import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { api } from "@/lib/api";
import FormModal from "@/components/FormModal";
import ResultPopup from "@/components/ResultPopup";

const FIELDS = [
  { name: "name", label: "Nama topeng", required: true },
  { name: "price", label: "Harga (Rp)", required: true, money: true },
  { name: "desc", label: "Deskripsi", type: "textarea", rows: 4 },
  { name: "image", label: "Foto topeng", type: "image" },
];

const MIN_HARGA = 1000;
const MAX_HARGA = 10000000;

function validasiForm(values) {
  const errs = {};

  const name = String(values.name || "").trim();
  if (name.length < 3) {
    errs.name = "Nama topeng minimal 3 karakter.";
  } else if (/\d/.test(name)) {
    errs.name = "Nama topeng tidak boleh mengandung angka.";
  }

  const raw = values.price;
  if (raw === "" || raw == null) {
    errs.price = "Harga wajib diisi.";
  } else {
    const price = Number(raw);
    if (!Number.isInteger(price)) {
      errs.price = "Harga harus berupa angka bulat (tanpa koma).";
    } else if (price < MIN_HARGA || price > MAX_HARGA) {
      errs.price = `Harga minimal ${formatRupiah(MIN_HARGA)} dan maksimal ${formatRupiah(MAX_HARGA)}.`;
    }
  }

  return Object.keys(errs).length ? errs : null;
}

/**
 * Form tambah / edit topeng.
 * editing: null (tertutup) | "new" (tambah) | objek topeng (edit)
 */
export default function TambahTopeng({ editing, onClose, onSaved }) {
  const [popup, setPopup] = useState(null); // { type: "success" | "error", title, message } atau null

  async function simpan(values) {
    const name = String(values.name || "").trim();
    const price = Number(values.price);

    const body = { ...values, name, price, character: values.character ?? "" };
    const baru = editing === "new";
    try {
      if (baru) {
        await api("/topeng", { method: "POST", body });
      } else if (editing) {
        await api(`/topeng/${editing.id}`, { method: "PATCH", body });
      }
      onClose();
      onSaved();
      setPopup({
        type: "success",
        title: "Berhasil!",
        message: baru
          ? `Topeng "${name}" berhasil ditambahkan.`
          : `Topeng "${name}" berhasil diperbarui.`,
      });
    } catch (err) {
      setPopup({
        type: "error",
        title: "Gagal menyimpan",
        message: err?.message || "Terjadi kesalahan saat menyimpan data.",
      });
    }
  }

  return (
    <>
      {editing && (
        <FormModal
          title={editing === "new" ? "Tambah topeng" : "Edit topeng"}
          fields={FIELDS}
          initial={editing === "new" ? {} : editing}
          onSubmit={simpan}
          validate={validasiForm}
          onClose={onClose}
        />
      )}

      {popup && (
        <ResultPopup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}