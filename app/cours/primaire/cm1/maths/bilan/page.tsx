"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grands nombres (5)
  {
    id: 1,
    theme: "grands-nombres",
    question: "Comment s'écrit « deux cent mille » ?",
    options: ["20 000", "200 000", "2 000 000", "20 000 000"],
    reponse: "200 000",
    explication: "200 000 = deux cent mille.",
  },
  {
    id: 2,
    theme: "grands-nombres",
    question: "Quel est le chiffre des dizaines de milliers dans 347 826 ?",
    options: ["3", "4", "7", "8"],
    reponse: "4",
    explication: "347 826 : 3=centaines de milliers, 4=dizaines de milliers...",
  },
  {
    id: 3,
    theme: "grands-nombres",
    question: "Quel nombre vient juste après 99 999 ?",
    options: ["99 998", "100 000", "100 001", "999 999"],
    reponse: "100 000",
    explication: "Après 99 999 vient 100 000 (cent mille).",
  },
  {
    id: 4,
    theme: "grands-nombres",
    question: "Lequel est le plus grand ?",
    options: ["98 765", "100 001", "99 999", "98 999"],
    reponse: "100 001",
    explication:
      "100 001 a 6 chiffres, les autres en ont 5 → 100 001 est le plus grand.",
  },
  {
    id: 5,
    theme: "grands-nombres",
    question:
      "Quel nombre = 3 centaines de milliers + 5 dizaines de milliers + 2 milliers ?",
    options: ["352 000", "350 200", "305 200", "325 000"],
    reponse: "352 000",
    explication: "300 000 + 50 000 + 2 000 = 352 000.",
  },
  // Multiplication (5)
  {
    id: 6,
    theme: "multiplication",
    question: "6 × 7 = ?",
    options: ["36", "40", "42", "48"],
    reponse: "42",
    explication: "6 × 7 = 42.",
  },
  {
    id: 7,
    theme: "multiplication",
    question: "25 × 3 = ?",
    options: ["65", "70", "75", "80"],
    reponse: "75",
    explication: "25 × 3 = 75.",
  },
  {
    id: 8,
    theme: "multiplication",
    question: "347 × 4 = ?",
    options: ["1 378", "1 388", "1 398", "1 488"],
    reponse: "1 388",
    explication: "347 × 4 = 1 388.",
  },
  {
    id: 9,
    theme: "multiplication",
    question: "23 × 14 = ?",
    options: ["302", "312", "322", "332"],
    reponse: "322",
    explication: "23 × 14 = 322.",
  },
  {
    id: 10,
    theme: "multiplication",
    question:
      "Une boîte contient 24 chocolats. Il y a 15 boîtes. Combien en tout ?",
    options: ["340", "350", "360", "370"],
    reponse: "360",
    explication: "24 × 15 = 360 chocolats.",
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
  // Décimaux (5)
  {
    id: 16,
    theme: "decimaux",
    question: "Quel chiffre est au rang des dixièmes dans 6,35 ?",
    options: ["6", "3", "5", "35"],
    reponse: "3",
    explication: "6,35 : partie entière = 6, dixièmes = 3, centièmes = 5.",
  },
  {
    id: 17,
    theme: "decimaux",
    question: "Lequel est le plus grand : 4,25 ou 4,3 ?",
    options: ["4,25", "4,3", "Ils sont égaux", "On ne peut pas savoir"],
    reponse: "4,3",
    explication: "4,3 = 4,30. Au rang des dixièmes : 3 > 2, donc 4,3 > 4,25.",
  },
  {
    id: 18,
    theme: "decimaux",
    question: "Que vaut 2 unités + 4 dixièmes + 5 centièmes ?",
    options: ["2,45", "24,5", "2,54", "245"],
    reponse: "2,45",
    explication: "2 unités + 4 dixièmes + 5 centièmes = 2,45.",
  },
  {
    id: 19,
    theme: "decimaux",
    question: "Entre 7,4 et 7,5, quel nombre peut-on trouver ?",
    options: ["7,6", "7,45", "7,3", "8,0"],
    reponse: "7,45",
    explication: "7,45 est entre 7,40 et 7,50.",
  },
  {
    id: 20,
    theme: "decimaux",
    question:
      "Quel nombre décimal correspond à « huit unités et trois centièmes » ?",
    options: ["8,3", "8,03", "83", "0,83"],
    reponse: "8,03",
    explication: "8 unités + 0 dixième + 3 centièmes = 8,03.",
  },
];

const themeLabels: Record<string, string> = {
  "grands-nombres": "🔢 Grands nombres",
  multiplication: "✖️ Multiplication",
  division: "➗ Division",
  decimaux: "🔵 Décimaux",
};

const themeColors: Record<string, string> = {
  "grands-nombres": "#4f8ef7",
  multiplication: "#2ec4b6",
  division: "#ffd166",
  decimaux: "#ff6b6b",
};

export default function BilanCM1Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "grands-nombres": 0,
    multiplication: 0,
    division: 0,
    decimaux: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const best = await getBestScore("cm1", "maths", "bilan");
      const last = await getLastScore("cm1", "maths", "bilan");
      setBestScore(best);
      setLastScore(last);
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const best = await getBestScore("cm1", "maths", "bilan");
        const last = await getLastScore("cm1", "maths", "bilan");
        setBestScore(best);
        setLastScore(last);
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
      "grands-nombres": 0,
      multiplication: 0,
      division: 0,
      decimaux: 0,
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
            Ce bilan regroupe des questions sur les 4 thèmes de Maths CM1 partie
            1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span>
              <span>5 questions de Grands nombres</span>
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
              <span>🔵</span>
              <span>5 questions de Décimaux</span>
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
