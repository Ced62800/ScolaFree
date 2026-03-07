"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le sens propre et le sens figuré",
  intro:
    "Un mot peut avoir plusieurs sens. Le sens propre est le sens concret et habituel du mot. Le sens figuré est un sens imagé, plus poétique ou expressif.",
  points: [
    {
      titre: "Le sens propre",
      texte:
        "Le sens propre est le sens premier, concret et littéral d'un mot.",
      exemple: "Il a un cœur. (sens propre = l'organe du corps)",
    },
    {
      titre: "Le sens figuré",
      texte:
        "Le sens figuré est un sens imagé qu'on donne à un mot pour exprimer une idée autrement.",
      exemple: "Il a un grand cœur. (sens figuré = il est généreux)",
    },
    {
      titre: "D'autres exemples",
      texte: "De nombreux mots courants ont un sens propre et un sens figuré.",
      exemple:
        "une dent de la scie (propre) / avoir les dents longues (figuré = être ambitieux)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Dans 'Il pleut des cordes', quel est le sens de cette expression ?",
    options: [
      "Il tombe de vraies cordes",
      "Il pleut très fort",
      "Les cordes sont mouillées",
      "Il fait beau",
    ],
    reponse: "Il pleut très fort",
    explication:
      "'Il pleut des cordes' est une expression au sens figuré qui signifie qu'il pleut très fort.",
  },
  {
    id: 2,
    question:
      "Dans 'Le chat a des dents pointues', 'dents' est utilisé au sens...",
    options: ["figuré", "propre", "contraire", "synonyme"],
    reponse: "propre",
    explication:
      "Ici 'dents' désigne les vraies dents du chat, c'est le sens propre.",
  },
  {
    id: 3,
    question:
      "Dans 'Emma a le cœur sur la main', que veut dire cette expression ?",
    options: [
      "Elle tient son cœur",
      "Elle est très généreuse",
      "Elle a mal à la main",
      "Elle est triste",
    ],
    reponse: "Elle est très généreuse",
    explication:
      "'Avoir le cœur sur la main' au sens figuré signifie être très généreux.",
  },
  {
    id: 4,
    question: "Dans 'Il a avalé sa langue', quel est le sens figuré ?",
    options: [
      "Il a mangé sa langue",
      "Il ne parle plus",
      "Il a faim",
      "Il est malade",
    ],
    reponse: "Il ne parle plus",
    explication:
      "'Avoir avalé sa langue' au sens figuré signifie qu'on ne parle plus, on est silencieux.",
  },
  {
    id: 5,
    question: "Quel exemple utilise 'tête' au sens figuré ?",
    options: [
      "J'ai mal à la tête",
      "La tête du clou",
      "Il est en tête de la classe",
      "Elle secoue la tête",
    ],
    reponse: "Il est en tête de la classe",
    explication:
      "'En tête de la classe' signifie premier de la classe, c'est un sens figuré.",
  },
];

export default function VocabulaireCE2SensPropre() {
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
          <span className="breadcrumb-active">Vocabulaire</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CE2</div>
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
              ? "Tu as tout bon ! Tu maîtrises le sens propre et le sens figuré."
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
