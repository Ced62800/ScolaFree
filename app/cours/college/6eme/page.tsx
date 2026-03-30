"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#4f8ef7",
    desc: "Grammaire, conjugaison, orthographe et vocabulaire",
    dispo: true,
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "🔢",
    color: "#2ec4b6",
    desc: "Nombres, calcul, géométrie et statistiques",
    dispo: true,
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: (
      <img
        src="https://flagcdn.com/w40/gb.png"
        alt="UK"
        style={{ width: "28px", verticalAlign: "middle", borderRadius: "3px" }}
      />
    ),
    color: "#ffd166",
    desc: "Vocabulaire, grammaire et expression en anglais",
    dispo: false,
  },
];

export default function SixiemePage() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      setChargement(false);
    };
    init();
  }, []);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours")}
            style={{ cursor: "pointer" }}
          >
            Cours
          </span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours/college")}
            style={{ cursor: "pointer" }}
          >
            Collège
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">6ème</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎒</div>
        <h1 className="cours-hero-title">6ème</h1>
        <p className="cours-hero-desc">
          {estConnecte
            ? "Choisis ta matière pour commencer !"
            : "Mode découverte — 5 questions par thème"}
        </p>
      </div>

      {!estConnecte && !chargement && (
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 24px",
            padding: "14px 20px",
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "14px",
            textAlign: "center",
            fontSize: "0.95rem",
            color: "#aaa",
          }}
        >
          👀 Tu explores en mode découverte.{" "}
          <a
            href="/inscription"
            style={{
              color: "#4f8ef7",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Inscris-toi gratuitement
          </a>{" "}
          pour accéder à tous les exercices !
        </div>
      )}

      <div
        className="themes-grid"
        style={{ opacity: chargement ? 0.3 : 1, transition: "opacity 0.3s" }}
      >
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() =>
              m.dispo && router.push(`/cours/college/6eme/${m.id}`)
            }
            style={
              {
                "--card-color": m.color,
                position: "relative",
                cursor: m.dispo ? "pointer" : "not-allowed",
                paddingTop: "44px",
                opacity: m.dispo ? 1 : 0.5,
              } as React.CSSProperties
            }
          >
            {!estConnecte && !chargement && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(79,142,247,0.15)",
                  color: "#4f8ef7",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(79,142,247,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                👀 Découverte
              </div>
            )}
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            {!estConnecte && !chargement && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#aaa",
                  marginTop: "4px",
                  marginBottom: "4px",
                }}
              >
                5 questions par thème
              </div>
            )}
            <div className="theme-arrow" style={{ color: m.color }}>
              {m.dispo ? "Accéder →" : "🔒 Bientôt"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
