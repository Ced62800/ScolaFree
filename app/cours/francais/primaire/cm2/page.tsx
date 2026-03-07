"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "grammaire",
    label: "Grammaire",
    emoji: "📝",
    color: "#4f8ef7",
    desc: "Les propositions, les types de phrases",
    nb: 5,
  },
  {
    id: "conjugaison",
    label: "Conjugaison",
    emoji: "⏰",
    color: "#2ec4b6",
    desc: "Le conditionnel, le subjonctif",
    nb: 5,
  },
  {
    id: "orthographe",
    label: "Orthographe",
    emoji: "✏️",
    color: "#ffd166",
    desc: "Les accords complexes, les homophones",
    nb: 5,
  },
  {
    id: "vocabulaire",
    label: "Vocabulaire",
    emoji: "📚",
    color: "#ff6b6b",
    desc: "Les figures de style, les expressions",
    nb: 5,
  },
];

export default function FrancaisCM2() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/francais/primaire")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">CM2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎓</div>
        <h1 className="cours-hero-title">Français — CM2</h1>
        <p className="cours-hero-desc">Cours Moyen 2 · 10-11 ans</p>
      </div>

      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/francais/primaire/cm2/${t.id}`)}
            style={{ "--card-color": t.color } as React.CSSProperties}
          >
            <div className="theme-emoji">{t.emoji}</div>
            <div className="theme-label">{t.label}</div>
            <div className="theme-desc">{t.desc}</div>
            <div className="theme-nb">{t.nb} leçons</div>
            <div className="theme-progress">
              <div className="theme-progress-bar" style={{ width: "0%" }}></div>
            </div>
            <div className="theme-arrow">Commencer →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
