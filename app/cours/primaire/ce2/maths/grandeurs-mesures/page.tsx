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
  titre: "Grandeurs et mesures",
  intro:
    "Mesurer c'est comparer une grandeur à une unité. On mesure des longueurs (cm, m), des masses (g, kg) et des durées (minutes, heures).",
  points: [
    {
      titre: "Les longueurs",
      texte:
        "On mesure les longueurs en millimètres (mm), centimètres (cm), mètres (m) et kilomètres (km). 1 m = 100 cm · 1 cm = 10 mm.",
      exemple:
        "Une règle mesure 30 cm. · Un terrain de foot mesure environ 100 m.",
    },
    {
      titre: "Les masses",
      texte:
        "On mesure les masses en grammes (g) et kilogrammes (kg). 1 kg = 1 000 g.",
      exemple: "Un œuf pèse environ 60 g. · Un sac de farine pèse 1 kg.",
    },
    {
      titre: "Les durées",
      texte:
        "On mesure les durées en secondes, minutes et heures. 1 heure = 60 minutes · 1 minute = 60 secondes.",
      exemple: "Une récréation dure 15 min. · Un film dure environ 1 h 30 min.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien de centimètres dans 1 mètre ?",
    options: ["10", "100", "1000", "50"],
    reponse: "100",
    explication: "1 m = 100 cm.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien de grammes dans 1 kilogramme ?",
    options: ["100", "500", "1000", "10"],
    reponse: "1000",
    explication: "1 kg = 1 000 g.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien de minutes dans 1 heure ?",
    options: ["30", "60", "100", "24"],
    reponse: "60",
    explication: "1 heure = 60 minutes.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Clara mesure 1 m 35 cm. En centimètres, cela fait…",
    options: ["135 cm", "1035 cm", "35 cm", "235 cm"],
    reponse: "135 cm",
    explication: "1 m = 100 cm + 35 cm = 135 cm.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Un sac pèse 2 500 g. En kilogrammes ?",
    options: ["2 kg", "2,5 kg", "25 kg", "0,25 kg"],
    reponse: "2,5 kg",
    explication: "2 500 g = 2 kg + 500 g = 2,5 kg.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Un film commence à 14h00 et finit à 15h30. Combien de temps dure-t-il ?",
    options: ["1 h", "1 h 15", "1 h 30", "2 h"],
    reponse: "1 h 30",
    explication: "De 14h00 à 15h30 = 1 heure et 30 minutes.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Convertis 3 km en mètres.",
    options: ["300 m", "3 000 m", "30 m", "30 000 m"],
    reponse: "3 000 m",
    explication: "1 km = 1 000 m → 3 km = 3 000 m.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle unité utilise-t-on pour peser une pomme ?",
    options: ["km", "m", "g", "L"],
    reponse: "g",
    explication: "Une pomme pèse environ 150 g — on utilise les grammes.",
    niveau: "moyen",
  },
  {
    id: 9,
    question:
      "Tom marche 45 minutes le matin et 30 minutes le soir. Combien en tout ?",
    options: ["1 h 10", "1 h 15", "1 h 20", "1 h 30"],
    reponse: "1 h 15",
    explication: "45 + 30 = 75 minutes = 1 heure et 15 minutes.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Une piscine fait 25 m. Paul nage 8 longueurs. Quelle distance a-t-il parcourue ?",
    options: ["150 m", "175 m", "200 m", "225 m"],
    reponse: "200 m",
    explication: "8 × 25 m = 200 m.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "grandeurs-mesures";

export default function GrandeursMesuresCE2() {
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
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grandeurs et mesures</span>
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
          <div className="lecon-badge">📏 Grandeurs et mesures · CE2</div>
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
              ? "Tu maîtrises parfaitement les mesures ! 🚀"
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
