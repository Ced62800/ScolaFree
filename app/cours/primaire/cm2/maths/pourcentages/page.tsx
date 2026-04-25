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
  titre: "Les pourcentages",
  intro:
    "Un pourcentage exprime une proportion sur 100. 50% = 50/100 = 0,5. On utilise les pourcentages pour calculer des réductions, des augmentations, ou des parts.",
  points: [
    {
      titre: "Comprendre un pourcentage",
      texte:
        "50% = la moitié. 25% = le quart. 10% = le dixième. 1% = un centième. Pour calculer x% d'une quantité, on multiplie par x puis on divise par 100.",
      exemple:
        "10% de 200 = 200 × 10 ÷ 100 = 20. 25% de 80 = 80 × 25 ÷ 100 = 20.",
    },
    {
      titre: "Calculer une réduction",
      texte:
        "Pour une réduction de x%, on calcule x% du prix d'origine, puis on soustrait. Ou on multiplie par (100 - x) ÷ 100.",
      exemple:
        "Réduction de 20% sur 50 € : 50 × 20 ÷ 100 = 10 €. Prix final = 50 - 10 = 40 €.",
    },
    {
      titre: "Exprimer une fraction en pourcentage",
      texte:
        "Pour convertir une fraction en pourcentage, on divise le numérateur par le dénominateur et on multiplie par 100.",
      exemple: "3/4 = 0,75 = 75%. 1/5 = 0,20 = 20%. 7/10 = 70%.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien font 50% de 100 ?",
    options: ["25", "50", "75", "100"],
    reponse: "50",
    explication: "50% = la moitié. 100 ÷ 2 = 50.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien font 10% de 80 ?",
    options: ["4", "8", "10", "16"],
    reponse: "8",
    explication: "10% de 80 = 80 × 10 ÷ 100 = 8.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien font 25% de 40 ?",
    options: ["5", "8", "10", "15"],
    reponse: "10",
    explication: "25% = le quart. 40 ÷ 4 = 10.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Un article coûte 60 €. Il y a une réduction de 10%. Quel est le prix final ?",
    options: ["50 €", "54 €", "56 €", "58 €"],
    reponse: "54 €",
    explication: "10% de 60 = 6 €. Prix final = 60 - 6 = 54 €.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Combien font 20% de 150 ?",
    options: ["20", "25", "30", "35"],
    reponse: "30",
    explication: "20% de 150 = 150 × 20 ÷ 100 = 30.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "3/4 exprimé en pourcentage = ?",
    options: ["34%", "43%", "75%", "25%"],
    reponse: "75%",
    explication: "3 ÷ 4 = 0,75 = 75%.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Un livre coûte 20 €. Il est soldé à -25%. Quel est le prix soldé ?",
    options: ["12 €", "14 €", "15 €", "16 €"],
    reponse: "15 €",
    explication: "25% de 20 = 5 €. Prix final = 20 - 5 = 15 €.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Dans une classe de 30 élèves, 60% sont des filles. Combien y a-t-il de filles ?",
    options: ["12", "15", "18", "20"],
    reponse: "18",
    explication: "60% de 30 = 30 × 60 ÷ 100 = 18 filles.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "1/5 exprimé en pourcentage = ?",
    options: ["15%", "20%", "25%", "50%"],
    reponse: "20%",
    explication: "1 ÷ 5 = 0,20 = 20%.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Un vêtement coûte 80 €. Après une réduction de 15%, quel est le prix ?",
    options: ["64 €", "66 €", "68 €", "70 €"],
    reponse: "68 €",
    explication: "15% de 80 = 12 €. Prix final = 80 - 12 = 68 €.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "pourcentages";

export default function PourcentagesCM2() {
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
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Pourcentages</span>
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
          <div className="lecon-badge">💯 Pourcentages · CM2</div>
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
              ? "Tu maîtrises les pourcentages ! 🚀"
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
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
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
