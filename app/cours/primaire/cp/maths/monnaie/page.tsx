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
  titre: "La Monnaie : L'Euro",
  intro:
    "On utilise l'Euro (€) pour acheter des choses en France et dans de nombreux pays d'Europe.",
  points: [
    {
      titre: "Les pièces",
      texte:
        "Il existe des pièces de 1€ et 2€ (et aussi des centimes : 1c, 2c, 5c, 10c, 20c, 50c).",
      exemple: "2 pièces de 1€ = 1 pièce de 2€",
    },
    {
      titre: "Les billets",
      texte: "Il existe des billets de 5€, 10€, 20€, 50€...",
      exemple: "1 billet de 5€ = 5 pièces de 1€",
    },
    {
      titre: "La monnaie rendue",
      texte:
        "Quand on paye plus que le prix, on reçoit de la monnaie en retour.",
      exemple: "Je donne 2€ pour une sucette à 1€ → on me rend 1€",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Si j'ai deux pièces de 2€, combien ai-je ?",
    options: ["2€", "4€", "5€", "6€"],
    reponse: "4€",
    explication: "2 + 2 = 4 euros.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est le plus petit billet ?",
    options: ["5€", "10€", "20€", "50€"],
    reponse: "5€",
    explication: "Le billet de 5€ est le plus petit.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien faut-il de pièces de 1€ pour faire 5€ ?",
    options: ["2", "5", "10", "3"],
    reponse: "5",
    explication: "Il faut 5 pièces de 1 euro.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Une sucette coûte 1€. Je donne 2€. Combien me rend-on ?",
    options: ["1€", "2€", "Rien", "3€"],
    reponse: "1€",
    explication: "2 - 1 = 1 euro.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel est une pièce ?",
    options: ["5€", "10€", "2€", "20€"],
    reponse: "2€",
    explication: "Le 2€ est une pièce, le 5€ est un billet.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "J'ai 10€. J'achète un livre à 7€. Il me reste :",
    options: ["2€", "3€", "4€", "5€"],
    reponse: "3€",
    explication: "10 - 7 = 3.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Combien font 5€ + 5€ ?",
    options: ["10€", "15€", "20€", "8€"],
    reponse: "10€",
    explication: "5 + 5 = 10.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle pièce n'existe pas ?",
    options: ["1€", "2€", "3€", "50c"],
    reponse: "3€",
    explication: "Il n'y a pas de pièce de 3 euros.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Pour payer 6€, je peux donner :",
    options: ["5€ + 1€", "2€ + 2€", "3€ + 4€", "10€ - 3€"],
    reponse: "5€ + 1€",
    explication: "5 + 1 = 6.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Le signe de l'Euro est :",
    options: ["$", "€", "£", "¥"],
    reponse: "€",
    explication: "C'est le symbole de notre monnaie.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "monnaie";

export default function MonnaieCP() {
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
          onClick={() => router.push("/cours/primaire/cp/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">La Monnaie</span>
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
          <div className="lecon-badge">💶 Monnaie · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4cc9f0",
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
              ? "Expert de la monnaie !"
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
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4cc9f0",
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
              onClick={() => router.push("/cours/primaire/cp/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
