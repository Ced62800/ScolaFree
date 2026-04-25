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
    titre: "L'IA sait tout... vraiment ?",
    emoji: "🤔",
    texte:
      "On dirait que l'IA sait tout : elle répond en quelques secondes à des milliers de questions. Mais en réalité, elle a des limites bien précises que beaucoup d'adultes ne connaissent pas !",
    astuce:
      'L\'IA ne "pense" pas vraiment — elle prédit le mot le plus probable à placer après le précédent.',
  },
  {
    titre: "Elle ne sait pas ce qui se passe maintenant",
    emoji: "📅",
    texte:
      "L'IA a été entraînée sur des textes jusqu'à une certaine date. Après cette date, elle ne sait plus rien ! Si tu lui demandes le score du match d'hier, elle peut inventer une réponse fausse.",
    astuce:
      "On appelle ça la «date de coupure». Les IA récentes ont souvent une coupure de quelques mois.",
  },
  {
    titre: "Elle peut se tromper avec confiance",
    emoji: "😬",
    texte:
      "Le danger avec l'IA, c'est qu'elle répond toujours avec assurance, même quand elle se trompe ! Elle ne dit pas «je ne sais pas» très souvent. On appelle ça une «hallucination».",
    astuce:
      "Le mot «hallucination» en IA désigne une réponse inventée mais présentée comme vraie.",
  },
  {
    titre: "Les limites logiques et de bon sens",
    emoji: "🧩",
    texte:
      "L'IA a aussi du mal avec les questions qui demandent du vrai bon sens humain : «Mon père a 3 fils, je suis l'un d'eux, combien en reste-t-il ?» Ce genre de piège lui pose souvent problème !",
    astuce:
      "Les questions avec des sous-entendus, de l'humour ou du paradoxe sont souvent des pièges efficaces.",
  },
];

export default function Module16eme() {
  const [index, setIndex] = useState<number>(0);

  const ecran = ecrans[index];
  if (!ecran) return null;

  const estDernier = index === ecrans.length - 1;

  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/6eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>6ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🧠</div>
        <h1 className="cours-hero-title">L&apos;IA a des limites ?</h1>
        <p className="cours-hero-desc">
          Écran {index + 1} sur {ecrans.length}
        </p>
      </div>

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
              background: i <= index ? "#4f8ef7" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        <div
          className="theme-card"
          style={
            {
              "--card-color": "#4f8ef7",
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
              background: "rgba(79,142,247,0.12)",
              border: "1px solid rgba(79,142,247,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#93c5fd",
              textAlign: "left",
            }}
          >
            💡 {ecran.astuce}
          </div>
        </div>

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
                background: "linear-gradient(135deg, #4f8ef7, #3b82f6)",
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
              href="/atelier-ia/6eme/module-2"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #2ec4b6, #0d9488)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 2 : Les questions impossibles 🔍
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
