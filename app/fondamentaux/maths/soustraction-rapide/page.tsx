"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "83 - 48 = ?",
    reponse: "35",
    explication: "48 → 50 (+2) → 83 - 50 = 33 → 33 + 2 = 35 ✅",
  },
  {
    id: 2,
    phrase: "72 - 37 = ?",
    reponse: "35",
    explication: "37 → 40 (+3) → 72 - 40 = 32 → 32 + 3 = 35 ✅",
  },
  {
    id: 3,
    phrase: "91 - 56 = ?",
    reponse: "35",
    explication: "56 → 60 (+4) → 91 - 60 = 31 → 31 + 4 = 35 ✅",
  },
  {
    id: 4,
    phrase: "65 - 28 = ?",
    reponse: "37",
    explication: "28 → 30 (+2) → 65 - 30 = 35 → 35 + 2 = 37 ✅",
  },
  {
    id: 5,
    phrase: "84 - 47 = ?",
    reponse: "37",
    explication: "47 → 50 (+3) → 84 - 50 = 34 → 34 + 3 = 37 ✅",
  },
  {
    id: 6,
    phrase: "76 - 39 = ?",
    reponse: "37",
    explication: "39 → 40 (+1) → 76 - 40 = 36 → 36 + 1 = 37 ✅",
  },
  {
    id: 7,
    phrase: "93 - 58 = ?",
    reponse: "35",
    explication: "58 → 60 (+2) → 93 - 60 = 33 → 33 + 2 = 35 ✅",
  },
  {
    id: 8,
    phrase: "62 - 27 = ?",
    reponse: "35",
    explication: "27 → 30 (+3) → 62 - 30 = 32 → 32 + 3 = 35 ✅",
  },
  {
    id: 9,
    phrase: "85 - 49 = ?",
    reponse: "36",
    explication: "49 → 50 (+1) → 85 - 50 = 35 → 35 + 1 = 36 ✅",
  },
  {
    id: 10,
    phrase: "74 - 38 = ?",
    reponse: "36",
    explication: "38 → 40 (+2) → 74 - 40 = 34 → 34 + 2 = 36 ✅",
  },
  {
    id: 11,
    phrase: "96 - 57 = ?",
    reponse: "39",
    explication: "57 → 60 (+3) → 96 - 60 = 36 → 36 + 3 = 39 ✅",
  },
  {
    id: 12,
    phrase: "81 - 46 = ?",
    reponse: "35",
    explication: "46 → 50 (+4) → 81 - 50 = 31 → 31 + 4 = 35 ✅",
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
  return [String(n - 10), reponse, String(n + 10)].sort(
    () => Math.random() - 0.5,
  );
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheSoustractionRapide() {
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
        .eq("theme", "soustraction-rapide")
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
        .eq("theme", "soustraction-rapide")
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
            theme: "soustraction-rapide",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
  if (!question) return null;
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
              ? "Bravo ! Tu soustrais comme un pro !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : arrondi puis rajoute."
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
              color: "#ff6b6b",
              fontSize: "1.4rem",
              fontWeight: 800,
              marginBottom: "4px",
            }}
          >
            ➖ Soustraire rapidement
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Arrondir le soustracteur puis rajuster
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,107,107,0.1)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#ff6b6b",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            💡 L&apos;astuce magique — exemple : 83 - 48
          </p>

          {/* Schéma visuel */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "rgba(255,107,107,0.2)",
                  border: "2px solid #ff6b6b",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ff6b6b",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                  }}
                >
                  83 - 48
                </div>
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}
              >
                →
              </div>
              <div
                style={{
                  background: "rgba(255,209,102,0.2)",
                  border: "2px solid #ffd166",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffd166",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                  }}
                >
                  83 - 50
                </div>
                <div style={{ color: "#ffd166", fontSize: "0.7rem" }}>
                  48 arrondi à 50 (+2)
                </div>
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}
              >
                →
              </div>
              <div
                style={{
                  background: "rgba(46,196,182,0.2)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#2ec4b6",
                    fontSize: "1.2rem",
                    fontWeight: 900,
                  }}
                >
                  33 + 2
                </div>
                <div style={{ color: "#2ec4b6", fontSize: "0.7rem" }}>
                  on rajoute les 2
                </div>
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}
              >
                →
              </div>
              <div
                style={{
                  background: "rgba(46,196,182,0.3)",
                  border: "2px solid #2ec4b6",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 900 }}
                >
                  35 ✅
                </div>
              </div>
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
            <strong style={{ color: "#ffd166" }}>Étape 1 :</strong> arrondis le
            nombre qu&apos;on soustrait au multiple de 10 le plus proche
            <br />
            <strong style={{ color: "#ff6b6b" }}>Étape 2 :</strong> soustrais ce
            nombre arrondi
            <br />
            <strong style={{ color: "#2ec4b6" }}>Étape 3 :</strong> rajoute ce
            que tu as ajouté pour arrondir
            <br />
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>
              Astuce :
            </strong>{" "}
            on a arrondi 48 à 50 en ajoutant 2, donc on rajoute 2 à la fin !
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
            style={{ color: "#ff6b6b", fontWeight: 700, fontSize: "0.85rem" }}
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
              background: "linear-gradient(90deg, #ff6b6b, #ffd166)",
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
                background: "linear-gradient(135deg, #ff6b6b, #ffd166)",
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
