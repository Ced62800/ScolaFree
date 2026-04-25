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
  titre: "Les nombres jusqu'à 100",
  intro:
    "En CP, on apprend à compter, lire et écrire les nombres jusqu'à 100. On découvre aussi les dizaines et les unités !",
  points: [
    {
      titre: "Les unités et les dizaines",
      texte:
        "Un nombre peut être décomposé en dizaines et en unités. Une dizaine = 10 unités.",
      exemple: "23 = 2 dizaines + 3 unités. 45 = 4 dizaines + 5 unités.",
    },
    {
      titre: "Compter jusqu'à 100",
      texte:
        "On compte par 1, par 2, par 5 ou par 10. La suite des dizaines : 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.",
      exemple: "Après 39 vient 40. Après 59 vient 60. Après 99 vient 100.",
    },
    {
      titre: "Comparer les nombres",
      texte:
        "Pour comparer deux nombres, on regarde d'abord les dizaines, puis les unités. Le signe < veut dire 'plus petit que' et > veut dire 'plus grand que'.",
      exemple:
        "23 < 45 car 2 dizaines < 4 dizaines. 67 > 65 car 7 unités > 5 unités.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien y a-t-il de dizaines dans 30 ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "30 = 3 dizaines.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel nombre vient après 19 ?",
    options: ["18", "20", "21", "10"],
    reponse: "20",
    explication: "Après 19 vient 20 — on passe à la dizaine suivante.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Comment écrit-on 'quarante-cinq' en chiffres ?",
    options: ["54", "44", "45", "40"],
    reponse: "45",
    explication: "Quarante = 40, cinq = 5, donc quarante-cinq = 45.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel nombre est entre 20 et 22 ?",
    options: ["19", "21", "23", "24"],
    reponse: "21",
    explication: "Entre 20 et 22 se trouve 21.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Combien y a-t-il d'unités dans 47 ?",
    options: ["4", "7", "40", "11"],
    reponse: "7",
    explication: "47 = 4 dizaines + 7 unités.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le plus grand nombre ?",
    options: ["39", "42", "35", "41"],
    reponse: "42",
    explication: "42 a 4 dizaines, c'est le plus grand.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Comment décompose-t-on 63 ?",
    options: [
      "6 unités + 3 dizaines",
      "3 dizaines + 6 unités",
      "6 dizaines + 3 unités",
      "60 unités + 3",
    ],
    reponse: "6 dizaines + 3 unités",
    explication: "63 = 6 dizaines + 3 unités.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel nombre est le plus petit ?",
    options: ["72", "27", "70", "71"],
    reponse: "27",
    explication: "27 a seulement 2 dizaines, c'est le plus petit.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quel nombre vient avant 100 ?",
    options: ["101", "99", "90", "98"],
    reponse: "99",
    explication: "Avant 100 vient 99.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Combien font 7 dizaines et 4 unités ?",
    options: ["47", "11", "74", "70"],
    reponse: "74",
    explication: "7 dizaines = 70, + 4 unités = 74.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "numeration";

export default function NumerationCP() {
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
        score,
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
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Numération</span>
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
          <div className="lecon-badge">🔢 Numération · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {/* Meilleur et dernier score */}
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

          {/* Image des blocs base 10 */}
          <img
            src="/images/base-ten-blocks.png"
            alt="Base ten blocks showing tens and units"
            style={{ maxWidth: "100%", margin: "20px 0" }}
          />

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
              className={`qcm-feedback ${
                selected === questionsActives[qIndex].reponse
                  ? "feedback-correct"
                  : "feedback-incorrect"
              }`}
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
              ? "Tu maîtrises parfaitement les nombres jusqu'à 100 !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
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
