"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "3 × 9 = ?",
    reponse: "27",
    explication:
      "Baisse le doigt n°3. À gauche : 2 doigts. À droite : 7 doigts → 27 ✅",
  },
  {
    id: 2,
    phrase: "4 × 9 = ?",
    reponse: "36",
    explication:
      "Baisse le doigt n°4. À gauche : 3 doigts. À droite : 6 doigts → 36 ✅",
  },
  {
    id: 3,
    phrase: "6 × 9 = ?",
    reponse: "54",
    explication:
      "Baisse le doigt n°6. À gauche : 5 doigts. À droite : 4 doigts → 54 ✅",
  },
  {
    id: 4,
    phrase: "7 × 9 = ?",
    reponse: "63",
    explication:
      "Baisse le doigt n°7. À gauche : 6 doigts. À droite : 3 doigts → 63 ✅",
  },
  {
    id: 5,
    phrase: "8 × 9 = ?",
    reponse: "72",
    explication:
      "Baisse le doigt n°8. À gauche : 7 doigts. À droite : 2 doigts → 72 ✅",
  },
  {
    id: 6,
    phrase: "5 × 9 = ?",
    reponse: "45",
    explication:
      "Baisse le doigt n°5. À gauche : 4 doigts. À droite : 5 doigts → 45 ✅",
  },
  {
    id: 7,
    phrase: "2 × 9 = ?",
    reponse: "18",
    explication:
      "Baisse le doigt n°2. À gauche : 1 doigt. À droite : 8 doigts → 18 ✅",
  },
  {
    id: 8,
    phrase: "9 × 9 = ?",
    reponse: "81",
    explication:
      "Baisse le doigt n°9. À gauche : 8 doigts. À droite : 1 doigt → 81 ✅",
  },
  {
    id: 9,
    phrase: "1 × 9 = ?",
    reponse: "9",
    explication:
      "Baisse le doigt n°1. À gauche : 0 doigt. À droite : 9 doigts → 09 = 9 ✅",
  },
  {
    id: 10,
    phrase: "10 × 9 = ?",
    reponse: "90",
    explication:
      "Baisse le doigt n°10. À gauche : 9 doigts. À droite : 0 doigt → 90 ✅",
  },
  {
    id: 11,
    phrase: "3 × 9 = ?",
    reponse: "27",
    explication:
      "Baisse le doigt n°3. À gauche : 2 doigts. À droite : 7 doigts → 27 ✅",
  },
  {
    id: 12,
    phrase: "6 × 9 = ?",
    reponse: "54",
    explication:
      "Baisse le doigt n°6. À gauche : 5 doigts. À droite : 4 doigts → 54 ✅",
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

const getChoix = (reponse: string): string[] => {
  const n = parseInt(reponse);
  const options = [String(n - 9), reponse, String(n + 9)];
  return options.sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheMultiplier9() {
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
        .eq("theme", "multiplier-9")
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
        .eq("theme", "multiplier-9")
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
            theme: "multiplier-9",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
  const choixActuels = getChoix(question.reponse);

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
              ? "Bravo ! Tu maîtrises la table de 9 !"
              : pourcentage >= 50
                ? "Pas mal ! Utilise l'astuce des doigts."
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
                background: "linear-gradient(135deg, #a78bfa, #2ec4b6)",
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
              color: "#a78bfa",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            🤞 Multiplier par 9
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            L&apos;astuce des doigts
          </p>
        </div>

        {/* Astuce avec schéma visuel doigts */}
        <div
          style={{
            background: "rgba(167,139,250,0.1)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#a78bfa",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            💡 L&apos;astuce des doigts — exemple : 4 × 9
          </p>

          {/* Schéma visuel 2 mains */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                marginBottom: "8px",
              }}
            >
              Exemple : 4 × 9 → baisse le doigt n°4
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                gap: "12px",
              }}
            >
              {/* Main gauche (doigts 1-5) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "3px",
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "36px",
                          borderRadius: "9px 9px 4px 4px",
                          background: "rgba(255,209,102,0.8)",
                          border: "2px solid #ffd166",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: "#ffd166",
                          fontWeight: 700,
                        }}
                      >
                        {i}
                      </div>
                    </div>
                  ))}
                  {/* Doigt 4 baissé */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "16px",
                        borderRadius: "9px 9px 4px 4px",
                        background: "rgba(255,107,107,0.8)",
                        border: "2px solid #ff6b6b",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: "#ff6b6b",
                        fontWeight: 700,
                      }}
                    >
                      4⬇
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "30px",
                        borderRadius: "9px 9px 4px 4px",
                        background: "rgba(46,196,182,0.8)",
                        border: "2px solid #2ec4b6",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: "#2ec4b6",
                        fontWeight: 700,
                      }}
                    >
                      5
                    </div>
                  </div>
                </div>
                {/* Paume main gauche */}
                <div
                  style={{
                    width: "96px",
                    height: "18px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <div
                  style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}
                >
                  Main gauche
                </div>
              </div>

              {/* Séparateur */}
              <div
                style={{
                  width: "1px",
                  height: "60px",
                  background: "rgba(255,255,255,0.15)",
                }}
              />

              {/* Main droite (doigts 6-10) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "3px",
                  }}
                >
                  {[6, 7, 8, 9, 10].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: i === 6 ? "30px" : i === 10 ? "28px" : "36px",
                          borderRadius: "9px 9px 4px 4px",
                          background: "rgba(46,196,182,0.8)",
                          border: "2px solid #2ec4b6",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: "#2ec4b6",
                          fontWeight: 700,
                        }}
                      >
                        {i}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Paume main droite */}
                <div
                  style={{
                    width: "104px",
                    height: "18px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <div
                  style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}
                >
                  Main droite
                </div>
              </div>
            </div>

            {/* Résultat */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#ffd166", fontSize: "0.75rem" }}>
                  Gauche du doigt baissé
                </div>
                <div
                  style={{
                    color: "#ffd166",
                    fontSize: "1.1rem",
                    fontWeight: 900,
                  }}
                >
                  3 doigts = <strong>3</strong> dizaines
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#2ec4b6", fontSize: "0.75rem" }}>
                  Droite du doigt baissé
                </div>
                <div
                  style={{
                    color: "#2ec4b6",
                    fontSize: "1.1rem",
                    fontWeight: 900,
                  }}
                >
                  6 doigts = <strong>6</strong> unités
                </div>
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              <span style={{ color: "#fff" }}>4 × 9 = </span>
              <span style={{ color: "#ffd166" }}>3</span>
              <span style={{ color: "#2ec4b6" }}>6</span>
              <span style={{ color: "#fff" }}> = 36 ✅</span>
            </div>
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            <strong style={{ color: "#a78bfa" }}>Mode d&apos;emploi :</strong>
            <br />
            1. Pose tes 10 doigts devant toi
            <br />
            2. Baisse le doigt numéro N (celui que tu multiplies par 9)
            <br />
            3. Compte les doigts à{" "}
            <strong style={{ color: "#ffd166" }}>gauche</strong> = dizaines
            <br />
            4. Compte les doigts à{" "}
            <strong style={{ color: "#2ec4b6" }}>droite</strong> = unités
          </p>
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
            style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #a78bfa, #2ec4b6)",
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
                background: "linear-gradient(135deg, #a78bfa, #2ec4b6)",
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
