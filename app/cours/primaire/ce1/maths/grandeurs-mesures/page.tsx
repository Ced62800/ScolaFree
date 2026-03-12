"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
        "On mesure les longueurs avec des mètres (m), des décimètres (dm) ou des centimètres (cm). 1 mètre = 10 décimètres = 100 centimètres.",
      exemple: "Un crayon mesure environ 15 cm. Une porte mesure environ 2 m.",
    },
    {
      titre: "Les masses : kg et g",
      texte:
        "On mesure les masses avec des kilogrammes (kg) et des grammes (g). 1 kg = 1 000 g.",
      exemple: "Un livre pèse environ 300 g. Un sac de farine pèse 1 kg.",
    },
    {
      titre: "Les durées : h, min, s",
      texte:
        "On mesure le temps en heures (h), minutes (min) et secondes (s). 1 heure = 60 minutes. 1 minute = 60 secondes.",
      exemple: "Une récréation dure 15 min. Un film dure environ 1h30.",
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
    explication: "Une règle d'école classique mesure 30 cm.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "L'école commence à 8h30 et finit à 11h30. Combien de temps dure la matinée ?",
    options: ["2h", "2h30", "3h", "3h30"],
    reponse: "3h",
    explication: "De 8h30 à 11h30, il s'écoule exactement 3 heures.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "150 cm, c'est la même chose que…",
    options: ["15 m", "1 m 50 cm", "1 m 5 cm", "15 dm"],
    reponse: "1 m 50 cm",
    explication: "100 cm = 1 m, il reste 50 cm. Donc 1 m 50 cm.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Lequel est le plus lourd ?",
    options: ["500 g", "1 kg", "800 g", "0,5 kg"],
    reponse: "1 kg",
    explication: "1 kg = 1 000 g. C'est plus lourd que 500 g ou 800 g.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Un film dure 1 h 45 min. En minutes, cela fait…",
    options: ["100 min", "105 min", "145 min", "115 min"],
    reponse: "105 min",
    explication: "1 h = 60 min. On ajoute 45 min : 60 + 45 = 105 minutes.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Lucas mesure 1 m 32 cm et son frère mesure 128 cm. Qui est le plus grand ?",
    options: ["Lucas", "Son frère", "Même taille", "Inconnu"],
    reponse: "Lucas",
    explication: "Lucas fait 132 cm. 132 > 128, donc Lucas est le plus grand.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "grandeurs-mesures";

export default function GrandeursMesuresCE1() {
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
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: score,
          total: questions.length,
        });
        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Mesures</span>
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
          <div className="lecon-badge">📏 Maths · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Record <br />{" "}
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
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier <br />{" "}
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}

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
                    : "Oups..."}
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
              ? "Expert en mesures !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Pas mal !"
                  : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu connais parfaitement les unités de mesure !"
              : score >= 7
                ? "Tu as bien compris comment mesurer."
                : score >= 5
                  ? "Encore un peu d'entraînement !"
                  : "Relis bien les points de la leçon."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Réessayer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Autres thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
