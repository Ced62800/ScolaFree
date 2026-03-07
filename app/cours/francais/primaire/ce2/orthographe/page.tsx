"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones : a / à et on / ont",
  intro:
    "Les homophones sont des mots qui se prononcent de la même façon mais qui s'écrivent différemment et n'ont pas le même sens. Apprenons à les distinguer !",
  points: [
    {
      titre: "a / à",
      texte:
        "'a' est le verbe avoir (on peut le remplacer par 'avait'). 'à' est une préposition (on ne peut pas le remplacer par 'avait').",
      exemple:
        "Il a faim. → Il avait faim. ✅ · Il va à l'école. → Il va avait l'école. ❌",
    },
    {
      titre: "on / ont",
      texte:
        "'on' est un pronom (on peut le remplacer par 'il'). 'ont' est le verbe avoir (on peut le remplacer par 'avaient').",
      exemple: "On joue. → Il joue. ✅ · Ils ont joué. → Ils avaient joué. ✅",
    },
    {
      titre: "L'astuce",
      texte:
        "Pour ne pas se tromper, essaie de remplacer le mot par 'avait' ou 'avaient'. Si ça marche, c'est le verbe avoir. Sinon, c'est la préposition ou le pronom.",
      exemple: "Il a un chien. → Il avait un chien. ✅ donc 'a' = verbe avoir",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Le chat ___ faim.'",
    options: ["à", "a", "on", "ont"],
    reponse: "a",
    explication:
      "On peut remplacer par 'avait' : 'Le chat avait faim.' → c'est le verbe avoir.",
  },
  {
    id: 2,
    question: "Complète : 'Il va ___ l'école.'",
    options: ["a", "à", "on", "ont"],
    reponse: "à",
    explication:
      "On ne peut pas remplacer par 'avait' → c'est la préposition 'à'.",
  },
  {
    id: 3,
    question: "Complète : '___ mange une pomme.'",
    options: ["à", "a", "on", "ont"],
    reponse: "on",
    explication:
      "'on' est un pronom : 'Il mange une pomme.' → c'est le pronom 'on'.",
  },
  {
    id: 4,
    question: "Complète : 'Ils ___ terminé leurs devoirs.'",
    options: ["on", "ont", "a", "à"],
    reponse: "ont",
    explication:
      "On peut remplacer par 'avaient' : 'Ils avaient terminé' → c'est le verbe avoir 'ont'.",
  },
  {
    id: 5,
    question: "Complète : 'Emma ___ un beau livre.'",
    options: ["à", "ont", "on", "a"],
    reponse: "a",
    explication:
      "On peut remplacer par 'avait' : 'Emma avait un beau livre.' → c'est le verbe avoir.",
  },
];

export default function OrthographeCE2Homophones() {
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
          onClick={() => router.push("/cours/francais/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
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
          <div className="lecon-badge">✏️ Orthographe · CE2</div>
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
              ? "Tu as tout bon ! Tu maîtrises les homophones a/à et on/ont."
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
              onClick={() => router.push("/cours/francais/primaire/ce2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
