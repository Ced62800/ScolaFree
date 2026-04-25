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
  titre: "L'accord du participe passé",
  intro:
    "Le participe passé s'accorde différemment selon l'auxiliaire utilisé. Avec 'être', il s'accorde avec le sujet. Avec 'avoir', il ne s'accorde pas (sauf cas particulier).",
  points: [
    {
      titre: "Avec l'auxiliaire être",
      texte:
        "Avec 'être', le participe passé s'accorde en genre et en nombre avec le sujet.",
      exemple:
        "Elle est partie. · Ils sont arrivés. · Elles sont tombées. · Il est venu.",
    },
    {
      titre: "Avec l'auxiliaire avoir",
      texte: "Avec 'avoir', le participe passé ne s'accorde PAS avec le sujet.",
      exemple:
        "Elle a mangé. · Ils ont joué. · Elles ont chanté. · Il a couru.",
    },
    {
      titre: "Comment s'y retrouver ?",
      texte:
        "Identifie d'abord l'auxiliaire (être ou avoir). Si c'est 'être', accorde avec le sujet. Si c'est 'avoir', ne change rien.",
      exemple:
        "Les filles sont parties. (être → accord) · Les filles ont mangé. (avoir → pas d'accord)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Elle est ___.' (partir)",
    options: ["parti", "partis", "partie", "parties"],
    reponse: "partie",
    explication: "Auxiliaire être + sujet féminin singulier → 'partie'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Ils sont ___.' (arriver)",
    options: ["arrivé", "arrivée", "arrivés", "arrivées"],
    reponse: "arrivés",
    explication: "Auxiliaire être + sujet masculin pluriel → 'arrivés'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Elle a ___.' (manger)",
    options: ["mangé", "mangée", "mangés", "mangées"],
    reponse: "mangé",
    explication: "Auxiliaire avoir → pas d'accord : 'mangé'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Elles sont ___.' (tomber)",
    options: ["tombé", "tombée", "tombés", "tombées"],
    reponse: "tombées",
    explication: "Auxiliaire être + sujet féminin pluriel → 'tombées'.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quelle phrase est correcte ?",
    options: [
      "Elle a mangée.",
      "Elle a mangé.",
      "Elle est mangé.",
      "Elle est mangée.",
    ],
    reponse: "Elle a mangé.",
    explication: "'manger' utilise 'avoir' → pas d'accord.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Les filles sont ___.' (venir)",
    options: ["venu", "venue", "venus", "venues"],
    reponse: "venues",
    explication: "Auxiliaire être + sujet féminin pluriel → 'venues'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est correcte ?",
    options: [
      "Ils ont joués.",
      "Ils ont jouées.",
      "Ils ont joué.",
      "Ils sont joué.",
    ],
    reponse: "Ils ont joué.",
    explication: "'jouer' utilise 'avoir' → pas d'accord.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Ma sœur est ___.' (naître)",
    options: ["né", "née", "nés", "nées"],
    reponse: "née",
    explication: "Auxiliaire être + sujet féminin singulier → 'née'.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quelle phrase contient une erreur ?",
    options: [
      "Il est parti.",
      "Elle est venue.",
      "Ils ont mangés.",
      "Elles sont tombées.",
    ],
    reponse: "Ils ont mangés.",
    explication: "'manger' utilise 'avoir' → pas d'accord : 'Ils ont mangé'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : 'Les garçons sont ___.' (rentrer)",
    options: ["rentré", "rentrée", "rentrés", "rentrées"],
    reponse: "rentrés",
    explication: "Auxiliaire être + sujet masculin pluriel → 'rentrés'.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "francais";
const THEME = "grammaire-2";

export default function GrammaireCM1Page2() {
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
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire 2</span>
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
          <div className="lecon-badge">📝 Grammaire 2 · CM1</div>
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
              ? "Tu maîtrises l'accord du participe passé ! 🚀"
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
