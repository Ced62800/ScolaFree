"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le futur simple",
  intro:
    "Le futur simple exprime une action qui se passera dans le futur. Il se forme avec l'infinitif du verbe + les terminaisons : -rai, -ras, -ra, -rons, -rez, -ront.",
  points: [
    {
      titre: "Formation du futur simple",
      texte:
        "Pour la plupart des verbes, on ajoute les terminaisons à l'infinitif. Les verbes en -re perdent le e final.",
      exemple:
        "manger → je mangerai · finir → il finira · prendre → nous prendrons",
    },
    {
      titre: "Les verbes irréguliers",
      texte:
        "Certains verbes ont un radical irrégulier au futur : être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, pouvoir → pourr-.",
      exemple:
        "Je serai. · Tu auras. · Il ira. · Nous ferons. · Ils viendront.",
    },
    {
      titre: "Quand utiliser le futur ?",
      texte:
        "On utilise le futur pour parler d'une action à venir, souvent avec des mots comme : demain, bientôt, l'année prochaine, dans...",
      exemple:
        "Demain, je partirai en vacances. · Dans un an, nous serons au CM2.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète au futur : 'Demain, je ___ mes devoirs.' (faire)",
    options: ["fais", "faisais", "ferai", "ai fait"],
    reponse: "ferai",
    explication: "Futur de 'faire' avec 'je' : ferai.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Complète au futur : 'Il ___ à Paris l'année prochaine.' (aller)",
    options: ["va", "allait", "est allé", "ira"],
    reponse: "ira",
    explication: "Futur de 'aller' avec 'il' : ira.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète au futur : 'Nous ___ contents.' (être)",
    options: ["sommes", "étions", "serons", "avons été"],
    reponse: "serons",
    explication: "Futur de 'être' avec 'nous' : serons.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Complète au futur : 'Tu ___ une bonne note.' (avoir)",
    options: ["as", "avais", "auras", "as eu"],
    reponse: "auras",
    explication: "Futur de 'avoir' avec 'tu' : auras.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Complète au futur : 'Ils ___ leur match.' (gagner)",
    options: ["gagnent", "gagnaient", "gagneront", "ont gagné"],
    reponse: "gagneront",
    explication: "Futur de 'gagner' avec 'ils' : gagneront.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quelle phrase est au futur ?",
    options: ["J'ai couru.", "Je courais.", "Je cours.", "Je courrai."],
    reponse: "Je courrai.",
    explication: "'courrai' est au futur — terminaison -rai.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète au futur : 'Vous ___ la vérité.' (savoir)",
    options: ["savez", "saviez", "saurez", "avez su"],
    reponse: "saurez",
    explication: "Futur de 'savoir' avec 'vous' : saurez.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quel mot indique qu'on doit utiliser le futur ?",
    options: ["hier", "autrefois", "bientôt", "maintenant"],
    reponse: "bientôt",
    explication: "'Bientôt' indique une action à venir → futur.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Complète au futur : 'Elle ___ nous rejoindre.' (venir)",
    options: ["vient", "venait", "viendra", "est venue"],
    reponse: "viendra",
    explication: "Futur de 'venir' avec 'elle' : viendra.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète au futur : 'Nous ___ ce problème ensemble.' (pouvoir)",
    options: ["pouvons", "pouvions", "pourrons", "avons pu"],
    reponse: "pourrons",
    explication: "Futur de 'pouvoir' avec 'nous' : pourrons.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "francais";
const THEME = "conjugaison-2";

export default function ConjugaisonCM1Page2() {
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
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
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
        </div>
      )}
      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">⏰ Conjugaison 2 · CM1</div>
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
              ? "Tu maîtrises parfaitement le futur simple ! 🚀"
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
