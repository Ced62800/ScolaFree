"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Décimaux (5)
  {
    id: 1,
    theme: "decimaux",
    question: "3,4 + 2,1 = ?",
    options: ["5,4", "5,5", "5,6", "6,5"],
    reponse: "5,5",
    explication: "3,4 + 2,1 = 5,5.",
  },
  {
    id: 2,
    theme: "decimaux",
    question: "4,25 + 1,3 = ?",
    options: ["4,55", "5,25", "5,55", "5,65"],
    reponse: "5,55",
    explication: "4,25 + 1,30 = 5,55.",
  },
  {
    id: 3,
    theme: "decimaux",
    question: "8,4 − 3,65 = ?",
    options: ["4,65", "4,75", "5,25", "4,85"],
    reponse: "4,75",
    explication: "8,40 − 3,65 = 4,75.",
  },
  {
    id: 4,
    theme: "decimaux",
    question: "2,35 × 3 = ?",
    options: ["6,05", "7,05", "7,15", "6,95"],
    reponse: "7,05",
    explication: "235 × 3 = 705, puis on place la virgule → 7,05.",
  },
  {
    id: 5,
    theme: "decimaux",
    question: "Tom a 20 € et dépense 12,75 €. Combien lui reste-t-il ?",
    options: ["7,15 €", "7,25 €", "7,35 €", "8,25 €"],
    reponse: "7,25 €",
    explication: "20,00 − 12,75 = 7,25 €.",
  },
  // Fractions (5)
  {
    id: 6,
    theme: "fractions",
    question: "3/4 + 5/4 = ?",
    options: ["8/8", "8/4", "6/4", "2/4"],
    reponse: "8/4",
    explication: "3 + 5 = 8, on garde 4. Résultat : 8/4 = 2 entiers.",
  },
  {
    id: 7,
    theme: "fractions",
    question: "7/3, combien d'entiers peut-on former ?",
    options: ["1", "2", "3", "7"],
    reponse: "2",
    explication: "3 × 2 = 6 ≤ 7 < 9. On peut former 2 entiers.",
  },
  {
    id: 8,
    theme: "fractions",
    question: "5/8 + 6/8 = ?",
    options: ["11/8", "11/16", "1/8", "10/8"],
    reponse: "11/8",
    explication: "5 + 6 = 11, on garde 8. Résultat : 11/8.",
  },
  {
    id: 9,
    theme: "fractions",
    question: "9/5 − 3/5 = ?",
    options: ["6/5", "6/10", "12/5", "3/5"],
    reponse: "6/5",
    explication: "9 − 3 = 6, on garde 5. Résultat : 6/5.",
  },
  {
    id: 10,
    theme: "fractions",
    question: "7/3 s'écrit comme nombre mixte : ?",
    options: ["1 et 1/3", "2 et 1/3", "2 et 2/3", "3 et 1/3"],
    reponse: "2 et 1/3",
    explication: "3 × 2 = 6. 7 − 6 = 1. Donc 7/3 = 2 et 1/3.",
  },
  // Géométrie (5)
  {
    id: 11,
    theme: "geometrie",
    question: "Quelle est l'aire d'un rectangle de 6 cm × 4 cm ?",
    options: ["20 cm²", "24 cm²", "28 cm²", "10 cm²"],
    reponse: "24 cm²",
    explication: "Aire = 6 × 4 = 24 cm².",
  },
  {
    id: 12,
    theme: "geometrie",
    question: "Quel est le diamètre d'un cercle de rayon 7 cm ?",
    options: ["3,5 cm", "7 cm", "14 cm", "21 cm"],
    reponse: "14 cm",
    explication: "Diamètre = 2 × rayon = 14 cm.",
  },
  {
    id: 13,
    theme: "geometrie",
    question: "Quelle est l'aire d'un triangle de base 8 cm et hauteur 5 cm ?",
    options: ["13 cm²", "20 cm²", "40 cm²", "16 cm²"],
    reponse: "20 cm²",
    explication: "Aire = (8 × 5) ÷ 2 = 20 cm².",
  },
  {
    id: 14,
    theme: "geometrie",
    question: "Quel est le volume d'un pavé droit de 5 cm × 3 cm × 2 cm ?",
    options: ["10 cm³", "20 cm³", "30 cm³", "25 cm³"],
    reponse: "30 cm³",
    explication: "Volume = 5 × 3 × 2 = 30 cm³.",
  },
  {
    id: 15,
    theme: "geometrie",
    question:
      "Quelle est la circonférence d'un cercle de diamètre 10 cm ? (π ≈ 3,14)",
    options: ["31,4 cm", "314 cm", "15,7 cm", "62,8 cm"],
    reponse: "31,4 cm",
    explication: "Circonférence = π × diamètre ≈ 3,14 × 10 = 31,4 cm.",
  },
  // Statistiques (5)
  {
    id: 16,
    theme: "statistiques",
    question: "Quelle est la moyenne de 4, 6 et 8 ?",
    options: ["5", "6", "7", "8"],
    reponse: "6",
    explication: "(4 + 6 + 8) ÷ 3 = 18 ÷ 3 = 6.",
  },
  {
    id: 17,
    theme: "statistiques",
    question: "Léa a eu : 10, 12, 14. Quelle est sa moyenne ?",
    options: ["11", "12", "13", "14"],
    reponse: "12",
    explication: "(10 + 12 + 14) ÷ 3 = 36 ÷ 3 = 12.",
  },
  {
    id: 18,
    theme: "statistiques",
    question:
      "Les températures : 15°, 18°, 12°, 20°, 15°. Quelle est la moyenne ?",
    options: ["14°", "15°", "16°", "17°"],
    reponse: "16°",
    explication: "(15+18+12+20+15) ÷ 5 = 80 ÷ 5 = 16°.",
  },
  {
    id: 19,
    theme: "statistiques",
    question:
      "Une classe a une moyenne de 13 sur 5 épreuves. Quel est le total des notes ?",
    options: ["55", "60", "65", "70"],
    reponse: "65",
    explication: "Total = 13 × 5 = 65.",
  },
  {
    id: 20,
    theme: "statistiques",
    question:
      "4 enfants ont 8, 12, 10 et x bonbons. La moyenne est 10. Que vaut x ?",
    options: ["8", "10", "12", "14"],
    reponse: "10",
    explication: "Total = 10 × 4 = 40. 8+12+10+x = 40. x = 10.",
  },
];

const themeLabels: Record<string, string> = {
  decimaux: "🔢 Décimaux",
  fractions: "🍕 Fractions",
  geometrie: "📐 Géométrie",
  statistiques: "📊 Statistiques",
};

const themeColors: Record<string, string> = {
  decimaux: "#4f8ef7",
  fractions: "#2ec4b6",
  geometrie: "#ffd166",
  statistiques: "#ff6b6b",
};

export default function BilanCM2Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    decimaux: 0,
    fractions: 0,
    geometrie: 0,
    statistiques: 0,
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
    setScores({ decimaux: 0, fractions: 0, geometrie: 0, statistiques: 0 });
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
          onClick={() => router.push("/cours/primaire/cm2/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM2 Maths</div>
          <h1 className="lecon-titre">Bilan Final — CM2 Mathématiques</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes de Maths du CM2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span>
              <span>5 questions de Nombres décimaux</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🍕</span>
              <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📐</span>
              <span>5 questions de Géométrie</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📊</span>
              <span>5 questions de Statistiques</span>
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
              onClick={() => router.push("/cours/primaire/cm2/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
