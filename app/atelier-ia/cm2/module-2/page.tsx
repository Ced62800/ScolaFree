"use client";

import Link from "next/link";
import { useState } from "react";

interface Ecran {
  titre: string;
  emoji: string;
  texte: string;
  astuce: string;
}

const ecrans: Ecran[] = [
  {
    titre: "Tu utilises déjà l'IA !",
    emoji: "👀",
    texte:
      "Chaque jour tu croises l'intelligence artificielle sans le savoir. Elle est cachée dans tes applis préférées et elle travaille pour toi en silence.",
    astuce:
      "La plupart des enfants de ton âge utilisent l'IA plusieurs dizaines de fois par jour !",
  },
  {
    titre: "YouTube & Netflix",
    emoji: "📺",
    texte:
      "Quand YouTube te propose une vidéo qui te plaît juste après, c'est l'IA ! Elle a analysé tout ce que tu as regardé avant pour deviner ce qui va t'intéresser.",
    astuce:
      "Les recommandations YouTube sont gérées par une IA qui s'entraîne sur des milliards de vidéos.",
  },
  {
    titre: "Siri, Google et les assistants",
    emoji: "🎙️",
    texte:
      "Quand tu parles à Siri ou à Google Assistant, l'IA transforme ta voix en texte, comprend ta question, puis cherche une réponse. Tout ça en moins d'une seconde !",
    astuce:
      "Reconnaître la voix humaine est l'un des défis les plus difficiles que l'IA a réussi à résoudre.",
  },
  {
    titre: "Les filtres photo et les jeux",
    emoji: "🎮",
    texte:
      "Les filtres qui changent ton visage sur les applis ? L'IA reconnaît tes yeux, ton nez, ta bouche. Et dans les jeux, les ennemis qui s'adaptent à ton niveau... c'est aussi de l'IA !",
    astuce:
      "L'IA qui joue aux jeux vidéo peut parfois battre les meilleurs joueurs du monde.",
  },
];

export default function Module2CM2() {
  const [index, setIndex] = useState<number>(0);

  const ecran = ecrans[index];
  if (!ecran) return null;

  const estDernier = index === ecrans.length - 1;

  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/cm2"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">👀</div>
        <h1 className="cours-hero-title">L&apos;IA dans ta vie</h1>
        <p className="cours-hero-desc">
          Écran {index + 1} sur {ecrans.length}
        </p>
      </div>

      {/* Barre de progression */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 32px",
          display: "flex",
          gap: 6,
          padding: "0 16px",
        }}
      >
        {ecrans.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 4,
              background: i <= index ? "#22c55e" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Carte contenu */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        <div
          className="theme-card"
          style={
            {
              "--card-color": "#22c55e",
              cursor: "default",
              textAlign: "center",
              padding: "32px 24px",
            } as React.CSSProperties
          }
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>
            {ecran.emoji}
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 14px",
            }}
          >
            {ecran.titre}
          </h2>
          <p
            style={{
              color: "#aaa",
              fontSize: "0.97rem",
              lineHeight: 1.7,
              margin: "0 0 20px",
            }}
          >
            {ecran.texte}
          </p>
          <div
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#86efac",
              textAlign: "left",
            }}
          >
            💡 {ecran.astuce}
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{ display: "flex", gap: 12, marginTop: 20, marginBottom: 40 }}
        >
          {index > 0 && (
            <button
              onClick={() => setIndex(index - 1)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "#aaa",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← Précédent
            </button>
          )}
          {!estDernier ? (
            <button
              onClick={() => setIndex(index + 1)}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Suivant →
            </button>
          ) : (
            <Link
              href="/atelier-ia/cm2/module-3"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 3 : La mission 🚀
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
