"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La division posée",
  intro:
    "En CM1, on apprend à poser et effectuer une division euclidienne. On trouve un quotient et un reste.",
  points: [
    {
      titre: "Vocabulaire de la division",
      texte:
        "Dans une division, le nombre qu'on divise s'appelle le dividende, celui par lequel on divise s'appelle le diviseur, le résultat s'appelle le quotient et ce qui reste s'appelle le reste.",
      exemple:
        "84 ÷ 7 = 12. Dividende = 84, diviseur = 7, quotient = 12, reste = 0.",
    },
    {
      titre: "La division euclidienne",
      texte:
        "Quand la division n'est pas exacte, il y a un reste. Le reste est toujours inférieur au diviseur. On écrit : dividende = diviseur × quotient + reste.",
      exemple: "29 ÷ 4 = 7, reste 1. Car 4 × 7 = 28, et 29 − 28 = 1.",
    },
    {
      titre: "Vérifier une division",
      texte:
        "Pour vérifier une division, on multiplie le quotient par le diviseur et on ajoute le reste. On doit retrouver le dividende.",
      exemple: "38 ÷ 5 = 7, reste 3. Vérification : 5 × 7 + 3 = 35 + 3 = 38 ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien font 42 ÷ 6 ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "42 ÷ 6 = 7 car 6 × 7 = 42.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien font 56 ÷ 8 ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "56 ÷ 8 = 7 car 8 × 7 = 56.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Dans la division 85 ÷ 5, quel est le quotient ?",
    options: ["15", "16", "17", "18"],
    reponse: "17",
    explication: "85 ÷ 5 = 17 car 5 × 17 = 85.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "29 ÷ 4, quel est le reste ?",
    options: ["0", "1", "2", "3"],
    reponse: "1",
    explication: "4 × 7 = 28. 29 − 28 = 1. Le reste est 1.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "38 ÷ 5, quel est le quotient ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "5 × 7 = 35 ≤ 38 < 40 = 5 × 8. Le quotient est 7.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "63 ÷ 9 = ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "63 ÷ 9 = 7 car 9 × 7 = 63.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "On répartit 47 billes en groupes de 5. Combien de groupes complets peut-on faire ?",
    options: ["8", "9", "10", "11"],
    reponse: "9",
    explication: "47 ÷ 5 = 9, reste 2. On peut faire 9 groupes complets.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "96 ÷ 8 = ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "96 ÷ 8 = 12 car 8 × 12 = 96.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Dans 75 ÷ 6, quel est le reste ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "6 × 12 = 72. 75 − 72 = 3. Le reste est 3.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "On veut répartir 100 élèves en groupes de 7. Combien d'élèves ne seront pas dans un groupe complet ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication: "100 ÷ 7 = 14, reste 2. Car 7 × 14 = 98 et 100 − 98 = 2.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function DivisionCM1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex, session],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
    setSession((s) => s + 1);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Division posée</span>
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
          <div className="lecon-badge">➗ Division posée · CM1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
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
              let className = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) className += " correct";
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
              ? "Tu maîtrises parfaitement la division posée !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cm1/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
