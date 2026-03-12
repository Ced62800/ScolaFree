"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La multiplication — découverte",
  intro:
    "La multiplication, c'est une addition répétée ! Quand on ajoute plusieurs fois le même nombre, on utilise la multiplication pour aller plus vite.",
  points: [
    {
      titre: "Multiplier, c'est additionner rapidement",
      texte:
        "3 × 4 signifie « 3 fois 4 » ou « 4 + 4 + 4 ». Les deux nombres s'appellent des facteurs, et le résultat s'appelle le produit.",
      exemple: "3 × 4 = 4 + 4 + 4 = 12. 2 × 6 = 6 + 6 = 12.",
    },
    {
      titre: "Les tables de multiplication (2, 3, 5, 10)",
      texte:
        "En CE1, on commence par les tables de 2, 3, 5 et 10. La table de 10 est la plus simple : on ajoute juste un zéro à la fin du nombre !",
      exemple: "5 × 3 = 15 | 10 × 4 = 40 | 2 × 7 = 14 | 3 × 6 = 18.",
    },
    {
      titre: "L'ordre ne compte pas (Commutativité)",
      texte:
        "Peu importe l'ordre des nombres, le résultat est le même ! 3 × 5, c'est la même chose que 5 × 3. Ça aide beaucoup pour apprendre les tables.",
      exemple: "3 × 5 = 15 et 5 × 3 = 15. 4 × 2 = 8 et 2 × 4 = 8.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "2 × 5 = ?",
    options: ["8", "10", "12", "7"],
    reponse: "10",
    explication: "2 × 5, c'est 5 + 5 = 10. C'est le double de 5 !",
    niveau: "facile",
  },
  {
    id: 2,
    question: "3 × 3 = ?",
    options: ["6", "9", "12", "8"],
    reponse: "9",
    explication: "3 × 3 = 3 + 3 + 3 = 9.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "10 × 6 = ?",
    options: ["16", "60", "600", "61"],
    reponse: "60",
    explication: "On écrit 6 et on ajoute le zéro du 10 : ça fait 60.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "5 × 4 = ?",
    options: ["9", "20", "25", "15"],
    reponse: "20",
    explication: "5 + 5 + 5 + 5 = 20. Dans la table de 5, on compte 5 par 5.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Il y a 3 boîtes avec 6 crayons chacune. Combien de crayons au total ?",
    options: ["9", "12", "18", "24"],
    reponse: "18",
    explication: "3 boîtes × 6 crayons = 6 + 6 + 6 = 18.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle addition est la même chose que 4 × 3 ?",
    options: ["4 + 3", "3 + 3 + 3 + 3", "4 + 4 + 4", "3 × 4 + 1"],
    reponse: "3 + 3 + 3 + 3",
    explication: "4 × 3 signifie qu'on a 4 fois le nombre 3.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "2 × 8 = ?",
    options: ["10", "14", "16", "18"],
    reponse: "16",
    explication: "C'est le double de 8 : 8 + 8 = 16.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "3 × 7 = ?",
    options: ["21", "18", "24", "27"],
    reponse: "21",
    explication: "3 × 7 = 7 + 7 + 7 = 21.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "5 × 9 = ?",
    options: ["40", "45", "50", "35"],
    reponse: "45",
    explication: "5 × 9 = 45. Astuce : c'est la moitié de 10 × 9 (90).",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Léa range 8 rangées de 5 chaises. Combien y a-t-il de chaises ?",
    options: ["13", "35", "40", "45"],
    reponse: "40",
    explication: "8 rangées × 5 chaises = 40. On peut aussi faire 5 × 8.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "multiplication-decouverte";

export default function MultiplicationCE1() {
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
          score: score,
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
          <span>CE1</span>
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
              {score} bonne{score > 1 ? "s" : ""}
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
          <div className="lecon-badge">✖️ Maths · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          [Image of a multiplication table grid for kids]
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
                  🏆 Meilleur <br />{" "}
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
                  🕐 Dernier <br />{" "}
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
                    ? "Gagné !"
                    : "Presque..."}
                </strong>
                <p>{questions[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questions.length ? "Résultats →" : "Suivant →"}
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
              ? "Bravo Champion !"
              : score >= 7
                ? "Beau travail !"
                : score >= 5
                  ? "C'est bien !"
                  : "Continue d'apprendre !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais tes tables sur le bout des doigts !"
              : score >= 7
                ? "Tu as bien compris le principe."
                : score >= 5
                  ? "Révise encore un peu tes tables."
                  : "Relis la leçon et recommence !"}
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
              Menu Maths →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
