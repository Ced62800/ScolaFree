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
  titre: "Formes, lignes et angles",
  intro:
    "La géométrie c'est l'étude des formes et des espaces. En CE1 on apprend à reconnaître les formes géométriques, les types de lignes et les angles droits.",
  points: [
    {
      titre: "Les formes géométriques",
      texte:
        "On reconnaît les formes par leur nombre de côtés et leurs propriétés. Le carré a 4 côtés égaux, le rectangle a 4 côtés (2 paires égales), le triangle a 3 côtés, le cercle n'a pas de côté.",
      exemple:
        "Carré : 4 côtés égaux · Rectangle : 2 côtés longs + 2 côtés courts · Triangle : 3 côtés",
    },
    {
      titre: "Les types de lignes",
      texte:
        "Une ligne droite ne courbe pas. Une ligne courbe est arrondie. Deux lignes parallèles ne se croisent jamais. Deux lignes perpendiculaires forment un angle droit.",
      exemple:
        "Les rails d'un train sont parallèles. Les bords d'une feuille sont perpendiculaires.",
    },
    {
      titre: "L'angle droit",
      texte:
        "Un angle droit ressemble au coin d'une feuille de papier. On peut le vérifier avec l'équerre. Un carré et un rectangle ont 4 angles droits.",
      exemple:
        "Le coin d'une feuille A4 = angle droit · Les carreaux du sol = angles droits",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Combien de côtés a un triangle ?",
    options: ["2", "3", "4", "5"],
    reponse: "3",
    explication: "Un triangle a 3 côtés et 3 sommets.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle forme a 4 côtés tous égaux ?",
    options: ["Rectangle", "Triangle", "Carré", "Cercle"],
    reponse: "Carré",
    explication: "Le carré a 4 côtés égaux et 4 angles droits.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Combien d'angles droits a un rectangle ?",
    options: ["1", "2", "3", "4"],
    reponse: "4",
    explication:
      "Un rectangle a 4 angles droits — comme les coins d'une feuille.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Comment s'appellent deux lignes qui ne se croisent jamais ?",
    options: ["Perpendiculaires", "Croisées", "Parallèles", "Courbes"],
    reponse: "Parallèles",
    explication:
      "Deux lignes parallèles vont dans la même direction et ne se croisent jamais.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quelle forme n'a pas de côté ?",
    options: ["Carré", "Triangle", "Rectangle", "Cercle"],
    reponse: "Cercle",
    explication:
      "Le cercle est une courbe fermée — il n'a pas de côté ni de sommet.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel instrument permet de vérifier un angle droit ?",
    options: ["La règle", "Le compas", "L'équerre", "La calculatrice"],
    reponse: "L'équerre",
    explication:
      "L'équerre est l'outil qui permet de tracer et vérifier les angles droits.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Un rectangle a deux côtés de 5 cm et deux côtés de 3 cm. Quel est son périmètre ?",
    options: ["8 cm", "15 cm", "16 cm", "10 cm"],
    reponse: "16 cm",
    explication: "Périmètre = 5+5+3+3 = 16 cm.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Comment s'appellent deux lignes qui forment un angle droit ?",
    options: ["Parallèles", "Perpendiculaires", "Courbes", "Obliques"],
    reponse: "Perpendiculaires",
    explication:
      "Deux lignes perpendiculaires se croisent en formant un angle droit.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Combien de côtés égaux a un carré de 4 cm de côté ?",
    options: ["1", "2", "3", "4"],
    reponse: "4",
    explication: "Un carré a 4 côtés tous égaux — ici 4 cm chacun.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel est le périmètre d'un carré de 6 cm de côté ?",
    options: ["12 cm", "18 cm", "24 cm", "36 cm"],
    reponse: "24 cm",
    explication: "Périmètre = 4 × 6 = 24 cm.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "geometrie";

export default function GeometrieCE1() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
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
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
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
    setShowPopup(false);
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
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
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
          <span>CE1</span>
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
          <div className="lecon-badge">📐 Géométrie · CE1</div>
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
              ? "Tu maîtrises parfaitement la géométrie ! 🚀"
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
