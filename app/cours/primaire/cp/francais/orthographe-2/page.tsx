"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les sons complexes : ou, oi, an, in, on",
  intro:
    "Certains sons s'écrivent avec deux lettres. Il faut bien les reconnaître pour savoir lire et écrire les mots.",
  points: [
    {
      titre: "Le son [ou] et [oi]",
      texte: "Le son 'ou' s'écrit O+U. Le son 'oi' s'écrit O+I.",
      exemple: "une sOUpir · une vOIture",
    },
    {
      titre: "Le son [on] et [an]",
      texte: "Le son 'on' s'écrit O+N. Le son 'an' s'écrit A+N ou E+N.",
      exemple: "un pONt · un mANteau",
    },
    {
      titre: "Le son [in]",
      texte: "Le son 'in' s'écrit souvent I+N.",
      exemple: "un lapIN · un sapIN",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Comment s'écrit le son 'OU' dans 'une P...LE' ?",
    options: ["OU", "OI", "ON", "AU"],
    reponse: "OU",
    explication:
      "Pour faire le son 'ou', on utilise les lettres O et U : une poule.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel son entends-tu dans le mot 'ROI' ?",
    options: ["oi", "ou", "on"],
    reponse: "oi",
    explication: "Le mot 'roi' se termine par le son 'oi' qui s'écrit O+I.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète le mot : 'un sav...'",
    options: ["on", "an", "in"],
    reponse: "on",
    explication: "On dit 'un savon', le son 'on' s'écrit O+N.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Trouve le mot qui contient le son [AN] :",
    options: ["Maman", "Mouton", "Matin"],
    reponse: "Maman",
    explication: "'Maman' contient deux fois le son 'an'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Dans 'LAPIN', comment s'écrit le son [IN] ?",
    options: ["IN", "UN", "AN"],
    reponse: "IN",
    explication: "À la fin de lapin, on écrit I+N.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Lequel de ces animaux contient le son [OU] ?",
    options: ["Souris", "Poisson", "Lapin"],
    reponse: "Souris",
    explication: "S-OU-R-I-S, on entend bien le son 'ou' au début.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : 'Le p...sson nage.'",
    options: ["oi", "ou", "on"],
    reponse: "oi",
    explication: "On écrit 'poisson' avec O+I pour faire le son 'oi'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Combien de sons complexes y a-t-il dans 'Mouton' ?",
    options: ["2 (ou et on)", "1 (ou)", "1 (on)"],
    reponse: "2 (ou et on)",
    explication: "Il y a le 'ou' (mOU) et le 'on' (tON).",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quel mot est bien écrit ?",
    options: ["Un mouton", "Un moton", "Un mauton"],
    reponse: "Un mouton",
    explication: "Le son 'ou' s'écrit toujours O+U.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Trouve le mot qui n'a PAS le son [ON] :",
    options: ["Ballon", "Bouton", "Banane"],
    reponse: "Banane",
    explication: "Dans 'Banane', on entend 'an' au début, mais pas 'on'.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "orthographe-2";

export default function Orthographe2CP() {
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
        score: score,
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
          onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span> <span className="breadcrumb-sep">›</span>
          <span>CP</span> <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe 2</span>
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
          <div className="lecon-badge">👂 Orthographe · CP</div>
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
              ? "Expert des sons !"
              : score >= 7
                ? "Bien joué !"
                : "Continue tes efforts !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
