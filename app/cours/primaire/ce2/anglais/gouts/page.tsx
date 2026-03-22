"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Sports & Likes",
  intro:
    "Let's learn how to talk about sports and express what we like or don't like in English! Exprimer ses goûts est essentiel pour communiquer.",
  points: [
    {
      titre: "Sports",
      texte:
        "These are popular sports. 'I play football' = Je joue au football. 'I do gymnastics' = Je fais de la gymnastique.",
      exemple:
        "football ⚽ | basketball 🏀 | tennis 🎾 | swimming 🏊 | cycling 🚴 | gymnastics 🤸 | running 🏃",
    },
    {
      titre: "I like / I don't like — J'aime / Je n'aime pas",
      texte:
        "To say you like something, use 'I like'. To say you don't like something, use 'I don't like'.",
      exemple:
        "I like football. / I don't like swimming. / I love tennis! / I hate running.",
    },
    {
      titre: "Hobbies — Les loisirs",
      texte:
        "We can also talk about other hobbies. 'I like reading' = J'aime lire. 'I love music' = J'adore la musique.",
      exemple:
        "reading 📚 | drawing 🎨 | singing 🎵 | dancing 💃 | cooking 🍳 | gaming 🎮",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you say 'J'aime le football' in English?",
    options: [
      "I don't like football.",
      "I play football.",
      "I like football.",
      "I love tennis.",
    ],
    reponse: "I like football.",
    explication: "I like football. / J'aime le football.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What sport is this? ⚽",
    options: ["tennis", "basketball", "football", "swimming"],
    reponse: "football",
    explication: "This is football. / C'est le football.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "How do you say 'Je n'aime pas la natation' in English?",
    options: [
      "I like swimming.",
      "I don't like swimming.",
      "I love swimming.",
      "I play swimming.",
    ],
    reponse: "I don't like swimming.",
    explication: "I don't like swimming. / Je n'aime pas la natation.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "What sport is this? 🎾",
    options: ["football", "basketball", "tennis", "cycling"],
    reponse: "tennis",
    explication: "This is tennis. / C'est le tennis.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complete: 'I ___ basketball.' (jouer)",
    options: ["do", "like", "play", "have"],
    reponse: "play",
    explication: "I play basketball. / Je joue au basket.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "How do you say 'J'adore lire' in English?",
    options: [
      "I like reading.",
      "I don't like reading.",
      "I love reading.",
      "I do reading.",
    ],
    reponse: "I love reading.",
    explication: "I love reading. / J'adore lire.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "What sport is this? 🏊",
    options: ["cycling", "running", "gymnastics", "swimming"],
    reponse: "swimming",
    explication: "This is swimming. / C'est la natation.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complete: 'I ___ gymnastics.' (faire)",
    options: ["play", "do", "like", "have"],
    reponse: "do",
    explication: "I do gymnastics. / Je fais de la gymnastique.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'Je déteste courir' in English?",
    options: [
      "I love running.",
      "I like running.",
      "I don't like running.",
      "I hate running.",
    ],
    reponse: "I hate running.",
    explication: "I hate running. / Je déteste courir.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom says: 'I like drawing and singing.' What does this mean?",
    options: [
      "Tom aime le sport et la danse.",
      "Tom aime le dessin et le chant.",
      "Tom aime lire et cuisiner.",
      "Tom aime la musique et la danse.",
    ],
    reponse: "Tom aime le dessin et le chant.",
    explication: "I like drawing and singing. / J'aime le dessin et le chant.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function GoutsCE2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
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
    if (qIndex + 1 >= questionsActives.length) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setShowPopup(false);
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
    setSession((s) => s + 1);
  };

  return (
    <div className="cours-page">
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
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
          <span className="breadcrumb-active">Sports & Likes</span>
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
          <div className="lecon-badge">⚽ Sports & Likes · CE2</div>
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
              ? "Tu connais parfaitement les sports et les goûts en anglais !"
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
