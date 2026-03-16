"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La phrase complexe",
  intro:
    "Une phrase simple contient un seul verbe conjugué. Une phrase complexe en contient plusieurs. Elle est composée de propositions reliées entre elles.",
  points: [
    {
      titre: "La proposition principale",
      texte:
        "La proposition principale est celle qui a le sens le plus important. Elle peut exister seule.",
      exemple: "Je pense que tu as raison. → 'Je pense' est la principale.",
    },
    {
      titre: "La proposition subordonnée",
      texte:
        "La proposition subordonnée dépend de la principale. Elle est souvent introduite par 'que', 'qui', 'quand', 'parce que', 'si'...",
      exemple:
        "Je sais que tu viendras. · Elle part quand elle veut. · Il réussit parce qu'il travaille.",
    },
    {
      titre: "La coordination et la juxtaposition",
      texte:
        "Deux propositions peuvent être reliées par une conjonction de coordination (mais, ou, et, donc, or, ni, car) ou simplement par une virgule (juxtaposition).",
      exemple: "Il pleut et je reste chez moi. · Il pleut, je reste chez moi.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Combien de verbes conjugués y a-t-il dans : 'Je mange et je bois' ?",
    options: ["1", "2", "3", "0"],
    reponse: "2",
    explication:
      "'mange' et 'bois' sont deux verbes conjugués → phrase complexe.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle phrase est une phrase SIMPLE ?",
    options: [
      "Je crois qu'il viendra.",
      "Il pleut et je reste.",
      "Le chat dort sur le tapis.",
      "Elle part quand elle veut.",
    ],
    reponse: "Le chat dort sur le tapis.",
    explication: "Un seul verbe conjugué → phrase simple.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Quel mot introduit la subordonnée dans : 'Je sais que tu viendras' ?",
    options: ["Je", "sais", "que", "viendras"],
    reponse: "que",
    explication: "'que' est la conjonction de subordination.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Quelle est la proposition principale dans : 'Je pense que tu as raison' ?",
    options: ["que tu as raison", "tu as raison", "Je pense", "raison"],
    reponse: "Je pense",
    explication: "'Je pense' est la principale — elle peut exister seule.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Quel mot relie les deux propositions dans : 'Il travaille car il veut réussir' ?",
    options: ["Il", "travaille", "car", "réussir"],
    reponse: "car",
    explication:
      "'car' est une conjonction de coordination qui exprime la cause.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle phrase contient une proposition subordonnée relative ?",
    options: [
      "Je mange et je bois.",
      "Il pleut donc je reste.",
      "Le livre que je lis est passionnant.",
      "Elle chante mais il dort.",
    ],
    reponse: "Le livre que je lis est passionnant.",
    explication:
      "'que je lis' est une subordonnée relative introduite par 'que'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est une phrase complexe par JUXTAPOSITION ?",
    options: [
      "Il pleut et je reste.",
      "Il pleut, je reste.",
      "Il pleut parce que c'est l'automne.",
      "Il pleut donc je prends mon parapluie.",
    ],
    reponse: "Il pleut, je reste.",
    explication: "Deux propositions reliées par une virgule = juxtaposition.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Combien de propositions y a-t-il dans : 'Je sais que tu viendras et que tu apporteras un gâteau' ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication:
      "3 propositions : 'Je sais' + 'que tu viendras' + 'que tu apporteras un gâteau'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quel subordonnant introduit une cause ?",
    options: ["quand", "si", "parce que", "que"],
    reponse: "parce que",
    explication: "'parce que' introduit une subordonnée de cause.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Quelle proposition est subordonnée dans : 'Elle réussira si elle travaille' ?",
    options: ["Elle réussira", "si elle travaille", "réussira si", "Elle"],
    reponse: "si elle travaille",
    explication:
      "'si elle travaille' est la subordonnée de condition introduite par 'si'.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "francais";
const THEME = "grammaire";

export default function GrammaireCM2() {
  const router = useRouter();
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

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questions.length,
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
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire</span>
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
          <div className="lecon-badge">📝 Grammaire · CM2</div>
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
              ? "Tu maîtrises parfaitement la phrase complexe ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
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
