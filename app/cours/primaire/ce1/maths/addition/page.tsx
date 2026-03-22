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
  titre: "L'addition posée",
  intro:
    "L'addition posée permet d'additionner des grands nombres en les écrivant en colonnes. On additionne chiffre par chiffre en commençant par les unités !",
  points: [
    {
      titre: "Poser une addition",
      texte:
        "On aligne les chiffres par colonne : unités sous unités, dizaines sous dizaines. On commence toujours par additionner les unités.",
      exemple: "  24\n+ 13\n----\n  37  (4+3=7 unités, 2+1=3 dizaines)",
    },
    {
      titre: "La retenue",
      texte:
        "Si la somme des unités dépasse 9, on pose le chiffre des unités et on retient 1 dizaine qu'on ajoute aux dizaines.",
      exemple: "  27\n+ 15\n----\n  42  (7+5=12 → on pose 2, on retient 1)",
    },
    {
      titre: "Vérifier son résultat",
      texte:
        "On peut vérifier une addition en changeant l'ordre des nombres. Le résultat doit être le même.",
      exemple: "24 + 13 = 37 · 13 + 24 = 37 ✓",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "21 + 14 = ?",
    options: ["34", "35", "36", "25"],
    reponse: "35",
    explication: "21 + 14 : unités 1+4=5, dizaines 2+1=3 → 35.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "30 + 25 = ?",
    options: ["55", "45", "65", "50"],
    reponse: "55",
    explication: "30 + 25 : 0+5=5 unités, 3+2=5 dizaines → 55.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "42 + 11 = ?",
    options: ["52", "53", "54", "43"],
    reponse: "53",
    explication: "42 + 11 : 2+1=3 unités, 4+1=5 dizaines → 53.",
    niveau: "facile",
  },
  {
    id: 4,
    question: "16 + 7 = ?",
    options: ["22", "23", "24", "21"],
    reponse: "23",
    explication: "16 + 7 : 6+7=13 → on pose 3, retenue 1. 1+1=2 dizaines → 23.",
    niveau: "facile",
  },
  {
    id: 5,
    question: "27 + 15 = ?",
    options: ["41", "42", "43", "44"],
    reponse: "42",
    explication:
      "27 + 15 : 7+5=12 → on pose 2, retenue 1. 2+1+1=4 dizaines → 42.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Tom a 34 billes. Il en gagne 28. Combien en a-t-il ?",
    options: ["60", "61", "62", "63"],
    reponse: "62",
    explication: "34 + 28 : 4+8=12 → on pose 2, retenue 1. 3+2+1=6 → 62.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "45 + 36 = ?",
    options: ["79", "80", "81", "82"],
    reponse: "81",
    explication: "45 + 36 : 5+6=11 → on pose 1, retenue 1. 4+3+1=8 → 81.",
    niveau: "moyen",
  },
  {
    id: 8,
    question: "53 + 29 = ?",
    options: ["80", "81", "82", "83"],
    reponse: "82",
    explication: "53 + 29 : 3+9=12 → on pose 2, retenue 1. 5+2+1=8 → 82.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Léa a 47 images. Sa sœur lui en donne 38. Combien en a-t-elle ?",
    options: ["83", "84", "85", "86"],
    reponse: "85",
    explication: "47 + 38 : 7+8=15 → on pose 5, retenue 1. 4+3+1=8 → 85.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "67 + 24 = ?",
    options: ["89", "90", "91", "92"],
    reponse: "91",
    explication: "67 + 24 : 7+4=11 → on pose 1, retenue 1. 6+2+1=9 → 91.",
    niveau: "difficile",
  },
];

const CLASSE = "ce1";
const MATIERE = "maths";
const THEME = "addition";

export default function AdditionCE1() {
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
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Addition</span>
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
          <div className="lecon-badge">➕ Addition · CE1</div>
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
              ? "Tu maîtrises parfaitement l'addition posée ! 🚀"
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
