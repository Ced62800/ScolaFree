"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "pourcentages",
    label: "Pourcentages",
    emoji: "💯",
    color: "#4f8ef7",
    desc: "Calculer et appliquer des pourcentages",
    nb: 10,
  },
  {
    id: "proportionnalite",
    label: "Proportionnalité",
    emoji: "📊",
    color: "#2ec4b6",
    desc: "Tableaux, échelles et vitesses",
    nb: 10,
  },
  {
    id: "problemes",
    label: "Problèmes à étapes",
    emoji: "🧩",
    color: "#ffd166",
    desc: "Résoudre des problèmes complexes",
    nb: 10,
  },
  {
    id: "calcul-mental",
    label: "Calcul mental",
    emoji: "🧮",
    color: "#ff6b6b",
    desc: "Opérations rapides et estimations",
    nb: 10,
  },
];

export default function MathsCM2Page2() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Partie 2</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">➕</div>
        <h1 className="cours-hero-title">Mathématiques — CM2</h1>
        <p className="cours-hero-desc">Partie 2 · Second semestre</p>
      </div>
      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cm2/maths/${t.id}`)}
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
          onClick={() => router.push("/cours/primaire/cm2/maths/bilan-2")}
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
          🎯 Bilan CM2 Maths Partie 2 — 20 questions
        </button>
        <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
          Teste toutes tes connaissances de la partie 2 !
        </p>
      </div>
    </div>
  );
}
