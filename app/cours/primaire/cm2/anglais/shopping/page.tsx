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
  titre: "Shopping & Money",
  intro:
    "Let's learn how to go shopping and talk about money in English! Faire des achats et parler de l'argent en anglais est très utile dans la vie quotidienne.",
  points: [
    {
      titre: "Shopping vocabulary — Le vocabulaire des achats",
      texte: "These words are useful when you go shopping.",
      exemple:
        "a shop / a store 🏪 | a customer (un client) | a price (un prix) | cheap (pas cher) | expensive (cher) | a receipt (un reçu) | a basket (un panier) | a trolley (un chariot)",
    },
    {
      titre: "Money — L'argent",
      texte:
        "In the UK, the currency is pounds (£) and pence (p). In the USA, it's dollars ($) and cents (¢).",
      exemple:
        "How much is it? (C'est combien ?) | It costs... (Ça coûte...) | It's £2.50. | That's too expensive! | That's cheap! | Here is your change. (Voici votre monnaie.)",
    },
    {
      titre: "In a shop — Dans un magasin",
      texte: "Useful phrases when buying something.",
      exemple:
        "Can I help you? (Puis-je vous aider ?) | I'd like... (Je voudrais...) | I'll take it. (Je le prends.) | Do you have...? (Avez-vous... ?) | Here you are. (Voilà.)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "How do you ask 'C'est combien ?' in English?",
    options: [
      "What is this?",
      "How much is it?",
      "Can I help you?",
      "Where is the shop?",
    ],
    reponse: "How much is it?",
    explication: "How much is it? / C'est combien ?",
    niveau: "facile",
  },
  {
    id: 2,
    question: "What is the currency in the UK? 🇬🇧",
    options: ["Euro", "Dollar", "Pound", "Franc"],
    reponse: "Pound",
    explication: "The UK uses pounds (£).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "What does 'expensive' mean?",
    options: ["pas cher", "gratuit", "cher", "bon marché"],
    reponse: "cher",
    explication: "Expensive = cher.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "How do you say 'Je voudrais une pomme' in English?",
    options: [
      "I like an apple.",
      "I have an apple.",
      "I'd like an apple.",
      "I want apple.",
    ],
    reponse: "I'd like an apple.",
    explication: "I'd like an apple. / Je voudrais une pomme.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "What does a shopkeeper say to greet you?",
    options: [
      "How much is it?",
      "Here is your change.",
      "Can I help you?",
      "I'll take it.",
    ],
    reponse: "Can I help you?",
    explication: "Can I help you? / Puis-je vous aider ?",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "What does 'cheap' mean?",
    options: ["cher", "gratuit", "pas cher", "rare"],
    reponse: "pas cher",
    explication: "Cheap = pas cher.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "How do you say 'Je le prends' in English?",
    options: ["I'd like it.", "I'll take it.", "I have it.", "I want it."],
    reponse: "I'll take it.",
    explication: "I'll take it. / Je le prends.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "What is the currency in the USA? 🇺🇸",
    options: ["Pound", "Franc", "Euro", "Dollar"],
    reponse: "Dollar",
    explication: "The USA uses dollars ($).",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "What does 'Here is your change' mean?",
    options: [
      "Voici votre reçu.",
      "Voici votre panier.",
      "Voici votre monnaie.",
      "Voici votre prix.",
    ],
    reponse: "Voici votre monnaie.",
    explication: "Here is your change. / Voici votre monnaie.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "The price tag says £5.99. What does the shopkeeper say?",
    options: [
      "It costs five pounds ninety-nine.",
      "It is free.",
      "It costs fifty-nine pounds.",
      "It costs five euros.",
    ],
    reponse: "It costs five pounds ninety-nine.",
    explication: "£5.99 = five pounds ninety-nine.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "anglais";
const THEME = "shopping";

export default function ShoppingCM2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
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
          <span className="breadcrumb-active">Shopping & Money</span>
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
          <div className="lecon-badge">🛒 Shopping & Money · CM2</div>
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
              ? "Tu maîtrises parfaitement le shopping en anglais ! 🚀"
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
