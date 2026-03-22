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
  titre: "Introduction à la division",
  intro:
    "La division permet de partager équitablement une quantité en plusieurs groupes égaux. C'est l'opération inverse de la multiplication !",
  points: [
    {
      titre: "Diviser, c'est partager",
      texte:
        "Diviser 12 par 3, c'est partager 12 en 3 groupes égaux. On utilise le signe ÷ (ou /). Le résultat s'appelle le quotient.",
      exemple: "12 ÷ 3 = 4 · On partage 12 en 3 groupes de 4.",
    },
    {
      titre: "Lien avec la multiplication",
      texte:
        "La division et la multiplication sont liées. Si 3 × 4 = 12, alors 12 ÷ 3 = 4 et 12 ÷ 4 = 3.",
      exemple: "20 ÷ 5 = 4 car 5 × 4 = 20 · 18 ÷ 6 = 3 car 6 × 3 = 18",
    },
    {
      titre: "Le reste",
      texte:
        "Quand on ne peut pas partager exactement, il y a un reste. Le reste est toujours plus petit que le diviseur.",
      exemple: "13 ÷ 4 = 3 reste 1 (car 4 × 3 = 12, et 13 - 12 = 1)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "12 ÷ 3 = ?",
    options: ["3", "4", "5", "6"],
    reponse: "4",
    explication: "12 ÷ 3 = 4 car 3 × 4 = 12.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "20 ÷ 5 = ?",
    options: ["3", "4", "5", "6"],
    reponse: "4",
    explication: "20 ÷ 5 = 4 car 5 × 4 = 20.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "On partage 15 bonbons en 3 parts égales. Combien par part ?",
    options: ["4", "5", "6", "3"],
    reponse: "5",
    explication: "15 ÷ 3 = 5 car 3 × 5 = 15.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "18 ÷ 6 = ?",
    options: ["2", "3", "4", "6"],
    reponse: "3",
    explication: "18 ÷ 6 = 3 car 6 × 3 = 18.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "24 ÷ 4 = ?",
    options: ["4", "5", "6", "8"],
    reponse: "6",
    explication: "24 ÷ 4 = 6 car 4 × 6 = 24.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "30 élèves forment des groupes de 5. Combien de groupes ?",
    options: ["4", "5", "6", "7"],
    reponse: "6",
    explication: "30 ÷ 5 = 6 groupes.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "35 ÷ 7 = ?",
    options: ["4", "5", "6", "7"],
    reponse: "5",
    explication: "35 ÷ 7 = 5 car 7 × 5 = 35.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "13 ÷ 4 = ? (avec reste)",
    options: ["3 reste 0", "3 reste 1", "4 reste 0", "2 reste 5"],
    reponse: "3 reste 1",
    explication: "4 × 3 = 12, et 13 - 12 = 1. Donc 13 ÷ 4 = 3 reste 1.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "48 ÷ 8 = ?",
    options: ["4", "5", "6", "7"],
    reponse: "6",
    explication: "48 ÷ 8 = 6 car 8 × 6 = 48.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "On a 25 images à répartir en 4 albums égaux. Combien par album et combien de reste ?",
    options: ["5 reste 5", "6 reste 1", "6 reste 0", "5 reste 0"],
    reponse: "6 reste 1",
    explication:
      "4 × 6 = 24, et 25 - 24 = 1. Donc 6 images par album, reste 1.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "division";

export default function DivisionCE2() {
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
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Division</span>
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
          <div className="lecon-badge">➗ Division · CE2</div>
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
              ? "Tu maîtrises parfaitement la division ! 🚀"
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
