"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Numération (5)
  {
    id: 1,
    theme: "numeration",
    question: "Quel est le chiffre des milliers dans 7 485 ?",
    options: ["4", "5", "7", "8"],
    reponse: "7",
    explication: "7 485 = 7 milliers + 4 centaines + 8 dizaines + 5 unités.",
  },
  {
    id: 2,
    theme: "numeration",
    question: "Comment s'écrit « cinq mille deux cent huit » ?",
    options: ["5 280", "5 208", "5 028", "5 820"],
    reponse: "5 208",
    explication:
      "Cinq mille → 5 000, deux cent → 200, huit → 8. Total : 5 208.",
  },
  {
    id: 3,
    theme: "numeration",
    question: "Lequel est le plus grand ?",
    options: ["3 999", "4 001", "4 000", "3 998"],
    reponse: "4 001",
    explication: "4 001 a 4 milliers, les autres n'en ont que 3.",
  },
  {
    id: 4,
    theme: "numeration",
    question: "Quel nombre vient juste après 9 999 ?",
    options: ["9 998", "10 000", "10 001", "9 990"],
    reponse: "10 000",
    explication: "Après 9 999 vient 10 000.",
  },
  {
    id: 5,
    theme: "numeration",
    question: "3 000 + 400 + 60 + 7 = ?",
    options: ["3 467", "3 476", "3 647", "3 746"],
    reponse: "3 467",
    explication: "3 milliers + 4 centaines + 6 dizaines + 7 unités = 3 467.",
  },
  // Multiplication (5)
  {
    id: 6,
    theme: "multiplication",
    question: "7 × 8 = ?",
    options: ["54", "56", "63", "48"],
    reponse: "56",
    explication: "7 × 8 = 56.",
  },
  {
    id: 7,
    theme: "multiplication",
    question: "24 × 3 = ?",
    options: ["68", "70", "72", "74"],
    reponse: "72",
    explication:
      "24 × 3 : 3 × 4 = 12 (pose 2, retient 1). 3 × 2 = 6 + 1 = 7. Résultat : 72.",
  },
  {
    id: 8,
    theme: "multiplication",
    question: "15 × 4 = ?",
    options: ["54", "58", "60", "64"],
    reponse: "60",
    explication:
      "15 × 4 : 4 × 5 = 20 (pose 0, retient 2). 4 × 1 = 4 + 2 = 6. Résultat : 60.",
  },
  {
    id: 9,
    theme: "multiplication",
    question: "30 × 6 = ?",
    options: ["160", "180", "200", "120"],
    reponse: "180",
    explication: "30 × 6 = 180. (3 × 6 = 18, puis on ajoute le zéro).",
  },
  {
    id: 10,
    theme: "multiplication",
    question:
      "Une caisse contient 48 bouteilles. Combien y en a-t-il dans 2 caisses ?",
    options: ["86", "92", "96", "84"],
    reponse: "96",
    explication:
      "48 × 2 : 2 × 8 = 16 (pose 6, retient 1). 2 × 4 = 8 + 1 = 9. Résultat : 96.",
  },
  // Fractions (5)
  {
    id: 11,
    theme: "fractions",
    question: "Comment lit-on 3/4 ?",
    options: ["Trois demis", "Trois quarts", "Quatre tiers", "Un quart"],
    reponse: "Trois quarts",
    explication: "3/4 se lit « trois quarts ».",
  },
  {
    id: 12,
    theme: "fractions",
    question: "Laquelle est la plus grande : 4/7 ou 2/7 ?",
    options: ["4/7", "2/7", "Elles sont égales", "On ne sait pas"],
    reponse: "4/7",
    explication: "Même dénominateur (7) : 4 > 2, donc 4/7 > 2/7.",
  },
  {
    id: 13,
    theme: "fractions",
    question: "Que vaut 5/5 ?",
    options: ["0", "1/2", "1 entier", "5 entiers"],
    reponse: "1 entier",
    explication: "Numérateur = dénominateur → la fraction vaut 1 entier.",
  },
  {
    id: 14,
    theme: "fractions",
    question:
      "Un gâteau coupé en 6 parts : on en mange 2/6. Quelle fraction reste-t-il ?",
    options: ["2/6", "3/6", "4/6", "5/6"],
    reponse: "4/6",
    explication: "6/6 − 2/6 = 4/6.",
  },
  {
    id: 15,
    theme: "fractions",
    question: "Laquelle est la plus grande : 1/4 ou 1/6 ?",
    options: ["1/4", "1/6", "Elles sont égales", "On ne sait pas"],
    reponse: "1/4",
    explication: "Même numérateur (1) : 4 < 6, donc 1/4 > 1/6.",
  },
  // Géométrie (5)
  {
    id: 16,
    theme: "geometrie",
    question: "Un angle droit mesure combien de degrés ?",
    options: ["45°", "60°", "90°", "180°"],
    reponse: "90°",
    explication: "Un angle droit mesure exactement 90°.",
  },
  {
    id: 17,
    theme: "geometrie",
    question: "Quel est le périmètre d'un carré de côté 5 cm ?",
    options: ["10 cm", "15 cm", "20 cm", "25 cm"],
    reponse: "20 cm",
    explication: "Périmètre = 4 × 5 = 20 cm.",
  },
  {
    id: 18,
    theme: "geometrie",
    question: "La lettre M a-t-elle un axe de symétrie ?",
    options: ["Oui", "Non"],
    reponse: "Oui",
    explication: "La lettre M a un axe de symétrie vertical.",
  },
  {
    id: 19,
    theme: "geometrie",
    question: "Quel est le périmètre d'un rectangle de 7 cm × 4 cm ?",
    options: ["11 cm", "22 cm", "28 cm", "18 cm"],
    reponse: "22 cm",
    explication: "Périmètre = 2 × (7 + 4) = 2 × 11 = 22 cm.",
  },
  {
    id: 20,
    theme: "geometrie",
    question: "Un angle obtus est…",
    options: [
      "Inférieur à 90°",
      "Égal à 90°",
      "Supérieur à 90°",
      "Égal à 180°",
    ],
    reponse: "Supérieur à 90°",
    explication: "Un angle obtus est entre 90° et 180°.",
  },
];

const themeLabels: Record<string, string> = {
  numeration: "🔢 Numération",
  multiplication: "✖️ Multiplication",
  fractions: "🍕 Fractions",
  geometrie: "📐 Géométrie",
};

const themeColors: Record<string, string> = {
  numeration: "#4f8ef7",
  multiplication: "#2ec4b6",
  fractions: "#ffd166",
  geometrie: "#ff6b6b",
};

export default function BilanCE2Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    numeration: 0,
    multiplication: 0,
    fractions: 0,
    geometrie: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
    }
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= shuffledQuestions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ numeration: 0, multiplication: 0, fractions: 0, geometrie: 0 });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14)
      return { label: "Bien joué !", icon: "⭐", color: "#4f8ef7" };
    if (score >= 10)
      return { label: "Assez bien !", icon: "👍", color: "#ffd166" };
    return { label: "À revoir !", icon: "💪", color: "#ff6b6b" };
  };

  const mention = getMention(totalScore);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/ce2/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE2 Maths</div>
          <h1 className="lecon-titre">Bilan Final — CE2 Mathématiques</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes de Maths du CE2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span>
              <span>5 questions de Numération</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>✖️</span>
              <span>5 questions de Multiplication</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🍕</span>
              <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📐</span>
              <span>5 questions de Géométrie</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <>
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {qIndex + 1} / {shuffledQuestions.length}
              </span>
              <span
                style={{ color: themeColors[shuffledQuestions[qIndex].theme] }}
              >
                {themeLabels[shuffledQuestions[qIndex].theme]}
              </span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{ width: `${progression}%` }}
              ></div>
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let className = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    className += " correct";
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
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Bravo !"
                      : "Pas tout à fait..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "Voir mon bilan →"
                  : "Question suivante →"}
              </button>
            )}
          </div>
        </>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{mention.icon}</div>
          <h2 className="resultat-titre" style={{ color: mention.color }}>
            {mention.label}
          </h2>
          <div className="resultat-score" style={{ color: mention.color }}>
            {totalScore} / 20
          </div>
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Détail par thème</h3>
            {Object.entries(scores).map(([theme, score]) => (
              <div key={theme} className="bilan-detail-row">
                <span className="bilan-detail-label">{themeLabels[theme]}</span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{
                      width: `${(score / 5) * 100}%`,
                      backgroundColor: themeColors[theme],
                    }}
                  ></div>
                </div>
                <span className="bilan-detail-score">{score}/5</span>
              </div>
            ))}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Bravo, tu es un(e) champion(ne) des maths ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Courage ! Reprends les leçons et réessaie."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/ce2/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
