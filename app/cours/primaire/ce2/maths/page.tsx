"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "numeration",
    label: "Numération",
    emoji: "🔢",
    color: "#4f8ef7",
    desc: "Les nombres jusqu'à 10 000",
    nb: 10,
  },
  {
    id: "multiplication",
    label: "Multiplication posée",
    emoji: "✖️",
    color: "#2ec4b6",
    desc: "Multiplier des grands nombres",
    nb: 10,
  },
  {
    id: "fractions",
    label: "Fractions",
    emoji: "🍕",
    color: "#ffd166",
    desc: "Fractions simples et comparaisons",
    nb: 10,
  },
  {
    id: "geometrie",
    label: "Géométrie",
    emoji: "📐",
    color: "#ff6b6b",
    desc: "Symétrie, angles et périmètre",
    nb: 10,
  },
];

export default function MathsCE2() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Mathématiques</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">➕</div>
        <h1 className="cours-hero-title">Mathématiques — CE2</h1>
        <p className="cours-hero-desc">Cours Élémentaire 2 · 8 ans</p>
      </div>
      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/ce2/maths/${t.id}`)}
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
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/cours/primaire/ce2/maths/bilan")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.1rem",
            padding: "16px 32px",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(79,142,247,0.3)",
          }}
        >
          🎯 Bilan Final CE2 Maths — 20 questions
        </button>
        <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
          Teste toutes tes connaissances de Maths du CE2 !
        </p>
      </div>
    </div>
  );
}
