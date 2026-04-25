"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "Article à 80€, remise de 20%. Prix final ?",
    reponse: "64€",
    explication: "20% de 80 = 16€ → 80 - 16 = 64€ ✅",
  },
  {
    id: 2,
    phrase: "Article à 50€, remise de 10%. Prix final ?",
    reponse: "45€",
    explication: "10% de 50 = 5€ → 50 - 5 = 45€ ✅",
  },
  {
    id: 3,
    phrase: "Article à 120€, remise de 25%. Prix final ?",
    reponse: "90€",
    explication: "25% de 120 = 30€ → 120 - 30 = 90€ ✅",
  },
  {
    id: 4,
    phrase: "Article à 200€, remise de 50%. Prix final ?",
    reponse: "100€",
    explication: "50% de 200 = 100€ → 200 - 100 = 100€ ✅",
  },
  {
    id: 5,
    phrase: "Article à 60€, remise de 20%. Prix final ?",
    reponse: "48€",
    explication: "20% de 60 = 12€ → 60 - 12 = 48€ ✅",
  },
  {
    id: 6,
    phrase: "Article à 40€, remise de 25%. Prix final ?",
    reponse: "30€",
    explication: "25% de 40 = 10€ → 40 - 10 = 30€ ✅",
  },
  {
    id: 7,
    phrase: "Article à 90€, remise de 10%. Prix final ?",
    reponse: "81€",
    explication: "10% de 90 = 9€ → 90 - 9 = 81€ ✅",
  },
  {
    id: 8,
    phrase: "Article à 150€, remise de 20%. Prix final ?",
    reponse: "120€",
    explication: "20% de 150 = 30€ → 150 - 30 = 120€ ✅",
  },
  {
    id: 9,
    phrase: "Article à 100€, remise de 15%. Prix final ?",
    reponse: "85€",
    explication: "15% de 100 = 15€ → 100 - 15 = 85€ ✅",
  },
  {
    id: 10,
    phrase: "Article à 70€, remise de 30%. Prix final ?",
    reponse: "49€",
    explication: "30% de 70 = 21€ → 70 - 21 = 49€ ✅",
  },
  {
    id: 11,
    phrase: "Article à 160€, remise de 25%. Prix final ?",
    reponse: "120€",
    explication: "25% de 160 = 40€ → 160 - 40 = 120€ ✅",
  },
  {
    id: 12,
    phrase: "Article à 300€, remise de 50%. Prix final ?",
    reponse: "150€",
    explication: "50% de 300 = 150€ → 300 - 150 = 150€ ✅",
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
    1: ["56€", "64€", "72€"],
    2: ["40€", "45€", "50€"],
    3: ["80€", "90€", "100€"],
    4: ["80€", "100€", "120€"],
    5: ["44€", "48€", "52€"],
    6: ["25€", "30€", "35€"],
    7: ["75€", "81€", "87€"],
    8: ["110€", "120€", "130€"],
    9: ["80€", "85€", "90€"],
    10: ["44€", "49€", "54€"],
    11: ["110€", "120€", "130€"],
    12: ["120€", "150€", "180€"],
  };
  return (choixMap[id] ?? [reponse]).sort(() => Math.random() - 0.5);
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

export default function FicheSoldes() {
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
        .eq("theme", "soldes")
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
        .eq("theme", "soldes")
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
            theme: "soldes",
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
              ? "Bravo ! Tu calcules les soldes !"
              : pourcentage >= 50
                ? "Pas mal ! Rappelle-toi : calcule la remise puis soustrais."
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
            🏷️ Calculer les soldes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Prix de départ − remise = prix final
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
            💡 L&apos;astuce en 2 étapes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <p
                style={{
                  color: "#ffd166",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  margin: "0 0 4px 0",
                }}
              >
                Étape 1 — Calcule la remise
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.82rem",
                  margin: 0,
                }}
              >
                ex: 80€ avec -20% → 20% de 80 = 80 ÷ 10 × 2 ={" "}
                <strong style={{ color: "#ffd166" }}>16€ de remise</strong>
              </p>
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <p
                style={{
                  color: "#2ec4b6",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  margin: "0 0 4px 0",
                }}
              >
                Étape 2 — Soustrais la remise
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.82rem",
                  margin: 0,
                }}
              >
                80€ − 16€ ={" "}
                <strong style={{ color: "#2ec4b6" }}>64€ prix final</strong>
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "8px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                margin: 0,
                textAlign: "center",
              }}
            >
              💡 Rappel rapide :{" "}
              <strong style={{ color: "#ffd166" }}>10%</strong> = ÷10
              &nbsp;|&nbsp; <strong style={{ color: "#ffd166" }}>20%</strong> =
              ÷10 ×2 &nbsp;|&nbsp;{" "}
              <strong style={{ color: "#ffd166" }}>25%</strong> = ÷4
              &nbsp;|&nbsp; <strong style={{ color: "#ffd166" }}>50%</strong> =
              ÷2
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
