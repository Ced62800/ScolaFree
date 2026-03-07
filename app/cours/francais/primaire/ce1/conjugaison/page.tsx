"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le présent et le futur",
  intro:
    "En français, on peut parler de ce qui se passe maintenant (présent) ou de ce qui va se passer plus tard (futur). Apprenons à conjuguer les verbes !",
  points: [
    {
      titre: "Le présent",
      texte:
        "Le présent exprime une action qui se passe maintenant ou une vérité générale.",
      exemple: "Je mange une pomme. · Le soleil brille. · Tu joues au ballon.",
    },
    {
      titre: "Le futur",
      texte:
        "Le futur exprime une action qui va se passer plus tard. Les verbes en -er se terminent par -erai, -eras, -era, -erons, -erez, -eront.",
      exemple: "Je mangerai. · Tu joueras. · Il chantera. · Nous danserons.",
    },
    {
      titre: "Comment distinguer présent et futur ?",
      texte:
        "On peut utiliser des mots indicateurs : 'maintenant', 'aujourd'hui' pour le présent, 'demain', 'bientôt' pour le futur.",
      exemple: "Aujourd'hui je joue. · Demain je jouerai.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel verbe est au présent ?",
    options: ["je chanterai", "tu joueras", "il mange", "nous danserons"],
    reponse: "il mange",
    explication: "'il mange' est au présent. Les autres verbes sont au futur.",
  },
  {
    id: 2,
    question: "Quel verbe est au futur ?",
    options: ["je cours", "tu manges", "il chante", "nous jouerons"],
    reponse: "nous jouerons",
    explication:
      "'nous jouerons' est au futur car il se termine par -ons après le radical.",
  },
  {
    id: 3,
    question: "Complète : Demain, je ___ au parc. (jouer)",
    options: ["joue", "jouais", "jouerai", "jouons"],
    reponse: "jouerai",
    explication: "Avec 'demain', on utilise le futur : 'je jouerai'.",
  },
  {
    id: 4,
    question: "Quel mot indique que l'action se passe maintenant ?",
    options: ["demain", "bientôt", "après", "aujourd'hui"],
    reponse: "aujourd'hui",
    explication: "'aujourd'hui' indique le présent.",
  },
  {
    id: 5,
    question: "Complète : Aujourd'hui, tu ___ une chanson. (chanter)",
    options: ["chanteras", "chantes", "chanterai", "chanterez"],
    reponse: "chantes",
    explication: "Avec 'aujourd'hui', on utilise le présent : 'tu chantes'.",
  },
];

export default function ConjugaisonCE1PresentFutur() {
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
          onClick={() => router.push("/cours/francais/primaire/ce1")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE1</span>
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
          <div className="lecon-badge">⏰ Conjugaison · CE1</div>
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
              ? "Tu as tout bon ! Tu maîtrises le présent et le futur."
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
              onClick={() => router.push("/cours/francais/primaire/ce1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
