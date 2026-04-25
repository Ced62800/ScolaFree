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
    titre: "Prompt basique vs prompt élaboré",
    emoji: "📊",
    texte:
      "Prompt basique : «Résume Roméo et Juliette». Résultat : un résumé générique de 3 lignes. Prompt élaboré : «Résume Roméo et Juliette en 5 phrases, du point de vue de Roméo, en utilisant un langage moderne et en soulignant l'absurdité de la situation». Résultat : quelque chose d'unique et de bien plus intéressant !",
    astuce:
      "Plus ton prompt est précis et contextualisé, plus la réponse de l'IA sera originale et utile.",
  },
  {
    titre: "Le même texte, 4 tons différents",
    emoji: "🎭",
    texte:
      "Roméo et Juliette peut être résumé de façon tragique («deux amants séparés par la haine de leurs familles»), comique («deux ados qui se rencontrent un soir et décident de mourir ensemble»), poétique («l'amour fulgurant qui brûle et consume»), ou journalistique («double suicide à Vérone, les familles Montaigu et Capulet en cause»).",
    astuce:
      "Ajouter «sur un ton humoristique» ou «comme un article de journal» dans ton prompt change radicalement le style de réponse.",
  },
  {
    titre: "Adapter au public cible",
    emoji: "👥",
    texte:
      "«Explique Roméo et Juliette à un enfant de 8 ans» donnera un résumé simple avec des mots faciles. «Explique-le à un étudiant en lettres» donnera une analyse avec des références littéraires. «Explique-le à quelqu'un qui n'a jamais lu Shakespeare» donnera un résumé accessible mais complet.",
    astuce:
      "Préciser le public cible dans ton prompt est l'une des techniques les plus efficaces pour obtenir exactement ce que tu veux.",
  },
  {
    titre: "Le prompt en chaîne",
    emoji: "⛓️",
    texte:
      "Tu peux aussi affiner en plusieurs étapes : d'abord demande un résumé basique, puis dis «maintenant rends-le plus dramatique», puis «ajoute une métaphore sur la lumière», puis «réduis-le à 3 phrases». C'est le «prompt en chaîne» — tu sculptes la réponse progressivement.",
    astuce:
      "Les IA comme Claude ou ChatGPT gardent le contexte de la conversation. Tu peux construire ta réponse idéale en plusieurs échanges.",
  },
];

export default function Module23eme() {
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
          <span className="breadcrumb-active">Module 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎭</div>
        <h1 className="cours-hero-title">Roméo et Juliette vu par l&apos;IA</h1>
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
              background: "rgba(245,158,11,0.1)",
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
              href="/atelier-ia/3eme/module-3"
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
              Module 3 : La mission 🏆
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
