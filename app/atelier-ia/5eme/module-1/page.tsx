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
    titre: "L'IA peut dessiner ?",
    emoji: "🖼️",
    texte:
      "Oui ! Il existe des IA spécialement entraînées pour créer des images. Tu leur décris ce que tu veux en mots, et elles génèrent une image en quelques secondes. On appelle ça la «génération d'images par IA».",
    astuce:
      "Des outils comme DALL-E, Midjourney ou Stable Diffusion créent des images à partir de descriptions texte.",
  },
  {
    titre: "Comment ça marche ?",
    emoji: "⚙️",
    texte:
      "L'IA a regardé des millions d'images avec leurs descriptions. Elle a appris à associer des mots à des formes, des couleurs, des styles. Quand tu lui donnes une description, elle reconstruit une image à partir de tout ce qu'elle a appris.",
    astuce:
      "Ce n'est pas un copier-coller d'images existantes — l'IA crée vraiment quelque chose de nouveau à chaque fois !",
  },
  {
    titre: "Ce que l'IA peut créer",
    emoji: "✨",
    texte:
      "L'IA peut créer des portraits, des paysages, des scènes fantastiques, des illustrations de livres, des logos, des personnages de jeux vidéo... tout ce que tu peux décrire avec des mots, elle peut tenter de le dessiner !",
    astuce:
      "Plus ta description est précise et détaillée, plus l'image sera proche de ce que tu imagines.",
  },
  {
    titre: "Les limites de l'IA créative",
    emoji: "🤔",
    texte:
      "L'IA a du mal avec les mains (trop de doigts !), les textes dans les images, et les scènes très complexes. Elle peut aussi créer des choses étranges ou irréelles sans s'en rendre compte.",
    astuce:
      "Ces «erreurs» peuvent être très drôles — et parfois même plus créatives que ce qu'on avait demandé !",
  },
];

export default function Module15eme() {
  const [index, setIndex] = useState<number>(0);

  const ecran = ecrans[index];
  if (!ecran) return null;

  const estDernier = index === ecrans.length - 1;

  return (
    <div className="cours-page">
      <div className="cours-header">
        <Link
          href="/atelier-ia/5eme"
          className="cours-back"
          style={{ textDecoration: "none" }}
        >
          ← Retour
        </Link>
        <div className="cours-breadcrumb">
          <span>Atelier IA</span>
          <span className="breadcrumb-sep">›</span>
          <span>5ème</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Module 1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎨</div>
        <h1 className="cours-hero-title">L&apos;IA peut créer des images ?</h1>
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
              background: i <= index ? "#a855f7" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#a855f7",
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
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#d8b4fe",
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
                background: "linear-gradient(135deg, #a855f7, #9333ea)",
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
              href="/atelier-ia/5eme/module-2"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #ec4899, #db2777)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 2 : Des images impossibles 🌀
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
