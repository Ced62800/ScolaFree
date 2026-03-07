"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le passé simple et le plus-que-parfait",
  intro:
    "En CM2, tu apprends deux nouveaux temps du passé très utilisés dans les récits littéraires : le passé simple et le plus-que-parfait.",
  points: [
    {
      titre: "Le passé simple",
      texte:
        "Le passé simple exprime une action passée, brève et terminée. Il est surtout utilisé à l'écrit dans les récits. Terminaisons des verbes en -er : -ai, -as, -a, -âmes, -âtes, -èrent.",
      exemple:
        "Il mangea une pomme. · Ils partirent à l'aube. · Elle chanta toute la nuit.",
    },
    {
      titre: "Le plus-que-parfait",
      texte:
        "Le plus-que-parfait exprime une action passée qui s'est produite AVANT une autre action passée. Il se forme avec l'auxiliaire être ou avoir à l'imparfait + participe passé.",
      exemple:
        "Il avait mangé avant de partir. · Elle était arrivée quand il téléphona.",
    },
    {
      titre: "L'ordre des événements",
      texte:
        "Plus-que-parfait → passé simple → imparfait/présent. Le plus-que-parfait est le plus ancien des événements.",
      exemple:
        "Quand il arriva (passé simple), elle avait déjà mangé (plus-que-parfait).",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel temps est utilisé : 'Il mangea une pomme' ?",
    options: ["imparfait", "passé composé", "passé simple", "futur"],
    reponse: "passé simple",
    explication:
      "'mangea' est au passé simple — terminaison -a pour les verbes en -er.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Quelle est la terminaison du passé simple pour 'ils' avec un verbe en -er ?",
    options: ["-aient", "-èrent", "-aient", "-ont"],
    reponse: "-èrent",
    explication:
      "Au passé simple, 'ils' prend la terminaison -èrent : ils mangèrent.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Quel temps est utilisé : 'Elle avait déjà mangé quand il arriva' (pour 'avait mangé') ?",
    options: ["imparfait", "passé composé", "passé simple", "plus-que-parfait"],
    reponse: "plus-que-parfait",
    explication:
      "'avait mangé' est au plus-que-parfait — action accomplie avant une autre.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Complète au passé simple : 'Les enfants ___ dans la forêt.' (entrer)",
    options: ["entraient", "sont entrés", "entrèrent", "entrent"],
    reponse: "entrèrent",
    explication: "Au passé simple avec 'ils' : 'entrèrent'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Comment se forme le plus-que-parfait ?",
    options: [
      "avoir/être au présent + participe passé",
      "avoir/être à l'imparfait + participe passé",
      "avoir/être au futur + participe passé",
      "avoir/être au passé simple + participe passé",
    ],
    reponse: "avoir/être à l'imparfait + participe passé",
    explication:
      "Plus-que-parfait = auxiliaire à l'imparfait + participe passé.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Complète au plus-que-parfait : 'Il ___ ses devoirs avant de jouer.' (finir)",
    options: ["a fini", "finissait", "avait fini", "finira"],
    reponse: "avait fini",
    explication:
      "'avait fini' est au plus-que-parfait — action accomplie avant une autre.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est au passé simple ?",
    options: [
      "Il mangeait sa soupe.",
      "Il a mangé sa soupe.",
      "Il mangea sa soupe.",
      "Il mange sa soupe.",
    ],
    reponse: "Il mangea sa soupe.",
    explication: "'mangea' est au passé simple — terminaison -a.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Dans quelle situation utilise-t-on principalement le passé simple ?",
    options: [
      "Dans les conversations.",
      "Dans les textos.",
      "Dans les récits littéraires écrits.",
      "Dans les consignes.",
    ],
    reponse: "Dans les récits littéraires écrits.",
    explication:
      "Le passé simple est surtout utilisé à l'écrit dans les récits.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Quelle action est la plus ancienne dans : 'Quand il arriva, elle avait déjà parti' ?",
    options: [
      "il arriva",
      "elle avait déjà parti",
      "Les deux en même temps",
      "On ne sait pas",
    ],
    reponse: "elle avait déjà parti",
    explication: "Le plus-que-parfait exprime l'action la plus ancienne.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Complète au passé simple : 'Le roi ___ une décision courageuse.' (prendre)",
    options: ["prenait", "a pris", "prit", "prendra"],
    reponse: "prit",
    explication: "Au passé simple, 'prendre' → 'prit' (verbe irrégulier).",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function ConjugaisonCM2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= questions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/francais/primaire/cm2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Conjugaison</span>
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
          <div className="lecon-badge">⏰ Conjugaison · CM2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
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
              ? "Tu maîtrises parfaitement ces temps littéraires !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/francais/primaire/cm2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
