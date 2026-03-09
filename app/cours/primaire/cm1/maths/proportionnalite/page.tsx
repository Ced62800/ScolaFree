"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La proportionnalité",
  intro:
    "En CM1, on découvre la proportionnalité. Deux grandeurs sont proportionnelles quand leur rapport est constant — on peut toujours multiplier ou diviser par le même nombre.",
  points: [
    {
      titre: "Tableaux de proportionnalité",
      texte:
        "Dans un tableau de proportionnalité, on passe d'une ligne à l'autre en multipliant ou divisant par le même nombre (le coefficient de proportionnalité).",
      exemple:
        "1 kg de pommes → 2 €. 3 kg → 6 €. 5 kg → 10 €. (coefficient = 2)",
    },
    {
      titre: "La règle de trois",
      texte:
        "Si on connaît la valeur pour 1, on peut calculer la valeur pour n'importe quelle quantité en multipliant. Si on connaît la valeur pour plusieurs, on divise d'abord pour trouver la valeur pour 1.",
      exemple: "1 stylo coûte 3 €. 4 stylos coûtent 4 × 3 = 12 €.",
    },
    {
      titre: "Échelles et vitesses",
      texte:
        "L'échelle d'une carte est un rapport de proportionnalité. La vitesse aussi : si on roule à 60 km/h, en 2h on parcourt 120 km.",
      exemple: "Échelle 1/100 : 1 cm sur la carte = 100 cm = 1 m en réalité.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "1 cahier coûte 2 €. Combien coûtent 4 cahiers ?",
    options: ["6 €", "8 €", "10 €", "4 €"],
    reponse: "8 €",
    explication: "4 × 2 = 8 €.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Une voiture roule à 80 km/h. En 2 heures, quelle distance parcourt-elle ?",
    options: ["80 km", "120 km", "160 km", "40 km"],
    reponse: "160 km",
    explication: "80 km/h × 2 h = 160 km.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Dans ce tableau : 1 → 5, 2 → 10, 3 → ? Quelle est la valeur manquante ?",
    options: ["12", "13", "15", "20"],
    reponse: "15",
    explication: "Le coefficient est 5 (on multiplie par 5). 3 × 5 = 15.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "3 kg de carottes coûtent 6 €. Combien coûtent 7 kg ?",
    options: ["12 €", "14 €", "16 €", "18 €"],
    reponse: "14 €",
    explication: "1 kg coûte 6 ÷ 3 = 2 €. 7 kg coûtent 7 × 2 = 14 €.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Un cycliste roule à 15 km/h. En 3 heures, quelle distance parcourt-il ?",
    options: ["30 km", "45 km", "50 km", "60 km"],
    reponse: "45 km",
    explication: "15 km/h × 3 h = 45 km.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Dans un tableau de proportionnalité : 4 → 12, 6 → ? Quelle est la valeur manquante ?",
    options: ["16", "18", "20", "24"],
    reponse: "18",
    explication: "Le coefficient est 3 (12 ÷ 4 = 3). 6 × 3 = 18.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Sur une carte à l'échelle 1/1000, 3 cm représentent quelle distance réelle ?",
    options: ["3 m", "30 m", "300 m", "3 000 m"],
    reponse: "30 m",
    explication: "1 cm = 1 000 cm = 10 m en réalité. 3 cm = 3 × 10 = 30 m.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "5 livres coûtent 35 €. Combien coûtent 8 livres ?",
    options: ["48 €", "54 €", "56 €", "60 €"],
    reponse: "56 €",
    explication: "1 livre coûte 35 ÷ 5 = 7 €. 8 livres coûtent 8 × 7 = 56 €.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Une voiture parcourt 240 km en 3 heures. Quelle est sa vitesse ?",
    options: ["60 km/h", "70 km/h", "80 km/h", "90 km/h"],
    reponse: "80 km/h",
    explication: "Vitesse = distance ÷ temps = 240 ÷ 3 = 80 km/h.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Dans ce tableau : 2 → 7, 4 → 14, 10 → ? Quelle est la valeur manquante ?",
    options: ["30", "35", "40", "45"],
    reponse: "35",
    explication: "Le coefficient est 3,5 (7 ÷ 2 = 3,5). 10 × 3,5 = 35.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function ProportionnaliteCM1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex, session],
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
    setSession((s) => s + 1);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Proportionnalité</span>
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
          <div className="lecon-badge">📊 Proportionnalité · CM1</div>
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
              ? "Tu maîtrises parfaitement la proportionnalité !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cm1/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
