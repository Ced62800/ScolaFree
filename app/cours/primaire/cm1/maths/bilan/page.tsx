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
    question: "Quel chiffre est au rang des dixièmes dans 6,35 ?",
    options: ["6", "3", "5", "35"],
    reponse: "3",
    explication: "6,35 : partie entière = 6, dixièmes = 3, centièmes = 5.",
  },
  {
    id: 2,
    theme: "decimaux",
    question: "Lequel est le plus grand : 4,25 ou 4,3 ?",
    options: ["4,25", "4,3", "Ils sont égaux", "On ne peut pas savoir"],
    reponse: "4,3",
    explication: "4,3 = 4,30. Au rang des dixièmes : 3 > 2, donc 4,3 > 4,25.",
  },
  {
    id: 3,
    theme: "decimaux",
    question: "Que vaut 2 unités + 4 dixièmes + 5 centièmes ?",
    options: ["2,45", "24,5", "2,54", "245"],
    reponse: "2,45",
    explication: "2 unités + 4 dixièmes + 5 centièmes = 2,45.",
  },
  {
    id: 4,
    theme: "decimaux",
    question: "Entre 7,4 et 7,5, quel nombre peut-on trouver ?",
    options: ["7,6", "7,45", "7,3", "8,0"],
    reponse: "7,45",
    explication: "7,45 est entre 7,40 et 7,50.",
  },
  {
    id: 5,
    theme: "decimaux",
    question:
      "Quel nombre décimal correspond à « huit unités et trois centièmes » ?",
    options: ["8,3", "8,03", "83", "0,83"],
    reponse: "8,03",
    explication: "8 unités + 0 dixième + 3 centièmes = 8,03.",
  },
  // Fractions (5)
  {
    id: 6,
    theme: "fractions",
    question: "Quelle fraction est équivalente à 1/2 ?",
    options: ["2/3", "2/4", "3/4", "1/4"],
    reponse: "2/4",
    explication: "1/2 = 2/4 car on multiplie numérateur et dénominateur par 2.",
  },
  {
    id: 7,
    theme: "fractions",
    question: "Que vaut 3/10 en nombre décimal ?",
    options: ["3", "0,3", "0,03", "30"],
    reponse: "0,3",
    explication: "3/10 = 0,3 (3 dixièmes).",
  },
  {
    id: 8,
    theme: "fractions",
    question: "2/6 + 3/6 = ?",
    options: ["5/6", "5/12", "6/6", "1/6"],
    reponse: "5/6",
    explication: "Même dénominateur : 2 + 3 = 5, on garde 6. Résultat : 5/6.",
  },
  {
    id: 9,
    theme: "fractions",
    question: "Que vaut 25/100 en nombre décimal ?",
    options: ["2,5", "0,25", "25", "0,025"],
    reponse: "0,25",
    explication: "25/100 = 0,25 (25 centièmes).",
  },
  {
    id: 10,
    theme: "fractions",
    question: "Quelle fraction est équivalente à 3/4 ?",
    options: ["6/10", "6/8", "9/16", "4/5"],
    reponse: "6/8",
    explication: "3/4 = 6/8 car on multiplie numérateur et dénominateur par 2.",
  },
  // Division (5)
  {
    id: 11,
    theme: "division",
    question: "Combien font 56 ÷ 8 ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "56 ÷ 8 = 7 car 8 × 7 = 56.",
  },
  {
    id: 12,
    theme: "division",
    question: "29 ÷ 4, quel est le reste ?",
    options: ["0", "1", "2", "3"],
    reponse: "1",
    explication: "4 × 7 = 28. 29 − 28 = 1. Le reste est 1.",
  },
  {
    id: 13,
    theme: "division",
    question: "96 ÷ 8 = ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "96 ÷ 8 = 12 car 8 × 12 = 96.",
  },
  {
    id: 14,
    theme: "division",
    question:
      "On répartit 47 billes en groupes de 5. Combien de groupes complets ?",
    options: ["8", "9", "10", "11"],
    reponse: "9",
    explication: "47 ÷ 5 = 9, reste 2. On peut faire 9 groupes complets.",
  },
  {
    id: 15,
    theme: "division",
    question: "Dans 75 ÷ 6, quel est le reste ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "6 × 12 = 72. 75 − 72 = 3. Le reste est 3.",
  },
  // Proportionnalité (5)
  {
    id: 16,
    theme: "proportionnalite",
    question: "1 cahier coûte 2 €. Combien coûtent 4 cahiers ?",
    options: ["6 €", "8 €", "10 €", "4 €"],
    reponse: "8 €",
    explication: "4 × 2 = 8 €.",
  },
  {
    id: 17,
    theme: "proportionnalite",
    question: "3 kg de carottes coûtent 6 €. Combien coûtent 7 kg ?",
    options: ["12 €", "14 €", "16 €", "18 €"],
    reponse: "14 €",
    explication: "1 kg = 6 ÷ 3 = 2 €. 7 kg = 7 × 2 = 14 €.",
  },
  {
    id: 18,
    theme: "proportionnalite",
    question: "Une voiture roule à 80 km/h. En 2 heures, quelle distance ?",
    options: ["80 km", "120 km", "160 km", "40 km"],
    reponse: "160 km",
    explication: "80 × 2 = 160 km.",
  },
  {
    id: 19,
    theme: "proportionnalite",
    question:
      "Dans ce tableau : 4 → 12, 6 → ? Quelle est la valeur manquante ?",
    options: ["16", "18", "20", "24"],
    reponse: "18",
    explication: "Coefficient = 12 ÷ 4 = 3. 6 × 3 = 18.",
  },
  {
    id: 20,
    theme: "proportionnalite",
    question:
      "Une voiture parcourt 240 km en 3 heures. Quelle est sa vitesse ?",
    options: ["60 km/h", "70 km/h", "80 km/h", "90 km/h"],
    reponse: "80 km/h",
    explication: "Vitesse = 240 ÷ 3 = 80 km/h.",
  },
];

const themeLabels: Record<string, string> = {
  decimaux: "🔢 Décimaux",
  fractions: "🍕 Fractions",
  division: "➗ Division",
  proportionnalite: "📊 Proportionnalité",
};

const themeColors: Record<string, string> = {
  decimaux: "#4f8ef7",
  fractions: "#2ec4b6",
  division: "#ffd166",
  proportionnalite: "#ff6b6b",
};

export default function BilanCM1Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    decimaux: 0,
    fractions: 0,
    division: 0,
    proportionnalite: 0,
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
    setScores({ decimaux: 0, fractions: 0, division: 0, proportionnalite: 0 });
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
          onClick={() => router.push("/cours/primaire/cm1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM1 Maths</div>
          <h1 className="lecon-titre">Bilan Final — CM1 Mathématiques</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes de Maths du CM1.
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
              <span>➗</span>
              <span>5 questions de Division</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📊</span>
              <span>5 questions de Proportionnalité</span>
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
