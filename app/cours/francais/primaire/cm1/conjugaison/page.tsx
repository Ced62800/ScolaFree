"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le passé composé",
  intro:
    "Le passé composé sert à exprimer une action terminée dans le passé. On le forme avec l'auxiliaire 'avoir' ou 'être' au présent + le participe passé du verbe.",
  points: [
    {
      titre: "Formation avec 'avoir'",
      texte:
        "La plupart des verbes utilisent 'avoir' comme auxiliaire. Le participe passé ne s'accorde pas avec le sujet.",
      exemple: "J'ai mangé. · Tu as couru. · Il a fini. · Nous avons joué.",
    },
    {
      titre: "Formation avec 'être'",
      texte:
        "Les verbes de mouvement et les verbes pronominaux utilisent 'être'. Le participe passé s'accorde avec le sujet.",
      exemple:
        "Je suis allé(e). · Elle est partie. · Ils sont arrivés. · Nous nous sommes levés.",
    },
    {
      titre: "Passé composé vs imparfait",
      texte:
        "Le passé composé exprime une action ponctuelle et terminée. L'imparfait exprime une habitude ou une action qui durait.",
      exemple:
        "Hier, j'ai mangé une pizza. (ponctuel) · Avant, je mangeais des pizzas. (habitude)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Quel auxiliaire utilise-t-on pour former le passé composé de 'manger' ?",
    options: ["être", "avoir", "aller", "faire"],
    reponse: "avoir",
    explication:
      "'manger' se conjugue avec 'avoir' au passé composé : j'ai mangé.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète au passé composé : 'Elle ___ à l'école.' (aller)",
    options: ["a allé", "est allée", "a allée", "est allé"],
    reponse: "est allée",
    explication: "'aller' se conjugue avec 'être'. Sujet féminin → 'allée'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel est le participe passé de 'finir' ?",
    options: ["finit", "fini", "finir", "finissant"],
    reponse: "fini",
    explication: "Le participe passé de 'finir' est 'fini'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète au passé composé : 'Nous ___ nos devoirs.' (faire)",
    options: ["avons fait", "sommes fait", "avons fais", "avons faits"],
    reponse: "avons fait",
    explication: "'faire' se conjugue avec 'avoir' : nous avons fait.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quelle phrase est au passé composé ?",
    options: ["Je mangeais.", "Je mangerai.", "J'ai mangé.", "Je mange."],
    reponse: "J'ai mangé.",
    explication:
      "'J'ai mangé' = auxiliaire avoir + participe passé → passé composé.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Les élèves ___ bien travaillé.' (passé composé)",
    options: ["ont", "sont", "avaient", "étaient"],
    reponse: "ont",
    explication:
      "'travailler' se conjugue avec 'avoir' : les élèves ont travaillé.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Quelle phrase utilise correctement le passé composé avec 'être' ?",
    options: [
      "Elle a partie.",
      "Elle est parti.",
      "Elle est partie.",
      "Elle a partis.",
    ],
    reponse: "Elle est partie.",
    explication:
      "'partir' utilise 'être'. Sujet féminin → participe passé accordé : 'partie'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle est la différence entre 'Il mangeait' et 'Il a mangé' ?",
    options: [
      "Aucune différence.",
      "'mangeait' = habitude passée, 'a mangé' = action terminée.",
      "'mangeait' = action terminée, 'a mangé' = habitude.",
      "Les deux sont au futur.",
    ],
    reponse: "'mangeait' = habitude passée, 'a mangé' = action terminée.",
    explication:
      "L'imparfait exprime une habitude, le passé composé une action ponctuelle terminée.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Complète : 'Mes parents ___ en France.' (naître — passé composé)",
    options: ["ont né", "sont nés", "ont nés", "sont né"],
    reponse: "sont nés",
    explication: "'naître' utilise 'être'. Sujet masculin pluriel → 'nés'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel verbe se conjugue avec 'être' au passé composé ?",
    options: ["manger", "finir", "partir", "chanter"],
    reponse: "partir",
    explication:
      "'partir' est un verbe de mouvement qui se conjugue avec 'être'.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function ConjugaisonCM1() {
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
          <div className="lecon-badge">⏰ Conjugaison · CM1</div>
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
              ? "Tu maîtrises parfaitement le passé composé !"
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
