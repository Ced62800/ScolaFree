"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Mesures de longueurs",
  intro:
    "On mesure les longueurs avec une règle. L'unité de mesure la plus utilisée est le centimètre (cm).",
  points: [
    {
      titre: "Le centimètre (cm)",
      texte: "C'est la petite unité pour mesurer des objets du quotidien.",
      exemple: "Un crayon mesure environ 15 cm.",
    },
    {
      titre: "Le mètre (m)",
      texte: "C'est une grande unité. 1 mètre = 100 centimètres.",
      exemple: "Une porte mesure environ 2 mètres.",
    },
    {
      titre: "Comparer des longueurs",
      texte:
        "On peut dire qu'un objet est plus long, plus court ou aussi long qu'un autre.",
      exemple: "Un stylo (14 cm) est plus court qu'une règle (30 cm).",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quelle est l'unité pour mesurer une longueur ?",
    options: ["Le kilo", "Le centimètre", "Le litre", "Le degré"],
    reponse: "Le centimètre",
    explication:
      "On mesure les longueurs en centimètres (cm) ou en mètres (m).",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien de centimètres y a-t-il dans 1 mètre ?",
    options: ["10", "50", "100", "1000"],
    reponse: "100",
    explication: "1 mètre = 100 centimètres.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Avec quoi mesure-t-on une longueur ?",
    options: ["Une balance", "Un verre", "Une règle", "Un thermomètre"],
    reponse: "Une règle",
    explication: "On utilise une règle pour mesurer les longueurs.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Un crayon mesure 15 cm. Une règle mesure 30 cm. Laquelle est la plus longue ?",
    options: ["Le crayon", "La règle", "Les deux pareil"],
    reponse: "La règle",
    explication: "30 cm > 15 cm, donc la règle est plus longue.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Que signifie 'cm' ?",
    options: ["Centimètre", "Centilitre", "Carré mètre", "Cube mètre"],
    reponse: "Centimètre",
    explication: "cm est l'abréviation de centimètre.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Une table mesure 1 mètre. Combien font 1 mètre en centimètres ?",
    options: ["10 cm", "50 cm", "100 cm", "200 cm"],
    reponse: "100 cm",
    explication: "1 m = 100 cm.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel objet mesure environ 1 cm ?",
    options: ["Une maison", "Un ongle", "Une voiture", "Un terrain"],
    reponse: "Un ongle",
    explication: "Un ongle mesure environ 1 cm de large.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Un ver mesure 5 cm, un serpent mesure 50 cm. Lequel est le plus court ?",
    options: ["Le ver", "Le serpent", "Les deux pareil"],
    reponse: "Le ver",
    explication: "5 cm < 50 cm, donc le ver est plus court.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "50 cm + 50 cm = ?",
    options: ["1 m", "2 m", "100 m", "5 m"],
    reponse: "1 m",
    explication: "50 + 50 = 100 cm = 1 mètre.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Une cour d'école mesure 20 mètres. C'est combien en cm ?",
    options: ["20 cm", "200 cm", "2000 cm", "20000 cm"],
    reponse: "2000 cm",
    explication: "20 m × 100 = 2000 cm.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "maths";
const THEME = "mesures";

export default function MesuresCP() {
  const router = useRouter();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
    [qIndex, refreshKey],
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
      if (scoreSaved.current) return;
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
    setRefreshKey((prev) => prev + 1);
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
          onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span>CP</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Mesures de longueurs</span>
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
          <div className="lecon-badge">📏 Mesures · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4ade80",
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
                  <span className="exemple-label">Exemple :</span> {p.exemple}
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
              ? "Expert des mesures !"
              : score >= 7
                ? "Bien joué !"
                : score >= 5
                  ? "Pas mal !"
                  : "Continue tes efforts !"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4ade80",
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
                    padding: "10px",
                    fontSize: "0.85rem",
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
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
