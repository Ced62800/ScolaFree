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
    titre: "Un chat qui joue de la guitare sur la Lune",
    emoji: "🐱",
    texte:
      "Aucun photographe ne peut capturer ça — c'est physiquement impossible ! Pourtant l'IA peut le créer en quelques secondes avec une description simple. Elle combine des éléments réels (chat, guitare, Lune) pour former quelque chose d'impossible.",
    astuce:
      "L'IA est excellente pour combiner des éléments qui n'ont aucune raison d'être ensemble dans la réalité.",
  },
  {
    titre: "Une ville sous-marine avec des gratte-ciels",
    emoji: "🏙️",
    texte:
      "Des immeubles géants sous l'océan, avec des poissons qui nagent entre les étages... L'IA peut visualiser des mondes qui n'existent pas. C'est pour ça qu'elle est très utilisée dans les films, les jeux vidéo et la bande dessinée.",
    astuce:
      "Des studios comme Marvel ou Disney utilisent des IA pour générer des décors de films en un temps record.",
  },
  {
    titre: "Un portrait de quelqu'un qui n'existe pas",
    emoji: "👤",
    texte:
      "L'IA peut créer des visages humains ultra-réalistes de personnes qui n'ont jamais existé. Le résultat est si convaincant qu'il est impossible de les distinguer de vraies photos. C'est impressionnant... et un peu inquiétant !",
    astuce:
      "Des sites comme «thispersondoesnotexist.com» montrent des visages 100% générés par IA. Personne ne les a photographiés.",
  },
  {
    titre: "Un dinosaure en costume en train de coder",
    emoji: "🦕",
    texte:
      "Plus la description est absurde et précise, plus le résultat est amusant et surprenant. L'IA prend ta description au pied de la lettre et fait de son mieux pour créer exactement ce que tu décris !",
    astuce:
      "La clé d'une bonne image IA : sois précis sur le style (réaliste, cartoon, aquarelle...), l'ambiance et les détails.",
  },
];

export default function Module25eme() {
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
          <span className="breadcrumb-active">Module 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🌀</div>
        <h1 className="cours-hero-title">Des images impossibles</h1>
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
              background: i <= index ? "#ec4899" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#ec4899",
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
              background: "rgba(236,72,153,0.1)",
              border: "1px solid rgba(236,72,153,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.85rem",
              color: "#f9a8d4",
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
                background: "linear-gradient(135deg, #ec4899, #db2777)",
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
              href="/atelier-ia/5eme/module-3"
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
