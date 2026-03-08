"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La moitié, le quart et le tiers",
  intro:
    "Quand on partage quelque chose en parties égales, on utilise les fractions ! En CP on apprend la moitié, le quart et le tiers.",
  points: [
    {
      titre: "La moitié",
      texte:
        "La moitié c'est partager en 2 parts égales. La moitié de 8 c'est 4 car 4 + 4 = 8.",
      exemple:
        "La moitié de 10 = 5 · La moitié de 6 = 3 · La moitié de 20 = 10",
    },
    {
      titre: "Le quart",
      texte:
        "Le quart c'est partager en 4 parts égales. Le quart de 8 c'est 2 car 2 + 2 + 2 + 2 = 8.",
      exemple: "Le quart de 12 = 3 · Le quart de 20 = 5 · Le quart de 8 = 2",
    },
    {
      titre: "Le tiers",
      texte:
        "Le tiers c'est partager en 3 parts égales. Le tiers de 9 c'est 3 car 3 + 3 + 3 = 9.",
      exemple: "Le tiers de 6 = 2 · Le tiers de 12 = 4 · Le tiers de 9 = 3",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est la moitié de 8 ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "8 ÷ 2 = 4. La moitié de 8 est 4.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle est la moitié de 10 ?",
    options: ["4", "5", "6", "2"],
    reponse: "5",
    explication: "10 ÷ 2 = 5. La moitié de 10 est 5.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle est la moitié de 6 ?",
    options: ["2", "4", "3", "1"],
    reponse: "3",
    explication: "6 ÷ 2 = 3. La moitié de 6 est 3.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le quart de 8 ?",
    options: ["4", "3", "2", "1"],
    reponse: "2",
    explication: "8 ÷ 4 = 2. Le quart de 8 est 2.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quel est le tiers de 9 ?",
    options: ["2", "4", "3", "6"],
    reponse: "3",
    explication: "9 ÷ 3 = 3. Le tiers de 9 est 3.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle est la moitié de 20 ?",
    options: ["5", "15", "10", "8"],
    reponse: "10",
    explication: "20 ÷ 2 = 10. La moitié de 20 est 10.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel est le quart de 12 ?",
    options: ["4", "3", "6", "2"],
    reponse: "3",
    explication: "12 ÷ 4 = 3. Le quart de 12 est 3.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est le tiers de 12 ?",
    options: ["3", "6", "4", "2"],
    reponse: "4",
    explication: "12 ÷ 3 = 4. Le tiers de 12 est 4.",
    niveau: "moyen",
  },
  {
    id: 9,
    question:
      "On coupe une pizza en 4 parts égales. Chaque part représente quel fraction ?",
    options: ["La moitié", "Le tiers", "Le quart", "Un entier"],
    reponse: "Le quart",
    explication: "Couper en 4 parts égales = chaque part est un quart.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Marie a 16 billes. Elle en donne la moitié à son ami. Combien en garde-t-elle ?",
    options: ["4", "6", "10", "8"],
    reponse: "8",
    explication: "La moitié de 16 = 8. Marie garde 8 billes.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function FractionsCP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Fractions</span>
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
          <div className="lecon-badge">🍕 Fractions · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
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
              ? "Tu maîtrises parfaitement les fractions !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
