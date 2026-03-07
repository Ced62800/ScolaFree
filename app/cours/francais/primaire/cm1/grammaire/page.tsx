"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les classes de mots",
  intro:
    "En français, chaque mot appartient à une classe grammaticale. Reconnaître la classe d'un mot permet de mieux comprendre la phrase et de mieux l'écrire !",
  points: [
    {
      titre: "Le nom, le déterminant et l'adjectif",
      texte:
        "Le nom désigne une personne, un animal ou une chose. Le déterminant accompagne le nom (le, la, un, une, mon...). L'adjectif qualifie le nom.",
      exemple:
        "le petit chien → 'chien' = nom, 'le' = déterminant, 'petit' = adjectif",
    },
    {
      titre: "Le verbe et le pronom",
      texte:
        "Le verbe exprime une action ou un état. Le pronom remplace un nom déjà mentionné (je, tu, il, elle, nous, vous, ils, elles, le, la, lui...).",
      exemple: "Emma chante. → Elle chante. ('Elle' remplace 'Emma')",
    },
    {
      titre: "Les mots invariables",
      texte:
        "Certains mots ne changent jamais : les prépositions (à, de, dans, sur...) et les conjonctions (et, mais, ou, donc, car...).",
      exemple: "Le chat est sur le tapis. · Je veux du pain et du lait.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est la classe du mot 'chien' dans 'Le chien court' ?",
    options: ["verbe", "adjectif", "nom", "déterminant"],
    reponse: "nom",
    explication: "'chien' est un nom — il désigne un animal.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quelle est la classe du mot 'court' dans 'Le chien court' ?",
    options: ["nom", "adjectif", "déterminant", "verbe"],
    reponse: "verbe",
    explication: "'court' est un verbe — il exprime l'action du chien.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle est la classe du mot 'le' dans 'Le chien court' ?",
    options: ["nom", "déterminant", "adjectif", "pronom"],
    reponse: "déterminant",
    explication: "'le' est un déterminant — il accompagne le nom 'chien'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quelle est la classe du mot 'grand' dans 'un grand arbre' ?",
    options: ["nom", "verbe", "adjectif", "déterminant"],
    reponse: "adjectif",
    explication: "'grand' est un adjectif — il qualifie le nom 'arbre'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Dans 'Elle chante', quel est le pronom ?",
    options: ["chante", "Elle", "chant", "e"],
    reponse: "Elle",
    explication: "'Elle' est un pronom personnel — il remplace un nom.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel mot est un déterminant ?",
    options: ["mange", "beau", "mon", "vite"],
    reponse: "mon",
    explication: "'mon' est un déterminant possessif — il accompagne un nom.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Quelle est la classe du mot 'sur' dans 'Le livre est sur la table' ?",
    options: ["nom", "verbe", "adjectif", "préposition"],
    reponse: "préposition",
    explication:
      "'sur' est une préposition — c'est un mot invariable qui indique le lieu.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Dans 'Les belles fleurs parfument le jardin', combien y a-t-il d'adjectifs ?",
    options: ["0", "1", "2", "3"],
    reponse: "1",
    explication: "Il y a 1 adjectif : 'belles' — il qualifie 'fleurs'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Quelle est la classe du mot 'mais' dans 'Je veux partir mais il pleut' ?",
    options: ["préposition", "adjectif", "conjonction", "pronom"],
    reponse: "conjonction",
    explication:
      "'mais' est une conjonction de coordination — elle relie deux propositions.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Dans 'Paul les voit tous les jours', quel mot est un pronom ?",
    options: ["Paul", "les", "jours", "tous"],
    reponse: "les",
    explication:
      "'les' est un pronom personnel complément — il remplace des personnes ou des choses.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function GrammaireCM1() {
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
          onClick={() => router.push("/cours/francais/primaire/cm1")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM1</span>
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
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📝 Grammaire · CM1</div>
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
              ? "Tu maîtrises parfaitement les classes de mots !"
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
              onClick={() => router.push("/cours/francais/primaire/cm1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
