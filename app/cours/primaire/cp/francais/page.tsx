"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "grammaire",
    label: "Grammaire",
    emoji: "📝",
    color: "#4f8ef7",
    desc: "La phrase, le nom, le verbe",
    nb: 10,
  },
  {
    id: "conjugaison",
    label: "Conjugaison",
    emoji: "⏰",
    color: "#2ec4b6",
    desc: "Le présent des verbes être et avoir",
    nb: 10,
  },
  {
    id: "orthographe",
    label: "Orthographe",
    emoji: "✏️",
    color: "#ffd166",
    desc: "Les sons et les lettres",
    nb: 10,
  },
  {
    id: "vocabulaire",
    label: "Vocabulaire",
    emoji: "📚",
    color: "#ff6b6b",
    desc: "Les mots de la vie quotidienne",
    nb: 10,
  },
];

type StatutTheme = "jamais" | "en-cours" | "valide";

function getStatut(
  meilleurScore: { score: number; total: number } | null,
): StatutTheme {
  if (!meilleurScore) return "jamais";
  if (meilleurScore.score / meilleurScore.total >= 0.8) return "valide";
  return "en-cours";
}

function BadgeStatut({ statut }: { statut: StatutTheme }) {
  if (statut === "valide")
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "1.2rem",
        }}
      >
        ✅
      </div>
    );
  if (statut === "en-cours")
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "1.2rem",
        }}
      >
        🟡
      </div>
    );
  return null;
}

function PhraseStatut({ statut }: { statut: StatutTheme }) {
  if (statut === "valide")
    return (
      <div
        style={{
          fontSize: "0.78rem",
          color: "#2ec4b6",
          fontWeight: 700,
          marginTop: "4px",
        }}
      >
        ✅ Validé !
      </div>
    );
  if (statut === "en-cours")
    return (
      <div
        style={{
          fontSize: "0.78rem",
          color: "#ffd166",
          fontWeight: 700,
          marginTop: "4px",
        }}
      >
        🟡 À améliorer !
      </div>
    );
  return null;
}

export default function FrancaisCP() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [statuts, setStatuts] = useState<Record<string, StatutTheme>>({});

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      if (user) {
        const { data } = await supabase
          .from("scores")
          .select("theme, score, total")
          .eq("user_id", user.id)
          .eq("classe", "cp")
          .eq("matiere", "francais")
          .order("score", { ascending: false });
        if (data) {
          console.log(data);
          const nouveauxStatuts: Record<string, StatutTheme> = {};
          themes.forEach((t) => {
            const meilleur = data.find((s) => s.theme === t.id) || null;
            nouveauxStatuts[t.id] = getStatut(meilleur);
          });
          setStatuts(nouveauxStatuts);
        }
      }
      setChargement(false);
    };
    init();
  }, []);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Français</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — CP</h1>
        <p className="cours-hero-desc">Cours Préparatoire · 6 ans</p>
      </div>

      <div
        className="themes-grid"
        style={{ opacity: chargement ? 0.3 : 1, transition: "opacity 0.3s" }}
      >
        {themes.map((t) => {
          const statut = estConnecte ? statuts[t.id] || "jamais" : "jamais";
          return (
            <div
              key={t.id}
              className="theme-card"
              onClick={() => router.push(`/cours/primaire/cp/francais/${t.id}`)}
              style={
                {
                  "--card-color": t.color,
                  position: "relative",
                  border:
                    statut === "valide"
                      ? "2px solid rgba(46,196,182,0.4)"
                      : statut === "en-cours"
                        ? "2px solid rgba(255,209,102,0.4)"
                        : "2px solid rgba(255,255,255,0.06)",
                } as React.CSSProperties
              }
            >
              {estConnecte && !chargement && <BadgeStatut statut={statut} />}
              <div className="theme-emoji">{t.emoji}</div>
              <div className="theme-label">{t.label}</div>
              <div className="theme-desc">{t.desc}</div>
              <div className="theme-nb">{t.nb} exercices</div>
              <div className="theme-progress">
                <div
                  className="theme-progress-bar"
                  style={{ width: "0%" }}
                ></div>
              </div>
              {estConnecte && !chargement && <PhraseStatut statut={statut} />}
              <div className="theme-arrow">
                {statut === "valide"
                  ? "Refaire →"
                  : statut === "en-cours"
                    ? "Améliorer →"
                    : "Commencer →"}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <button
            onClick={() => router.push("/cours/primaire/cp/francais/bilan")}
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
            🎯 Bilan Final CP — 20 questions
          </button>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
            Teste toutes tes connaissances du CP en une seule fois !
          </p>
        </div>

        <button
          onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")
          }
        >
          📚 Cours suivants — Partie 2{" "}
          <span style={{ fontSize: "1.2rem" }}>→</span>
        </button>
      </div>
    </div>
  );
}
