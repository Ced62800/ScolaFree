"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le verbe",
  intro:
    "Le verbe est le mot le plus important de la phrase. Il indique ce que fait ou ce qu'est le sujet. Sans verbe, pas de phrase !",
  points: [
    {
      titre: "Qu'est-ce qu'un verbe ?",
      texte:
        "Le verbe exprime une action ou un état. Il change selon la personne et le temps.",
      exemple: "Le chien court. · Emma mange. · Je suis content.",
    },
    {
      titre: "Comment reconnaître un verbe ?",
      texte:
        "On peut mettre 'ne... pas' autour du verbe. Si ça marche, c'est un verbe !",
      exemple: "Le chien ne court pas. · Emma ne mange pas.",
    },
    {
      titre: "Le verbe change avec le sujet",
      texte:
        "Le verbe s'accorde avec son sujet. Il change de forme selon qui fait l'action.",
      exemple: "Je mange · Tu manges · Il mange · Nous mangeons",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Quel mot est un verbe dans cette phrase : 'Le chat dort sur le canapé' ?",
    options: ["chat", "dort", "canapé", "le"],
    reponse: "dort",
    explication: "'dort' est le verbe — il indique ce que fait le chat.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot est un verbe ?",
    options: ["maison", "courir", "beau", "table"],
    reponse: "courir",
    explication: "'courir' est un verbe — il exprime une action.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Dans 'Les enfants jouent au parc', quel est le verbe ?",
    options: ["enfants", "parc", "jouent", "les"],
    reponse: "jouent",
    explication:
      "'jouent' est le verbe — les enfants ne jouent pas → ça marche !",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quelle phrase contient un verbe d'état ?",
    options: [
      "Le chien court.",
      "Emma chante.",
      "Paul est grand.",
      "Léa mange.",
    ],
    reponse: "Paul est grand.",
    explication: "'est' est un verbe d'état — il indique comment est Paul.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Quel est le verbe dans : 'Ma mère prépare un gâteau' ?",
    options: ["mère", "gâteau", "prépare", "ma"],
    reponse: "prépare",
    explication:
      "'prépare' est le verbe — ma mère ne prépare pas → ça marche !",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Combien y a-t-il de verbes dans : 'Je mange et je bois' ?",
    options: ["1", "2", "3", "0"],
    reponse: "2",
    explication: "Il y a 2 verbes : 'mange' et 'bois'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel mot N'est PAS un verbe ?",
    options: ["chanter", "dormir", "rapide", "manger"],
    reponse: "rapide",
    explication: "'rapide' est un adjectif, pas un verbe.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Dans 'Les oiseaux chantent le matin', le verbe est accordé avec quel sujet ?",
    options: ["le matin", "les oiseaux", "chantent", "matin"],
    reponse: "les oiseaux",
    explication: "'chantent' est accordé avec 'les oiseaux' (pluriel).",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Quelle est la bonne conjugaison ? 'Les enfants ___ dans la cour.'",
    options: ["joue", "jouons", "jouent", "jouez"],
    reponse: "jouent",
    explication: "Avec 'les enfants' (ils), on dit 'jouent'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel verbe complète correctement : 'Nous ___ nos devoirs.' ?",
    options: ["fait", "fais", "faites", "faisons"],
    reponse: "faisons",
    explication: "Avec 'nous', on dit 'faisons'.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "grammaire";

export default function GrammaireCE1() {
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
          <div className="lecon-badge">📝 Grammaire · CE1</div>
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
              ? "Tu maîtrises parfaitement le verbe ! 🚀"
              : score >= 7
                ? "Tu as bien compris l'essentiel, continue !"
                : score >= 5
                  ? "Encore quelques efforts et tu y seras !"
                  : "Relis la leçon et réessaie, tu vas y arriver !"}
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
