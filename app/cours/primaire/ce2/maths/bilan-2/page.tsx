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
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "8 ÷ 2 = 4.",
    theme: "fractions",
  },
  {
    id: 2,
    question: "Quel est le quart de 12 ?",
    options: ["4", "3", "6", "2"],
    reponse: "3",
    explication: "12 ÷ 4 = 3.",
    theme: "fractions",
  },
  {
    id: 3,
    question: "Une tarte coupée en 4 parts égales : chaque part est…",
    options: ["1/2", "1/3", "1/4", "1/5"],
    reponse: "1/4",
    explication: "4 parts égales → chaque part = 1/4.",
    theme: "fractions",
  },
  {
    id: 4,
    question: "Quel est le tiers de 9 ?",
    options: ["2", "4", "3", "6"],
    reponse: "3",
    explication: "9 ÷ 3 = 3.",
    theme: "fractions",
  },
  {
    id: 5,
    question: "Laquelle de ces fractions est la plus grande ?",
    options: ["1/4", "1/3", "1/2", "1/6"],
    reponse: "1/2",
    explication: "1/2 > 1/3 > 1/4 > 1/6.",
    theme: "fractions",
  },
  // Grandeurs et mesures (5)
  {
    id: 6,
    question: "Combien de centimètres dans 1 mètre ?",
    options: ["10", "100", "1000", "50"],
    reponse: "100",
    explication: "1 m = 100 cm.",
    theme: "grandeurs-mesures",
  },
  {
    id: 7,
    question: "Combien de grammes dans 1 kilogramme ?",
    options: ["100", "500", "1000", "10"],
    reponse: "1000",
    explication: "1 kg = 1 000 g.",
    theme: "grandeurs-mesures",
  },
  {
    id: 8,
    question: "Clara mesure 1 m 35 cm. En centimètres ?",
    options: ["135 cm", "1035 cm", "35 cm", "235 cm"],
    reponse: "135 cm",
    explication: "1 m = 100 cm + 35 cm = 135 cm.",
    theme: "grandeurs-mesures",
  },
  {
    id: 9,
    question:
      "Un film commence à 14h00 et finit à 15h30. Combien de temps dure-t-il ?",
    options: ["1 h", "1 h 15", "1 h 30", "2 h"],
    reponse: "1 h 30",
    explication: "De 14h00 à 15h30 = 1 heure et 30 minutes.",
    theme: "grandeurs-mesures",
  },
  {
    id: 10,
    question: "Convertis 3 km en mètres.",
    options: ["300 m", "3 000 m", "30 m", "30 000 m"],
    reponse: "3 000 m",
    explication: "1 km = 1 000 m → 3 km = 3 000 m.",
    theme: "grandeurs-mesures",
  },
  // Addition et soustraction (5)
  {
    id: 11,
    question: "234 + 152 = ?",
    options: ["376", "386", "396", "366"],
    reponse: "386",
    explication: "234 + 152 = 386.",
    theme: "addition-soustraction",
  },
  {
    id: 12,
    question: "487 − 253 = ?",
    options: ["224", "234", "244", "214"],
    reponse: "234",
    explication: "487 − 253 = 234.",
    theme: "addition-soustraction",
  },
  {
    id: 13,
    question: "356 + 278 = ?",
    options: ["624", "634", "644", "614"],
    reponse: "634",
    explication: "356 + 278 = 634.",
    theme: "addition-soustraction",
  },
  {
    id: 14,
    question: "800 − 456 = ?",
    options: ["334", "344", "354", "364"],
    reponse: "344",
    explication: "800 − 456 = 344.",
    theme: "addition-soustraction",
  },
  {
    id: 15,
    question: "689 + 247 = ?",
    options: ["926", "936", "946", "916"],
    reponse: "936",
    explication: "689 + 247 = 936.",
    theme: "addition-soustraction",
  },
  // Problèmes (5)
  {
    id: 16,
    question: "Léa a 35 billes. Elle en gagne 18. Combien en a-t-elle ?",
    options: ["51", "52", "53", "54"],
    reponse: "53",
    explication: "35 + 18 = 53 billes.",
    theme: "problemes",
  },
  {
    id: 17,
    question: "6 élèves ont chacun 7 bonbons. Combien en tout ?",
    options: ["36", "40", "42", "48"],
    reponse: "42",
    explication: "6 × 7 = 42 bonbons.",
    theme: "problemes",
  },
  {
    id: 18,
    question:
      "On répartit 32 images entre 4 enfants. Combien chacun en reçoit-il ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "32 ÷ 4 = 8 images par enfant.",
    theme: "problemes",
  },
  {
    id: 19,
    question:
      "Tom a 150 €. Il achète un livre à 23 € et un jeu à 47 €. Combien lui reste-t-il ?",
    options: ["70 €", "75 €", "80 €", "85 €"],
    reponse: "80 €",
    explication: "23 + 47 = 70 €. 150 − 70 = 80 € restants.",
    theme: "problemes",
  },
  {
    id: 20,
    question:
      "Chaque élève lit 15 pages par jour. En 6 jours, combien de pages ?",
    options: ["80", "85", "90", "95"],
    reponse: "90",
    explication: "15 × 6 = 90 pages.",
    theme: "problemes",
  },
];

const themeLabels: Record<string, string> = {
  fractions: "🍕 Fractions",
  "grandeurs-mesures": "📏 Grandeurs et mesures",
  "addition-soustraction": "➕ Addition et soustraction",
  problemes: "🧩 Problèmes",
};

const themeColors: Record<string, string> = {
  fractions: "#4f8ef7",
  "grandeurs-mesures": "#2ec4b6",
  "addition-soustraction": "#ffd166",
  problemes: "#ff6b6b",
};

export default function BilanMathsCE2Page2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    fractions: 0,
    "grandeurs-mesures": 0,
    "addition-soustraction": 0,
    problemes: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("ce2", "maths", "bilan-2");
      const l = await getLastScore("ce2", "maths", "bilan-2");
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
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce2", "maths", "bilan-2");
        const l = await getLastScore("ce2", "maths", "bilan-2");
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
      "grandeurs-mesures": 0,
      "addition-soustraction": 0,
      problemes: 0,
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
          onClick={() => router.push("/cours/primaire/ce2/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CE2 Maths</div>
          <h1 className="lecon-titre">Bilan Maths CE2 — Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de Maths CE2 partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🍕</span>
              <span>5 questions de Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📏</span>
              <span>5 questions de Mesures</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>➕</span>
              <span>5 questions d'Addition/Soustraction</span>
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
              ? "Bravo, tu maîtrises les maths CE2 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/ce2/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
