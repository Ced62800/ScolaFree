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
    question: "Combien y a-t-il de centaines dans 352 ?",
    options: ["2", "3", "5", "35"],
    reponse: "3",
    explication: "352 = 3 centaines + 5 dizaines + 2 unités.",
    theme: "numeration",
  },
  {
    id: 2,
    question: "Comment s'écrit « quatre cent vingt-six » ?",
    options: ["462", "426", "406", "624"],
    reponse: "426",
    explication: "4 centaines + 2 dizaines + 6 unités = 426.",
    theme: "numeration",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 199 ?",
    options: ["200", "198", "210", "190"],
    reponse: "200",
    explication: "Après 199 vient 200.",
    theme: "numeration",
  },
  {
    id: 4,
    question: "Quel nombre = 7 centaines + 3 dizaines + 9 unités ?",
    options: ["739", "793", "937", "379"],
    reponse: "739",
    explication: "700 + 30 + 9 = 739.",
    theme: "numeration",
  },
  {
    id: 5,
    question: "Lequel est le plus grand ?",
    options: ["389", "401", "399", "398"],
    reponse: "401",
    explication: "401 a 4 centaines — c'est le plus grand.",
    theme: "numeration",
  },
  // Multiplication (5)
  {
    id: 6,
    question: "3 × 4 = ?",
    options: ["10", "12", "14", "7"],
    reponse: "12",
    explication: "3 × 4 = 12.",
    theme: "multiplication",
  },
  {
    id: 7,
    question: "6 × 7 = ?",
    options: ["36", "40", "42", "48"],
    reponse: "42",
    explication: "6 × 7 = 42.",
    theme: "multiplication",
  },
  {
    id: 8,
    question: "9 × 8 = ?",
    options: ["63", "72", "81", "56"],
    reponse: "72",
    explication: "9 × 8 = 72.",
    theme: "multiplication",
  },
  {
    id: 9,
    question: "5 boîtes contiennent chacune 8 crayons. Combien en tout ?",
    options: ["35", "38", "40", "45"],
    reponse: "40",
    explication: "5 × 8 = 40 crayons.",
    theme: "multiplication",
  },
  {
    id: 10,
    question: "7 × 7 = ?",
    options: ["42", "46", "49", "56"],
    reponse: "49",
    explication: "7 × 7 = 49.",
    theme: "multiplication",
  },
  // Division (5)
  {
    id: 11,
    question: "12 ÷ 3 = ?",
    options: ["3", "4", "5", "6"],
    reponse: "4",
    explication: "12 ÷ 3 = 4 car 3 × 4 = 12.",
    theme: "division",
  },
  {
    id: 12,
    question: "20 ÷ 5 = ?",
    options: ["3", "4", "5", "6"],
    reponse: "4",
    explication: "20 ÷ 5 = 4 car 5 × 4 = 20.",
    theme: "division",
  },
  {
    id: 13,
    question: "24 ÷ 4 = ?",
    options: ["4", "5", "6", "8"],
    reponse: "6",
    explication: "24 ÷ 4 = 6 car 4 × 6 = 24.",
    theme: "division",
  },
  {
    id: 14,
    question: "30 élèves forment des groupes de 5. Combien de groupes ?",
    options: ["4", "5", "6", "7"],
    reponse: "6",
    explication: "30 ÷ 5 = 6 groupes.",
    theme: "division",
  },
  {
    id: 15,
    question: "13 ÷ 4 = ? (avec reste)",
    options: ["3 reste 0", "3 reste 1", "4 reste 0", "2 reste 5"],
    reponse: "3 reste 1",
    explication: "4 × 3 = 12, reste 13 - 12 = 1.",
    theme: "division",
  },
  // Géométrie (5)
  {
    id: 16,
    question: "Combien de côtés a un triangle ?",
    options: ["2", "3", "4", "5"],
    reponse: "3",
    explication: "Un triangle a 3 côtés.",
    theme: "geometrie",
  },
  {
    id: 17,
    question: "Comment s'appellent deux lignes qui ne se croisent jamais ?",
    options: ["Perpendiculaires", "Croisées", "Parallèles", "Courbes"],
    reponse: "Parallèles",
    explication: "Deux lignes parallèles ne se croisent jamais.",
    theme: "geometrie",
  },
  {
    id: 18,
    question: "Quel est le périmètre d'un carré de 5 cm de côté ?",
    options: ["15 cm", "20 cm", "25 cm", "10 cm"],
    reponse: "20 cm",
    explication: "Périmètre = 4 × 5 = 20 cm.",
    theme: "geometrie",
  },
  {
    id: 19,
    question: "Combien d'angles droits a un rectangle ?",
    options: ["1", "2", "3", "4"],
    reponse: "4",
    explication: "Un rectangle a 4 angles droits.",
    theme: "geometrie",
  },
  {
    id: 20,
    question: "Quel instrument permet de vérifier un angle droit ?",
    options: ["La règle", "Le compas", "L'équerre", "La calculatrice"],
    reponse: "L'équerre",
    explication: "L'équerre permet de tracer et vérifier les angles droits.",
    theme: "geometrie",
  },
];

const themeLabels: Record<string, string> = {
  numeration: "🔢 Numération",
  multiplication: "✖️ Multiplication",
  division: "➗ Division",
  geometrie: "📐 Géométrie",
};

const themeColors: Record<string, string> = {
  numeration: "#4f8ef7",
  multiplication: "#2ec4b6",
  division: "#ffd166",
  geometrie: "#ff6b6b",
};

export default function BilanMathsCE2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    numeration: 0,
    multiplication: 0,
    division: 0,
    geometrie: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("ce2", "maths", "bilan");
      const l = await getLastScore("ce2", "maths", "bilan");
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
          classe: "ce2",
          matiere: "maths",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce2", "maths", "bilan");
        const l = await getLastScore("ce2", "maths", "bilan");
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
    setScores({ numeration: 0, multiplication: 0, division: 0, geometrie: 0 });
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
            Ce bilan regroupe les 4 thèmes de Maths CE2 partie 1.
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
              <span>➗</span>
              <span>5 questions de Division</span>
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
              ? "Bravo, tu maîtrises les maths CE2 ! 🚀"
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
