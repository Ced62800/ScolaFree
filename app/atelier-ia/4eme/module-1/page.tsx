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
    titre: "Un biais, c'est quoi ?",
    emoji: "🧠",
    texte:
      "Un biais, c'est une erreur de jugement qu'on fait sans s'en rendre compte. Par exemple, penser que les garçons sont meilleurs en maths ou que les femmes sont plus douces — ce sont des biais. L'IA apprend sur des données humaines... et hérite de nos biais !",
    astuce:
      "Le mot «biais» vient du tissu coupé en diagonale — ça dévie de la ligne droite, comme un jugement qui dévie de la réalité.",
  },
  {
    titre: "D'où viennent les biais de l'IA ?",
    emoji: "📊",
    texte:
      "L'IA s'entraîne sur des milliards de textes écrits par des humains. Si ces textes associent souvent «médecin» à des hommes et «infirmier» à des femmes, l'IA va reproduire cette association — même si c'est faux et injuste !",
    astuce:
      "Les données d'entraînement reflètent le monde tel qu'il est, pas tel qu'il devrait être. C'est pour ça que les biais se transmettent.",
  },
  {
    titre: "Les biais dans les images",
    emoji: "🖼️",
    texte:
      "Demande à une IA de générer «un PDG en réunion» : elle va souvent créer un homme en costume. Demande «une infirmière» : elle va souvent créer une femme. Ces associations reflètent des stéréotypes présents dans les données d'entraînement.",
    astuce:
      "Des chercheurs ont montré que les IA de génération d'images reproduisent les inégalités de genre et de race qu'elles ont vues dans les données.",
  },
  {
    titre: "Peut-on corriger les biais ?",
    emoji: "⚖️",
    texte:
      "Oui ! Les équipes qui développent les IA travaillent à les détecter et les corriger. Mais c'est un travail difficile et permanent. C'est pour ça qu'il est important que toi, utilisateur, tu saches reconnaître un biais quand tu en vois un !",
    astuce:
      "Être conscient des biais de l'IA, c'est une compétence du 21ème siècle aussi importante que savoir lire ou calculer.",
  },
];

export default function Module14eme() {
  const [index, setIndex] = useState<number>(0);

  const ecran = ecrans[index];
  if (!ecran) return null;

  const estDernier = index === ecrans.length - 1;

  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/4eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>4ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🕵️</div>
        <h1 className="cours-hero-title">C&apos;est quoi un biais ?</h1>
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
              background: i <= index ? "#f59e0b" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#f59e0b",
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
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#fcd34d",
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
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
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
              href="/atelier-ia/4eme/module-2"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 2 : Des biais dans la vraie vie 🔎
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
