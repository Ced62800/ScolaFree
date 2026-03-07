"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le verbe être au présent",
  intro:
    "Le verbe 'être' est l'un des verbes les plus utilisés en français. Apprenons à le conjuguer au présent !",
  points: [
    {
      titre: "La conjugaison du verbe être",
      texte:
        "Le verbe être change selon la personne. Il faut apprendre toutes les formes par cœur.",
      exemple:
        "je suis · tu es · il/elle est · nous sommes · vous êtes · ils/elles sont",
    },
    {
      titre: "Utilisation du verbe être",
      texte:
        "Le verbe être sert à décrire une personne, un animal ou une chose. Il relie le sujet à un attribut.",
      exemple: "Je suis content. · Le chat est noir. · Nous sommes à l'école.",
    },
    {
      titre: "La négation avec être",
      texte:
        "Pour mettre le verbe être à la forme négative, on encadre le verbe avec 'ne...pas'.",
      exemple:
        "Je ne suis pas triste. · Il n'est pas grand. · Nous ne sommes pas en retard.",
    },
  ],
};

const questions = [
  // Faciles
  {
    id: 1,
    question: "Complète : 'Je ___ content.'",
    options: ["es", "suis", "est", "sommes"],
    reponse: "suis",
    explication: "Avec 'je', le verbe être se conjugue 'suis' : je suis.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Tu ___ mon ami.'",
    options: ["suis", "est", "es", "sont"],
    reponse: "es",
    explication: "Avec 'tu', le verbe être se conjugue 'es' : tu es.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Il ___ grand.'",
    options: ["es", "suis", "sont", "est"],
    reponse: "est",
    explication: "Avec 'il', le verbe être se conjugue 'est' : il est.",
    niveau: "facile",
  },
  // Moyens
  {
    id: 4,
    question: "Complète : 'Nous ___ à l'école.'",
    options: ["êtes", "sont", "sommes", "suis"],
    reponse: "sommes",
    explication:
      "Avec 'nous', le verbe être se conjugue 'sommes' : nous sommes.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complète : 'Vous ___ en retard.'",
    options: ["sommes", "sont", "êtes", "est"],
    reponse: "êtes",
    explication: "Avec 'vous', le verbe être se conjugue 'êtes' : vous êtes.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Ils ___ fatigués.'",
    options: ["est", "êtes", "sommes", "sont"],
    reponse: "sont",
    explication: "Avec 'ils', le verbe être se conjugue 'sont' : ils sont.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est correcte ?",
    options: [
      "Je est heureux.",
      "Tu suis gentil.",
      "Elle est belle.",
      "Nous êtes ici.",
    ],
    reponse: "Elle est belle.",
    explication: "'Elle est belle' est correct : avec 'elle' on utilise 'est'.",
    niveau: "moyen",
  },
  // Difficiles
  {
    id: 8,
    question: "Mets à la forme négative : 'Je suis triste.'",
    options: [
      "Je suis pas triste.",
      "Je ne suis pas triste.",
      "Je ne pas suis triste.",
      "Je suis ne triste pas.",
    ],
    reponse: "Je ne suis pas triste.",
    explication: "La négation encadre le verbe : 'Je ne suis pas triste.'",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'Emma et Léo ___ dans le jardin.'",
    options: ["est", "êtes", "sommes", "sont"],
    reponse: "sont",
    explication: "'Emma et Léo' = ils → le verbe être se conjugue 'sont'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Laquelle de ces phrases contient une erreur ?",
    options: [
      "Je suis à la maison.",
      "Tu es mon ami.",
      "Nous sommes contents.",
      "Ils est partis.",
    ],
    reponse: "Ils est partis.",
    explication: "Avec 'ils', on dit 'sont' et non 'est' : 'Ils sont partis.'",
    niveau: "difficile",
  },
];

export default function ConjugaisonCPEtre() {
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
          onClick={() => router.push("/cours/francais/primaire/cp")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
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
          <div className="niveau-label">
            {niveauLabel(questions[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">⏰ Conjugaison · CP</div>
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
              ? "Tu maîtrises parfaitement le verbe être !"
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
              onClick={() => router.push("/cours/francais/primaire/cp")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
