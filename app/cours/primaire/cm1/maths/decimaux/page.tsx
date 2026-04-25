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
  titre: "Les nombres décimaux",
  intro:
    "En CM1, on découvre les nombres décimaux. Ce sont des nombres qui ont une partie entière et une partie décimale, séparées par une virgule.",
  points: [
    {
      titre: "Lire et écrire un nombre décimal",
      texte:
        "Dans un nombre décimal, le chiffre après la virgule représente des dixièmes, le deuxième des centièmes. On lit la partie entière, puis « virgule », puis la partie décimale.",
      exemple:
        "3,7 → « trois virgule sept » = 3 unités et 7 dixièmes. 5,24 = 5 unités + 2 dixièmes + 4 centièmes.",
    },
    {
      titre: "Placer sur une droite numérique",
      texte:
        "Entre deux nombres entiers consécutifs, on peut placer des nombres décimaux. Entre 2 et 3, on trouve 2,1 — 2,2 — 2,3 … 2,9.",
      exemple: "2 < 2,5 < 3. 4,3 est entre 4 et 5, plus proche de 4.",
    },
    {
      titre: "Comparer des nombres décimaux",
      texte:
        "Pour comparer, on regarde d'abord la partie entière. Si elle est égale, on compare les dixièmes, puis les centièmes.",
      exemple:
        "4,7 > 4,3 car 7 dixièmes > 3 dixièmes. 3,25 > 3,20 car 5 centièmes > 0 centième.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Comment lit-on le nombre 4,7 ?",
    options: [
      "Quarante-sept",
      "Quatre virgule sept",
      "Quatre et demi",
      "Quatre-vingt-sept",
    ],
    reponse: "Quatre virgule sept",
    explication: "4,7 se lit « quatre virgule sept » : 4 unités et 7 dixièmes.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel chiffre est au rang des dixièmes dans 6,35 ?",
    options: ["6", "3", "5", "63"],
    reponse: "3",
    explication: "6,35 : partie entière = 6, dixièmes = 3, centièmes = 5.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Lequel de ces nombres est entre 2 et 3 ?",
    options: ["1,9", "3,1", "2,6", "3,0"],
    reponse: "2,6",
    explication: "2,6 est entre 2 et 3.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Lequel est le plus grand : 5,8 ou 5,3 ?",
    options: ["5,3", "5,8", "Ils sont égaux", "On ne peut pas savoir"],
    reponse: "5,8",
    explication:
      "Même partie entière (5), on compare les dixièmes : 8 > 3, donc 5,8 > 5,3.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Que vaut 2 unités + 4 dixièmes + 5 centièmes ?",
    options: ["2,45", "24,5", "2,54", "245"],
    reponse: "2,45",
    explication: "2 unités + 4 dixièmes + 5 centièmes = 2,45.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Classe dans l'ordre croissant : 3,7 — 3,2 — 3,9 — 3,4",
    options: [
      "3,2 — 3,4 — 3,7 — 3,9",
      "3,9 — 3,7 — 3,4 — 3,2",
      "3,2 — 3,7 — 3,4 — 3,9",
      "3,4 — 3,2 — 3,9 — 3,7",
    ],
    reponse: "3,2 — 3,4 — 3,7 — 3,9",
    explication:
      "Même partie entière (3), on range par dixièmes croissants : 2 < 4 < 7 < 9.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Lequel est le plus grand : 4,25 ou 4,3 ?",
    options: ["4,25", "4,3", "Ils sont égaux", "On ne peut pas savoir"],
    reponse: "4,3",
    explication: "4,3 = 4,30. Au rang des dixièmes : 3 > 2, donc 4,3 > 4,25.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Quel nombre décimal correspond à « huit unités et trois centièmes » ?",
    options: ["8,3", "8,03", "83", "0,83"],
    reponse: "8,03",
    explication: "8 unités + 0 dixième + 3 centièmes = 8,03.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Entre 7,4 et 7,5, quel nombre peut-on trouver ?",
    options: ["7,6", "7,45", "7,3", "8,0"],
    reponse: "7,45",
    explication: "7,45 est entre 7,4 (= 7,40) et 7,5 (= 7,50).",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom mesure 1,35 m et Léa mesure 1,4 m. Qui est le plus grand ?",
    options: ["Tom", "Léa", "Ils ont la même taille", "On ne sait pas"],
    reponse: "Léa",
    explication:
      "1,4 m = 1,40 m. Au rang des dixièmes : 4 > 3, donc Léa (1,40 m) > Tom (1,35 m).",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "maths";
const THEME = "decimaux";

export default function DecimauxCM1() {
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
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Nombres décimaux</span>
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
          <div className="lecon-badge">🔵 Nombres décimaux · CM1</div>
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
              ? "Tu maîtrises parfaitement les nombres décimaux ! 🚀"
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
