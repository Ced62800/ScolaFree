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
    titre: "Médecin ou infirmier ?",
    emoji: "🏥",
    texte:
      "Demande à une IA de décrire «un médecin qui soigne un patient» puis «une infirmière qui soigne un patient». Les descriptions seront souvent différentes selon le genre. L'IA associe inconsciemment certains métiers à certains genres.",
    astuce:
      "En France, 49% des médecins sont des femmes. Pourtant les IA les représentent encore souvent comme des hommes.",
  },
  {
    titre: "Le biais dans la reconnaissance faciale",
    emoji: "📷",
    texte:
      "Des études ont montré que certaines IA de reconnaissance faciale fonctionnent bien sur les visages d'hommes blancs... mais beaucoup moins bien sur les femmes ou les personnes à la peau foncée. Pourquoi ? Parce qu'elles ont été entraînées sur des données déséquilibrées.",
    astuce:
      "En 2019, une étude du MIT a montré un taux d'erreur jusqu'à 34% plus élevé sur les femmes à peau foncée vs les hommes à peau claire.",
  },
  {
    titre: "Le biais dans les offres d'emploi",
    emoji: "💼",
    texte:
      "Amazon a dû abandonner un outil de recrutement IA en 2018 car il défavorisait systématiquement les candidatures féminines. L'IA avait appris sur 10 ans d'embauches passées... qui étaient majoritairement masculines dans le secteur tech.",
    astuce:
      "Quand on entraîne une IA sur des données historiques biaisées, elle reproduit et amplifie ces biais dans ses décisions futures.",
  },
  {
    titre: "Les biais dans les traductions",
    emoji: "🌍",
    texte:
      "Dans certaines langues, il n'existe pas de genre grammatical. Quand une IA traduit «he is a nurse / she is a doctor» depuis l'anglais vers ces langues, elle doit choisir — et elle choisit souvent selon des stéréotypes de genre !",
    astuce:
      "Google Translate a corrigé ce problème en 2018 en proposant les deux genres pour certaines traductions ambiguës.",
  },
];

export default function Module24eme() {
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
          <span className="breadcrumb-active">Module 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🔎</div>
        <h1 className="cours-hero-title">Des biais dans la vraie vie</h1>
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
              background: i <= index ? "#ef4444" : "rgba(255,255,255,0.1)",
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
              "--card-color": "#ef4444",
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
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
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
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
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
              href="/atelier-ia/4eme/module-3"
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
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
