"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les nombres jusqu'à 10 000",
  intro:
    "En CE2, on apprend à lire, écrire et comprendre les nombres jusqu'à 10 000. Un nombre peut avoir des milliers, des centaines, des dizaines et des unités.",
  points: [
    {
      titre: "Les milliers",
      texte:
        "Un nombre à 4 chiffres se décompose en milliers, centaines, dizaines et unités. 1 millier = 10 centaines = 100 dizaines = 1 000 unités.",
      exemple: "3 542 = 3 milliers + 5 centaines + 4 dizaines + 2 unités.",
    },
    {
      titre: "Lire et écrire les grands nombres",
      texte:
        "On lit d'abord les milliers, puis les centaines, puis les dizaines, puis les unités. On peut écrire un espace entre les milliers et les centaines.",
      exemple:
        "7 308 → « sept mille trois cent huit ». 5 000 → « cinq mille ».",
    },
    {
      titre: "Comparer et ranger",
      texte:
        "Pour comparer, on regarde d'abord les milliers, puis les centaines, etc. Un nombre avec plus de milliers est toujours plus grand.",
      exemple: "4 521 > 3 999 car 4 milliers > 3 milliers.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien y a-t-il de milliers dans 5 000 ?",
    options: ["5", "50", "500", "5 000"],
    reponse: "5",
    explication: "5 000 = 5 milliers.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Comment s'écrit « quatre mille deux cent trente-six » ?",
    options: ["4 326", "4 236", "4 263", "4 362"],
    reponse: "4 236",
    explication:
      "Quatre mille → 4 000, deux cent → 200, trente-six → 36. Total : 4 236.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 3 999 ?",
    options: ["3 998", "4 000", "3 990", "4 001"],
    reponse: "4 000",
    explication: "Après 3 999 vient 4 000 — on passe au millier suivant.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le chiffre des milliers dans 7 485 ?",
    options: ["4", "5", "7", "8"],
    reponse: "7",
    explication: "7 485 = 7 milliers + 4 centaines + 8 dizaines + 5 unités.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel de ces nombres est le plus grand ?",
    options: ["3 999", "4 001", "3 998", "4 000"],
    reponse: "4 001",
    explication:
      "4 001 a 4 milliers, les autres n'en ont que 3. Donc 4 001 est le plus grand.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Comment décompose-t-on 6 050 ?",
    options: [
      "6 milliers + 5 dizaines",
      "6 milliers + 50 unités",
      "6 milliers + 0 centaines + 5 dizaines + 0 unités",
      "60 centaines + 5 unités",
    ],
    reponse: "6 milliers + 0 centaines + 5 dizaines + 0 unités",
    explication: "6 050 = 6 milliers + 0 centaines + 5 dizaines + 0 unités.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Classe dans l'ordre croissant : 2 315, 2 135, 2 531, 2 153",
    options: [
      "2 135 – 2 153 – 2 315 – 2 531",
      "2 531 – 2 315 – 2 153 – 2 135",
      "2 135 – 2 315 – 2 153 – 2 531",
      "2 153 – 2 135 – 2 531 – 2 315",
    ],
    reponse: "2 135 – 2 153 – 2 315 – 2 531",
    explication:
      "Tous ont 2 milliers, on compare les centaines : 1 < 1 < 3 < 5, puis les dizaines.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Quel nombre est égal à 8 milliers + 4 centaines + 0 dizaines + 7 unités ?",
    options: ["8 047", "8 407", "8 470", "8 740"],
    reponse: "8 407",
    explication: "8 000 + 400 + 0 + 7 = 8 407.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Combien y a-t-il de centaines dans 10 000 ?",
    options: ["10", "100", "1 000", "10 000"],
    reponse: "100",
    explication:
      "10 000 = 100 centaines (car 1 millier = 10 centaines, donc 10 milliers = 100 centaines).",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Entre 9 990 et 10 000, combien y a-t-il de nombres entiers (sans les compter) ?",
    options: ["8", "9", "10", "11"],
    reponse: "9",
    explication: "De 9 991 à 9 999 : 9 999 − 9 991 + 1 = 9 nombres.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) =>
  n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

export default function NumerationCE2() {
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
          onClick={() => router.push("/cours/primaire/ce2/maths")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
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
          <div className="lecon-badge">🔢 Numération · CE2</div>
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
              ? "Tu maîtrises parfaitement les nombres jusqu'à 10 000 !"
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
              onClick={() => router.push("/cours/primaire/ce2/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
