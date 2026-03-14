"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Heures et Temps",
  intro:
    "Savoir lire l'heure et comprendre le temps qui passe est très utile dans la vie quotidienne.",
  points: [
    {
      titre: "Les heures",
      texte:
        "Une journée dure 24 heures. La grande aiguille indique les minutes, la petite les heures.",
      exemple:
        "Quand la grande aiguille est sur 12, on dit 'et quart', 'et demie' ou 'pile'.",
    },
    {
      titre: "Les minutes",
      texte:
        "1 heure = 60 minutes. Un quart d'heure = 15 minutes. Une demie-heure = 30 minutes.",
      exemple: "8h30 = 8 heures et demie.",
    },
    {
      titre: "Les jours et les mois",
      texte: "1 semaine = 7 jours. 1 an = 12 mois = 365 jours.",
      exemple: "Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien y a-t-il d'heures dans une journée ?",
    options: ["12", "24", "60", "7"],
    reponse: "24",
    explication: "Une journée dure 24 heures.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien y a-t-il de jours dans une semaine ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication:
      "Une semaine = 7 jours : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien y a-t-il de minutes dans 1 heure ?",
    options: ["24", "30", "60", "100"],
    reponse: "60",
    explication: "1 heure = 60 minutes.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel jour vient après le mercredi ?",
    options: ["Mardi", "Jeudi", "Vendredi", "Lundi"],
    reponse: "Jeudi",
    explication: "L'ordre est : lundi, mardi, mercredi, jeudi...",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Il est 8h30. Comment dit-on ?",
    options: [
      "8 heures et quart",
      "8 heures et demie",
      "8 heures pile",
      "9 heures moins le quart",
    ],
    reponse: "8 heures et demie",
    explication: "30 minutes = une demie heure.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Combien de mois y a-t-il dans une année ?",
    options: ["7", "10", "12", "24"],
    reponse: "12",
    explication: "Une année = 12 mois.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Un quart d'heure, c'est combien de minutes ?",
    options: ["5", "10", "15", "30"],
    reponse: "15",
    explication: "Un quart d'heure = 15 minutes.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est le premier jour de la semaine ?",
    options: ["Dimanche", "Samedi", "Lundi", "Mardi"],
    reponse: "Lundi",
    explication: "En France, la semaine commence le lundi.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Il est 9h00. Dans 30 minutes, il sera ?",
    options: ["9h15", "9h30", "10h00", "8h30"],
    reponse: "9h30",
    explication: "9h00 + 30 minutes = 9h30.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Combien de jours y a-t-il dans une année ?",
    options: ["300", "350", "365", "400"],
    reponse: "365",
    explication: "Une année normale = 365 jours.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "temps";

export default function TempsCP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
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

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex, refreshKey],
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
      if (scoreSaved.current) return;
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
    setRefreshKey((prev) => prev + 1);
  };

  const niveauLabel = (niveau: string) => {
    if (niveau === "facile") return "🟢 Facile";
    if (niveau === "moyen") return "🟡 Moyen";
    return "🔴 Difficile";
  };

  return (
    <div className="cours-page">
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
          <span className="breadcrumb-active">Heures et Temps</span>
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
          <div className="niveau-label">
            {niveauLabel(questions[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🕒 Heures et Temps · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,209,102,0.1)",
                    border: "1px solid rgba(255,209,102,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#ffd166",
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
              ? "Expert du temps !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Pas mal !"
                  : "Continue tes efforts !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,209,102,0.1)",
                    border: "1px solid rgba(255,209,102,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#ffd166",
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
