"use client";

import { getBestScore, getMoyenneByMatiere } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#4f8ef7",
    desc: "Grammaire, Conjugaison, Orthographe, Vocabulaire",
    dispo: true,
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "➕",
    color: "#2ec4b6",
    desc: "Numération, Calcul, Fractions, Proportionnalité",
    dispo: true,
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: (
      <img
        src="https://flagcdn.com/w160/gb.png"
        alt="Drapeau Anglais"
        style={{ width: "45px", height: "auto", borderRadius: "4px" }}
      />
    ),
    color: "#ff6b6b",
    desc: "Vocabulaire, Grammaire, Communication",
    dispo: true,
  },
];

const themesParMatiere: Record<string, { id: string; label: string }[]> = {
  anglais: [
    { id: "metiers", label: "Jobs & Professions 💼" },
    { id: "routine-heure", label: "Daily Routine ⏰" },
    { id: "pays-anglophones", label: "English-speaking Countries 🌍" },
    { id: "decrire-quelquun", label: "Describing People 👤" },
  ],
  maths: [
    { id: "decimaux", label: "Décimaux" },
    { id: "fractions", label: "Fractions" },
    { id: "division", label: "Division" },
    { id: "proportionnalite", label: "Proportionnalité" },
  ],
  francais: [
    { id: "grammaire", label: "Grammaire" },
    { id: "conjugaison", label: "Conjugaison" },
    { id: "orthographe", label: "Orthographe" },
    { id: "vocabulaire", label: "Vocabulaire" },
  ],
};

export default function CM1Page() {
  const router = useRouter();
  const [moyennes, setMoyennes] = useState<Record<string, number | null>>({});
  const [bestScores, setBestScores] = useState<
    Record<string, { score: number; total: number } | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [moyFr, moyMaths, moyAnglais] = await Promise.all([
        getMoyenneByMatiere("cm1", "francais"),
        getMoyenneByMatiere("cm1", "maths"),
        getMoyenneByMatiere("cm1", "anglais"),
      ]);
      setMoyennes({ francais: moyFr, maths: moyMaths, anglais: moyAnglais });

      const bests: Record<string, { score: number; total: number } | null> = {};
      for (const m of matieres) {
        for (const t of themesParMatiere[m.id] || []) {
          const key = `${m.id}-${t.id}`;
          bests[key] = await getBestScore("cm1", m.id, t.id);
        }
      }
      setBestScores(bests);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">CM1</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">⭐</div>
        <h1 className="cours-hero-title">CM1 — Choisis une matière</h1>
        <p className="cours-hero-desc">Cours Moyen 1 · 9 ans</p>
      </div>

      <div className="themes-grid">
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() =>
              m.dispo && router.push(`/cours/primaire/cm1/${m.id}`)
            }
            style={
              {
                "--card-color": m.color,
                opacity: m.dispo ? 1 : 0.5,
                cursor: m.dispo ? "pointer" : "not-allowed",
              } as React.CSSProperties
            }
          >
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            <div className="theme-arrow">
              {m.dispo ? "Commencer →" : "Bientôt disponible"}
            </div>
          </div>
        ))}
      </div>

      {/* CITATION EN BAS À LA PLACE DES STATS */}
      <div
        style={{
          marginTop: "60px",
          padding: "30px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#aaa",
            fontStyle: "italic",
            fontSize: "0.9rem",
            maxWidth: "500px",
            margin: "0 auto",
            lineHeight: "1.5",
          }}
        >
          "Chaque jour est une nouvelle chance d'apprendre quelque chose de
          nouveau."
        </p>
      </div>
    </div>
  );
}
