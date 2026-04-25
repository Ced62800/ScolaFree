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
  titre: "Fractions supérieures à 1",
  intro:
    "En CM2, on travaille avec des fractions dont le numérateur est plus grand que le dénominateur. Ces fractions valent plus d'un entier et peuvent s'écrire comme des nombres mixtes.",
  points: [
    {
      titre: "Fractions supérieures à 1",
      texte:
        "Quand le numérateur est plus grand que le dénominateur, la fraction vaut plus d'un entier. On peut la convertir en nombre mixte (entier + fraction).",
      exemple: "7/3 = 2 entiers + 1/3 = 2 et 1/3. Car 3 × 2 = 6 et 7 − 6 = 1.",
    },
    {
      titre: "Addition et soustraction de fractions (même dénominateur)",
      texte:
        "Pour additionner ou soustraire des fractions avec le même dénominateur, on opère sur les numérateurs et on garde le dénominateur.",
      exemple: "5/8 + 6/8 = 11/8. 9/5 − 3/5 = 6/5.",
    },
    {
      titre: "Comparer des fractions supérieures à 1",
      texte:
        "On compare d'abord la partie entière. Si elle est égale, on compare les parties fractionnaires.",
      exemple: "11/4 = 2 et 3/4. 9/4 = 2 et 1/4. Donc 11/4 > 9/4.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Que vaut 5/2 ?",
    options: ["Moins de 1", "Exactement 1", "Entre 1 et 2", "Plus de 2"],
    reponse: "Plus de 2",
    explication: "5/2 = 2 entiers + 1/2 = 2,5. C'est plus de 2.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "3/4 + 5/4 = ?",
    options: ["8/8", "8/4", "6/4", "2/4"],
    reponse: "8/4",
    explication: "3 + 5 = 8, on garde 4. Résultat : 8/4 = 2 entiers.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "7/3, combien d'entiers peut-on former ?",
    options: ["1", "2", "3", "7"],
    reponse: "2",
    explication: "3 × 2 = 6 ≤ 7 < 9 = 3 × 3. On peut former 2 entiers.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "5/8 + 6/8 = ?",
    options: ["11/8", "11/16", "1/8", "10/8"],
    reponse: "11/8",
    explication: "5 + 6 = 11, on garde 8. Résultat : 11/8.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "11/4, quelle est la partie entière ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication: "4 × 2 = 8 ≤ 11 < 12 = 4 × 3. La partie entière est 2.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "9/5 − 3/5 = ?",
    options: ["6/5", "6/10", "12/5", "3/5"],
    reponse: "6/5",
    explication: "9 − 3 = 6, on garde 5. Résultat : 6/5.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Laquelle est la plus grande : 11/4 ou 9/4 ?",
    options: ["11/4", "9/4", "Elles sont égales", "On ne peut pas savoir"],
    reponse: "11/4",
    explication: "Même dénominateur : 11 > 9, donc 11/4 > 9/4.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "7/3 s'écrit comme nombre mixte : ?",
    options: ["1 et 1/3", "2 et 1/3", "2 et 2/3", "3 et 1/3"],
    reponse: "2 et 1/3",
    explication: "3 × 2 = 6. 7 − 6 = 1. Donc 7/3 = 2 et 1/3.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "4/6 + 7/6 = ?",
    options: ["11/6", "11/12", "3/6", "12/6"],
    reponse: "11/6",
    explication: "4 + 7 = 11, on garde 6. Résultat : 11/6.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Une recette nécessite 3/4 de litre pour un gâteau. Pour 3 gâteaux, combien faut-il ?",
    options: ["6/4", "9/4", "3/12", "12/4"],
    reponse: "9/4",
    explication: "3 × 3/4 = 9/4 litres = 2 litres et 1/4.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "fractions";

export default function FractionsCM2() {
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
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Fractions</span>
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
          <div className="lecon-badge">🍕 Fractions · CM2</div>
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
              ? "Tu maîtrises parfaitement les fractions ! 🚀"
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
