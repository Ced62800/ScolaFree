"use client";

import { useRouter } from "next/navigation";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#4f8ef7",
    desc: "Grammaire, conjugaison, orthographe et vocabulaire",
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "🔢",
    color: "#2ec4b6",
    desc: "Nombres, additions, soustractions et géométrie",
  },
];

export default function CPPage() {
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
          <span className="breadcrumb-active">CP</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🌱</div>
        <h1 className="cours-hero-title">CP</h1>
        <p className="cours-hero-desc">Cours Préparatoire · 6 ans</p>
      </div>

      <div className="themes-grid">
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cp/${m.id}`)}
            style={{ "--card-color": m.color } as React.CSSProperties}
          >
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            <div className="theme-arrow">Commencer →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
