"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Numération (5)
  {
    id: 1,
    question: "Combien y a-t-il de dizaines dans 47 ?",
    options: ["4", "7", "11", "47"],
    reponse: "4",
    explication: "47 = 4 dizaines + 7 unités.",
    theme: "numeration",
  },
  {
    id: 2,
    question: "Comment s'écrit « soixante-cinq » ?",
    options: ["56", "65", "75", "55"],
    reponse: "65",
    explication: "Soixante = 6 dizaines, cinq = 5 unités → 65.",
    theme: "numeration",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 79 ?",
    options: ["70", "78", "80", "90"],
    reponse: "80",
    explication: "Après 79 vient 80.",
    theme: "numeration",
  },
  {
    id: 4,
    question: "Quel nombre = 6 dizaines + 8 unités ?",
    options: ["86", "68", "66", "88"],
    reponse: "68",
    explication: "6 dizaines + 8 unités = 68.",
    theme: "numeration",
  },
  {
    id: 5,
    question: "Lequel est le plus grand ?",
    options: ["67", "76", "66", "77"],
    reponse: "77",
    explication: "77 a 7 dizaines et 7 unités — c'est le plus grand.",
    theme: "numeration",
  },
  // Addition (5)
  {
    id: 6,
    question: "21 + 14 = ?",
    options: ["34", "35", "36", "25"],
    reponse: "35",
    explication: "21 + 14 : 1+4=5 unités, 2+1=3 dizaines → 35.",
    theme: "addition",
  },
  {
    id: 7,
    question: "27 + 15 = ?",
    options: ["41", "42", "43", "44"],
    reponse: "42",
    explication: "27 + 15 : 7+5=12 → on pose 2, retenue 1. 2+1+1=4 → 42.",
    theme: "addition",
  },
  {
    id: 8,
    question: "45 + 36 = ?",
    options: ["79", "80", "81", "82"],
    reponse: "81",
    explication: "45 + 36 : 5+6=11 → on pose 1, retenue 1. 4+3+1=8 → 81.",
    theme: "addition",
  },
  {
    id: 9,
    question: "Tom a 34 billes. Il en gagne 28. Combien en a-t-il ?",
    options: ["60", "61", "62", "63"],
    reponse: "62",
    explication: "34 + 28 : 4+8=12 → on pose 2, retenue 1. 3+2+1=6 → 62.",
    theme: "addition",
  },
  {
    id: 10,
    question: "67 + 24 = ?",
    options: ["89", "90", "91", "92"],
    reponse: "91",
    explication: "67 + 24 : 7+4=11 → on pose 1, retenue 1. 6+2+1=9 → 91.",
    theme: "addition",
  },
  // Soustraction (5)
  {
    id: 11,
    question: "58 − 23 = ?",
    options: ["33", "34", "35", "36"],
    reponse: "35",
    explication: "58 − 23 : 8-3=5 unités, 5-2=3 dizaines → 35.",
    theme: "soustraction",
  },
  {
    id: 12,
    question: "75 − 38 = ?",
    options: ["35", "36", "37", "38"],
    reponse: "37",
    explication: "75 − 38 : 15-8=7 (emprunt), 6-3=3 → 37.",
    theme: "soustraction",
  },
  {
    id: 13,
    question: "Léa a 54 images. Elle en donne 27. Combien lui en reste-t-il ?",
    options: ["25", "26", "27", "28"],
    reponse: "27",
    explication: "54 − 27 : 14-7=7 (emprunt), 4-2=2 → 27.",
    theme: "soustraction",
  },
  {
    id: 14,
    question: "91 − 36 = ?",
    options: ["53", "54", "55", "56"],
    reponse: "55",
    explication: "91 − 36 : 11-6=5 (emprunt), 8-3=5 → 55.",
    theme: "soustraction",
  },
  {
    id: 15,
    question: "100 − 37 = ?",
    options: ["61", "62", "63", "64"],
    reponse: "63",
    explication: "100 − 37 = 63. Vérif : 63 + 37 = 100 ✓",
    theme: "soustraction",
  },
  // Calcul mental (5)
  {
    id: 16,
    question: "Quel est le double de 6 ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "Double de 6 = 6 + 6 = 12.",
    theme: "calcul-mental",
  },
  {
    id: 17,
    question: "Quelle est la moitié de 16 ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "Moitié de 16 = 8 car 8 + 8 = 16.",
    theme: "calcul-mental",
  },
  {
    id: 18,
    question: "Quel est le complément de 3 à 10 ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication: "3 + 7 = 10.",
    theme: "calcul-mental",
  },
  {
    id: 19,
    question: "Quel est le double de 15 ?",
    options: ["25", "28", "30", "32"],
    reponse: "30",
    explication: "Double de 15 = 15 + 15 = 30.",
    theme: "calcul-mental",
  },
  {
    id: 20,
    question: "Quel est le complément de 40 à 100 ?",
    options: ["50", "60", "70", "80"],
    reponse: "60",
    explication: "40 + 60 = 100.",
    theme: "calcul-mental",
  },
];

const themeLabels: Record<string, string> = {
  numeration: "🔢 Numération",
  addition: "➕ Addition",
  soustraction: "➖ Soustraction",
  "calcul-mental": "🧠 Calcul Mental",
};

const themeColors: Record<string, string> = {
  numeration: "#4f8ef7",
  addition: "#2ec4b6",
  soustraction: "#ffd166",
  "calcul-mental": "#ff6b6b",
};

export default function BilanMathsCE1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    numeration: 0,
    addition: 0,
    soustraction: 0,
    "calcul-mental": 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("ce1", "maths", "bilan");
      const l = await getLastScore("ce1", "maths", "bilan");
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
          classe: "ce1",
          matiere: "maths",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce1", "maths", "bilan");
        const l = await getLastScore("ce1", "maths", "bilan");
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
      numeration: 0,
      addition: 0,
      soustraction: 0,
      "calcul-mental": 0,
    });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14) return { label: "Bien !", icon: "⭐", color: "#4f8ef7" };
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
          onClick={() => router.push("/cours/primaire/ce1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE1 Maths</div>
          <h1 className="lecon-titre">Bilan Final — CE1 Mathématiques</h1>
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
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Record
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
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
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de Maths CE1 partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span>
              <span>5 questions de Numération</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>➕</span>
              <span>5 questions d'Addition</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>➖</span>
              <span>5 questions de Soustraction</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🧠</span>
              <span>5 questions de Calcul Mental</span>
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
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Meilleur
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
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
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
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
              ? "Bravo, tu maîtrises les maths CE1 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau, continue !"
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
              onClick={() => router.push("/cours/primaire/ce1/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
