"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Jobs & Professions (5)
  {
    id: 1,
    theme: "metiers",
    question: "Who helps sick people? 👨‍⚕️",
    options: ["a teacher", "a doctor", "a farmer", "a pilot"],
    reponse: "a doctor",
    explication:
      "A doctor helps sick people. / Un médecin aide les personnes malades.",
  },
  {
    id: 2,
    theme: "metiers",
    question: "Who puts out fires? 🚒",
    options: ["a police officer", "a firefighter", "a farmer", "an engineer"],
    reponse: "a firefighter",
    explication:
      "A firefighter puts out fires. / Un pompier éteint les incendies.",
  },
  {
    id: 3,
    theme: "metiers",
    question: "How do you ask someone's job in English?",
    options: [
      "Where do you live?",
      "What do you do?",
      "How old are you?",
      "What is your name?",
    ],
    reponse: "What do you do?",
    explication: "What do you do? / Quel est ton métier ?",
  },
  {
    id: 4,
    theme: "metiers",
    question: "Who takes care of animals? 🐾",
    options: ["a doctor", "a nurse", "a farmer", "a vet"],
    reponse: "a vet",
    explication:
      "A vet takes care of animals. / Un vétérinaire s'occupe des animaux.",
  },
  {
    id: 5,
    theme: "metiers",
    question: "How do you say 'Je veux être pilote' in English?",
    options: [
      "I am a pilot.",
      "I work as a pilot.",
      "I want to be a pilot.",
      "I like pilots.",
    ],
    reponse: "I want to be a pilot.",
    explication: "I want to be a pilot. / Je veux être pilote.",
  },
  // Daily Routine & Time (5)
  {
    id: 6,
    theme: "routine",
    question: "How do you say 'Quelle heure est-il ?' in English?",
    options: [
      "What day is it?",
      "What time is it?",
      "Where are you?",
      "How are you?",
    ],
    reponse: "What time is it?",
    explication: "What time is it? / Quelle heure est-il ?",
  },
  {
    id: 7,
    theme: "routine",
    question: "What time is 'half past 3'?",
    options: ["3h00", "3h15", "3h30", "3h45"],
    reponse: "3h30",
    explication: "Half past 3 = 3h30. / Trois heures et demie.",
  },
  {
    id: 8,
    theme: "routine",
    question: "Complete: 'I ___ breakfast at 7 o'clock.'",
    options: ["do", "make", "have", "eat"],
    reponse: "have",
    explication: "I have breakfast. / Je prends le petit déjeuner.",
  },
  {
    id: 9,
    theme: "routine",
    question: "What time is 'quarter to 4'?",
    options: ["4h15", "4h45", "3h45", "3h15"],
    reponse: "3h45",
    explication: "Quarter to 4 = 3h45. / Quatre heures moins le quart.",
  },
  {
    id: 10,
    theme: "routine",
    question: "How do you say 'le soir' in English?",
    options: [
      "in the morning",
      "in the afternoon",
      "in the evening",
      "at night",
    ],
    reponse: "in the evening",
    explication: "In the evening. / Le soir.",
  },
  // English-speaking Countries (5)
  {
    id: 11,
    theme: "pays",
    question: "What is the capital of the United Kingdom? 🇬🇧",
    options: ["Dublin", "Paris", "London", "Edinburgh"],
    reponse: "London",
    explication:
      "The capital of the UK is London. / La capitale du Royaume-Uni est Londres.",
  },
  {
    id: 12,
    theme: "pays",
    question: "Which country speaks both English AND French? 🇨🇦",
    options: ["Australia", "Ireland", "Canada", "New Zealand"],
    reponse: "Canada",
    explication:
      "Canada speaks English and French. / Le Canada parle anglais et français.",
  },
  {
    id: 13,
    theme: "pays",
    question: "What is the capital of Australia? 🇦🇺",
    options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
    reponse: "Canberra",
    explication:
      "The capital of Australia is Canberra. / La capitale de l'Australie est Canberra.",
  },
  {
    id: 14,
    theme: "pays",
    question: "What is the capital of the United States? 🇺🇸",
    options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
    reponse: "Washington D.C.",
    explication:
      "The capital of the USA is Washington D.C. / La capitale des États-Unis est Washington D.C.",
  },
  {
    id: 15,
    theme: "pays",
    question: "The UK is made of England, Scotland, Wales and... ?",
    options: ["Ireland", "Northern Ireland", "New Zealand", "Canada"],
    reponse: "Northern Ireland",
    explication: "The UK = England + Scotland + Wales + Northern Ireland.",
  },
  // Describing People (5)
  {
    id: 16,
    theme: "description",
    question: "Complete: 'She ___ long hair.'",
    options: ["is", "have", "has", "are"],
    reponse: "has",
    explication: "She has long hair. / Elle a les cheveux longs.",
  },
  {
    id: 17,
    theme: "description",
    question: "What does 'He is funny' mean?",
    options: [
      "Il est timide.",
      "Il est grand.",
      "Il est drôle.",
      "Il est gentil.",
    ],
    reponse: "Il est drôle.",
    explication: "Funny = drôle. / He is funny = Il est drôle.",
  },
  {
    id: 18,
    theme: "description",
    question: "What does 'She has curly hair' mean?",
    options: [
      "Elle a les cheveux longs.",
      "Elle a les cheveux courts.",
      "Elle a les cheveux frisés.",
      "Elle a les cheveux raides.",
    ],
    reponse: "Elle a les cheveux frisés.",
    explication: "Curly hair = cheveux frisés.",
  },
  {
    id: 19,
    theme: "description",
    question: "How do you say 'Elle est grande' in English?",
    options: ["She is short.", "She is tall.", "She is thin.", "She is old."],
    reponse: "She is tall.",
    explication: "She is tall. / Elle est grande.",
  },
  {
    id: 20,
    theme: "description",
    question: "What does 'He is shy' mean?",
    options: [
      "Il est courageux.",
      "Il est sympa.",
      "Il est timide.",
      "Il est intelligent.",
    ],
    reponse: "Il est timide.",
    explication: "Shy = timide. / He is shy = Il est timide.",
  },
];

const themeLabels: Record<string, string> = {
  metiers: "💼 Jobs & Professions",
  routine: "⏰ Daily Routine & Time",
  pays: "🌍 English-speaking Countries",
  description: "👤 Describing People",
};

const themeColors: Record<string, string> = {
  metiers: "#4f8ef7",
  routine: "#2ec4b6",
  pays: "#ffd166",
  description: "#ff6b6b",
};

export default function BilanCM1Anglais() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    metiers: 0,
    routine: 0,
    pays: 0,
    description: 0,
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
  // Ref pour tracker le score réel sans dépendre de l'async du state
  const scoreRef = useRef(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  useEffect(() => {
    getBestScore("cm1", "anglais", "bilan").then(setBestScore);
    getLastScore("cm1", "anglais", "bilan").then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
      scoreRef.current += 1; // mise à jour synchrone
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      // On utilise scoreRef.current — toujours à jour, pas de problème async
      await saveScore({
        classe: "cm1",
        matiere: "anglais",
        theme: "bilan",
        score: scoreRef.current,
        total: 20,
      });
      const [best, last] = await Promise.all([
        getBestScore("cm1", "anglais", "bilan"),
        getLastScore("cm1", "anglais", "bilan"),
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
    setScores({ metiers: 0, routine: 0, pays: 0, description: 0 });
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
          onClick={() => router.push("/cours/primaire/cm1/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM1 Anglais</div>
          <h1 className="lecon-titre">Bilan Final — CM1 Anglais</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes d'Anglais du CM1.
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
              <span>💼</span>
              <span>5 questions de Jobs & Professions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>⏰</span>
              <span>5 questions de Daily Routine & Time</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🌍</span>
              <span>5 questions de English-speaking Countries</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>👤</span>
              <span>5 questions de Describing People</span>
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
              ? "Bravo, tu es un(e) champion(ne) de l'anglais ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm1/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
