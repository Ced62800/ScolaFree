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
  titre: "Les formes géométriques",
  intro:
    "Les formes géométriques sont partout autour de nous ! En CP, on apprend à reconnaître et nommer les principales formes planes.",
  points: [
    {
      titre: "Le carré et le rectangle",
      texte:
        "Le carré a 4 côtés égaux et 4 angles droits. Le rectangle a 4 angles droits mais ses côtés ne sont pas tous égaux — il a 2 grands côtés et 2 petits côtés.",
      exemple: "Une feuille de papier = rectangle · Un carreau de sol = carré",
    },
    {
      titre: "Le triangle et le cercle",
      texte:
        "Le triangle a 3 côtés et 3 angles. Le cercle est une forme ronde sans côté ni angle.",
      exemple: "Une pizza = cercle · Un toit de maison = triangle",
    },
    {
      titre: "Reconnaître les formes",
      texte:
        "Pour reconnaître une forme, on compte ses côtés et ses angles. 3 côtés = triangle, 4 côtés égaux = carré, 4 côtés inégaux = rectangle, 0 côté = cercle.",
      exemple:
        "Une roue de vélo → cercle · Une ardoise → rectangle · Un panneau attention → triangle",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien de côtés a un triangle ?",
    options: ["2", "4", "3", "5"],
    reponse: "3",
    explication: "Un triangle a 3 côtés et 3 angles.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle forme a 4 côtés égaux ?",
    options: ["Triangle", "Cercle", "Rectangle", "Carré"],
    reponse: "Carré",
    explication: "Le carré a 4 côtés tous égaux.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien de côtés a un cercle ?",
    options: ["1", "0", "2", "4"],
    reponse: "0",
    explication: "Le cercle n'a pas de côté, c'est une forme ronde.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quelle forme ressemble à une roue de vélo ?",
    options: ["Carré", "Triangle", "Cercle", "Rectangle"],
    reponse: "Cercle",
    explication: "Une roue est ronde = cercle.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quelle est la différence entre un carré et un rectangle ?",
    options: [
      "Le carré a 3 côtés",
      "Le carré a tous ses côtés égaux",
      "Le rectangle a des côtés égaux",
      "Il n'y a pas de différence",
    ],
    reponse: "Le carré a tous ses côtés égaux",
    explication:
      "Le carré a 4 côtés égaux. Le rectangle a 2 grands et 2 petits côtés.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Combien d'angles a un rectangle ?",
    options: ["2", "3", "4", "6"],
    reponse: "4",
    explication: "Le rectangle a 4 angles droits.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle forme a 3 angles ?",
    options: ["Carré", "Cercle", "Triangle", "Rectangle"],
    reponse: "Triangle",
    explication: "Le triangle a 3 côtés et 3 angles.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Un panneau de signalisation 'Attention' a quelle forme ?",
    options: ["Carré", "Cercle", "Rectangle", "Triangle"],
    reponse: "Triangle",
    explication: "Les panneaux d'avertissement ont une forme triangulaire.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quelle affirmation est VRAIE sur le carré ?",
    options: [
      "Il a 3 côtés",
      "Il a 0 angle",
      "Il a 4 côtés égaux et 4 angles droits",
      "Il est rond",
    ],
    reponse: "Il a 4 côtés égaux et 4 angles droits",
    explication: "Le carré a bien 4 côtés égaux et 4 angles droits.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Une feuille de papier A4 a quelle forme ?",
    options: ["Carré", "Triangle", "Cercle", "Rectangle"],
    reponse: "Rectangle",
    explication:
      "Une feuille A4 a 4 angles droits mais les côtés ne sont pas tous égaux → rectangle.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "geometrie";

export default function GeometrieCP() {
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
  }, []);

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

      const [best, last] = await Promise.all([
        getBestScore(CLASSE, MATIERE, THEME),
        getLastScore(CLASSE, MATIERE, THEME),
      ]);
      setBestScore(best);
      setLastScore(last);
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
          <span>CP</span>
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
          <div className="lecon-badge">📐 Géométrie · CP</div>
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
              ? "Tu maîtrises parfaitement les formes géométriques !"
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
