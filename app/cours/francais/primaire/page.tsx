"use client";
import { useRouter } from "next/navigation";

const classes = [
  {
    id: "cp",
    label: "CP",
    full: "Cours Préparatoire",
    age: "6-7 ans",
    color: "#4f8ef7",
    emoji: "🌱",
    nb: 4,
  },
  {
    id: "ce1",
    label: "CE1",
    full: "Cours Élémentaire 1",
    age: "7-8 ans",
    color: "#2ec4b6",
    emoji: "🌿",
    nb: 4,
  },
  {
    id: "ce2",
    label: "CE2",
    full: "Cours Élémentaire 2",
    age: "8-9 ans",
    color: "#ffd166",
    emoji: "🌳",
    nb: 4,
  },
  {
    id: "cm1",
    label: "CM1",
    full: "Cours Moyen 1",
    age: "9-10 ans",
    color: "#ff6b6b",
    emoji: "⭐",
    nb: 4,
  },
  {
    id: "cm2",
    label: "CM2",
    full: "Cours Moyen 2",
    age: "10-11 ans",
    color: "#a78bfa",
    emoji: "🚀",
    nb: 4,
  },
];

export default function FrancaisPrimaire() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Primaire</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — Primaire</h1>
        <p className="cours-hero-desc">
          Sélectionne ta classe pour accéder aux leçons et exercices
        </p>
      </div>

      <div className="classes-grid">
        {classes.map((c) => (
          <div
            key={c.id}
            className="classe-card"
            onClick={() => router.push(`/cours/francais/primaire/${c.id}`)}
            style={{ "--card-color": c.color } as React.CSSProperties}
          >
            <div className="classe-emoji">{c.emoji}</div>
            <div className="classe-label">{c.label}</div>
            <div className="classe-full">{c.full}</div>
            <div className="classe-age">{c.age}</div>
            <div className="classe-nb">{c.nb} thèmes</div>
            <div className="classe-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
