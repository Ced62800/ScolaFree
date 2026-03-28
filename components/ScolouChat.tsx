"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ROBOT_URL =
  "https://akdvjkvdaggjpbfgscko.supabase.co/storage/v1/object/public/assets/Logo-Robot-sans_fond.png";

function formatReponse(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function ScolouChat() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [lien, setLien] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prenom, setPrenom] = useState<string | null>(null);
  const [classe, setClasse] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [salutation, setSalutation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfil = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, classe")
          .eq("id", user.id)
          .single();
        if (profile) {
          setPrenom(profile.prenom);
          setClasse(profile.classe);
          setSalutation(
            `Salut ${profile.prenom} ! 👋 Je suis Scolou, ton assistant scolaire. Tu as droit à 2 questions par jour. Pose-moi tes questions en Français, Maths ou Anglais !`,
          );
        }
      } else {
        setSalutation("");
      }
    };
    loadProfil();
  }, []);

  useEffect(() => {
    if (ouvert && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [ouvert]);

  const handleEnvoyer = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setReponse("");
    setLien(null);
    setErreur(null);

    try {
      const res = await fetch("/api/scolou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, prenom, classe, userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error || "Une erreur est survenue.");
      } else {
        setReponse(data.reponse || "Désolé, je n'ai pas pu répondre.");
        setLien(data.lien || null);
      }
    } catch {
      setErreur("Oups ! Une erreur est survenue. Réessaie !");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setQuestion("");
    setReponse("");
    setLien(null);
    setErreur(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <>
      {/* Bouton flottant */}
      <div
        style={{
          position: "fixed",
          bottom: "40px",
          right: "24px",
          zIndex: 9999,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setOuvert(!ouvert)}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Demande à Scolou"
        >
          {ouvert ? (
            <span style={{ fontSize: "1.8rem", color: "#fff" }}>✕</span>
          ) : (
            <img
              src={ROBOT_URL}
              alt="Scolou"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          )}
        </button>
        <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "4px" }}>
          Demande à Scolou
        </div>
      </div>

      {/* Fenêtre de chat */}
      {ouvert && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            maxHeight: "80vh",
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            border: "1px solid rgba(0,180,200,0.3)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 9998,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #0d1f3c, #1a2a4a)",
              borderTop: "3px solid #00b4c8",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <img
              src={ROBOT_URL}
              alt="Scolou"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
                Scolou
              </div>
              <div
                style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}
              >
                Ton assistant scolaire IA
              </div>
            </div>
          </div>

          {/* Corps scrollable */}
          <div style={{ padding: "16px 20px", flex: 1, overflowY: "auto" }}>
            {/* Non connecté */}
            {!userId && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔒</div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "8px",
                    fontSize: "1rem",
                  }}
                >
                  Scolou est réservé aux inscrits
                </div>
                <p
                  style={{
                    color: "#aaa",
                    fontSize: "0.85rem",
                    marginBottom: "16px",
                    lineHeight: "1.5",
                  }}
                >
                  Crée un compte gratuit pour poser jusqu'à 2 questions par jour
                  à Scolou !
                </p>
                <button
                  onClick={() => {
                    setOuvert(false);
                    router.push("/inscription");
                  }}
                  style={{
                    background: "linear-gradient(135deg, #00b4c8, #008fa0)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    marginBottom: "8px",
                    width: "100%",
                  }}
                >
                  ✨ S'inscrire gratuitement →
                </button>
                <button
                  onClick={() => {
                    setOuvert(false);
                    router.push("/connexion");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#aaa",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 24px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  J'ai déjà un compte
                </button>
              </div>
            )}

            {/* Connecté */}
            {userId && (
              <>
                {/* Salutation */}
                {!reponse && !loading && !erreur && (
                  <div
                    style={{
                      background: "rgba(0,180,200,0.1)",
                      border: "1px solid rgba(0,180,200,0.2)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      fontSize: "0.9rem",
                      color: "#ccc",
                      marginBottom: "16px",
                      lineHeight: "1.5",
                    }}
                  >
                    {salutation || "Chargement..."}
                  </div>
                )}

                {/* Chargement */}
                {loading && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      fontSize: "0.9rem",
                      color: "#aaa",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    🤔 Scolou réfléchit...
                  </div>
                )}

                {/* Erreur */}
                {erreur && (
                  <div
                    style={{
                      background: "rgba(255,107,107,0.1)",
                      border: "1px solid rgba(255,107,107,0.3)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      fontSize: "0.9rem",
                      color: "#ff6b6b",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    {erreur}
                    <button
                      onClick={handleReset}
                      style={{
                        display: "block",
                        margin: "12px auto 0",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "8px 16px",
                        color: "#aaa",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      🔄 Réessayer
                    </button>
                  </div>
                )}

                {/* Réponse */}
                {reponse && (
                  <>
                    <div
                      style={{
                        background: "rgba(0,180,200,0.1)",
                        border: "1px solid rgba(0,180,200,0.2)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        fontSize: "0.9rem",
                        color: "#ddd",
                        marginBottom: "12px",
                        lineHeight: "1.7",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatReponse(reponse),
                      }}
                    />
                    {lien && (
                      <button
                        onClick={() => {
                          router.push(lien);
                          setOuvert(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background:
                            "linear-gradient(135deg, #00b4c8, #008fa0)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginBottom: "10px",
                          textAlign: "left",
                        }}
                      >
                        📚 Revoir le cours sur ScolaFree →
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#aaa",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        marginBottom: "12px",
                      }}
                    >
                      🔄 Nouvelle question
                    </button>
                  </>
                )}

                {/* Input */}
                {!reponse && !erreur && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEnvoyer()}
                      placeholder="Pose ta question..."
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={handleEnvoyer}
                      disabled={loading || !question.trim()}
                      style={{
                        padding: "10px 16px",
                        background: question.trim()
                          ? "linear-gradient(135deg, #00b4c8, #008fa0)"
                          : "rgba(255,255,255,0.1)",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        cursor: question.trim() ? "pointer" : "default",
                        fontSize: "1rem",
                        transition: "all 0.2s",
                      }}
                    >
                      {loading ? "..." : "→"}
                    </button>
                  </div>
                )}

                {/* Suggestions */}
                {!reponse && !loading && !erreur && (
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Exemples :
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {[
                        "Ça ou sa ?",
                        "Tables de 7",
                        "How to say 'chat' ?",
                        "C'est quoi un COD ?",
                      ].map((ex) => (
                        <button
                          key={ex}
                          onClick={() => setQuestion(ex)}
                          style={{
                            padding: "4px 10px",
                            background: "rgba(0,180,200,0.1)",
                            border: "1px solid rgba(0,180,200,0.2)",
                            borderRadius: "20px",
                            color: "#00b4c8",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "8px 20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              fontSize: "0.7rem",
              color: "#555",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            Scolou peut faire des erreurs — vérifie toujours avec ton prof !
          </div>
        </div>
      )}
    </>
  );
}
