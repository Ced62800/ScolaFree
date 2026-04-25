"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Pourcentages (5)
  {
    id: 1,
    theme: "pourcentages",
    question: "Combien font 10% de 80 ?",
    options: ["4", "8", "10", "16"],
    reponse: "8",
    explication: "10% de 80 = 80 × 10 ÷ 100 = 8.",
  },
  {
    id: 2,
    theme: "pourcentages",
    question: "Combien font 25% de 40 ?",
    options: ["5", "8", "10", "15"],
    reponse: "10",
    explication: "25% = le quart. 40 ÷ 4 = 10.",
  },
  {
    id: 3,
    theme: "pourcentages",
    question: "Un article coûte 60 €. Réduction de 10%. Prix final ?",
    options: ["50 €", "54 €", "56 €", "58 €"],
    reponse: "54 €",
    explication: "10% de 60 = 6 €. Prix = 60 - 6 = 54 €.",
  },
  {
    id: 4,
    theme: "pourcentages",
    question: "3/4 exprimé en pourcentage = ?",
    options: ["34%", "43%", "75%", "25%"],
    reponse: "75%",
    explication: "3 ÷ 4 = 0,75 = 75%.",
  },
  {
    id: 5,
    theme: "pourcentages",
    question: "Dans une classe de 30 élèves, 60% sont des filles. Combien ?",
    options: ["12", "15", "18", "20"],
    reponse: "18",
    explication: "60% de 30 = 18 filles.",
  },
  // Proportionnalité (5)
  {
    id: 6,
    theme: "proportionnalite",
    question: "1 cahier coûte 3 €. Combien coûtent 4 cahiers ?",
    options: ["9 €", "12 €", "15 €", "7 €"],
    reponse: "12 €",
    explication: "4 × 3 = 12 €.",
  },
  {
    id: 7,
    theme: "proportionnalite",
    question: "Une voiture roule à 90 km/h. En 2h, quelle distance ?",
    options: ["90 km", "150 km", "180 km", "270 km"],
    reponse: "180 km",
    explication: "90 × 2 = 180 km.",
  },
  {
    id: 8,
    theme: "proportionnalite",
    question: "4 kg de pommes coûtent 8 €. Combien coûtent 7 kg ?",
    options: ["12 €", "14 €", "16 €", "18 €"],
    reponse: "14 €",
    explication: "1 kg = 2 €. 7 kg = 14 €.",
  },
  {
    id: 9,
    theme: "proportionnalite",
    question: "Tableau : 5 → 15, 8 → ? Valeur manquante ?",
    options: ["20", "24", "25", "30"],
    reponse: "24",
    explication: "Coefficient = 3. 8 × 3 = 24.",
  },
  {
    id: 10,
    theme: "proportionnalite",
    question: "Une voiture parcourt 300 km en 4h. Quelle est sa vitesse ?",
    options: ["65 km/h", "70 km/h", "75 km/h", "80 km/h"],
    reponse: "75 km/h",
    explication: "300 ÷ 4 = 75 km/h.",
  },
  // Problèmes (5)
  {
    id: 11,
    theme: "problemes",
    question: "Un livre coûte 12,50 €. Paul en achète 3. Combien paie-t-il ?",
    options: ["35,50 €", "37,50 €", "38,50 €", "39,50 €"],
    reponse: "37,50 €",
    explication: "3 × 12,50 = 37,50 €.",
  },
  {
    id: 12,
    theme: "problemes",
    question: "Tom achète 4 stylos à 1,25 € et 3 cahiers à 2,50 €. Combien ?",
    options: ["11,50 €", "12,00 €", "12,50 €", "13,00 €"],
    reponse: "12,50 €",
    explication: "4×1,25 + 3×2,50 = 5 + 7,50 = 12,50 €.",
  },
  {
    id: 13,
    theme: "problemes",
    question: "Un vêtement coûte 60 €. Soldé à -20%. Prix final ?",
    options: ["42 €", "44 €", "46 €", "48 €"],
    reponse: "48 €",
    explication: "20% de 60 = 12 €. Prix = 60 - 12 = 48 €.",
  },
  {
    id: 14,
    theme: "problemes",
    question: "Paul gagne 150 €/semaine. En 5 semaines, dépense 480 €. Reste ?",
    options: ["240 €", "250 €", "260 €", "270 €"],
    reponse: "270 €",
    explication: "5 × 150 = 750 €. 750 - 480 = 270 €.",
  },
  {
    id: 15,
    theme: "problemes",
    question: "Une corde de 9,6 m est coupée en morceaux de 0,8 m. Combien ?",
    options: ["10", "11", "12", "14"],
    reponse: "12",
    explication: "9,6 ÷ 0,8 = 12 morceaux.",
  },
  // Calcul mental (5)
  {
    id: 16,
    theme: "calcul-mental",
    question: "48 + 37 = ?",
    options: ["83", "84", "85", "86"],
    reponse: "85",
    explication: "48 + 30 + 7 = 85.",
  },
  {
    id: 17,
    theme: "calcul-mental",
    question: "3,4 × 10 = ?",
    options: ["0,34", "34", "340", "3,40"],
    reponse: "34",
    explication: "Multiplier par 10 → virgule décalée : 34.",
  },
  {
    id: 18,
    theme: "calcul-mental",
    question: "83 − 29 = ?",
    options: ["52", "53", "54", "55"],
    reponse: "54",
    explication: "83 - 30 + 1 = 54.",
  },
  {
    id: 19,
    theme: "calcul-mental",
    question: "2,5 × 100 = ?",
    options: ["25", "250", "2500", "0,25"],
    reponse: "250",
    explication: "2,5 × 100 = 250.",
  },
  {
    id: 20,
    theme: "calcul-mental",
    question: "156 + 247 = ?",
    options: ["393", "400", "403", "413"],
    reponse: "403",
    explication: "156 + 200 + 47 = 403.",
  },
];

const themeLabels: Record<string, string> = {
  pourcentages: "💯 Pourcentages",
  proportionnalite: "📊 Proportionnalité",
  problemes: "🧩 Problèmes",
  "calcul-mental": "🧮 Calcul mental",
};

const themeColors: Record<string, string> = {
  pourcentages: "#4f8ef7",
  proportionnalite: "#2ec4b6",
  problemes: "#ffd166",
  "calcul-mental": "#ff6b6b",
};

export default function BilanMathsCM2Page2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    pourcentages: 0,
    proportionnalite: 0,
    problemes: 0,
    "calcul-mental": 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("cm2", "maths", "bilan-2");
      const l = await getLastScore("cm2", "maths", "bilan-2");
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
          classe: "cm2",
          matiere: "maths",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("cm2", "maths", "bilan-2");
        const l = await getLastScore("cm2", "maths", "bilan-2");
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
      pourcentages: 0,
      proportionnalite: 0,
      problemes: 0,
      "calcul-mental": 0,
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
          onClick={() => router.push("/cours/primaire/cm2/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>
      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CM2 Maths</div>
          <h1 className="lecon-titre">Bilan Maths CM2 — Partie 2</h1>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Record
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#888",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de Maths CM2 partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>💯</span>
              <span>5 questions de Pourcentages</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📊</span>
              <span>5 questions de Proportionnalité</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🧩</span>
              <span>5 questions de Problèmes</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🧮</span>
              <span>5 questions de Calcul mental</span>
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
                let cn = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    cn += " correct";
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
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Meilleur
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#888",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
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
              ? "Bravo, tu maîtrises les maths CM2 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm2/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
