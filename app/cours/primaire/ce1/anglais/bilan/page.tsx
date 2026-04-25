"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
// Importation des utilitaires de score pour la base de données
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Colours & Numbers (5)
  {
    id: 1,
    theme: "couleurs",
    question: "What colour is the sky? ☁️",
    options: ["red", "blue", "green", "yellow"],
    reponse: "blue",
    explication: "The sky is blue. / Le ciel est bleu.",
  },
  {
    id: 2,
    theme: "couleurs",
    question: "How do you say '7' in English?",
    options: ["six", "eight", "nine", "seven"],
    reponse: "seven",
    explication: "7 = seven. / Sept en français.",
  },
  {
    id: 3,
    theme: "couleurs",
    question: "What colour is a banana? 🍌",
    options: ["yellow", "red", "blue", "purple"],
    reponse: "yellow",
    explication: "A banana is yellow. / Une banane est jaune.",
  },
  {
    id: 4,
    theme: "couleurs",
    question: "How do you say '10' in English?",
    options: ["eight", "nine", "ten", "six"],
    reponse: "ten",
    explication: "10 = ten. / Dix en français.",
  },
  {
    id: 5,
    theme: "couleurs",
    question: "What colour is snow? ❄️",
    options: ["black", "white", "grey", "blue"],
    reponse: "white",
    explication: "Snow is white. / La neige est blanche.",
  },
  // Animals (5)
  {
    id: 6,
    theme: "animaux",
    question: "What animal says 'woof'? 🐶",
    options: ["cat", "dog", "fish", "bird"],
    reponse: "dog",
    explication: "A dog says 'woof'. / Un chien fait 'wouf'.",
  },
  {
    id: 7,
    theme: "animaux",
    question: "What is this animal? 🦁",
    options: ["tiger", "lion", "horse", "elephant"],
    reponse: "lion",
    explication: "🦁 is a lion. / C'est un lion.",
  },
  {
    id: 8,
    theme: "animaux",
    question: "Which animal has a very long neck? 🦒",
    options: ["snake", "elephant", "giraffe", "monkey"],
    reponse: "giraffe",
    explication:
      "A giraffe has a very long neck. / La girafe a un très long cou.",
  },
  {
    id: 9,
    theme: "animaux",
    question: "Which of these is a pet?",
    options: ["lion", "tiger", "hamster", "elephant"],
    reponse: "hamster",
    explication: "A hamster is a pet. / Un hamster est un animal domestique.",
  },
  {
    id: 10,
    theme: "animaux",
    question: "What animal has no legs? 🐍",
    options: ["fish", "snake", "worm", "snail"],
    reponse: "snake",
    explication: "A snake has no legs. / Un serpent n'a pas de pattes.",
  },
  // Family & Body (5)
  {
    id: 11,
    theme: "famille",
    question: "What do we call our mother in English?",
    options: ["dad", "sister", "mum", "grandma"],
    reponse: "mum",
    explication: "Mother = mum. / Notre maman en anglais.",
  },
  {
    id: 12,
    theme: "famille",
    question: "What is on your face that you use to smell? 👃",
    options: ["mouth", "nose", "ear", "eye"],
    reponse: "nose",
    explication: "The nose is used for smelling. / Le nez sert à sentir.",
  },
  {
    id: 13,
    theme: "famille",
    question: "What body part do we use to listen? 👂",
    options: ["nose", "mouth", "ear", "eye"],
    reponse: "ear",
    explication:
      "We use our ears to listen. / On utilise les oreilles pour écouter.",
  },
  {
    id: 14,
    theme: "famille",
    question: "What do we call a boy sibling?",
    options: ["sister", "cousin", "brother", "uncle"],
    reponse: "brother",
    explication:
      "A boy sibling is a brother. / Un frère est un garçon de la famille.",
  },
  {
    id: 15,
    theme: "famille",
    question: "How do you say 'ma sœur' in English?",
    options: ["brother", "cousin", "sister", "aunt"],
    reponse: "sister",
    explication: "My sister. / Ma sœur.",
  },
  // Introducing Yourself (5)
  {
    id: 16,
    theme: "presentation",
    question: "How do you say 'Bonjour' in English?",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    reponse: "Hello",
    explication: "Hello! / Bonjour !",
  },
  {
    id: 17,
    theme: "presentation",
    question: "How do you ask someone's name?",
    options: [
      "How old are you?",
      "What is your name?",
      "Where are you from?",
      "How are you?",
    ],
    reponse: "What is your name?",
    explication: "What is your name? / Comment tu t'appelles ?",
  },
  {
    id: 18,
    theme: "presentation",
    question: "Someone asks 'How are you?'. What do you answer?",
    options: [
      "My name is Léa.",
      "I am 7 years old.",
      "I am fine, thank you!",
      "I am from France.",
    ],
    reponse: "I am fine, thank you!",
    explication: "I am fine, thank you! / Je vais bien, merci !",
  },
  {
    id: 19,
    theme: "presentation",
    question: "Which greeting do you use in the morning?",
    options: [
      "Good evening!",
      "Good night!",
      "Good morning!",
      "Good afternoon!",
    ],
    reponse: "Good morning!",
    explication: "Good morning! / Bonjour (le matin) !",
  },
  {
    id: 20,
    theme: "presentation",
    question: "How do you say 'Enchanté(e) !' in English?",
    options: ["See you!", "Goodbye!", "Nice to meet you!", "Good morning!"],
    reponse: "Nice to meet you!",
    explication: "Nice to meet you! / Enchanté(e) !",
  },
];

const themeLabels: Record<string, string> = {
  couleurs: "🎨 Colours & Numbers",
  animaux: "🐾 Animals",
  famille: "👨‍👩‍👧 Family & Body",
  presentation: "👋 Introducing Yourself",
};

const themeColors: Record<string, string> = {
  couleurs: "#4f8ef7",
  animaux: "#2ec4b6",
  famille: "#ffd166",
  presentation: "#ff6b6b",
};

export default function BilanCE1Anglais() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    couleurs: 0,
    animaux: 0,
    famille: 0,
    presentation: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  // États pour la DB
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);

  // Chargement des records initiaux
  useEffect(() => {
    const loadData = async () => {
      const b = await getBestScore("ce1", "anglais", "bilan");
      const l = await getLastScore("ce1", "anglais", "bilan");
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
      // Sauvegarde dans la Database
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce1",
          matiere: "anglais",
          theme: "bilan",
          score: totalScore,
          total: 20,
        });
        // Rafraîchir les records pour l'écran final
        const b = await getBestScore("ce1", "anglais", "bilan");
        const l = await getLastScore("ce1", "anglais", "bilan");
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
    setScores({ couleurs: 0, animaux: 0, famille: 0, presentation: 0 });
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
          onClick={() => router.push("/cours/primaire/ce1/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE1 Anglais</div>
          <h1 className="lecon-titre">Bilan Final — CE1 Anglais</h1>

          {/* Records personnels */}
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(46, 196, 182, 0.1)",
                    borderRadius: "10px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#2ec4b6" }}>
                    🏆 Best Score
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    {bestScore.score} / {bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    🕒 Last
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    {lastScore.score} / {lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes d'Anglais du CE1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🎨</span>
              <span>5 questions de Colours & Numbers</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🐾</span>
              <span>5 questions de Animals</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>👨‍👩‍👧</span>
              <span>5 questions de Family & Body</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>👋</span>
              <span>5 questions de Introducing Yourself</span>
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

          {bestScore && totalScore < bestScore.score && (
            <div
              style={{
                fontSize: "0.9rem",
                color: "#888",
                marginBottom: "10px",
              }}
            >
              Ton record personnel est de {bestScore.score}/20
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
              onClick={() => router.push("/cours/primaire/ce1/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
