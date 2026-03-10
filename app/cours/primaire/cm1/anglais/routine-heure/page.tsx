"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Daily Routine & Time",
  intro:
    "Let's learn how to talk about our daily routine and tell the time in English! Parler de sa journée et lire l'heure sont des compétences essentielles.",
  points: [
    {
      titre: "Daily routine — La routine quotidienne",
      texte:
        "We do the same things every day. Use 'I' + verb to describe your routine.",
      exemple:
        "I wake up. | I get dressed. | I have breakfast. | I go to school. | I have lunch. | I do my homework. | I go to bed.",
    },
    {
      titre: "Telling the time — Lire l'heure",
      texte:
        "'What time is it?' = Quelle heure est-il ? Use 'It is...' to answer.",
      exemple:
        "It is 8 o'clock. (8h00) | It is half past 8. (8h30) | It is quarter past 9. (9h15) | It is quarter to 10. (9h45)",
    },
    {
      titre: "Time expressions — Les expressions de temps",
      texte: "We use these words to say when we do things.",
      exemple:
        "in the morning 🌅 | in the afternoon ☀️ | in the evening 🌆 | at night 🌙 | every day | at 7 o'clock",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "What do you do first in the morning? 🌅",
    options: [
      "I go to bed.",
      "I have lunch.",
      "I wake up.",
      "I do my homework.",
    ],
    reponse: "I wake up.",
    explication: "I wake up. / Je me réveille.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "How do you say 'Quelle heure est-il ?' in English?",
    options: [
      "What day is it?",
      "What time is it?",
      "Where are you?",
      "How are you?",
    ],
    reponse: "What time is it?",
    explication: "What time is it? / Quelle heure est-il ?",
    niveau: "facile",
  },
  {
    id: 3,
    question: "What time is 'eight o'clock'?",
    options: ["7h00", "9h00", "8h30", "8h00"],
    reponse: "8h00",
    explication: "Eight o'clock = 8h00. / Huit heures.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "What time is 'half past 3'?",
    options: ["3h00", "3h15", "3h30", "3h45"],
    reponse: "3h30",
    explication: "Half past 3 = 3h30. / Trois heures et demie.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complete: 'I ___ breakfast at 7 o'clock.'",
    options: ["do", "make", "have", "eat"],
    reponse: "have",
    explication: "I have breakfast. / Je prends le petit déjeuner.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "How do you say 'le matin' in English?",
    options: [
      "at night",
      "in the evening",
      "in the afternoon",
      "in the morning",
    ],
    reponse: "in the morning",
    explication: "In the morning. / Le matin.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "What time is 'quarter past 6'?",
    options: ["6h00", "6h15", "6h30", "6h45"],
    reponse: "6h15",
    explication: "Quarter past 6 = 6h15. / Six heures et quart.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "What do you do before going to sleep? 🌙",
    options: [
      "I wake up.",
      "I go to school.",
      "I go to bed.",
      "I have breakfast.",
    ],
    reponse: "I go to bed.",
    explication: "I go to bed. / Je vais me coucher.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "What time is 'quarter to 4'?",
    options: ["4h15", "4h45", "3h45", "3h15"],
    reponse: "3h45",
    explication: "Quarter to 4 = 3h45. / Quatre heures moins le quart.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complete: 'I ___ my homework in the afternoon.'",
    options: ["make", "have", "go", "do"],
    reponse: "do",
    explication: "I do my homework. / Je fais mes devoirs.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function RoutineHeureCM1() {
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
          <span className="breadcrumb-active">Daily Routine & Time</span>
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
          <div className="lecon-badge">⏰ Daily Routine & Time · CM1</div>
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
              ? "Tu maîtrises parfaitement la routine et l'heure en anglais !"
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
