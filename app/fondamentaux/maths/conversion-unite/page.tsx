"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOUTES_LES_QUESTIONS = [
  {
    id: 1,
    phrase: "5 km = ___ m",
    reponse: "5 000",
    explication: "Dans le tableau : 5 en colonne km → 5 000 en colonne m ✅",
  },
  {
    id: 2,
    phrase: "3 500 m = ___ km",
    reponse: "3,5",
    explication: "3 500 m → on déplace vers km : 3,5 km ✅",
  },
  {
    id: 3,
    phrase: "2 kg = ___ g",
    reponse: "2 000",
    explication: "Dans le tableau : 2 en colonne kg → 2 000 en colonne g ✅",
  },
  {
    id: 4,
    phrase: "750 g = ___ kg",
    reponse: "0,75",
    explication: "750 g → on déplace vers kg : 0,75 kg ✅",
  },
  {
    id: 5,
    phrase: "1,5 L = ___ cL",
    reponse: "150",
    explication: "Dans le tableau : 1,5 en colonne L → 150 en colonne cL ✅",
  },
  {
    id: 6,
    phrase: "250 cL = ___ L",
    reponse: "2,5",
    explication: "250 cL → on déplace vers L : 2,5 L ✅",
  },
  {
    id: 7,
    phrase: "2 h = ___ min",
    reponse: "120",
    explication: "1 h = 60 min → 2 × 60 = 120 min ✅",
  },
  {
    id: 8,
    phrase: "3 m = ___ cm",
    reponse: "300",
    explication: "Dans le tableau : 3 en colonne m → 300 en colonne cm ✅",
  },
  {
    id: 9,
    phrase: "450 cm = ___ m",
    reponse: "4,5",
    explication: "450 cm → on déplace vers m : 4,5 m ✅",
  },
  {
    id: 10,
    phrase: "0,5 kg = ___ g",
    reponse: "500",
    explication: "Dans le tableau : 0,5 en colonne kg → 500 en colonne g ✅",
  },
  {
    id: 11,
    phrase: "1,5 h = ___ min",
    reponse: "90",
    explication: "1 h = 60 min → 1,5 × 60 = 90 min ✅",
  },
  {
    id: 12,
    phrase: "500 m = ___ km",
    reponse: "0,5",
    explication: "500 m → on déplace vers km : 0,5 km ✅",
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
    1: ["500", "5 000", "50 000"],
    2: ["0,35", "3,5", "35"],
    3: ["200", "2 000", "20 000"],
    4: ["0,075", "0,75", "7,5"],
    5: ["15", "150", "1 500"],
    6: ["0,25", "2,5", "25"],
    7: ["12", "120", "1 200"],
    8: ["30", "300", "3 000"],
    9: ["0,45", "4,5", "45"],
    10: ["50", "500", "5 000"],
    11: ["60", "90", "120"],
    12: ["0,05", "0,5", "5"],
  };
  return choixMap[id] ?? [reponse];
};

const NB_QUESTIONS = 10;
type EtatQuestion = "attente" | "correct" | "incorrect";

// Composant tableau de conversion
function TableauConversion({
  titre,
  emoji,
  colonnes,
  couleur,
}: {
  titre: string;
  emoji: string;
  colonnes: string[];
  couleur: string;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div
        style={{
          color: couleur,
          fontSize: "0.78rem",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {emoji} {titre}
      </div>
      <div
        style={{
          display: "flex",
          border: `1px solid ${couleur}50`,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {colonnes.map((col, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              borderRight:
                i < colonnes.length - 1 ? `1px solid ${couleur}30` : "none",
              background:
                i === Math.floor(colonnes.length / 2)
                  ? `${couleur}20`
                  : "transparent",
            }}
          >
            <div
              style={{
                background:
                  i === Math.floor(colonnes.length / 2)
                    ? couleur
                    : `${couleur}20`,
                color: i === Math.floor(colonnes.length / 2) ? "#fff" : couleur,
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "3px 2px",
              }}
            >
              {col}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.3)",
                padding: "4px 2px",
                minHeight: "22px",
              }}
            >
              {i === Math.floor(colonnes.length / 2)
                ? "1"
                : i < Math.floor(colonnes.length / 2)
                  ? ""
                  : Array(i - Math.floor(colonnes.length / 2))
                      .fill("0")
                      .join("")}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "2px",
          padding: "0 4px",
        }}
      >
        <span style={{ color: "#ffd166", fontSize: "0.65rem" }}>
          ← ÷10 à chaque colonne
        </span>
        <span style={{ color: "#2ec4b6", fontSize: "0.65rem" }}>
          ×10 à chaque colonne →
        </span>
      </div>
    </div>
  );
}

export default function FicheConversionUnite() {
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
        .eq("theme", "conversion-unite")
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
        .eq("theme", "conversion-unite")
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
            theme: "conversion-unite",
            score,
            total: NB_QUESTIONS,
          });
      }
    };
    sauvegarder();
  }, [termine, score, estConnecte]);

  const question = questions[indexActuel];
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
              ? "Bravo ! Tu maîtrises les conversions !"
              : pourcentage >= 50
                ? "Pas mal ! Utilise les tableaux pour t'aider."
                : "Relis les tableaux et réessaie !"}
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
            📏 Conversions d&apos;unités
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Distance · Masse · Volume · Temps
          </p>
        </div>

        {/* Tableaux de conversion */}
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
              marginBottom: "10px",
            }}
          >
            💡 Les tableaux de conversion
          </p>

          <TableauConversion
            titre="Distance"
            emoji="📍"
            couleur="#4f8ef7"
            colonnes={["km", "hm", "dam", "m", "dm", "cm", "mm"]}
          />
          <TableauConversion
            titre="Masse"
            emoji="⚖️"
            couleur="#a78bfa"
            colonnes={["kg", "hg", "dag", "g", "dg", "cg", "mg"]}
          />
          <TableauConversion
            titre="Volume"
            emoji="🥤"
            couleur="#2ec4b6"
            colonnes={["kL", "hL", "daL", "L", "dL", "cL", "mL"]}
          />

          {/* Temps à part car pas ×10 */}
          <div style={{ marginTop: "6px" }}>
            <div
              style={{
                color: "#ffd166",
                fontSize: "0.78rem",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              ⏰ Temps
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                {
                  label: "1 h = 60 min",
                  bg: "rgba(255,209,102,0.2)",
                  border: "rgba(255,209,102,0.5)",
                  color: "#ffd166",
                },
                {
                  label: "1 min = 60 s",
                  bg: "rgba(255,209,102,0.2)",
                  border: "rgba(255,209,102,0.5)",
                  color: "#ffd166",
                },
                {
                  label: "1 jour = 24 h",
                  bg: "rgba(255,209,102,0.2)",
                  border: "rgba(255,209,102,0.5)",
                  color: "#ffd166",
                },
              ].map(({ label, bg, border, color }) => (
                <span
                  key={label}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: "6px",
                    padding: "4px 10px",
                    color,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.72rem",
                marginTop: "4px",
                marginBottom: 0,
              }}
            >
              ⚠️ Le temps ne suit pas la règle ×10 — il faut mémoriser !
            </p>
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "24px", height: "2px", background: "#ffd166" }}
              />
              <span
                style={{
                  color: "#ffd166",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                vers la gauche : ÷ 10
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "24px", height: "2px", background: "#2ec4b6" }}
              />
              <span
                style={{
                  color: "#2ec4b6",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                vers la droite : × 10
              </span>
            </div>
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
              fontSize: "1.3rem",
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
