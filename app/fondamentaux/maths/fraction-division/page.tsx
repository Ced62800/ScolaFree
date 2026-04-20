"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "1/2 ÷ 1/3 = ?",
    reponse: "3/2",
    explication:
      "On retourne 1/3 → 3/1 puis on multiplie : 1×3=3 et 2×1=2 → 3/2 ✅",
  },
  {
    id: 2,
    phrase: "2/3 ÷ 1/4 = ?",
    reponse: "8/3",
    explication:
      "On retourne 1/4 → 4/1 puis on multiplie : 2×4=8 et 3×1=3 → 8/3 ✅",
  },
  {
    id: 3,
    phrase: "3/4 ÷ 1/2 = ?",
    reponse: "6/4",
    explication:
      "On retourne 1/2 → 2/1 puis on multiplie : 3×2=6 et 4×1=4 → 6/4 ✅",
  },
  {
    id: 4,
    phrase: "1/3 ÷ 1/2 = ?",
    reponse: "2/3",
    explication:
      "On retourne 1/2 → 2/1 puis on multiplie : 1×2=2 et 3×1=3 → 2/3 ✅",
  },
  {
    id: 5,
    phrase: "2/5 ÷ 1/3 = ?",
    reponse: "6/5",
    explication:
      "On retourne 1/3 → 3/1 puis on multiplie : 2×3=6 et 5×1=5 → 6/5 ✅",
  },
  {
    id: 6,
    phrase: "1/2 ÷ 3/4 = ?",
    reponse: "4/6",
    explication:
      "On retourne 3/4 → 4/3 puis on multiplie : 1×4=4 et 2×3=6 → 4/6 ✅",
  },
  {
    id: 7,
    phrase: "3/5 ÷ 1/2 = ?",
    reponse: "6/5",
    explication:
      "On retourne 1/2 → 2/1 puis on multiplie : 3×2=6 et 5×1=5 → 6/5 ✅",
  },
  {
    id: 8,
    phrase: "2/3 ÷ 2/5 = ?",
    reponse: "10/6",
    explication:
      "On retourne 2/5 → 5/2 puis on multiplie : 2×5=10 et 3×2=6 → 10/6 ✅",
  },
  {
    id: 9,
    phrase: "1/4 ÷ 1/3 = ?",
    reponse: "3/4",
    explication:
      "On retourne 1/3 → 3/1 puis on multiplie : 1×3=3 et 4×1=4 → 3/4 ✅",
  },
  {
    id: 10,
    phrase: "3/4 ÷ 3/5 = ?",
    reponse: "15/12",
    explication:
      "On retourne 3/5 → 5/3 puis on multiplie : 3×5=15 et 4×3=12 → 15/12 ✅",
  },
  {
    id: 11,
    phrase: "2/7 ÷ 1/3 = ?",
    reponse: "6/7",
    explication:
      "On retourne 1/3 → 3/1 puis on multiplie : 2×3=6 et 7×1=7 → 6/7 ✅",
  },
  {
    id: 12,
    phrase: "1/5 ÷ 1/2 = ?",
    reponse: "2/5",
    explication:
      "On retourne 1/2 → 2/1 puis on multiplie : 1×2=2 et 5×1=5 → 2/5 ✅",
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

const getChoix = (id: number): string[] => {
  const choixMap: Record<number, string[]> = {
    1: ["2/2", "3/2", "4/2"],
    2: ["6/3", "8/3", "9/3"],
    3: ["4/4", "6/4", "8/4"],
    4: ["1/3", "2/3", "3/3"],
    5: ["5/5", "6/5", "7/5"],
    6: ["3/6", "4/6", "5/6"],
    7: ["5/5", "6/5", "7/5"],
    8: ["8/6", "10/6", "12/6"],
    9: ["2/4", "3/4", "4/4"],
    10: ["12/12", "15/12", "18/12"],
    11: ["5/7", "6/7", "7/7"],
    12: ["1/5", "2/5", "3/5"],
  };
  return (choixMap[id] ?? []).sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheFractionDivision() {
  const { estConnecte, maxQuestions } = useDecouverte();
  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);

  const [questions, setQuestions] = useState(() =>
    melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS),
  );
  const [indexActuel, setIndexActuel] = useState(0);
  const [etat, setEtat] = useState<EtatQuestion>("attente");
  const [choixFait, setChoixFait] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [ancienScore, setAncienScore] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const scoreSaved = useRef(false);

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
        .eq("theme", "fraction-division")
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
        .eq("theme", "fraction-division")
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
            theme: "fraction-division",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
  const choixActuels = getChoix(question.id);

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
              ? "Bravo ! Tu divises les fractions !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : on retourne et on multiplie."
                : "Continue à t'entraîner, ça va venir !"}
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
                background: "linear-gradient(135deg, #ff6b6b, #ffd166)",
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
              color: "#ffd166",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            ➗ Diviser des fractions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            On retourne la 2e fraction et on multiplie !
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,209,102,0.1)",
            border: "1px solid rgba(255,209,102,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#ffd166",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            💡 L&apos;astuce magique — retourne et multiplie !
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Fraction 1 */}
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffd166",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#ffd166",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    color: "#ffd166",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  3
                </div>
              </div>
              <span
                style={{
                  color: "#ff6b6b",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                }}
              >
                ÷
              </span>
              {/* Fraction 2 */}
              <div
                style={{
                  background: "rgba(255,107,107,0.2)",
                  border: "2px solid #ff6b6b",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ff6b6b",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#ff6b6b",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    color: "#ff6b6b",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  4
                </div>
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.5rem" }}
              >
                =
              </span>
              {/* Fraction 1 */}
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffd166",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#ffd166",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    color: "#ffd166",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  3
                </div>
              </div>
              <span
                style={{
                  color: "#a78bfa",
                  fontSize: "1.8rem",
                  fontWeight: 900,
                }}
              >
                ×
              </span>
              {/* Fraction retournée */}
              <div
                style={{
                  background: "rgba(167,139,250,0.2)",
                  border: "2px solid #a78bfa",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: "#a78bfa",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    marginBottom: "2px",
                  }}
                >
                  retournée !
                </div>
                <div
                  style={{
                    color: "#a78bfa",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  4
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#a78bfa",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    color: "#a78bfa",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  1
                </div>
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.5rem" }}
              >
                =
              </span>
              {/* Résultat */}
              <div
                style={{
                  background: "rgba(46,196,182,0.3)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  8
                </div>
                <div
                  style={{
                    height: "2px",
                    background: "#2ec4b6",
                    margin: "4px 0",
                  }}
                />
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  3
                </div>
              </div>
              <span style={{ color: "#2ec4b6", fontSize: "1.2rem" }}>✅</span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                textAlign: "center",
                margin: "10px 0 0 0",
              }}
            >
              ÷ 1/4 → c&apos;est pareil que × 4/1 — on retourne juste la
              fraction !
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
            style={{ color: "#ffd166", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #ffd166, #ff6b6b)",
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
              fontSize: "1.4rem",
              fontWeight: 800,
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
                  minWidth: "100px",
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
                background: "linear-gradient(135deg, #ffd166, #ff6b6b)",
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
