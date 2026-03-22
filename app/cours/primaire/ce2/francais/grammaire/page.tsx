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
  titre: "Le sujet et le verbe",
  intro:
    "Dans une phrase, le sujet indique de qui ou de quoi on parle. Le verbe indique ce que fait ou ce qu'est le sujet. Ils sont toujours liés !",
  points: [
    {
      titre: "Trouver le sujet",
      texte:
        "Pour trouver le sujet, on pose la question 'Qui est-ce qui ?' ou 'Qu'est-ce qui ?' avant le verbe.",
      exemple:
        "Le chien court. → Qui est-ce qui court ? → Le chien est le sujet.",
    },
    {
      titre: "L'accord sujet-verbe",
      texte:
        "Le verbe s'accorde toujours avec son sujet. Si le sujet est au pluriel, le verbe est au pluriel.",
      exemple: "Le chien court. · Les chiens courent.",
    },
    {
      titre: "Le sujet peut être éloigné du verbe",
      texte:
        "Attention ! Le sujet n'est pas toujours juste avant le verbe. Il peut en être séparé.",
      exemple:
        "Les enfants, ce matin, jouent dans la cour. → sujet = les enfants",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Quel est le sujet dans : 'Le chat dort sur le canapé' ?",
    options: ["dort", "canapé", "Le chat", "sur"],
    reponse: "Le chat",
    explication: "Qui est-ce qui dort ? → Le chat. C'est le sujet.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Quel est le sujet dans : 'Les oiseaux chantent le matin' ?",
    options: ["chantent", "le matin", "Les oiseaux", "matin"],
    reponse: "Les oiseaux",
    explication: "Qui est-ce qui chantent ? → Les oiseaux.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quelle phrase est correcte ?",
    options: [
      "Les enfants joue.",
      "Les enfants jouent.",
      "Les enfant jouent.",
      "Les enfants joues.",
    ],
    reponse: "Les enfants jouent.",
    explication:
      "Avec 'les enfants' (pluriel), le verbe prend un -nt : jouent.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le sujet dans : 'Ce matin, Marie mange une pomme' ?",
    options: ["Ce matin", "mange", "une pomme", "Marie"],
    reponse: "Marie",
    explication:
      "Qui est-ce qui mange ? → Marie. 'Ce matin' indique le moment.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Complète avec le bon verbe : 'Mon frère ___ au foot.'",
    options: ["jouent", "jouez", "joue", "jouons"],
    reponse: "joue",
    explication: "'Mon frère' est singulier → on dit 'joue'.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Complète avec le bon verbe : 'Mes amis et moi ___ au parc.'",
    options: ["va", "allons", "allez", "vont"],
    reponse: "allons",
    explication: "'Mes amis et moi' = nous → on dit 'allons'.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Quel est le sujet dans : 'Dans la forêt, les renards chassent la nuit' ?",
    options: ["Dans la forêt", "la nuit", "chassent", "les renards"],
    reponse: "les renards",
    explication: "Qui est-ce qui chassent ? → les renards.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "Quelle phrase contient une erreur d'accord sujet-verbe ?",
    options: [
      "Les élèves travaillent.",
      "Le professeur explique.",
      "Les chiens aboie.",
      "Nous chantons.",
    ],
    reponse: "Les chiens aboie.",
    explication: "'Les chiens' est pluriel → il faut 'aboient'.",
    niveau: "difficile",
  },
  {
    id: 9,
    question: "Complète : 'La maîtresse et les élèves ___ la leçon.'",
    options: ["prépare", "prépares", "préparent", "préparez"],
    reponse: "préparent",
    explication: "Deux sujets = pluriel → 'préparent'.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Quel est le sujet dans : 'Tous les jours, ma mère prépare le dîner' ?",
    options: ["Tous les jours", "le dîner", "prépare", "ma mère"],
    reponse: "ma mère",
    explication: "Qui est-ce qui prépare ? → ma mère.",
    niveau: "difficile",
  },
];

// Identifiants uniques
const CLASSE = "ce2";
const MATIERE = "francais";
const THEME = "sujet-verbe";

export default function GrammaireCE2SujetVerbe() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useDecouverte();
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

  const questionsActives = questions.slice(0, maxQuestions);

  const shuffledOptions = useMemo(
    () => shuffleArray(questionsActives[qIndex]?.options ?? []),
    [qIndex],
  );
  const progression = Math.round((bonnes.length / questionsActives.length) * 100);

  useEffect(() => {
    getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
    getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
  }, [etape]);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questionsActives[qIndex].reponse;
    if (correct) setScore((s) => s + 1);
    setBonnes((b) => [...b, correct]);
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= questionsActives.length) {
      if (scoreSaved.current) return;
      scoreSaved.current = true;

      await saveScore({
        classe: CLASSE,
        matiere: MATIERE,
        theme: THEME,
        score: score,
        total: questionsActives.length,
      });
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

  const niveauLabel = (n: string) => {
    if (n === "facile") return "🟢 Facile";
    if (n === "moyen") return "🟡 Moyen";
    return "🔴 Difficile";
  };

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
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grammaire</span>
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
          <div className="niveau-label">
            {niveauLabel(questionsActives[qIndex].niveau)}
          </div>
        </div>
      )}

      {etape === "lecon" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">📝 Grammaire · CE2</div>
          <h1 className="lecon-titre">{lecon.titre}</h1>
          <p className="lecon-intro">{lecon.intro}</p>

          {/* SECTION DES SCORES */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {bestScore && (
              <div
                style={{
                  flex: 1,
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center",
                  color: "#4f8ef7",
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
                  textAlign: "center",
                  color: "#aaa",
                }}
              >
                ⏱️ Dernier
                <br />
                <strong style={{ color: "#fff" }}>
                  {lastScore.score} / {lastScore.total}
                </strong>
              </div>
            )}
          </div>

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
          <div className="qcm-question">{questionsActives[qIndex].question}</div>
          <div className="qcm-options">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                className={`qcm-option ${selected ? (opt === questionsActives[qIndex].reponse ? "correct" : opt === selected ? "incorrect" : "disabled") : ""}`}
                onClick={() => handleReponse(opt)}
              >
                {opt}
              </button>
            ))}
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
              ? "Tu maîtrises parfaitement le sujet et le verbe !"
              : score >= 7
                ? "Tu as bien compris l'essentiel."
                : "Relis la leçon et réessaie !"}
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
