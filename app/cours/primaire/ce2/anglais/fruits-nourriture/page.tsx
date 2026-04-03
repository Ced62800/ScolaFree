"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const CLASSE = "ce2";
const MATIERE = "anglais";
const THEME = "fruits-nourriture";

const lecon = {
  titre: "Food & Drinks",
  intro:
    "Let's learn the names of food and drinks in English! La nourriture et les boissons sont essentielles dans notre quotidien.",
  points: [
    {
      titre: "Fruits & Vegetables — Les fruits et légumes",
      texte:
        "We eat fruits and vegetables every day. They are healthy and delicious!",
      exemple:
        "an apple 🍎 | a banana 🍌 | an orange 🍊 | a strawberry 🍓 | a carrot 🥕 | a tomato 🍅 | grapes 🍇",
    },
    {
      titre: "Meals & Food — Les repas et plats",
      texte:
        "These are common foods we eat at meals. 'I eat bread for breakfast' = Je mange du pain au petit déjeuner.",
      exemple:
        "bread 🍞 | rice 🍚 | pasta 🍝 | a sandwich 🥪 | a pizza 🍕 | a cake 🎂 | chips 🍟",
    },
    {
      titre: "Drinks — Les boissons",
      texte:
        "We drink these every day. 'I drink water' = Je bois de l'eau. 'I like juice' = J'aime le jus.",
      exemple: "water 💧 | milk 🥛 | juice 🧃 | tea 🍵 | hot chocolate 🍫",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "What is this? 🍎",
    options: ["a banana", "an apple", "an orange", "a strawberry"],
    reponse: "an apple",
    explication: "This is an apple. / C'est une pomme.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What do we drink at breakfast? 🥛",
    options: ["juice", "milk", "tea", "water"],
    reponse: "milk",
    explication:
      "We drink milk at breakfast. / On boit du lait au petit déjeuner.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "What is this? 🍌",
    options: ["an orange", "a strawberry", "a banana", "grapes"],
    reponse: "a banana",
    explication: "This is a banana. / C'est une banane.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Which of these is a vegetable? 🥕",
    options: ["an apple", "a banana", "a carrot", "grapes"],
    reponse: "a carrot",
    explication: "A carrot is a vegetable. / Une carotte est un légume.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "How do you say 'de l'eau' in English?",
    options: ["milk", "juice", "tea", "water"],
    reponse: "water",
    explication: "Water. / De l'eau.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "What is this? 🍕",
    options: ["a sandwich", "a cake", "pasta", "a pizza"],
    reponse: "a pizza",
    explication: "This is a pizza. / C'est une pizza.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complete: 'I ___ an apple.' (manger)",
    options: ["drink", "like", "eat", "have"],
    reponse: "eat",
    explication: "I eat an apple. / Je mange une pomme.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "What are these? 🍇",
    options: ["oranges", "strawberries", "grapes", "bananas"],
    reponse: "grapes",
    explication: "These are grapes. / Ce sont des raisins.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "How do you say 'du pain' in English?",
    options: ["rice", "pasta", "chips", "bread"],
    reponse: "bread",
    explication: "Bread. / Du pain.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complete: 'I ___ orange juice.' (boire)",
    options: ["eat", "drink", "like", "want"],
    reponse: "drink",
    explication: "I drink orange juice. / Je bois du jus d'orange.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function FruitsNourritureCE2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [session, setSession] = useState(0);
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
    [qIndex, session],
  );
  const progression = Math.round(
    (bonnes.length / questionsActives.length) * 100,
  );

  useEffect(() => {
    if (estConnecte) {
      getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
      getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
    }
  }, [estConnecte]);

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
          <span className="breadcrumb-active">Food & Drinks</span>
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
          <div className="lecon-badge">🍎 Food & Drinks · CE2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {estConnecte && (bestScore || lastScore) && (
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
          <div className="qcm-question">
            {questionsActives[qIndex].question}
          </div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse)
                  className += " correct";
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
          {estConnecte && (bestScore || lastScore) && (
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
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement la nourriture en anglais !"
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
