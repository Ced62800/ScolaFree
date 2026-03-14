"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Weather & Seasons (5)
  {
    id: 1,
    theme: "meteo",
    question: "How do you say 'Il fait soleil' in English?",
    options: ["It's cloudy.", "It's raining.", "It's sunny.", "It's windy."],
    reponse: "It's sunny.",
    explication: "It's sunny. / Il fait soleil.",
  },
  {
    id: 2,
    theme: "meteo",
    question: "What season comes after Summer? 🍂",
    options: ["Spring", "Winter", "Autumn", "Summer"],
    reponse: "Autumn",
    explication: "After summer comes autumn. / Après l'été vient l'automne.",
  },
  {
    id: 3,
    theme: "meteo",
    question: "How do you say 'Il neige' in English?",
    options: ["It's raining.", "It's foggy.", "It's cold.", "It's snowing."],
    reponse: "It's snowing.",
    explication: "It's snowing. / Il neige.",
  },
  {
    id: 4,
    theme: "meteo",
    question: "How do you ask 'Quel temps fait-il ?' in English?",
    options: [
      "What time is it?",
      "What's the weather like?",
      "What season is it?",
      "How are you?",
    ],
    reponse: "What's the weather like?",
    explication: "What's the weather like? / Quel temps fait-il ?",
  },
  {
    id: 5,
    theme: "meteo",
    question: "How do you say 'Il fait froid' in English?",
    options: ["It's hot.", "It's windy.", "It's cold.", "It's foggy."],
    reponse: "It's cold.",
    explication: "It's cold. / Il fait froid.",
  },
  // In the Town & Directions (5)
  {
    id: 6,
    theme: "ville",
    question: "Where do you borrow books? 📚",
    options: ["a bakery", "a bank", "a library", "a cinema"],
    reponse: "a library",
    explication: "A library is where you borrow books. / Une bibliothèque.",
  },
  {
    id: 7,
    theme: "ville",
    question: "How do you say 'Tourne à gauche' in English?",
    options: [
      "Turn right.",
      "Go straight on.",
      "Turn left.",
      "Take the first street.",
    ],
    reponse: "Turn left.",
    explication: "Turn left. / Tourne à gauche.",
  },
  {
    id: 8,
    theme: "ville",
    question: "How do you say 'Vas tout droit' in English?",
    options: [
      "Turn left.",
      "Turn right.",
      "Go straight on.",
      "Take the first street.",
    ],
    reponse: "Go straight on.",
    explication: "Go straight on. / Vas tout droit.",
  },
  {
    id: 9,
    theme: "ville",
    question: "How do you say 'C'est à côté de...' in English?",
    options: [
      "It's opposite...",
      "It's next to...",
      "It's behind...",
      "It's in front of...",
    ],
    reponse: "It's next to...",
    explication: "It's next to... / C'est à côté de...",
  },
  {
    id: 10,
    theme: "ville",
    question: "Where do sick people go? 🏥",
    options: ["a school", "a park", "a cinema", "a hospital"],
    reponse: "a hospital",
    explication:
      "Sick people go to a hospital. / Les malades vont à l'hôpital.",
  },
  // Shopping & Money (5)
  {
    id: 11,
    theme: "shopping",
    question: "How do you ask 'C'est combien ?' in English?",
    options: [
      "What is this?",
      "How much is it?",
      "Can I help you?",
      "Where is the shop?",
    ],
    reponse: "How much is it?",
    explication: "How much is it? / C'est combien ?",
  },
  {
    id: 12,
    theme: "shopping",
    question: "What is the currency in the UK? 🇬🇧",
    options: ["Euro", "Dollar", "Pound", "Franc"],
    reponse: "Pound",
    explication: "The UK uses pounds (£).",
  },
  {
    id: 13,
    theme: "shopping",
    question: "What does 'expensive' mean?",
    options: ["pas cher", "gratuit", "cher", "bon marché"],
    reponse: "cher",
    explication: "Expensive = cher.",
  },
  {
    id: 14,
    theme: "shopping",
    question: "How do you say 'Je voudrais une pomme' in English?",
    options: [
      "I like an apple.",
      "I have an apple.",
      "I'd like an apple.",
      "I want apple.",
    ],
    reponse: "I'd like an apple.",
    explication: "I'd like an apple. / Je voudrais une pomme.",
  },
  {
    id: 15,
    theme: "shopping",
    question: "What does 'cheap' mean?",
    options: ["cher", "gratuit", "pas cher", "rare"],
    reponse: "pas cher",
    explication: "Cheap = pas cher.",
  },
  // Body & Health (5)
  {
    id: 16,
    theme: "corps",
    question: "How do you say 'J'ai mal à la tête' in English?",
    options: [
      "I have a stomachache.",
      "My arm hurts.",
      "I have a headache.",
      "I have a cold.",
    ],
    reponse: "I have a headache.",
    explication: "I have a headache. / J'ai mal à la tête.",
  },
  {
    id: 17,
    theme: "corps",
    question: "How do you say 'Je me sens malade' in English?",
    options: ["I feel happy.", "I feel tired.", "I feel sick.", "I feel cold."],
    reponse: "I feel sick.",
    explication: "I feel sick. / Je me sens malade.",
  },
  {
    id: 18,
    theme: "corps",
    question: "How do you say 'J'ai de la fièvre' in English?",
    options: [
      "I have a cold.",
      "I have a headache.",
      "I have a fever.",
      "I have a cough.",
    ],
    reponse: "I have a fever.",
    explication: "I have a fever. / J'ai de la fièvre.",
  },
  {
    id: 19,
    theme: "corps",
    question: "What does 'My leg hurts' mean?",
    options: [
      "Ma main me fait mal.",
      "Mon bras me fait mal.",
      "Mon pied me fait mal.",
      "Ma jambe me fait mal.",
    ],
    reponse: "Ma jambe me fait mal.",
    explication: "My leg hurts. / Ma jambe me fait mal.",
  },
  {
    id: 20,
    theme: "corps",
    question: "How do you say 'J'ai un rhume' in English?",
    options: [
      "I have a fever.",
      "I have a cold.",
      "I have a cough.",
      "I have a headache.",
    ],
    reponse: "I have a cold.",
    explication: "I have a cold. / J'ai un rhume.",
  },
];

const themeLabels: Record<string, string> = {
  meteo: "🌤️ Weather & Seasons",
  ville: "🏙️ Town & Directions",
  shopping: "🛒 Shopping & Money",
  corps: "💪 Body & Health",
};

const themeColors: Record<string, string> = {
  meteo: "#4f8ef7",
  ville: "#2ec4b6",
  shopping: "#ffd166",
  corps: "#ff6b6b",
};

export default function BilanAnglaisCM2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    meteo: 0,
    ville: 0,
    shopping: 0,
    corps: 0,
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
    getBestScore("cm2", "anglais", "bilan").then(setBestScore);
    getLastScore("cm2", "anglais", "bilan").then(setLastScore);
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
        classe: "cm2",
        matiere: "anglais",
        theme: "bilan",
        score: scoreRef.current,
        total: 20,
      });
      const [best, last] = await Promise.all([
        getBestScore("cm2", "anglais", "bilan"),
        getLastScore("cm2", "anglais", "bilan"),
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
    setScores({ meteo: 0, ville: 0, shopping: 0, corps: 0 });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent!", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14)
      return { label: "Well done!", icon: "⭐", color: "#4f8ef7" };
    if (score >= 10)
      return { label: "Good job!", icon: "👍", color: "#ffd166" };
    return { label: "Keep trying!", icon: "💪", color: "#ff6b6b" };
  };

  const mention = getMention(totalScore);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM2 Anglais</div>
          <h1 className="lecon-titre">Bilan Final CM2 Anglais</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes : Weather &
            Seasons, Town & Directions, Shopping & Money, Body & Health.
          </p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
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
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🌤️</span>
              <span>5 questions Weather & Seasons</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🏙️</span>
              <span>5 questions Town & Directions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🛒</span>
              <span>5 questions Shopping & Money</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>💪</span>
              <span>5 questions Body & Health</span>
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
                      ? "Well done! 🎉"
                      : "Not quite..."}
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
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4f8ef7",
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
              ? "Brilliant! Tu maîtrises parfaitement l'anglais CM2 ! 🚀"
              : totalScore >= 14
                ? "Very good! Très bon niveau !"
                : totalScore >= 10
                  ? "Good! Tu progresses bien !"
                  : "Keep trying! Reprends les leçons et réessaie."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cm2/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
