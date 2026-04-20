"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import Link from "next/link";

const fiches = [
  {
    id: "addition-rapide",
    titre: "Additionner rapidement",
    emoji: "➕",
    desc: "Arrondir puis ajuster pour calculer vite",
    dispo: true,
  },
  {
    id: "aire",
    titre: "Aire des formes",
    emoji: "📐",
    desc: "Carré, rectangle, triangle, cercle",
    dispo: false,
  },
  {
    id: "conversion-unite",
    titre: "Conversions d'unités",
    emoji: "📏",
    desc: "km/miles, kg/livres, °C/°F",
    dispo: true,
  },
  {
    id: "dix-pourcent",
    titre: "Calculer 10%",
    emoji: "💯",
    desc: "La base de tous les pourcentages",
    dispo: true,
  },
  {
    id: "fraction-addition",
    titre: "Additionner des fractions",
    emoji: "🍕",
    desc: "Trouver le bon dénominateur commun",
    dispo: true,
  },
  {
    id: "fraction-division",
    titre: "Diviser des fractions",
    emoji: "➗",
    desc: "Multiplier par l'inverse",
    dispo: true,
  },
  {
    id: "fraction-multiplication",
    titre: "Multiplier des fractions",
    emoji: "✖️",
    desc: "Numérateur × numérateur",
    dispo: true,
  },
  {
    id: "fraction-simplifier",
    titre: "Simplifier une fraction",
    emoji: "✂️",
    desc: "Trouver le plus grand diviseur commun",
    dispo: false,
  },
  {
    id: "fraction-soustraction",
    titre: "Soustraire des fractions",
    emoji: "➖",
    desc: "Même dénominateur, puis soustraire",
    dispo: true,
  },
  {
    id: "multiplier-10",
    titre: "Multiplier par 10, 100, 1000",
    emoji: "✖️",
    desc: "Déplacer la virgule vers la droite",
    dispo: true,
  },
  {
    id: "multiplier-11",
    titre: "Multiplier par 11",
    emoji: "🔢",
    desc: "L'astuce des chiffres qui s'additionnent",
    dispo: true,
  },
  {
    id: "multiplier-25",
    titre: "Multiplier par 25",
    emoji: "🪙",
    desc: "Diviser par 4 puis multiplier par 100",
    dispo: true,
  },
  {
    id: "multiplier-5",
    titre: "Multiplier par 5",
    emoji: "🖐️",
    desc: "Diviser par 2 puis multiplier par 10",
    dispo: true,
  },
  {
    id: "multiplier-9",
    titre: "Multiplier par 9",
    emoji: "🤞",
    desc: "L'astuce des doigts pour la table de 9",
    dispo: true,
  },
  {
    id: "partager-addition",
    titre: "Partager une addition",
    emoji: "🍽️",
    desc: "Diviser une note au restaurant",
    dispo: false,
  },
  {
    id: "perimetre",
    titre: "Périmètre des formes",
    emoji: "📐",
    desc: "Carré, rectangle, triangle, cercle",
    dispo: false,
  },
  {
    id: "pourcentage-inverse",
    titre: "Pourcentage inverse",
    emoji: "🔄",
    desc: "30% de 70 = 70% de 30 !",
    dispo: false,
  },
  {
    id: "pourcentages-courants",
    titre: "Pourcentages courants",
    emoji: "📊",
    desc: "20%, 25%, 50%, 75% en un clin d'œil",
    dispo: false,
  },
  {
    id: "pourboire",
    titre: "Calculer un pourboire",
    emoji: "💰",
    desc: "Laisser le bon montant rapidement",
    dispo: false,
  },
  {
    id: "racine-carree",
    titre: "Racine carrée",
    emoji: "√",
    desc: "Trouver une racine carrée facilement",
    dispo: false,
  },
  {
    id: "soldes",
    titre: "Calculer les soldes",
    emoji: "🏷️",
    desc: "-30%, -50% : quelle est la bonne affaire ?",
    dispo: false,
  },
  {
    id: "soustraction-rapide",
    titre: "Soustraire rapidement",
    emoji: "➖",
    desc: "Compter jusqu'au nombre suivant",
    dispo: true,
  },
  {
    id: "volume",
    titre: "Volume des solides",
    emoji: "📦",
    desc: "Cube, rectangle, cylindre",
    dispo: false,
  },
];

export default function FondamentauxMathsPage() {
  const { estConnecte } = useDecouverte();
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
        <div style={{ marginBottom: "16px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            🧮 Fondamentaux des Maths
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
            {fiches.length} astuces essentielles — calcul mental, pourcentages,
            fractions
          </p>
        </div>

        {/* Bannière mode découverte */}
        {!estConnecte && (
          <div
            style={{
              background: "rgba(46,196,182,0.08)",
              border: "1px solid rgba(46,196,182,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>👀</span>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.82rem",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Tu explores en mode découverte —{" "}
              <strong style={{ color: "#2ec4b6" }}>
                3 questions par fiche
              </strong>
              .{" "}
              <Link
                href="/inscription"
                style={{ color: "#2ec4b6", fontWeight: 700 }}
              >
                Inscris-toi gratuitement
              </Link>{" "}
              pour accéder aux 10 questions !
            </p>
          </div>
        )}

        {/* Disponibles */}
        <div style={{ marginBottom: "8px" }}>
          <p
            style={{
              color: "#2ec4b6",
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
                href={`/fondamentaux/maths/${fiche.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "rgba(46,196,182,0.08)",
                    border: "1px solid rgba(46,196,182,0.35)",
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
                      "rgba(46,196,182,0.15)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#2ec4b6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(46,196,182,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "rgba(46,196,182,0.35)";
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                    {fiche.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#2ec4b6",
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
                    {estConnecte ? "10 q →" : "3 q →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        {bientot.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              margin: "20px 0 16px",
            }}
          />
        )}

        {/* Bientôt disponibles */}
        {bientot.length > 0 && (
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
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
        )}
      </div>
    </div>
  );
}
