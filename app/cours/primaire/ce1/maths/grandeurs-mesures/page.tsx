"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Grandeurs et mesures",
  intro:
    "Mesurer, c'est comparer une grandeur à une unité. En CE1, on apprend à mesurer des longueurs, des masses et des durées avec les bonnes unités.",
  points: [
    {
      titre: "Les longueurs : m, dm, cm",
      texte:
        "On mesure les longueurs avec des mètres (m), des décimètres (dm) ou des centimètres (cm). 1 mètre = 10 décimètres = 100 centimètres. On utilise une règle pour mesurer.",
      exemple:
        "📏 Un crayon mesure environ 15 cm. Une porte mesure environ 2 m.",
    },
    {
      titre: "Les masses : kg et g",
      texte:
        "On mesure les masses avec des kilogrammes (kg) et des grammes (g). 1 kg = 1 000 g. Les masses se mesurent avec une balance.",
      exemple: "⚖️ Un livre pèse environ 300 g. Un sac de farine pèse 1 kg.",
    },
    {
      titre: "Les durées : h, min, s",
      texte:
        "On mesure le temps en heures (h), minutes (min) et secondes (s). 1 heure = 60 minutes. 1 minute = 60 secondes.",
      exemple: "⏰ Une récréation dure 15 min. Un film dure environ 1h30.",
    },
    {
      titre: "Comparer des mesures",
      texte:
        "Pour comparer deux mesures, elles doivent être dans la même unité. 150 cm > 1 m car 1 m = 100 cm et 150 cm > 100 cm.",
      exemple: "🔍 1 m 20 cm = 120 cm | 2 kg = 2 000 g",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Quelle unité utilise-t-on pour mesurer la longueur d'un crayon ?",
    options: ["kg", "cm", "heure", "litre"],
    reponse: "cm",
    explication: "On mesure la longueur d'un crayon en centimètres (cm).",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien y a-t-il de centimètres dans 1 mètre ?",
    options: ["10", "100", "1 000", "50"],
    reponse: "100",
    explication: "1 mètre = 100 centimètres.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien y a-t-il de minutes dans 1 heure ?",
    options: ["24", "100", "60", "30"],
    reponse: "60",
    explication: "1 heure = 60 minutes.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Un chat pèse 4 000 g. Cela correspond à combien de kilogrammes ?",
    options: ["4 kg", "40 kg", "400 kg", "0,4 kg"],
    reponse: "4 kg",
    explication: "1 kg = 1 000 g, donc 4 000 g = 4 kg.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel de ces objets mesure environ 30 cm ?",
    options: ["Une règle", "Une maison", "Une fourmi", "Une voiture"],
    reponse: "Une règle",
    explication: "Une règle classique mesure 30 cm.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "L'école commence à 8h30 et finit à 11h30. Combien de temps dure la matinée ?",
    options: ["2h", "2h30", "3h", "3h30"],
    reponse: "3h",
    explication: "De 8h30 à 11h30, il s'écoule 3 heures.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "150 cm, c'est la même chose que…",
    options: ["15 m", "1 m 50 cm", "1 m 5 cm", "15 dm"],
    reponse: "1 m 50 cm",
    explication: "100 cm = 1 m, donc 150 cm = 1 m + 50 cm = 1 m 50 cm.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Lequel est le plus lourd ?",
    options: ["500 g", "1 kg", "800 g", "0,5 kg"],
    reponse: "1 kg",
    explication: "1 kg = 1 000 g. C'est plus lourd que 500 g et 800 g.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Un film dure 1 h 45 min. En minutes, cela fait…",
    options: ["100 min", "105 min", "145 min", "115 min"],
    reponse: "105 min",
    explication: "1 h = 60 min. 60 + 45 = 105 minutes.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Lucas mesure 1 m 32 cm et son frère mesure 128 cm. Qui est le plus grand ?",
    options: [
      "Lucas",
      "Son frère",
      "Ils ont la même taille",
      "On ne peut pas savoir",
    ],
    reponse: "Lucas",
    explication:
      "Lucas mesure 1 m 32 cm = 132 cm. 132 cm > 128 cm, donc Lucas est plus grand.",
    niveau: "difficile",
  },
];

export default function GrandeursMesuresCE1() {
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
        desc: "Tu maîtrises parfaitement les grandeurs et mesures !",
      };
    if (score >= 7)
      return {
        icon: "⭐",
        titre: "Bien joué !",
        desc: "Très bonne maîtrise des unités de mesure !",
      };
    if (score >= 5)
      return {
        icon: "👍",
        titre: "Assez bien !",
        desc: "Revois les conversions entre unités.",
      };
    return {
      icon: "💪",
      titre: "À revoir !",
      desc: "Relis la leçon sur les longueurs, masses et durées.",
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
          Primaire › CE1 › Maths › Grandeurs et mesures
        </span>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">📏</div>
        <h1 className="cours-hero-title">Grandeurs et mesures</h1>
        <p className="cours-hero-desc">
          Longueurs, masses, durées — mesurer le monde qui nous entoure
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
