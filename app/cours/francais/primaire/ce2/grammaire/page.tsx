"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le sujet et le verbe",
  intro:
    "Dans une phrase, le sujet et le verbe sont les deux éléments les plus importants. Le sujet dit de qui ou de quoi on parle, et le verbe dit ce que fait le sujet.",
  points: [
    {
      titre: "Le sujet",
      texte:
        "Le sujet est le mot ou groupe de mots qui fait l'action. Pour le trouver, on pose la question 'Qui est-ce qui ?' ou 'Qu'est-ce qui ?'",
      exemple: "Le chien court. → Qui court ? → Le chien (sujet)",
    },
    {
      titre: "Le verbe",
      texte:
        "Le verbe exprime l'action faite par le sujet. Il s'accorde toujours avec le sujet.",
      exemple: "Le chat dort. · Les chats dorment. · Tu joues.",
    },
    {
      titre: "L'accord sujet-verbe",
      texte:
        "Le verbe change selon le sujet. Si le sujet est au pluriel, le verbe est au pluriel aussi.",
      exemple:
        "Le chien mange. → Les chiens mangent. · Il court. → Ils courent.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le sujet dans 'Le chat dort sur le canapé' ?",
    options: ["dort", "le canapé", "Le chat", "sur"],
    reponse: "Le chat",
    explication:
      "Pour trouver le sujet, on demande 'Qui est-ce qui dort ?' → Le chat.",
  },
  {
    id: 2,
    question: "Quel est le verbe dans 'Emma mange une pomme' ?",
    options: ["Emma", "mange", "une", "pomme"],
    reponse: "mange",
    explication: "'mange' est le verbe car il exprime l'action d'Emma.",
  },
  {
    id: 3,
    question: "Complète avec le bon verbe : 'Les élèves ___ en classe.'",
    options: ["travaille", "travailles", "travaillent", "travailler"],
    reponse: "travaillent",
    explication:
      "'Les élèves' est au pluriel donc le verbe prend la terminaison '-ent'.",
  },
  {
    id: 4,
    question: "Quel est le sujet dans 'Aujourd'hui, il pleut.' ?",
    options: ["Aujourd'hui", "il", "pleut", "pas de sujet"],
    reponse: "il",
    explication: "'il' est le sujet du verbe 'pleut'.",
  },
  {
    id: 5,
    question: "Complète : 'Le soleil ___ dans le ciel.' (briller)",
    options: ["brillent", "brilles", "brille", "brillez"],
    reponse: "brille",
    explication:
      "'Le soleil' est singulier donc le verbe est 'brille' (sans -nt).",
  },
];

export default function GrammaireCE2SujetVerbe() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
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
    if (qIndex + 1 >= questions.length) {
      setEtape("fini");
    } else {
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
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/francais/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire</span>
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
          <div className="lecon-badge">📝 Grammaire · CE2</div>
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
                    ? "Bravo !"
                    : "Pas tout à fait..."}
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
            {score === questions.length ? "🏆" : score >= 3 ? "⭐" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score === questions.length
              ? "Parfait !"
              : score >= 3
                ? "Bien joué !"
                : "Continue comme ça !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score === questions.length
              ? "Tu as tout bon ! Tu maîtrises le sujet et le verbe."
              : score >= 3
                ? "Tu as bien compris l'essentiel."
                : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/francais/primaire/ce2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
