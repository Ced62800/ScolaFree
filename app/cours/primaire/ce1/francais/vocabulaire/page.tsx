"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les préfixes et les suffixes",
  intro:
    "On peut créer de nouveaux mots en ajoutant des éléments au début (préfixe) ou à la fin (suffixe) d'un mot. C'est très utile pour comprendre le sens des mots nouveaux !",
  points: [
    {
      titre: "Les préfixes",
      texte:
        "Un préfixe se place AVANT le mot. Il change son sens. 'in-', 'im-', 'dé-', 're-' sont des préfixes courants.",
      exemple: "possible → impossible · faire → défaire · venir → revenir",
    },
    {
      titre: "Les suffixes",
      texte:
        "Un suffixe se place APRÈS le mot. Il change la nature ou le sens du mot. '-eur', '-tion', '-ette' sont des suffixes courants.",
      exemple:
        "chanter → chanteur · jardiner → jardinier · maison → maisonnette",
    },
    {
      titre: "Reconnaître le sens",
      texte:
        "En reconnaissant les préfixes et suffixes, on peut deviner le sens d'un mot inconnu !",
      exemple:
        "in- = contraire → injuste = pas juste · re- = à nouveau → relire = lire à nouveau",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le préfixe dans 'impossible' ?",
    options: ["im", "possible", "ible", "po"],
    reponse: "im",
    explication:
      "'im-' est le préfixe — il signifie 'pas' : impossible = pas possible.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Que signifie le préfixe 're-' dans 'relire' ?",
    options: ["avant", "à nouveau", "contraire", "après"],
    reponse: "à nouveau",
    explication: "'re-' signifie 'à nouveau' : relire = lire à nouveau.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel mot contient un suffixe qui indique un métier ?",
    options: ["maisonnette", "impossible", "boulanger", "refaire"],
    reponse: "boulanger",
    explication: "'-er' dans 'boulanger' indique un métier.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Que signifie 'défaire' ?",
    options: [
      "faire à nouveau",
      "faire avant",
      "faire le contraire de faire",
      "bien faire",
    ],
    reponse: "faire le contraire de faire",
    explication:
      "'dé-' indique le contraire : défaire = faire le contraire de faire.",
    niveau: "moyen",
  },
  {
    id: 5,
    question:
      "Quel préfixe peut-on ajouter à 'heureux' pour former son contraire ?",
    options: ["re-", "dé-", "in-", "sur-"],
    reponse: "in-",
    explication:
      "'in-' + 'heureux' = 'inheureux' (malheureux). 'in-' indique le contraire.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel est le suffixe dans 'chanteur' ?",
    options: ["chan", "chant", "eur", "teur"],
    reponse: "eur",
    explication:
      "'-eur' est le suffixe — il indique la personne qui fait l'action.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Que signifie 'maisonnette' ?",
    options: [
      "grande maison",
      "petite maison",
      "belle maison",
      "vieille maison",
    ],
    reponse: "petite maison",
    explication: "Le suffixe '-ette' indique quelque chose de petit.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel mot est formé avec le préfixe 're-' ?",
    options: ["renard", "repas", "recommencer", "requin"],
    reponse: "recommencer",
    explication: "'re-' + 'commencer' = recommencer (commencer à nouveau).",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Quel suffixe transforme un verbe en nom de métier ? 'jardiner → jardin___'",
    options: ["-ier", "-tion", "-ette", "-eur"],
    reponse: "-ier",
    explication: "'-ier' transforme 'jardiner' en 'jardinier' (métier).",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Que signifie 'prévisible' ? (pré- = avant, -ible = possible)",
    options: [
      "pas possible à voir",
      "possible à voir à l'avance",
      "très visible",
      "déjà vu",
    ],
    reponse: "possible à voir à l'avance",
    explication: "'pré-' = avant + 'visible' = possible à voir à l'avance.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "prefixes-suffixes";

export default function VocabulaireCE1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const shuffledOptions = useMemo(
    () => shuffleArray(questions[qIndex].options),
    [qIndex],
  );

  const progression = Math.round((bonnes.length / questions.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: score,
          total: questions.length,
        });

        const [best, last] = await Promise.all([
          getBestScore(CLASSE, MATIERE, THEME),
          getLastScore(CLASSE, MATIERE, THEME),
        ]);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
    setEtape("lecon");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setBonnes([]);
  };

  const niveauLabel = (n: string) =>
    n === "facile" ? "🟢 Facile" : n === "moyen" ? "🟡 Moyen" : "🔴 Difficile";

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
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
          <div className="lecon-badge">📚 Vocabulaire · CE1</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur <br />{" "}
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier <br />{" "}
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}

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
              ? "Tu maîtrises parfaitement les préfixes et suffixes !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : score >= 5
                  ? "Encore quelques efforts !"
                  : "Relis la leçon et réessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() =>
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)
              }
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
