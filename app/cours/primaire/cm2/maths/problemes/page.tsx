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
  titre: "Résoudre des problèmes à étapes",
  intro:
    "Un problème à étapes nécessite plusieurs calculs successifs. On lit attentivement, on identifie les données, on choisit les opérations dans le bon ordre.",
  points: [
    {
      titre: "Méthode de résolution",
      texte:
        "1. Lire et comprendre. 2. Repérer les données et ce qu'on cherche. 3. Planifier les étapes. 4. Calculer étape par étape. 5. Vérifier si le résultat est logique.",
      exemple: "Total → + · Reste → − · Chacun → ÷ · En tout → ×",
    },
    {
      titre: "Problèmes avec décimaux et pourcentages",
      texte:
        "En CM2, les problèmes peuvent mélanger décimaux, fractions et pourcentages. On applique les formules dans l'ordre logique.",
      exemple:
        "Prix avec remise : prix de base − (prix × taux de remise ÷ 100).",
    },
    {
      titre: "Problèmes de géométrie",
      texte:
        "Certains problèmes demandent de calculer des périmètres, aires ou volumes pour répondre à une question pratique.",
      exemple:
        "Combien de dalles pour couvrir 12 m² si chaque dalle fait 0,25 m² ? → 12 ÷ 0,25 = 48 dalles.",
    },
  ],
};

const questions = [
  {
    id: 1,
    question: "Un livre coûte 12,50 €. Paul en achète 3. Combien paie-t-il ?",
    options: ["35,50 €", "37,50 €", "38,50 €", "39,50 €"],
    reponse: "37,50 €",
    explication: "3 × 12,50 = 37,50 €.",
    niveau: "facile",
  },
  {
    id: 2,
    question: "Léa a 50 €. Elle dépense 18,75 €. Combien lui reste-t-il ?",
    options: ["30,25 €", "31,25 €", "31,75 €", "32,25 €"],
    reponse: "31,25 €",
    explication: "50 - 18,75 = 31,25 €.",
    niveau: "facile",
  },
  {
    id: 3,
    question:
      "Une classe de 32 élèves est répartie en groupes de 4. Combien de groupes ?",
    options: ["6", "7", "8", "9"],
    reponse: "8",
    explication: "32 ÷ 4 = 8 groupes.",
    niveau: "facile",
  },
  {
    id: 4,
    question:
      "Tom achète 4 stylos à 1,25 € et 3 cahiers à 2,50 €. Combien dépense-t-il ?",
    options: ["11,50 €", "12,00 €", "12,50 €", "13,00 €"],
    reponse: "12,50 €",
    explication: "4×1,25 + 3×2,50 = 5 + 7,50 = 12,50 €.",
    niveau: "moyen",
  },
  {
    id: 5,
    question: "Un rectangle mesure 8,5 cm × 4 cm. Quel est son périmètre ?",
    options: ["24 cm", "25 cm", "26 cm", "34 cm"],
    reponse: "25 cm",
    explication: "Périmètre = 2 × (8,5 + 4) = 2 × 12,5 = 25 cm.",
    niveau: "moyen",
  },
  {
    id: 6,
    question:
      "Un vêtement coûte 60 €. Il est soldé à -20%. Quel est le prix final ?",
    options: ["42 €", "44 €", "46 €", "48 €"],
    reponse: "48 €",
    explication: "20% de 60 = 12 €. Prix = 60 - 12 = 48 €.",
    niveau: "moyen",
  },
  {
    id: 7,
    question: "Combien de dalles de 0,25 m² faut-il pour couvrir 6 m² ?",
    options: ["18", "20", "24", "30"],
    reponse: "24",
    explication: "6 ÷ 0,25 = 24 dalles.",
    niveau: "moyen",
  },
  {
    id: 8,
    question:
      "Paul gagne 150 € par semaine. En 5 semaines, il dépense 480 €. Combien lui reste-t-il ?",
    options: ["240 €", "250 €", "260 €", "270 €"],
    reponse: "270 €",
    explication: "5 × 150 = 750 €. 750 - 480 = 270 €.",
    niveau: "difficile",
  },
  {
    id: 9,
    question:
      "Une corde de 9,6 m est coupée en morceaux de 0,8 m. Combien de morceaux ?",
    options: ["10", "11", "12", "14"],
    reponse: "12",
    explication: "9,6 ÷ 0,8 = 12 morceaux.",
    niveau: "difficile",
  },
  {
    id: 10,
    question: "Un train roule à 180 km/h. Combien de temps pour 270 km ?",
    options: ["1h", "1h30", "2h", "2h30"],
    reponse: "1h30",
    explication: "270 ÷ 180 = 1,5h = 1h30.",
    niveau: "difficile",
  },
];

const CLASSE = "cm2";
const MATIERE = "maths";
const THEME = "problemes";

export default function ProblemesCM2() {
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
          <span>CM2</span>
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
          <div className="lecon-badge">🧩 Problèmes · CM2</div>
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
              let cn = "qcm-option";
              if (selected) {
                if (opt === questionsActives[qIndex].reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={opt}
                  className={cn}
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
