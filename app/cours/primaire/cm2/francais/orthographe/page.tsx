"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "L'accord du participe passé",
  intro:
    "Le participe passé s'accorde selon l'auxiliaire utilisé. Avec 'être', il s'accorde avec le sujet. Avec 'avoir', il s'accorde avec le complément d'objet direct s'il est placé avant.",
  points: [
    {
      titre: "Accord avec 'être'",
      texte:
        "Avec l'auxiliaire 'être', le participe passé s'accorde en genre et en nombre avec le sujet.",
      exemple: "Elle est partie. · Ils sont arrivés. · Elles sont tombées.",
    },
    {
      titre: "Accord avec 'avoir'",
      texte:
        "Avec l'auxiliaire 'avoir', le participe passé ne s'accorde PAS avec le sujet. Il s'accorde avec le COD seulement s'il est placé AVANT le verbe.",
      exemple:
        "Elle a mangé une pomme. (pas d'accord) · La pomme qu'elle a mangée. (accord car 'que' = COD avant)",
    },
    {
      titre: "Cas particuliers",
      texte:
        "Les verbes pronominaux utilisent 'être' et suivent généralement les règles d'accord avec 'être'.",
      exemple: "Ils se sont lavés. · Elle s'est blessée.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle phrase est correcte ?",
    options: [
      "Elle est parti.",
      "Elle est partie.",
      "Elle est partis.",
      "Elle est parties.",
    ],
    reponse: "Elle est partie.",
    explication:
      "Avec 'être', le participe s'accorde avec le sujet féminin singulier → 'partie'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle phrase est correcte ?",
    options: [
      "Ils sont arrivé.",
      "Ils sont arrivés.",
      "Ils sont arrivée.",
      "Ils sont arrivées.",
    ],
    reponse: "Ils sont arrivés.",
    explication: "Sujet masculin pluriel → 'arrivés' (avec -s).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle phrase est correcte avec 'avoir' ?",
    options: [
      "Elle a mangés une pomme.",
      "Elle a mangée une pomme.",
      "Elle a mangé une pomme.",
      "Elle a mangé une pommes.",
    ],
    reponse: "Elle a mangé une pomme.",
    explication: "Avec 'avoir', pas d'accord quand le COD est après le verbe.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Les lettres qu'il a ___.' (écrire)",
    options: ["écrit", "écrits", "écrite", "écrites"],
    reponse: "écrites",
    explication:
      "'que' remplace 'lettres' (féminin pluriel), placé avant → accord : 'écrites'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quelle phrase est correcte ?",
    options: [
      "Elles se sont blessé.",
      "Elles se sont blessés.",
      "Elles se sont blessée.",
      "Elles se sont blessées.",
    ],
    reponse: "Elles se sont blessées.",
    explication:
      "Verbe pronominal avec 'être' : accord avec le sujet féminin pluriel → 'blessées'.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'La chanson qu'elle a ___.' (chanter)",
    options: ["chanté", "chantés", "chantée", "chantées"],
    reponse: "chantée",
    explication:
      "'que' remplace 'chanson' (féminin singulier), placé avant → 'chantée'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est correcte ?",
    options: [
      "Nous avons mangés.",
      "Nous avons mangé.",
      "Nous avons mangée.",
      "Nous avons mangées.",
    ],
    reponse: "Nous avons mangé.",
    explication:
      "Avec 'avoir', pas d'accord avec le sujet : 'mangé' reste invariable.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Les enfants que j'ai ___.' (voir)",
    options: ["vu", "vus", "vue", "vues"],
    reponse: "vus",
    explication:
      "'que' remplace 'enfants' (masculin pluriel), placé avant → 'vus'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quelle phrase est correcte ?",
    options: [
      "Elle s'est lavé les mains.",
      "Elle s'est lavée les mains.",
      "Elle s'est lavés les mains.",
      "Elle s'est lavées les mains.",
    ],
    reponse: "Elle s'est lavé les mains.",
    explication:
      "Le COD 'les mains' est après le verbe → pas d'accord : 'lavé'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : 'Les livres qu'ils ont ___.' (lire)",
    options: ["lu", "lus", "lue", "lues"],
    reponse: "lus",
    explication:
      "'que' remplace 'livres' (masculin pluriel), placé avant → 'lus'.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function OrthographeCM2() {
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
          <div className="lecon-badge">✏️ Orthographe · CM2</div>
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
              ? "Tu maîtrises parfaitement l'accord du participe passé !"
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
