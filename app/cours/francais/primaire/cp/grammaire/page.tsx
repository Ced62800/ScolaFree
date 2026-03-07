"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le nom",
  intro:
    "Le nom est un mot qui désigne une personne, un animal, une chose ou une idée. C'est un mot très important dans la phrase !",
  points: [
    {
      titre: "Le nom commun",
      texte:
        "Le nom commun désigne une chose, un animal ou une personne en général. Il commence par une minuscule.",
      exemple: "chat · maison · enfant · fleur",
    },
    {
      titre: "Le nom propre",
      texte:
        "Le nom propre désigne une personne, un lieu ou un pays en particulier. Il commence toujours par une majuscule.",
      exemple: "Emma · Paris · France · Léo",
    },
    {
      titre: "Le genre du nom",
      texte:
        "Un nom peut être masculin ou féminin. On utilise 'un' ou 'le' pour les noms masculins, 'une' ou 'la' pour les noms féminins.",
      exemple:
        "un chat (masculin) · une chatte (féminin) · le garçon · la fille",
    },
  ],
};

const questions = [
  // Faciles
  {
    id: 1,
    question: "Quel mot est un nom commun ?",
    options: ["chat", "Emma", "Paris", "courir"],
    reponse: "chat",
    explication:
      "'chat' est un nom commun car il désigne un animal en général.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot est un nom propre ?",
    options: ["maison", "fleur", "Paris", "chien"],
    reponse: "Paris",
    explication:
      "'Paris' est un nom propre car il désigne une ville particulière et prend une majuscule.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel déterminant va avec un nom féminin ?",
    options: ["un", "le", "une", "mon"],
    reponse: "une",
    explication:
      "'une' s'utilise avec les noms féminins : une fleur, une maison.",
    niveau: "facile",
  },
  // Moyens
  {
    id: 4,
    question: "Dans 'Le chien de Léo aboie', combien y a-t-il de noms ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication: "Il y a 2 noms : 'chien' (nom commun) et 'Léo' (nom propre).",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel mot N'est PAS un nom ?",
    options: ["maison", "courir", "chat", "fleur"],
    reponse: "courir",
    explication: "'courir' est un verbe, pas un nom.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le genre du nom 'maison' ?",
    options: ["masculin", "féminin", "neutre", "on ne sait pas"],
    reponse: "féminin",
    explication: "'maison' est féminin : on dit 'la maison', 'une maison'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Lequel de ces noms propres est mal écrit ?",
    options: ["France", "emma", "Paris", "Léo"],
    reponse: "emma",
    explication:
      "'emma' est mal écrit car un nom propre commence toujours par une majuscule : Emma.",
    niveau: "moyen",
  },
  // Difficiles
  {
    id: 8,
    question:
      "Dans 'La petite fille mange une pomme', combien y a-t-il de noms communs ?",
    options: ["1", "2", "3", "4"],
    reponse: "2",
    explication:
      "Il y a 2 noms communs : 'fille' et 'pomme'. 'petite' est un adjectif.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quel groupe contient uniquement des noms communs ?",
    options: [
      "chat, Emma, maison",
      "chien, fleur, table",
      "Paris, Lucas, France",
      "petit, grand, beau",
    ],
    reponse: "chien, fleur, table",
    explication: "'chien', 'fleur' et 'table' sont tous des noms communs.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Dans 'Lucas joue avec son ami Paul', quels sont les noms propres ?",
    options: [
      "Lucas seulement",
      "Paul seulement",
      "Lucas et Paul",
      "ami et Lucas",
    ],
    reponse: "Lucas et Paul",
    explication:
      "'Lucas' et 'Paul' sont des noms propres car ce sont des prénoms qui commencent par une majuscule.",
    niveau: "difficile",
  },
];

export default function GrammaireCPNom() {
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
          <span className="breadcrumb-active">Grammaire</span>
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
          <div className="lecon-badge">📝 Grammaire · CP</div>
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
              ? "Tu maîtrises parfaitement le nom !"
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
