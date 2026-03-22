"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "In the Town & Directions",
  intro:
    "Let's learn the names of places in town and how to give directions in English! Connaître les lieux en ville et donner des directions est très utile.",
  points: [
    {
      titre: "Places in town — Les lieux en ville",
      texte:
        "These are places you find in a town. Use 'There is a...' or 'I can see a...' to describe them.",
      exemple:
        "a school 🏫 | a hospital 🏥 | a supermarket 🛒 | a park 🌳 | a library 📚 | a post office 📮 | a cinema 🎬 | a bakery 🥖 | a bank 🏦 | a train station 🚉",
    },
    {
      titre: "Directions — Les directions",
      texte: "To give directions, use these expressions.",
      exemple:
        "Turn left. (Tourne à gauche.) | Turn right. (Tourne à droite.) | Go straight on. (Vas tout droit.) | It's opposite... (C'est en face de...) | It's next to... (C'est à côté de...)",
    },
    {
      titre: "Asking for directions — Demander son chemin",
      texte: "'Excuse me, where is the...?' = Excusez-moi, où est le/la... ?",
      exemple:
        "Excuse me, where is the park? — Go straight on, then turn left. It's next to the school.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Where do you borrow books? 📚",
    options: ["a bakery", "a bank", "a library", "a cinema"],
    reponse: "a library",
    explication: "A library is where you borrow books. / Une bibliothèque.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "How do you say 'Tourne à gauche' in English?",
    options: [
      "Turn right.",
      "Go straight on.",
      "Turn left.",
      "Take the first street.",
    ],
    reponse: "Turn left.",
    explication: "Turn left. / Tourne à gauche.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Where do you buy bread? 🥖",
    options: ["a supermarket", "a post office", "a bank", "a bakery"],
    reponse: "a bakery",
    explication: "A bakery is where you buy bread. / Une boulangerie.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you ask 'Où est la poste ?' in English?",
    options: [
      "Where is the bank?",
      "Where is the post office?",
      "Where is the school?",
      "Where is the park?",
    ],
    reponse: "Where is the post office?",
    explication: "Where is the post office? / Où est la poste ?",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "How do you say 'Vas tout droit' in English?",
    options: [
      "Turn left.",
      "Turn right.",
      "Go straight on.",
      "Take the first street.",
    ],
    reponse: "Go straight on.",
    explication: "Go straight on. / Vas tout droit.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "How do you say 'C'est à côté de...' in English?",
    options: [
      "It's opposite...",
      "It's next to...",
      "It's behind...",
      "It's in front of...",
    ],
    reponse: "It's next to...",
    explication: "It's next to... / C'est à côté de...",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Where do sick people go? 🏥",
    options: ["a school", "a park", "a cinema", "a hospital"],
    reponse: "a hospital",
    explication:
      "Sick people go to a hospital. / Les malades vont à l'hôpital.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "How do you say 'C'est en face de...' in English?",
    options: [
      "It's next to...",
      "It's behind...",
      "It's opposite...",
      "It's near...",
    ],
    reponse: "It's opposite...",
    explication: "It's opposite... / C'est en face de...",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complete: 'Excuse me, ___ is the train station?'",
    options: ["what", "who", "where", "how"],
    reponse: "where",
    explication:
      "Excuse me, where is the train station? / Excusez-moi, où est la gare ?",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "The directions say: 'Go straight on, then turn right.' What does it mean?",
    options: [
      "Tu tournes à gauche, puis vas tout droit.",
      "Tu vas tout droit, puis tu tournes à droite.",
      "Tu tournes à droite, puis vas tout droit.",
      "Tu vas tout droit, puis tu tournes à gauche.",
    ],
    reponse: "Tu vas tout droit, puis tu tournes à droite.",
    explication:
      "Go straight on = vas tout droit. Turn right = tourne à droite.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "anglais";
const THEME = "ville-directions";

export default function VilleDirectionsCM2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);
  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);
  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);
  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };
  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
        });
        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };
  const handleRecommencer = () => {
    scoreSaved.current = false;
    setShowPopup(false);
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };
  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Anglais</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">In the Town & Directions</span>
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
          <div className="lecon-badge">🏙️ In the Town & Directions · CM2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}
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
              let cn = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
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
              ? "Tu connais parfaitement la ville et les directions en anglais ! 🚀"
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
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
