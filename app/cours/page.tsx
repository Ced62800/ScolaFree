"use client";

import { useRouter } from "next/navigation";

const niveaux = [
  {
    id: "primaire",
    label: "École Primaire",
    emoji: "🏫",
    desc: "CP · CE1 · CE2 · CM1 · CM2",
    age: "6 à 11 ans",
    color: "#4f8ef7",
    dispo: true,
  },
  {
    id: "college",
    label: "Collège",
    emoji: "🎒",
    desc: "6ème · 5ème · 4ème · 3ème",
    age: "11 à 15 ans",
    color: "#2ec4b6",
    dispo: false,
  },
  {
    id: "lycee",
    label: "Lycée",
    emoji: "🎓",
    desc: "Seconde · Première · Terminale",
    age: "15 à 18 ans",
    color: "#ffd166",
    dispo: false,
  },
];

export default function CoursPage() {
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
          <span className="breadcrumb-active">Choisir un établissement</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📚</div>
        <h1 className="cours-hero-title">Choisir ton niveau</h1>
        <p className="cours-hero-desc">
          Sélectionne ton établissement pour accéder aux cours
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {niveaux.map((n) => (
          <div
            key={n.id}
            onClick={() => n.dispo && router.push(`/cours/${n.id}`)}
            style={{
              background: n.dispo
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.02)",
              border: `2px solid ${n.dispo ? n.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: n.dispo ? "pointer" : "default",
              opacity: n.dispo ? 1 : 0.5,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              if (n.dispo) {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  `0 8px 30px ${n.color}33`;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Ligne du haut : emoji + titre */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "8px",
              }}
            >
              <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{n.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                {n.label}
              </div>
            </div>
            {/* Infos */}
            <div
              style={{
                color: "#aaa",
                fontSize: "0.9rem",
                marginBottom: "2px",
                paddingLeft: "4px",
              }}
            >
              {n.desc}
            </div>
            <div
              style={{ color: "#666", fontSize: "0.85rem", paddingLeft: "4px" }}
            >
              {n.age}
            </div>
            {/* Bouton en bas */}
            <div style={{ marginTop: "16px", paddingLeft: "4px" }}>
              {n.dispo ? (
                <span
                  style={{
                    display: "inline-block",
                    color: "#fff",
                    background: n.color,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    padding: "8px 20px",
                    borderRadius: "12px",
                  }}
                >
                  Accéder →
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.08)",
                    color: "#666",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "20px",
                  }}
                >
                  Bientôt disponible
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
