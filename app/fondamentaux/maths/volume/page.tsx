"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "Cube de côté 3 cm. Volume = ?",
    reponse: "27 cm³",
    explication: "Cube : V = côté × côté × côté = 3×3×3 = 27 cm³ ✅",
  },
  {
    id: 2,
    phrase: "Pavé droit 4cm × 3cm × 2cm. Volume = ?",
    reponse: "24 cm³",
    explication: "Pavé : V = longueur × largeur × hauteur = 4×3×2 = 24 cm³ ✅",
  },
  {
    id: 3,
    phrase: "Cube de côté 5 cm. Volume = ?",
    reponse: "125 cm³",
    explication: "Cube : V = 5×5×5 = 125 cm³ ✅",
  },
  {
    id: 4,
    phrase: "Pavé droit 6cm × 4cm × 3cm. Volume = ?",
    reponse: "72 cm³",
    explication: "Pavé : V = 6×4×3 = 72 cm³ ✅",
  },
  {
    id: 5,
    phrase: "Cube de côté 2 cm. Volume = ?",
    reponse: "8 cm³",
    explication: "Cube : V = 2×2×2 = 8 cm³ ✅",
  },
  {
    id: 6,
    phrase: "Pavé droit 5cm × 5cm × 4cm. Volume = ?",
    reponse: "100 cm³",
    explication: "Pavé : V = 5×5×4 = 100 cm³ ✅",
  },
  {
    id: 7,
    phrase: "Cube de côté 4 cm. Volume = ?",
    reponse: "64 cm³",
    explication: "Cube : V = 4×4×4 = 64 cm³ ✅",
  },
  {
    id: 8,
    phrase: "Pavé droit 10cm × 5cm × 2cm. Volume = ?",
    reponse: "100 cm³",
    explication: "Pavé : V = 10×5×2 = 100 cm³ ✅",
  },
  {
    id: 9,
    phrase: "Cube de côté 6 cm. Volume = ?",
    reponse: "216 cm³",
    explication: "Cube : V = 6×6×6 = 216 cm³ ✅",
  },
  {
    id: 10,
    phrase: "Pavé droit 8cm × 3cm × 2cm. Volume = ?",
    reponse: "48 cm³",
    explication: "Pavé : V = 8×3×2 = 48 cm³ ✅",
  },
  {
    id: 11,
    phrase: "Cube de côté 1 cm. Volume = ?",
    reponse: "1 cm³",
    explication: "Cube : V = 1×1×1 = 1 cm³ ✅",
  },
  {
    id: 12,
    phrase: "Pavé droit 7cm × 4cm × 3cm. Volume = ?",
    reponse: "84 cm³",
    explication: "Pavé : V = 7×4×3 = 84 cm³ ✅",
  },
];

function melangerTableau<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const getChoix = (id: number, reponse: string): string[] => {
  const choixMap: Record<number, string[]> = {
    1: ["18 cm³", "27 cm³", "36 cm³"],
    2: ["18 cm³", "24 cm³", "30 cm³"],
    3: ["100 cm³", "125 cm³", "150 cm³"],
    4: ["60 cm³", "72 cm³", "84 cm³"],
    5: ["6 cm³", "8 cm³", "10 cm³"],
    6: ["80 cm³", "100 cm³", "120 cm³"],
    7: ["48 cm³", "64 cm³", "80 cm³"],
    8: ["80 cm³", "100 cm³", "120 cm³"],
    9: ["196 cm³", "216 cm³", "236 cm³"],
    10: ["36 cm³", "48 cm³", "60 cm³"],
    11: ["1 cm³", "2 cm³", "3 cm³"],
    12: ["72 cm³", "84 cm³", "96 cm³"],
  };
  return (choixMap[id] ?? [reponse]).sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheVolume() {
  const { estConnecte, maxQuestions } = useDecouverte();
  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);

  const [questions, setQuestions] = useState<typeof TOUTES_LES_QUESTIONS>([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [etat, setEtat] = useState<EtatQuestion>("attente");
  const [choixFait, setChoixFait] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [ancienScore, setAncienScore] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const scoreSaved = useRef(false);

  useEffect(() => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "maths")
        .eq("theme", "volume")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setAncienScore(data.score);
    };
    init();
  }, []);

  useEffect(() => {
    if (!termine || scoreSaved.current || !estConnecte) return;
    scoreSaved.current = true;
    const sauvegarder = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      const { data: existing } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", user.id)
        .eq("classe", "fondamentaux")
        .eq("matiere", "maths")
        .eq("theme", "volume")
        .single();
      if (existing?.id) {
        await supabase
          .from("scores")
          .update({
            score,
            total: NB_QUESTIONS,
            created_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("scores")
          .insert({
            user_id: user.id,
            classe: "fondamentaux",
            matiere: "maths",
            theme: "volume",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
  if (!question) return null;
  const choixActuels = getChoix(question.id, question.reponse);

  const repondre = (choix: string) => {
    if (etat !== "attente") return;
    setChoixFait(choix);
    if (choix === question.reponse) {
      setEtat("correct");
      setScore((s) => s + 1);
    } else {
      setEtat("incorrect");
    }
  };

  const suivant = () => {
    if (indexActuel + 1 >= nbQuestions) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      setTermine(true);
    } else {
      setIndexActuel((i) => i + 1);
      setEtat("attente");
      setChoixFait(null);
    }
  };

  const recommencer = () => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
    setIndexActuel(0);
    setEtat("attente");
    setChoixFait(null);
    setScore(0);
    setTermine(false);
    scoreSaved.current = false;
    setShowPopup(false);
  };

  if (termine) {
    const pourcentage = Math.round((score / NB_QUESTIONS) * 100);
    const couleur =
      pourcentage >= 80 ? "#2ec4b6" : pourcentage >= 50 ? "#ffd166" : "#ff6b6b";
    const emoji = pourcentage >= 80 ? "🎉" : pourcentage >= 50 ? "💪" : "📖";
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0f23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            padding: "40px 28px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            border: `2px solid ${couleur}40`,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{emoji}</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            Exercice terminé !
          </h2>
          <div
            style={{
              fontSize: "2.8rem",
              fontWeight: 900,
              color: couleur,
              margin: "16px 0",
            }}
          >
            {score}/{NB_QUESTIONS}
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
            {pourcentage >= 80
              ? "Bravo ! Tu calcules les volumes !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : L × l × h."
                : "Relis les formules et réessaie !"}
          </p>
          {ancienScore !== null && (
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.85rem",
                marginBottom: "20px",
              }}
            >
              Score précédent : {ancienScore}/{NB_QUESTIONS}
            </p>
          )}
          {!estConnecte && (
            <p
              style={{
                color: "#ffd166",
                fontSize: "0.8rem",
                marginBottom: "16px",
              }}
            >
              💡{" "}
              <Link href="/connexion" style={{ color: "#ffd166" }}>
                Connecte-toi
              </Link>{" "}
              pour sauvegarder ton score
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={recommencer}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                border: "none",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔄 Recommencer
            </button>
            <Link
              href="/fondamentaux/maths"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              ← Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f23",
        padding: "80px 20px 16px 20px",
      }}
    >
      {showPopup && <PopupInscription onRecommencer={recommencer} />}
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <Link
          href="/fondamentaux/maths"
          style={{
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
          }}
        >
          ← Retour
        </Link>

        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h1
            style={{
              color: "#4f8ef7",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            📦 Volume des solides
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            L&apos;espace occupé par un solide en 3D
          </p>
        </div>

        <div
          style={{
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#4f8ef7",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            💡 Les formules à retenir
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* CUBE */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                padding: "14px 12px",
                flex: 1,
                minWidth: "150px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#ffd166",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                côté
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  c
                </span>
                <div
                  style={{
                    position: "relative",
                    width: "64px",
                    height: "64px",
                  }}
                >
                  {/* Face avant */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "50px",
                      height: "50px",
                      border: "3px solid #4f8ef7",
                      borderRadius: "2px",
                      background: "rgba(79,142,247,0.15)",
                    }}
                  />
                  {/* Décalage 3D */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      width: "50px",
                      height: "50px",
                      border: "3px solid rgba(79,142,247,0.4)",
                      borderRadius: "2px",
                    }}
                  />
                  {/* Lignes de profondeur */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50px",
                      left: "0px",
                      width: "12px",
                      height: "2px",
                      background: "rgba(79,142,247,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50px",
                      left: "50px",
                      width: "12px",
                      height: "2px",
                      background: "rgba(79,142,247,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0px",
                      left: "50px",
                      width: "12px",
                      height: "2px",
                      background: "rgba(79,142,247,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  c
                </span>
              </div>
              <div
                style={{
                  color: "#ffd166",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginTop: "8px",
                  marginBottom: "10px",
                }}
              >
                côté
              </div>
              <div
                style={{
                  color: "#4f8ef7",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                }}
              >
                CUBE
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                V = <span style={{ color: "#ffd166" }}>c × c × c</span>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.72rem",
                  marginTop: "3px",
                }}
              >
                ex: 3×3×3 = 27 cm³
              </div>
            </div>

            {/* PAVÉ DROIT */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                padding: "14px 12px",
                flex: 1,
                minWidth: "150px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#ffd166",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Longueur (L)
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    color: "#2ec4b6",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  l
                </span>
                <div
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "64px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "65px",
                      height: "40px",
                      border: "3px solid #2ec4b6",
                      borderRadius: "2px",
                      background: "rgba(46,196,182,0.15)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "14px",
                      width: "65px",
                      height: "40px",
                      border: "3px solid rgba(46,196,182,0.4)",
                      borderRadius: "2px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "40px",
                      left: "0",
                      width: "14px",
                      height: "2px",
                      background: "rgba(46,196,182,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "40px",
                      left: "65px",
                      width: "14px",
                      height: "2px",
                      background: "rgba(46,196,182,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "65px",
                      width: "14px",
                      height: "2px",
                      background: "rgba(46,196,182,0.4)",
                      transform: "rotate(-45deg)",
                      transformOrigin: "left center",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "-6px",
                      top: "20px",
                      color: "#a78bfa",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    h
                  </span>
                </div>
              </div>
              <div
                style={{
                  color: "#ffd166",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginTop: "24px",
                  marginBottom: "10px",
                }}
              >
                Longueur (L)
              </div>
              <div
                style={{
                  color: "#2ec4b6",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                }}
              >
                PAVÉ DROIT
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                V = <span style={{ color: "#ffd166" }}>L × l × h</span>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.72rem",
                  marginTop: "3px",
                }}
              >
                ex: 4×3×2 = 24 cm³
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "8px 12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.78rem",
                margin: 0,
              }}
            >
              📦 Le volume = la quantité d&apos;eau qu&apos;on peut mettre dans
              la boîte ! L&apos;unité est le{" "}
              <strong style={{ color: "#4f8ef7" }}>cm³</strong>
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Question {indexActuel + 1}/{nbQuestions}
          </span>
          <span
            style={{ color: "#4f8ef7", fontWeight: 700, fontSize: "0.85rem" }}
          >
            Score : {score}
          </span>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "6px",
            height: "6px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #4f8ef7, #2ec4b6)",
              height: "100%",
              width: `${(indexActuel / nbQuestions) * 100}%`,
              transition: "width 0.3s",
              borderRadius: "6px",
            }}
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px 16px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 700,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {question.phrase}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {choixActuels.map((choix) => {
            let bg = "rgba(255,255,255,0.07)";
            let border = "rgba(255,255,255,0.15)";
            let couleurTexte = "#fff";
            if (etat !== "attente" && choix === question.reponse) {
              bg = "rgba(46,196,182,0.2)";
              border = "#2ec4b6";
              couleurTexte = "#2ec4b6";
            } else if (
              etat !== "attente" &&
              choix === choixFait &&
              choix !== question.reponse
            ) {
              bg = "rgba(255,107,107,0.2)";
              border = "#ff6b6b";
              couleurTexte = "#ff6b6b";
            }
            return (
              <button
                key={choix}
                onClick={() => repondre(choix)}
                disabled={etat !== "attente"}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  color: couleurTexte,
                  padding: "10px 24px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: etat === "attente" ? "pointer" : "default",
                  transition: "all 0.2s",
                  minWidth: "110px",
                }}
              >
                {choix}
              </button>
            );
          })}
        </div>

        {etat !== "attente" && (
          <div
            style={{
              background:
                etat === "correct"
                  ? "rgba(46,196,182,0.1)"
                  : "rgba(255,107,107,0.1)",
              border: `1px solid ${etat === "correct" ? "#2ec4b6" : "#ff6b6b"}40`,
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "14px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: etat === "correct" ? "#2ec4b6" : "#ff6b6b",
                fontWeight: 700,
                marginBottom: "4px",
                fontSize: "0.95rem",
              }}
            >
              {etat === "correct"
                ? "✅ Bonne réponse !"
                : "❌ Pas tout à fait..."}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              {question.explication}
            </p>
          </div>
        )}

        {etat !== "attente" && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={suivant}
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                border: "none",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {indexActuel + 1 >= nbQuestions
                ? "Voir mon score"
                : "Question suivante →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
