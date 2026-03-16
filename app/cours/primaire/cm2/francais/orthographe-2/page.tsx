"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Les homophones avancés",
  intro:
    "En CM2, on approfondit les homophones grammaticaux les plus difficiles : quand/quant/qu'en, sans/s'en/c'en, ni/n'y, si/s'y.",
  points: [
    {
      titre: "quand / quant / qu'en",
      texte:
        "'quand' = conjonction de temps (quand = lorsque). 'quant à' = en ce qui concerne. 'qu'en' = que + en (contraction).",
      exemple:
        "Quand il arrive, je pars. · Quant à moi, je reste. · Qu'en penses-tu ?",
    },
    {
      titre: "sans / s'en / c'en",
      texte:
        "'sans' = préposition (contraire de avec). 's'en' = se + en (pronom). 'c'en' = ce + en.",
      exemple: "Il part sans moi. · Il s'en va. · C'en est trop !",
    },
    {
      titre: "ni / n'y · si / s'y",
      texte:
        "'ni' = conjonction de coordination négative. 'n'y' = ne + y. 'si' = conjonction conditionnelle. 's'y' = se + y.",
      exemple:
        "Ni l'un ni l'autre. · Il n'y va pas. · Si tu viens... · Il s'y habitue.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète : '___ il arrive, je partirai.'",
    options: ["Quant", "Quand", "Qu'en", "Cant"],
    reponse: "Quand",
    explication: "'Quand' = lorsque (conjonction de temps).",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète : 'Il part ___ son manteau.'",
    options: ["s'en", "c'en", "sans", "sens"],
    reponse: "sans",
    explication: "'sans' = préposition (contraire de avec).",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : '___ à moi, je préfère rester.'",
    options: ["Quand", "Quant", "Qu'en", "Cant"],
    reponse: "Quant",
    explication: "'Quant à' = en ce qui concerne.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète : 'Il ___ souvient encore.'",
    options: ["sans", "s'en", "c'en", "sens"],
    reponse: "s'en",
    explication: "'s'en' = se + en (pronom).",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complète : '_ penses-tu ?' (que + en)",
    options: ["Quand", "Quant", "Qu'en", "Kant"],
    reponse: "Qu'en",
    explication: "'Qu'en' = que + en : Qu'en penses-tu ?",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : 'Il ___ va pas souvent.' (ne + y)",
    options: ["ni", "n'y", "si", "s'y"],
    reponse: "n'y",
    explication: "'n'y' = ne + y.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète : '___ tu viens, préviens-moi.'",
    options: ["S'y", "N'y", "Si", "Ni"],
    reponse: "Si",
    explication: "'Si' = conjonction conditionnelle.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Complète : 'Je ne veux ___ pain ___ beurre.'",
    options: ["si / si", "ni / ni", "n'y / n'y", "si / ni"],
    reponse: "ni / ni",
    explication: "'ni... ni...' = conjonction de coordination négative.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'Il ___ est habitué.' (se + y)",
    options: ["ni", "n'y", "si", "s'y"],
    reponse: "s'y",
    explication: "'s'y' = se + y.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase est correcte ?",
    options: [
      "Quand à lui, il refuse.",
      "Quant à lui, il refuse.",
      "Qu'en à lui, il refuse.",
      "Cant à lui, il refuse.",
    ],
    reponse: "Quant à lui, il refuse.",
    explication: "'Quant à' = en ce qui concerne.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "francais";
const THEME = "orthographe-2";

export default function OrthographeCM2Page2() {
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
          <span>CM2</span>
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
          <div className="lecon-badge">✏️ Orthographe 2 · CM2</div>
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
              let cn = "qcm-option";
              if (selected) {
                if (opt === questions[qIndex].reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
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
              ? "Tu maîtrises les homophones avancés ! 🚀"
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
