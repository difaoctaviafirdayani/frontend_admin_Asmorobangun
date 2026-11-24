"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const G = {
  layanan: { name: "Pendaftaran Layanan", main: "#b45309", colors: ["#92400e", "#b45309", "#c2410c", "#d97706", "#ea580c", "#f59e0b"] },
  topeng: { name: "Pesanan Topeng", main: "#0f766e", colors: ["#0f766e"] },
  pengguna: { name: "Pengguna Baru", main: "#2563eb", colors: ["#2563eb"] },
  komunitas: { name: "Forum & Ulasan", main: "#9333ea", colors: ["#9333ea", "#a855f7", "#c084fc"] },
};
const ORDER = ["layanan", "topeng", "pengguna", "komunitas"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const monthTitle = (ym) => BULAN[Number(ym.slice(5, 7)) - 1] + " " + ym.slice(0, 4);
const pad = (n) => String(n).padStart(2, "0");
const short = (t) => String(t).replace(/\s*\(.*?\)\s*/g, " ").trim();
const dot = (c) => ({ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: c, marginRight: 6 });

function nowMonth() {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1);
}
function niceMax(n) {
  if (n <= 4) return 4;
  const s = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / s) * s;
}
function wrap(t, max = 12) {
  const lines = [];
  let cur = "";
  for (const w of String(t).split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
const grow = (i) => ({ transformBox: "fill-box", transformOrigin: "bottom", animation: "growY .6s ease-out both", animationDelay: i * 40 + "ms" });

function Delta({ cur, prev }) {
  const b = { fontSize: 12, fontWeight: 700 };
  if (cur === 0 && prev === 0) return <span style={{ fontSize: 12, opacity: 0.5 }}>–</span>;
  if (prev === 0) return <span style={{ ...b, color: "#059669" }}>baru</span>;
  const p = Math.round(((cur - prev) / prev) * 100);
  if (p === 0) return <span style={{ fontSize: 12, opacity: 0.6 }}>sama</span>;
  return <span style={{ ...b, color: p > 0 ? "#059669" : "#dc2626" }}>{p > 0 ? "▲" : "▼"} {Math.abs(p)}%</span>;
}

function Grid({ ticks, y, L, W, R }) {
  return ticks.map((t) => (
    <g key={t}>
      <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#7c2d12" strokeOpacity={t === 0 ? 0.3 : 0.1} strokeDasharray={t === 0 ? "" : "4 4"} />
      <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#7c2d12" fillOpacity={0.6}>{t}</text>
    </g>
  ));
}

function CatChart({ cats, hover, setHover }) {
  const slot = 76, L = 40, R = 10, T = 28, B = 74, H = 340, bw = 24;
  const W = Math.max(720, L + R + cats.length * slot);
  const max = niceMax(Math.max(1, ...cats.flatMap((c) => [c.total, c.prevTotal])));
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((max / 4) * i));
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", minWidth: 640, height: "auto", display: "block" }}>
        <Grid ticks={ticks} y={y} L={L} W={W} R={R} />
        {cats.map((c, i) => {
          const cx = L + i * slot + slot / 2;
          return (
            <g key={c.key} onMouseEnter={() => setHover(c.key)} onMouseLeave={() => setHover(null)} onClick={() => setHover(c.key)} style={{ cursor: "pointer" }}>
              <rect x={L + i * slot + 4} y={T - 10} width={slot - 8} height={H - T - B + 10} rx={8} fill={hover === c.key ? "#b45309" : "transparent"} fillOpacity={0.07} />
              <rect x={cx - bw - 2} y={y(c.prevTotal)} width={bw} height={Math.max(y(0) - y(c.prevTotal), c.prevTotal > 0 ? 3 : 0)} rx={5} fill="#d8cdbd" style={grow(i)} />
              <rect x={cx + 2} y={y(c.total)} width={bw} height={Math.max(y(0) - y(c.total), c.total > 0 ? 3 : 0)} rx={5} fill={c.color} style={grow(i)} />
              <text x={cx - bw / 2 - 2} y={y(c.prevTotal) - 5} textAnchor="middle" fontSize="10" fill="#7c2d12" fillOpacity={0.5}>{c.prevTotal}</text>
              <text x={cx + bw / 2 + 2} y={y(c.total) - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill={c.color}>{c.total}</text>
              {wrap(short(c.label)).map((ln, k) => (
                <text key={k} x={cx} y={H - B + 20 + k * 13} textAnchor="middle" fontSize="11" fill="#2b2b2b">{ln}</text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DayChart({ perDay, days, hover, setHover }) {
  const W = 760, H = 300, L = 36, R = 8, T = 16, B = 28;
  const max = niceMax(Math.max(1, ...perDay.map((d) => d.sum)));
  const cw = (W - L - R) / days;
  const bw = Math.max(4, cw * 0.66);
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((max / 4) * i));
  const h = hover ? perDay[hover - 1] : null;
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", minWidth: 560, height: "auto", display: "block" }}>
          <Grid ticks={ticks} y={y} L={L} W={W} R={R} />
          {perDay.map((d, i) => {
            const x = L + i * cw + (cw - bw) / 2;
            let acc = 0;
            return (
              <g key={d.day} onMouseEnter={() => setHover(d.day)} onMouseLeave={() => setHover(null)} onClick={() => setHover(d.day)} style={{ cursor: "pointer" }}>
                <rect x={L + i * cw} y={T} width={cw} height={H - T - B} fill={hover === d.day ? "#b45309" : "transparent"} fillOpacity={0.08} />
                {ORDER.map((g) => {
                  const v = d.g[g];
                  if (!v) return null;
                  const y1 = y(acc + v);
                  const hh = y(acc) - y1;
                  acc += v;
                  return <rect key={g} x={x} y={y1} width={bw} height={hh} rx={2} fill={G[g].main} style={grow(i)} />;
                })}
                {(d.day === 1 || d.day % 5 === 0 || d.day === days) && (
                  <text x={x + bw / 2} y={H - 9} textAnchor="middle" fontSize="11" fill="#2b2b2b" fillOpacity={0.7}>{d.day}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ minHeight: 26, fontSize: 14, marginTop: 6 }}>
        {h ? (
          <span>
            <b>Tanggal {h.day}</b> · total {h.sum}
            {ORDER.filter((g) => h.g[g] > 0).map((g) => (
              <span key={g} style={{ marginLeft: 12, whiteSpace: "nowrap" }}>
                <span style={dot(G[g].main)} />
                {G[g].name}: {h.g[g]}
              </span>
            ))}
          </span>
        ) : (
          <span style={{ opacity: 0.5 }}>Arahkan kursor (atau tap) pada batang untuk lihat rincian harian.</span>
        )}
      </div>
    </div>
  );
}

const card = { background: "#fff", border: "1px solid #eadfce", borderRadius: 16, padding: 20, marginTop: 18, color: "#2b2b2b", boxShadow: "0 2px 10px rgba(124,45,18,.06)" };
const nav = { border: "1px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.15)", color: "#fff", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 15 };

export default function StatistikPage() {
  const [month, setMonth] = useState(nowMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hc, setHc] = useState(null);
  const [hd, setHd] = useState(null);

  useEffect(() => {
    let off = false;
    setLoading(true);
    setError("");
    api("/admin/stats/monthly?month=" + month)
      .then((j) => {
        if (off) return;
        if (!j || !Array.isArray(j.categories) || !j.days) {
          throw new Error("Data diagram belum tersedia. Pastikan stats.routes.ts versi baru sudah dipakai dan backend sudah di-restart.");
        }
        setData(j);
      })
      .catch((e) => {
        if (off) return;
        setData(null);
        setError((e && e.message) || "Gagal memuat diagram.");
      })
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, [month]);

  const st = useMemo(() => {
    if (!data || !Array.isArray(data.categories) || !data.days) return null;
    const count = {};
    const cats = data.categories.map((c) => {
      const grp = G[c.group] ? c.group : "layanan";
      const i = count[grp] || 0;
      count[grp] = i + 1;
      return {
        ...c,
        group: grp,
        label: String(c.label ?? "-"),
        daily: Array.isArray(c.daily) ? c.daily : [],
        total: Number(c.total) || 0,
        prevTotal: Number(c.prevTotal) || 0,
        color: G[grp].colors[i % G[grp].colors.length],
      };
    });
    const total = cats.reduce((s, c) => s + c.total, 0);
    const prevTotal = cats.reduce((s, c) => s + c.prevTotal, 0);
    const top = [...cats].sort((a, b) => b.total - a.total)[0];
    const perDay = Array.from({ length: data.days }, (_, i) => {
      const g = { layanan: 0, topeng: 0, pengguna: 0, komunitas: 0 };
      cats.forEach((c) => {
        g[c.group] += Number(c.daily[i]) || 0;
      });
      return { day: i + 1, g, sum: g.layanan + g.topeng + g.pengguna + g.komunitas };
    });
    const busiest = perDay.reduce((a, b) => (b.sum > a.sum ? b : a), perDay[0]);
    return { cats, total, prevTotal, top, perDay, busiest };
  }, [data]);

  const shift = (n) => {
    const d = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + n, 1));
    setMonth(d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1));
  };
  const isNow = month >= nowMonth();
  const sel = st && hc ? st.cats.find((c) => c.key === hc) : null;

  const cards = st
    ? [
        { t: "Total Aktivitas", v: st.total, n: <>bulan lalu {st.prevTotal} <Delta cur={st.total} prev={st.prevTotal} /></>, c: "#b45309" },
        { t: "Paling Ramai", v: st.top && st.top.total > 0 ? short(st.top.label) : "-", n: (st.top ? st.top.total : 0) + " aktivitas", c: "#0f766e", s: 1 },
        { t: "Hari Tersibuk", v: st.busiest.sum > 0 ? "Tanggal " + st.busiest.day : "-", n: st.busiest.sum + " aktivitas", c: "#2563eb", s: 1 },
        { t: "Rata-rata / Hari", v: (st.total / data.days).toFixed(1), n: "dari " + data.days + " hari", c: "#9333ea" },
      ]
    : [];

  return (
    <>
      <style>{"@keyframes growY{from{transform:scaleY(0)}to{transform:scaleY(1)}}"}</style>

      <section style={{ background: "linear-gradient(135deg,#7c2d12,#b45309)", color: "#fff", borderRadius: 18, padding: "22px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Diagram Aktivitas</h1>
          <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 14 }}>
            Pendaftaran, pesanan, pengguna, dan forum {data ? "· " + monthTitle(data.month) : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={nav} onClick={() => shift(-1)}>‹</button>
          <input type="month" value={month} max={nowMonth()} onChange={(e) => e.target.value && setMonth(e.target.value)} style={{ ...nav, cursor: "text", colorScheme: "dark" }} />
          <button style={{ ...nav, opacity: isNow ? 0.4 : 1 }} disabled={isNow} onClick={() => shift(1)}>›</button>
        </div>
      </section>

      {error && <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#fef2f2", color: "#b91c1c", fontSize: 14 }}>{error}</div>}
      {loading && !data && <div style={{ marginTop: 20, opacity: 0.6 }}>Memuat diagram...</div>}

      {data && st && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 18 }}>
            {cards.map((s) => (
              <div key={s.t} style={{ background: "#fff", border: "1px solid #eadfce", borderLeft: "5px solid " + s.c, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{s.t}</div>
                <div style={{ fontSize: s.s ? 18 : 28, fontWeight: 800, marginTop: 4, color: s.c, lineHeight: 1.2 }}>{s.v}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>{s.n}</div>
              </div>
            ))}
          </section>

          <section style={card}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Perbandingan Semua Layanan & Aktivitas</h2>
            <p style={{ margin: "2px 0 12px", fontSize: 13, opacity: 0.6 }}>
              Tari, karawitan, kostum, edukasi, topeng, pengguna, forum, ulasan. Batang abu-abu = bulan lalu.
            </p>
            <div key={data.month + "c"}>
              <CatChart cats={st.cats} hover={hc} setHover={setHc} />
            </div>
            <div style={{ minHeight: 26, fontSize: 14, marginTop: 6 }}>
              {sel ? (
                <span><b>{sel.label}</b>: {sel.total} bulan ini · {sel.prevTotal} bulan lalu <Delta cur={sel.total} prev={sel.prevTotal} /></span>
              ) : (
                <span style={{ opacity: 0.5 }}>Arahkan kursor (atau tap) pada batang untuk lihat nama lengkap dan perbandingannya.</span>
              )}
            </div>
          </section>

          <section style={card}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Perkembangan Harian</h2>
            <p style={{ margin: "2px 0 12px", fontSize: 13, opacity: 0.6 }}>Jumlah aktivitas tiap tanggal selama {monthTitle(data.month)}.</p>
            <div key={data.month + "d"}>
              <DayChart perDay={st.perDay} days={data.days} hover={hd} setHover={setHd} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 12, fontSize: 12 }}>
              {ORDER.map((g) => (
                <span key={g}><span style={dot(G[g].main)} />{G[g].name}</span>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}