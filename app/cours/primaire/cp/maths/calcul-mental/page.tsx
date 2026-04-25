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
  titre: "Calcul Mental 2",
  intro:
    "Le calcul mental, c'est calculer dans sa tête sans papier ni crayon. On va apprendre les doubles, les moitiés et les compléments.",
  points: [
    {
      titre: "Les doubles",
      texte: "Doubler un nombre, c'est l'additionner avec lui-même.",
      exemple: "Le double de 4 = 4 + 4 = 8",
    },
    {
      titre: "Les moitiés",
      texte: "La moitié d'un nombre, c'est le diviser par 2.",
      exemple: "La moitié de 10 = 10 ÷ 2 = 5",
    },
    {
      titre: "Les compléments à 10",
      texte:
        "Le complément à 10 d'un nombre, c'est ce qu'il faut ajouter pour arriver à 10.",
      exemple: "Le complément de 6 = 4 (car 6 + 4 = 10)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le double de 3 ?",
    options: ["3", "5", "6", "9"],
    reponse: "6",
    explication: "3 + 3 = 6.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est le double de 5 ?",
    options: ["5", "8", "10", "15"],
    reponse: "10",
    explication: "5 + 5 = 10.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "4", "6", "8"],
    reponse: "4",
    explication: "8 ÷ 2 = 4.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le complément de 3 pour arriver à 10 ?",
    options: ["3", "5", "7", "6"],
    reponse: "7",
    explication: "3 + 7 = 10.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel est le double de 7 ?",
    options: ["7", "12", "14", "17"],
    reponse: "14",
    explication: "7 + 7 = 14.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle est la moitié de 12 ?",
    options: ["4", "5", "6", "8"],
    reponse: "6",
    explication: "12 ÷ 2 = 6.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel est le complément de 8 pour arriver à 10 ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication: "8 + 2 = 10.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est le double de 9 ?",
    options: ["16", "17", "18", "19"],
    reponse: "18",
    explication: "9 + 9 = 18.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quelle est la moitié de 20 ?",
    options: ["5", "8", "10", "15"],
    reponse: "10",
    explication: "20 ÷ 2 = 10.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel est le complément de 4 pour arriver à 10 ?",
    options: ["4", "5", "6", "7"],
    reponse: "6",
    explication: "4 + 6 = 10.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "calcul-mental";

export default function CalculMentalCP() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
    [qIndex, refreshKey],
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
    setRefreshKey((prev) => prev + 1);
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
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Calcul Mental 2</span>
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
          <div className="lecon-badge">🧠 Calcul Mental · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#ff6b6b",
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
                  <span className="exemple-label">Exemple :</span> {p.exemple}
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
              ? "Champion du calcul mental !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Pas mal !"
                  : "Continue tes efforts !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#ff6b6b",
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
                    padding: "10px",
                    fontSize: "0.85rem",
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
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
