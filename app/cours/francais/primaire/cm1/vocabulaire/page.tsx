"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les niveaux de langue",
  intro:
    "En français, on ne parle pas de la même façon avec ses amis, ses parents ou son professeur. Il existe trois niveaux de langue : familier, courant et soutenu.",
  points: [
    {
      titre: "Le niveau familier",
      texte:
        "Le niveau familier s'utilise avec des amis ou en famille. Il peut contenir des mots d'argot ou des expressions raccourcies.",
      exemple: "C'est trop cool ! · T'as vu ça ? · Je me casse.",
    },
    {
      titre: "Le niveau courant",
      texte:
        "Le niveau courant est le plus utilisé au quotidien, à l'école, au travail. Il est neutre et correct.",
      exemple: "C'est très bien. · As-tu vu cela ? · Je m'en vais.",
    },
    {
      titre: "Le niveau soutenu",
      texte:
        "Le niveau soutenu s'utilise dans les textes littéraires, les discours officiels. Il est plus élaboré et recherché.",
      exemple:
        "C'est fort agréable. · Avez-vous remarqué ceci ? · Je prends congé.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle phrase est au niveau familier ?",
    options: ["Je m'en vais.", "Je prends congé.", "Je me casse.", "Je pars."],
    reponse: "Je me casse.",
    explication:
      "'Je me casse' est une expression familière qui signifie 'je pars'.",
  },
  {
    id: 2,
    question: "Quelle phrase est au niveau soutenu ?",
    options: [
      "C'est trop bien !",
      "C'est bien.",
      "C'est fort agréable.",
      "C'est cool.",
    ],
    reponse: "C'est fort agréable.",
    explication:
      "'C'est fort agréable' est une formulation soutenue et élaborée.",
  },
  {
    id: 3,
    question: "Avec ton professeur, quel niveau de langue utilises-tu ?",
    options: ["Familier", "Courant", "Soutenu", "N'importe lequel"],
    reponse: "Courant",
    explication:
      "À l'école, on utilise principalement le niveau courant, parfois soutenu dans les rédactions.",
  },
  {
    id: 4,
    question: "Quel est l'équivalent courant de 'J'ai la dalle' ?",
    options: [
      "Je suis affamé.",
      "J'ai faim.",
      "Je souffre de la faim.",
      "Je mange.",
    ],
    reponse: "J'ai faim.",
    explication:
      "'J'ai la dalle' est familier. L'équivalent courant est 'J'ai faim'.",
  },
  {
    id: 5,
    question: "Dans quel contexte utilise-t-on le niveau soutenu ?",
    options: [
      "Avec ses amis",
      "Dans un texto",
      "Dans un discours officiel",
      "En récréation",
    ],
    reponse: "Dans un discours officiel",
    explication:
      "Le niveau soutenu s'utilise dans les discours officiels, les textes littéraires.",
  },
];

export default function VocabulaireCM1NiveauxLangue() {
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
          onClick={() => router.push("/cours/francais/primaire/cm1")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM1</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CM1</div>
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
              ? "Tu as tout bon ! Tu maîtrises les niveaux de langue."
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
              onClick={() => router.push("/cours/francais/primaire/cm1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
