"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "numeration",
    label: "Les Nombres",
    emoji: "🔢",
    color: "#4cc9f0",
    desc: "Compter et comparer jusqu'à 100",
    nb: 10,
  },
  {
    id: "addition",
    label: "Additions",
    emoji: "➕",
    color: "#4ade80",
    desc: "Calculer des sommes simples",
    nb: 10,
  },
  {
    id: "soustraction",
    label: "Soustraction",
    emoji: "➖",
    color: "#ffd166",
    desc: "Enlever une quantité d'une autre",
    nb: 10,
  },
  {
    id: "geometrie",
    label: "Géométrie",
    emoji: "📐",
    color: "#ff6b6b",
    desc: "Carré, triangle, cercle et rectangle",
    nb: 10,
  },
];

export default function MathCP() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Mathématiques</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">🔢</div>
        <h1 className="cours-hero-title">Mathématiques — CP</h1>
        <p className="cours-hero-desc">Cours Préparatoire · 6 ans</p>
      </div>
      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cp/maths/${t.id}`)}
            style={{ "--card-color": t.color } as React.CSSProperties}
          >
            <div className="theme-emoji">{t.emoji}</div>
            <div className="theme-label">{t.label}</div>
            <div className="theme-desc">{t.desc}</div>
            <div className="theme-nb">{t.nb} exercices</div>
            <div className="theme-progress">
              <div className="theme-progress-bar" style={{ width: "0%" }}></div>
            </div>
            <div className="theme-arrow">Commencer →</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <button
            onClick={() => router.push("/cours/primaire/cp/maths/bilan")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #4cc9f0, #4ade80)",
              color: "#1a1a2e",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "16px 32px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(76, 201, 240, 0.3)",
            }}
          >
            🎯 Bilan Final CP — 20 questions
          </button>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
            Vérifie tes acquis sur les nombres et les calculs !
          </p>
        </div>
        <button
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          📚 Cours suivants — Partie 2{" "}
          <span style={{ fontSize: "1.2rem" }}>→</span>
        </button>
      </div>
    </div>
  );
}
