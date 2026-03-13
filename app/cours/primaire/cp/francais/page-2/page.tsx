"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "grammaire-2",
    label: "Grammaire 2",
    emoji: "💬",
    color: "#4cc9f0",
    desc: "Le nom et l'article",
    nb: 10,
  },
  {
    id: "conjugaison-2",
    label: "Conjugaison 2",
    emoji: "⏳",
    color: "#4ade80",
    desc: "Hier, Aujourd'hui, Demain",
    nb: 10,
  },
  {
    id: "orthographe-2",
    label: "Orthographe 2",
    emoji: "👂",
    color: "#ffd166",
    desc: "Les sons complexes : ou, oi, an, in, on",
    nb: 10,
  },
  {
    id: "vocabulaire-2",
    label: "Vocabulaire 2",
    emoji: "🌳",
    color: "#ff6b6b",
    desc: "Ranger les mots par familles",
    nb: 10,
  },
];

export default function FrancaisCP2() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Français — Page 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — CP</h1>
        <p className="cours-hero-desc">Cours Préparatoire · 6 ans</p>
      </div>

      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cp/francais/${t.id}`)}
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

      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <button
            onClick={() => router.push("/cours/primaire/cp/francais/bilan-2")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #ffd166, #ff6b6b)",
              color: "#1a1a2e",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "16px 32px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,209,102,0.3)",
            }}
          >
            🎯 Bilan Final CP 2 — 20 questions
          </button>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
            Teste toutes tes connaissances de la partie 2 !
          </p>
        </div>
      </div>
    </div>
  );
}
