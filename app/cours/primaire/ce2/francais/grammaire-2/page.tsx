"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les compléments et la ponctuation",
  intro:
    "En CE2, on apprend à enrichir ses phrases avec des compléments et à bien les ponctuer. Un complément apporte des informations supplémentaires sur l'action.",
  points: [
    {
      titre: "Le complément de lieu et de temps",
      texte:
        "Le complément de lieu répond à 'où ?' et le complément de temps répond à 'quand ?'. On peut les déplacer ou les supprimer.",
      exemple:
        "Le chat dort dans le jardin. (où ?) · Il joue le matin. (quand ?)",
    },
    {
      titre: "Le complément d'objet direct (COD)",
      texte:
        "Le COD répond à 'qui ?' ou 'quoi ?' après le verbe. On ne peut pas le déplacer facilement.",
      exemple:
        "Marie mange une pomme. (mange quoi ? → une pomme) · Il lit un livre.",
    },
    {
      titre: "La ponctuation",
      texte:
        "La ponctuation aide à comprendre les phrases. Le point (.) termine une phrase. La virgule (,) sépare des éléments. Le point d'interrogation (?) pose une question.",
      exemple: "Le chien aboie. · Léa, Tom et Paul jouent. · Où vas-tu ?",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Dans 'Le chat dort dans le jardin', quel est le complément de lieu ?",
    options: ["Le chat", "dort", "dans le jardin", "le"],
    reponse: "dans le jardin",
    explication: "'dans le jardin' répond à 'où ?' → complément de lieu.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Dans 'Marie mange une pomme', quel est le COD ?",
    options: ["Marie", "mange", "une pomme", "une"],
    reponse: "une pomme",
    explication: "Mange quoi ? → une pomme. C'est le COD.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel signe de ponctuation termine une phrase affirmative ?",
    options: ["?", "!", ",", "."],
    reponse: ".",
    explication: "Le point (.) termine une phrase affirmative.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Dans 'Il joue le matin', quel est le complément de temps ?",
    options: ["Il", "joue", "le matin", "le"],
    reponse: "le matin",
    explication: "'le matin' répond à 'quand ?' → complément de temps.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Dans 'Léa lit un roman', le COD est...",
    options: ["Léa", "lit", "un roman", "un"],
    reponse: "un roman",
    explication: "Lit quoi ? → un roman. C'est le COD.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle phrase est correctement ponctuée ?",
    options: [
      "Le chien aboie",
      "Le chien aboie.",
      "le chien aboie.",
      "Le chien, aboie.",
    ],
    reponse: "Le chien aboie.",
    explication: "Majuscule au début, point à la fin.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel signe utilise-t-on pour poser une question ?",
    options: [".", "!", "?", ","],
    reponse: "?",
    explication: "Le point d'interrogation (?) pose une question.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Dans 'Le soir, il regarde la télé', quel est le complément de temps ?",
    options: ["Le soir", "il", "regarde", "la télé"],
    reponse: "Le soir",
    explication: "'Le soir' répond à 'quand ?' → complément de temps.",
    niveau: "moyen",
  },
  {
    id: 9,
    question:
      "Dans 'Paul joue au foot dans le parc', le complément de lieu est...",
    options: ["Paul", "joue", "au foot", "dans le parc"],
    reponse: "dans le parc",
    explication: "'dans le parc' répond à 'où ?' → complément de lieu.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase contient un COD ?",
    options: [
      "Il court vite.",
      "Elle mange une orange.",
      "Nous partons demain.",
      "Tu dors bien.",
    ],
    reponse: "Elle mange une orange.",
    explication: "Mange quoi ? → une orange. C'est le COD.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "francais";
const THEME = "grammaire-2";

export default function GrammaireCE2Page2() {
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
          score,
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
          onClick={() =>
            router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
          }
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire 2</span>
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
          <div className="lecon-badge">📝 Grammaire 2 · CE2</div>
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
                  🏆 Meilleur
                  <br />
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
                  🕐 Dernier
                  <br />
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
              ? "Tu maîtrises parfaitement les compléments ! 🚀"
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
                router.push(`/cours/primaire/${CLASSE}/${MATIERE}/page-2`)
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
