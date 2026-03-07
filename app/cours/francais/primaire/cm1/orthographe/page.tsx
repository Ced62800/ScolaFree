"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones : est/et, son/sont, ou/où",
  intro:
    "Les homophones sont des mots qui se prononcent pareil mais s'écrivent différemment. Apprenons à ne plus les confondre !",
  points: [
    {
      titre: "est / et",
      texte:
        "'est' est le verbe être (remplaçable par 'était'). 'et' est une conjonction de coordination (remplaçable par 'et puis').",
      exemple:
        "Il est grand. → Il était grand. ✅ · Il mange et dort. → Il mange et puis dort. ✅",
    },
    {
      titre: "son / sont",
      texte:
        "'son' est un déterminant possessif (remplaçable par 'mon'). 'sont' est le verbe être au pluriel (remplaçable par 'étaient').",
      exemple:
        "Son chat est mignon. → Mon chat. ✅ · Ils sont partis. → Ils étaient partis. ✅",
    },
    {
      titre: "ou / où",
      texte:
        "'ou' exprime un choix (remplaçable par 'ou bien'). 'où' indique un lieu ou pose une question (non remplaçable par 'ou bien').",
      exemple:
        "Tu veux du lait ou du jus ? → ou bien ✅ · Où es-tu ? → ou bien es-tu ? ❌",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Le ciel ___ bleu aujourd'hui.'",
    options: ["et", "est", "son", "sont"],
    reponse: "est",
    explication:
      "On peut remplacer par 'était' : 'Le ciel était bleu' → c'est le verbe être 'est'.",
  },
  {
    id: 2,
    question: "Complète : 'Il mange une pomme ___ une poire.'",
    options: ["est", "et", "ou", "où"],
    reponse: "et",
    explication:
      "On peut remplacer par 'et puis' : 'une pomme et puis une poire' → c'est la conjonction 'et'.",
  },
  {
    id: 3,
    question: "Complète : 'Les enfants ___ dans la cour.'",
    options: ["son", "sont", "est", "et"],
    reponse: "sont",
    explication:
      "On peut remplacer par 'étaient' : 'Les enfants étaient dans la cour' → c'est le verbe 'sont'.",
  },
  {
    id: 4,
    question: "Complète : '___ habites-tu ?'",
    options: ["Ou", "Où", "Son", "Est"],
    reponse: "Où",
    explication:
      "'Où' indique un lieu dans une question. On ne peut pas remplacer par 'ou bien'.",
  },
  {
    id: 5,
    question: "Complète : 'Tu veux du thé ___ du café ?'",
    options: ["où", "est", "ou", "sont"],
    reponse: "ou",
    explication:
      "On peut remplacer par 'ou bien' : 'du thé ou bien du café' → c'est la conjonction 'ou'.",
  },
];

export default function OrthographeCM1Homophones() {
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
          <span className="breadcrumb-active">Orthographe</span>
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
          <div className="lecon-badge">✏️ Orthographe · CM1</div>
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
              ? "Tu as tout bon ! Tu maîtrises les homophones."
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
