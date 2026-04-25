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
    desc: "La phrase complexe",
    dispo: true,
  },
  {
    id: "conjugaison",
    label: "Conjugaison",
    emoji: "⏰",
    color: "#2ec4b6",
    desc: "Le passé simple et le plus-que-parfait",
    dispo: true,
  },
  {
    id: "orthographe",
    label: "Orthographe",
    emoji: "✏️",
    color: "#ffd166",
    desc: "L'accord du participe passé",
    dispo: true,
  },
  {
    id: "vocabulaire",
    label: "Vocabulaire",
    emoji: "📚",
    color: "#ff6b6b",
    desc: "Les figures de style",
    dispo: true,
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

export default function FrancaisCM2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [statuts, setStatuts] = useState<Record<string, StatutTheme>>({});

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        const { data } = await supabase
          .from("scores")
          .select("theme, score, total")
          .eq("user_id", user.id)
          .eq("classe", "cm2")
          .eq("matiere", "francais")
          .order("score", { ascending: false });
        if (data) {
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

  const handleBilan = () => {
    if (!estConnecte) {
      router.push("/inscription");
      return;
    }
    router.push("/cours/primaire/cm2/francais/bilan");
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Français</span>
        </div>
      </div>
      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — CM2</h1>
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
        {themes.map((t) => {
          const statut = statuts[t.id] || "jamais";
          return (
            <div
              key={t.id}
              className="theme-card"
              onClick={() =>
                t.dispo && router.push(`/cours/primaire/cm2/francais/${t.id}`)
              }
              style={
                {
                  "--card-color": t.dispo ? t.color : "#888",
                  position: "relative",
                  cursor: t.dispo ? "pointer" : "not-allowed",
                  paddingTop: "44px",
                  opacity: t.dispo ? 1 : 0.5,
                  border:
                    statut === "valide"
                      ? "2px solid rgba(46,196,182,0.4)"
                      : statut === "en-cours"
                        ? "2px solid rgba(255,209,102,0.4)"
                        : "2px solid rgba(255,255,255,0.06)",
                } as React.CSSProperties
              }
            >
              {!chargement && <BadgeStatut statut={statut} />}
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
              <div className="theme-emoji">{t.emoji}</div>
              <div className="theme-label">{t.label}</div>
              <div className="theme-desc">{t.desc}</div>
              {!chargement && <PhraseStatut statut={statut} />}
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
                {!t.dispo
                  ? "🔒 Bientôt"
                  : statut === "valide"
                    ? "Refaire →"
                    : statut === "en-cours"
                      ? "Améliorer →"
                      : "Commencer →"}
              </div>
            </div>
          );
        })}
      </div>
      {!chargement && (
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <button
            onClick={handleBilan}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: estConnecte
                ? "linear-gradient(135deg, #ffd166, #ff6b6b)"
                : "rgba(255,255,255,0.08)",
              color: estConnecte ? "#1a1a2e" : "#fff",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "16px 32px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              boxShadow: estConnecte
                ? "0 4px 20px rgba(255,209,102,0.3)"
                : "none",
            }}
          >
            🎯 Bilan Final CM2 — 20 questions
          </button>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: "10px" }}>
            {estConnecte
              ? "Teste toutes tes connaissances du CM2 en une seule fois !"
              : "🔒 Inscris-toi pour accéder au bilan"}
          </p>
        </div>
      )}
      {!chargement && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => router.push("/cours/primaire/cm2/francais/page-2")}
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
      )}
    </div>
  );
}
