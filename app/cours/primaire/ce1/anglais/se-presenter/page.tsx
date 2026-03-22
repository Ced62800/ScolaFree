"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Introducing Yourself",
  intro:
    "Let's learn how to say hello and introduce ourselves in English! Apprends à te présenter et à saluer en anglais.",
  points: [
    {
      titre: "Greetings — Les salutations",
      texte:
        "We use different greetings depending on the time of day. Always be polite!",
      exemple:
        "Hello! / Hi! | Good morning! (matin) | Good afternoon! (après-midi) | Good evening! (soir) | Goodbye! / Bye!",
    },
    {
      titre: "Introducing yourself — Se présenter",
      texte:
        "To introduce yourself, use 'My name is...' or 'I am...'. To ask someone's name, say 'What is your name?'",
      exemple:
        "My name is Tom. | I am 7 years old. | I am from France. | Nice to meet you!",
    },
    {
      titre: "Asking questions — Poser des questions",
      texte:
        "These are the most common questions we ask when meeting someone new.",
      exemple:
        "What is your name? | How old are you? | Where are you from? | How are you? — I am fine, thank you!",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you say 'Bonjour' in English?",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    reponse: "Hello",
    explication: "Hello! / Bonjour !",
    niveau: "facile",
  },
  {
    id: 2,
    question: "How do you introduce yourself? 'My ___ is Tom.'",
    options: ["age", "name", "friend", "colour"],
    reponse: "name",
    explication: "My name is Tom. / Je m'appelle Tom.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "How do you say 'Au revoir' in English?",
    options: ["Hello", "Please", "Goodbye", "Sorry"],
    reponse: "Goodbye",
    explication: "Goodbye! / Au revoir !",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you ask someone's name?",
    options: [
      "How old are you?",
      "What is your name?",
      "Where are you from?",
      "How are you?",
    ],
    reponse: "What is your name?",
    explication: "What is your name? / Comment tu t'appelles ?",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Someone asks 'How are you?'. What do you answer?",
    options: [
      "My name is Léa.",
      "I am 7 years old.",
      "I am fine, thank you!",
      "I am from France.",
    ],
    reponse: "I am fine, thank you!",
    explication: "I am fine, thank you! / Je vais bien, merci !",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Which greeting do you use in the morning?",
    options: [
      "Good evening!",
      "Good night!",
      "Good morning!",
      "Good afternoon!",
    ],
    reponse: "Good morning!",
    explication: "Good morning! / Bonjour (le matin) !",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "How do you ask someone's age?",
    options: [
      "What is your name?",
      "Where are you from?",
      "How old are you?",
      "How are you?",
    ],
    reponse: "How old are you?",
    explication: "How old are you? / Quel âge as-tu ?",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complete: 'I ___ 7 years old.'",
    options: ["have", "am", "is", "are"],
    reponse: "am",
    explication: "I am 7 years old. / J'ai 7 ans. On utilise 'am' avec 'I'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'Enchanté(e) !' in English?",
    options: ["See you!", "Goodbye!", "Nice to meet you!", "Good morning!"],
    reponse: "Nice to meet you!",
    explication: "Nice to meet you! / Enchanté(e) de te rencontrer !",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom says: 'I am from France.' What does this mean?",
    options: [
      "Tom s'appelle France.",
      "Tom a l'âge de France.",
      "Tom vient de France.",
      "Tom aime la France.",
    ],
    reponse: "Tom vient de France.",
    explication: "I am from France. / Je viens de France.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "anglais";
const THEME = "introducing-yourself";

export default function SePresenterCE1() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );

  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: score,
          total: questionsActives.length,
        });

        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
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
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Introducing Yourself</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questionsActives.length}
            </span>
            <span>
              {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${progression}%` }}
            ></div>
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">👋 Introducing Yourself · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

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
                  🏆 Meilleur <br />{" "}
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
                  🕐 Dernier <br />{" "}
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}

          <div className="lecon-points">
            {lecon.points.map((p, i) => (
              <div key={i} className="lecon-point">
                <div className="lecon-point-titre">{p.titre}</div>
                <div className="lecon-point-texte">{p.texte}</div>
                <div className="lecon-point-exemple">
                  <span className="exemple-label">Exemples :</span> {p.exemple}
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Je suis prêt(e) — Passer aux exercices →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div className="qcm-wrapper">
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Well done! 🎉"
                    : "Not quite..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">
            {score >= 9 ? "🏆" : score >= 7 ? "⭐" : score >= 5 ? "👍" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score >= 9
              ? "Excellent!"
              : score >= 7
                ? "Well done!"
                : score >= 5
                  ? "Good job!"
                  : "Keep trying!"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu sais parfaitement te présenter en anglais !"
              : score >= 7
                ? "Tu as bien compris l'essentiel !"
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
