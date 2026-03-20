"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Opérations sur les nombres décimaux",
  intro:
    "En CM2, on apprend à additionner, soustraire et multiplier des nombres décimaux. Les règles sont les mêmes qu'avec les entiers, mais il faut bien aligner les virgules !",
  points: [
    {
      titre: "Addition et soustraction de décimaux",
      texte:
        "Pour additionner ou soustraire des décimaux, on aligne les virgules et on opère colonne par colonne. On peut compléter avec des zéros si nécessaire.",
      exemple:
        "3,4 + 2,15 : on pose 3,40 + 2,15 = 5,55. | 7,3 − 2,65 : on pose 7,30 − 2,65 = 4,65.",
    },
    {
      titre: "Multiplication d'un décimal par un entier",
      texte:
        "On pose la multiplication normalement, puis on place la virgule dans le résultat en comptant le nombre de chiffres après la virgule dans le nombre de départ.",
      exemple:
        "2,3 × 4 : 23 × 4 = 92, puis on place la virgule → 9,2. | 1,25 × 3 = 3,75.",
    },
    {
      titre: "Arrondir un nombre décimal",
      texte:
        "Arrondir à l'unité : on regarde le chiffre des dixièmes. S'il est ≥ 5, on arrondit au-dessus. S'il est < 5, on arrondit en dessous.",
      exemple:
        "3,7 ≈ 4 (arrondi à l'unité). 5,3 ≈ 5. 2,45 ≈ 2,5 (arrondi au dixième).",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "3,4 + 2,1 = ?",
    options: ["5,4", "5,5", "5,6", "6,5"],
    reponse: "5,5",
    explication: "3,4 + 2,1 = 5,5.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "6,8 − 3,2 = ?",
    options: ["3,4", "3,6", "4,6", "3,8"],
    reponse: "3,6",
    explication: "6,8 − 3,2 = 3,6.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "1,5 × 4 = ?",
    options: ["5", "6", "6,5", "7"],
    reponse: "6",
    explication: "15 × 4 = 60, puis on place la virgule → 6,0 = 6.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "4,25 + 1,3 = ?",
    options: ["4,55", "5,25", "5,55", "5,65"],
    reponse: "5,55",
    explication: "4,25 + 1,30 = 5,55.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "8,4 − 3,65 = ?",
    options: ["4,65", "4,75", "5,25", "4,85"],
    reponse: "4,75",
    explication: "8,40 − 3,65 = 4,75.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "2,35 × 3 = ?",
    options: ["6,05", "7,05", "7,15", "6,95"],
    reponse: "7,05",
    explication: "235 × 3 = 705, puis on place la virgule → 7,05.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "À combien s'arrondit 4,7 à l'unité ?",
    options: ["4", "5", "4,5", "6"],
    reponse: "5",
    explication: "Le chiffre des dixièmes est 7 ≥ 5, donc on arrondit à 5.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Un livre coûte 7,50 € et un stylo 1,35 €. Quel est le prix total ?",
    options: ["8,75 €", "8,85 €", "8,95 €", "9,05 €"],
    reponse: "8,85 €",
    explication: "7,50 + 1,35 = 8,85 €.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "3,14 × 5 = ?",
    options: ["15,5", "15,7", "15,14", "15,70"],
    reponse: "15,70",
    explication: "314 × 5 = 1570, puis on place la virgule → 15,70.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom a 20 € et dépense 12,75 €. Combien lui reste-t-il ?",
    options: ["7,15 €", "7,25 €", "7,35 €", "8,25 €"],
    reponse: "7,25 €",
    explication: "20,00 − 12,75 = 7,25 €.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "decimaux";

export default function DecimauxCM2() {
  const router = useRouter();
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
  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);
  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);
  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };
  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questions.length,
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
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Nombres décimaux</span>
        </div>
      </div>
      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questions.length}
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
          <div className="lecon-badge">🔢 Nombres décimaux · CM2</div>
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
            {niveauLabel(questions[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questions[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
                  onClick={() => handleReponse(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === questions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questions[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questions[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questions[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questions.length
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
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises les opérations sur les décimaux ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
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
