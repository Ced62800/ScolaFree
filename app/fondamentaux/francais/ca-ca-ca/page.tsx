"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "___ m'a surpris de le voir ici.",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela m'a surpris → Ça ✅",
  },
  {
    id: 2,
    phrase: "___ été une belle journée.",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a été une belle journée → Ç'a ✅",
  },
  {
    id: 3,
    phrase: "___ ne m'intéresse pas du tout.",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela ne m'intéresse pas → Ça ✅",
  },
  {
    id: 4,
    phrase: "___ l'air d'une bonne idée !",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a l'air d'une bonne idée → Ç'a ✅",
  },
  {
    id: 5,
    phrase: "___ fait longtemps qu'on ne s'est pas vus.",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela fait longtemps → Ça ✅",
  },
  {
    id: 6,
    phrase: "___ bien marché, leur projet.",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a bien marché → Ç'a ✅",
  },
  {
    id: 7,
    phrase: "___ ne sert à rien de s'énerver.",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela ne sert à rien → Ça ✅",
  },
  {
    id: 8,
    phrase: "___ pris du temps mais c'est fait.",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a pris du temps → Ç'a ✅",
  },
  {
    id: 9,
    phrase: "___ m'énerve quand il fait ça !",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela m'énerve → Ça ✅",
  },
  {
    id: 10,
    phrase: "___ coûté très cher à réparer.",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a coûté très cher → Ç'a ✅",
  },
  {
    id: 11,
    phrase: "___ arrive à tout le monde de se tromper.",
    reponse: "Ça",
    explication: "'Ça' = cela. Cela arrive à tout le monde → Ça ✅",
  },
  {
    id: 12,
    phrase: "___ duré trois heures, ce film !",
    reponse: "Ç'a",
    explication: "'Ç'a' = cela a. Cela a duré trois heures → Ç'a ✅",
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

const CHOIX = ["Ça", "Ç'a"];
const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheCaCa() {
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
        .eq("matiere", "francais")
        .eq("theme", "ca-ca-ca")
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
        .eq("matiere", "francais")
        .eq("theme", "ca-ca-ca")
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
            theme: "ca-ca-ca",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];

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
              ? "Bravo ! Tu maîtrises ça / ç'a !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : ç'a = cela a."
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
              href="/fondamentaux/francais"
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
          href="/fondamentaux/francais"
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
            ✍️ Ça / Ç&apos;a
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Pronom démonstratif ou verbe avoir ?
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
              marginBottom: "8px",
            }}
          >
            💡 L&apos;astuce magique
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "rgba(46,196,182,0.3)",
                    border: "2px solid #2ec4b6",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    minWidth: "60px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#2ec4b6",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                    }}
                  >
                    ÇA
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.82rem",
                      margin: 0,
                    }}
                  >
                    = <strong style={{ color: "#2ec4b6" }}>cela</strong> —
                    remplace par &quot;cela&quot;
                    <br />
                    Ex : <em>Ça</em> m&apos;énerve → <em>Cela</em> m&apos;énerve
                    ✅<br />
                    <span
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.78rem",
                      }}
                    >
                      Pas de verbe avoir après
                    </span>
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "rgba(167,139,250,0.3)",
                    border: "2px solid #a78bfa",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    minWidth: "60px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#a78bfa",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                    }}
                  >
                    Ç&apos;A
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.82rem",
                      margin: 0,
                    }}
                  >
                    = <strong style={{ color: "#a78bfa" }}>cela a</strong> —
                    remplace par &quot;cela a&quot;
                    <br />
                    Ex : <em>Ç&apos;a</em> duré longtemps → <em>Cela a</em> duré
                    longtemps ✅<br />
                    <span
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.78rem",
                      }}
                    >
                      Suivi d&apos;un participe passé (été, duré, pris...)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.78rem",
              margin: 0,
            }}
          >
            🔑 Le truc : essaie de remplacer par{" "}
            <strong style={{ color: "#a78bfa" }}>&quot;cela a&quot;</strong> —
            si ça marche →{" "}
            <strong style={{ color: "#a78bfa" }}>Ç&apos;A</strong>, sinon →{" "}
            <strong style={{ color: "#2ec4b6" }}>ÇA</strong>
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
            padding: "20px 16px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
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
          {CHOIX.map((choix) => {
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
