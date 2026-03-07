"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le passé composé",
  intro:
    "Le passé composé sert à parler d'une action qui s'est passée et qui est terminée. On le forme avec l'auxiliaire 'avoir' ou 'être' et le participe passé du verbe.",
  points: [
    {
      titre: "Formation avec 'avoir'",
      texte:
        "La plupart des verbes utilisent l'auxiliaire 'avoir' au présent + le participe passé.",
      exemple: "j'ai mangé · tu as joué · il a couru · nous avons chanté",
    },
    {
      titre: "Formation avec 'être'",
      texte:
        "Certains verbes utilisent l'auxiliaire 'être' : aller, venir, partir, arriver, tomber...",
      exemple:
        "je suis allé(e) · tu es venu(e) · il est parti · elle est arrivée",
    },
    {
      titre: "Le participe passé",
      texte:
        "Pour les verbes en -er, le participe passé se termine par -é. Pour les verbes en -ir, il se termine souvent par -i.",
      exemple: "manger → mangé · jouer → joué · finir → fini · partir → parti",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel verbe est au passé composé ?",
    options: ["je mange", "je mangerai", "j'ai mangé", "je mangeais"],
    reponse: "j'ai mangé",
    explication:
      "'j'ai mangé' est au passé composé : auxiliaire 'avoir' + participe passé 'mangé'.",
  },
  {
    id: 2,
    question: "Quel est le participe passé de 'jouer' ?",
    options: ["joue", "jouait", "jouera", "joué"],
    reponse: "joué",
    explication:
      "Le participe passé de 'jouer' est 'joué' (verbe en -er → participe en -é).",
  },
  {
    id: 3,
    question: "Complète : 'Hier, Emma ___ à l'école.' (aller)",
    options: ["a allé", "est allée", "va", "allait"],
    reponse: "est allée",
    explication:
      "'aller' se conjugue avec 'être' au passé composé : 'est allée'.",
  },
  {
    id: 4,
    question: "Quel auxiliaire utilise-t-on pour 'partir' au passé composé ?",
    options: ["avoir", "être", "aller", "faire"],
    reponse: "être",
    explication:
      "'partir' est un verbe qui se conjugue avec 'être' : 'il est parti'.",
  },
  {
    id: 5,
    question: "Complète : 'Nous ___ une belle chanson.' (chanter)",
    options: ["avons chanté", "sommes chanté", "ont chanté", "avez chanté"],
    reponse: "avons chanté",
    explication:
      "'chanter' utilise l'auxiliaire 'avoir' : 'nous avons chanté'.",
  },
];

export default function ConjugaisonCE2PasseCompose() {
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
          onClick={() => router.push("/cours/francais/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
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
          <div className="lecon-badge">⏰ Conjugaison · CE2</div>
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
              ? "Tu as tout bon ! Tu maîtrises le passé composé."
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
              onClick={() => router.push("/cours/francais/primaire/ce2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
