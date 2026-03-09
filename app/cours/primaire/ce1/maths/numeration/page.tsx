"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "La numération jusqu'à 1000",
  intro:
    "En CE1, on apprend à lire, écrire et comprendre les nombres jusqu'à 1000. Un nombre est composé de centaines, de dizaines et d'unités.",
  points: [
    {
      titre: "Les unités, dizaines et centaines",
      texte:
        "Un nombre à trois chiffres se décompose en centaines, dizaines et unités. Le chiffre des centaines est le plus à gauche, celui des unités est le plus à droite.",
      exemple: "🔢 243 = 2 centaines + 4 dizaines + 3 unités",
    },
    {
      titre: "Lire et écrire les nombres jusqu'à 1000",
      texte:
        "On lit les centaines d'abord, puis les dizaines, puis les unités. 100 se dit « cent », 200 se dit « deux cents », etc.",
      exemple: "📖 537 → « cinq cent trente-sept »",
    },
    {
      titre: "Comparer et ranger les nombres",
      texte:
        "Pour comparer deux nombres, on regarde d'abord les centaines, puis les dizaines, puis les unités. Le nombre avec le plus de centaines est le plus grand.",
      exemple: "⚖️ 482 > 389 car 4 centaines > 3 centaines",
    },
    {
      titre: "La droite numérique",
      texte:
        "Sur la droite numérique, les nombres sont rangés dans l'ordre croissant de gauche à droite. Entre deux nombres, on peut trouver beaucoup d'autres nombres.",
      exemple: "📏 … 498 – 499 – 500 – 501 – 502 …",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien y a-t-il de centaines dans le nombre 352 ?",
    options: ["2", "3", "5", "35"],
    reponse: "3",
    explication:
      "352 = 3 centaines + 5 dizaines + 2 unités. Il y a 3 centaines.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Comment s'écrit « quatre cent vingt-six » en chiffres ?",
    options: ["462", "426", "406", "624"],
    reponse: "426",
    explication:
      "Quatre cent → 4 au rang des centaines. Vingt-six → 2 dizaines et 6 unités. On écrit 426.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 199 ?",
    options: ["200", "198", "210", "190"],
    reponse: "200",
    explication: "Après 199, on a 200. On passe à la centaine suivante.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le chiffre des dizaines dans 748 ?",
    options: ["7", "8", "4", "74"],
    reponse: "4",
    explication:
      "748 = 7 centaines + 4 dizaines + 8 unités. Le chiffre des dizaines est 4.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel de ces nombres est le plus grand ?",
    options: ["389", "401", "399", "398"],
    reponse: "401",
    explication:
      "401 a 4 centaines, les autres n'en ont que 3. Donc 401 est le plus grand.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Comment décompose-t-on 605 ?",
    options: [
      "6 centaines + 5 unités",
      "6 centaines + 0 dizaines + 5 unités",
      "60 dizaines + 5 unités",
      "6 dizaines + 5 unités",
    ],
    reponse: "6 centaines + 0 dizaines + 5 unités",
    explication:
      "605 = 6 centaines + 0 dizaines + 5 unités. Le zéro des dizaines est important !",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Classe ces nombres dans l'ordre croissant : 512, 215, 521, 251",
    options: [
      "215 – 251 – 512 – 521",
      "521 – 512 – 251 – 215",
      "215 – 512 – 251 – 521",
      "251 – 215 – 521 – 512",
    ],
    reponse: "215 – 251 – 512 – 521",
    explication:
      "Ordre croissant = du plus petit au plus grand. On compare d'abord les centaines : 2 < 5, puis les dizaines.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel nombre est égal à 7 centaines + 3 dizaines + 9 unités ?",
    options: ["739", "793", "937", "379"],
    reponse: "739",
    explication:
      "7 centaines = 700, 3 dizaines = 30, 9 unités = 9. Total : 700 + 30 + 9 = 739.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Entre 870 et 890, combien y a-t-il de nombres entiers (sans compter 870 et 890) ?",
    options: ["18", "19", "20", "21"],
    reponse: "19",
    explication: "De 871 à 889 : on compte 889 − 871 + 1 = 19 nombres.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Le nombre 1000 correspond à…",
    options: [
      "10 centaines",
      "100 dizaines",
      "1000 unités",
      "Toutes ces réponses sont correctes",
    ],
    reponse: "Toutes ces réponses sont correctes",
    explication:
      "1000 = 10 centaines = 100 dizaines = 1000 unités. Ces trois décompositions sont équivalentes.",
    niveau: "difficile",
  },
];

export default function NumerationCE1() {
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
        desc: "Parfaite maîtrise de la numération jusqu'à 1000 !",
      };
    if (score >= 7)
      return {
        icon: "⭐",
        titre: "Bien joué !",
        desc: "Tu maîtrises bien les nombres jusqu'à 1000.",
      };
    if (score >= 5)
      return {
        icon: "👍",
        titre: "Assez bien !",
        desc: "Continue à t'entraîner sur les centaines et dizaines.",
      };
    return {
      icon: "💪",
      titre: "À revoir !",
      desc: "Relis la leçon sur les centaines, dizaines et unités.",
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
          Primaire › CE1 › Maths › Numération
        </span>
      </div>

      <div className="cours-hero">
        <div className="cours-hero-icon">🔢</div>
        <h1 className="cours-hero-title">La numération jusqu'à 1000</h1>
        <p className="cours-hero-desc">
          Centaines, dizaines, unités — comprendre les grands nombres
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
