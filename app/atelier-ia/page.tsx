"use client";

import { useRouter } from "next/navigation";

const niveaux = [
  {
    slug: "cm2",
    label: "CM2",
    emoji: "🌱",
    color: "#22c55e",
    dispo: true,
    retour: "/cours/primaire/cm2",
  },
  {
    slug: "6eme",
    label: "6ème",
    emoji: "🔍",
    color: "#4f8ef7",
    dispo: true,
    retour: "/cours/college/6eme",
  },
  {
    slug: "5eme",
    label: "5ème",
    emoji: "🎨",
    color: "#a855f7",
    dispo: true,
    retour: "/cours/college/5eme",
  },
  {
    slug: "4eme",
    label: "4ème",
    emoji: "🕵️",
    color: "#f59e0b",
    dispo: true,
    retour: "/cours/college/4eme",
  },
  {
    slug: "3eme",
    label: "3ème",
    emoji: "🏆",
    color: "#ff6b6b",
    dispo: true,
    retour: "/cours/college/3eme",
  },
];

export default function AtelierIAPage() {
  const router = useRouter();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/cours")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span className="breadcrumb-active">Atelier IA</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🤖</div>
        <h1 className="cours-hero-title">Atelier IA</h1>
        <p className="cours-hero-desc">
          Découvre l&apos;intelligence artificielle, level par level !
        </p>
      </div>

      <div className="themes-grid">
        {niveaux.map((n) =>
          n.dispo ? (
            <div
              key={n.slug}
              className="theme-card"
              onClick={() => router.push(`/atelier-ia/${n.slug}`)}
              style={
                {
                  "--card-color": n.color,
                  position: "relative",
                  cursor: "pointer",
                  paddingTop: "44px",
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(168,85,247,0.2)",
                  border: "1px solid rgba(168,85,247,0.4)",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: "0.65rem",
                  color: "#d8b4fe",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                NOUVEAU
              </div>
              <div className="theme-emoji">{n.emoji}</div>
              <div className="theme-label">{n.label}</div>
              <div className="theme-desc">
                3 modules pour découvrir l&apos;IA
              </div>
              <div className="theme-arrow" style={{ color: n.color }}>
                Commencer →
              </div>
            </div>
          ) : (
            <div
              key={n.slug}
              className="theme-card"
              style={
                {
                  "--card-color": "#888",
                  position: "relative",
                  opacity: 0.5,
                  cursor: "not-allowed",
                  paddingTop: "44px",
                } as React.CSSProperties
              }
            >
              <div className="theme-emoji">{n.emoji}</div>
              <div className="theme-label">{n.label}</div>
              <div className="theme-desc">
                3 modules pour découvrir l&apos;IA
              </div>
              <div className="theme-arrow" style={{ color: "#888" }}>
                🔒 Bientôt
              </div>
            </div>
          ),
        )}
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          marginTop: 32,
          fontSize: "0.85rem",
        }}
      >
        Accès libre · Pas de connexion requise
      </p>
    </div>
  );
}
