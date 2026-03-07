"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les compléments du verbe",
  intro:
    "Dans une phrase, le verbe peut être accompagné de compléments qui donnent des informations supplémentaires. Il existe deux grands types : le COD et le COI.",
  points: [
    {
      titre: "Le COD (Complément d'Objet Direct)",
      texte:
        "Le COD répond à la question 'qui ?' ou 'quoi ?' posée directement après le verbe, sans préposition.",
      exemple: "Emma mange une pomme. → mange quoi ? → une pomme (COD)",
    },
    {
      titre: "Le COI (Complément d'Objet Indirect)",
      texte:
        "Le COI répond à la question 'à qui ?', 'à quoi ?', 'de qui ?' posée après le verbe, avec une préposition.",
      exemple: "Il parle à son ami. → parle à qui ? → à son ami (COI)",
    },
    {
      titre: "Le complément circonstanciel",
      texte:
        "Le complément circonstanciel indique les circonstances de l'action : lieu, temps, manière. On peut le supprimer sans changer le sens principal.",
      exemple: "Il joue dans le jardin. (lieu) · Il joue le soir. (temps)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Dans 'Lucas lit un livre', quel est le COD ?",
    options: ["Lucas", "lit", "un livre", "pas de COD"],
    reponse: "un livre",
    explication: "On pose la question 'lit quoi ?' → un livre. C'est le COD.",
  },
  {
    id: 2,
    question: "Dans 'Elle parle à sa mère', quel est le COI ?",
    options: ["Elle", "parle", "sa mère", "à sa mère"],
    reponse: "à sa mère",
    explication:
      "On pose la question 'parle à qui ?' → à sa mère. C'est le COI (avec préposition 'à').",
  },
  {
    id: 3,
    question:
      "Dans 'Il joue dans le parc le soir', quel est le complément de temps ?",
    options: ["Il", "joue", "dans le parc", "le soir"],
    reponse: "le soir",
    explication:
      "'le soir' indique quand il joue, c'est un complément circonstanciel de temps.",
  },
  {
    id: 4,
    question:
      "Dans 'Emma mange une pomme', quel type de complément est 'une pomme' ?",
    options: ["COI", "COD", "complément de lieu", "sujet"],
    reponse: "COD",
    explication:
      "'une pomme' répond à 'mange quoi ?' sans préposition → c'est un COD.",
  },
  {
    id: 5,
    question:
      "Quel complément peut-on supprimer sans changer le sens principal ?",
    options: ["Le COD", "Le COI", "Le sujet", "Le complément circonstanciel"],
    reponse: "Le complément circonstanciel",
    explication:
      "Le complément circonstanciel (lieu, temps, manière) peut être supprimé sans changer le sens essentiel de la phrase.",
  },
];

export default function GrammaireCM1Complements() {
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
          <div className="lecon-badge">📝 Grammaire · CM1</div>
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
              ? "Tu as tout bon ! Tu maîtrises les compléments du verbe."
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
