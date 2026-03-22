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
  titre: "Les synonymes et les antonymes",
  intro:
    "Les synonymes sont des mots qui ont le même sens. Les antonymes sont des mots qui ont le sens contraire. Les connaître permet de mieux s'exprimer !",
  points: [
    {
      titre: "Les synonymes",
      texte:
        "Deux mots sont synonymes quand ils veulent dire la même chose. On peut les utiliser l'un à la place de l'autre.",
      exemple: "content = joyeux · rapide = vite · beau = joli",
    },
    {
      titre: "Les antonymes",
      texte:
        "Deux mots sont antonymes quand ils ont un sens contraire. L'antonyme est le contraire du mot.",
      exemple: "grand ≠ petit · chaud ≠ froid · jour ≠ nuit",
    },
    {
      titre: "Pourquoi les utiliser ?",
      texte:
        "Utiliser des synonymes enrichit notre façon de parler et d'écrire. Les antonymes nous aident à exprimer des contrastes et des oppositions.",
      exemple:
        "Au lieu de 'il est bien', on peut dire 'il est excellent' ou 'il est formidable'.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le synonyme de 'content' ?",
    options: ["triste", "joyeux", "fâché", "fatigué"],
    reponse: "joyeux",
    explication: "'Content' et 'joyeux' veulent dire la même chose.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est l'antonyme de 'grand' ?",
    options: ["gros", "fort", "petit", "long"],
    reponse: "petit",
    explication: "'Grand' et 'petit' sont des contraires.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel est le synonyme de 'rapide' ?",
    options: ["lent", "vite", "lourd", "calme"],
    reponse: "vite",
    explication: "'Rapide' et 'vite' veulent dire la même chose.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est l'antonyme de 'chaud' ?",
    options: ["tiède", "froid", "brûlant", "doux"],
    reponse: "froid",
    explication: "'Chaud' et 'froid' sont des contraires.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quel est le synonyme de 'beau' ?",
    options: ["laid", "joli", "vieux", "petit"],
    reponse: "joli",
    explication: "'Beau' et 'joli' veulent dire la même chose.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est l'antonyme de 'jour' ?",
    options: ["matin", "soir", "nuit", "midi"],
    reponse: "nuit",
    explication: "'Jour' et 'nuit' sont des contraires.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel mot est synonyme de 'fatigué' ?",
    options: ["reposé", "épuisé", "content", "vif"],
    reponse: "épuisé",
    explication: "'Fatigué' et 'épuisé' veulent dire la même chose.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel est l'antonyme de 'monter' ?",
    options: ["avancer", "courir", "descendre", "sauter"],
    reponse: "descendre",
    explication: "'Monter' et 'descendre' sont des contraires.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Parmi ces mots, lequel est synonyme de 'maison' ?",
    options: ["jardin", "demeure", "rue", "école"],
    reponse: "demeure",
    explication: "'Maison' et 'demeure' veulent dire la même chose.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel est l'antonyme de 'commencer' ?",
    options: ["continuer", "avancer", "terminer", "chercher"],
    reponse: "terminer",
    explication: "'Commencer' et 'terminer' sont des contraires.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "vocabulaire";

export default function VocabulaireCE1() {
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
      if (!scoreSaved.current) {
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
          <span>Français</span>
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
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📚 Vocabulaire · CE1</div>
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
                  🏆 Meilleur <br />{" "}
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
              ? "Tu maîtrises parfaitement les synonymes et antonymes ! 🚀"
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
