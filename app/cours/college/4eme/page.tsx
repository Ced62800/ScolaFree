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
    desc: "Équations, géométrie, trigonométrie et probabilités",
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
    dispo: true,
  },
];

export default function QuatriemePage() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [statutsMatieres, setStatutsMatieres] = useState<
    Record<string, "valide" | "en-cours">
  >({});

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        const { data } = await supabase
          .from("scores")
          .select("matiere, theme, score, total")
          .eq("user_id", user.id)
          .eq("classe", "4eme")
          .in("theme", ["bilan", "bilan-2"])
          .order("score", { ascending: false });
        if (data) {
          const statutsMap: Record<string, "valide" | "en-cours"> = {};
          const parMatiere: Record<string, { score: number; total: number }[]> =
            {};
          for (const s of data) {
            if (!parMatiere[s.matiere]) parMatiere[s.matiere] = [];
            parMatiere[s.matiere].push(s);
          }
          for (const [matiere, scores] of Object.entries(parMatiere)) {
            const meilleur = scores.reduce((best, s) =>
              s.score / s.total > best.score / best.total ? s : best,
            );
            statutsMap[matiere] =
              meilleur.score / meilleur.total >= 0.8 ? "valide" : "en-cours";
          }
          setStatutsMatieres(statutsMap);
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
          <span className="breadcrumb-active">4ème</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🚀</div>
        <h1 className="cours-hero-title">4ème</h1>
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
              m.dispo && router.push(`/cours/college/4eme/${m.id}`)
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
            {estConnecte && !chargement && statutsMatieres[m.id] && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.2rem",
                }}
              >
                {statutsMatieres[m.id] === "valide" ? "✅" : "🟡"}
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

        {/* Carte Atelier IA — même paddingTop que les autres cartes */}
        <div
          className="theme-card"
          onClick={() => router.push("/atelier-ia/4eme")}
          style={
            {
              "--card-color": "#f59e0b",
              position: "relative",
              cursor: "pointer",
              paddingTop: "44px",
            } as React.CSSProperties
          }
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(245,158,11,0.2)",
              border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: "0.65rem",
              color: "#fcd34d",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            NOUVEAU
          </div>
          <div className="theme-emoji">🤖</div>
          <div className="theme-label">Atelier IA</div>
          <div className="theme-desc">
            Découvre l&apos;IA et deviens détective de ses biais !
          </div>
          <div className="theme-arrow" style={{ color: "#f59e0b" }}>
            Commencer →
          </div>
        </div>
      </div>
    </div>
  );
}
