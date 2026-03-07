"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le présent, l'imparfait et le futur",
  intro:
    "En CE2, tu apprends à utiliser trois temps : le présent (maintenant), l'imparfait (avant, habitude) et le futur (après). Chaque temps a ses propres terminaisons !",
  points: [
    {
      titre: "Le présent",
      texte:
        "On utilise le présent pour ce qui se passe maintenant ou habituellement.",
      exemple: "Je mange. · Nous jouons. · Ils finissent.",
    },
    {
      titre: "L'imparfait",
      texte:
        "On utilise l'imparfait pour parler d'une habitude dans le passé ou d'une action qui durait. Terminaisons : -ais, -ais, -ait, -ions, -iez, -aient.",
      exemple: "Je mangeais. · Nous jouions. · Ils finissaient.",
    },
    {
      titre: "Le futur simple",
      texte:
        "On utilise le futur pour parler de ce qui se passera. Terminaisons : -rai, -ras, -ra, -rons, -rez, -ront.",
      exemple: "Je mangerai. · Nous jouerons. · Ils finiront.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Quel temps est utilisé : 'Quand j'étais petit, je jouais au ballon' ?",
    options: ["présent", "imparfait", "futur", "passé composé"],
    reponse: "imparfait",
    explication:
      "'jouais' est à l'imparfait — c'était une habitude dans le passé.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Complète à l'imparfait : 'Nous ___ au parc tous les dimanches.' (aller)",
    options: ["allons", "irons", "allions", "allez"],
    reponse: "allions",
    explication: "À l'imparfait avec 'nous', on dit 'allions'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel temps est utilisé : 'Demain, nous partirons en vacances' ?",
    options: ["présent", "imparfait", "futur", "passé"],
    reponse: "futur",
    explication:
      "'partirons' est au futur — 'demain' indique que c'est à venir.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète à l'imparfait : 'Il ___ très fort.' (pleuvoir)",
    options: ["pleut", "pleuvra", "pleuvait", "pleuvoir"],
    reponse: "pleuvait",
    explication: "À l'imparfait, 'pleuvoir' devient 'pleuvait'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quelle phrase est à l'imparfait ?",
    options: [
      "Je mange ma soupe.",
      "Je mangerai ma soupe.",
      "Je mangeais ma soupe.",
      "Je mangerais ma soupe.",
    ],
    reponse: "Je mangeais ma soupe.",
    explication: "'mangeais' est à l'imparfait — terminaison -ais.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète au futur : 'Vous ___ vos amis ce week-end.' (voir)",
    options: ["voyez", "verrez", "voyiez", "voir"],
    reponse: "verrez",
    explication: "Au futur avec 'vous', 'voir' devient 'verrez'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète à l'imparfait : 'Les enfants ___ souvent.' (rire)",
    options: ["rient", "riront", "riaient", "riez"],
    reponse: "riaient",
    explication: "À l'imparfait avec 'ils', on dit 'riaient'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle terminaison correspond à l'imparfait avec 'tu' ?",
    options: ["-ras", "-ais", "-es", "-as"],
    reponse: "-ais",
    explication: "À l'imparfait avec 'tu', la terminaison est toujours -ais.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'Autrefois, les gens ___ sans électricité.' (vivre)",
    options: ["vivent", "vivront", "vivaient", "vivez"],
    reponse: "vivaient",
    explication:
      "'Autrefois' indique une habitude dans le passé → imparfait : 'vivaient'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase utilise correctement les trois temps ?",
    options: [
      "Hier je mangeais, aujourd'hui je mange, demain je mangerai.",
      "Hier je mange, aujourd'hui je mangeais, demain je mangerai.",
      "Hier je mangerai, aujourd'hui je mangeais, demain je mange.",
      "Hier je mange, aujourd'hui je mangerai, demain je mangeais.",
    ],
    reponse: "Hier je mangeais, aujourd'hui je mange, demain je mangerai.",
    explication: "Hier = imparfait, aujourd'hui = présent, demain = futur.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function ConjugaisonCE2() {
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
          <div className="lecon-badge">⏰ Conjugaison · CE2</div>
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
              ? "Tu maîtrises parfaitement les trois temps !"
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
