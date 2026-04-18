"use client";

import Link from "next/link";

const fiches = [
  {
    id: "quand-quant-quen",
    titre: "Quand / Quant / Qu'en",
    emoji: "⏰",
    desc: "Savoir distinguer ces trois homophones",
    dispo: true,
  },
  {
    id: "et-est",
    titre: "Et / Est",
    emoji: "🔗",
    desc: "La conjonction vs le verbe être",
    dispo: true,
  },
  {
    id: "a-as-a",
    titre: "A / As / À",
    emoji: "✏️",
    desc: "Le verbe avoir et la préposition",
    dispo: false,
  },
  {
    id: "on-ont",
    titre: "On / Ont",
    emoji: "👥",
    desc: "Pronom indéfini ou verbe avoir ?",
    dispo: false,
  },
  {
    id: "son-sont",
    titre: "Son / Sont",
    emoji: "🔊",
    desc: "Adjectif possessif ou verbe être ?",
    dispo: false,
  },
  {
    id: "ce-se",
    titre: "Ce / Se",
    emoji: "🎯",
    desc: "Pronom démonstratif et pronom réfléchi",
    dispo: false,
  },
];

export default function FondamentauxFrancaisPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", padding: "20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Retour */}
        <Link
          href="/cours"
          style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.9rem",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← Retour
        </Link>

        {/* Titre */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "1.6rem",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            ✍️ Fondamentaux du Français
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
            Les règles qui piègent tout le monde — du CP à la 3ème
          </p>
        </div>

        {/* Liste */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {fiches.map((fiche) =>
            fiche.dispo ? (
              <Link
                key={fiche.id}
                href={`/fondamentaux/francais/${fiche.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(167,139,250,0.1)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#a78bfa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "rgba(167,139,250,0.3)";
                  }}
                >
                  <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
                    {fiche.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#a78bfa",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      {fiche.titre}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {fiche.desc}
                    </div>
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.85rem",
                    }}
                  >
                    10 questions →
                  </span>
                </div>
              </Link>
            ) : (
              <div
                key={fiche.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  opacity: 0.45,
                }}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
                  {fiche.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    {fiche.titre}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.82rem",
                    }}
                  >
                    {fiche.desc}
                  </div>
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.78rem",
                  }}
                >
                  🔒 Bientôt
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
