"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Monnaie (5)
  {
    id: 1,
    theme: "monnaie",
    question: "Si j'ai deux pièces de 2€, combien ai-je ?",
    options: ["2€", "4€", "5€", "6€"],
    reponse: "4€",
    explication: "2 + 2 = 4 euros.",
  },
  {
    id: 2,
    theme: "monnaie",
    question: "Quel est le plus petit billet ?",
    options: ["5€", "10€", "20€", "50€"],
    reponse: "5€",
    explication: "Le billet de 5€ est le plus petit.",
  },
  {
    id: 3,
    theme: "monnaie",
    question: "J'ai 10€. J'achète un livre à 7€. Il me reste :",
    options: ["2€", "3€", "4€", "5€"],
    reponse: "3€",
    explication: "10 - 7 = 3.",
  },
  {
    id: 4,
    theme: "monnaie",
    question: "Quelle pièce n'existe pas ?",
    options: ["1€", "2€", "3€", "50c"],
    reponse: "3€",
    explication: "Il n'y a pas de pièce de 3 euros.",
  },
  {
    id: 5,
    theme: "monnaie",
    question: "Le signe de l'Euro est :",
    options: ["$", "€", "£", "¥"],
    reponse: "€",
    explication: "C'est le symbole de notre monnaie.",
  },
  // Mesures (5)
  {
    id: 6,
    theme: "mesures",
    question: "Combien de centimètres y a-t-il dans 1 mètre ?",
    options: ["10", "50", "100", "1000"],
    reponse: "100",
    explication: "1 mètre = 100 centimètres.",
  },
  {
    id: 7,
    theme: "mesures",
    question: "Avec quoi mesure-t-on une longueur ?",
    options: ["Une balance", "Un verre", "Une règle", "Un thermomètre"],
    reponse: "Une règle",
    explication: "On utilise une règle pour mesurer les longueurs.",
  },
  {
    id: 8,
    theme: "mesures",
    question:
      "Un crayon mesure 15 cm. Une règle mesure 30 cm. Laquelle est la plus longue ?",
    options: ["Le crayon", "La règle", "Les deux pareil"],
    reponse: "La règle",
    explication: "30 cm > 15 cm, donc la règle est plus longue.",
  },
  {
    id: 9,
    theme: "mesures",
    question: "Que signifie 'cm' ?",
    options: ["Centimètre", "Centilitre", "Carré mètre", "Cube mètre"],
    reponse: "Centimètre",
    explication: "cm est l'abréviation de centimètre.",
  },
  {
    id: 10,
    theme: "mesures",
    question: "50 cm + 50 cm = ?",
    options: ["1 m", "2 m", "100 m", "5 m"],
    reponse: "1 m",
    explication: "50 + 50 = 100 cm = 1 mètre.",
  },
  // Temps (5)
  {
    id: 11,
    theme: "temps",
    question: "Combien y a-t-il d'heures dans une journée ?",
    options: ["12", "24", "60", "7"],
    reponse: "24",
    explication: "Une journée dure 24 heures.",
  },
  {
    id: 12,
    theme: "temps",
    question: "Combien y a-t-il de minutes dans 1 heure ?",
    options: ["24", "30", "60", "100"],
    reponse: "60",
    explication: "1 heure = 60 minutes.",
  },
  {
    id: 13,
    theme: "temps",
    question: "Combien y a-t-il de jours dans une semaine ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication: "Une semaine = 7 jours.",
  },
  {
    id: 14,
    theme: "temps",
    question: "Un quart d'heure, c'est combien de minutes ?",
    options: ["5", "10", "15", "30"],
    reponse: "15",
    explication: "Un quart d'heure = 15 minutes.",
  },
  {
    id: 15,
    theme: "temps",
    question: "Il est 9h00. Dans 30 minutes, il sera ?",
    options: ["9h15", "9h30", "10h00", "8h30"],
    reponse: "9h30",
    explication: "9h00 + 30 minutes = 9h30.",
  },
  // Calcul mental (5)
  {
    id: 16,
    theme: "calcul",
    question: "Quel est le double de 3 ?",
    options: ["3", "5", "6", "9"],
    reponse: "6",
    explication: "3 + 3 = 6.",
  },
  {
    id: 17,
    theme: "calcul",
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "4", "6", "8"],
    reponse: "4",
    explication: "8 ÷ 2 = 4.",
  },
  {
    id: 18,
    theme: "calcul",
    question: "Quel est le complément de 3 pour arriver à 10 ?",
    options: ["3", "5", "7", "6"],
    reponse: "7",
    explication: "3 + 7 = 10.",
  },
  {
    id: 19,
    theme: "calcul",
    question: "Quel est le double de 7 ?",
    options: ["7", "12", "14", "17"],
    reponse: "14",
    explication: "7 + 7 = 14.",
  },
  {
    id: 20,
    theme: "calcul",
    question: "Quelle est la moitié de 12 ?",
    options: ["4", "5", "6", "8"],
    reponse: "6",
    explication: "12 ÷ 2 = 6.",
  },
];

const themeLabels: Record<string, string> = {
  monnaie: "💶 Monnaie",
  mesures: "📏 Mesures",
  temps: "🕒 Temps",
  calcul: "🧠 Calcul Mental",
};

const themeColors: Record<string, string> = {
  monnaie: "#4cc9f0",
  mesures: "#4ade80",
  temps: "#ffd166",
  calcul: "#ff6b6b",
};

export default function BilanMathsCP2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    monnaie: 0,
    mesures: 0,
    temps: 0,
    calcul: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);
  const scoreRef = useRef(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  useEffect(() => {
    getBestScore("cp", "maths", "bilan-2").then(setBestScore);
    getLastScore("cp", "maths", "bilan-2").then(setLastScore);
  }, []);

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
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: "cp",
        matiere: "maths",
        theme: "bilan-2",
        score: scoreRef.current,
        total: 20,
      });
      const [best, last] = await Promise.all([
        getBestScore("cp", "maths", "bilan-2"),
        getLastScore("cp", "maths", "bilan-2"),
      ]);
      setBestScore(best);
      setLastScore(last);
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    scoreRef.current = 0;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ monnaie: 0, mesures: 0, temps: 0, calcul: 0 });
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
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final 2 · CP Maths</div>
          <h1 className="lecon-titre">Bilan Mathématiques CP 2</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes de la partie 2 :
            Monnaie, Mesures, Temps et Calcul Mental.
          </p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4cc9f0",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4cc9f0" }}>
              <span>💶</span>
              <span>5 questions de Monnaie</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#4ade80" }}>
              <span>📏</span>
              <span>5 questions de Mesures</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🕒</span>
              <span>5 questions de Temps</span>
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
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4cc9f0",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
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
              ? "Bravo ! Tu maîtrises parfaitement les maths CP partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
