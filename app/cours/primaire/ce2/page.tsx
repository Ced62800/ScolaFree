"use client";

import { useRouter } from "next/navigation";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#4f8ef7",
    desc: "Grammaire, Conjugaison, Orthographe, Vocabulaire",
    dispo: true,
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "➕",
    color: "#2ec4b6",
    desc: "Numération, Calcul, Fractions, Géométrie",
    dispo: true,
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: "🌍",
    color: "#ff6b6b",
    desc: "Vocabulaire, Grammaire, Communication",
    dispo: true,
  },
];

export default function CE2Page() {
  const router = useRouter();
  return (
    <div className="cours-page">
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
      <div className="cours-hero">
        <div className="cours-hero-icon">🌳</div>
        <h1 className="cours-hero-title">CE2 — Choisis une matière</h1>
        <p className="cours-hero-desc">Cours Élémentaire 2 · 8 ans</p>
      </div>
      <div className="themes-grid">
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() =>
              m.dispo && router.push(`/cours/primaire/ce2/${m.id}`)
            }
            style={
              {
                "--card-color": m.color,
                opacity: m.dispo ? 1 : 0.5,
                cursor: m.dispo ? "pointer" : "not-allowed",
              } as React.CSSProperties
            }
          >
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            <div className="theme-arrow">
              {m.dispo ? "Commencer →" : "Bientôt disponible"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
