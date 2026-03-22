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
  titre: "Additionner et soustraire des décimaux",
  intro:
    "Pour additionner ou soustraire des nombres décimaux, on aligne les virgules en colonnes. On opère chiffre par chiffre comme avec les entiers.",
  points: [
    {
      titre: "Addition de décimaux",
      texte:
        "On pose les nombres en alignant les virgules. On peut ajouter des zéros pour avoir le même nombre de décimales. On additionne de droite à gauche.",
      exemple: "  3,45\n+ 2,30\n------\n  5,75  ·  12,5 + 3,75 = 16,25",
    },
    {
      titre: "Soustraction de décimaux",
      texte:
        "Même principe : on aligne les virgules. On peut compléter avec des zéros si nécessaire.",
      exemple: "  8,70\n- 3,45\n------\n  5,25  ·  10,0 − 4,5 = 5,5",
    },
    {
      titre: "Vérifier son résultat",
      texte:
        "On peut estimer le résultat pour vérifier. Par exemple, 3,45 + 2,3 ≈ 3 + 2 = 5 → notre résultat 5,75 est cohérent.",
      exemple: "12,5 − 3,75 ≈ 12 − 4 = 8 → résultat 8,75 cohérent ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "3,5 + 2,4 = ?",
    options: ["5,7", "5,8", "5,9", "6,0"],
    reponse: "5,9",
    explication: "3,5 + 2,4 = 5,9.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "7,8 − 3,2 = ?",
    options: ["4,4", "4,5", "4,6", "4,7"],
    reponse: "4,6",
    explication: "7,8 − 3,2 = 4,6.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "1,5 + 2,5 = ?",
    options: ["3,5", "4,0", "4,5", "3,0"],
    reponse: "4,0",
    explication: "1,5 + 2,5 = 4,0.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "10,0 − 4,5 = ?",
    options: ["5,0", "5,5", "6,0", "6,5"],
    reponse: "5,5",
    explication: "10,0 − 4,5 = 5,5.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "3,45 + 2,30 = ?",
    options: ["5,65", "5,70", "5,75", "5,80"],
    reponse: "5,75",
    explication: "3,45 + 2,30 = 5,75.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "8,70 − 3,45 = ?",
    options: ["5,15", "5,20", "5,25", "5,30"],
    reponse: "5,25",
    explication: "8,70 − 3,45 = 5,25.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "12,5 + 3,75 = ?",
    options: ["16,15", "16,20", "16,25", "16,30"],
    reponse: "16,25",
    explication: "12,5 + 3,75 = 16,25.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Tom mesure 1,35 m et grandit de 0,08 m. Quelle est sa nouvelle taille ?",
    options: ["1,40 m", "1,43 m", "1,45 m", "1,48 m"],
    reponse: "1,43 m",
    explication: "1,35 + 0,08 = 1,43 m.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "15,60 − 8,75 = ?",
    options: ["6,75", "6,80", "6,85", "6,90"],
    reponse: "6,85",
    explication: "15,60 − 8,75 = 6,85.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Léa a 20 €. Elle achète un livre à 7,50 € et un stylo à 1,25 €. Combien lui reste-t-il ?",
    options: ["10,75 €", "11,00 €", "11,25 €", "11,50 €"],
    reponse: "11,25 €",
    explication: "7,50 + 1,25 = 8,75 €. 20,00 − 8,75 = 11,25 €.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "maths";
const THEME = "addition-decimaux";

export default function AdditionDecimauxCM1() {
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
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Opérations décimales</span>
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
          <div className="lecon-badge">➕ Opérations décimales · CM1</div>
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
              ? "Tu maîtrises les opérations sur les décimaux ! 🚀"
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
