"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const classes = [
  {
    id: "cp",
    label: "CP",
    emoji: "🌱",
    color: "#4f8ef7",
    desc: "Cours Préparatoire · 6 ans",
  },
  {
    id: "ce1",
    label: "CE1",
    emoji: "🌿",
    color: "#2ec4b6",
    desc: "Cours Élémentaire 1 · 7 ans",
  },
  {
    id: "ce2",
    label: "CE2",
    emoji: "🌳",
    color: "#ffd166",
    desc: "Cours Élémentaire 2 · 8 ans",
  },
  {
    id: "cm1",
    label: "CM1",
    emoji: "⭐",
    color: "#ff6b6b",
    desc: "Cours Moyen 1 · 9 ans",
  },
  {
    id: "cm2",
    label: "CM2",
    emoji: "🚀",
    color: "#a78bfa",
    desc: "Cours Moyen 2 · 10 ans",
  },
];

export default function PrimairePage() {
  const router = useRouter();
  const [maClasse, setMaClasse] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const getClasse = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("classe")
          .eq("id", user.id)
          .single();
        if (profile?.classe) setMaClasse(profile.classe);
      }
      setChargement(false); // chargement terminé dans tous les cas
    };
    getClasse();
  }, []);

  const handleClick = (id: string) => {
    // Bloqué pendant le chargement
    if (chargement) return;
    // Si pas connecté → accès libre
    // Si connecté → seulement sa classe
    if (maClasse === null || maClasse === id) {
      router.push(`/cours/primaire/${id}`);
    }
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Accueil</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Primaire</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🏫</div>
        <h1 className="cours-hero-title">École Primaire</h1>
        <p className="cours-hero-desc">Choisis ta classe pour commencer !</p>
      </div>

      {/* Pendant le chargement toutes les cartes sont grises */}
      <div
        className="themes-grid"
        style={{ opacity: chargement ? 0.3 : 1, transition: "opacity 0.3s" }}
      >
        {classes.map((c) => {
          const estMaClasse = !chargement && maClasse === c.id;
          const estBloquee = !chargement && maClasse !== null && !estMaClasse;

          return (
            <div
              key={c.id}
              className="theme-card"
              onClick={() => handleClick(c.id)}
              style={
                {
                  "--card-color": estMaClasse ? c.color : "#444",
                  position: "relative",
                  filter: estBloquee
                    ? "grayscale(80%) brightness(0.4)"
                    : "none",
                  boxShadow: estMaClasse ? `0 0 24px ${c.color}55` : "none",
                  border: estMaClasse
                    ? `2px solid ${c.color}`
                    : "2px solid rgba(255,255,255,0.06)",
                  cursor: chargement || estBloquee ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                } as React.CSSProperties
              }
            >
              {estMaClasse && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "-8px",
                    background: c.color,
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "5px 12px",
                    borderRadius: "20px",
                    boxShadow: `0 4px 14px ${c.color}88`,
                  }}
                >
                  ⭐ Ma classe
                </div>
              )}

              {estBloquee && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "-8px",
                    background: "rgba(255,255,255,0.08)",
                    color: "#666",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  🔒 Autre classe
                </div>
              )}

              <div className="theme-emoji">{c.emoji}</div>
              <div
                className="theme-label"
                style={{ color: estBloquee ? "#555" : "#fff" }}
              >
                {c.label}
              </div>
              <div
                className="theme-desc"
                style={{ color: estBloquee ? "#444" : "#aaa" }}
              >
                {c.desc}
              </div>
              <div
                className="theme-arrow"
                style={{ color: estMaClasse ? c.color : "#555" }}
              >
                {estMaClasse ? "Accéder →" : estBloquee ? "🔒" : "Choisir →"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
