"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La soustraction",
  intro:
    "Soustraire, c'est enlever une quantité d'une autre. On utilise le signe − (moins). Le résultat s'appelle la différence.",
  points: [
    {
      titre: "Soustraire, c'est enlever",
      texte:
        "Quand on soustrait, on part d'un nombre et on enlève une quantité. Le résultat est toujours plus petit que le nombre de départ.",
      exemple: "7 − 3 = 4 · On part de 7, on enlève 3, il reste 4.",
    },
    {
      titre: "La soustraction sur la droite numérique",
      texte:
        "Sur la droite numérique, soustraire c'est reculer vers la gauche. On part du grand nombre et on recule du nombre à enlever.",
      exemple:
        "9 − 4 = 5 · On part de 9 et on recule de 4 cases → on arrive à 5.",
    },
    {
      titre: "Vérifier avec l'addition",
      texte:
        "On peut vérifier une soustraction avec une addition. Si 8 − 3 = 5, alors 5 + 3 = 8.",
      exemple: "10 − 6 = 4 car 4 + 6 = 10 ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "7 − 3 = ?",
    options: ["3", "4", "5", "2"],
    reponse: "4",
    explication: "7 − 3 = 4. On enlève 3 de 7, il reste 4.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "5 − 2 = ?",
    options: ["1", "2", "3", "4"],
    reponse: "3",
    explication: "5 − 2 = 3. On enlève 2 de 5, il reste 3.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "9 − 4 = ?",
    options: ["4", "5", "6", "3"],
    reponse: "5",
    explication: "9 − 4 = 5. On enlève 4 de 9, il reste 5.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "10 − 6 = ?",
    options: ["3", "5", "4", "6"],
    reponse: "4",
    explication: "10 − 6 = 4. On vérifie : 4 + 6 = 10 ✓",
    niveau: "facile",
  },
  {
    id: 5,
    question: "8 − 5 = ?",
    options: ["2", "4", "3", "1"],
    reponse: "3",
    explication: "8 − 5 = 3. On enlève 5 de 8, il reste 3.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Léa a 9 bonbons. Elle en mange 4. Combien lui en reste-t-il ?",
    options: ["4", "6", "5", "3"],
    reponse: "5",
    explication: "9 − 4 = 5. Il reste 5 bonbons à Léa.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "12 − 7 = ?",
    options: ["4", "6", "5", "3"],
    reponse: "5",
    explication: "12 − 7 = 5. On vérifie : 5 + 7 = 12 ✓",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Il y a 10 oiseaux sur un arbre. 3 s'envolent. Combien reste-t-il ?",
    options: ["6", "8", "7", "5"],
    reponse: "7",
    explication: "10 − 3 = 7. Il reste 7 oiseaux sur l'arbre.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "15 − 8 = ?",
    options: ["6", "8", "7", "9"],
    reponse: "7",
    explication: "15 − 8 = 7. On vérifie : 7 + 8 = 15 ✓",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Tom a 14 billes. Il en perd 6. Combien lui en reste-t-il ?",
    options: ["7", "9", "8", "6"],
    reponse: "8",
    explication: "14 − 6 = 8. Tom a encore 8 billes.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "soustraction";

export default function SoustractionCP() {
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
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Soustraction</span>
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
          <div className="lecon-badge">➖ Soustraction · CP</div>
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
              ? "Tu maîtrises parfaitement la soustraction ! 🚀"
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
