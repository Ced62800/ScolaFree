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
  titre: "Calcul mental et opérations rapides",
  intro:
    "Le calcul mental permet de trouver rapidement un résultat sans poser l'opération. On utilise des astuces : décomposer les nombres, utiliser les doubles, arrondir puis ajuster.",
  points: [
    {
      titre: "Astuces pour additionner et soustraire",
      texte:
        "On peut décomposer : 48 + 37 = 48 + 30 + 7 = 78 + 7 = 85. Pour soustraire, on peut arrondir puis ajuster : 83 - 29 = 83 - 30 + 1 = 54.",
      exemple: "67 + 45 = 67 + 40 + 5 = 112. 92 - 38 = 92 - 40 + 2 = 54.",
    },
    {
      titre: "Multiplier par 10, 100, 1000",
      texte:
        "Multiplier par 10 : on ajoute un zéro. Par 100 : deux zéros. Par 1000 : trois zéros. Pour les décimaux, on décale la virgule.",
      exemple: "3,4 × 10 = 34. 2,5 × 100 = 250. 0,7 × 1000 = 700.",
    },
    {
      titre: "Estimer et vérifier",
      texte:
        "Arrondir les nombres pour estimer le résultat, puis vérifier si le résultat exact est cohérent.",
      exemple: "248 × 4 ≈ 250 × 4 = 1000 → résultat exact 992 est cohérent ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "48 + 37 = ?",
    options: ["83", "84", "85", "86"],
    reponse: "85",
    explication: "48 + 30 + 7 = 78 + 7 = 85.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "3,4 × 10 = ?",
    options: ["0,34", "34", "340", "3,40"],
    reponse: "34",
    explication: "Multiplier par 10 → on décale la virgule d'un rang : 34.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "83 − 29 = ?",
    options: ["52", "53", "54", "55"],
    reponse: "54",
    explication: "83 - 30 + 1 = 53 + 1 = 54.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "2,5 × 100 = ?",
    options: ["25", "250", "2500", "0,25"],
    reponse: "250",
    explication:
      "Multiplier par 100 → on décale la virgule de deux rangs : 250.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "67 + 45 = ?",
    options: ["110", "111", "112", "113"],
    reponse: "112",
    explication: "67 + 40 + 5 = 107 + 5 = 112.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "0,7 × 1000 = ?",
    options: ["7", "70", "700", "7000"],
    reponse: "700",
    explication:
      "Multiplier par 1000 → on décale la virgule de trois rangs : 700.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "248 × 4, quelle estimation est la plus proche ?",
    options: ["800", "900", "1000", "1100"],
    reponse: "1000",
    explication: "250 × 4 = 1000. Le résultat exact 992 est proche de 1000.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "156 + 247 = ?",
    options: ["393", "400", "403", "413"],
    reponse: "403",
    explication: "156 + 247 = 156 + 200 + 47 = 356 + 47 = 403.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "5,25 × 100 = ?",
    options: ["52,5", "525", "5250", "0,0525"],
    reponse: "525",
    explication: "5,25 × 100 = 525.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "750 − 384 = ?",
    options: ["356", "366", "376", "386"],
    reponse: "366",
    explication: "750 - 400 + 16 = 350 + 16 = 366.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "calcul-mental";

export default function CalculMentalCM2() {
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
          <span className="breadcrumb-active">Calcul mental</span>
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
          <div className="lecon-badge">🧮 Calcul mental · CM2</div>
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
              ? "Tu es un(e) champion(ne) du calcul mental ! 🚀"
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
