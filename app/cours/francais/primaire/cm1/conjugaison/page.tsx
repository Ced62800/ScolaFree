"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "L'imparfait",
  intro:
    "L'imparfait est un temps du passé qui exprime une action qui durait ou se répétait dans le passé. Il se termine par -ais, -ais, -ait, -ions, -iez, -aient.",
  points: [
    {
      titre: "Quand utilise-t-on l'imparfait ?",
      texte:
        "On utilise l'imparfait pour décrire une situation passée, une habitude dans le passé, ou une action qui durait.",
      exemple:
        "Quand j'étais petit, je jouais au ballon. · Il faisait beau ce jour-là.",
    },
    {
      titre: "Les terminaisons de l'imparfait",
      texte:
        "Toutes les personnes ont des terminaisons régulières à l'imparfait.",
      exemple:
        "je chantais · tu chantais · il chantait · nous chantions · vous chantiez · ils chantaient",
    },
    {
      titre: "L'imparfait du verbe être et avoir",
      texte:
        "Les verbes être et avoir ont des radicaux irréguliers mais les mêmes terminaisons.",
      exemple: "j'étais · tu étais · il était · j'avais · tu avais · il avait",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel verbe est à l'imparfait ?",
    options: ["je chante", "je chanterai", "je chantais", "j'ai chanté"],
    reponse: "je chantais",
    explication: "'je chantais' est à l'imparfait car il se termine par -ais.",
  },
  {
    id: 2,
    question: "Quelle est la terminaison de l'imparfait pour 'ils' ?",
    options: ["-ent", "-ont", "-aient", "-aient"],
    reponse: "-aient",
    explication: "À l'imparfait, 'ils/elles' se termine toujours par -aient.",
  },
  {
    id: 3,
    question: "Complète : 'Quand il était petit, il ___ au foot.' (jouer)",
    options: ["joue", "jouera", "a joué", "jouait"],
    reponse: "jouait",
    explication:
      "L'imparfait s'utilise pour une habitude dans le passé : 'jouait'.",
  },
  {
    id: 4,
    question: "Quel est l'imparfait de 'être' à la 1ère personne ?",
    options: ["je suis", "j'étais", "je serai", "j'ai été"],
    reponse: "j'étais",
    explication: "L'imparfait du verbe être à la 1ère personne est 'j'étais'.",
  },
  {
    id: 5,
    question: "Complète : 'Nous ___ souvent à la mer.' (aller)",
    options: ["allons", "irons", "sommes allés", "allions"],
    reponse: "allions",
    explication:
      "À l'imparfait, 'nous' prend la terminaison -ions : 'nous allions'.",
  },
];

export default function ConjugaisonCM1Imparfait() {
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
          <span className="breadcrumb-active">Conjugaison</span>
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
          <div className="lecon-badge">⏰ Conjugaison · CM1</div>
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
              ? "Tu as tout bon ! Tu maîtrises l'imparfait."
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
