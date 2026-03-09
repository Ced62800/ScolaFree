"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

type Theme = "numeration" | "multiplication" | "fractions" | "mesures";

const questions: {
  id: number;
  theme: Theme;
  question: string;
  options: string[];
  reponse: string;
  explication: string;
}[] = [
  // NUMÉRATION (5)
  {
    id: 1,
    theme: "numeration",
    question: "Quel est le chiffre des centaines dans 743 ?",
    options: ["7", "4", "3", "74"],
    reponse: "7",
    explication: "743 = 7 centaines + 4 dizaines + 3 unités.",
  },
  {
    id: 2,
    theme: "numeration",
    question: "Comment s'écrit « trois cent cinquante-deux » ?",
    options: ["325", "352", "532", "302"],
    reponse: "352",
    explication:
      "Trois cent → 3, cinquante → 5 dizaines, deux → 2 unités : 352.",
  },
  {
    id: 3,
    theme: "numeration",
    question: "Lequel est le plus grand ?",
    options: ["456", "546", "465", "564"],
    reponse: "564",
    explication: "564 a 5 centaines — c'est le plus grand.",
  },
  {
    id: 4,
    theme: "numeration",
    question: "Quel nombre vient juste avant 500 ?",
    options: ["501", "510", "499", "400"],
    reponse: "499",
    explication: "Avant 500 vient 499.",
  },
  {
    id: 5,
    theme: "numeration",
    question: "900 + 70 + 8 = ?",
    options: ["978", "987", "907", "970"],
    reponse: "978",
    explication: "9 centaines + 7 dizaines + 8 unités = 978.",
  },
  // MULTIPLICATION (5)
  {
    id: 6,
    theme: "multiplication",
    question: "3 × 5 = ?",
    options: ["8", "15", "10", "12"],
    reponse: "15",
    explication: "3 × 5 = 5 + 5 + 5 = 15.",
  },
  {
    id: 7,
    theme: "multiplication",
    question: "10 × 7 = ?",
    options: ["17", "70", "700", "17"],
    reponse: "70",
    explication: "Multiplier par 10 : on ajoute un zéro → 7 × 10 = 70.",
  },
  {
    id: 8,
    theme: "multiplication",
    question:
      "4 boîtes contiennent chacune 6 billes. Combien de billes en tout ?",
    options: ["10", "20", "24", "18"],
    reponse: "24",
    explication: "4 × 6 = 24 billes.",
  },
  {
    id: 9,
    theme: "multiplication",
    question: "2 × 9 = ?",
    options: ["11", "18", "16", "20"],
    reponse: "18",
    explication: "2 × 9 = 9 + 9 = 18.",
  },
  {
    id: 10,
    theme: "multiplication",
    question: "5 × 6 = ?",
    options: ["25", "30", "35", "20"],
    reponse: "30",
    explication: "5 × 6 = 30.",
  },
  // FRACTIONS (5)
  {
    id: 11,
    theme: "fractions",
    question: "Une tarte coupée en 4 parts égales : chaque part est…",
    options: ["1/2", "1/3", "1/4", "1/5"],
    reponse: "1/4",
    explication: "4 parts égales → chaque part = 1/4 (un quart).",
  },
  {
    id: 12,
    theme: "fractions",
    question: "Laquelle de ces fractions est la plus grande ?",
    options: ["1/4", "1/3", "1/2", "Elles sont pareilles"],
    reponse: "1/2",
    explication: "1/2 > 1/3 > 1/4.",
  },
  {
    id: 13,
    theme: "fractions",
    question:
      "Un ruban est partagé en 3 parts égales. Julie prend 1 part. Quelle fraction a-t-elle ?",
    options: ["1/2", "1/3", "2/3", "3/1"],
    reponse: "1/3",
    explication: "3 parts, 1 prise : Julie a 1/3.",
  },
  {
    id: 14,
    theme: "fractions",
    question: "Dans 1/4, que représente le 4 ?",
    options: [
      "Les parts prises",
      "Le total de parts égales",
      "La taille",
      "Rien",
    ],
    reponse: "Le total de parts égales",
    explication: "Le dénominateur (bas) = nombre total de parts égales.",
  },
  {
    id: 15,
    theme: "fractions",
    question: "Hugo mange la moitié d'une pomme. Quelle fraction reste-t-il ?",
    options: ["1/4", "1/3", "1/2", "0"],
    reponse: "1/2",
    explication: "La moitié = 1/2 mangée. Il reste 1/2.",
  },
  // MESURES (5)
  {
    id: 16,
    theme: "mesures",
    question: "Combien de cm dans 1 mètre ?",
    options: ["10", "100", "1 000", "50"],
    reponse: "100",
    explication: "1 m = 100 cm.",
  },
  {
    id: 17,
    theme: "mesures",
    question: "Combien de minutes dans 1 heure ?",
    options: ["30", "60", "100", "24"],
    reponse: "60",
    explication: "1 h = 60 min.",
  },
  {
    id: 18,
    theme: "mesures",
    question: "Un sac pèse 2 000 g. Cela fait combien de kilogrammes ?",
    options: ["2 kg", "20 kg", "200 kg", "0,2 kg"],
    reponse: "2 kg",
    explication: "1 kg = 1 000 g → 2 000 g = 2 kg.",
  },
  {
    id: 19,
    theme: "mesures",
    question: "Clara mesure 1 m 25 cm. En centimètres, cela fait…",
    options: ["125 cm", "1025 cm", "12,5 cm", "225 cm"],
    reponse: "125 cm",
    explication: "1 m = 100 cm + 25 cm = 125 cm.",
  },
  {
    id: 20,
    theme: "mesures",
    question:
      "Une récréation commence à 10h00 et finit à 10h20. Combien de temps dure-t-elle ?",
    options: ["10 min", "15 min", "20 min", "30 min"],
    reponse: "20 min",
    explication: "De 10h00 à 10h20 = 20 minutes.",
  },
];

const themeLabels: Record<Theme, string> = {
  numeration: "Numération",
  multiplication: "Multiplication",
  fractions: "Fractions",
  mesures: "Mesures",
};

const themeEmojis: Record<Theme, string> = {
  numeration: "🔢",
  multiplication: "✖️",
  fractions: "🍕",
  mesures: "📏",
};

export default function BilanCE1Maths() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [scoresParTheme, setScoresParTheme] = useState<Record<Theme, number>>({
    numeration: 0,
    multiplication: 0,
    fractions: 0,
    mesures: 0,
  });

  const shuffledQuestions = useMemo(() => {
    const byTheme = (t: Theme) =>
      shuffleArray(questions.filter((q) => q.theme === t)).slice(0, 5);
    return [
      ...byTheme("numeration"),
      ...byTheme("multiplication"),
      ...byTheme("fractions"),
      ...byTheme("mesures"),
    ];
  }, []);

  const current = shuffledQuestions[questionIndex];
  const shuffledOptions = useMemo(
    () => shuffleArray(current.options),
    [questionIndex],
  );

  function handleOption(opt: string) {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.reponse) {
      setScore((s) => s + 1);
      setScoresParTheme((prev) => ({
        ...prev,
        [current.theme]: prev[current.theme] + 1,
      }));
    }
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
    if (score >= 18)
      return {
        icon: "🏆",
        titre: "Excellent !",
        desc: "Félicitations ! Tu maîtrises tout le programme de maths CE1 !",
      };
    if (score >= 14)
      return {
        icon: "⭐",
        titre: "Bien joué !",
        desc: "Très bonne maîtrise des maths de CE1 !",
      };
    if (score >= 10)
      return {
        icon: "👍",
        titre: "Assez bien !",
        desc: "Quelques notions à revoir, continue comme ça !",
      };
    return {
      icon: "💪",
      titre: "À revoir !",
      desc: "Revois les leçons de maths CE1 avant de repasser le bilan.",
    };
  }

  const resultat = getResultat();
  const themes: Theme[] = [
    "numeration",
    "multiplication",
    "fractions",
    "mesures",
  ];

  function reset() {
    setEtape("intro");
    setScore(0);
    setQuestionIndex(0);
    setSelected(null);
    setAnswered(false);
    setScoresParTheme({
      numeration: 0,
      multiplication: 0,
      fractions: 0,
      mesures: 0,
    });
  }

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
          Primaire › CE1 › Maths › Bilan Final
        </span>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🎯</div>
        <h1 className="cours-hero-title">Bilan Final — Maths CE1</h1>
        <p className="cours-hero-desc">
          20 questions pour valider toute l'année de maths !
        </p>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <span className="lecon-badge">🎯 Bilan</span>
          <h2 className="lecon-titre">Êtes-vous prêt(e) ?</h2>
          <p className="lecon-intro">
            Ce bilan comporte <strong>20 questions</strong> réparties en 4
            thèmes (5 questions par thème) :
          </p>
          <div className="bilan-info-grid">
            {themes.map((t) => (
              <div key={t} className="bilan-info-card">
                <span>{themeEmojis[t]}</span>
                <span>{themeLabels[t]}</span>
              </div>
            ))}
          </div>
          <p className="bilan-score-info">Score final sur 20 points.</p>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le Bilan →
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
            <span
              className="niveau-label"
              style={{ background: "#e8f4f8", color: "#2c7a9e" }}
            >
              {themeEmojis[current.theme]} {themeLabels[current.theme]}
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
          <div className="resultat-score">{score} / 20</div>
          <p className="resultat-desc">{resultat.desc}</p>

          <div className="bilan-detail">
            <div className="bilan-detail-titre">Détail par thème</div>
            {themes.map((t) => (
              <div key={t} className="bilan-detail-row">
                <span className="bilan-detail-label">
                  {themeEmojis[t]} {themeLabels[t]}
                </span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{ width: `${(scoresParTheme[t] / 5) * 100}%` }}
                  />
                </div>
                <span className="bilan-detail-score">
                  {scoresParTheme[t]}/5
                </span>
              </div>
            ))}
          </div>

          <div className="resultat-actions">
            <button className="lecon-btn" onClick={reset}>
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
