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
  titre: "La proportionnalité",
  intro:
    "Deux grandeurs sont proportionnelles quand leur rapport est constant. On peut toujours multiplier ou diviser par le même nombre pour passer d'une valeur à l'autre.",
  points: [
    {
      titre: "Tableaux de proportionnalité",
      texte:
        "Dans un tableau de proportionnalité, on passe d'une ligne à l'autre en multipliant ou divisant par le même nombre (coefficient).",
      exemple: "1 kg → 2 €. 3 kg → 6 €. 5 kg → 10 €. Coefficient = 2.",
    },
    {
      titre: "La règle de trois",
      texte:
        "Si on connaît la valeur pour 1, on peut calculer pour n'importe quelle quantité en multipliant. Sinon on divise d'abord pour trouver la valeur unitaire.",
      exemple: "3 stylos coûtent 6 €. 1 stylo = 2 €. 7 stylos = 14 €.",
    },
    {
      titre: "Vitesse et échelles",
      texte:
        "La vitesse est un rapport de proportionnalité : distance = vitesse × temps. L'échelle aussi : distance réelle = distance sur carte × échelle.",
      exemple: "80 km/h pendant 3h = 240 km. Échelle 1/100 000 : 2 cm = 2 km.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "1 cahier coûte 3 €. Combien coûtent 4 cahiers ?",
    options: ["9 €", "12 €", "15 €", "7 €"],
    reponse: "12 €",
    explication: "4 × 3 = 12 €.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Une voiture roule à 90 km/h. En 2h, quelle distance parcourt-elle ?",
    options: ["90 km", "150 km", "180 km", "270 km"],
    reponse: "180 km",
    explication: "90 × 2 = 180 km.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Tableau : 1 → 4, 2 → 8, 3 → ? Quelle est la valeur manquante ?",
    options: ["9", "10", "12", "15"],
    reponse: "12",
    explication: "Coefficient = 4. 3 × 4 = 12.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "4 kg de pommes coûtent 8 €. Combien coûtent 7 kg ?",
    options: ["12 €", "14 €", "16 €", "18 €"],
    reponse: "14 €",
    explication: "1 kg = 2 €. 7 kg = 14 €.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Tableau : 5 → 15, 8 → ? Quelle est la valeur manquante ?",
    options: ["20", "24", "25", "30"],
    reponse: "24",
    explication: "Coefficient = 3. 8 × 3 = 24.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Un cycliste roule à 20 km/h. En 2h30, quelle distance parcourt-il ?",
    options: ["40 km", "45 km", "50 km", "60 km"],
    reponse: "50 km",
    explication: "2h30 = 2,5h. 20 × 2,5 = 50 km.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Sur une carte à l'échelle 1/50 000, 4 cm représentent quelle distance ?",
    options: ["2 km", "4 km", "20 km", "200 km"],
    reponse: "2 km",
    explication: "4 × 50 000 cm = 200 000 cm = 2 km.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "6 livres coûtent 42 €. Combien coûtent 9 livres ?",
    options: ["54 €", "60 €", "63 €", "66 €"],
    reponse: "63 €",
    explication: "1 livre = 7 €. 9 livres = 63 €.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Une voiture parcourt 300 km en 4h. Quelle est sa vitesse ?",
    options: ["65 km/h", "70 km/h", "75 km/h", "80 km/h"],
    reponse: "75 km/h",
    explication: "Vitesse = 300 ÷ 4 = 75 km/h.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tableau : 3 → 7,5, 6 → ? Quelle est la valeur manquante ?",
    options: ["12", "14", "15", "16"],
    reponse: "15",
    explication: "Coefficient = 2,5. 6 × 2,5 = 15.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "proportionnalite";

export default function ProportionnaliteCM2() {
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
          <span className="breadcrumb-active">Proportionnalité</span>
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
          <div className="lecon-badge">📊 Proportionnalité · CM2</div>
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
              ? "Tu maîtrises la proportionnalité ! 🚀"
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
