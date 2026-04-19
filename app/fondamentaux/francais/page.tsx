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
    dispo: true,
  },
  {
    id: "on-ont",
    titre: "On / Ont",
    emoji: "👥",
    desc: "Pronom indéfini ou verbe avoir ?",
    dispo: true,
  },
  {
    id: "son-sont",
    titre: "Son / Sont",
    emoji: "🔊",
    desc: "Adjectif possessif ou verbe être ?",
    dispo: true,
  },
  {
    id: "ce-se",
    titre: "Ce / Se",
    emoji: "🎯",
    desc: "Pronom démonstratif et pronom réfléchi",
    dispo: true,
  },
  {
    id: "ou-ou",
    titre: "Ou / Où",
    emoji: "📍",
    desc: "Conjonction ou adverbe de lieu ?",
    dispo: true,
  },
  {
    id: "la-la",
    titre: "La / Là / L'a / L'as",
    emoji: "📌",
    desc: "Quatre mots, une seule prononciation",
    dispo: true,
  },
  {
    id: "ces-ses",
    titre: "Ces / Ses / C'est / S'est",
    emoji: "🔄",
    desc: "Les homophones en -es les plus fréquents",
    dispo: true,
  },
  {
    id: "peu-peux-peut",
    titre: "Peu / Peux / Peut",
    emoji: "🤔",
    desc: "Adverbe ou verbe pouvoir ?",
    dispo: true,
  },
  {
    id: "leur-leurs",
    titre: "Leur / Leurs",
    emoji: "👨‍👩‍👧",
    desc: "Pronom ou adjectif possessif ?",
    dispo: true,
  },
  {
    id: "tout-tous",
    titre: "Tout / Tous / Toute",
    emoji: "🌐",
    desc: "Les différentes formes de 'tout'",
    dispo: true,
  },
  {
    id: "plutot-plus-tot",
    titre: "Plutôt / Plus tôt",
    emoji: "⏱️",
    desc: "Préférence ou comparaison temporelle ?",
    dispo: true,
  },
  {
    id: "pres-pret",
    titre: "Près / Prêt",
    emoji: "📏",
    desc: "Proximité ou état de préparation ?",
    dispo: true,
  },
  {
    id: "sans-sen",
    titre: "Sans / S'en",
    emoji: "🚫",
    desc: "Préposition ou pronom réfléchi ?",
    dispo: true,
  },
  {
    id: "ni-ny",
    titre: "Ni / N'y",
    emoji: "❌",
    desc: "Conjonction de négation ou pronom ?",
    dispo: true,
  },
  {
    id: "davantage",
    titre: "Davantage / D'avantage",
    emoji: "➕",
    desc: "Adverbe ou nom précédé de 'de' ?",
    dispo: true,
  },
  {
    id: "voici-voila",
    titre: "Voici / Voilà",
    emoji: "👉",
    desc: "Présenter ce qui est proche ou lointain",
    dispo: true,
  },
  {
    id: "si-sy",
    titre: "Si / S'y",
    emoji: "💭",
    desc: "Conjonction ou pronom réfléchi ?",
    dispo: true,
  },
  {
    id: "quelque",
    titre: "Quelque / Quelques / Quel que",
    emoji: "🔢",
    desc: "Les trois formes de quelque",
    dispo: true,
  },
  {
    id: "mais-mes",
    titre: "Mais / Mes / Met / Mets",
    emoji: "📝",
    desc: "Quatre homophones à distinguer",
    dispo: true,
  },
  {
    id: "parce-que",
    titre: "Parce que / Par ce que",
    emoji: "💡",
    desc: "Locution conjonctive ou groupe nominal ?",
    dispo: true,
  },
  {
    id: "quoique",
    titre: "Quoique / Quoi que",
    emoji: "🗣️",
    desc: "En un mot ou en deux mots ?",
    dispo: true,
  },
  {
    id: "dans-den",
    titre: "Dans / D'en",
    emoji: "📦",
    desc: "Préposition ou contraction ?",
    dispo: true,
  },
  {
    id: "quel-quelle",
    titre: "Quel / Quelle / Qu'elle",
    emoji: "❓",
    desc: "Adjectif ou pronom sujet ?",
    dispo: true,
  },
  {
    id: "soi-soit",
    titre: "Soi / Soit",
    emoji: "🪞",
    desc: "Pronom réfléchi ou verbe être ?",
    dispo: true,
  },
  {
    id: "meme-memes",
    titre: "Même / Mêmes",
    emoji: "🔁",
    desc: "Adverbe invariable ou adjectif ?",
    dispo: true,
  },
  {
    id: "participe-passe",
    titre: "Accord du participe passé",
    emoji: "✔️",
    desc: "Il a mangé / Elle est partie",
    dispo: true,
  },
  {
    id: "ai-ais",
    titre: "Ai / Ais",
    emoji: "🖊️",
    desc: "J'ai ou j'ais, tu as ou tu ais ?",
    dispo: true,
  },
];

export default function FondamentauxFrancaisPage() {
  const disponibles = fiches.filter((f) => f.dispo);
  const bientot = fiches.filter((f) => !f.dispo);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a1a",
        padding: "80px 16px 16px 16px",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Retour */}
        <Link
          href="/cours"
          style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.85rem",
            display: "inline-block",
            marginBottom: "24px",
          }}
        >
          ← Retour
        </Link>

        {/* Titre */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            ✍️ Fondamentaux du Français
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
            {fiches.length} règles essentielles — du CP à la 3ème
          </p>
        </div>

        {/* Disponibles */}
        <div style={{ marginBottom: "8px" }}>
          <p
            style={{
              color: "#a78bfa",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            ✅ Disponibles ({disponibles.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {disponibles.map((fiche) => (
              <Link
                key={fiche.id}
                href={`/fondamentaux/francais/${fiche.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.35)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(167,139,250,0.15)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#a78bfa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(167,139,250,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "rgba(167,139,250,0.35)";
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                    {fiche.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#a78bfa",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                      }}
                    >
                      {fiche.titre}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {fiche.desc}
                    </div>
                  </div>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    10 q →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            margin: "20px 0 16px",
          }}
        />

        {/* Bientôt disponibles */}
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            🔒 Bientôt disponibles ({bientot.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {bientot.map((fiche) => (
              <div
                key={fiche.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  opacity: 0.5,
                }}
              >
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                  {fiche.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {fiche.titre}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.76rem",
                    }}
                  >
                    {fiche.desc}
                  </div>
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "0.72rem",
                    flexShrink: 0,
                  }}
                >
                  bientôt
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
