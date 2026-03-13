"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le temps : Hier, Aujourd'hui, Demain",
  intro:
    "Pour raconter une histoire, on doit savoir si l'action se passe dans le passé, le présent ou le futur.",
  points: [
    {
      titre: "Le Passé (C'est fini)",
      texte:
        "On l'utilise pour quelque chose qui est déjà arrivé. On utilise souvent le mot 'Hier'.",
      exemple: "Hier, j'ai mangé une pomme.",
    },
    {
      titre: "Le Présent (C'est maintenant)",
      texte:
        "On l'utilise pour ce qui se passe en ce moment même. On utilise souvent le mot 'Aujourd'hui'.",
      exemple: "Aujourd'hui, je joue au ballon.",
    },
    {
      titre: "Le Futur (C'est après)",
      texte:
        "On l'utilise pour ce qui va arriver plus tard. On utilise souvent le mot 'Demain'.",
      exemple: "Demain, j'irai à la piscine.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Si je dis 'Hier', de quel temps s'agit-il ?",
    options: ["Le passé", "Le présent", "Le futur"],
    reponse: "Le passé",
    explication: "'Hier' désigne un moment qui est déjà terminé.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot utilise-t-on pour parler du futur ?",
    options: ["Demain", "Hier", "Maintenant"],
    reponse: "Demain",
    explication:
      "Le futur, c'est ce qui n'est pas encore arrivé : c'est demain.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète : '... je mange ma soupe.'",
    options: ["Maintenant", "Hier", "L'année dernière"],
    reponse: "Maintenant",
    explication: "'Je mange' est au présent, cela se passe tout de suite.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "'J'ai fini mon dessin.' À quel temps est cette phrase ?",
    options: ["Le passé", "Le présent", "Le futur"],
    reponse: "Le passé",
    explication: "L'action est terminée, le dessin est fait.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Lequel de ces mots annonce le futur ?",
    options: ["Plus tard", "Avant", "Déjà"],
    reponse: "Plus tard",
    explication: "'Plus tard' indique que l'action va se passer après.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète : '... j'étais un bébé.'",
    options: ["Autrefois", "Bientôt", "En ce moment"],
    reponse: "Autrefois",
    explication: "Être bébé, c'est fini pour toi, c'est donc dans le passé.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Si Cédric dit 'Je vais dormir', quand va-t-il le faire ?",
    options: ["Dans le futur", "Dans le passé", "C'est déjà fait"],
    reponse: "Dans le futur",
    explication: "Il ne dort pas encore, il va le faire bientôt.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Trouve l'intrus (le mot qui n'est PAS au présent) :",
    options: ["Aujourd'hui", "Maintenant", "Bientôt"],
    reponse: "Bientôt",
    explication: "'Bientôt' sert à parler du futur.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Dans 'Demain, nous irons au parc', quel est le temps ?",
    options: ["Futur", "Passé", "Présent"],
    reponse: "Futur",
    explication: "Le mot 'Demain' et le verbe 'irons' indiquent le futur.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : '... je range ma chambre.'",
    options: ["En ce moment", "La semaine passée", "Demain"],
    reponse: "En ce moment",
    explication: "'Je range' décrit une action que l'on fait maintenant.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "conjugaison-2";

export default function Conjugaison2CP() {
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
        score: score,
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
          onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span> <span className="breadcrumb-sep">›</span>
          <span>CP</span> <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Conjugaison 2</span>
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
          <div className="lecon-badge">⏳ Conjugaison · CP</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#2ec4b6",
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
          <button
            className="lecon-btn"
            onClick={() => setEtape("qcm")}
            style={{ backgroundColor: "#2ec4b6" }}
          >
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
            <button
              className="lecon-btn"
              onClick={handleSuivant}
              style={{ backgroundColor: "#2ec4b6" }}
            >
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
              ? "Expert en temps !"
              : score >= 7
                ? "Bien joué !"
                : "À pratiquer encore"}
          </h2>
          <div className="resultat-score">
            {score} / {questions.length}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
              style={{ backgroundColor: "#2ec4b6" }}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
