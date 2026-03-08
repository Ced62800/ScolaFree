"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire (5 questions)
  {
    id: 1,
    question: "Quel mot est un nom commun ?",
    options: ["Paris", "chat", "Emma", "courir"],
    reponse: "chat",
    explication:
      "'chat' est un nom commun car il désigne un animal en général.",
    theme: "grammaire",
  },
  {
    id: 2,
    question: "Quel mot est un nom propre ?",
    options: ["maison", "France", "fleur", "chien"],
    reponse: "France",
    explication:
      "'France' est un nom propre car il désigne un pays particulier.",
    theme: "grammaire",
  },
  {
    id: 3,
    question: "Quel déterminant va avec un nom féminin ?",
    options: ["un", "le", "une", "mon"],
    reponse: "une",
    explication: "'une' s'utilise avec les noms féminins.",
    theme: "grammaire",
  },
  {
    id: 4,
    question: "Quel mot N'est PAS un nom ?",
    options: ["maison", "manger", "chat", "fleur"],
    reponse: "manger",
    explication: "'manger' est un verbe, pas un nom.",
    theme: "grammaire",
  },
  {
    id: 5,
    question: "Quel est le genre du nom 'soleil' ?",
    options: ["féminin", "masculin", "neutre", "on ne sait pas"],
    reponse: "masculin",
    explication: "'soleil' est masculin : on dit 'le soleil'.",
    theme: "grammaire",
  },
  // Conjugaison (5 questions)
  {
    id: 6,
    question: "Complète : 'Je ___ content.'",
    options: ["es", "suis", "est", "sommes"],
    reponse: "suis",
    explication: "Avec 'je', le verbe être se conjugue 'suis'.",
    theme: "conjugaison",
  },
  {
    id: 7,
    question: "Complète : 'Tu ___ mon ami.'",
    options: ["suis", "est", "es", "sont"],
    reponse: "es",
    explication: "Avec 'tu', le verbe être se conjugue 'es'.",
    theme: "conjugaison",
  },
  {
    id: 8,
    question: "Complète : 'Nous ___ à l'école.'",
    options: ["êtes", "sont", "sommes", "suis"],
    reponse: "sommes",
    explication: "Avec 'nous', le verbe être se conjugue 'sommes'.",
    theme: "conjugaison",
  },
  {
    id: 9,
    question: "Complète : 'Ils ___ fatigués.'",
    options: ["est", "êtes", "sommes", "sont"],
    reponse: "sont",
    explication: "Avec 'ils', le verbe être se conjugue 'sont'.",
    theme: "conjugaison",
  },
  {
    id: 10,
    question: "Quelle phrase est correcte ?",
    options: [
      "Je est heureux.",
      "Tu suis gentil.",
      "Elle est belle.",
      "Nous êtes ici.",
    ],
    reponse: "Elle est belle.",
    explication: "'Elle est belle' est correct : avec 'elle' on utilise 'est'.",
    theme: "conjugaison",
  },
  // Orthographe (5 questions)
  {
    id: 11,
    question: "Quel mot contient le son [a] ?",
    options: ["lit", "bus", "chat", "sol"],
    reponse: "chat",
    explication: "'chat' contient le son [a].",
    theme: "orthographe",
  },
  {
    id: 12,
    question: "Quel mot contient le son [o] ?",
    options: ["pain", "bateau", "ami", "lit"],
    reponse: "bateau",
    explication: "'bateau' contient le son [o] écrit 'eau'.",
    theme: "orthographe",
  },
  {
    id: 13,
    question: "Dans le mot 'chat', quelle lettre est muette ?",
    options: ["c", "h", "a", "t"],
    reponse: "t",
    explication: "Dans 'chat', le 't' final ne se prononce pas.",
    theme: "orthographe",
  },
  {
    id: 14,
    question: "Comment s'écrit le son [o] dans 'chapeau' ?",
    options: ["o", "au", "eau", "a"],
    reponse: "eau",
    explication: "Dans 'chapeau', le son [o] s'écrit 'eau'.",
    theme: "orthographe",
  },
  {
    id: 15,
    question: "Dans le mot 'bras', quelle lettre est muette ?",
    options: ["b", "r", "a", "s"],
    reponse: "s",
    explication: "Dans 'bras', le 's' final ne se prononce pas.",
    theme: "orthographe",
  },
  // Vocabulaire (5 questions)
  {
    id: 16,
    question: "Quel est le contraire de 'grand' ?",
    options: ["beau", "petit", "rapide", "chaud"],
    reponse: "petit",
    explication: "Le contraire de 'grand' est 'petit'.",
    theme: "vocabulaire",
  },
  {
    id: 17,
    question: "Quel mot est synonyme de 'content' ?",
    options: ["triste", "fatigué", "heureux", "fâché"],
    reponse: "heureux",
    explication: "'content' et 'heureux' veulent dire la même chose.",
    theme: "vocabulaire",
  },
  {
    id: 18,
    question: "Quel mot appartient à la famille de 'fleur' ?",
    options: ["arbre", "soleil", "fleuriste", "jardin"],
    reponse: "fleuriste",
    explication: "'fleuriste' appartient à la famille de 'fleur'.",
    theme: "vocabulaire",
  },
  {
    id: 19,
    question: "Quel est le contraire de 'chaud' ?",
    options: ["grand", "froid", "beau", "lent"],
    reponse: "froid",
    explication: "Le contraire de 'chaud' est 'froid'.",
    theme: "vocabulaire",
  },
  {
    id: 20,
    question: "Quel mot est synonyme de 'rapide' ?",
    options: ["lent", "vite", "grand", "fort"],
    reponse: "vite",
    explication: "'rapide' et 'vite' veulent dire la même chose.",
    theme: "vocabulaire",
  },
];

const themeLabels: Record<string, string> = {
  grammaire: "📝 Grammaire",
  conjugaison: "⏰ Conjugaison",
  orthographe: "✏️ Orthographe",
  vocabulaire: "📚 Vocabulaire",
};

const themeColors: Record<string, string> = {
  grammaire: "#4f8ef7",
  conjugaison: "#2ec4b6",
  orthographe: "#ffd166",
  vocabulaire: "#ff6b6b",
};

export default function BilanFinalCP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    grammaire: 0,
    conjugaison: 0,
    orthographe: 0,
    vocabulaire: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);

  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );

  const progression = Math.round((qIndex / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
    }
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ grammaire: 0, conjugaison: 0, orthographe: 0, vocabulaire: 0 });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14) return { label: "Bien !", icon: "⭐", color: "#4f8ef7" };
    if (score >= 10)
      return { label: "Assez bien !", icon: "👍", color: "#ffd166" };
    return { label: "À revoir !", icon: "💪", color: "#ff6b6b" };
  };

  const mention = getMention(totalScore);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cp/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CP</div>
          <h1 className="lecon-titre">Bilan Final — CP Français</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes du CP : Grammaire,
            Conjugaison, Orthographe et Vocabulaire.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📝</span>
              <span>5 questions de Grammaire</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>⏰</span>
              <span>5 questions de Conjugaison</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>✏️</span>
              <span>5 questions d'Orthographe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📚</span>
              <span>5 questions de Vocabulaire</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <>
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {qIndex + 1} / {shuffledQuestions.length}
              </span>
              <span
                style={{ color: themeColors[shuffledQuestions[qIndex].theme] }}
              >
                {themeLabels[shuffledQuestions[qIndex].theme]}
              </span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{ width: `${progression}%` }}
              ></div>
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let className = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    className += " correct";
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
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Bravo !"
                      : "Pas tout à fait..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "Voir mon bilan →"
                  : "Question suivante →"}
              </button>
            )}
          </div>
        </>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{mention.icon}</div>
          <h2 className="resultat-titre" style={{ color: mention.color }}>
            {mention.label}
          </h2>
          <div className="resultat-score" style={{ color: mention.color }}>
            {totalScore} / 20
          </div>

          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Détail par thème</h3>
            {Object.entries(scores).map(([theme, score]) => (
              <div key={theme} className="bilan-detail-row">
                <span className="bilan-detail-label">{themeLabels[theme]}</span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{
                      width: `${(score / 5) * 100}%`,
                      backgroundColor: themeColors[theme],
                    }}
                  ></div>
                </div>
                <span className="bilan-detail-score">{score}/5</span>
              </div>
            ))}
          </div>

          <p className="resultat-desc">
            {totalScore >= 18
              ? "Bravo ! Tu es prêt(e) pour le CE1 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau ! Encore un peu de travail sur les thèmes en rouge."
                : totalScore >= 10
                  ? "Tu progresses bien ! Relis les leçons des thèmes où tu as moins de 3/5."
                  : "Courage ! Reprends les leçons et réessaie le bilan."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer le bilan
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
