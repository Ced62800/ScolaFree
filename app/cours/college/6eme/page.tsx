"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "la-phrase",
    label: "La phrase",
    emoji: "✏️",
    desc: "Types et formes de phrases, sujet, ponctuation",
    color: "#4f8ef7",
    dispo: true,
  },
  {
    id: "classes-de-mots",
    label: "Les classes de mots",
    emoji: "📝",
    desc: "Nom, verbe, adjectif, déterminant, pronom...",
    color: "#2ec4b6",
    dispo: true,
  },
  {
    id: "groupe-nominal",
    label: "Le groupe nominal",
    emoji: "🔤",
    desc: "Construction et accords du groupe nominal",
    color: "#ffd166",
    dispo: true,
  },
  {
    id: "present-indicatif",
    label: "Le présent de l'indicatif",
    emoji: "⏱️",
    desc: "Conjugaison au présent — tous les groupes",
    color: "#ff6b6b",
    dispo: true,
  },
];

export default function Francais6emePage() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      setPret(true);
    };
    check();
  }, []);

  const handleBilan = () => {
    if (!estConnecte) {
      router.push("/inscription");
      return;
    }
    router.push("/cours/college/6eme/francais/bilan");
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/college/6eme")}
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
          <span
            onClick={() => router.push("/cours/college/6eme")}
            style={{ cursor: "pointer" }}
          >
            6ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Français</span>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Français — 6ème
        </h1>
        <p style={{ color: "#aaa", fontSize: "0.95rem" }}>
          {estConnecte
            ? "Programme officiel — Partie 1"
            : "Mode découverte — 5 questions par thème"}
        </p>
      </div>

      {/* Bandeau mode découverte */}
      {pret && !estConnecte && (
        <div
          style={{
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "24px",
            fontSize: "0.9rem",
            color: "#ccc",
            textAlign: "center",
          }}
        >
          📖 Tu explores en mode découverte.{" "}
          <span
            onClick={() => router.push("/inscription")}
            style={{
              color: "#4f8ef7",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Inscris-toi gratuitement
          </span>{" "}
          pour accéder à tous les exercices !
        </div>
      )}

      {/* Grille des thèmes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {themes.map((t) => (
          <div
            key={t.id}
            onClick={() =>
              t.dispo && router.push(`/cours/college/6eme/francais/${t.id}`)
            }
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `2px solid ${t.color}`,
              borderRadius: "16px",
              padding: "20px",
              cursor: t.dispo ? "pointer" : "not-allowed",
              opacity: t.dispo ? 1 : 0.5,
              transition: "transform 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (t.dispo)
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
            }}
          >
            {/* Badge découverte */}
            {!estConnecte && pret && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(79,142,247,0.2)",
                  border: "1px solid rgba(79,142,247,0.4)",
                  borderRadius: "20px",
                  padding: "3px 12px",
                  fontSize: "0.75rem",
                  color: "#4f8ef7",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                📖 Découverte
              </div>
            )}
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "10px",
                marginTop: !estConnecte && pret ? "20px" : "0",
              }}
            >
              {t.emoji}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#fff",
                marginBottom: "6px",
              }}
            >
              {t.label}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#aaa",
                marginBottom: "12px",
              }}
            >
              {t.desc}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              {estConnecte ? "10 exercices" : "5 questions en découverte"}
            </div>
            {t.dispo && (
              <div
                style={{ color: t.color, fontWeight: 700, fontSize: "0.9rem" }}
              >
                Commencer →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bouton Bilan */}
      {pret && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={handleBilan}
            style={{
              background: estConnecte
                ? "linear-gradient(135deg, #f7974f, #f74f4f)"
                : "rgba(255,255,255,0.08)",
              border: "none",
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
            🎯 Bilan Final Français 6ème
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
              ? "Teste toutes tes connaissances de la Partie 1 en une seule fois !"
              : "🔒 Inscris-toi pour accéder au bilan"}
          </p>
        </div>
      )}

      {/* Bouton Page 2 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <button
          onClick={() => router.push("/cours/college/6eme/francais/page-2")}
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
          📚 Cours suivants — Partie 2 →
        </button>
      </div>
    </div>
  );
}
