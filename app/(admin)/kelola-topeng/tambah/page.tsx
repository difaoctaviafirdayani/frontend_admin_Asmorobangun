import { TopengForm } from "@/components/TopengForm";

export default function TambahTopengPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "normal",
          color: "#3A2A1A",
          marginBottom: "16px",
          fontFamily: "'Margarine', cursive, sans-serif",
        }}
      >
        Tambah Topeng
      </h1>
      <TopengForm />
    </div>
  );
}