"use client";

import { getBestScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "grammaire",
    label: "Grammaire",
    emoji: "📝",
    color: "#4f8ef7",
    desc: "Le sujet, le verbe et les groupes",
    nb: 10,
  },
  {
    id: "conjugaison",
    label: "Conjugaison",
    emoji: "⏰",
    color: "#2ec4b6",
    desc: "Le présent et l'imparfait",
    nb: 10,
  },
  {
    id: "orthographe",
    label: "Orthographe",
    emoji: "✏️",
    color: "#ffd166",
    desc: "Accords et homophones",
    nb: 10,
  },
  {
    id: "vocabulaire",
    label: "Vocabulaire",
    emoji: "📚",
    color: "#ff6b6b",
    desc: "Synonymes, antonymes et familles de mots",
    nb: 10,
  },
];

export default function FrancaisCE2() {
  const router = useRouter();
  const [bestScores, setBestScores] = useState<
    Record<string, { score: number; total: number } | null>
  >({});

  useEffect(() => {
    const fetchStats = async () => {
      const bests: Record<string, { score: number; total: number } | null> = {};
      for (const t of themes) {
        bests[t.id] = await getBestScore("ce2", "francais", t.id);
      }
      setBestScores(bests);
    };
    fetchStats();
  }, []);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Français</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — CE2</h1>
        <p className="cours-hero-desc">Maîtrise la langue avec Cédric Flow</p>
      </div>

      <div className="themes-grid">
        {themes.map((t) => {
          const best = bestScores[t.id];
          return (
            <div
              key={t.id}
              className="theme-card"
              onClick={() =>
                router.push(`/cours/primaire/ce2/francais/${t.id}`)
              }
              style={{ "--card-color": t.color } as React.CSSProperties}
            >
              <div className="theme-emoji">{t.emoji}</div>
              <div className="theme-label">{t.label}</div>
              <div className="theme-desc">{t.desc}</div>
              {best && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: t.color,
                    marginTop: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Record : {best.score}/{best.total}
                </div>
              )}
              <div className="theme-nb">{t.nb} exercices</div>
              <div className="theme-arrow">Commencer →</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/cours/primaire/ce2/francais/bilan")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "linear-gradient(135deg, #ffd166, #ff6b6b)",
            color: "#1a1a2e",
            fontWeight: 800,
            fontSize: "1.1rem",
            padding: "16px 32px",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,209,102,0.3)",
          }}
        >
          🎯 Bilan Final Français CE2
        </button>
        <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
          Teste toutes tes connaissances du CE2 en une seule fois !
        </p>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/cours/primaire/ce2/francais/page-2")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            padding: "14px 28px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
          }}
        >
          📚 Cours suivants — Partie 2 →
        </button>
      </div>
    </div>
  );
}
