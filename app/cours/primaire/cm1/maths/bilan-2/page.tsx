"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Fractions (5)
  {
    id: 1,
    theme: "fractions",
    question: "Quelle fraction est équivalente à 1/2 ?",
    options: ["2/3", "2/4", "3/4", "1/4"],
    reponse: "2/4",
    explication: "1/2 = 2/4 car on multiplie par 2.",
  },
  {
    id: 2,
    theme: "fractions",
    question: "Que vaut 3/10 en nombre décimal ?",
    options: ["3", "0,3", "0,03", "30"],
    reponse: "0,3",
    explication: "3/10 = 0,3 (3 dixièmes).",
  },
  {
    id: 3,
    theme: "fractions",
    question: "2/6 + 3/6 = ?",
    options: ["5/6", "5/12", "6/6", "1/6"],
    reponse: "5/6",
    explication: "2 + 3 = 5, on garde 6 → 5/6.",
  },
  {
    id: 4,
    theme: "fractions",
    question: "Que vaut 25/100 en nombre décimal ?",
    options: ["2,5", "0,25", "25", "0,025"],
    reponse: "0,25",
    explication: "25/100 = 0,25 (25 centièmes).",
  },
  {
    id: 5,
    theme: "fractions",
    question: "Laquelle est la plus grande : 3/8 ou 5/8 ?",
    options: ["3/8", "5/8", "Elles sont égales", "On ne peut pas savoir"],
    reponse: "5/8",
    explication: "Même dénominateur : 5 > 3 → 5/8 > 3/8.",
  },
  // Proportionnalité (5)
  {
    id: 6,
    theme: "proportionnalite",
    question: "1 cahier coûte 2 €. Combien coûtent 4 cahiers ?",
    options: ["6 €", "8 €", "10 €", "4 €"],
    reponse: "8 €",
    explication: "4 × 2 = 8 €.",
  },
  {
    id: 7,
    theme: "proportionnalite",
    question: "3 kg de carottes coûtent 6 €. Combien coûtent 7 kg ?",
    options: ["12 €", "14 €", "16 €", "18 €"],
    reponse: "14 €",
    explication: "1 kg = 2 €. 7 kg = 14 €.",
  },
  {
    id: 8,
    theme: "proportionnalite",
    question: "Une voiture roule à 80 km/h. En 2 heures, quelle distance ?",
    options: ["80 km", "120 km", "160 km", "40 km"],
    reponse: "160 km",
    explication: "80 × 2 = 160 km.",
  },
  {
    id: 9,
    theme: "proportionnalite",
    question:
      "Dans ce tableau : 4 → 12, 6 → ? Quelle est la valeur manquante ?",
    options: ["16", "18", "20", "24"],
    reponse: "18",
    explication: "Coefficient = 3. 6 × 3 = 18.",
  },
  {
    id: 10,
    theme: "proportionnalite",
    question:
      "Une voiture parcourt 240 km en 3 heures. Quelle est sa vitesse ?",
    options: ["60 km/h", "70 km/h", "80 km/h", "90 km/h"],
    reponse: "80 km/h",
    explication: "240 ÷ 3 = 80 km/h.",
  },
  // Addition décimaux (5)
  {
    id: 11,
    theme: "addition-decimaux",
    question: "3,45 + 2,30 = ?",
    options: ["5,65", "5,70", "5,75", "5,80"],
    reponse: "5,75",
    explication: "3,45 + 2,30 = 5,75.",
  },
  {
    id: 12,
    theme: "addition-decimaux",
    question: "8,70 − 3,45 = ?",
    options: ["5,15", "5,20", "5,25", "5,30"],
    reponse: "5,25",
    explication: "8,70 − 3,45 = 5,25.",
  },
  {
    id: 13,
    theme: "addition-decimaux",
    question: "12,5 + 3,75 = ?",
    options: ["16,15", "16,20", "16,25", "16,30"],
    reponse: "16,25",
    explication: "12,5 + 3,75 = 16,25.",
  },
  {
    id: 14,
    theme: "addition-decimaux",
    question: "10,0 − 4,5 = ?",
    options: ["5,0", "5,5", "6,0", "6,5"],
    reponse: "5,5",
    explication: "10,0 − 4,5 = 5,5.",
  },
  {
    id: 15,
    theme: "addition-decimaux",
    question: "15,60 − 8,75 = ?",
    options: ["6,75", "6,80", "6,85", "6,90"],
    reponse: "6,85",
    explication: "15,60 − 8,75 = 6,85.",
  },
  // Problèmes (5)
  {
    id: 16,
    theme: "problemes",
    question: "Un livre coûte 8,50 €. Paul en achète 3. Combien paie-t-il ?",
    options: ["24,50 €", "25,00 €", "25,50 €", "26,00 €"],
    reponse: "25,50 €",
    explication: "3 × 8,50 = 25,50 €.",
  },
  {
    id: 17,
    theme: "problemes",
    question: "Léa a 50 €. Elle dépense 23,75 €. Combien lui reste-t-il ?",
    options: ["25,25 €", "26,00 €", "26,25 €", "27,00 €"],
    reponse: "26,25 €",
    explication: "50,00 − 23,75 = 26,25 €.",
  },
  {
    id: 18,
    theme: "problemes",
    question:
      "Tom achète 3 stylos à 1,50 € et 2 cahiers à 2,25 €. Combien dépense-t-il ?",
    options: ["8,50 €", "9,00 €", "9,50 €", "10,00 €"],
    reponse: "9,00 €",
    explication: "3×1,50 + 2×2,25 = 4,50 + 4,50 = 9,00 €.",
  },
  {
    id: 19,
    theme: "problemes",
    question:
      "Une classe de 28 élèves est répartie en groupes de 4. Combien de groupes ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "28 ÷ 4 = 7 groupes.",
  },
  {
    id: 20,
    theme: "problemes",
    question:
      "Paul gagne 120 € par semaine. En 4 semaines, il dépense 345 €. Combien lui reste-t-il ?",
    options: ["125 €", "135 €", "145 €", "155 €"],
    reponse: "135 €",
    explication: "4 × 120 = 480 €. 480 − 345 = 135 €.",
  },
];

const themeLabels: Record<string, string> = {
  fractions: "🍕 Fractions",
  proportionnalite: "📊 Proportionnalité",
  "addition-decimaux": "➕ Opérations décimales",
  problemes: "🧩 Problèmes",
};

const themeColors: Record<string, string> = {
  fractions: "#4f8ef7",
  proportionnalite: "#2ec4b6",
  "addition-decimaux": "#ffd166",
  problemes: "#ff6b6b",
};

export default function BilanMathsCM1Page2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    fractions: 0,
    proportionnalite: 0,
    "addition-decimaux": 0,
    problemes: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("cm1", "maths", "bilan-2");
      const l = await getLastScore("cm1", "maths", "bilan-2");
      setBestScore(b);
      setLastScore(l);
    };
    load();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);
  const progression = Math.round((qIndex / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
      scoreRef.current += 1;
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "cm1",
          matiere: "maths",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("cm1", "maths", "bilan-2");
        const l = await getLastScore("cm1", "maths", "bilan-2");
        setBestScore(b);
        setLastScore(l);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    isSaving.current = false;
    scoreRef.current = 0;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({
      fractions: 0,
      proportionnalite: 0,
      "addition-decimaux": 0,
      problemes: 0,
    });
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
          onClick={() => router.push("/cours/primaire/cm1/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CM1 Maths</div>
          <h1 className="lecon-titre">Bilan Maths CM1 — Partie 2</h1>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "10px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#2ec4b6" }}>
                    🏆 Record
                  </div>
                  <div style={{ fontWeight: "bold" }}>{bestScore.score}/20</div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    🕒 Dernier
                  </div>
                  <div style={{ fontWeight: "bold" }}>{lastScore.score}/20</div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de Maths CM1 partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🍕</span>
              <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📊</span>
              <span>5 questions de Proportionnalité</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>➕</span>
              <span>5 questions d'Opérations décimales</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🧩</span>
              <span>5 questions de Problèmes</span>
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

      {etape === "qcm" && shuffledQuestions[qIndex] && (
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
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "10px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#2ec4b6" }}>
                    🏆 Meilleur
                  </div>
                  <div style={{ fontWeight: "bold" }}>{bestScore.score}/20</div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    🕒 Dernier
                  </div>
                  <div style={{ fontWeight: "bold" }}>{lastScore.score}/20</div>
                </div>
              )}
            </div>
          )}
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
              ? "Bravo, tu maîtrises les maths CM1 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm1/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
