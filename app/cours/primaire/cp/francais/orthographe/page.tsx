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
  titre: "Les sons et les lettres",
  intro:
    "En français, chaque lettre fait un son. Apprendre les sons t'aidera à bien lire et bien écrire !",
  points: [
    {
      titre: "Le son [a]",
      texte:
        "Le son [a] s'écrit avec la lettre 'a'. On le trouve au début, au milieu ou à la fin d'un mot.",
      exemple: "ami · chat · papa",
    },
    {
      titre: "Le son [o]",
      texte:
        "Le son [o] peut s'écrire 'o', 'au' ou 'eau'. C'est toujours le même son !",
      exemple: "bol · bateau · chapeau",
    },
    {
      titre: "Les lettres muettes",
      texte:
        "Certaines lettres s'écrivent mais ne se prononcent pas. On les appelle des lettres muettes.",
      exemple: "chat → le 't' est muet · bras → le 's' est muet",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel mot contient le son [a] ?",
    options: ["lit", "bus", "chat", "sol"],
    reponse: "chat",
    explication: "'chat' contient le son [a] : ch-a-t.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot contient le son [o] ?",
    options: ["pain", "bateau", "ami", "lit"],
    reponse: "bateau",
    explication: "'bateau' contient le son [o] écrit 'eau'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Dans le mot 'chat', quelle lettre est muette ?",
    options: ["c", "h", "a", "t"],
    reponse: "t",
    explication: "Dans 'chat', le 't' final ne se prononce pas.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Comment s'écrit le son [o] dans 'chapeau' ?",
    options: ["o", "au", "eau", "a"],
    reponse: "eau",
    explication: "Dans 'chapeau', le son [o] s'écrit 'eau'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Dans le mot 'bras', quelle lettre est muette ?",
    options: ["b", "r", "a", "s"],
    reponse: "s",
    explication: "Dans 'bras', le 's' final ne se prononce pas.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel mot contient le son [o] écrit 'au' ?",
    options: ["bateau", "chapeau", "chaud", "chat"],
    reponse: "chaud",
    explication: "Dans 'chaud', le son [o] s'écrit 'au'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Combien de lettres muettes y a-t-il dans 'petit' ?",
    options: ["0", "1", "2", "3"],
    reponse: "1",
    explication: "Dans 'petit', le 't' final est muet.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel mot contient le son [a] écrit deux fois ?",
    options: ["bateau", "papa", "chat", "ami"],
    reponse: "papa",
    explication: "'papa' contient deux fois le son [a] : p-a-p-a.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Dans 'gros', quelle lettre est muette ?",
    options: ["g", "r", "o", "s"],
    reponse: "s",
    explication: "Dans 'gros', le 's' final ne se prononce pas.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel groupe de mots contient uniquement le son [o] ?",
    options: [
      "bateau, chaud, gros",
      "ami, papa, chat",
      "lit, bus, sol",
      "pain, bras, petit",
    ],
    reponse: "bateau, chaud, gros",
    explication:
      "'bateau' (eau), 'chaud' (au) et 'gros' (o) contiennent tous le son [o].",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "sons-lettres";

export default function OrthographeCPSons() {
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
      if (scoreSaved.current) return;
      scoreSaved.current = true;

      await saveScore({
        classe: CLASSE,
        matiere: MATIERE,
        theme: THEME,
        score: score,
        total: questionsActives.length,
      });

      const [best, last] = await Promise.all([
        getBestScore(CLASSE, MATIERE, THEME),
        getLastScore(CLASSE, MATIERE, THEME),
      ]);
      setBestScore(best);
      setLastScore(last);
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

  const niveauLabel = (niveau: string) => {
    if (niveau === "facile") return "🟢 Facile";
    if (niveau === "moyen") return "🟡 Moyen";
    return "🔴 Difficile";
  };

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
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe</span>
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
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">✏️ Orthographe · CP</div>
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
                    ? "Bravo !"
                    : "Pas tout à fait..."}
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
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les sons et les lettres !"
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
