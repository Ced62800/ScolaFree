"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Animals",
  intro:
    "Let's learn the names of animals in English! Les animaux sont partout autour de nous.",
  points: [
    {
      titre: "Farm animals — Les animaux de la ferme",
      texte:
        "These animals live on a farm. They are very common and easy to learn!",
      exemple:
        "a cow 🐄 | a pig 🐷 | a horse 🐴 | a sheep 🐑 | a chicken 🐔 | a duck 🦆",
    },
    {
      titre: "Wild animals — Les animaux sauvages",
      texte:
        "These animals live in the wild, in forests, jungles and savannas.",
      exemple:
        "a lion 🦁 | a tiger 🐯 | an elephant 🐘 | a giraffe 🦒 | a monkey 🐒 | a snake 🐍",
    },
    {
      titre: "Pets — Les animaux domestiques",
      texte:
        "Pets are animals we keep at home. 'I have a dog' = J'ai un chien.",
      exemple:
        "a dog 🐶 | a cat 🐱 | a rabbit 🐰 | a fish 🐟 | a hamster 🐹 | a bird 🐦",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "What animal says 'woof'? 🐶",
    options: ["cat", "dog", "fish", "bird"],
    reponse: "dog",
    explication: "A dog says 'woof'. / Un chien fait 'wouf'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What is this animal? 🐱",
    options: ["rabbit", "hamster", "cat", "dog"],
    reponse: "cat",
    explication: "🐱 is a cat. / C'est un chat.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Which animal lives on a farm? 🐄",
    options: ["lion", "tiger", "cow", "monkey"],
    reponse: "cow",
    explication: "A cow lives on a farm. / Une vache vit à la ferme.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "What is this animal? 🦁",
    options: ["tiger", "lion", "horse", "elephant"],
    reponse: "lion",
    explication: "🦁 is a lion. / C'est un lion.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Which animal has a very long neck? 🦒",
    options: ["snake", "elephant", "giraffe", "monkey"],
    reponse: "giraffe",
    explication:
      "A giraffe has a very long neck. / La girafe a un très long cou.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "What is this animal? 🐰",
    options: ["hamster", "rabbit", "cat", "mouse"],
    reponse: "rabbit",
    explication: "🐰 is a rabbit. / C'est un lapin.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Which animal can swim AND fly? 🦆",
    options: ["chicken", "horse", "duck", "pig"],
    reponse: "duck",
    explication: "A duck can swim and fly. / Un canard peut nager et voler.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "What is the biggest land animal? 🐘",
    options: ["giraffe", "elephant", "hippo", "lion"],
    reponse: "elephant",
    explication:
      "The elephant is the biggest land animal. / L'éléphant est le plus grand animal terrestre.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Which of these is a pet?",
    options: ["lion", "tiger", "hamster", "elephant"],
    reponse: "hamster",
    explication: "A hamster is a pet. / Un hamster est un animal domestique.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "What animal has no legs? 🐍",
    options: ["fish", "snake", "worm", "snail"],
    reponse: "snake",
    explication: "A snake has no legs. / Un serpent n'a pas de pattes.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function AnimauxCE1() {
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
          onClick={() => router.push("/cours/primaire/ce1/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Animals</span>
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
          <div className="lecon-badge">🐾 Animals · CE1</div>
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
                    ? "Well done! 🎉"
                    : "Not quite..."}
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
              ? "Excellent!"
              : score >= 7
                ? "Well done!"
                : score >= 5
                  ? "Good job!"
                  : "Keep trying!"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement les animaux en anglais !"
              : score >= 7
                ? "Tu as bien compris l'essentiel !"
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
              onClick={() => router.push("/cours/primaire/ce1/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
