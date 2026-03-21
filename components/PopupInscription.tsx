"use client";

import { useRouter } from "next/navigation";

export default function PopupInscription({
  onRecommencer,
}: {
  onRecommencer: () => void;
}) {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "1px solid rgba(79,142,247,0.3)",
          borderRadius: "24px",
          padding: "40px 32px",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          Tu as terminé la démo !
        </h2>
        <p
          style={{
            color: "#aaa",
            fontSize: "1rem",
            lineHeight: "1.6",
            marginBottom: "8px",
          }}
        >
          Tu viens de faire{" "}
          <strong style={{ color: "#4f8ef7" }}>5 questions</strong> en mode
          découverte.
        </p>
        <p
          style={{
            color: "#aaa",
            fontSize: "1rem",
            lineHeight: "1.6",
            marginBottom: "28px",
          }}
        >
          Inscris-toi <strong style={{ color: "#fff" }}>gratuitement</strong>{" "}
          pour accéder à tous les exercices et sauvegarder tes scores !
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "16px 32px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(79,142,247,0.4)",
            }}
          >
            ✨ S'inscrire gratuitement →
          </button>

          <button
            onClick={() => router.push("/connexion")}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "14px 32px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
            }}
          >
            J'ai déjà un compte — Se connecter
          </button>

          <button
            onClick={onRecommencer}
            style={{
              background: "transparent",
              color: "#aaa",
              fontWeight: 500,
              fontSize: "0.9rem",
              padding: "10px",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            🔄 Recommencer la démo
          </button>
        </div>

        <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "20px" }}>
          100% gratuit · Aucune carte requise · Pour toujours
        </p>
      </div>
    </div>
  );
}
