"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les tables de multiplication",
  intro:
    "La multiplication est une addition répétée. Connaître ses tables par cœur permet de calculer beaucoup plus vite !",
  points: [
    {
      titre: "Qu'est-ce que multiplier ?",
      texte:
        "Multiplier c'est additionner plusieurs fois le même nombre. 3 × 4 veut dire : 3 fois 4, c'est-à-dire 4 + 4 + 4 = 12.",
      exemple: "3 × 4 = 12 · 5 × 6 = 30 · 2 × 8 = 16",
    },
    {
      titre: "Les tables à connaître",
      texte:
        "En CE2, on apprend les tables de 2, 3, 4, 5, 6, 7, 8, 9 et 10. La table de 1 est facile (1 × n = n) et celle de 10 aussi (10 × n = n0).",
      exemple:
        "Table de 3 : 3×1=3, 3×2=6, 3×3=9, 3×4=12... · Table de 5 : 5×1=5, 5×2=10...",
    },
    {
      titre: "La commutativité",
      texte: "On peut changer l'ordre des facteurs, le résultat est le même !",
      exemple: "3 × 7 = 7 × 3 = 21 · 4 × 6 = 6 × 4 = 24",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "3 × 4 = ?",
    options: ["10", "12", "14", "7"],
    reponse: "12",
    explication: "3 × 4 = 4 + 4 + 4 = 12.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "5 × 6 = ?",
    options: ["25", "30", "35", "11"],
    reponse: "30",
    explication: "5 × 6 = 30.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "2 × 9 = ?",
    options: ["16", "18", "20", "11"],
    reponse: "18",
    explication: "2 × 9 = 9 + 9 = 18.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "10 × 7 = ?",
    options: ["17", "70", "700", "77"],
    reponse: "70",
    explication: "10 × 7 = 70 (on ajoute un zéro).",
    niveau: "facile",
  },
  {
    id: 5,
    question: "4 × 8 = ?",
    options: ["28", "30", "32", "36"],
    reponse: "32",
    explication: "4 × 8 = 32.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "6 × 7 = ?",
    options: ["36", "40", "42", "48"],
    reponse: "42",
    explication: "6 × 7 = 42.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "9 × 8 = ?",
    options: ["63", "72", "81", "56"],
    reponse: "72",
    explication: "9 × 8 = 72.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "5 boîtes contiennent chacune 8 crayons. Combien en tout ?",
    options: ["35", "38", "40", "45"],
    reponse: "40",
    explication: "5 × 8 = 40 crayons.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "7 × 7 = ?",
    options: ["42", "46", "49", "56"],
    reponse: "49",
    explication: "7 × 7 = 49.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Si 6 × 8 = 48, combien font 8 × 6 ?",
    options: ["42", "46", "48", "56"],
    reponse: "48",
    explication: "La multiplication est commutative : 6 × 8 = 8 × 6 = 48.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "multiplication";

export default function MultiplicationCE2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
        });
        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Multiplication</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questionsActives.length}
            </span>
            <span>
              {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${progression}%` }}
            ></div>
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">✖️ Multiplication · CE2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}
          <div className="lecon-points">
            {lecon.points.map((p, i) => (
              <div key={i} className="lecon-point">
                <div className="lecon-point-titre">{p.titre}</div>
                <div className="lecon-point-texte">{p.texte}</div>
                <div className="lecon-point-exemple">
                  <span className="exemple-label">Exemples :</span> {p.exemple}
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Je suis prêt(e) — Passer aux exercices →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div className="qcm-wrapper">
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
                else if (opt === selected) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={className}
                  onClick={() => handleReponse(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">
            {score >= 9 ? "🏆" : score >= 7 ? "⭐" : score >= 5 ? "👍" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score >= 9
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les tables ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Entraîne-toi encore sur les tables !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
