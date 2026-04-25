"use client";

import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const matieres = [
  {
    id: "francais",
    label: "Français",
    emoji: "📖",
    color: "#4f8ef7",
    desc: "Grammaire, conjugaison, orthographe et vocabulaire",
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "🔢",
    color: "#2ec4b6",
    desc: "Fractions, décimaux, statistiques et géométrie",
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
  },
];

export default function CM2Page() {
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
          .eq("classe", "cm2")
          .in("theme", ["bilan", "bilan-2"])
          .order("score", { ascending: false });
        if (data) {
          const parMatiere: Record<string, { score: number; total: number }[]> =
            {};
          for (const s of data) {
            if (!parMatiere[s.matiere]) parMatiere[s.matiere] = [];
            parMatiere[s.matiere].push(s);
          }
          const statutsMap: Record<string, "valide" | "en-cours"> = {};
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
          onClick={() => router.push("/cours/primaire")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">CM2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🚀</div>
        <h1 className="cours-hero-title">CM2</h1>
        <p className="cours-hero-desc">Cours Moyen 2 · 10 ans</p>
      </div>

      <div
        className="themes-grid"
        style={{ opacity: chargement ? 0.3 : 1, transition: "opacity 0.3s" }}
      >
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/cm2/${m.id}`)}
            style={
              {
                "--card-color": m.color,
                position: "relative",
              } as React.CSSProperties
            }
          >
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
            <div className="theme-arrow" style={{ color: m.color }}>
              Commencer →
            </div>
          </div>
        ))}

        {/* Carte Atelier IA */}
        <Link href="/atelier-ia/cm2" style={{ textDecoration: "none" }}>
          <div
            className="theme-card"
            style={
              {
                "--card-color": "#a855f7",
                position: "relative",
              } as React.CSSProperties
            }
          >
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(168,85,247,0.2)",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: 20,
                padding: "2px 8px",
                fontSize: "0.65rem",
                color: "#d8b4fe",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              NOUVEAU
            </div>
            <div className="theme-emoji">🤖</div>
            <div className="theme-label">Atelier IA</div>
            <div className="theme-desc">
              Découvre l&apos;intelligence artificielle et fais ta première
              mission !
            </div>
            <div className="theme-arrow" style={{ color: "#a855f7" }}>
              Commencer →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
