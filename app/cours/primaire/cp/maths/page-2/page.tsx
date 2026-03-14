"use client";

import { useRouter } from "next/navigation";

const themesMath2 = [
  {
    id: "monnaie",
    label: "Monnaie et Prix",
    emoji: "💶",
    color: "#4cc9f0",
    desc: "Utiliser les pièces et les billets en euros",
    nb: 10,
  },
  {
    id: "mesures",
    label: "Mesures de longueurs",
    emoji: "📏",
    color: "#4ade80",
    desc: "Mesurer avec la règle et comparer (cm)",
    nb: 10,
  },
  {
    id: "temps",
    label: "Heures et Temps",
    emoji: "🕒",
    color: "#ffd166",
    desc: "Lire l'heure et utiliser le calendrier",
    nb: 10,
  },
  {
    id: "calcul-mental",
    label: "Calcul Mental 2",
    emoji: "🧠",
    color: "#ff6b6b",
    desc: "Les doubles, les moitiés et compléments",
    nb: 10,
  },
];

export default function MathCPPage2() {
  const router = useRouter();

  return (
    <div className="cours-page">
      {/* HEADER FIL D'ARIANE */}
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Mathématiques</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Partie 2</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="cours-hero">
        <div className="cours-hero-icon">🔢</div>
        <h1 className="cours-hero-title">Mathématiques — CP</h1>
        <p className="cours-hero-desc">Partie 2 · Grandeurs et Mesures</p>
      </div>

      {/* GRILLE DES THEMES (CARTES VERTICALES) */}
      <div className="themes-grid">
        {themesMath2.map((t) => (
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

      {/* BOUTON BILAN FINAL */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          paddingBottom: "40px",
        }}
      >
        <div>
          <button
            onClick={() => router.push("/cours/primaire/cp/maths/page-2/bilan")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #4ade80, #4cc9f0)",
              color: "#1a1a2e",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "16px 32px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(74,222,128,0.3)",
            }}
          >
            🎯 Bilan Mathématiques CP 2 — 20 questions
          </button>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
            Cédric, es-tu prêt pour le grand défi des mesures ?
          </p>
        </div>
      </div>
    </div>
  );
}
