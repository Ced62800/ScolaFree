"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "Simplifie : 2/4",
    reponse: "1/2",
    explication: "2 et 4 sont divisibles par 2 → 2÷2=1, 4÷2=2 → 1/2 ✅",
  },
  {
    id: 2,
    phrase: "Simplifie : 3/9",
    reponse: "1/3",
    explication: "3 et 9 sont divisibles par 3 → 3÷3=1, 9÷3=3 → 1/3 ✅",
  },
  {
    id: 3,
    phrase: "Simplifie : 4/8",
    reponse: "1/2",
    explication: "4 et 8 sont divisibles par 4 → 4÷4=1, 8÷4=2 → 1/2 ✅",
  },
  {
    id: 4,
    phrase: "Simplifie : 6/9",
    reponse: "2/3",
    explication: "6 et 9 sont divisibles par 3 → 6÷3=2, 9÷3=3 → 2/3 ✅",
  },
  {
    id: 5,
    phrase: "Simplifie : 4/6",
    reponse: "2/3",
    explication: "4 et 6 sont divisibles par 2 → 4÷2=2, 6÷2=3 → 2/3 ✅",
  },
  {
    id: 6,
    phrase: "Simplifie : 6/12",
    reponse: "1/2",
    explication: "6 et 12 sont divisibles par 6 → 6÷6=1, 12÷6=2 → 1/2 ✅",
  },
  {
    id: 7,
    phrase: "Simplifie : 8/12",
    reponse: "2/3",
    explication: "8 et 12 sont divisibles par 4 → 8÷4=2, 12÷4=3 → 2/3 ✅",
  },
  {
    id: 8,
    phrase: "Simplifie : 5/10",
    reponse: "1/2",
    explication: "5 et 10 sont divisibles par 5 → 5÷5=1, 10÷5=2 → 1/2 ✅",
  },
  {
    id: 9,
    phrase: "Simplifie : 4/10",
    reponse: "2/5",
    explication: "4 et 10 sont divisibles par 2 → 4÷2=2, 10÷2=5 → 2/5 ✅",
  },
  {
    id: 10,
    phrase: "Simplifie : 9/12",
    reponse: "3/4",
    explication: "9 et 12 sont divisibles par 3 → 9÷3=3, 12÷3=4 → 3/4 ✅",
  },
  {
    id: 11,
    phrase: "Simplifie : 6/8",
    reponse: "3/4",
    explication: "6 et 8 sont divisibles par 2 → 6÷2=3, 8÷2=4 → 3/4 ✅",
  },
  {
    id: 12,
    phrase: "Simplifie : 10/15",
    reponse: "2/3",
    explication: "10 et 15 sont divisibles par 5 → 10÷5=2, 15÷5=3 → 2/3 ✅",
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
    1: ["1/4", "1/2", "2/3"],
    2: ["1/2", "1/3", "2/3"],
    3: ["1/4", "1/2", "2/4"],
    4: ["1/3", "2/3", "3/4"],
    5: ["1/3", "2/3", "3/4"],
    6: ["1/3", "1/2", "2/3"],
    7: ["1/2", "2/3", "3/4"],
    8: ["1/5", "1/2", "2/5"],
    9: ["1/5", "2/5", "3/5"],
    10: ["2/3", "3/4", "4/5"],
    11: ["2/3", "3/4", "4/5"],
    12: ["1/3", "2/3", "3/5"],
  };
  return (choixMap[id] ?? []).sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheFractionSimplifier() {
  const { estConnecte, maxQuestions } = useDecouverte();
  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);

  const [questions, setQuestions] = useState<typeof TOUTES_LES_QUESTIONS>([]);

  useEffect(() => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
  }, []);
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
        .eq("theme", "fraction-simplifier")
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
        .eq("theme", "fraction-simplifier")
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
            theme: "fraction-simplifier",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
  if (!question) return null;
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
              ? "Bravo ! Tu simplifies les fractions !"
              : pourcentage >= 50
                ? "Pas mal ! Cherche le nombre qui divise les deux."
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
                background: "linear-gradient(135deg, #2ec4b6, #a78bfa)",
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
              color: "#2ec4b6",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            ✂️ Simplifier une fraction
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Divise le haut et le bas par le même nombre !
          </p>
        </div>

        <div
          style={{
            background: "rgba(46,196,182,0.1)",
            border: "1px solid rgba(46,196,182,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#2ec4b6",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            💡 L&apos;astuce magique
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "8px",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.78rem",
                textAlign: "center",
                margin: "0 0 10px 0",
              }}
            >
              Exemple : simplifier 6/9
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {/* Fraction de départ */}
              <div
                style={{
                  background: "rgba(46,196,182,0.2)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#2ec4b6",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  6
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
                    color: "#2ec4b6",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  9
                </div>
              </div>
              {/* Diviseur */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "#ffd166",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  ÷ 3 en haut
                </div>
                <div style={{ color: "#ffd166", fontSize: "1.5rem" }}>→</div>
                <div
                  style={{
                    color: "#ffd166",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  ÷ 3 en bas
                </div>
              </div>
              {/* Fraction résultat */}
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffd166",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  6÷3
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
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  9÷3
                </div>
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.5rem" }}
              >
                =
              </span>
              {/* Résultat final */}
              <div
                style={{
                  background: "rgba(46,196,182,0.3)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  2
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
                    fontSize: "1.6rem",
                    lineHeight: 1,
                  }}
                >
                  3
                </div>
              </div>
              <span style={{ color: "#2ec4b6", fontSize: "1.2rem" }}>✅</span>
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
            <strong style={{ color: "#2ec4b6" }}>La règle :</strong> trouve un
            nombre qui divise <em>exactement</em> le haut ET le bas
            <br />
            <strong style={{ color: "#ffd166" }}>Astuce :</strong> commence par
            essayer 2, puis 3, puis 5...
            <br />
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>
              C&apos;est simplifié quand
            </strong>{" "}
            haut et bas n&apos;ont plus de diviseur commun
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
            style={{ color: "#2ec4b6", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #2ec4b6, #a78bfa)",
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
                background: "linear-gradient(135deg, #2ec4b6, #a78bfa)",
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
