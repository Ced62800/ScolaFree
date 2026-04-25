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
  },
  {
    id: "maths",
    label: "Mathématiques",
    emoji: "🔢",
    color: "#2ec4b6",
    desc: "Opérations, fractions, géométrie et mesures",
  },
  {
    id: "anglais",
    label: "Anglais",
    emoji: (<img src="https://flagcdn.com/w40/gb.png" alt="UK" style={{ width: "28px", verticalAlign: "middle", borderRadius: "3px" }} />),
    color: "#ffd166",
    desc: "Vocabulaire, expressions et phrases en anglais",
  },
];

export default function Ce2Page() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [statutsMatieres, setStatutsMatieres] = useState<Record<string, "valide" | "en-cours">>({});

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
          .eq("classe", "ce2")
          .in("theme", ["bilan", "bilan-2"])
          .order("score", { ascending: false });
        if (data) {
          const parMatiere: Record<string, { score: number; total: number }[]> = {};
          for (const s of data) {
            if (!parMatiere[s.matiere]) parMatiere[s.matiere] = [];
            parMatiere[s.matiere].push(s);
          }
          const statutsMap: Record<string, "valide" | "en-cours"> = {};
          for (const [matiere, scores] of Object.entries(parMatiere)) {
            const meilleur = scores.reduce((best, s) =>
              s.score / s.total > best.score / best.total ? s : best
            );
            statutsMap[matiere] = meilleur.score / meilleur.total >= 0.8 ? "valide" : "en-cours";
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
        <button className="cours-back" onClick={() => router.push("/cours/primaire")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Primaire</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">CE2</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🌳</div>
        <h1 className="cours-hero-title">CE2</h1>
        <p className="cours-hero-desc">Cours Élémentaire 2 · 8 ans</p>
      </div>

      <div className="themes-grid" style={{ opacity: chargement ? 0.3 : 1, transition: "opacity 0.3s" }}>
        {matieres.map((m) => (
          <div
            key={m.id}
            className="theme-card"
            onClick={() => router.push(`/cours/primaire/ce2/${m.id}`)}
            style={{ "--card-color": m.color, position: "relative" } as React.CSSProperties}
          >
            {estConnecte && !chargement && statutsMatieres[m.id] && (
              <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "1.2rem" }}>
                {statutsMatieres[m.id] === "valide" ? "✅" : "🟡"}
              </div>
            )}
            <div className="theme-emoji">{m.emoji}</div>
            <div className="theme-label">{m.label}</div>
            <div className="theme-desc">{m.desc}</div>
            <div className="theme-arrow" style={{ color: m.color }}>Commencer →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
