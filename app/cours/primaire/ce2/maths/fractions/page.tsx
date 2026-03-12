"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les fractions",
  intro:
    "En CE2, on approfondit les fractions. On apprend à lire, écrire, comparer et placer des fractions sur une droite numérique.",
  points: [
    {
      titre: "Numérateur et dénominateur",
      texte:
        "Dans une fraction, le dénominateur (bas) indique en combien de parts égales on a partagé. Le numérateur (haut) indique combien de parts on prend.",
      exemple:
        "3/4 → on a partagé en 4 parts, on en prend 3. On dit « trois quarts ».",
    },
    {
      titre: "Comparer des fractions",
      texte:
        "Si deux fractions ont le même dénominateur, la plus grande est celle avec le plus grand numérateur. Si elles ont le même numérateur, la plus grande est celle avec le plus petit dénominateur.",
      exemple: "3/5 > 2/5 car 3 > 2. | 1/3 > 1/4 car 3 < 4.",
    },
    {
      titre: "Fractions et nombres entiers",
      texte:
        "Quand le numérateur est égal au dénominateur, la fraction vaut 1 entier. Quand le numérateur est plus grand, la fraction vaut plus d'un entier.",
      exemple: "4/4 = 1 entier. 6/4 = 1 entier et 2/4 = 1 et demi.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Dans la fraction 3/5, que représente le 5 ?",
    options: [
      "Le nombre de parts prises",
      "Le nombre total de parts égales",
      "La taille de la part",
      "Le total",
    ],
    reponse: "Le nombre total de parts égales",
    explication: "Le dénominateur (bas) = le nombre total de parts égales.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Comment lit-on la fraction 3/4 ?",
    options: ["Trois quarts", "Quatre tiers", "Trois demis", "Un quart"],
    reponse: "Trois quarts",
    explication: "3/4 se lit « trois quarts » : 3 parts sur 4 parts égales.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle fraction représente la moitié ?",
    options: ["2/4", "1/2", "2/3", "1/4"],
    reponse: "1/2",
    explication: "La moitié s'écrit 1/2 : 1 part sur 2 parts égales.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Laquelle est la plus grande : 3/7 ou 5/7 ?",
    options: ["3/7", "5/7", "Elles sont égales", "On ne peut pas savoir"],
    reponse: "5/7",
    explication:
      "Même dénominateur (7), donc on compare les numérateurs : 5 > 3, donc 5/7 > 3/7.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Laquelle est la plus grande : 1/3 ou 1/5 ?",
    options: ["1/3", "1/5", "Elles sont égales", "On ne peut pas savoir"],
    reponse: "1/3",
    explication:
      "Même numérateur (1), donc on compare les dénominateurs : 3 < 5, donc 1/3 > 1/5.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Que vaut 6/6 ?",
    options: ["0", "1/2", "1 entier", "6 entiers"],
    reponse: "1 entier",
    explication: "Quand numérateur = dénominateur, la fraction vaut 1 entier.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Un gâteau est coupé en 8 parts. Lola mange 3/8. Quelle fraction reste-t-il ?",
    options: ["3/8", "4/8", "5/8", "6/8"],
    reponse: "5/8",
    explication: "8/8 − 3/8 = 5/8 du gâteau reste.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Place ces fractions dans l'ordre croissant : 2/6, 5/6, 1/6, 4/6",
    options: [
      "1/6 – 2/6 – 4/6 – 5/6",
      "5/6 – 4/6 – 2/6 – 1/6",
      "1/6 – 4/6 – 2/6 – 5/6",
      "2/6 – 1/6 – 5/6 – 4/6",
    ],
    reponse: "1/6 – 2/6 – 4/6 – 5/6",
    explication: "Même dénominateur, on range les numérateurs : 1 < 2 < 4 < 5.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Que vaut 9/4 ?",
    options: [
      "Moins d'un entier",
      "Exactement 2 entiers",
      "Plus d'un entier mais moins de 3",
      "Exactement 3 entiers",
    ],
    reponse: "Plus d'un entier mais moins de 3",
    explication: "9/4 = 8/4 + 1/4 = 2 entiers + 1/4. C'est entre 2 et 3.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Tom a mangé 3/5 d'une pizza et Julie a mangé 2/5. Ont-ils mangé toute la pizza ?",
    options: ["Oui", "Non, il en reste", "On ne sait pas", "Il y en a trop"],
    reponse: "Oui",
    explication: "3/5 + 2/5 = 5/5 = 1 entier. Ils ont mangé toute la pizza !",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "fractions";

export default function FractionsCE2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, [etape]);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: CLASSE,
        matiere: MATIERE,
        theme: THEME,
        score: score,
        total: questions.length,
      });
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>{CLASSE.toUpperCase()}</span>
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
          <div className="lecon-badge">🍕 Fractions · CE2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {bestScore && (
              <div
                style={{
                  flex: 1,
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  color: "#4f8ef7",
                }}
              >
                🏆 Meilleur
                <br />
                <strong>
                  {bestScore.score} / {bestScore.total}
                </strong>
              </div>
            )}
            {lastScore && (
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  color: "#aaa",
                }}
              >
                ⏱️ Dernier
                <br />
                <strong style={{ color: "#fff" }}>
                  {lastScore.score} / {lastScore.total}
                </strong>
              </div>
            )}
          </div>

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
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                className={`qcm-option ${selected ? (opt === questions[qIndex].reponse ? "correct" : opt === selected ? "incorrect" : "disabled") : ""}`}
                onClick={() => handleReponse(opt)}
              >
                {opt}
              </button>
            ))}
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
                : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement les fractions !"
              : "Réessaie pour améliorer ton score !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
