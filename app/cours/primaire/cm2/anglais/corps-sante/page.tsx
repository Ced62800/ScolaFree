"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Body & Health",
  intro:
    "Let's learn the parts of the body and how to talk about health in English! Connaître les parties du corps et parler de sa santé est très important.",
  points: [
    {
      titre: "Parts of the body — Les parties du corps",
      texte:
        "Use 'My... hurts' to say something hurts. Use 'I have a...' for illnesses.",
      exemple:
        "head 🧠 (tête) | arm 💪 (bras) | leg 🦵 (jambe) | hand ✋ (main) | foot 🦶 (pied) | eye 👁️ (œil) | ear 👂 (oreille) | nose 👃 (nez) | mouth 👄 (bouche) | stomach 🫁 (ventre)",
    },
    {
      titre: "Illnesses & symptoms — Les maladies et symptômes",
      texte:
        "To say you are sick: 'I feel sick.' / 'I don't feel well.' / 'My... hurts.'",
      exemple:
        "I have a headache. (J'ai mal à la tête.) | I have a stomachache. (J'ai mal au ventre.) | I have a cold. (J'ai un rhume.) | I have a fever. (J'ai de la fièvre.) | My leg hurts. (Ma jambe me fait mal.)",
    },
    {
      titre: "At the doctor — Chez le médecin",
      texte: "Useful phrases at the doctor's surgery.",
      exemple:
        "What's wrong? (Qu'est-ce qui ne va pas ?) | I feel sick. (Je me sens malade.) | You should rest. (Tu devrais te reposer.) | Take this medicine. (Prends ce médicament.)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you say 'J'ai mal à la tête' in English?",
    options: [
      "I have a stomachache.",
      "My arm hurts.",
      "I have a headache.",
      "I have a cold.",
    ],
    reponse: "I have a headache.",
    explication: "I have a headache. / J'ai mal à la tête.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What is 'the nose' in French? 👃",
    options: ["l'oreille", "la bouche", "l'œil", "le nez"],
    reponse: "le nez",
    explication: "Nose = le nez. / I have a big nose = J'ai un grand nez.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "How do you say 'Je me sens malade' in English?",
    options: ["I feel happy.", "I feel tired.", "I feel sick.", "I feel cold."],
    reponse: "I feel sick.",
    explication: "I feel sick. / Je me sens malade.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you say 'J'ai de la fièvre' in English?",
    options: [
      "I have a cold.",
      "I have a headache.",
      "I have a fever.",
      "I have a cough.",
    ],
    reponse: "I have a fever.",
    explication: "I have a fever. / J'ai de la fièvre.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "What does 'My leg hurts' mean?",
    options: [
      "Ma main me fait mal.",
      "Mon bras me fait mal.",
      "Mon pied me fait mal.",
      "Ma jambe me fait mal.",
    ],
    reponse: "Ma jambe me fait mal.",
    explication: "My leg hurts. / Ma jambe me fait mal.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "What does the doctor ask first? 🩺",
    options: [
      "Take this medicine.",
      "You should rest.",
      "What's wrong?",
      "I feel sick.",
    ],
    reponse: "What's wrong?",
    explication: "What's wrong? / Qu'est-ce qui ne va pas ?",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "What is 'stomach' in French? 🫁",
    options: ["la tête", "le ventre", "le bras", "la jambe"],
    reponse: "le ventre",
    explication:
      "Stomach = le ventre. / I have a stomachache = J'ai mal au ventre.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "How do you say 'J'ai un rhume' in English?",
    options: [
      "I have a fever.",
      "I have a cold.",
      "I have a cough.",
      "I have a headache.",
    ],
    reponse: "I have a cold.",
    explication: "I have a cold. / J'ai un rhume.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "The doctor says 'You should rest.' What does this mean?",
    options: [
      "Tu dois prendre un médicament.",
      "Tu dois aller à l'hôpital.",
      "Tu devrais te reposer.",
      "Tu dois manger.",
    ],
    reponse: "Tu devrais te reposer.",
    explication: "You should rest. / Tu devrais te reposer.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complete: 'I don't feel ___.' (Je ne me sens pas bien.)",
    options: ["good", "happy", "well", "sick"],
    reponse: "well",
    explication: "I don't feel well. / Je ne me sens pas bien.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function CorpsSanteCM2() {
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
          onClick={() => router.push("/cours/primaire/cm2/anglais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Body & Health</span>
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
          <div className="lecon-badge">💪 Body & Health · CM2</div>
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
              ? "Tu maîtrises parfaitement le corps et la santé en anglais !"
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
              onClick={() => router.push("/cours/primaire/cm2/anglais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
