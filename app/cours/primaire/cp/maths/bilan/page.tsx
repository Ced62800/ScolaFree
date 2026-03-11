"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// Import de ta logique de persistance
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Numération (5)
  {
    id: 1,
    question: "Combien y a-t-il de dizaines dans 30 ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "30 = 3 dizaines.",
    theme: "numeration",
  },
  {
    id: 2,
    question: "Quel nombre vient après 19 ?",
    options: ["18", "20", "21", "10"],
    reponse: "20",
    explication: "Après 19 vient 20.",
    theme: "numeration",
  },
  {
    id: 3,
    question: "Comment écrit-on 'quarante-cinq' ?",
    options: ["54", "44", "45", "40"],
    reponse: "45",
    explication: "Quarante-cinq = 45.",
    theme: "numeration",
  },
  {
    id: 4,
    question: "Combien y a-t-il d'unités dans 47 ?",
    options: ["4", "7", "40", "11"],
    reponse: "7",
    explication: "47 = 4 dizaines + 7 unités.",
    theme: "numeration",
  },
  {
    id: 5,
    question: "Combien font 7 dizaines et 4 unités ?",
    options: ["47", "11", "74", "70"],
    reponse: "74",
    explication: "7 dizaines + 4 unités = 74.",
    theme: "numeration",
  },
  // Addition/Soustraction (5)
  {
    id: 6,
    question: "Combien font 4 + 3 ?",
    options: ["6", "7", "8", "5"],
    reponse: "7",
    explication: "4 + 3 = 7",
    theme: "addition",
  },
  {
    id: 7,
    question: "Combien font 10 - 4 ?",
    options: ["5", "7", "6", "4"],
    reponse: "6",
    explication: "10 - 4 = 6",
    theme: "addition",
  },
  {
    id: 8,
    question: "Combien font 12 + 6 ?",
    options: ["17", "18", "16", "19"],
    reponse: "18",
    explication: "12 + 6 = 18",
    theme: "addition",
  },
  {
    id: 9,
    question: "Léa a 8 bonbons. Elle en mange 3. Combien lui en reste-t-il ?",
    options: ["11", "4", "5", "6"],
    reponse: "5",
    explication: "8 - 3 = 5.",
    theme: "addition",
  },
  {
    id: 10,
    question: "Combien font 20 + 15 ?",
    options: ["34", "35", "36", "25"],
    reponse: "35",
    explication: "20 + 15 = 35",
    theme: "addition",
  },
  // Fractions (5)
  {
    id: 11,
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "8 ÷ 2 = 4.",
    theme: "fractions",
  },
  {
    id: 12,
    question: "Quelle est la moitié de 10 ?",
    options: ["4", "5", "6", "2"],
    reponse: "5",
    explication: "10 ÷ 2 = 5.",
    theme: "fractions",
  },
  {
    id: 13,
    question: "Quel est le quart de 8 ?",
    options: ["4", "3", "2", "1"],
    reponse: "2",
    explication: "8 ÷ 4 = 2.",
    theme: "fractions",
  },
  {
    id: 14,
    question: "Quel est le tiers de 9 ?",
    options: ["2", "4", "3", "6"],
    reponse: "3",
    explication: "9 ÷ 3 = 3.",
    theme: "fractions",
  },
  {
    id: 15,
    question:
      "Marie a 16 billes. Elle en donne la moitié. Combien en garde-t-elle ?",
    options: ["4", "6", "10", "8"],
    reponse: "8",
    explication: "16 ÷ 2 = 8.",
    theme: "fractions",
  },
  // Géométrie (5)
  {
    id: 16,
    question: "Combien de côtés a un triangle ?",
    options: ["2", "4", "3", "5"],
    reponse: "3",
    explication: "Un triangle a 3 côtés.",
    theme: "geometrie",
  },
  {
    id: 17,
    question: "Quelle forme a 4 côtés égaux ?",
    options: ["Triangle", "Cercle", "Rectangle", "Carré"],
    reponse: "Carré",
    explication: "Le carré a 4 côtés égaux.",
    theme: "geometrie",
  },
  {
    id: 18,
    question: "Combien de côtés a un cercle ?",
    options: ["1", "0", "2", "4"],
    reponse: "0",
    explication: "Le cercle n'a pas de côté.",
    theme: "geometrie",
  },
  {
    id: 19,
    question: "Quelle forme ressemble à une roue ?",
    options: ["Carré", "Triangle", "Cercle", "Rectangle"],
    reponse: "Cercle",
    explication: "Une roue est ronde = cercle.",
    theme: "geometrie",
  },
  {
    id: 20,
    question: "Une feuille de papier A4 a quelle forme ?",
    options: ["Carré", "Triangle", "Cercle", "Rectangle"],
    reponse: "Rectangle",
    explication: "Une feuille A4 = rectangle.",
    theme: "geometrie",
  },
];

const themeLabels: Record<string, string> = {
  numeration: "🔢 Numération",
  addition: "➕ Addition/Soustraction",
  fractions: "🍕 Fractions",
  geometrie: "📐 Géométrie",
};

const themeColors: Record<string, string> = {
  numeration: "#4f8ef7",
  addition: "#2ec4b6",
  fractions: "#ffd166",
  geometrie: "#ff6b6b",
};

export default function BilanMathsCP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    numeration: 0,
    addition: 0,
    fractions: 0,
    geometrie: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  // Gestion des records Cédric Flow
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      const b = await getBestScore("cp", "maths", "bilan");
      const l = await getLastScore("cp", "maths", "bilan");
      setBestScore(b);
      setLastScore(l);
    };
    loadData();
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
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "cp",
          matiere: "maths",
          theme: "bilan",
          score: totalScore,
          total: 20,
        });
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    isSaving.current = false;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ numeration: 0, addition: 0, fractions: 0, geometrie: 0 });
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
          onClick={() => router.push("/cours/primaire/cp/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CP Maths</div>
          <h1 className="lecon-titre">Bilan Final — CP Mathématiques</h1>

          {/* Affichage des records de Cédric */}
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46, 196, 182, 0.1)",
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
                    background: "rgba(255, 255, 255, 0.05)",
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
            Ce bilan regroupe des questions sur les 4 thèmes de Maths du CP.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span> <span>5 questions de Numération</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>➕</span> <span>5 questions d'Addition/Soustraction</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🍕</span> <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📐</span> <span>5 questions de Géométrie</span>
            </div>
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

          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
