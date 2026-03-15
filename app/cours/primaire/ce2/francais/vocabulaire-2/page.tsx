"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const lecon = {
  titre: "Le champ lexical et le sens des mots",
  intro:
    "Un champ lexical regroupe tous les mots qui se rapportent au même thème. Comprendre le sens des mots permet de mieux lire et écrire !",
  points: [
    {
      titre: "Le champ lexical",
      texte:
        "Un champ lexical regroupe des mots liés au même thème ou à la même idée. Ces mots peuvent être de natures différentes (noms, verbes, adjectifs).",
      exemple:
        "Champ lexical de la mer : vague, marin, plonger, salé, bateau, côte.",
    },
    {
      titre: "Le sens propre et le sens figuré",
      texte:
        "Un mot peut avoir un sens propre (concret, habituel) et un sens figuré (imagé, métaphorique).",
      exemple:
        "La tête du clou (sens propre) · Il a la tête dans les nuages (sens figuré).",
    },
    {
      titre: "Les niveaux de langue",
      texte:
        "On peut dire la même chose de façons différentes selon le contexte : familier, courant ou soutenu.",
      exemple:
        "Familier : 'Ce truc est trop bien !' · Courant : 'C'est très bien !' · Soutenu : 'C'est excellent !'",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel mot appartient au champ lexical de la mer ?",
    options: ["montagne", "vague", "forêt", "désert"],
    reponse: "vague",
    explication:
      "'vague' est lié à la mer — c'est une grande masse d'eau en mouvement.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel mot appartient au champ lexical de l'école ?",
    options: ["tracteur", "cahier", "casserole", "marteau"],
    reponse: "cahier",
    explication: "'cahier' est un objet de l'école.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Dans 'Il a le cœur sur la main', quel est le sens de cette expression ?",
    options: [
      "Il a mal au cœur.",
      "Il est généreux.",
      "Il a la main blessée.",
      "Il est malade.",
    ],
    reponse: "Il est généreux.",
    explication:
      "C'est le sens figuré : 'avoir le cœur sur la main' = être généreux.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel mot N'appartient PAS au champ lexical de la cuisine ?",
    options: ["casserole", "recette", "ingrédient", "microscope"],
    reponse: "microscope",
    explication: "Le microscope est un outil scientifique, pas de cuisine.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Dans 'Il pleut des cordes', quel est le sens ?",
    options: [
      "Il y a des cordes dehors.",
      "Il pleut très fort.",
      "Il fait beau.",
      "Il neige.",
    ],
    reponse: "Il pleut très fort.",
    explication:
      "C'est le sens figuré : 'pleuvoir des cordes' = pleuvoir très fort.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Quel niveau de langue est : 'Ce truc est trop bien !' ?",
    options: ["Soutenu", "Courant", "Familier", "Scientifique"],
    reponse: "Familier",
    explication: "'truc' et 'trop bien' sont des expressions familières.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Quel mot appartient au champ lexical de la musique ?",
    options: ["palette", "mélodie", "équation", "robinet"],
    reponse: "mélodie",
    explication: "'mélodie' est liée à la musique.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Dans 'La tête du clou', quel est le sens du mot 'tête' ?",
    options: ["sens figuré", "sens propre", "sens familier", "sens soutenu"],
    reponse: "sens propre",
    explication:
      "La tête du clou désigne vraiment la partie supérieure du clou → sens propre.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Quel groupe de mots forme un champ lexical cohérent ?",
    options: [
      "chien, table, soleil, livre",
      "pluie, nuage, tonnerre, éclair",
      "maison, courir, bleu, hier",
      "chat, voiture, chanter, trois",
    ],
    reponse: "pluie, nuage, tonnerre, éclair",
    explication: "Tous ces mots sont liés à la météo → champ lexical cohérent.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Quel est le niveau de langue de : 'Je vous serais reconnaissant de bien vouloir m'aider.' ?",
    options: ["Familier", "Courant", "Soutenu", "Scientifique"],
    reponse: "Soutenu",
    explication:
      "'Je vous serais reconnaissant' est une formulation très formelle → soutenu.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "francais";
const THEME = "vocabulaire-2";

export default function VocabulaireCE2Page2() {
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
          <span className="breadcrumb-active">Vocabulaire 2</span>
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
          <div className="lecon-badge">📚 Vocabulaire 2 · CE2</div>
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
              ? "Tu maîtrises parfaitement le vocabulaire ! 🚀"
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
