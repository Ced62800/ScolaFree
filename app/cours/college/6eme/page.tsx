"use client";

import { useRouter } from "next/navigation";

const themes = [
  {
    id: "la-phrase",
    label: "La phrase",
    emoji: "✏️",
    desc: "Types et formes de phrases, sujet, ponctuation",
    dispo: true,
  },
  {
    id: "classes-de-mots",
    label: "Les classes de mots",
    emoji: "📝",
    desc: "Nom, verbe, adjectif, déterminant, pronom...",
    dispo: false,
  },
  {
    id: "groupe-nominal",
    label: "Le groupe nominal",
    emoji: "🔤",
    desc: "Construction et accords du groupe nominal",
    dispo: false,
  },
  {
    id: "present-indicatif",
    label: "Le présent de l'indicatif",
    emoji: "⏱️",
    desc: "Conjugaison au présent — tous les groupes",
    dispo: false,
  },
  {
    id: "bilan",
    label: "Bilan 1",
    emoji: "📊",
    desc: "Évaluation sur la phrase, les classes de mots, le groupe nominal et le présent",
    dispo: false,
    isBilan: true,
  },
];

export default function Francais6emePage() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college/6eme")}
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
          <span className="breadcrumb-active">Français</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — 6ème</h1>
        <p className="cours-hero-desc">Programme officiel — Partie 1</p>
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

      {/* Lien vers page 2 */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={() => router.push("/cours/college/6eme/francais/page-2")}
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
          Suite du programme → Page 2
        </button>
      </div>
    </div>
  );
}
