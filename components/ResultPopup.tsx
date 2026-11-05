"use client";

interface Props {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

export default function ResultPopup({ type, title, message, onClose }: Props) {
  const ok = type === "success";
  const color = ok ? "#4C7A4C" : "#A84C4C";

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#FDFCEA",
          border: "1.5px solid #D4BBA5",
          borderRadius: "16px",
          padding: "28px 24px 24px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 16px",
            borderRadius: "50%",
            backgroundColor: color,
            color: "#FFFFFF",
            fontSize: "34px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {ok ? "✓" : "✕"}
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#3A2A1A" }}>{title}</h3>
        <p style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: 1.5, color: "#5A4A3A" }}>{message}</p>

        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: color,
            color: "#FFFFFF",
            border: "none",
            padding: "10px 28px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {ok ? "OK" : "Perbaiki"}
        </button>
      </div>
    </div>
  );
}