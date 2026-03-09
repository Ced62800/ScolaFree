"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Statistiques — Moyenne, tableaux et graphiques",
  intro:
    "En CM2, on apprend à lire et interpréter des tableaux de données, à calculer une moyenne et à lire des graphiques.",
  points: [
    {
      titre: "La moyenne",
      texte:
        "La moyenne d'une série de nombres s'obtient en additionnant toutes les valeurs, puis en divisant par le nombre de valeurs.",
      exemple:
        "Notes : 12, 14, 10, 16. Moyenne = (12 + 14 + 10 + 16) ÷ 4 = 52 ÷ 4 = 13.",
    },
    {
      titre: "Lire un tableau de données",
      texte:
        "Un tableau organise des données en lignes et colonnes. On peut y trouver des totaux, des fréquences ou des comparaisons.",
      exemple:
        "Tableau des températures : lundi 18°, mardi 20°, mercredi 15°. Moyenne = (18+20+15)÷3 = 17,67°.",
    },
    {
      titre: "Lire un graphique",
      texte:
        "Un graphique représente des données visuellement. Un diagramme en barres compare des quantités. Un graphique en courbes montre une évolution dans le temps.",
      exemple:
        "Sur un graphique en barres, la barre la plus haute représente la valeur la plus grande.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est la moyenne de 4, 6 et 8 ?",
    options: ["5", "6", "7", "8"],
    reponse: "6",
    explication: "(4 + 6 + 8) ÷ 3 = 18 ÷ 3 = 6.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Léa a eu les notes suivantes : 10, 12, 14. Quelle est sa moyenne ?",
    options: ["11", "12", "13", "14"],
    reponse: "12",
    explication: "(10 + 12 + 14) ÷ 3 = 36 ÷ 3 = 12.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Sur un graphique en barres, quelle barre représente la valeur la plus grande ?",
    options: [
      "La plus courte",
      "La plus haute",
      "Celle du milieu",
      "La plus à gauche",
    ],
    reponse: "La plus haute",
    explication:
      "Sur un diagramme en barres, plus la barre est haute, plus la valeur est grande.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quelle est la moyenne de 5, 7, 9 et 11 ?",
    options: ["7", "8", "9", "10"],
    reponse: "8",
    explication: "(5 + 7 + 9 + 11) ÷ 4 = 32 ÷ 4 = 8.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Un élève a eu 8, 10, 12 et 14 en maths. Quelle est sa moyenne ?",
    options: ["10", "11", "12", "13"],
    reponse: "11",
    explication: "(8 + 10 + 12 + 14) ÷ 4 = 44 ÷ 4 = 11.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Les températures cette semaine : 15°, 18°, 12°, 20°, 15°. Quelle est la moyenne ?",
    options: ["14°", "15°", "16°", "17°"],
    reponse: "16°",
    explication: "(15 + 18 + 12 + 20 + 15) ÷ 5 = 80 ÷ 5 = 16°.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Un graphique montre les ventes de janvier à juin. En mai les ventes sont au plus bas. Que peut-on dire ?",
    options: [
      "Mai est le mois avec le plus de ventes",
      "Mai est le mois avec le moins de ventes",
      "Les ventes sont constantes",
      "On ne peut rien dire",
    ],
    reponse: "Mai est le mois avec le moins de ventes",
    explication:
      "Si la valeur est au plus bas, c'est la valeur minimale → le moins de ventes.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Tom a eu 6, 9, 12, 15 et 18 en sport. Quelle est sa moyenne ?",
    options: ["10", "11", "12", "13"],
    reponse: "12",
    explication: "(6 + 9 + 12 + 15 + 18) ÷ 5 = 60 ÷ 5 = 12.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Une classe a eu une moyenne de 13 sur 5 épreuves. Quel est le total des notes ?",
    options: ["55", "60", "65", "70"],
    reponse: "65",
    explication: "Total = moyenne × nombre d'épreuves = 13 × 5 = 65.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "4 enfants ont respectivement 8, 12, 10 et x bonbons. La moyenne est 10. Que vaut x ?",
    options: ["8", "10", "12", "14"],
    reponse: "10",
    explication:
      "Total = 10 × 4 = 40. 8 + 12 + 10 + x = 40. 30 + x = 40. x = 10.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function StatistiquesCM2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex, session],
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
    setSession((s) => s + 1);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm2/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Statistiques</span>
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
          <div className="lecon-badge">📊 Statistiques · CM2</div>
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
              ? "Tu maîtrises parfaitement les statistiques !"
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
              onClick={() => router.push("/cours/primaire/cm2/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
