"use client";

import { useRouter } from "next/navigation";

const classes = [
  {
    id: "cp",
    label: "CP",
    emoji: "🌱",
    color: "#4f8ef7",
    desc: "Cours Préparatoire · 6 ans",
  },
  {
    id: "ce1",
    label: "CE1",
    emoji: "🌿",
    color: "#2ec4b6",
    desc: "Cours Élémentaire 1 · 7 ans",
  },
  {
    id: "ce2",
    label: "CE2",
    emoji: "🌳",
    color: "#ffd166",
    desc: "Cours Élémentaire 2 · 8 ans",
  },
  {
    id: "cm1",
    label: "CM1",
    emoji: "⭐",
    color: "#ff6b6b",
    desc: "Cours Moyen 1 · 9 ans",
  },
  {
    id: "cm2",
    label: "CM2",
    emoji: "🚀",
    color: "#a78bfa",
    desc: "Cours Moyen 2 · 10 ans",
  },
];

export default function PrimairePage() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Accueil</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Primaire</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">🏫</div>
        <h1 className="cours-hero-title">École Primaire</h1>
        <p className="cours-hero-desc">Choisis ta classe pour commencer !</p>
      </div>
      <div className="themes-grid">
        {classes.map((c) => (
          <div
            key={c.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/${c.id}`)}
            style={{ "--card-color": c.color } as React.CSSProperties}
          >
            <div className="theme-emoji">{c.emoji}</div>
            <div className="theme-label">{c.label}</div>
            <div className="theme-desc">{c.desc}</div>
            <div className="theme-arrow">Choisir →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
