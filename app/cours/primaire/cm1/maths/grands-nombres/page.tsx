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
  titre: "Les grands nombres jusqu'à 1 000 000",
  intro:
    "En CM1, on travaille avec des nombres pouvant aller jusqu'à un million. On apprend à les lire, les écrire et les décomposer en millions, centaines de milliers, dizaines de milliers, milliers, centaines, dizaines et unités.",
  points: [
    {
      titre: "La classe des milliers",
      texte:
        "Un nombre à 6 chiffres se décompose en deux classes : la classe des milliers (centaines, dizaines, unités de milliers) et la classe des unités (centaines, dizaines, unités).",
      exemple:
        "345 678 = 345 milliers + 678 unités · 3c.mill + 4d.mill + 5u.mill + 6c + 7d + 8u",
    },
    {
      titre: "Lire et écrire les grands nombres",
      texte:
        "On lit par tranche de 3 chiffres en partant de la droite. On sépare les tranches par une espace.",
      exemple:
        "1 000 000 → un million · 250 000 → deux cent cinquante mille · 47 320 → quarante-sept mille trois cent vingt",
    },
    {
      titre: "Comparer et ranger",
      texte:
        "Pour comparer deux grands nombres, on regarde d'abord le nombre de chiffres, puis chiffre par chiffre de gauche à droite.",
      exemple:
        "425 000 > 98 000 (6 chiffres > 5 chiffres) · 345 678 > 345 234 (même jusqu'au 4e chiffre, 6 > 2)",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Comment s'écrit « deux cent mille » ?",
    options: ["20 000", "200 000", "2 000 000", "20 000 000"],
    reponse: "200 000",
    explication: "200 000 = deux cent mille.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Combien de chiffres a le nombre un million ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication: "1 000 000 a 7 chiffres.",
    niveau: "facile",
  },
  {
    id: 3,
    question: "Quel nombre vient juste après 99 999 ?",
    options: ["99 998", "100 000", "100 001", "999 999"],
    reponse: "100 000",
    explication: "Après 99 999 vient 100 000 (cent mille).",
    niveau: "facile",
  },
  {
    id: 4,
    question: "Quel est le chiffre des dizaines de milliers dans 347 826 ?",
    options: ["3", "4", "7", "8"],
    reponse: "4",
    explication:
      "347 826 : 3=centaines de milliers, 4=dizaines de milliers, 7=milliers...",
    niveau: "facile",
  },
  {
    id: 5,
    question: "Lequel est le plus grand ?",
    options: ["98 765", "100 001", "99 999", "98 999"],
    reponse: "100 001",
    explication:
      "100 001 a 6 chiffres, les autres en ont 5 → 100 001 est le plus grand.",
    niveau: "moyen",
  },
  {
    id: 6,
    question: "Comment s'écrit « quatre cent cinquante mille deux cents » ?",
    options: ["45 200", "450 200", "4 500 200", "45 020"],
    reponse: "450 200",
    explication: "450 000 + 200 = 450 200.",
    niveau: "moyen",
  },
  {
    id: 7,
    question:
      "Range dans l'ordre croissant : 250 000 · 25 000 · 2 500 000 · 2 500",
    options: [
      "2 500 – 25 000 – 250 000 – 2 500 000",
      "2 500 000 – 250 000 – 25 000 – 2 500",
      "25 000 – 2 500 – 250 000 – 2 500 000",
      "2 500 – 250 000 – 25 000 – 2 500 000",
    ],
    reponse: "2 500 – 25 000 – 250 000 – 2 500 000",
    explication:
      "On range du plus petit au plus grand selon le nombre de chiffres.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Quel nombre = 3 centaines de milliers + 5 dizaines de milliers + 2 milliers ?",
    options: ["352 000", "350 200", "352 000", "305 200"],
    reponse: "352 000",
    explication: "300 000 + 50 000 + 2 000 = 352 000.",
    niveau: "moyen",
  },
  {
    id: 9,
    question: "Comment lit-on 607 050 ?",
    options: [
      "Six cent sept mille cinquante",
      "Six millions sept cent cinquante",
      "Soixante-sept mille cinquante",
      "Six cent soixante-dix mille",
    ],
    reponse: "Six cent sept mille cinquante",
    explication:
      "607 050 = 607 milliers + 050 unités = six cent sept mille cinquante.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Quel nombre est entre 500 000 et 600 000 ?",
    options: ["499 999", "600 001", "550 000", "650 000"],
    reponse: "550 000",
    explication: "550 000 est bien entre 500 000 et 600 000.",
    niveau: "difficile",
  },
];

const CLASSE = "cm1";
const MATIERE = "maths";
const THEME = "grands-nombres";

export default function GrandsNombresCM1() {
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
          onClick={() => router.push(`/cours/primaire/${CLASSE}/${MATIERE}`)}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Maths</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Grands nombres</span>
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
          <div className="lecon-badge">🔢 Grands nombres · CM1</div>
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
              ? "Tu maîtrises les grands nombres ! 🚀"
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
