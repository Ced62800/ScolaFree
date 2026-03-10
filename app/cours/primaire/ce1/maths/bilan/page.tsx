"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// Intégration de la persistance des scores
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Numération (5)
  {
    id: 1,
    theme: "numeration",
    question: "Quel est le chiffre des centaines dans 743 ?",
    options: ["7", "4", "3", "74"],
    reponse: "7",
    explication: "743 = 7 centaines + 4 dizaines + 3 unités.",
  },
  {
    id: 2,
    theme: "numeration",
    question: "Comment s'écrit « trois cent cinquante-deux » ?",
    options: ["325", "352", "532", "302"],
    reponse: "352",
    explication:
      "Trois cent → 3, cinquante → 5 dizaines, deux → 2 unités : 352.",
  },
  {
    id: 3,
    theme: "numeration",
    question: "Lequel est le plus grand ?",
    options: ["456", "546", "465", "564"],
    reponse: "564",
    explication: "564 a 5 centaines — c'est le plus grand.",
  },
  {
    id: 4,
    theme: "numeration",
    question: "Quel nombre vient juste avant 500 ?",
    options: ["501", "510", "499", "400"],
    reponse: "499",
    explication: "Avant 500 vient 499.",
  },
  {
    id: 5,
    theme: "numeration",
    question: "900 + 70 + 8 = ?",
    options: ["978", "987", "907", "970"],
    reponse: "978",
    explication: "9 centaines + 7 dizaines + 8 unités = 978.",
  },
  // Multiplication (5)
  {
    id: 6,
    theme: "multiplication",
    question: "3 × 5 = ?",
    options: ["8", "15", "10", "12"],
    reponse: "15",
    explication: "3 × 5 = 5 + 5 + 5 = 15.",
  },
  {
    id: 7,
    theme: "multiplication",
    question: "10 × 7 = ?",
    options: ["17", "70", "700", "107"],
    reponse: "70",
    explication: "Multiplier par 10 : on ajoute un zéro → 7 × 10 = 70.",
  },
  {
    id: 8,
    theme: "multiplication",
    question:
      "4 boîtes contiennent chacune 6 billes. Combien de billes en tout ?",
    options: ["10", "20", "24", "18"],
    reponse: "24",
    explication: "4 × 6 = 24 billes.",
  },
  {
    id: 9,
    theme: "multiplication",
    question: "2 × 9 = ?",
    options: ["11", "18", "16", "20"],
    reponse: "18",
    explication: "2 × 9 = 9 + 9 = 18.",
  },
  {
    id: 10,
    theme: "multiplication",
    question: "5 × 6 = ?",
    options: ["25", "30", "35", "20"],
    reponse: "30",
    explication: "5 × 6 = 30.",
  },
  // Fractions (5)
  {
    id: 11,
    theme: "fractions",
    question: "Une tarte coupée en 4 parts égales : chaque part est…",
    options: ["1/2", "1/3", "1/4", "1/5"],
    reponse: "1/4",
    explication: "4 parts égales → chaque part = 1/4 (un quart).",
  },
  {
    id: 12,
    theme: "fractions",
    question: "Laquelle de ces fractions est la plus grande ?",
    options: ["1/4", "1/3", "1/2", "Elles sont pareilles"],
    reponse: "1/2",
    explication: "1/2 > 1/3 > 1/4.",
  },
  {
    id: 13,
    theme: "fractions",
    question:
      "Un ruban est partagé en 3 parts égales. Julie prend 1 part. Quelle fraction a-t-elle ?",
    options: ["1/2", "1/3", "2/3", "3/1"],
    reponse: "1/3",
    explication: "3 parts, 1 prise : Julie a 1/3.",
  },
  {
    id: 14,
    theme: "fractions",
    question: "Dans 1/4, que représente le 4 ?",
    options: [
      "Les parts prises",
      "Le total de parts égales",
      "La taille",
      "Rien",
    ],
    reponse: "Le total de parts égales",
    explication: "Le dénominateur (bas) = nombre total de parts égales.",
  },
  {
    id: 15,
    theme: "fractions",
    question: "Hugo mange la moitié d'une pomme. Quelle fraction reste-t-il ?",
    options: ["1/4", "1/3", "1/2", "0"],
    reponse: "1/2",
    explication: "La moitié = 1/2 mangée. Il reste 1/2.",
  },
  // Mesures (5)
  {
    id: 16,
    theme: "mesures",
    question: "Combien de cm dans 1 mètre ?",
    options: ["10", "100", "1 000", "50"],
    reponse: "100",
    explication: "1 m = 100 cm.",
  },
  {
    id: 17,
    theme: "mesures",
    question: "Combien de minutes dans 1 heure ?",
    options: ["30", "60", "100", "24"],
    reponse: "60",
    explication: "1 h = 60 min.",
  },
  {
    id: 18,
    theme: "mesures",
    question: "Un sac pèse 2 000 g. Cela fait combien de kilogrammes ?",
    options: ["2 kg", "20 kg", "200 kg", "0,2 kg"],
    reponse: "2 kg",
    explication: "1 kg = 1 000 g → 2 000 g = 2 kg.",
  },
  {
    id: 19,
    theme: "mesures",
    question: "Clara mesure 1 m 25 cm. En centimètres, cela fait…",
    options: ["125 cm", "1025 cm", "12,5 cm", "225 cm"],
    reponse: "125 cm",
    explication: "1 m = 100 cm + 25 cm = 125 cm.",
  },
  {
    id: 20,
    theme: "mesures",
    question:
      "Une récréation commence à 10h00 et finit à 10h20. Combien de temps dure-t-elle ?",
    options: ["10 min", "15 min", "20 min", "30 min"],
    reponse: "20 min",
    explication: "De 10h00 à 10h20 = 20 minutes.",
  },
];

const themeLabels: Record<string, string> = {
  numeration: "🔢 Numération",
  multiplication: "✖️ Multiplication",
  fractions: "🍕 Fractions",
  mesures: "📏 Mesures",
};

const themeColors: Record<string, string> = {
  numeration: "#4f8ef7",
  multiplication: "#2ec4b6",
  fractions: "#ffd166",
  mesures: "#ff6b6b",
};

export default function BilanCE1Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    numeration: 0,
    multiplication: 0,
    fractions: 0,
    mesures: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  // États pour la persistance
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);

  // Charger les scores au montage
  useEffect(() => {
    const loadScores = async () => {
      const b = await getBestScore("ce1", "maths", "bilan");
      const l = await getLastScore("ce1", "maths", "bilan");
      setBestScore(b);
      setLastScore(l);
    };
    loadScores();
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
      // Sauvegarde automatique du score final
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce1",
          matiere: "maths",
          theme: "bilan",
          score: totalScore,
          total: 20,
        });
        // Rafraîchir les données locales
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
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ numeration: 0, multiplication: 0, fractions: 0, mesures: 0 });
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

          {/* Records personnels */}
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
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
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
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#888",
                      textTransform: "uppercase",
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
            Ce bilan regroupe des questions sur les 4 thèmes de Maths du CE1.
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
              <span>📏</span>
              <span>5 questions de Mesures</span>
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

          {bestScore && totalScore < bestScore.score && (
            <div
              style={{
                fontSize: "0.9rem",
                color: "#888",
                marginBottom: "15px",
              }}
            >
              Record à battre : {bestScore.score}/20
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
