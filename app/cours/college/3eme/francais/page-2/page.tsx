"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "l-argumentation",
    label: "L'argumentation",
    emoji: "💡",
    color: "#4f8ef7",
    desc: "Thèse, arguments, exemples, textes argumentatifs",
    dispo: true,
  },
  {
    id: "le-theatre",
    label: "Le théâtre",
    emoji: "🎭",
    color: "#2ec4b6",
    desc: "Genres théâtraux, didascalies, tirades, monologues",
    dispo: true,
  },
  {
    id: "les-registres",
    label: "Les registres littéraires",
    emoji: "📜",
    color: "#ffd166",
    desc: "Tragique, comique, lyrique, épique, fantastique",
    dispo: true,
  },
  {
    id: "revision-brevet",
    label: "Révision Brevet",
    emoji: "🎓",
    color: "#ff6b6b",
    desc: "Méthode, grammaire, rédaction, questions de cours",
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

export default function Francais3emePageDeux() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [statuts, setStatuts] = useState<Record<string, StatutTheme>>({});
  const [statutBilan, setStatutBilan] = useState<StatutTheme>("jamais");

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
          .eq("classe", "3eme")
          .eq("matiere", "francais")
          .order("score", { ascending: false });
        if (data) {
          const nouveauxStatuts: Record<string, StatutTheme> = {};
          themes.forEach((t) => {
            const meilleur = data.find((s) => s.theme === t.id) || null;
            nouveauxStatuts[t.id] = getStatut(meilleur);
          });
          setStatuts(nouveauxStatuts);
          const meilleurBilan = data.find((s) => s.theme === "bilan-2") || null;
          setStatutBilan(getStatut(meilleurBilan));
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
    router.push("/cours/college/3eme/francais/bilan-2");
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college/3eme/francais")}
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
            onClick={() => router.push("/cours/college/3eme")}
            style={{ cursor: "pointer" }}
          >
            3ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours/college/3eme/francais")}
            style={{ cursor: "pointer" }}
          >
            Français
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Partie 2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📖</div>
        <h1 className="cours-hero-title">Français — 3ème</h1>
        <p className="cours-hero-desc">
          {estConnecte
            ? "Partie 2 — Choisis un thème !"
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
                t.dispo && router.push(`/cours/college/3eme/francais/${t.id}`)
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
              border:
                statutBilan === "valide"
                  ? "2px solid rgba(46,196,182,0.5)"
                  : statutBilan === "en-cours"
                    ? "2px solid rgba(255,209,102,0.5)"
                    : "none",
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
            🎯 Bilan Final Français 3ème — Partie 2
            {statutBilan === "valide"
              ? " ✅"
              : statutBilan === "en-cours"
                ? " 🟡"
                : ""}
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
              ? "Teste toutes tes connaissances de la Partie 2 !"
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
          onClick={() => router.push("/cours/college/3eme/francais")}
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
          ← Retour Partie 1
        </button>
      </div>
    </div>
  );
}
