"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "meteo-saisons",
    label: "Weather & Seasons",
    emoji: "🌤️",
    color: "#4f8ef7",
    desc: "La météo et les saisons en anglais",
    nb: 10,
  },
  {
    id: "ville-directions",
    label: "In the Town & Directions",
    emoji: "🏙️",
    color: "#2ec4b6",
    desc: "La ville et les directions en anglais",
    nb: 10,
  },
  {
    id: "shopping",
    label: "Shopping & Money",
    emoji: "🛒",
    color: "#ffd166",
    desc: "Les achats et l'argent en anglais",
    nb: 10,
  },
  {
    id: "corps-sante",
    label: "Body & Health",
    emoji: "💪",
    color: "#ff6b6b",
    desc: "Le corps et la santé en anglais",
    nb: 10,
  },
];

export default function AnglaisCM2() {
  const router = useRouter();
  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Anglais</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">🌍</div>
        <h1 className="cours-hero-title">Anglais — CM2</h1>
        <p className="cours-hero-desc">Cours Moyen 2 · 10 ans</p>
      </div>
      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cm2/anglais/${t.id}`)}
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
          margin: "32px 0 0 0",
          background: "rgba(79,142,247,0.08)",
          border: "1px solid rgba(79,142,247,0.2)",
          borderRadius: "16px",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎧</div>
        <div style={{ fontWeight: 700, marginBottom: "6px" }}>
          Envie de pratiquer à l'oral ?
        </div>
        <p style={{ color: "#aaa", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
          <strong>LearnEnglish Kids</strong> — jeux, vidéos et chansons en
          anglais. <span style={{ color: "#2ec4b6" }}>100% gratuit</span>, sans
          inscription !
        </p>
        <a
          href="https://learnenglishkids.britishcouncil.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#4f8ef7", fontWeight: 600, fontSize: "0.9rem" }}
        >
          → learnenglishkids.britishcouncil.org
        </a>
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/cours/primaire/cm2/anglais/bilan")}
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
          🎯 Bilan Final CM2 Anglais — 20 questions
        </button>
        <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
          Teste toutes tes connaissances d'Anglais du CM2 !
        </p>
      </div>
    </div>
  );
}
