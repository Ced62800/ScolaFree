"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le nom et l'article",
  intro:
    "Pour parler et écrire, on utilise des noms accompagnés de petits mots que l'on appelle des articles (ou déterminants).",
  points: [
    {
      titre: "L'article (Le petit mot)",
      texte:
        "C'est le mot qui se place devant le nom. Il nous dit si le nom est masculin ou féminin.",
      exemple: "un · une · le · la · l'",
    },
    {
      titre: "Masculin ou Féminin",
      texte:
        "On utilise 'le' ou 'un' pour les garçons ou objets masculins. On utilise 'la' ou 'une' pour les filles ou objets féminins.",
      exemple: "un vélo (masculin) · une voiture (féminin)",
    },
    {
      titre: "Le pluriel (Plusieurs)",
      texte:
        "Quand il y a plusieurs choses, l'article change et devient 'les' ou 'des'. Le nom prend souvent un 's' à la fin.",
      exemple: "les chats · des pommes",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel article (petit mot) va devant : ... chat ?",
    options: ["le", "la", "l'", "une"],
    reponse: "le",
    explication: "'Chat' est un nom masculin, on dit 'le chat' ou 'un chat'.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Choisis l'article qui convient pour : ... pomme.",
    options: ["un", "une", "le", "les"],
    reponse: "une",
    explication:
      "'Pomme' est un nom féminin, on dit 'une pomme' ou 'la pomme'.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Si je dis 'LES chiens', combien y a-t-il de chiens ?",
    options: ["un seul", "plusieurs", "aucun", "on ne sait pas"],
    reponse: "plusieurs",
    explication:
      "'Les' est un article de pluriel, cela veut dire qu'il y en a plusieurs.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Lequel est un NOM de personne ?",
    options: ["Boulanger", "Vert", "Sauter", "Grand"],
    reponse: "Boulanger",
    explication:
      "Le boulanger est une personne qui fait un métier, c'est un nom.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Trouve le bon article pour : ... école.",
    options: ["Le", "La", "L'", "Un"],
    reponse: "L'",
    explication:
      "Devant une voyelle comme le 'e' d'école, on utilise 'l'' pour que ce soit plus fluide.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Dans 'La petite fille', quel mot est le NOM ?",
    options: ["La", "petite", "fille"],
    reponse: "fille",
    explication: "'fille' est le nom de la personne. 'La' est l'article.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel article met-on si on a plusieurs bananes ?",
    options: ["La", "Une", "Des", "Le"],
    reponse: "Des",
    explication: "Pour le pluriel (plusieurs), on utilise 'des' ou 'les'.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Le mot 'soleil' est-il masculin ou féminin ?",
    options: ["masculin", "féminin"],
    reponse: "masculin",
    explication: "On dit 'le soleil' ou 'un soleil', c'est donc masculin.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Trouve l'intrus (le mot qui n'est PAS un article) :",
    options: ["un", "la", "mange", "des"],
    reponse: "mange",
    explication: "'mange' est un verbe (une action), pas un article.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Complète : '... oiseaux volent dans le ciel.'",
    options: ["L'", "Les", "La", "Le"],
    reponse: "Les",
    explication:
      "Il y a un 's' à oiseaux, donc c'est le pluriel : 'Les oiseaux'.",
    niveau: "difficile",
  },
];

const CLASSE = "cp";
const MATIERE = "francais";
const THEME = "grammaire-2";

export default function Grammaire2CP() {
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
          <div className="niveau-label">
            {niveauLabel(questions[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📝 Grammaire · CP</div>
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
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/primaire/cp/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
