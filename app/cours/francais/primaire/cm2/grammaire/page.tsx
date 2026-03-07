"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les types et formes de phrases",
  intro:
    "En français, il existe plusieurs types de phrases selon leur but, et plusieurs formes selon qu'elles sont affirmatives ou négatives.",
  points: [
    {
      titre: "Les types de phrases",
      texte:
        "Il existe 4 types de phrases : déclarative (on affirme), interrogative (on questionne), exclamative (on exprime un sentiment), impérative (on donne un ordre).",
      exemple:
        "Il fait beau. (déclarative) · Fait-il beau ? (interrogative) · Quel beau temps ! (exclamative) · Sortez ! (impérative)",
    },
    {
      titre: "La forme affirmative et négative",
      texte:
        "Une phrase peut être à la forme affirmative ou négative. La négation se forme avec 'ne...pas', 'ne...plus', 'ne...jamais'.",
      exemple:
        "Il mange. (affirmative) · Il ne mange pas. (négative) · Il ne mange plus. (négative)",
    },
    {
      titre: "La phrase complexe",
      texte:
        "Une phrase complexe contient plusieurs propositions reliées par des conjonctions de coordination ou de subordination.",
      exemple: "Il mange parce qu'il a faim. · Je joue et elle chante.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel type de phrase est 'Ferme la porte !' ?",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    reponse: "Impérative",
    explication:
      "'Ferme la porte !' donne un ordre, c'est une phrase impérative.",
  },
  {
    id: 2,
    question: "Quelle phrase est à la forme négative ?",
    options: [
      "Il joue au foot.",
      "Elle chante bien.",
      "Il ne vient pas.",
      "Nous mangeons.",
    ],
    reponse: "Il ne vient pas.",
    explication:
      "'Il ne vient pas' contient la négation 'ne...pas', c'est une forme négative.",
  },
  {
    id: 3,
    question: "Quel type de phrase est 'Quelle belle journée !' ?",
    options: ["Déclarative", "Interrogative", "Exclamative", "Impérative"],
    reponse: "Exclamative",
    explication:
      "'Quelle belle journée !' exprime un sentiment, c'est une phrase exclamative.",
  },
  {
    id: 4,
    question:
      "Dans 'Il mange parce qu'il a faim', combien y a-t-il de propositions ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication:
      "Il y a 2 propositions : 'Il mange' et 'il a faim', reliées par 'parce que'.",
  },
  {
    id: 5,
    question: "Quelle est la forme négative de 'Il mange toujours' ?",
    options: [
      "Il ne mange pas.",
      "Il ne mange plus.",
      "Il ne mange jamais.",
      "Il mange encore.",
    ],
    reponse: "Il ne mange jamais.",
    explication:
      "Le contraire de 'toujours' à la forme négative est 'ne...jamais'.",
  },
];

export default function GrammaireCM2TypesPhrases() {
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
          onClick={() => router.push("/cours/francais/primaire/cm2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
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
          <div className="lecon-badge">📝 Grammaire · CM2</div>
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
              ? "Tu as tout bon ! Tu maîtrises les types et formes de phrases."
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
              onClick={() => router.push("/cours/francais/primaire/cm2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
