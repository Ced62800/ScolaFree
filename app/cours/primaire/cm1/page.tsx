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
    emoji: "🌍",
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
      // Moyennes par matière
      const [moyFr, moyMaths, moyAnglais] = await Promise.all([
        getMoyenneByMatiere("cm1", "francais"),
        getMoyenneByMatiere("cm1", "maths"),
        getMoyenneByMatiere("cm1", "anglais"),
      ]);
      setMoyennes({ francais: moyFr, maths: moyMaths, anglais: moyAnglais });

      // Meilleur score par thème anglais
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

  const moyenneGenerale = () => {
    const vals = Object.values(moyennes).filter((v) => v !== null) as number[];
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

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
            {!loading &&
              moyennes[m.id] !== null &&
              moyennes[m.id] !== undefined && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.8rem",
                    color: m.color,
                  }}
                >
                  Moyenne : {moyennes[m.id]}%
                </div>
              )}
            <div className="theme-arrow">
              {m.dispo ? "Commencer →" : "Bientôt disponible"}
            </div>
          </div>
        ))}
      </div>

      {/* Encart stats */}
      {!loading && Object.values(moyennes).some((v) => v !== null) && (
        <div
          style={{
            maxWidth: "800px",
            margin: "40px auto 0",
            padding: "0 16px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              marginBottom: "20px",
              color: "#fff",
            }}
          >
            📊 Mes statistiques CM1
          </h2>

          {/* Moyenne générale */}
          {moyenneGenerale() !== null && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#aaa",
                  marginBottom: "8px",
                }}
              >
                Moyenne générale CM1
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "#ffd166",
                }}
              >
                {moyenneGenerale()}%
              </div>
            </div>
          )}

          {/* Moyennes par matière */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {matieres.map(
              (m) =>
                moyennes[m.id] !== null &&
                moyennes[m.id] !== undefined && (
                  <div
                    key={m.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {m.emoji} {m.label}
                      </span>
                      <span style={{ color: m.color, fontWeight: 700 }}>
                        {moyennes[m.id]}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                        height: "8px",
                      }}
                    >
                      <div
                        style={{
                          background: m.color,
                          width: `${moyennes[m.id]}%`,
                          height: "8px",
                          borderRadius: "999px",
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                ),
            )}
          </div>

          {/* Meilleurs scores par thème */}
          {matieres.map((m) => {
            const themes = themesParMatiere[m.id] || [];
            const hasScores = themes.some(
              (t) => bestScores[`${m.id}-${t.id}`] !== null,
            );
            if (!hasScores) return null;
            return (
              <div key={m.id} style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "10px",
                    color: m.color,
                  }}
                >
                  {m.emoji} {m.label} — Meilleurs scores
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {themes.map((t) => {
                    const best = bestScores[`${m.id}-${t.id}`];
                    if (!best) return null;
                    const pct = Math.round((best.score / best.total) * 100);
                    return (
                      <div
                        key={t.id}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${m.color}33`,
                          borderRadius: "12px",
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#aaa",
                            marginBottom: "6px",
                          }}
                        >
                          {t.label}
                        </div>
                        <div
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            color:
                              pct >= 80
                                ? "#2ec4b6"
                                : pct >= 50
                                  ? "#ffd166"
                                  : "#ff6b6b",
                          }}
                        >
                          {best.score}/{best.total}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
