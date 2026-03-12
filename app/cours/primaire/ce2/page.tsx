"use client";

import { useRouter } from "next/navigation";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#ff6b6b",
    desc: "Grammaire, Conjugaison, Orthographe, Vocabulaire",
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "➕",
    color: "#2ec4b6",
    desc: "Numération, Calcul, Fractions, Géométrie",
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: "🇬🇧",
    color: "#4f8ef7",
    desc: "Vocabulary, Numbers, Daily Routine",
  },
];

export default function CE2Page() {
  const router = useRouter();

  return (
    <div className="cours-page">
      {/* Header avec bouton retour et fil d'ariane */}
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">CE2</span>
        </div>
      </div>

      {/* Section Hero */}
      <div className="cours-hero">
        <div className="cours-hero-icon">🎒</div>
        <h1 className="cours-hero-title">CE2 — Choisis ta matière</h1>
        <p className="cours-hero-desc">
          Apprends et amuse-toi avec Cédric Flow !
        </p>
      </div>

      {/* Grille des matières */}
      <div className="themes-grid">
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/ce2/${m.id}`)}
            style={
              {
                "--card-color": m.color,
                cursor: "pointer",
              } as React.CSSProperties
            }
          >
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            <div className="theme-arrow">Commencer →</div>
          </div>
        ))}
      </div>

      {/* Encart d'encouragement */}
      <div
        style={{
          marginTop: "50px",
          textAlign: "center",
          padding: "20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "20px",
        }}
      >
        <p style={{ color: "#aaa", fontStyle: "italic" }}>
          "Chaque jour est une nouvelle chance d'apprendre quelque chose de
          nouveau."
        </p>
      </div>
    </div>
  );
}
