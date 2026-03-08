"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les figures de style",
  intro:
    "Les figures de style sont des procédés littéraires qui rendent le langage plus expressif et imagé. En CM2, tu apprends à reconnaître la comparaison, la métaphore et la personnification.",
  points: [
    {
      titre: "La comparaison",
      texte:
        "La comparaison rapproche deux éléments à l'aide d'un mot outil : comme, tel, pareil à, ressemble à...",
      exemple:
        "Il court comme le vent. · Elle est douce comme la soie. · Il est fort tel un lion.",
    },
    {
      titre: "La métaphore",
      texte:
        "La métaphore compare deux éléments SANS mot outil. Elle affirme directement qu'une chose en est une autre.",
      exemple:
        "Il est un lion sur le terrain. · La vie est un long fleuve tranquille. · Ses yeux sont des étoiles.",
    },
    {
      titre: "La personnification",
      texte:
        "La personnification attribue des caractéristiques humaines à un animal, un objet ou une idée.",
      exemple:
        "Le vent hurle dans la nuit. · Les étoiles nous regardent. · La forêt murmure des secrets.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Quelle figure de style est utilisée : 'Il court comme le vent' ?",
    options: ["métaphore", "personnification", "comparaison", "exagération"],
    reponse: "comparaison",
    explication: "'comme' est le mot outil de la comparaison.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Quelle figure de style est utilisée : 'Le vent hurle dans la nuit' ?",
    options: ["comparaison", "métaphore", "personnification", "répétition"],
    reponse: "personnification",
    explication:
      "'hurle' est une action humaine attribuée au vent → personnification.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle est la différence entre comparaison et métaphore ?",
    options: [
      "Il n'y a aucune différence.",
      "La comparaison utilise un mot outil, la métaphore non.",
      "La métaphore utilise un mot outil, la comparaison non.",
      "La comparaison parle d'animaux, la métaphore de personnes.",
    ],
    reponse: "La comparaison utilise un mot outil, la métaphore non.",
    explication:
      "Comparaison : 'comme', 'tel'... Métaphore : affirmation directe sans mot outil.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Quelle figure de style est utilisée : 'Ses yeux sont des étoiles' ?",
    options: ["comparaison", "métaphore", "personnification", "répétition"],
    reponse: "métaphore",
    explication:
      "Pas de mot outil — on affirme directement que ses yeux SONT des étoiles.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Quelle figure de style est utilisée : 'La mer chante une berceuse' ?",
    options: ["comparaison", "métaphore", "personnification", "exagération"],
    reponse: "personnification",
    explication:
      "'chante une berceuse' est une action humaine attribuée à la mer.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Identifie la figure de style : 'Elle est forte comme un roc.'",
    options: ["métaphore", "personnification", "comparaison", "répétition"],
    reponse: "comparaison",
    explication: "'comme' est le mot outil → comparaison.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase contient une MÉTAPHORE ?",
    options: [
      "Il est agile comme un chat.",
      "Le soleil se lève tôt.",
      "Sa voix est du miel.",
      "Les oiseaux chantent le matin.",
    ],
    reponse: "Sa voix est du miel.",
    explication:
      "Pas de mot outil — on affirme que la voix EST du miel → métaphore.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle phrase contient une PERSONNIFICATION ?",
    options: [
      "Le ciel est bleu comme la mer.",
      "Les nuages sont des moutons blancs.",
      "La pluie pleure sur les toits.",
      "Il court vite.",
    ],
    reponse: "La pluie pleure sur les toits.",
    explication:
      "'pleurer' est une action humaine attribuée à la pluie → personnification.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Identifie la figure de style : 'La vie est un voyage.'",
    options: ["comparaison", "métaphore", "personnification", "répétition"],
    reponse: "métaphore",
    explication:
      "Pas de mot outil — on affirme que la vie EST un voyage → métaphore.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Dans 'Les arbres tendent leurs bras vers le ciel', quelle figure de style est utilisée ?",
    options: ["comparaison", "métaphore", "personnification", "exagération"],
    reponse: "personnification",
    explication:
      "'tendent leurs bras' attribue une action humaine aux arbres → personnification.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function VocabulaireCM2() {
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
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CM2</div>
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
            {score >= 9 ? "🏆" : score >= 7 ? "⭐" : score >= 5 ? "👍" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score >= 9
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les figures de style !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cm2/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
