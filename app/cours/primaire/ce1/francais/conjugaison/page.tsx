"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le présent et le futur",
  intro:
    "On peut parler de ce qui se passe maintenant (présent) ou de ce qui va se passer plus tard (futur). Apprends à reconnaître et utiliser ces deux temps !",
  points: [
    {
      titre: "Le présent",
      texte:
        "On utilise le présent pour parler de ce qui se passe maintenant ou de ce qu'on fait habituellement.",
      exemple: "Je mange une pomme. · Il joue au foot tous les jours.",
    },
    {
      titre: "Le futur simple",
      texte:
        "On utilise le futur pour parler de ce qui va se passer. On ajoute les terminaisons -rai, -ras, -ra, -rons, -rez, -ront.",
      exemple: "Je mangerai. · Tu joueras. · Il viendra.",
    },
    {
      titre: "Les indicateurs de temps",
      texte:
        "Des mots nous aident à reconnaître le temps : 'demain', 'bientôt' = futur. 'maintenant', 'aujourd'hui' = présent.",
      exemple: "Demain, je partirai. · Aujourd'hui, je joue.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel temps est utilisé : 'Je mange une pomme' ?",
    options: ["passé", "présent", "futur", "on ne sait pas"],
    reponse: "présent",
    explication: "'mange' est au présent — l'action se passe maintenant.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel temps est utilisé : 'Demain, il pleuvra' ?",
    options: ["passé", "présent", "futur", "on ne sait pas"],
    reponse: "futur",
    explication:
      "'pleuvra' est au futur — 'demain' indique que c'est dans le futur.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète au présent : 'Tu ___ au foot.' (jouer)",
    options: ["joueras", "joues", "joua", "jouez"],
    reponse: "joues",
    explication: "Au présent avec 'tu', on dit 'joues'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète au futur : 'Je ___ mes devoirs ce soir.' (faire)",
    options: ["fais", "faisais", "ferai", "fait"],
    reponse: "ferai",
    explication: "Au futur avec 'je', on dit 'ferai'.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel mot indique le futur ?",
    options: ["hier", "maintenant", "demain", "aujourd'hui"],
    reponse: "demain",
    explication: "'demain' indique que l'action se passera dans le futur.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète au futur : 'Nous ___ à la mer cet été.' (aller)",
    options: ["allons", "irons", "allions", "allez"],
    reponse: "irons",
    explication: "Au futur avec 'nous', le verbe 'aller' devient 'irons'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quelle phrase est au présent ?",
    options: [
      "Il chantera demain.",
      "Nous partirons bientôt.",
      "Elle lit un livre.",
      "Tu viendras.",
    ],
    reponse: "Elle lit un livre.",
    explication: "'lit' est au présent — l'action se passe maintenant.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète au futur : 'Ils ___ le match.' (gagner)",
    options: ["gagnent", "gagnaient", "gagneront", "gagnez"],
    reponse: "gagneront",
    explication: "Au futur avec 'ils', on ajoute -ront : 'gagneront'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Quelle phrase est au futur ?",
    options: [
      "Je mange ma soupe.",
      "Tu finis tes devoirs.",
      "Elle dormira bientôt.",
      "Nous jouons dehors.",
    ],
    reponse: "Elle dormira bientôt.",
    explication:
      "'dormira' est au futur — 'bientôt' confirme que c'est dans le futur.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète correctement : 'Vous ___ vos amis samedi.' (voir)",
    options: ["voyez", "verrez", "voyiez", "voir"],
    reponse: "verrez",
    explication: "Au futur avec 'vous', le verbe 'voir' devient 'verrez'.",
    niveau: "difficile",
  },
];

const niveauLabel = (n: string) => {
  if (n === "facile") return "🟢 Facile";
  if (n === "moyen") return "🟡 Moyen";
  return "🔴 Difficile";
};

export default function ConjugaisonCE1() {
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
          onClick={() => router.push("/cours/primaire/cp/francais")}
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
              ? "Tu maîtrises parfaitement le présent et le futur !"
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
              onClick={() => router.push("/cours/primaire/ce1/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
