"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Géométrie — Symétrie, angles et périmètre",
  intro:
    "En CE2, on explore la géométrie : la symétrie axiale, les angles droits et le périmètre des figures planes.",
  points: [
    {
      titre: "La symétrie axiale",
      texte:
        "Une figure est symétrique par rapport à un axe si, en la repliant le long de cet axe, les deux parties se superposent exactement. L'axe de symétrie est souvent appelé « axe ».",
      exemple:
        "Un papillon, une lettre A ou un cœur ont un axe de symétrie vertical.",
    },
    {
      titre: "Les angles",
      texte:
        "Un angle droit mesure exactement 90°. On le reconnaît avec une équerre. Un angle aigu est plus petit qu'un angle droit. Un angle obtus est plus grand qu'un angle droit.",
      exemple:
        "Le coin d'une feuille de papier = angle droit. Une pointe de tente = angle aigu.",
    },
    {
      titre: "Le périmètre",
      texte:
        "Le périmètre d'une figure, c'est la longueur totale de son contour. Pour le calculer, on additionne la longueur de tous ses côtés.",
      exemple:
        "Carré de côté 5 cm : périmètre = 4 × 5 = 20 cm. Rectangle 6 × 3 : périmètre = 6 + 3 + 6 + 3 = 18 cm.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien de côtés a un rectangle ?",
    options: ["3", "4", "5", "6"],
    reponse: "4",
    explication: "Un rectangle a 4 côtés (2 paires de côtés égaux).",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Un angle droit mesure combien de degrés ?",
    options: ["45°", "60°", "90°", "180°"],
    reponse: "90°",
    explication: "Un angle droit mesure exactement 90°.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "La lettre A a-t-elle un axe de symétrie ?",
    options: ["Oui", "Non"],
    reponse: "Oui",
    explication: "La lettre A a un axe de symétrie vertical au milieu.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel outil utilise-t-on pour vérifier un angle droit ?",
    options: ["La règle", "Le compas", "L'équerre", "Le rapporteur"],
    reponse: "L'équerre",
    explication: "L'équerre sert à tracer et vérifier les angles droits.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel est le périmètre d'un carré de côté 6 cm ?",
    options: ["18 cm", "24 cm", "36 cm", "12 cm"],
    reponse: "24 cm",
    explication: "Périmètre d'un carré = 4 × côté = 4 × 6 = 24 cm.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Un angle aigu est…",
    options: [
      "Plus grand qu'un angle droit",
      "Égal à un angle droit",
      "Plus petit qu'un angle droit",
      "Égal à 180°",
    ],
    reponse: "Plus petit qu'un angle droit",
    explication: "Un angle aigu est inférieur à 90°.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Quel est le périmètre d'un rectangle de longueur 8 cm et de largeur 3 cm ?",
    options: ["11 cm", "22 cm", "24 cm", "16 cm"],
    reponse: "22 cm",
    explication: "Périmètre = 2 × (longueur + largeur) = 2 × (8 + 3) = 22 cm.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Combien d'axes de symétrie a un carré ?",
    options: ["1", "2", "4", "0"],
    reponse: "4",
    explication: "Un carré a 4 axes de symétrie : 2 diagonales et 2 médianes.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Un triangle équilatéral a des côtés de 7 cm chacun. Quel est son périmètre ?",
    options: ["14 cm", "21 cm", "28 cm", "7 cm"],
    reponse: "21 cm",
    explication: "Périmètre = 3 × 7 = 21 cm.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Un angle obtus est…",
    options: [
      "Inférieur à 90°",
      "Égal à 90°",
      "Compris entre 90° et 180°",
      "Égal à 180°",
    ],
    reponse: "Compris entre 90° et 180°",
    explication: "Un angle obtus est supérieur à 90° et inférieur à 180°.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "geometrie";

export default function GeometrieCE2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
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

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, [etape]);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: CLASSE,
        matiere: MATIERE,
        theme: THEME,
        score: score,
        total: questionsActives.length,
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
          <span className="breadcrumb-active">Géométrie</span>
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
          <div className="lecon-badge">📐 Géométrie · CE2</div>
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
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                className={`qcm-option ${selected ? (opt === questionsActives[qIndex].reponse ? "correct" : opt === selected ? "incorrect" : "disabled") : ""}`}
                onClick={() => handleReponse(opt)}
              >
                {opt}
              </button>
            ))}
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
                : "À revoir !"}
          </h2>
          <div className="resultat-score">
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement la géométrie !"
              : "Relis la leçon pour mieux comprendre les périmètres et les angles."}
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
