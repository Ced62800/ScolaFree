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
    titre: "Les questions sur l'avenir",
    emoji: "🔮",
    texte:
      "Demande à l'IA : «Qui va gagner la Coupe du Monde 2026 ?» Elle ne peut pas le savoir ! Elle peut faire une prédiction, mais ce sera une invention basée sur des statistiques passées, pas une vraie réponse.",
    astuce:
      "L'IA ne peut pas prédire l'avenir. Si elle te donne une réponse assurée, méfie-toi !",
  },
  {
    titre: "Les questions sur toi",
    emoji: "🪞",
    texte:
      "L'IA ne te connaît pas personnellement. Si tu lui demandes «Qu'est-ce que je vais manger ce soir ?» ou «Est-ce que ma meilleure amie est sympa ?», elle ne peut pas répondre — elle n'a aucune info sur ta vie !",
    astuce:
      "L'IA n'a pas de mémoire entre les conversations. Elle repart de zéro à chaque fois.",
  },
  {
    titre: "Les paradoxes et les pièges logiques",
    emoji: "🌀",
    texte:
      "Essaie : «Si je mens toujours, est-ce que je mens quand je dis que je mens ?» ou «Quelle est la couleur du cheval blanc d'Henri IV ?» Ce genre de piège déroute souvent l'IA !",
    astuce:
      "Le cheval blanc d'Henri IV était... blanc ! C'est une question piège pour tester si tu lis vraiment.",
  },
  {
    titre: "Les questions sans bonne réponse",
    emoji: "🎭",
    texte:
      "Demande à l'IA : «Est-ce que la pizza à l'ananas est bonne ?» ou «Quel est le meilleur film de tous les temps ?» Ce sont des opinions — il n'y a pas de bonne réponse, mais l'IA va en choisir une quand même !",
    astuce:
      "L'IA donne souvent des réponses qui semblent neutres, mais elle a des biais cachés dans ses données d'entraînement.",
  },
];

export default function Module26eme() {
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
          <span className="breadcrumb-active">Module 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🔍</div>
        <h1 className="cours-hero-title">Les questions impossibles</h1>
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
              background: i <= index ? "#2ec4b6" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#2ec4b6",
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
              background: "rgba(46,196,182,0.1)",
              border: "1px solid rgba(46,196,182,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#5eead4",
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
                background: "linear-gradient(135deg, #2ec4b6, #0d9488)",
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
              href="/atelier-ia/6eme/module-3"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #ff6b6b, #dc2626)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Module 3 : La mission 🎯
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
