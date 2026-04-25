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
    titre: "L'IA, c'est quoi exactement ?",
    emoji: "🤖",
    texte:
      "L'intelligence artificielle, c'est un programme informatique qui peut apprendre, réfléchir et répondre à des questions... un peu comme un cerveau, mais fait de codes et de calculs !",
    astuce:
      "«Artificielle» veut dire fabriqué par des humains — pas naturel comme ton cerveau !",
  },
  {
    titre: "Comment ça apprend ?",
    emoji: "📚",
    texte:
      "Imagine que tu lises des millions de livres, d'articles et de conversations. L'IA fait pareil ! Elle lit des quantités énormes de textes pour apprendre comment les mots fonctionnent ensemble.",
    astuce:
      "Une IA peut lire en quelques heures ce qu'un humain lirait en plusieurs millions d'années !",
  },
  {
    titre: "Est-ce que l'IA pense vraiment ?",
    emoji: "💭",
    texte:
      "Non, pas comme toi ! L'IA ne ressent rien, elle n'a pas d'émotions. Elle repère des patterns dans les textes et prédit quelle suite de mots semble la plus logique.",
    astuce:
      "C'est comme un jeu de «deviner le mot suivant» ultra-sophistiqué !",
  },
  {
    titre: "À quoi ça sert ?",
    emoji: "✨",
    texte:
      "L'IA peut écrire des textes, traduire des langues, répondre à des questions, créer des images, faire de la musique, aider les médecins à détecter des maladies... et plein d'autres choses !",
    astuce:
      "La plateforme ScolaFree utilise une IA pour t'aider avec Scolou ! 😉",
  },
];

export default function Module1CM2() {
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
          <span className="breadcrumb-active">Module 1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🧠</div>
        <h1 className="cours-hero-title">C&apos;est quoi l&apos;IA ?</h1>
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
              background: i <= index ? "#6366f1" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Carte contenu */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div
          className="theme-card"
          style={
            {
              "--card-color": "#6366f1",
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
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#a5b4fc",
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
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
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
              href="/atelier-ia/cm2/module-2"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 2 : L&apos;IA dans ta vie 👀
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
