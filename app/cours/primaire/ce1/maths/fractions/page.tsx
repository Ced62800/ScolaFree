"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les fractions unitaires",
  intro:
    "Une fraction, c'est une partie d'un tout. Quand on partage un objet en parts égales et qu'on en prend une, on utilise une fraction unitaire.",
  points: [
    {
      titre: "Partager en parts égales",
      texte:
        "Pour parler de fractions, on doit d'abord partager quelque chose en parties égales. Si on coupe une pizza en 4 parts égales, chaque part est un quart de la pizza.",
      exemple: "1 pizza ÷ 4 = 4 parts → chaque part = 1/4 (un quart).",
    },
    {
      titre: "La moitié (1/2), le tiers (1/3) et le quart (1/4)",
      texte:
        "La moitié = 1 part sur 2 parts égales. Le tiers = 1 part sur 3 parts égales. Le quart = 1 part sur 4 parts égales. Plus il y a de parts, plus chaque part est petite.",
      exemple: "1/4 < 1/3 < 1/2. Le quart est plus petit que la moitié.",
    },
    {
      titre: "Lire et écrire une fraction",
      texte:
        "Une fraction s'écrit avec un numérateur (en haut) et un dénominateur (en bas). Le dénominateur dit en combien de parts on a coupé.",
      exemple: "1/3 → numérateur = 1, dénominateur = 3. On dit « un tiers ».",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Si on partage un gâteau en 2 parts égales, chaque part est…",
    options: ["un tiers", "un quart", "une moitié", "un cinquième"],
    reponse: "une moitié",
    explication:
      "Partager en 2 parts égales donne deux moitiés. Chaque part = 1/2.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Comment s'écrit « un quart » ?",
    options: ["1/2", "1/3", "1/4", "1/5"],
    reponse: "1/4",
    explication: "Un quart s'écrit 1/4 : 1 part sur 4 parts égales.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Une orange est coupée en 3 parts égales. Tom mange une part. Quelle fraction a-t-il mangée ?",
    options: ["1/2", "1/3", "2/3", "1/4"],
    reponse: "1/3",
    explication:
      "L'orange est divisée en 3 parts, Tom en mange 1 : il mange 1/3.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Dans la fraction 1/4, que représente le chiffre 4 ?",
    options: [
      "Le nombre de parts prises",
      "Le nombre total de parts égales",
      "La taille de la part",
      "Le total",
    ],
    reponse: "Le nombre total de parts égales",
    explication:
      "Le dénominateur (bas de la fraction) indique en combien de parts égales on a partagé.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Laquelle de ces fractions est la plus grande ?",
    options: ["1/4", "1/2", "1/3", "Elles sont égales"],
    reponse: "1/2",
    explication:
      "1/2 > 1/3 > 1/4. Moins on coupe en parts, plus chaque part est grande.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Un ruban est partagé en 4 morceaux égaux. Nina prend 1 morceau. Quelle fraction du ruban a-t-elle ?",
    options: ["1/3", "1/4", "1/2", "4/1"],
    reponse: "1/4",
    explication: "4 parts égales → chaque part = 1/4. Nina prend 1 part = 1/4.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Vrai ou faux : 1/3 d'une pizza est plus grand que 1/2 de la même pizza.",
    options: ["Vrai", "Faux"],
    reponse: "Faux",
    explication: "1/2 > 1/3. La moitié est plus grande que le tiers.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Sur un dessin, un carré est divisé en 4 parts égales. 1 part est coloriée. Quelle fraction est coloriée ?",
    options: ["1/2", "1/3", "1/4", "3/4"],
    reponse: "1/4",
    explication: "4 parts au total, 1 coloriée → 1/4 est colorié.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Léa dit : « J'ai mangé la moitié de mon sandwich ». Qu'est-ce que cela signifie ?",
    options: [
      "Elle a tout mangé",
      "Elle a mangé 1 part sur 2 parts égales",
      "Elle a mangé 2 parts sur 3",
      "Elle n'a rien mangé",
    ],
    reponse: "Elle a mangé 1 part sur 2 parts égales",
    explication: "La moitié = 1/2 = 1 part sur 2 parts égales.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Un chocolat est coupé en 3 parts égales. Zoé mange 1/3 et Luc mange 1/3. Quelle fraction reste-t-il ?",
    options: ["1/3", "2/3", "1/2", "0"],
    reponse: "1/3",
    explication: "1/3 + 1/3 = 2/3 mangés. Il reste 3/3 − 2/3 = 1/3.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function FractionsCE1() {
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
          onClick={() => router.push("/cours/primaire/ce1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
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
          <div className="lecon-badge">🍕 Fractions · CE1</div>
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
              ? "Tu maîtrises parfaitement les fractions unitaires !"
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
              onClick={() => router.push("/cours/primaire/ce1/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
