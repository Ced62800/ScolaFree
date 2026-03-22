"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import PopupInscription from "@/components/PopupInscription";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le futur et l'imparfait",
  intro:
    "On utilise le futur pour parler de ce qui va se passer, et l'imparfait pour parler d'habitudes ou de descriptions dans le passé.",
  points: [
    {
      titre: "Le futur simple",
      texte:
        "On utilise le futur pour parler d'une action qui aura lieu. Les terminaisons sont : -rai, -ras, -ra, -rons, -rez, -ront. Des mots comme 'demain', 'bientôt' accompagnent souvent le futur.",
      exemple:
        "Je mangerai. · Tu joueras. · Il viendra. · Demain, nous partirons.",
    },
    {
      titre: "L'imparfait",
      texte:
        "On utilise l'imparfait pour décrire une habitude passée ou une action qui durait dans le passé. Les terminaisons sont : -ais, -ais, -ait, -ions, -iez, -aient.",
      exemple:
        "Je jouais dehors. · Il mangeait sa soupe. · Nous chantions ensemble.",
    },
    {
      titre: "Comment les distinguer ?",
      texte:
        "Le futur parle de ce qui va arriver (demain, bientôt). L'imparfait parle de ce qui se passait avant (avant, quand j'étais petit, tous les jours).",
      exemple:
        "Avant, je jouais au parc. (imparfait) · Demain, je jouerai au parc. (futur)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Complète au futur : 'Demain, je ___ à l'école.' (aller)",
    options: ["allais", "vais", "irai", "allons"],
    reponse: "irai",
    explication: "Au futur avec 'je', le verbe aller donne 'irai'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel temps est utilisé : 'Il mangeait sa soupe' ?",
    options: ["présent", "futur", "imparfait", "passé simple"],
    reponse: "imparfait",
    explication: "'mangeait' est à l'imparfait — terminaison -ait.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Complète au futur : 'Tu ___ tes devoirs ce soir.' (finir)",
    options: ["finissais", "finis", "finiras", "finissez"],
    reponse: "finiras",
    explication: "Au futur avec 'tu', on dit 'finiras'.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Complète à l'imparfait : 'Quand j'étais petit, je ___ beaucoup.' (jouer)",
    options: ["jouerai", "jouais", "joue", "joueras"],
    reponse: "jouais",
    explication: "À l'imparfait avec 'je', on dit 'jouais'.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Quel mot indique le futur ?",
    options: ["avant", "jadis", "bientôt", "autrefois"],
    reponse: "bientôt",
    explication: "'bientôt' indique que l'action va se passer dans le futur.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète au futur : 'Nous ___ en vacances cet été.' (partir)",
    options: ["partions", "partons", "partirons", "partîmes"],
    reponse: "partirons",
    explication: "Au futur avec 'nous', on dit 'partirons'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Complète à l'imparfait : 'Ils ___ tous les soirs.' (chanter)",
    options: ["chanteront", "chantent", "chantaient", "chanterez"],
    reponse: "chantaient",
    explication: "À l'imparfait avec 'ils', on dit 'chantaient'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle phrase est au futur ?",
    options: [
      "Elle chantait tous les soirs.",
      "Nous jouions dehors.",
      "Il viendra demain.",
      "Tu mangeais bien.",
    ],
    reponse: "Il viendra demain.",
    explication: "'viendra' est au futur — 'demain' le confirme.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Complète à l'imparfait : 'Vous ___ souvent au parc.' (aller)",
    options: ["irez", "allez", "alliez", "allés"],
    reponse: "alliez",
    explication: "À l'imparfait avec 'vous', le verbe aller donne 'alliez'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quelle phrase est à l'imparfait ?",
    options: [
      "Je mangerai une pizza.",
      "Tu finiras tes devoirs.",
      "Il pleuvait tous les jours.",
      "Nous partirons bientôt.",
    ],
    reponse: "Il pleuvait tous les jours.",
    explication: "'pleuvait' est à l'imparfait — terminaison -ait.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "francais";
const THEME = "conjugaison-2";

export default function ConjugaisonCE1Page2() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
  const [etape, setEtape] = useState<"lecon" | "qcm" | "fini">("lecon");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState<boolean[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, []);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (!estConnecte) {
        setShowPopup(true);
        return;
      }
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score,
          total: questionsActives.length,
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
    setShowPopup(false);
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
      {showPopup && <PopupInscription onRecommencer={handleRecommencer} />}
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
          <span className="breadcrumb-active">Conjugaison 2</span>
        </div>
      </div>

      {etape === "qcm" && (
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {qIndex + 1} / {questionsActives.length}
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
          <div className="lecon-badge">⏰ Conjugaison 2 · CE1</div>
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
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt) => {
              let className = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) className += " correct";
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
              className={`qcm-feedback ${selected === questionsActives[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <div className="feedback-icon">
                {selected === questionsActives[qIndex].reponse ? "✅" : "❌"}
              </div>
              <div className="feedback-texte">
                <strong>
                  {selected === questionsActives[qIndex].reponse
                    ? "Bravo !"
                    : "Pas tout à fait..."}
                </strong>
                <p>{questionsActives[qIndex].explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button className="lecon-btn" onClick={handleSuivant}>
              {qIndex + 1 >= questionsActives.length
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
            {score} / {questionsActives.length}
          </div>
          <p className="resultat-desc">
            {score >= 9
              ? "Tu maîtrises parfaitement le futur et l'imparfait ! 🚀"
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
