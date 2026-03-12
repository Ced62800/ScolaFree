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
    "En CE2, on apprend à multiplier des nombres à plusieurs chiffres en posant l'opération. On commence toujours par les unités !",
  points: [
    {
      titre: "Rappel des tables",
      texte:
        "Avant de poser une multiplication, il faut bien connaître ses tables de 1 à 9. C'est la base de toute multiplication posée.",
      exemple: "7 × 8 = 56 | 6 × 9 = 54 | 8 × 8 = 64 | 7 × 6 = 42.",
    },
    {
      titre: "Multiplier par un chiffre",
      texte:
        "Pour multiplier 34 × 3, on pose l'opération et on multiplie chaque chiffre en commençant par les unités. Si le résultat dépasse 9, on retient.",
      exemple:
        "34 × 3 : 3 × 4 = 12 (on pose 2, on retient 1). 3 × 3 = 9 + 1 = 10. Résultat : 102.",
    },
    {
      titre: "Les retenues",
      texte:
        "Quand le produit d'une multiplication dépasse 9, on écrit le chiffre des unités et on retient le chiffre des dizaines pour l'ajouter au prochain calcul.",
      exemple:
        "27 × 4 : 4 × 7 = 28 (pose 8, retient 2). 4 × 2 = 8 + 2 = 10. Résultat : 108.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "7 × 8 = ?",
    options: ["54", "56", "63", "48"],
    reponse: "56",
    explication: "7 × 8 = 56. À retenir !",
    niveau: "facile",
  },
  {
    id: 2,
    question: "6 × 9 = ?",
    options: ["54", "56", "63", "48"],
    reponse: "54",
    explication: "6 × 9 = 54.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "20 × 4 = ?",
    options: ["60", "80", "40", "24"],
    reponse: "80",
    explication: "20 × 4 = 80. (2 × 4 = 8, puis on ajoute le zéro).",
    niveau: "facile",
  },
  {
    id: 4,
    question: "12 × 3 = ?",
    options: ["33", "36", "39", "32"],
    reponse: "36",
    explication: "12 × 3 : 3 × 2 = 6, 3 × 1 = 3. Résultat : 36.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "24 × 2 = ?",
    options: ["44", "46", "48", "42"],
    reponse: "48",
    explication: "24 × 2 : 2 × 4 = 8, 2 × 2 = 4. Résultat : 48.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "31 × 3 = ?",
    options: ["90", "93", "96", "99"],
    reponse: "93",
    explication: "31 × 3 : 3 × 1 = 3, 3 × 3 = 9. Résultat : 93.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "15 × 4 = ?",
    options: ["54", "60", "56", "64"],
    reponse: "60",
    explication:
      "15 × 4 : 4 × 5 = 20 (pose 0, retient 2). 4 × 1 = 4 + 2 = 6. Résultat : 60.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "27 × 3 = ?",
    options: ["81", "78", "84", "72"],
    reponse: "81",
    explication:
      "27 × 3 : 3 × 7 = 21 (pose 1, retient 2). 3 × 2 = 6 + 2 = 8. Résultat : 81.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "46 × 2 = ?",
    options: ["88", "92", "96", "84"],
    reponse: "92",
    explication:
      "46 × 2 : 2 × 6 = 12 (pose 2, retient 1). 2 × 4 = 8 + 1 = 9. Résultat : 92.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Un livre coûte 8 €. Combien coûtent 35 livres ?",
    options: ["240 €", "270 €", "280 €", "260 €"],
    reponse: "280 €",
    explication:
      "35 × 8 : 8 × 5 = 40 (pose 0, retient 4). 8 × 3 = 24 + 4 = 28. Résultat : 280 €.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "multiplication-posee";

export default function MultiplicationCE2() {
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
  }, [etape]);

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
          <span>{CLASSE.toUpperCase()}</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Multiplication</span>
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
          <div className="lecon-badge">✖️ Multiplication · CE2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {bestScore && (
              <div
                style={{
                  flex: 1,
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  color: "#4f8ef7",
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
                  textAlign: "center",
                  color: "#aaa",
                }}
              >
                ⏱️ Dernier
                <br />
                <strong style={{ color: "#fff" }}>
                  {lastScore.score} / {lastScore.total}
                </strong>
              </div>
            )}
          </div>

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
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                className={`qcm-option ${selected ? (opt === questions[qIndex].reponse ? "correct" : opt === selected ? "incorrect" : "disabled") : ""}`}
                onClick={() => handleReponse(opt)}
              >
                {opt}
              </button>
            ))}
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
                : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement la multiplication !"
              : "Entraîne-toi encore sur les retenues."}
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
