"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "1/4 + 1/4 = ?",
    reponse: "2/4",
    explication:
      "Même dénominateur → on additionne les numérateurs : 1+1=2 → 2/4 ✅",
  },
  {
    id: 2,
    phrase: "1/3 + 1/3 = ?",
    reponse: "2/3",
    explication: "Même dénominateur → 1+1=2 → 2/3 ✅",
  },
  {
    id: 3,
    phrase: "1/2 + 1/4 = ?",
    reponse: "3/4",
    explication: "1/2 = 2/4 → 2/4 + 1/4 = 3/4 ✅",
  },
  {
    id: 4,
    phrase: "2/5 + 1/5 = ?",
    reponse: "3/5",
    explication: "Même dénominateur → 2+1=3 → 3/5 ✅",
  },
  {
    id: 5,
    phrase: "1/3 + 1/6 = ?",
    reponse: "3/6",
    explication: "1/3 = 2/6 → 2/6 + 1/6 = 3/6 ✅",
  },
  {
    id: 6,
    phrase: "3/8 + 1/8 = ?",
    reponse: "4/8",
    explication: "Même dénominateur → 3+1=4 → 4/8 ✅",
  },
  {
    id: 7,
    phrase: "1/4 + 2/4 = ?",
    reponse: "3/4",
    explication: "Même dénominateur → 1+2=3 → 3/4 ✅",
  },
  {
    id: 8,
    phrase: "1/2 + 1/6 = ?",
    reponse: "4/6",
    explication: "1/2 = 3/6 → 3/6 + 1/6 = 4/6 ✅",
  },
  {
    id: 9,
    phrase: "2/7 + 3/7 = ?",
    reponse: "5/7",
    explication: "Même dénominateur → 2+3=5 → 5/7 ✅",
  },
  {
    id: 10,
    phrase: "1/5 + 2/5 = ?",
    reponse: "3/5",
    explication: "Même dénominateur → 1+2=3 → 3/5 ✅",
  },
  {
    id: 11,
    phrase: "1/4 + 1/2 = ?",
    reponse: "3/4",
    explication: "1/2 = 2/4 → 1/4 + 2/4 = 3/4 ✅",
  },
  {
    id: 12,
    phrase: "3/10 + 2/10 = ?",
    reponse: "5/10",
    explication: "Même dénominateur → 3+2=5 → 5/10 ✅",
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
    1: ["1/4", "2/4", "3/4"],
    2: ["1/3", "2/3", "3/3"],
    3: ["2/4", "3/4", "4/4"],
    4: ["2/5", "3/5", "4/5"],
    5: ["2/6", "3/6", "4/6"],
    6: ["3/8", "4/8", "5/8"],
    7: ["2/4", "3/4", "4/4"],
    8: ["3/6", "4/6", "5/6"],
    9: ["4/7", "5/7", "6/7"],
    10: ["2/5", "3/5", "4/5"],
    11: ["2/4", "3/4", "4/4"],
    12: ["4/10", "5/10", "6/10"],
  };
  return (choixMap[id] ?? []).sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

// Composant fraction visuelle
function Fraction({
  num,
  den,
  couleur,
}: {
  num: string;
  den: string;
  couleur: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4px 8px",
      }}
    >
      <span
        style={{
          color: couleur,
          fontWeight: 900,
          fontSize: "1.2rem",
          lineHeight: 1,
        }}
      >
        {num}
      </span>
      <div
        style={{
          width: "100%",
          height: "2px",
          background: couleur,
          margin: "2px 0",
        }}
      />
      <span
        style={{
          color: couleur,
          fontWeight: 900,
          fontSize: "1.2rem",
          lineHeight: 1,
        }}
      >
        {den}
      </span>
    </div>
  );
}

export default function FicheFractionAddition() {
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
        .eq("theme", "fraction-addition")
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
        .eq("theme", "fraction-addition")
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
        await supabase.from("scores").insert({
          user_id: user.id,
          classe: "fondamentaux",
          matiere: "maths",
          theme: "fraction-addition",
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
              ? "Bravo ! Tu additionnes les fractions !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : même dénominateur d'abord."
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
            🍕 Additionner des fractions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Même dénominateur → on additionne les numérateurs
          </p>
        </div>

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
            💡 L&apos;astuce magique
          </p>

          {/* Schéma visuel cas 1 : même dénominateur */}
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
                color: "#2ec4b6",
                fontSize: "0.78rem",
                fontWeight: 700,
                margin: "0 0 8px 0",
              }}
            >
              ✅ Cas 1 — Même dénominateur : on additionne juste les numérateurs
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "rgba(167,139,250,0.2)",
                  border: "2px solid #a78bfa",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="2" den="5" couleur="#a78bfa" />
              </div>
              <span
                style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}
              >
                +
              </span>
              <div
                style={{
                  background: "rgba(167,139,250,0.2)",
                  border: "2px solid #a78bfa",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="1" den="5" couleur="#a78bfa" />
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.3rem" }}
              >
                =
              </span>
              <div
                style={{
                  background: "rgba(46,196,182,0.2)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="3" den="5" couleur="#2ec4b6" />
              </div>
              <span
                style={{
                  color: "#2ec4b6",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                ✅
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                textAlign: "center",
                margin: "8px 0 0 0",
              }}
            >
              Le dénominateur reste le même — on additionne seulement le dessus
              !
            </p>
          </div>

          {/* Schéma visuel cas 2 : dénominateurs différents */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            <p
              style={{
                color: "#ffd166",
                fontSize: "0.78rem",
                fontWeight: 700,
                margin: "0 0 8px 0",
              }}
            >
              ⚠️ Cas 2 — Dénominateurs différents : on cherche un dénominateur
              commun
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="1" den="2" couleur="#ffd166" />
              </div>
              <span
                style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}
              >
                +
              </span>
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="1" den="4" couleur="#ffd166" />
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.3rem" }}
              >
                =
              </span>
              <div
                style={{
                  background: "rgba(255,107,107,0.2)",
                  border: "2px solid #ff6b6b",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="2" den="4" couleur="#ff6b6b" />
              </div>
              <span
                style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900 }}
              >
                +
              </span>
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="1" den="4" couleur="#ffd166" />
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.3rem" }}
              >
                =
              </span>
              <div
                style={{
                  background: "rgba(46,196,182,0.2)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "8px 14px",
                }}
              >
                <Fraction num="3" den="4" couleur="#2ec4b6" />
              </div>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                textAlign: "center",
                margin: "8px 0 0 0",
              }}
            >
              1/2 = 2/4 → on convertit pour avoir le même dénominateur !
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
