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
      exemple: "🍕 1 pizza ÷ 4 = 4 parts → chaque part = 1/4",
    },
    {
      titre: "La moitié (1/2)",
      texte:
        "La moitié, c'est quand on partage en 2 parts égales et qu'on en prend 1. On écrit 1/2 (« un demi »).",
      exemple: "🍫 1/2 d'une tablette de chocolat = la moitié",
    },
    {
      titre: "Le tiers (1/3) et le quart (1/4)",
      texte:
        "Le tiers, c'est 1 part sur 3 parts égales (1/3). Le quart, c'est 1 part sur 4 parts égales (1/4). Plus il y a de parts, plus chaque part est petite.",
      exemple: "🔵 1/4 < 1/3 < 1/2 (le quart est plus petit que le tiers)",
    },
    {
      titre: "Lire et écrire une fraction",
      texte:
        "Une fraction s'écrit avec un numérateur (en haut) et un dénominateur (en bas). Le dénominateur dit en combien de parts on a coupé. Le numérateur dit combien on en prend.",
      exemple: "📝 1/3 → numérateur = 1, dénominateur = 3",
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

export default function FractionsCE1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const current = shuffledQuestions[questionIndex];
  const shuffledOptions = useMemo(
    () => shuffleArray(current.options),
    [questionIndex],
  );

  function handleOption(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.reponse) setScore((s) => s + 1);
  }

  function handleNext() {
    if (questionIndex + 1 < shuffledQuestions.length) {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setEtape("fini");
    }
  }

  function getResultat() {
    if (score >= 9)
      return {
        icon: "🏆",
        titre: "Excellent !",
        desc: "Tu comprends parfaitement les fractions unitaires !",
      };
    if (score >= 7)
      return {
        icon: "⭐",
        titre: "Bien joué !",
        desc: "Très bonne compréhension des fractions !",
      };
    if (score >= 5)
      return {
        icon: "👍",
        titre: "Assez bien !",
        desc: "Revois les notions de tiers, quart et moitié.",
      };
    return {
      icon: "💪",
      titre: "À revoir !",
      desc: "Relis la leçon sur les parts égales et les fractions.",
    };
  }

  const resultat = getResultat();

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/ce1/maths")}
        >
          ← Retour
        </button>
        <span className="cours-breadcrumb">
          Primaire › CE1 › Maths › Fractions
        </span>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🍕</div>
        <h1 className="cours-hero-title">Les fractions unitaires</h1>
        <p className="cours-hero-desc">
          La moitié, le tiers, le quart — partager en parts égales
        </p>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <span className="lecon-badge">📘 Leçon</span>
          <h2 className="lecon-titre">{lecon.titre}</h2>
          <p className="lecon-intro">{lecon.intro}</p>
          <div className="lecon-points">
            {lecon.points.map((p, i) => (
              <div key={i} className="lecon-point">
                <div className="lecon-point-titre">{p.titre}</div>
                <div className="lecon-point-texte">{p.texte}</div>
                <div className="lecon-point-exemple">{p.exemple}</div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le QCM →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div className="qcm-wrapper">
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {questionIndex + 1} / {shuffledQuestions.length}
              </span>
              <span>Score : {score}</span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{
                  width: `${((questionIndex + 1) / shuffledQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="qcm-question">
            <span className={`niveau-label niveau-${current.niveau}`}>
              {current.niveau}
            </span>
            <p>{current.question}</p>
          </div>

          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let cls = "qcm-option";
              if (answered) {
                if (opt === current.reponse) cls += " correct";
                else if (opt === selected) cls += " incorrect";
                cls += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => handleOption(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`qcm-feedback ${selected === current.reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">
                {selected === current.reponse ? "✅" : "❌"}
              </span>
              <span className="feedback-texte">{current.explication}</span>
            </div>
          )}

          {answered && (
            <button className="lecon-btn" onClick={handleNext}>
              {questionIndex + 1 < shuffledQuestions.length
                ? "Question suivante →"
                : "Voir mon résultat →"}
            </button>
          )}
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{resultat.icon}</div>
          <h2 className="resultat-titre">{resultat.titre}</h2>
          <div className="resultat-score">
            {score} / {shuffledQuestions.length}
          </div>
          <p className="resultat-desc">{resultat.desc}</p>
          <div className="resultat-actions">
            <button
              className="lecon-btn"
              onClick={() => {
                setEtape("intro");
                setScore(0);
                setQuestionIndex(0);
                setSelected(null);
                setAnswered(false);
              }}
            >
              Recommencer
            </button>
            <button
              className="lecon-btn-outline"
              onClick={() => router.push("/cours/primaire/ce1/maths")}
            >
              Retour aux thèmes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
