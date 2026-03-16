"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La multiplication posée",
  intro:
    "En CM1, on apprend à multiplier des grands nombres en posant l'opération. On multiplie chiffre par chiffre en commençant par les unités, en gérant les retenues.",
  points: [
    {
      titre: "Multiplier par un nombre à 1 chiffre",
      texte:
        "On pose le multiplicateur sous le nombre. On multiplie chaque chiffre de droite à gauche. Si le résultat dépasse 9, on pose les unités et on retient les dizaines.",
      exemple:
        "  347\n×   4\n-----\n1 388  (4×7=28→pose 8 ret.2 · 4×4+2=18→pose 8 ret.1 · 4×3+1=13)",
    },
    {
      titre: "Multiplier par un nombre à 2 chiffres",
      texte:
        "On effectue deux multiplications partielles. La deuxième ligne est décalée d'un rang vers la gauche (on multiplie par les dizaines).",
      exemple:
        "   23\n×  14\n-----\n   92  (23×4)\n+ 230  (23×10)\n-----\n  322",
    },
    {
      titre: "Vérifier son calcul",
      texte:
        "On peut vérifier en estimant le résultat. Par exemple, 347 × 4 ≈ 350 × 4 = 1 400 → notre résultat 1 388 est cohérent.",
      exemple: "23 × 14 ≈ 20 × 15 = 300 → 322 est cohérent ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "5 × 6 = ?",
    options: ["25", "30", "35", "11"],
    reponse: "30",
    explication: "5 × 6 = 30.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "12 × 4 = ?",
    options: ["44", "46", "48", "52"],
    reponse: "48",
    explication: "12 × 4 = 48.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "25 × 3 = ?",
    options: ["65", "70", "75", "80"],
    reponse: "75",
    explication: "25 × 3 = 75.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "100 × 7 = ?",
    options: ["70", "700", "7 000", "17"],
    reponse: "700",
    explication: "100 × 7 = 700 (on ajoute deux zéros).",
    niveau: "facile",
  },
  {
    id: 5,
    question: "347 × 4 = ?",
    options: ["1 378", "1 388", "1 398", "1 488"],
    reponse: "1 388",
    explication: "347 × 4 = 1 388.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "23 × 14 = ?",
    options: ["302", "312", "322", "332"],
    reponse: "322",
    explication: "23 × 14 = 322.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "45 × 20 = ?",
    options: ["800", "850", "900", "950"],
    reponse: "900",
    explication: "45 × 20 = 45 × 2 × 10 = 90 × 10 = 900.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Une boîte contient 24 chocolats. Il y a 15 boîtes. Combien de chocolats en tout ?",
    options: ["340", "350", "360", "370"],
    reponse: "360",
    explication: "24 × 15 = 360 chocolats.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "132 × 6 = ?",
    options: ["782", "792", "802", "812"],
    reponse: "792",
    explication: "132 × 6 = 792.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "36 × 25 = ?",
    options: ["880", "890", "900", "910"],
    reponse: "900",
    explication: "36 × 25 = 900.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "maths";
const THEME = "multiplication";

export default function MultiplicationCM1() {
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
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Multiplication posée</span>
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
          <div className="lecon-badge">✖️ Multiplication posée · CM1</div>
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
              ? "Tu maîtrises la multiplication posée ! 🚀"
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
