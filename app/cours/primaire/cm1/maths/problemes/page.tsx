"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Résoudre des problèmes",
  intro:
    "En CM1, on résout des problèmes à plusieurs étapes en utilisant les quatre opérations. L'essentiel est de bien lire, comprendre ce qu'on cherche, et choisir la bonne opération.",
  points: [
    {
      titre: "Les étapes de résolution",
      texte:
        "1. Je lis et je comprends. 2. Je repère les données et ce qu'on cherche. 3. Je choisis l'opération. 4. Je calcule. 5. Je vérifie si c'est logique.",
      exemple: "Total → + · Reste → − · Chacun → × ou ÷",
    },
    {
      titre: "Problèmes à deux étapes",
      texte:
        "Certains problèmes nécessitent deux calculs successifs. Le résultat du premier calcul sert à faire le deuxième.",
      exemple:
        "Tom achète 3 stylos à 1,50 € et 2 cahiers à 2,25 €. Total = (3×1,50) + (2×2,25) = 4,50 + 4,50 = 9 €",
    },
    {
      titre: "Problèmes avec décimaux et fractions",
      texte:
        "En CM1, les problèmes peuvent inclure des prix en euros (décimaux) ou des partages (fractions).",
      exemple:
        "Une bouteille de 1,5 L est partagée en 3. Chaque part = 1,5 ÷ 3 = 0,5 L.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Un livre coûte 8,50 €. Paul en achète 3. Combien paie-t-il ?",
    options: ["24,50 €", "25,00 €", "25,50 €", "26,00 €"],
    reponse: "25,50 €",
    explication: "3 × 8,50 = 25,50 €.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Léa a 50 €. Elle dépense 23,75 €. Combien lui reste-t-il ?",
    options: ["25,25 €", "26,00 €", "26,25 €", "27,00 €"],
    reponse: "26,25 €",
    explication: "50,00 − 23,75 = 26,25 €.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Une classe de 28 élèves est répartie en groupes de 4. Combien de groupes ?",
    options: ["6", "7", "8", "9"],
    reponse: "7",
    explication: "28 ÷ 4 = 7 groupes.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Un train roule à 180 km/h. En 2h30, quelle distance parcourt-il ?",
    options: ["360 km", "400 km", "420 km", "450 km"],
    reponse: "450 km",
    explication: "2h30 = 2,5h. 180 × 2,5 = 450 km.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Tom achète 3 stylos à 1,50 € et 2 cahiers à 2,25 €. Combien dépense-t-il ?",
    options: ["8,50 €", "9,00 €", "9,50 €", "10,00 €"],
    reponse: "9,00 €",
    explication: "3×1,50 = 4,50 € · 2×2,25 = 4,50 € · Total = 9,00 €.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Une bouteille de 1,5 L est partagée en 3 parts égales. Quelle est chaque part ?",
    options: ["0,3 L", "0,5 L", "0,6 L", "0,75 L"],
    reponse: "0,5 L",
    explication: "1,5 ÷ 3 = 0,5 L.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Une école a 245 filles et 318 garçons. Combien d'élèves en tout ?",
    options: ["553", "563", "573", "583"],
    reponse: "563",
    explication: "245 + 318 = 563 élèves.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Un rectangle mesure 12,5 cm de long et 4,5 cm de large. Quel est son périmètre ?",
    options: ["32 cm", "34 cm", "36 cm", "38 cm"],
    reponse: "34 cm",
    explication: "Périmètre = 2 × (12,5 + 4,5) = 2 × 17 = 34 cm.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Paul gagne 120 € par semaine. En 4 semaines, il dépense 345 €. Combien lui reste-t-il ?",
    options: ["125 €", "135 €", "145 €", "155 €"],
    reponse: "135 €",
    explication: "4 × 120 = 480 €. 480 − 345 = 135 €.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Une corde de 7,2 m est coupée en morceaux de 0,9 m. Combien de morceaux obtient-on ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "7,2 ÷ 0,9 = 8 morceaux.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "maths";
const THEME = "problemes";

export default function ProblemesCM1() {
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
          score,
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
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Problèmes</span>
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
          <div className="lecon-badge">🧩 Problèmes · CM1</div>
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
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
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
              ? "Tu es un(e) expert(e) des problèmes ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
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
