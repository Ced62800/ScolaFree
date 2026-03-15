"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones grammaticaux",
  intro:
    "Les homophones sont des mots qui se prononcent pareil mais qui s'écrivent différemment et n'ont pas le même sens. Il faut apprendre à les distinguer !",
  points: [
    {
      titre: "a / à",
      texte:
        "'a' est le verbe avoir (on peut remplacer par 'avait'). 'à' est une préposition (on ne peut pas le remplacer par 'avait').",
      exemple:
        "Il a faim. → Il avait faim ✓ · Il va à l'école. → Il va avait l'école ✗",
    },
    {
      titre: "est / et",
      texte:
        "'est' est le verbe être (on peut remplacer par 'était'). 'et' est une conjonction qui relie deux mots (= aussi).",
      exemple:
        "Il est grand. → Il était grand ✓ · Paul et Marie jouent. → Paul aussi Marie jouent ✓",
    },
    {
      titre: "on / ont",
      texte:
        "'on' est un pronom (on peut remplacer par 'il'). 'ont' est le verbe avoir au pluriel (on peut remplacer par 'avaient').",
      exemple:
        "On joue dehors. → Il joue dehors ✓ · Ils ont faim. → Ils avaient faim ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : 'Il ___ mangé sa soupe.' (a ou à)",
    options: ["à", "a"],
    reponse: "a",
    explication:
      "'a' = verbe avoir. On peut dire 'il avait mangé' → c'est 'a'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Elle va ___ l'école.' (a ou à)",
    options: ["a", "à"],
    reponse: "à",
    explication:
      "'à' est une préposition. On ne peut pas dire 'avait l'école'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : 'Le chat ___ très grand.' (est ou et)",
    options: ["et", "est"],
    reponse: "est",
    explication: "'est' = verbe être. On peut dire 'le chat était très grand'.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Tom ___ Léa jouent ensemble.' (est ou et)",
    options: ["est", "et"],
    reponse: "et",
    explication: "'et' relie deux mots. On peut dire 'Tom aussi Léa jouent'.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Complète : '___ part à la mer.' (on ou ont)",
    options: ["ont", "on"],
    reponse: "on",
    explication: "'on' = pronom. On peut dire 'il part à la mer'.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Ils ___ fini leurs devoirs.' (on ou ont)",
    options: ["on", "ont"],
    reponse: "ont",
    explication: "'ont' = verbe avoir. On peut dire 'ils avaient fini'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : 'Il ___ un beau vélo.' (a ou à)",
    options: ["à", "a"],
    reponse: "a",
    explication: "'a' = verbe avoir. On peut dire 'il avait un beau vélo'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'La robe ___ bleue ___ jolie.' (est/et)",
    options: ["et / est", "est / et"],
    reponse: "est / et",
    explication: "'est' = verbe être, 'et' = relie deux adjectifs.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Complète : 'Ils ___ mangé ___ la cantine.' (ont/à)",
    options: ["on / a", "ont / à", "on / à", "ont / a"],
    reponse: "ont / à",
    explication: "'ont' = verbe avoir (avaient), 'à' = préposition.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : '___ dirait qu'il ___ fatigué.' (on/est)",
    options: ["ont / est", "on / et", "on / est", "ont / et"],
    reponse: "on / est",
    explication:
      "'on' = pronom (il dirait), 'est' = verbe être (était fatigué).",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "orthographe-2";

export default function OrthographeCE1Page2() {
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
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Orthographe 2</span>
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
          <div className="lecon-badge">✏️ Orthographe 2 · CE1</div>
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
              ? "Tu maîtrises parfaitement les homophones ! 🚀"
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
