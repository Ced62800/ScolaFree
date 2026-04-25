"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// Import de la logique de persistance
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Food & Drinks (5)
  {
    id: 1,
    theme: "nourriture",
    question: "What is this? 🍎",
    options: ["a banana", "an apple", "an orange", "a strawberry"],
    reponse: "an apple",
    explication: "This is an apple. / C'est une pomme.",
  },
  {
    id: 2,
    theme: "nourriture",
    question: "How do you say 'de l'eau' in English?",
    options: ["milk", "juice", "tea", "water"],
    reponse: "water",
    explication: "Water. / De l'eau.",
  },
  {
    id: 3,
    theme: "nourriture",
    question: "What is this? 🍕",
    options: ["a sandwich", "a cake", "pasta", "a pizza"],
    reponse: "a pizza",
    explication: "This is a pizza. / C'est une pizza.",
  },
  {
    id: 4,
    theme: "nourriture",
    question: "Complete: 'I ___ an apple.' (manger)",
    options: ["drink", "like", "eat", "have"],
    reponse: "eat",
    explication: "I eat an apple. / Je mange une pomme.",
  },
  {
    id: 5,
    theme: "nourriture",
    question: "How do you say 'du pain' in English?",
    options: ["rice", "pasta", "chips", "bread"],
    reponse: "bread",
    explication: "Bread. / Du pain.",
  },
  // Clothes & House (5)
  {
    id: 6,
    theme: "vetements",
    question: "What is this? 👕",
    options: ["trousers", "a dress", "a t-shirt", "a jacket"],
    reponse: "a t-shirt",
    explication: "This is a t-shirt. / C'est un t-shirt.",
  },
  {
    id: 7,
    theme: "vetements",
    question: "Where do you sleep? 🛏️",
    options: ["the kitchen", "the bathroom", "the living room", "the bedroom"],
    reponse: "the bedroom",
    explication: "We sleep in the bedroom. / On dort dans la chambre.",
  },
  {
    id: 8,
    theme: "vetements",
    question: "How do you say 'une chaise' in English?",
    options: ["a table", "a bed", "a sofa", "a chair"],
    reponse: "a chair",
    explication: "A chair. / Une chaise.",
  },
  {
    id: 9,
    theme: "vetements",
    question: "Complete: 'I ___ a blue jacket.' (porter)",
    options: ["eat", "drink", "wear", "have"],
    reponse: "wear",
    explication: "I wear a blue jacket. / Je porte une veste bleue.",
  },
  {
    id: 10,
    theme: "vetements",
    question: "Where do you cook? 🍳",
    options: ["the bedroom", "the garden", "the kitchen", "the bathroom"],
    reponse: "the kitchen",
    explication: "We cook in the kitchen. / On cuisine dans la cuisine.",
  },
  // School & Objects (5)
  {
    id: 11,
    theme: "ecole",
    question: "What do you write with? ✏️",
    options: ["a ruler", "a book", "a pencil", "scissors"],
    reponse: "a pencil",
    explication: "We write with a pencil. / On écrit avec un crayon.",
  },
  {
    id: 12,
    theme: "ecole",
    question: "The teacher says 'Sit down!' What do you do?",
    options: [
      "Tu te lèves.",
      "Tu ouvres ton livre.",
      "Tu t'assieds.",
      "Tu écoutes.",
    ],
    reponse: "Tu t'assieds.",
    explication: "Sit down! / Assieds-toi !",
  },
  {
    id: 13,
    theme: "ecole",
    question: "How do you say 'une règle' in English?",
    options: ["a pencil", "a rubber", "a ruler", "a pen"],
    reponse: "a ruler",
    explication: "A ruler. / Une règle.",
  },
  {
    id: 14,
    theme: "ecole",
    question: "Where do you play at school? 🛝",
    options: ["the canteen", "the library", "the classroom", "the playground"],
    reponse: "the playground",
    explication:
      "We play in the playground. / On joue dans la cour de récréation.",
  },
  {
    id: 15,
    theme: "ecole",
    question: "How do you say 'une gomme' in English?",
    options: ["a pencil", "a pen", "a ruler", "a rubber"],
    reponse: "a rubber",
    explication: "A rubber. / Une gomme.",
  },
  // Sports & Likes (5)
  {
    id: 16,
    theme: "sports",
    question: "How do you say 'J'aime le football' in English?",
    options: [
      "I don't like football.",
      "I play football.",
      "I like football.",
      "I love tennis.",
    ],
    reponse: "I like football.",
    explication: "I like football. / J'aime le football.",
  },
  {
    id: 17,
    theme: "sports",
    question: "What sport is this? 🎾",
    options: ["football", "basketball", "tennis", "cycling"],
    reponse: "tennis",
    explication: "This is tennis. / C'est le tennis.",
  },
  {
    id: 18,
    theme: "sports",
    question: "Complete: 'I ___ basketball.' (jouer)",
    options: ["do", "like", "play", "have"],
    reponse: "play",
    explication: "I play basketball. / Je joue au basket.",
  },
  {
    id: 19,
    theme: "sports",
    question: "How do you say 'Je n'aime pas la natation' in English?",
    options: [
      "I like swimming.",
      "I don't like swimming.",
      "I love swimming.",
      "I play swimming.",
    ],
    reponse: "I don't like swimming.",
    explication: "I don't like swimming. / Je n'aime pas la natation.",
  },
  {
    id: 20,
    theme: "sports",
    question: "Complete: 'I ___ gymnastics.' (faire)",
    options: ["play", "do", "like", "have"],
    reponse: "do",
    explication: "I do gymnastics. / Je fais de la gymnastique.",
  },
];

const themeLabels: Record<string, string> = {
  nourriture: "🍎 Food & Drinks",
  vetements: "👕 Clothes & House",
  ecole: "🎒 School & Objects",
  sports: "⚽ Sports & Likes",
};

const themeColors: Record<string, string> = {
  nourriture: "#4f8ef7",
  vetements: "#2ec4b6",
  ecole: "#ffd166",
  sports: "#ff6b6b",
};

export default function BilanCE2Anglais() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    nourriture: 0,
    vetements: 0,
    ecole: 0,
    sports: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  // Gestion des records
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);

  useEffect(() => {
    const loadScores = async () => {
      const b = await getBestScore("ce2", "anglais", "bilan");
      const l = await getLastScore("ce2", "anglais", "bilan");
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
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce2",
          matiere: "anglais",
          theme: "bilan",
          score: totalScore,
          total: 20,
        });
        const b = await getBestScore("ce2", "anglais", "bilan");
        const l = await getLastScore("ce2", "anglais", "bilan");
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
    setScores({ nourriture: 0, vetements: 0, ecole: 0, sports: 0 });
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
          onClick={() => router.push("/cours/primaire/ce2/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE2 Anglais</div>
          <h1 className="lecon-titre">Bilan Final — CE2 Anglais</h1>

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
                    🏆 Best
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
                    🕒 Last
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes d'Anglais du CE2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🍎</span>
              <span>5 questions de Food & Drinks</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>👕</span>
              <span>5 questions de Clothes & House</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🎒</span>
              <span>5 questions de School & Objects</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>⚽</span>
              <span>5 questions de Sports & Likes</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Final score on <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Start the final test →
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
                  ? "See my results →"
                  : "Next question →"}
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
            <h3 className="bilan-detail-titre">Results by theme</h3>
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
              ? "Congratulations, you are an English star! 🚀"
              : totalScore >= 14
                ? "Very good level!"
                : totalScore >= 10
                  ? "You're getting better!"
                  : "Don't give up! Review the lessons and try again."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Try again
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/ce2/anglais")}
            >
              Back to themes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
