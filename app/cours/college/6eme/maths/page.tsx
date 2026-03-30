"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "nombres-entiers",
    label: "Les nombres entiers",
    emoji: "🔢",
    color: "#4f8ef7",
    desc: "Valeur positionnelle, comparaison, arrondi",
    dispo: true,
  },
  {
    id: "nombres-decimaux",
    label: "Les nombres décimaux",
    emoji: "🔡",
    color: "#2ec4b6",
    desc: "Lire, écrire et comparer les décimaux",
    dispo: true,
  },
  {
    id: "fractions",
    label: "Les fractions",
    emoji: "➗",
    color: "#ffd166",
    desc: "Numérateur, dénominateur, fractions équivalentes",
    dispo: true,
  },
  {
    id: "geometrie",
    label: "La géométrie",
    emoji: "📐",
    color: "#ff6b6b",
    desc: "Figures, constructions et propriétés",
    dispo: true,
  },
];

export default function Maths6emePage() {
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

  const handleBilan = () => {
    if (!estConnecte) {
      router.push("/inscription");
      return;
    }
    router.push("/cours/college/6eme/maths/bilan");
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college/6eme")}
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
          <span
            onClick={() => router.push("/cours/college/6eme")}
            style={{ cursor: "pointer" }}
          >
            6ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Maths</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🔢</div>
        <h1 className="cours-hero-title">Mathématiques — 6ème</h1>
        <p className="cours-hero-desc">
          {estConnecte
            ? "Choisis un thème pour commencer !"
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
        {themes.map((t) => (
          <div
            key={t.id}
            className="theme-card"
            onClick={() =>
              t.dispo && router.push(`/cours/college/6eme/maths/${t.id}`)
            }
            style={
              {
                "--card-color": t.dispo ? t.color : "#888",
                position: "relative",
                cursor: t.dispo ? "pointer" : "not-allowed",
                paddingTop: "44px",
                opacity: t.dispo ? 1 : 0.5,
              } as React.CSSProperties
            }
          >
            {!estConnecte && !chargement && t.dispo && (
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
            {!t.dispo && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#999",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  whiteSpace: "nowrap",
                }}
              >
                🔒 Bientôt
              </div>
            )}
            <div className="theme-emoji">{t.emoji}</div>
            <div className="theme-label">{t.label}</div>
            <div className="theme-desc">{t.desc}</div>
            {!estConnecte && !chargement && t.dispo && (
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
            <div
              className="theme-arrow"
              style={{ color: t.dispo ? t.color : "#888" }}
            >
              {t.dispo ? "Commencer →" : "🔒 Bientôt"}
            </div>
          </div>
        ))}
      </div>

      {!chargement && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "32px",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={handleBilan}
            style={{
              background: estConnecte
                ? "linear-gradient(135deg, #f7974f, #f74f4f)"
                : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "14px",
              padding: "16px 32px",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.1rem",
              cursor: "pointer",
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            🎯 Bilan Final Maths 6ème
          </button>
          <p
            style={{
              color: "#aaa",
              fontSize: "0.85rem",
              marginTop: "8px",
              textAlign: "center",
            }}
          >
            {estConnecte
              ? "Teste toutes tes connaissances de la Partie 1 !"
              : "🔒 Inscris-toi pour accéder au bilan"}
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <button
          onClick={() => router.push("/cours/college/6eme/maths/page-2")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "14px",
            padding: "14px 28px",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          📚 Cours suivants — Partie 2 →
        </button>
      </div>
    </div>
  );
}
