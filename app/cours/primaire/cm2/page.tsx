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
    desc: "Décimaux, Pourcentages, Aires, Statistiques",
    dispo: true,
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: (
      <img
        src="https://flagcdn.com/w160/gb.png"
        alt="Drapeau Anglais"
        style={{ width: "45px", height: "auto", borderRadius: "4px" }}
      />
    ),
    color: "#ff6b6b",
    desc: "Vocabulaire, Grammaire, Communication",
    dispo: true,
  },
];

export default function CM2Page() {
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
          <span className="breadcrumb-active">CM2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🚀</div>
        <h1 className="cours-hero-title">CM2 — Choisis une matière</h1>
        <p className="cours-hero-desc">Cours Moyen 2 · 10 ans</p>
      </div>

      <div className="themes-grid">
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() =>
              m.dispo && router.push(`/cours/primaire/cm2/${m.id}`)
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

      {/* BLOC CITATION SANS STATISTIQUES */}
      <div
        style={{
          marginTop: "60px",
          padding: "30px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#aaa",
            fontStyle: "italic",
            fontSize: "0.9rem",
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: "1.5",
          }}
        >
          "Chaque jour est une nouvelle chance d'apprendre quelque chose de
          nouveau."
        </p>
      </div>
    </div>
  );
}
