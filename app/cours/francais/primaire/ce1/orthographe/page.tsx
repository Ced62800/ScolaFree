"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les accords dans le groupe nominal",
  intro:
    "Dans un groupe nominal, le déterminant et l'adjectif s'accordent avec le nom. Si le nom est féminin, tout devient féminin. Si le nom est pluriel, tout devient pluriel !",
  points: [
    {
      titre: "L'accord en genre",
      texte:
        "Un nom masculin → déterminant et adjectif masculins. Un nom féminin → déterminant et adjectif féminins.",
      exemple: "un petit chat · une petite chatte",
    },
    {
      titre: "L'accord en nombre",
      texte:
        "Un nom singulier → déterminant et adjectif singuliers. Un nom pluriel → déterminant et adjectif pluriels (on ajoute -s).",
      exemple: "le grand arbre · les grands arbres",
    },
    {
      titre: "Les deux accords ensemble",
      texte: "On peut avoir un accord en genre ET en nombre en même temps.",
      exemple:
        "un beau jardin · une belle fleur · de beaux jardins · de belles fleurs",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel groupe nominal est correct ?",
    options: [
      "un petite chat",
      "une petit chat",
      "un petit chat",
      "une petite chat",
    ],
    reponse: "un petit chat",
    explication: "'chat' est masculin → 'un' et 'petit' sont masculins.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel groupe nominal est correct ?",
    options: [
      "une grande maison",
      "un grande maison",
      "une grand maison",
      "un grand maison",
    ],
    reponse: "une grande maison",
    explication: "'maison' est féminin → 'une' et 'grande' sont féminins.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Mets au pluriel : 'un beau livre'",
    options: [
      "un beaux livres",
      "des beau livres",
      "de beaux livres",
      "des beaux livre",
    ],
    reponse: "de beaux livres",
    explication: "Au pluriel masculin : 'de beaux livres'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel adjectif convient ? 'une fleur ___'",
    options: ["rouge", "rouges", "rougé", "rougée"],
    reponse: "rouge",
    explication: "'rouge' ne change pas au féminin singulier.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Mets au féminin : 'un chat noir'",
    options: [
      "une chat noire",
      "une chatte noire",
      "un chatte noir",
      "une chatte noir",
    ],
    reponse: "une chatte noire",
    explication:
      "Au féminin : 'une chatte noire' — le déterminant et l'adjectif s'accordent.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel groupe nominal est au pluriel ?",
    options: [
      "le petit garçon",
      "une belle fleur",
      "les petits garçons",
      "un grand arbre",
    ],
    reponse: "les petits garçons",
    explication:
      "'les petits garçons' est au pluriel — déterminant et adjectif ont le -s.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : 'des ___ filles'",
    options: ["beau", "belle", "belles", "beaux"],
    reponse: "belles",
    explication: "'filles' est féminin pluriel → 'belles'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel groupe nominal est correct ?",
    options: [
      "les petites chiens",
      "les petit chiens",
      "les petits chiens",
      "les petits chien",
    ],
    reponse: "les petits chiens",
    explication: "'chiens' est masculin pluriel → 'les petits chiens'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Mets au féminin pluriel : 'un vieux monsieur'",
    options: [
      "une vieilles dames",
      "de vieilles dames",
      "des vielle dames",
      "une vielle dame",
    ],
    reponse: "de vieilles dames",
    explication: "Au féminin pluriel : 'de vieilles dames'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel groupe nominal contient une erreur d'accord ?",
    options: [
      "une belle maison",
      "les grands arbres",
      "un petite garçon",
      "de jolies fleurs",
    ],
    reponse: "un petite garçon",
    explication: "'garçon' est masculin → il faut 'un petit garçon'.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function OrthographeCE1() {
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
          onClick={() => router.push("/cours/francais/primaire/ce1")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE1</span>
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
          <div className="lecon-badge">✏️ Orthographe · CE1</div>
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
              ? "Tu maîtrises parfaitement les accords !"
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
              onClick={() => router.push("/cours/francais/primaire/ce1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
