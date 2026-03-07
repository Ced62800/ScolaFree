"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les figures de style",
  intro:
    "Les figures de style sont des procédés qui permettent d'embellir le langage et de rendre les textes plus expressifs. On les retrouve souvent dans la poésie et la littérature.",
  points: [
    {
      titre: "La comparaison",
      texte:
        "La comparaison rapproche deux éléments à l'aide d'un mot comparatif : comme, tel, pareil à, semblable à...",
      exemple: "Il est fort comme un lion. · Elle court comme le vent.",
    },
    {
      titre: "La métaphore",
      texte:
        "La métaphore compare deux éléments sans utiliser de mot comparatif. C'est une comparaison directe.",
      exemple:
        "C'est un lion ! (pour dire qu'il est fort) · La vie est un long fleuve tranquille.",
    },
    {
      titre: "La personnification",
      texte:
        "La personnification donne des caractéristiques humaines à un objet, un animal ou une idée.",
      exemple:
        "Le vent murmure dans les arbres. · La lune nous sourit ce soir.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Dans 'Elle est douce comme la pluie', quelle figure de style est utilisée ?",
    options: ["Métaphore", "Comparaison", "Personnification", "Aucune"],
    reponse: "Comparaison",
    explication: "Il y a le mot comparatif 'comme' → c'est une comparaison.",
  },
  {
    id: 2,
    question:
      "Dans 'Le soleil se lève et nous sourit', quelle figure de style est utilisée ?",
    options: ["Comparaison", "Métaphore", "Personnification", "Aucune"],
    reponse: "Personnification",
    explication:
      "Le soleil 'sourit' comme un être humain → c'est une personnification.",
  },
  {
    id: 3,
    question:
      "Dans 'Cet homme est un renard', quelle figure de style est utilisée ?",
    options: ["Comparaison", "Métaphore", "Personnification", "Aucune"],
    reponse: "Métaphore",
    explication:
      "On compare l'homme à un renard sans 'comme' → c'est une métaphore (il est rusé).",
  },
  {
    id: 4,
    question: "Quelle figure de style utilise le mot 'comme' ?",
    options: [
      "La métaphore",
      "La personnification",
      "La comparaison",
      "Aucune",
    ],
    reponse: "La comparaison",
    explication:
      "La comparaison utilise des mots comme 'comme', 'tel', 'pareil à'.",
  },
  {
    id: 5,
    question:
      "Dans 'La forêt chuchote des secrets', quelle figure de style est utilisée ?",
    options: ["Comparaison", "Métaphore", "Personnification", "Aucune"],
    reponse: "Personnification",
    explication:
      "La forêt 'chuchote' comme un être humain → c'est une personnification.",
  },
];

export default function VocabulaireCM2FiguresStyle() {
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
              ? "Tu as tout bon ! Tu maîtrises les figures de style."
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
