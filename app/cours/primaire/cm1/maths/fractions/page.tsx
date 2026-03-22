"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les fractions en CM1",
  intro:
    "En CM1, on approfondit les fractions : fractions équivalentes, fractions et nombres décimaux, et opérations simples sur les fractions.",
  points: [
    {
      titre: "Fractions équivalentes",
      texte:
        "Deux fractions sont équivalentes si elles représentent la même quantité. On peut multiplier ou diviser le numérateur et le dénominateur par le même nombre.",
      exemple: "1/2 = 2/4 = 3/6. 2/3 = 4/6 = 6/9.",
    },
    {
      titre: "Fractions et nombres décimaux",
      texte:
        "Certaines fractions peuvent s'écrire comme des nombres décimaux. Les fractions décimales ont pour dénominateur 10, 100 ou 1000.",
      exemple: "1/10 = 0,1 | 3/10 = 0,3 | 7/100 = 0,07 | 25/100 = 0,25.",
    },
    {
      titre: "Additionner des fractions de même dénominateur",
      texte:
        "Pour additionner deux fractions avec le même dénominateur, on additionne les numérateurs et on garde le dénominateur.",
      exemple: "2/7 + 3/7 = 5/7. 1/5 + 3/5 = 4/5.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle fraction est équivalente à 1/2 ?",
    options: ["2/3", "2/4", "3/4", "1/4"],
    reponse: "2/4",
    explication: "1/2 = 2/4 car on multiplie numérateur et dénominateur par 2.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Que vaut 3/10 en nombre décimal ?",
    options: ["3", "0,3", "0,03", "30"],
    reponse: "0,3",
    explication: "3/10 = 0,3 (3 dixièmes).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "2/6 + 3/6 = ?",
    options: ["5/6", "5/12", "6/6", "1/6"],
    reponse: "5/6",
    explication: "Même dénominateur : 2 + 3 = 5, on garde 6. Résultat : 5/6.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quelle fraction est équivalente à 2/3 ?",
    options: ["3/4", "4/6", "4/9", "3/6"],
    reponse: "4/6",
    explication: "2/3 = 4/6 car on multiplie numérateur et dénominateur par 2.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Que vaut 25/100 en nombre décimal ?",
    options: ["2,5", "0,25", "25", "0,025"],
    reponse: "0,25",
    explication: "25/100 = 0,25 (25 centièmes).",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Laquelle est la plus grande : 3/8 ou 5/8 ?",
    options: ["3/8", "5/8", "Elles sont égales", "On ne peut pas savoir"],
    reponse: "5/8",
    explication: "Même dénominateur (8) : 5 > 3, donc 5/8 > 3/8.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "4/9 + 3/9 = ?",
    options: ["7/9", "7/18", "1/9", "8/9"],
    reponse: "7/9",
    explication: "4 + 3 = 7, on garde 9. Résultat : 7/9.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel nombre décimal correspond à 7/100 ?",
    options: ["0,7", "0,07", "7", "70"],
    reponse: "0,07",
    explication: "7/100 = 0,07 (7 centièmes).",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quelle fraction est équivalente à 3/4 ?",
    options: ["6/10", "6/8", "9/16", "4/5"],
    reponse: "6/8",
    explication: "3/4 = 6/8 car on multiplie numérateur et dénominateur par 2.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Une pizza est coupée en 8 parts. Lola mange 3/8 et Tom mange 3/8. Quelle fraction ont-ils mangée en tout ?",
    options: ["3/8", "6/16", "6/8", "9/8"],
    reponse: "6/8",
    explication: "3/8 + 3/8 = 6/8. Ils ont mangé 6 parts sur 8.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function FractionsCM1() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [session, setSession] = useState(0);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex, session],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questionsActives.length) setEtape("fini");
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
          onClick={() => router.push("/cours/primaire/cm1/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
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
              Question {qIndex + 1} / {questionsActives.length}
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
          <div className="lecon-badge">🍕 Fractions · CM1</div>
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
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
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
            {score} / {questionsActives.length}
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
              onClick={() => router.push("/cours/primaire/cm1/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
