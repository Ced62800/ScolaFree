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
    titre: "C'est quoi un prompt ?",
    emoji: "✍️",
    texte:
      "Un prompt, c'est le message que tu envoies à une IA. C'est ta façon de lui donner des instructions. Mais contrairement à un moteur de recherche, l'IA ne cherche pas des mots-clés — elle interprète ta demande en entier et essaie de comprendre ce que tu veux vraiment.",
    astuce:
      "Le mot «prompt» vient de l'anglais et signifie «instruction» ou «invite». C'est la base de tout travail avec une IA.",
  },
  {
    titre: "Pourquoi la formulation change tout",
    emoji: "🔄",
    texte:
      "Demande à une IA «résume Roméo et Juliette» puis «résume Roméo et Juliette en une phrase comme si tu parlais à un enfant de 6 ans». Les deux réponses seront complètement différentes ! La précision de ton prompt détermine la qualité de la réponse.",
    astuce:
      "Un bon prompt précise : le sujet, le format souhaité, le ton, le public cible et la longueur désirée.",
  },
  {
    titre: "Les éléments d'un prompt parfait",
    emoji: "🎯",
    texte:
      "Un prompt efficace contient : un contexte (qui es-tu, pourquoi tu demandes), une tâche précise (ce que tu veux), un format (liste, résumé, dialogue...), un ton (formel, humoristique, poétique...) et des contraintes (longueur, mots interdits, niveau de langue).",
    astuce:
      "Technique du «rôle» : commence par «Tu es un professeur de français...» ou «Tu es un scénariste...» pour orienter l'IA.",
  },
  {
    titre: "Le prompt engineering, un vrai métier",
    emoji: "💼",
    texte:
      "Savoir écrire de bons prompts est devenu une compétence très recherchée en entreprise. On appelle ça le «prompt engineering». Des entreprises paient des spécialistes pour optimiser leurs interactions avec les IA et obtenir les meilleurs résultats possibles.",
    astuce:
      "En 2023, des offres d'emploi de «Prompt Engineer» proposaient des salaires jusqu'à 300 000$ par an aux États-Unis !",
  },
];

export default function Module13eme() {
  const [index, setIndex] = useState<number>(0);

  const ecran = ecrans[index];
  if (!ecran) return null;

  const estDernier = index === ecrans.length - 1;

  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/3eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>3ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">✍️</div>
        <h1 className="cours-hero-title">L&apos;art du prompt</h1>
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
              background: i <= index ? "#ff6b6b" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#ff6b6b",
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
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#fca5a5",
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
                background: "linear-gradient(135deg, #ff6b6b, #dc2626)",
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
              href="/atelier-ia/3eme/module-2"
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
              Module 2 : Roméo et Juliette 🎭
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
