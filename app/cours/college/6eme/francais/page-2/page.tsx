"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "imparfait",
    label: "L'imparfait",
    emoji: "⏳",
    desc: "Conjugaison à l'imparfait — tous les groupes",
    dispo: false,
  },
  {
    id: "accords",
    label: "Les accords",
    emoji: "✅",
    desc: "Accord sujet-verbe, nom-adjectif",
    dispo: false,
  },
  {
    id: "orthographe",
    label: "L'orthographe",
    emoji: "🔡",
    desc: "Homophones et orthographe lexicale",
    dispo: false,
  },
  {
    id: "vocabulaire",
    label: "Le vocabulaire",
    emoji: "📚",
    desc: "Sens des mots, synonymes, antonymes, familles de mots",
    dispo: false,
  },
  {
    id: "bilan-2",
    label: "Bilan 2",
    emoji: "📊",
    desc: "Évaluation sur l'imparfait, les accords, l'orthographe et le vocabulaire",
    dispo: false,
    isBilan: true,
  },
];

export default function Francais6emePageDeux() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college/6eme/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours")}
            style={{ cursor: "pointer" }}
          >
            Cours
          </span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours/college")}
            style={{ cursor: "pointer" }}
          >
            Collège
          </span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours/college/6eme")}
            style={{ cursor: "pointer" }}
          >
            6ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours/college/6eme/francais")}
            style={{ cursor: "pointer" }}
          >
            Français
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Page 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — 6ème</h1>
        <p className="cours-hero-desc">Programme officiel — Partie 2</p>
      </div>

      <div className="themes-grid">
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() =>
              t.dispo && router.push(`/cours/college/6eme/francais/${t.id}`)
            }
            style={
              {
                "--card-color": t.isBilan
                  ? "#ffd166"
                  : t.dispo
                    ? "#4f8ef7"
                    : "#888",
                opacity: t.dispo ? 1 : 0.5,
                cursor: t.dispo ? "pointer" : "not-allowed",
              } as React.CSSProperties
            }
          >
            <div className="theme-emoji">{t.emoji}</div>
            <div className="theme-label">{t.label}</div>
            <div className="theme-desc">{t.desc}</div>
            <div className="theme-arrow">
              {t.dispo ? "Accéder →" : "🔒 Bientôt"}
            </div>
          </div>
        ))}
      </div>

      {/* Retour page 1 */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={() => router.push("/cours/college/6eme/francais")}
          style={{
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "14px",
            padding: "14px 28px",
            color: "#4f8ef7",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          ← Retour Page 1
        </button>
      </div>
    </div>
  );
}
