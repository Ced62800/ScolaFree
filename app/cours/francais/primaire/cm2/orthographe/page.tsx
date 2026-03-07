"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "L'accord du participe passé",
  intro:
    "Le participe passé s'accorde différemment selon qu'il est employé avec l'auxiliaire être ou avoir. C'est une règle importante en français !",
  points: [
    {
      titre: "Avec l'auxiliaire être",
      texte:
        "Quand le participe passé est employé avec être, il s'accorde en genre et en nombre avec le sujet.",
      exemple: "Elle est partie. · Ils sont arrivés. · Elles sont tombées.",
    },
    {
      titre: "Avec l'auxiliaire avoir",
      texte:
        "Quand le participe passé est employé avec avoir, il ne s'accorde pas avec le sujet. Il peut s'accorder avec le COD si celui-ci est placé avant.",
      exemple:
        "Elle a mangé une pomme. (pas d'accord) · La pomme qu'elle a mangée. (accord avec COD)",
    },
    {
      titre: "Les verbes toujours avec être",
      texte:
        "Certains verbes se conjuguent toujours avec être : aller, venir, partir, arriver, naître, mourir, tomber, rester, entrer, sortir...",
      exemple: "Il est allé. · Elle est venue. · Ils sont partis.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Emma est ___ à l'école.' (partir)",
    options: ["parti", "partie", "partis", "parties"],
    reponse: "partie",
    explication:
      "Avec 'être', le participe s'accorde avec le sujet 'Emma' (féminin singulier) → 'partie'.",
  },
  {
    id: 2,
    question: "Complète : 'Les élèves sont ___ en retard.' (arriver)",
    options: ["arrivé", "arrivée", "arrivés", "arrivées"],
    reponse: "arrivés",
    explication:
      "Avec 'être', le participe s'accorde avec 'les élèves' (masculin pluriel) → 'arrivés'.",
  },
  {
    id: 3,
    question: "Complète : 'Elle a ___ une belle chanson.' (chanter)",
    options: ["chanté", "chantée", "chantés", "chantées"],
    reponse: "chanté",
    explication:
      "Avec 'avoir', le participe ne s'accorde pas avec le sujet → 'chanté'.",
  },
  {
    id: 4,
    question: "Quel auxiliaire utilise-t-on avec 'tomber' ?",
    options: ["avoir", "être", "aller", "faire"],
    reponse: "être",
    explication:
      "'tomber' fait partie des verbes qui se conjuguent toujours avec 'être'.",
  },
  {
    id: 5,
    question: "Complète : 'Les filles sont ___ au cinéma.' (aller)",
    options: ["allé", "allée", "allés", "allées"],
    reponse: "allées",
    explication:
      "Avec 'être', le participe s'accorde avec 'les filles' (féminin pluriel) → 'allées'.",
  },
];

export default function OrthographeCM2ParticiPasse() {
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
    if (qIndex + 1 >= questions.length) {
      setEtape("fini");
    } else {
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
          <span className="breadcrumb-active">Orthographe</span>
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
          <div className="lecon-badge">✏️ Orthographe · CM2</div>
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
            {score === questions.length ? "🏆" : score >= 3 ? "⭐" : "💪"}
          </div>
          <h2 className="resultat-titre">
            {score === questions.length
              ? "Parfait !"
              : score >= 3
                ? "Bien joué !"
                : "Continue comme ça !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <p className="resultat-desc">
            {score === questions.length
              ? "Tu as tout bon ! Tu maîtrises l'accord du participe passé."
              : score >= 3
                ? "Tu as bien compris l'essentiel."
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
