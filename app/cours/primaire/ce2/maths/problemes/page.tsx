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
  titre: "Résoudre des problèmes",
  intro:
    "Résoudre un problème, c'est comprendre la situation, choisir la bonne opération et calculer. On suit toujours les mêmes étapes !",
  points: [
    {
      titre: "Les étapes pour résoudre un problème",
      texte:
        "1. Je lis le problème. 2. Je comprends ce qu'on me demande. 3. Je choisis l'opération (+, -, ×, ÷). 4. Je calcule. 5. Je vérifie si la réponse est logique.",
      exemple:
        "On me demande un total → addition · On me demande ce qui reste → soustraction",
    },
    {
      titre: "Les mots clés",
      texte:
        "'En tout', 'au total', 'ensemble' → addition. 'Reste', 'de moins', 'différence' → soustraction. 'Fois', 'chacun' → multiplication. 'Partager', 'répartir' → division.",
      exemple:
        "Il reste 5 bonbons → soustraction · Chaque élève a 3 crayons → multiplication",
    },
    {
      titre: "Les problèmes à deux étapes",
      texte:
        "Certains problèmes nécessitent deux calculs. On résout d'abord la première étape, puis on utilise ce résultat pour la deuxième.",
      exemple:
        "Tom achète 3 cahiers à 2 € et un stylo à 1,50 €. Total = (3×2) + 1,50 = 7,50 €",
    },
  ],
};

const questions = [
  {
    id: 1,
    question:
      "Une boîte contient 24 crayons. On en distribue 9. Combien en reste-t-il ?",
    options: ["13", "14", "15", "16"],
    reponse: "15",
    explication: "24 − 9 = 15 crayons restants.",
    niveau: "facile",
  },
  {
    id: 2,
    question:
      "Léa a 35 billes. Elle en gagne 18. Combien en a-t-elle maintenant ?",
    options: ["51", "52", "53", "54"],
    reponse: "53",
    explication: "35 + 18 = 53 billes.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "6 élèves ont chacun 7 bonbons. Combien en tout ?",
    options: ["36", "40", "42", "48"],
    reponse: "42",
    explication: "6 × 7 = 42 bonbons.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "On répartit 32 images entre 4 enfants. Combien chacun en reçoit-il ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "32 ÷ 4 = 8 images par enfant.",
    niveau: "facile",
  },
  {
    id: 5,
    question:
      "Une école a 245 filles et 318 garçons. Combien d'élèves en tout ?",
    options: ["553", "563", "573", "583"],
    reponse: "563",
    explication: "245 + 318 = 563 élèves.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Tom a 150 €. Il achète un livre à 23 € et un jeu à 47 €. Combien lui reste-t-il ?",
    options: ["70 €", "75 €", "80 €", "85 €"],
    reponse: "80 €",
    explication: "23 + 47 = 70 €. 150 − 70 = 80 € restants.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Une boulangerie vend 125 pains le matin et 87 l'après-midi. Combien en tout ?",
    options: ["202", "212", "222", "232"],
    reponse: "212",
    explication: "125 + 87 = 212 pains.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "5 paquets contiennent chacun 8 bonbons. On en mange 12. Combien reste-t-il ?",
    options: ["26", "28", "30", "32"],
    reponse: "28",
    explication: "5 × 8 = 40 bonbons. 40 − 12 = 28 restants.",
    niveau: "moyen",
  },
  {
    id: 9,
    question:
      "Un train a 346 passagers. À la gare, 127 descendent et 89 montent. Combien y a-t-il de passagers ?",
    options: ["298", "308", "318", "328"],
    reponse: "308",
    explication: "346 − 127 = 219. 219 + 89 = 308 passagers.",
    niveau: "difficile",
  },
  {
    id: 10,
    question:
      "Chaque élève lit 15 pages par jour. En 6 jours, combien de pages lit-il ?",
    options: ["80", "85", "90", "95"],
    reponse: "90",
    explication: "15 × 6 = 90 pages.",
    niveau: "difficile",
  },
];

const CLASSE = "ce2";
const MATIERE = "maths";
const THEME = "problemes";

export default function ProblemesCE2() {
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
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Problèmes</span>
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
          <div className="lecon-badge">🧩 Problèmes · CE2</div>
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
              ? "Tu es un(e) expert(e) des problèmes ! 🚀"
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
