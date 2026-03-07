"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones : a/à, est/et, on/ont",
  intro:
    "Certains mots se prononcent pareil mais s'écrivent différemment. Ce sont des homophones. En CE2, tu apprends à distinguer a/à, est/et, on/ont.",
  points: [
    {
      titre: "a / à",
      texte:
        "'a' est le verbe avoir (on peut le remplacer par 'avait'). 'à' est une préposition (indique le lieu, le temps).",
      exemple:
        "Il a faim. → Il avait faim ✅ · Il va à l'école. → Il va avait l'école ❌",
    },
    {
      titre: "est / et",
      texte:
        "'est' est le verbe être (on peut le remplacer par 'était'). 'et' est une conjonction qui relie deux éléments.",
      exemple:
        "Elle est belle. → Elle était belle ✅ · Le chat et le chien jouent.",
    },
    {
      titre: "on / ont",
      texte:
        "'on' est un pronom sujet (= il/elle). 'ont' est le verbe avoir au pluriel (ils ont — on peut le remplacer par 'avaient').",
      exemple: "On mange. · Ils ont mangé. → Ils avaient mangé ✅",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Il ___ très faim ce soir.'",
    options: ["à", "a", "est", "et"],
    reponse: "a",
    explication: "'a' = verbe avoir (on peut dire 'il avait très faim').",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Elle va ___ l'école.'",
    options: ["a", "à", "est", "et"],
    reponse: "à",
    explication: "'à' indique le lieu — on ne peut pas dire 'avait l'école'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Le chat ___ le chien jouent ensemble.'",
    options: ["est", "et", "a", "à"],
    reponse: "et",
    explication:
      "'et' relie deux mots — on ne peut pas le remplacer par 'était'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Elle ___ très gentille.'",
    options: ["et", "est", "a", "à"],
    reponse: "est",
    explication:
      "'est' = verbe être (on peut dire 'elle était très gentille').",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complète : 'Les élèves ___ bien travaillé aujourd'hui.'",
    options: ["on", "ont", "sont", "a"],
    reponse: "ont",
    explication: "'ont' = verbe avoir au pluriel (ils avaient bien travaillé).",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : '___ mange des crêpes le dimanche.'",
    options: ["Ont", "On", "Son", "Ont"],
    reponse: "On",
    explication: "'On' est un pronom sujet (= il/elle).",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est correcte ?",
    options: [
      "Il à un vélo rouge.",
      "Il a un vélo rouge.",
      "Il est un vélo rouge.",
      "Il et un vélo rouge.",
    ],
    reponse: "Il a un vélo rouge.",
    explication: "'a' = verbe avoir (il avait un vélo rouge ✅).",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Papa ___ préparé un bon repas.'",
    options: ["à", "a", "est", "et"],
    reponse: "a",
    explication: "'a' = verbe avoir (papa avait préparé ✅).",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'Les enfants ___ joué toute la journée.'",
    options: ["on", "ont", "son", "sont"],
    reponse: "ont",
    explication: "'ont' = verbe avoir au pluriel (ils avaient joué ✅).",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase contient une erreur ?",
    options: [
      "Elle a mangé.",
      "Il est grand et fort.",
      "On à froid.",
      "Ils ont chaud.",
    ],
    reponse: "On à froid.",
    explication:
      "Il faut 'a' (verbe avoir) et non 'à' (préposition) : 'On a froid'.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function OrthographeCE2() {
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
              ? "Tu maîtrises parfaitement les homophones !"
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
