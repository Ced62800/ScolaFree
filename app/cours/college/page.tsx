"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const classes = [
  {
    id: "6eme",
    label: "6ème",
    emoji: "🌱",
    color: "#4f8ef7",
    desc: "Sixième · 11 ans",
    dispo: true,
  },
  {
    id: "5eme",
    label: "5ème",
    emoji: "🌿",
    color: "#2ec4b6",
    desc: "Cinquième · 12 ans",
    dispo: true,
  },
  {
    id: "4eme",
    label: "4ème",
    emoji: "🌳",
    color: "#ffd166",
    desc: "Quatrième · 13 ans",
    dispo: true,
  },
  {
    id: "3eme",
    label: "3ème",
    emoji: "🚀",
    color: "#ff6b6b",
    desc: "Troisième · 14 ans",
    dispo: true,
  },
];

export default function CollegePage() {
  const router = useRouter();
  const [maClasse, setMaClasse] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEstConnecte(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("classe, role")
          .eq("id", user.id)
          .single();
        if (profile?.classe) setMaClasse(profile.classe);
        if (profile?.role === "admin") setIsAdmin(true);
      }
      setChargement(false);
    };
    init();
  }, []);

  const handleClick = (id: string, dispo: boolean = true) => {
    if (!dispo) return;
    router.push(`/cours/college/${id}`);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.push("/cours")}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Accueil</span>
          <span className="breadcrumb-sep">›</span>
          <span
            onClick={() => router.push("/cours")}
            style={{ cursor: "pointer" }}
          >
            Cours
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Collège</span>
        </div>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎒</div>
        <h1 className="cours-hero-title">Collège</h1>
        <p className="cours-hero-desc">
          {estConnecte
            ? "Choisis ta classe pour commencer !"
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

      <div className="themes-grid" style={{ justifyContent: "center" }}>
        {classes.map((c) => {
          const dispo = c.dispo !== false;
          const estMaClasse = maClasse === c.id;
          return (
            <div
              key={c.id}
              className="theme-card"
              onClick={() => handleClick(c.id, dispo)}
              style={
                {
                  "--card-color": dispo ? c.color : "#888",
                  opacity: dispo ? 1 : 0.5,
                  cursor: dispo ? "pointer" : "not-allowed",
                  border: estMaClasse
                    ? `2px solid ${c.color}`
                    : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: estMaClasse ? `0 0 24px ${c.color}55` : "none",
                  paddingTop: "44px",
                  position: "relative",
                } as React.CSSProperties
              }
            >
              {/* Badge Ma classe */}
              {estMaClasse && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: c.color,
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ Ma classe
                </div>
              )}

              {/* Badge Admin */}
              {isAdmin && !estMaClasse && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(255,209,102,0.15)",
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,209,102,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚙️ Admin
                </div>
              )}

              {/* Badge Découverte si non connecté */}
              {!estConnecte && !chargement && dispo && (
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

              <div className="theme-emoji">{c.emoji}</div>
              <div className="theme-label">{c.label}</div>
              <div className="theme-desc">{c.desc}</div>
              {!estConnecte && !chargement && dispo && (
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
                style={{ color: dispo ? c.color : "#888" }}
              >
                {dispo ? "Accéder →" : "🔒 Bientôt"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
