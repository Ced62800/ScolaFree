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
  titre: "Doubles, moitiés et compléments",
  intro:
    "Le calcul mental permet de calculer rapidement dans sa tête. On apprend les doubles, les moitiés et les compléments à 10 et à 100 !",
  points: [
    {
      titre: "Les doubles",
      texte:
        "Le double d'un nombre c'est ce nombre additionné à lui-même. Connaître les doubles par cœur aide à calculer vite.",
      exemple: "Double de 4 = 8 · Double de 7 = 14 · Double de 15 = 30",
    },
    {
      titre: "Les moitiés",
      texte:
        "La moitié c'est l'inverse du double. La moitié de 8 c'est 4 car 4+4=8.",
      exemple: "Moitié de 10 = 5 · Moitié de 16 = 8 · Moitié de 20 = 10",
    },
    {
      titre: "Les compléments à 10 et à 100",
      texte:
        "Le complément à 10 d'un nombre c'est ce qu'il faut ajouter pour arriver à 10. Le complément à 100 c'est ce qu'il faut pour arriver à 100.",
      exemple: "Complément de 3 à 10 = 7 · Complément de 40 à 100 = 60",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le double de 6 ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "Double de 6 = 6 + 6 = 12.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle est la moitié de 10 ?",
    options: ["4", "5", "6", "7"],
    reponse: "5",
    explication: "Moitié de 10 = 5 car 5 + 5 = 10.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel est le complément de 3 à 10 ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication: "3 + 7 = 10. Le complément de 3 à 10 est 7.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le double de 9 ?",
    options: ["16", "17", "18", "19"],
    reponse: "18",
    explication: "Double de 9 = 9 + 9 = 18.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quelle est la moitié de 16 ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "Moitié de 16 = 8 car 8 + 8 = 16.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le complément de 40 à 100 ?",
    options: ["50", "60", "70", "80"],
    reponse: "60",
    explication: "40 + 60 = 100. Le complément de 40 à 100 est 60.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel est le double de 15 ?",
    options: ["25", "28", "30", "32"],
    reponse: "30",
    explication: "Double de 15 = 15 + 15 = 30.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est le complément de 7 à 10 ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "7 + 3 = 10. Le complément de 7 à 10 est 3.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quelle est la moitié de 24 ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "Moitié de 24 = 12 car 12 + 12 = 24.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel est le complément de 65 à 100 ?",
    options: ["25", "30", "35", "45"],
    reponse: "35",
    explication: "65 + 35 = 100. Le complément de 65 à 100 est 35.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "calcul-mental";

export default function CalculMentalCE1() {
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Calcul Mental</span>
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
          <div className="lecon-badge">🧠 Calcul Mental · CE1</div>
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
