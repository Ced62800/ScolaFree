"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "School & Objects",
  intro:
    "Let's learn the names of school objects and classroom instructions in English! L'école en anglais, c'est très utile !",
  points: [
    {
      titre: "School objects — Les objets scolaires",
      texte:
        "These are the objects we use every day at school. 'Take your pencil!' = Prends ton crayon !",
      exemple:
        "a pencil ✏️ | a pen 🖊️ | a ruler 📏 | a book 📚 | a bag 🎒 | scissors ✂️ | a rubber 🧹",
    },
    {
      titre: "Classroom instructions — Les consignes de classe",
      texte:
        "The teacher gives instructions in English. It is important to understand them!",
      exemple:
        "Listen! 👂 | Sit down! | Stand up! | Open your book! | Close your book! | Look! 👀 | Repeat!",
    },
    {
      titre: "Places at school — Les lieux de l'école",
      texte:
        "A school has different places. 'I eat in the canteen' = Je mange à la cantine.",
      exemple:
        "the classroom 🏫 | the playground 🛝 | the canteen 🍽️ | the library 📚 | the gym 🏃",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "What do you write with? ✏️",
    options: ["a ruler", "a book", "a pencil", "scissors"],
    reponse: "a pencil",
    explication: "We write with a pencil. / On écrit avec un crayon.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "The teacher says 'Sit down!' What do you do?",
    options: [
      "Tu te lèves.",
      "Tu ouvres ton livre.",
      "Tu t'assieds.",
      "Tu écoutes.",
    ],
    reponse: "Tu t'assieds.",
    explication: "Sit down! / Assieds-toi !",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Where do you play at school? 🛝",
    options: ["the canteen", "the library", "the classroom", "the playground"],
    reponse: "the playground",
    explication:
      "We play in the playground. / On joue dans la cour de récréation.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "What do you carry your books in? 🎒",
    options: ["a ruler", "a bag", "a pen", "a rubber"],
    reponse: "a bag",
    explication: "We carry books in a bag. / On porte ses livres dans un sac.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "The teacher says 'Open your book!' What do you do?",
    options: [
      "Tu fermes ton livre.",
      "Tu ouvres ton livre.",
      "Tu ranges ton livre.",
      "Tu lis ton livre.",
    ],
    reponse: "Tu ouvres ton livre.",
    explication: "Open your book! / Ouvre ton livre !",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Where do you eat at school? 🍽️",
    options: ["the gym", "the library", "the canteen", "the classroom"],
    reponse: "the canteen",
    explication: "We eat in the canteen. / On mange à la cantine.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "How do you say 'une règle' in English?",
    options: ["a pencil", "a rubber", "a ruler", "a pen"],
    reponse: "a ruler",
    explication: "A ruler. / Une règle.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "The teacher says 'Listen!' What do you do?",
    options: ["Tu regardes.", "Tu parles.", "Tu écoutes.", "Tu écris."],
    reponse: "Tu écoutes.",
    explication: "Listen! / Écoute !",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'une gomme' in English?",
    options: ["a pencil", "a pen", "a ruler", "a rubber"],
    reponse: "a rubber",
    explication: "A rubber. / Une gomme.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Where do you read books at school? 📚",
    options: ["the playground", "the gym", "the library", "the canteen"],
    reponse: "the library",
    explication:
      "We read books in the library. / On lit des livres à la bibliothèque.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function EcoleObjetsCE2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex, session],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questionsActives.length) setEtape("fini");
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
          onClick={() => router.push("/cours/primaire/ce2/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">School & Objects</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questionsActives.length}
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
          <div className="lecon-badge">🎒 School & Objects · CE2</div>
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
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Well done! 🎉"
                    : "Not quite..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
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
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement l'école en anglais !"
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
              onClick={() => router.push("/cours/primaire/ce2/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
