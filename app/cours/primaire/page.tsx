"use client";

import { getClassesDebloquees, ORDRE_CLASSES } from "@/lib/scores";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [classesDebloquees, setClassesDebloquees] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const init = async () => {
      const [
        {
          data: { user },
        },
        debloquees,
      ] = await Promise.all([supabase.auth.getUser(), getClassesDebloquees()]);

      if (user) {
        setEstConnecte(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("classe, role")
          .eq("id", user.id)
          .single();

        if (profile?.classe) setMaClasse(profile.classe);
        if (profile?.role === "admin") setIsAdmin(true);
        if (profile?.role !== "admin") setClassesDebloquees(debloquees);
      }
      setChargement(false);
    };
    init();
  }, []);

  const getStatutClasse = (id: string) => {
    if (isAdmin) return "admin";
    if (!estConnecte) return "decouverte"; // non connecté = accès découverte
    if (maClasse === null) return "bloquee";

    const indexMaClasse = ORDRE_CLASSES.indexOf(maClasse);
    const indexClasse = ORDRE_CLASSES.indexOf(id);

    if (id === maClasse) return "ma-classe";
    if (indexClasse < indexMaClasse) return "inferieure";
    if (classesDebloquees.has(maClasse) && indexClasse === indexMaClasse + 1)
      return "debloquee";
    return "bloquee";
  };

  const handleClick = (id: string) => {
    if (chargement) return;
    const statut = getStatutClasse(id);
    if (statut === "bloquee") return;
    router.push(`/cours/primaire/${id}`);
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
        <p className="cours-hero-desc">
          {estConnecte
            ? "Choisis ta classe pour commencer !"
            : "Mode découverte — 5 questions par thème"}
        </p>
      </div>

      {/* Bandeau mode découverte */}
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
        {classes.map((c) => {
          const statut = getStatutClasse(c.id);
          const estBloquee = statut === "bloquee";
          const estMaClasse = statut === "ma-classe";
          const estDebloquee = statut === "debloquee";
          const estInferieure = statut === "inferieure";
          const estDecouverte = statut === "decouverte";

          return (
            <div
              key={c.id}
              className="theme-card"
              onClick={() => handleClick(c.id)}
              style={
                {
                  "--card-color": estBloquee ? "#888" : c.color,
                  position: "relative",
                  opacity: estBloquee ? 0.75 : 1,
                  filter: estBloquee
                    ? "grayscale(30%) brightness(0.85)"
                    : "none",
                  boxShadow: estMaClasse
                    ? `0 0 24px ${c.color}55`
                    : estDebloquee
                      ? "0 0 20px #2ec4b655"
                      : "none",
                  border: estMaClasse
                    ? `2px solid ${c.color}`
                    : estDebloquee
                      ? "2px solid #2ec4b6"
                      : "2px solid rgba(255,255,255,0.06)",
                  cursor: chargement || estBloquee ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  paddingTop: "44px",
                } as React.CSSProperties
              }
            >
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
                    boxShadow: `0 4px 14px ${c.color}88`,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ Ma classe
                </div>
              )}
              {estInferieure && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#ccc",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  📖 Révision
                </div>
              )}
              {estDebloquee && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(46,196,182,0.15)",
                    color: "#2ec4b6",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid #2ec4b6",
                    whiteSpace: "nowrap",
                  }}
                >
                  🏆 Débloquée !
                </div>
              )}
              {estBloquee && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(255,255,255,0.07)",
                    color: "#999",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔒 Verrouillée
                </div>
              )}
              {estDecouverte && (
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
              {statut === "admin" && (
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

              <div className="theme-emoji">{c.emoji}</div>
              <div
                className="theme-label"
                style={{ color: estBloquee ? "#aaa" : "#fff" }}
              >
                {c.label}
              </div>
              <div
                className="theme-desc"
                style={{ color: estBloquee ? "#888" : "#aaa" }}
              >
                {c.desc}
              </div>
              {estMaClasse && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    marginTop: "4px",
                    marginBottom: "4px",
                  }}
                >
                  Moyenne bilans ≥ 16/20 pour débloquer la suite
                </div>
              )}
              {estDecouverte && (
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
                style={{
                  color: estBloquee
                    ? "#888"
                    : estDebloquee
                      ? "#2ec4b6"
                      : estInferieure
                        ? "#ccc"
                        : estDecouverte
                          ? "#4f8ef7"
                          : c.color,
                }}
              >
                {estBloquee
                  ? "🔒"
                  : estDebloquee
                    ? "Accéder → 🏆"
                    : "Accéder →"}
              </div>
            </div>
          );
        })}
      </div>

      {classesDebloquees.has("cm2") && (
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "24px",
            background: "rgba(46,196,182,0.1)",
            borderRadius: "16px",
            border: "1px solid #2ec4b6",
          }}
        >
          <div style={{ fontSize: "2rem" }}>🎓</div>
          <div
            style={{
              color: "#2ec4b6",
              fontWeight: 800,
              fontSize: "1.1rem",
              marginTop: "8px",
            }}
          >
            Félicitations ! Tu as terminé tout le primaire !
          </div>
          <div style={{ color: "#aaa", fontSize: "0.9rem", marginTop: "4px" }}>
            Tu es prêt(e) pour le collège 🚀
          </div>
        </div>
      )}
    </div>
  );
}
