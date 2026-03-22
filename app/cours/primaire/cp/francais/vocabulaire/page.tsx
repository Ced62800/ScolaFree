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
  titre: "Les mots et leurs sens",
  intro:
    "Les mots servent à exprimer des idées, des actions ou des choses. Plus on connaît de mots, mieux on peut s'exprimer !",
  points: [
    {
      titre: "Les mots contraires",
      texte:
        "Un mot contraire est un mot qui a le sens opposé. On dit aussi 'antonyme'.",
      exemple: "grand ↔ petit · chaud ↔ froid · jour ↔ nuit",
    },
    {
      titre: "Les mots qui veulent dire la même chose",
      texte:
        "Deux mots peuvent avoir le même sens. On dit qu'ils sont synonymes.",
      exemple: "content = heureux · rapide = vite · beau = joli",
    },
    {
      titre: "Les familles de mots",
      texte:
        "Des mots peuvent appartenir à la même famille s'ils partagent la même racine.",
      exemple: "fleur → fleurir → fleuriste",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le contraire de 'grand' ?",
    options: ["beau", "petit", "rapide", "chaud"],
    reponse: "petit",
    explication: "Le contraire de 'grand' est 'petit'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot est synonyme de 'content' ?",
    options: ["triste", "fatigué", "heureux", "fâché"],
    reponse: "heureux",
    explication: "'content' et 'heureux' veulent dire la même chose.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel est le contraire de 'chaud' ?",
    options: ["grand", "froid", "beau", "lent"],
    reponse: "froid",
    explication: "Le contraire de 'chaud' est 'froid'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel mot appartient à la famille de 'fleur' ?",
    options: ["arbre", "soleil", "fleuriste", "jardin"],
    reponse: "fleuriste",
    explication:
      "'fleuriste' appartient à la famille de 'fleur' car il vient du même mot.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel mot est synonyme de 'rapide' ?",
    options: ["lent", "vite", "grand", "fort"],
    reponse: "vite",
    explication: "'rapide' et 'vite' veulent dire la même chose.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le contraire de 'jour' ?",
    options: ["matin", "soir", "nuit", "midi"],
    reponse: "nuit",
    explication: "Le contraire de 'jour' est 'nuit'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel mot appartient à la famille de 'chat' ?",
    options: ["chaton", "chien", "lapin", "oiseau"],
    reponse: "chaton",
    explication:
      "'chaton' appartient à la famille de 'chat' car il contient la même racine.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel groupe contient uniquement des synonymes ?",
    options: [
      "content / triste",
      "beau / joli",
      "grand / petit",
      "chaud / froid",
    ],
    reponse: "beau / joli",
    explication:
      "'beau' et 'joli' sont synonymes car ils veulent dire la même chose.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quel groupe contient uniquement des contraires ?",
    options: [
      "content / heureux",
      "rapide / vite",
      "jour / nuit",
      "beau / joli",
    ],
    reponse: "jour / nuit",
    explication:
      "'jour' et 'nuit' sont des contraires car they ont des sens opposés.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Parmi ces mots, lequel N'appartient PAS à la famille de 'maison' ?",
    options: ["maisonnette", "maisonner", "maisonnée", "maçon"],
    reponse: "maçon",
    explication:
      "'maçon' ne vient pas de 'maison'. Les autres mots partagent la même racine.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "sens-des-mots";

export default function VocabulaireCPMots() {
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

  const niveauLabel = (niveau: string) => {
    if (niveau === "facile") return "🟢 Facile";
    if (niveau === "moyen") return "🟡 Moyen";
    return "🔴 Difficile";
  };

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
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Vocabulaire</span>
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
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📚 Vocabulaire · CP</div>
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
              ? "Tu maîtrises parfaitement les mots et leurs sens !"
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
