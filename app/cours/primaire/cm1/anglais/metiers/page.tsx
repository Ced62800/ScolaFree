"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Jobs & Professions",
  intro:
    "Let's learn the names of jobs and professions in English! Les métiers sont un sujet important pour se présenter et parler des autres.",
  points: [
    {
      titre: "Common jobs — Les métiers courants",
      texte:
        "These are jobs we see every day. 'He is a doctor' = Il est médecin. 'She is a teacher' = Elle est professeure.",
      exemple:
        "a doctor 👨‍⚕️ | a teacher 👩‍🏫 | a firefighter 🚒 | a police officer 👮 | a nurse 👩‍⚕️ | a farmer 👨‍🌾",
    },
    {
      titre: "More jobs — D'autres métiers",
      texte:
        "There are many more jobs! 'I want to be a vet' = Je veux être vétérinaire.",
      exemple:
        "a vet 🐾 | a cook / chef 👨‍🍳 | a pilot ✈️ | an engineer 👷 | a singer 🎤 | an artist 🎨 | a footballer ⚽",
    },
    {
      titre: "Asking about jobs — Parler des métiers",
      texte:
        "To ask about someone's job: 'What do you do?' or 'What is your job?'. To answer: 'I am a...' or 'I work as a...'",
      exemple:
        "What do you do? — I am a teacher. / What is your job? — I work as a nurse. / I want to be a pilot.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Who helps sick people? 👨‍⚕️",
    options: ["a teacher", "a doctor", "a farmer", "a pilot"],
    reponse: "a doctor",
    explication:
      "A doctor helps sick people. / Un médecin aide les personnes malades.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Who teaches children at school? 👩‍🏫",
    options: ["a nurse", "a cook", "a teacher", "a vet"],
    reponse: "a teacher",
    explication:
      "A teacher teaches children. / Un professeur enseigne aux enfants.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Who puts out fires? 🚒",
    options: ["a police officer", "a firefighter", "a farmer", "an engineer"],
    reponse: "a firefighter",
    explication:
      "A firefighter puts out fires. / Un pompier éteint les incendies.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Who flies planes? ✈️",
    options: ["a singer", "an engineer", "a pilot", "a footballer"],
    reponse: "a pilot",
    explication: "A pilot flies planes. / Un pilote fait voler les avions.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Who takes care of animals? 🐾",
    options: ["a doctor", "a nurse", "a farmer", "a vet"],
    reponse: "a vet",
    explication:
      "A vet takes care of animals. / Un vétérinaire s'occupe des animaux.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "How do you ask someone's job in English?",
    options: [
      "Where do you live?",
      "What do you do?",
      "How old are you?",
      "What is your name?",
    ],
    reponse: "What do you do?",
    explication: "What do you do? / Quel est ton métier ?",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complete: 'I ___ a teacher.' (être)",
    options: ["have", "do", "am", "work"],
    reponse: "am",
    explication: "I am a teacher. / Je suis professeur(e).",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Who grows food on a farm? 👨‍🌾",
    options: ["a cook", "a pilot", "a farmer", "an artist"],
    reponse: "a farmer",
    explication:
      "A farmer grows food on a farm. / Un agriculteur cultive de la nourriture à la ferme.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'Je veux être chanteur' in English?",
    options: [
      "I am a singer.",
      "I work as a singer.",
      "I want to be a singer.",
      "I like singing.",
    ],
    reponse: "I want to be a singer.",
    explication: "I want to be a singer. / Je veux être chanteur.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom says: 'I work as a chef.' What does this mean?",
    options: [
      "Tom est pompier.",
      "Tom est cuisinier.",
      "Tom est médecin.",
      "Tom est artiste.",
    ],
    reponse: "Tom est cuisinier.",
    explication: "I work as a chef. / Je travaille comme cuisinier.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function MetiersCM1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex, session],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
    setSession((s) => s + 1);
  };

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
          <span className="breadcrumb-active">Jobs & Professions</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questions.length}
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
          <div className="lecon-badge">💼 Jobs & Professions · CM1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
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
            {niveauLabel(questions[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questions[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questions[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questions[qIndex].reponse
                    ? "Well done! 🎉"
                    : "Not quite..."}
                </strong>
                <p>{questions[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questions.length
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
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement les métiers en anglais !"
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
