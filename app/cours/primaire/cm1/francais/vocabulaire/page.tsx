"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les niveaux de langue",
  intro:
    "On ne parle pas de la même façon selon les situations. Il existe trois niveaux de langue : familier, courant et soutenu. Savoir les reconnaître est essentiel pour bien communiquer !",
  points: [
    {
      titre: "Le niveau familier",
      texte:
        "On l'utilise avec ses amis ou sa famille. Il peut contenir des mots d'argot ou des expressions informelles. Il est à éviter à l'écrit scolaire.",
      exemple:
        "C'est trop cool ! · J'ai rien compris. · Il est chelou ce truc.",
    },
    {
      titre: "Le niveau courant",
      texte:
        "C'est le niveau standard, utilisé dans la vie quotidienne, à l'école et au travail. Il est neutre et compréhensible par tous.",
      exemple:
        "C'est très bien ! · Je n'ai pas compris. · Cet objet est bizarre.",
    },
    {
      titre: "Le niveau soutenu",
      texte:
        "On l'utilise à l'écrit soigné, dans les discours officiels ou la littérature. Il emploie un vocabulaire riche et des tournures élaborées.",
      exemple:
        "C'est remarquable ! · Je n'ai point saisi. · Cet objet m'est inconnu.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel niveau de langue est 'C'est trop cool !' ?",
    options: ["soutenu", "courant", "familier", "littéraire"],
    reponse: "familier",
    explication:
      "'trop cool' est une expression familière — on l'utilise avec ses amis.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est le niveau courant de 'J'ai rien mangé' ?",
    options: [
      "J'ai tout mangé.",
      "Je n'ai rien mangé.",
      "Je n'ai point mangé.",
      "Je n'ai guère mangé.",
    ],
    reponse: "Je n'ai rien mangé.",
    explication:
      "'Je n'ai rien mangé' est le niveau courant — avec la négation complète.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Quel niveau de langue convient le mieux pour une rédaction scolaire ?",
    options: ["familier", "courant", "argotique", "vulgaire"],
    reponse: "courant",
    explication:
      "Pour une rédaction scolaire, on utilise le niveau courant (ou soutenu).",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le niveau soutenu de 'Je suis content' ?",
    options: [
      "Je suis trop content.",
      "Je suis heureux.",
      "Je suis ravi.",
      "Je suis hyper content.",
    ],
    reponse: "Je suis ravi.",
    explication:
      "'ravi' est un mot soutenu, plus élaboré que 'content' ou 'heureux'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel mot appartient au niveau familier ?",
    options: ["domicile", "maison", "baraque", "demeure"],
    reponse: "baraque",
    explication: "'baraque' est un mot familier pour dire 'maison'.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel mot appartient au niveau soutenu ?",
    options: ["bagnole", "voiture", "véhicule", "caisse"],
    reponse: "véhicule",
    explication: "'véhicule' est un mot soutenu — plus formel que 'voiture'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Remplace 'bosser' (familier) par son équivalent courant :",
    options: ["travailler", "œuvrer", "boulonner", "glander"],
    reponse: "travailler",
    explication: "'travailler' est le niveau courant de 'bosser' (familier).",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Dans quelle situation utilise-t-on le niveau soutenu ?",
    options: [
      "Avec ses amis.",
      "Dans un texto.",
      "Dans un discours officiel.",
      "En jouant.",
    ],
    reponse: "Dans un discours officiel.",
    explication:
      "Le niveau soutenu est utilisé dans les situations formelles et officielles.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quelle phrase est au niveau soutenu ?",
    options: [
      "C'est super beau !",
      "C'est beau.",
      "C'est magnifique.",
      "C'est trop beau !",
    ],
    reponse: "C'est magnifique.",
    explication:
      "'magnifique' est un adjectif soutenu, plus élaboré que 'beau'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Classe ces mots du plus familier au plus soutenu : 'demeure / baraque / maison'",
    options: [
      "baraque → maison → demeure",
      "maison → baraque → demeure",
      "demeure → maison → baraque",
      "baraque → demeure → maison",
    ],
    reponse: "baraque → maison → demeure",
    explication:
      "'baraque' (familier) → 'maison' (courant) → 'demeure' (soutenu).",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function VocabulaireCM1() {
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
          onClick={() => router.push("/cours/primaire/cm1/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Vocabulaire</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CM1</div>
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
              ? "Tu maîtrises parfaitement les niveaux de langue !"
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
              onClick={() => router.push("/cours/primaire/cm1/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
