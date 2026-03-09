"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les nombres jusqu'à 1000",
  intro:
    "En CE1, on apprend à lire, écrire et comprendre les nombres jusqu'à 1000. Un nombre est composé de centaines, de dizaines et d'unités.",
  points: [
    {
      titre: "Les unités, dizaines et centaines",
      texte:
        "Un nombre à trois chiffres se décompose en centaines, dizaines et unités. Le chiffre des centaines est le plus à gauche, celui des unités est le plus à droite.",
      exemple: "243 = 2 centaines + 4 dizaines + 3 unités. 100 = 1 centaine.",
    },
    {
      titre: "Lire et écrire les nombres jusqu'à 1000",
      texte:
        "On lit les centaines d'abord, puis les dizaines, puis les unités. 100 se dit « cent », 200 se dit « deux cents », etc.",
      exemple: "537 → « cinq cent trente-sept ». 804 → « huit cent quatre ».",
    },
    {
      titre: "Comparer et ranger les nombres",
      texte:
        "Pour comparer deux nombres, on regarde d'abord les centaines, puis les dizaines, puis les unités.",
      exemple:
        "482 > 389 car 4 centaines > 3 centaines. 215 < 251 car 1 dizaine < 5 dizaines.",
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
      "Quatre cent → 4 centaines. Vingt-six → 2 dizaines et 6 unités. On écrit 426.",
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
      "Ordre croissant = du plus petit au plus grand. On compare d'abord les centaines.",
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

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function NumerationCE1() {
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
          <span className="breadcrumb-active">Numération</span>
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
          <div className="lecon-badge">🔢 Numération · CE1</div>
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
              ? "Tu maîtrises parfaitement les nombres jusqu'à 1000 !"
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
