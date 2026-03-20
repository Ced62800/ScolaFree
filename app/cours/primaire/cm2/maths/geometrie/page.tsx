"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Géométrie — Aires, volumes et cercle",
  intro:
    "En CM2, on calcule des aires et des volumes, et on étudie le cercle. L'aire mesure la surface d'une figure, le volume mesure l'espace occupé par un solide.",
  points: [
    {
      titre: "Aires des figures planes",
      texte:
        "L'aire d'un rectangle = longueur × largeur. L'aire d'un carré = côté × côté. L'aire d'un triangle = (base × hauteur) ÷ 2.",
      exemple:
        "Rectangle 5 cm × 3 cm : aire = 15 cm². Triangle base 4 cm hauteur 6 cm : aire = 12 cm².",
    },
    {
      titre: "Le cercle",
      texte:
        "Le cercle est défini par son centre et son rayon. Le diamètre = 2 × rayon. La circonférence ≈ 3,14 × diamètre. L'aire ≈ 3,14 × rayon × rayon.",
      exemple:
        "Cercle de rayon 5 cm : diamètre = 10 cm. Circonférence ≈ 3,14 × 10 = 31,4 cm.",
    },
    {
      titre: "Volume du cube et du pavé droit",
      texte:
        "Le volume d'un cube = côté × côté × côté. Le volume d'un pavé droit = longueur × largeur × hauteur.",
      exemple:
        "Cube de côté 3 cm : volume = 27 cm³. Pavé 4 × 3 × 2 : volume = 24 cm³.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est l'aire d'un rectangle de 6 cm × 4 cm ?",
    options: ["20 cm²", "24 cm²", "28 cm²", "10 cm²"],
    reponse: "24 cm²",
    explication: "Aire = longueur × largeur = 6 × 4 = 24 cm².",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est le diamètre d'un cercle de rayon 7 cm ?",
    options: ["3,5 cm", "7 cm", "14 cm", "21 cm"],
    reponse: "14 cm",
    explication: "Diamètre = 2 × rayon = 2 × 7 = 14 cm.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel est le volume d'un cube de côté 4 cm ?",
    options: ["16 cm³", "48 cm³", "64 cm³", "12 cm³"],
    reponse: "64 cm³",
    explication: "Volume = 4 × 4 × 4 = 64 cm³.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Quelle est l'aire d'un triangle de base 8 cm et de hauteur 5 cm ?",
    options: ["13 cm²", "20 cm²", "40 cm²", "16 cm²"],
    reponse: "20 cm²",
    explication: "Aire = (8 × 5) ÷ 2 = 20 cm².",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Quelle est la circonférence d'un cercle de diamètre 10 cm ? (π ≈ 3,14)",
    options: ["31,4 cm", "314 cm", "15,7 cm", "62,8 cm"],
    reponse: "31,4 cm",
    explication: "Circonférence = π × diamètre ≈ 3,14 × 10 = 31,4 cm.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le volume d'un pavé droit de 5 cm × 3 cm × 2 cm ?",
    options: ["10 cm³", "20 cm³", "30 cm³", "25 cm³"],
    reponse: "30 cm³",
    explication: "Volume = 5 × 3 × 2 = 30 cm³.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle est l'aire d'un carré de côté 7 cm ?",
    options: ["14 cm²", "28 cm²", "49 cm²", "42 cm²"],
    reponse: "49 cm²",
    explication: "Aire = 7 × 7 = 49 cm².",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Un cercle a un rayon de 6 cm. Quelle est son aire ? (π ≈ 3,14)",
    options: ["18,84 cm²", "37,68 cm²", "113,04 cm²", "75,36 cm²"],
    reponse: "113,04 cm²",
    explication: "Aire = 3,14 × 6 × 6 = 113,04 cm².",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Une piscine mesure 10 m × 5 m × 2 m. Quel est son volume ?",
    options: ["50 m³", "70 m³", "100 m³", "17 m³"],
    reponse: "100 m³",
    explication: "Volume = 10 × 5 × 2 = 100 m³.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle est l'aire d'un triangle de base 9 cm et hauteur 4 cm ?",
    options: ["13 cm²", "18 cm²", "36 cm²", "72 cm²"],
    reponse: "18 cm²",
    explication: "Aire = (9 × 4) ÷ 2 = 18 cm².",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "geometrie";

export default function GeometrieCM2() {
  const router = useRouter();
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
  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
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
      if (!scoreSaved.current) {
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
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Géométrie</span>
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
        </div>
      )}
      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📐 Géométrie · CM2</div>
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
            {niveauLabel(questions[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questions[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) cn += " correct";
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
              ? "Excellent !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Assez bien !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises la géométrie ! 🚀"
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
