"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire (5)
  {
    id: 1,
    question: "Quelle phrase est une phrase SIMPLE ?",
    options: [
      "Je crois qu'il viendra.",
      "Il pleut et je reste.",
      "Le chat dort sur le tapis.",
      "Elle part quand elle veut.",
    ],
    reponse: "Le chat dort sur le tapis.",
    explication: "Un seul verbe conjugué → phrase simple.",
    theme: "grammaire",
  },
  {
    id: 2,
    question:
      "Quel mot introduit la subordonnée dans : 'Je sais que tu viendras' ?",
    options: ["Je", "sais", "que", "viendras"],
    reponse: "que",
    explication: "'que' est la conjonction de subordination.",
    theme: "grammaire",
  },
  {
    id: 3,
    question:
      "Quelle est la proposition principale dans : 'Je pense que tu as raison' ?",
    options: ["que tu as raison", "tu as raison", "Je pense", "raison"],
    reponse: "Je pense",
    explication: "'Je pense' est la principale — elle peut exister seule.",
    theme: "grammaire",
  },
  {
    id: 4,
    question: "Quel subordonnant introduit une cause ?",
    options: ["quand", "si", "parce que", "que"],
    reponse: "parce que",
    explication: "'parce que' introduit une subordonnée de cause.",
    theme: "grammaire",
  },
  {
    id: 5,
    question: "Quelle phrase est complexe par JUXTAPOSITION ?",
    options: [
      "Il pleut et je reste.",
      "Il pleut, je reste.",
      "Il pleut parce que c'est l'automne.",
      "Il pleut donc je prends mon parapluie.",
    ],
    reponse: "Il pleut, je reste.",
    explication: "Reliées par une virgule = juxtaposition.",
    theme: "grammaire",
  },
  // Conjugaison (5)
  {
    id: 6,
    question: "Quel temps est utilisé : 'Il mangea une pomme' ?",
    options: ["imparfait", "passé composé", "passé simple", "futur"],
    reponse: "passé simple",
    explication: "'mangea' = passé simple.",
    theme: "conjugaison",
  },
  {
    id: 7,
    question:
      "Quel temps est utilisé pour 'avait mangé' dans : 'Elle avait déjà mangé quand il arriva' ?",
    options: ["imparfait", "passé composé", "passé simple", "plus-que-parfait"],
    reponse: "plus-que-parfait",
    explication: "'avait mangé' = plus-que-parfait.",
    theme: "conjugaison",
  },
  {
    id: 8,
    question:
      "Complète au passé simple : 'Les enfants ___ dans la forêt.' (entrer)",
    options: ["entraient", "sont entrés", "entrèrent", "entrent"],
    reponse: "entrèrent",
    explication: "Passé simple avec 'ils' : 'entrèrent'.",
    theme: "conjugaison",
  },
  {
    id: 9,
    question: "Comment se forme le plus-que-parfait ?",
    options: [
      "avoir/être au présent + participe passé",
      "avoir/être à l'imparfait + participe passé",
      "avoir/être au futur + participe passé",
      "avoir/être au passé simple + participe passé",
    ],
    reponse: "avoir/être à l'imparfait + participe passé",
    explication: "Auxiliaire à l'imparfait + participe passé.",
    theme: "conjugaison",
  },
  {
    id: 10,
    question: "Complète au passé simple : 'Le roi ___ une décision.' (prendre)",
    options: ["prenait", "a pris", "prit", "prendra"],
    reponse: "prit",
    explication: "Passé simple irrégulier de 'prendre' = 'prit'.",
    theme: "conjugaison",
  },
  // Orthographe (5)
  {
    id: 11,
    question: "Quelle phrase est correcte ?",
    options: [
      "Elle est parti.",
      "Elle est partie.",
      "Elle est partis.",
      "Elle est parties.",
    ],
    reponse: "Elle est partie.",
    explication: "Sujet féminin singulier → 'partie'.",
    theme: "orthographe",
  },
  {
    id: 12,
    question: "Quelle phrase est correcte avec 'avoir' ?",
    options: [
      "Elle a mangés une pomme.",
      "Elle a mangée une pomme.",
      "Elle a mangé une pomme.",
      "Elle a mangé une pommes.",
    ],
    reponse: "Elle a mangé une pomme.",
    explication: "Avec 'avoir', pas d'accord quand le COD est après.",
    theme: "orthographe",
  },
  {
    id: 13,
    question: "Complète : 'Les lettres qu'il a ___.' (écrire)",
    options: ["écrit", "écrits", "écrite", "écrites"],
    reponse: "écrites",
    explication: "'que' = 'lettres' (féminin pluriel) placé avant → 'écrites'.",
    theme: "orthographe",
  },
  {
    id: 14,
    question: "Quelle phrase est correcte ?",
    options: [
      "Nous avons mangés.",
      "Nous avons mangé.",
      "Nous avons mangée.",
      "Nous avons mangées.",
    ],
    reponse: "Nous avons mangé.",
    explication: "Avec 'avoir', pas d'accord avec le sujet.",
    theme: "orthographe",
  },
  {
    id: 15,
    question: "Complète : 'Les livres qu'ils ont ___.' (lire)",
    options: ["lu", "lus", "lue", "lues"],
    reponse: "lus",
    explication: "'que' = 'livres' (masculin pluriel) placé avant → 'lus'.",
    theme: "orthographe",
  },
  // Vocabulaire (5)
  {
    id: 16,
    question:
      "Quelle figure de style est utilisée : 'Il court comme le vent' ?",
    options: ["métaphore", "personnification", "comparaison", "exagération"],
    reponse: "comparaison",
    explication: "'comme' = mot outil de la comparaison.",
    theme: "vocabulaire",
  },
  {
    id: 17,
    question:
      "Quelle figure de style est utilisée : 'Le vent hurle dans la nuit' ?",
    options: ["comparaison", "métaphore", "personnification", "répétition"],
    reponse: "personnification",
    explication: "'hurle' est une action humaine attribuée au vent.",
    theme: "vocabulaire",
  },
  {
    id: 18,
    question:
      "Quelle figure de style est utilisée : 'Ses yeux sont des étoiles' ?",
    options: ["comparaison", "métaphore", "personnification", "répétition"],
    reponse: "métaphore",
    explication: "Pas de mot outil — affirmation directe → métaphore.",
    theme: "vocabulaire",
  },
  {
    id: 19,
    question: "Quelle phrase contient une MÉTAPHORE ?",
    options: [
      "Il est agile comme un chat.",
      "Le soleil se lève tôt.",
      "Sa voix est du miel.",
      "Les oiseaux chantent.",
    ],
    reponse: "Sa voix est du miel.",
    explication: "Pas de mot outil → métaphore.",
    theme: "vocabulaire",
  },
  {
    id: 20,
    question:
      "Dans 'Les arbres tendent leurs bras vers le ciel', quelle figure de style est utilisée ?",
    options: ["comparaison", "métaphore", "personnification", "exagération"],
    reponse: "personnification",
    explication: "'tendent leurs bras' = action humaine attribuée aux arbres.",
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

export default function BilanFinalCM2() {
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
    if (qIndex + 1 >= shuffledQuestions.length) setEtape("fini");
    else {
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
          onClick={() => router.push("/cours/primaire/cm2/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>
      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM2</div>
          <h1 className="lecon-titre">Bilan Final — CM2 Français</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes du CM2 : Grammaire,
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
              ? "Bravo ! Tu es prêt(e) pour le collège ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Courage ! Reprends les leçons et réessaie."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cm2/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
