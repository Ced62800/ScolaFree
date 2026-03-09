"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La multiplication — découverte",
  intro:
    "La multiplication, c'est une addition répétée ! Quand on ajoute plusieurs fois le même nombre, on peut utiliser la multiplication pour aller plus vite.",
  points: [
    {
      titre: "Multiplier, c'est additionner rapidement",
      texte:
        "3 × 4 signifie « 3 fois 4 » ou « 4 + 4 + 4 ». On appelle ce calcul une multiplication. Les deux nombres s'appellent des facteurs, et le résultat s'appelle le produit.",
      exemple: "🍎 3 × 4 = 4 + 4 + 4 = 12",
    },
    {
      titre: "Les tables de multiplication (2, 3, 5, 10)",
      texte:
        "En CE1, on commence à apprendre les tables de 2, 3, 5 et 10. Ce sont les plus faciles ! La table de 10 est simple : on ajoute juste un zéro.",
      exemple: "✖️ 5 × 3 = 15 | 10 × 4 = 40 | 2 × 7 = 14",
    },
    {
      titre: "La commutativité",
      texte:
        "L'ordre des facteurs ne change pas le produit ! 3 × 5 = 5 × 3. C'est très pratique pour apprendre les tables.",
      exemple: "🔄 3 × 5 = 15 et 5 × 3 = 15",
    },
    {
      titre: "Multiplication et situations concrètes",
      texte:
        "La multiplication sert à calculer des quantités en groupes égaux : prix d'articles identiques, rangées de chaises, etc.",
      exemple: "🛒 4 cahiers à 3 € chacun → 4 × 3 = 12 €",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "2 × 5 = ?",
    options: ["8", "10", "12", "7"],
    reponse: "10",
    explication: "2 × 5 = 5 + 5 = 10.",
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
    explication: "Pour multiplier par 10, on ajoute un zéro : 6 × 10 = 60.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "5 × 4 = ?",
    options: ["9", "20", "25", "15"],
    reponse: "20",
    explication: "5 × 4 = 5 + 5 + 5 + 5 = 20.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Il y a 3 boîtes avec 6 crayons chacune. Combien de crayons au total ?",
    options: ["9", "12", "18", "24"],
    reponse: "18",
    explication: "3 boîtes × 6 crayons = 18 crayons.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle addition correspond à 4 × 3 ?",
    options: ["4 + 3", "3 + 3 + 3 + 3", "4 + 4 + 4", "3 × 4 + 1"],
    reponse: "3 + 3 + 3 + 3",
    explication: "4 × 3 signifie « 4 fois 3 » soit 3 + 3 + 3 + 3 = 12.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "2 × 8 = ?",
    options: ["10", "14", "16", "18"],
    reponse: "16",
    explication: "2 × 8 = 8 + 8 = 16.",
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
    explication: "5 × 9 = 45. La table de 5 se termine toujours par 0 ou 5.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Léa dispose 8 rangées de 5 chaises. Combien y a-t-il de chaises ?",
    options: ["13", "35", "40", "45"],
    reponse: "40",
    explication: "8 rangées × 5 chaises = 8 × 5 = 40 chaises.",
    niveau: "difficile",
  },
];

export default function MultiplicationCE1() {
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
        desc: "Tu maîtrises parfaitement les premières multiplications !",
      };
    if (score >= 7)
      return {
        icon: "⭐",
        titre: "Bien joué !",
        desc: "Très bon début avec les tables de multiplication !",
      };
    if (score >= 5)
      return {
        icon: "👍",
        titre: "Assez bien !",
        desc: "Continue à réviser les tables de 2, 3, 5 et 10.",
      };
    return {
      icon: "💪",
      titre: "À revoir !",
      desc: "Relis la leçon et entraîne-toi sur les tables de multiplication.",
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
          Primaire › CE1 › Maths › Multiplication
        </span>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">✖️</div>
        <h1 className="cours-hero-title">La multiplication — découverte</h1>
        <p className="cours-hero-desc">
          Tables de 2, 3, 5 et 10 — multiplier c'est additionner vite !
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
