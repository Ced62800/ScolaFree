"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Multiplication (5)
  {
    id: 1,
    question: "3 × 5 = ?",
    options: ["8", "15", "10", "12"],
    reponse: "15",
    explication: "3 × 5 = 5 + 5 + 5 = 15.",
    theme: "multiplication",
  },
  {
    id: 2,
    question: "10 × 7 = ?",
    options: ["17", "70", "700", "107"],
    reponse: "70",
    explication: "Multiplier par 10 : on ajoute un zéro → 70.",
    theme: "multiplication",
  },
  {
    id: 3,
    question: "4 boîtes contiennent chacune 6 billes. Combien en tout ?",
    options: ["10", "20", "24", "18"],
    reponse: "24",
    explication: "4 × 6 = 24 billes.",
    theme: "multiplication",
  },
  {
    id: 4,
    question: "2 × 9 = ?",
    options: ["11", "18", "16", "20"],
    reponse: "18",
    explication: "2 × 9 = 9 + 9 = 18.",
    theme: "multiplication",
  },
  {
    id: 5,
    question: "5 × 6 = ?",
    options: ["25", "30", "35", "20"],
    reponse: "30",
    explication: "5 × 6 = 30.",
    theme: "multiplication",
  },
  // Fractions (5)
  {
    id: 6,
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "8 ÷ 2 = 4. La moitié de 8 est 4.",
    theme: "fractions",
  },
  {
    id: 7,
    question: "Quel est le quart de 12 ?",
    options: ["4", "3", "6", "2"],
    reponse: "3",
    explication: "12 ÷ 4 = 3. Le quart de 12 est 3.",
    theme: "fractions",
  },
  {
    id: 8,
    question: "Une tarte coupée en 4 parts égales : chaque part est…",
    options: ["1/2", "1/3", "1/4", "1/5"],
    reponse: "1/4",
    explication: "4 parts égales → chaque part = 1/4.",
    theme: "fractions",
  },
  {
    id: 9,
    question: "Quel est le tiers de 9 ?",
    options: ["2", "4", "3", "6"],
    reponse: "3",
    explication: "9 ÷ 3 = 3. Le tiers de 9 est 3.",
    theme: "fractions",
  },
  {
    id: 10,
    question:
      "Marie a 16 billes. Elle en donne la moitié. Combien en garde-t-elle ?",
    options: ["4", "6", "10", "8"],
    reponse: "8",
    explication: "16 ÷ 2 = 8.",
    theme: "fractions",
  },
  // Grandeurs et mesures (5)
  {
    id: 11,
    question: "Combien de cm dans 1 mètre ?",
    options: ["10", "100", "1 000", "50"],
    reponse: "100",
    explication: "1 m = 100 cm.",
    theme: "grandeurs-mesures",
  },
  {
    id: 12,
    question: "Combien de minutes dans 1 heure ?",
    options: ["30", "60", "100", "24"],
    reponse: "60",
    explication: "1 h = 60 min.",
    theme: "grandeurs-mesures",
  },
  {
    id: 13,
    question: "Un sac pèse 2 000 g. Cela fait combien de kilogrammes ?",
    options: ["2 kg", "20 kg", "200 kg", "0,2 kg"],
    reponse: "2 kg",
    explication: "1 kg = 1 000 g → 2 000 g = 2 kg.",
    theme: "grandeurs-mesures",
  },
  {
    id: 14,
    question: "Clara mesure 1 m 25 cm. En centimètres, cela fait…",
    options: ["125 cm", "1025 cm", "12,5 cm", "225 cm"],
    reponse: "125 cm",
    explication: "1 m = 100 cm + 25 cm = 125 cm.",
    theme: "grandeurs-mesures",
  },
  {
    id: 15,
    question:
      "Une récré commence à 10h00 et finit à 10h20. Combien de temps dure-t-elle ?",
    options: ["10 min", "15 min", "20 min", "30 min"],
    reponse: "20 min",
    explication: "De 10h00 à 10h20 = 20 minutes.",
    theme: "grandeurs-mesures",
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
    question: "Comment s'appellent deux lignes qui ne se croisent jamais ?",
    options: ["Perpendiculaires", "Croisées", "Parallèles", "Courbes"],
    reponse: "Parallèles",
    explication: "Deux lignes parallèles ne se croisent jamais.",
    theme: "geometrie",
  },
  {
    id: 19,
    question: "Quel instrument permet de vérifier un angle droit ?",
    options: ["La règle", "Le compas", "L'équerre", "La calculatrice"],
    reponse: "L'équerre",
    explication: "L'équerre permet de tracer et vérifier les angles droits.",
    theme: "geometrie",
  },
  {
    id: 20,
    question: "Quel est le périmètre d'un carré de 6 cm de côté ?",
    options: ["12 cm", "18 cm", "24 cm", "36 cm"],
    reponse: "24 cm",
    explication: "Périmètre = 4 × 6 = 24 cm.",
    theme: "geometrie",
  },
];

const themeLabels: Record<string, string> = {
  multiplication: "✖️ Multiplication",
  fractions: "🍕 Fractions",
  "grandeurs-mesures": "📏 Grandeurs et mesures",
  geometrie: "📐 Géométrie",
};

const themeColors: Record<string, string> = {
  multiplication: "#4f8ef7",
  fractions: "#2ec4b6",
  "grandeurs-mesures": "#ffd166",
  geometrie: "#ff6b6b",
};

export default function BilanMathsCE1Page2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    multiplication: 0,
    fractions: 0,
    "grandeurs-mesures": 0,
    geometrie: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("ce1", "maths", "bilan-2");
      const l = await getLastScore("ce1", "maths", "bilan-2");
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
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce1", "maths", "bilan-2");
        const l = await getLastScore("ce1", "maths", "bilan-2");
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
      multiplication: 0,
      fractions: 0,
      "grandeurs-mesures": 0,
      geometrie: 0,
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
          onClick={() => router.push("/cours/primaire/ce1/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CE1 Maths</div>
          <h1 className="lecon-titre">Bilan Maths CE1 — Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de Maths CE1 partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>✖️</span>
              <span>5 questions de Multiplication</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🍕</span>
              <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📏</span>
              <span>5 questions de Grandeurs et mesures</span>
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
              ? "Bravo, tu maîtrises les maths CE1 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/ce1/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
