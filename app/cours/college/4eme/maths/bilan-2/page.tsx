"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  {
    id: 1,
    theme: "geometrie-2",
    question: "Si (DE) // (BC), AD=4, AB=10, AE=3. Calcule AC.",
    options: ["6", "7", "7,5", "12"],
    reponse: "7,5",
    explication: "Thales : AD/AB = AE/AC. 4/10 = 3/AC. AC = 30/4 = 7,5.",
  },
  {
    id: 2,
    theme: "geometrie-2",
    question: "Agrandissement de rapport k=2. Un cote de 5 cm devient ?",
    options: ["2,5 cm", "5 cm", "10 cm", "25 cm"],
    reponse: "10 cm",
    explication: "Longueur image = longueur x k = 5 x 2 = 10 cm.",
  },
  {
    id: 3,
    theme: "geometrie-2",
    question: "Rectangle 6x4, agrandi avec k=1,5. Aire du nouveau rectangle ?",
    options: ["36 cm2", "54 cm2", "24 cm2", "60 cm2"],
    reponse: "54 cm2",
    explication:
      "Nouvelles dimensions : 9x6. Aire = 54 cm2. Ou 24 x k^2 = 24 x 2,25 = 54.",
  },
  {
    id: 4,
    theme: "geometrie-2",
    question: "La reciproque de Thales sert a :",
    options: [
      "Calculer des longueurs",
      "Prouver que deux droites sont paralleles",
      "Calculer des angles",
      "Prouver l isoscelie",
    ],
    reponse: "Prouver que deux droites sont paralleles",
    explication:
      "Reciproque : si AD/AB = AE/AC alors (DE) // (BC). Sert a prouver le parallelisme.",
  },
  {
    id: 5,
    theme: "geometrie-2",
    question:
      "Triangle similaire : cotes 3,4,5. Petit cote image = 6. Grand cote image ?",
    options: ["8", "9", "10", "12"],
    reponse: "10",
    explication: "Rapport k = 6/3 = 2. Grand cote = 5 x 2 = 10.",
  },
  {
    id: 6,
    theme: "trigonometrie",
    question: "Comment se calcule sin(A) dans un triangle rectangle ?",
    options: [
      "adjacent/hypotenuse",
      "oppose/hypotenuse",
      "oppose/adjacent",
      "hypotenuse/oppose",
    ],
    reponse: "oppose/hypotenuse",
    explication: "SOH : Sin = Oppose / Hypotenuse.",
  },
  {
    id: 7,
    theme: "trigonometrie",
    question: "Comment se calcule cos(A) ?",
    options: [
      "oppose/hypotenuse",
      "adjacent/hypotenuse",
      "oppose/adjacent",
      "hypotenuse/adjacent",
    ],
    reponse: "adjacent/hypotenuse",
    explication: "CAH : Cos = Adjacent / Hypotenuse.",
  },
  {
    id: 8,
    theme: "trigonometrie",
    question: "Triangle rectangle en C, AB=10, angle A=30 deg. BC = ?",
    options: ["5 cm", "8,66 cm", "11,55 cm", "17,32 cm"],
    reponse: "5 cm",
    explication: "sin(30)=0,5. BC = AB x sin(A) = 10 x 0,5 = 5 cm.",
  },
  {
    id: 9,
    theme: "trigonometrie",
    question: "tan(45 deg) = ?",
    options: ["0", "0,5", "1", "racine de 2"],
    reponse: "1",
    explication:
      "tan(45 deg) = 1. Triangle isocele rectangle : cotes egaux, tan = 1.",
  },
  {
    id: 10,
    theme: "trigonometrie",
    question: "Pour trouver un angle dont on connait le sinus, on utilise :",
    options: ["sin", "cos", "arcsin", "tan"],
    reponse: "arcsin",
    explication:
      "arcsin (sin inverse) donne l angle. sin(A) = 0,5 => A = arcsin(0,5) = 30 deg.",
  },
  {
    id: 11,
    theme: "statistiques-2",
    question: "Serie : 3,5,7,7,9,11. Mediane ?",
    options: ["7", "7,5", "6", "8"],
    reponse: "7",
    explication: "6 valeurs. Mediane = (7+7)/2 = 7.",
  },
  {
    id: 12,
    theme: "statistiques-2",
    question: "Serie : 2,4,4,6,8,8,8,10. Mode ?",
    options: ["4", "6", "8", "10"],
    reponse: "8",
    explication: "8 apparait 3 fois. C est la valeur la plus frequente.",
  },
  {
    id: 13,
    theme: "statistiques-2",
    question: "Qu est-ce que l ecart interquartile ?",
    options: ["Q3 - Q1", "Q3 + Q1", "Moyenne - Mediane", "Max - Min"],
    reponse: "Q3 - Q1",
    explication:
      "Ecart interquartile = Q3 - Q1. Mesure la dispersion des 50% centraux.",
  },
  {
    id: 14,
    theme: "statistiques-2",
    question: "Dans un diagramme en boite, la ligne centrale represente :",
    options: ["La moyenne", "La mediane", "Q1", "Q3"],
    reponse: "La mediane",
    explication: "Le trait au milieu du rectangle = mediane. Pas la moyenne !",
  },
  {
    id: 15,
    theme: "statistiques-2",
    question: "Quelle mesure est la plus robuste aux valeurs extremes ?",
    options: ["La moyenne", "La mediane", "L etendue", "Le mode"],
    reponse: "La mediane",
    explication:
      "La mediane depend de la position, pas des valeurs. Robuste aux valeurs aberrantes.",
  },
  {
    id: 16,
    theme: "probabilites-2",
    question: "De a 6 faces. P(nombre pair) = ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    reponse: "1/2",
    explication: "3 nombres pairs (2,4,6) sur 6. P = 3/6 = 1/2.",
  },
  {
    id: 17,
    theme: "probabilites-2",
    question: "Urne : 3 rouges, 7 bleues. P(rouge) = ?",
    options: ["3/7", "7/10", "3/10", "1/3"],
    reponse: "3/10",
    explication: "Total = 10. P(rouge) = 3/10.",
  },
  {
    id: 18,
    theme: "probabilites-2",
    question: "P(A) = 0,3. P(contraire) = ?",
    options: ["0,3", "0,7", "0,6", "1,3"],
    reponse: "0,7",
    explication: "P(non A) = 1 - P(A) = 1 - 0,3 = 0,7.",
  },
  {
    id: 19,
    theme: "probabilites-2",
    question: "P(A)=0,4 et P(B)=0,5 incompatibles. P(A ou B) = ?",
    options: ["0,2", "0,9", "0,1", "0,45"],
    reponse: "0,9",
    explication: "Incompatibles : P(A ou B) = P(A) + P(B) = 0,4 + 0,5 = 0,9.",
  },
  {
    id: 20,
    theme: "probabilites-2",
    question: "5 issues equiprobables. P(chaque issue) = ?",
    options: ["5", "1/5", "0,5", "1"],
    reponse: "1/5",
    explication: "Issues equiprobables : P = 1/n = 1/5.",
  },
];

const themeLabels: Record<string, string> = {
  "geometrie-2": "Geometrie et Thales",
  trigonometrie: "Trigonometrie",
  "statistiques-2": "Statistiques",
  "probabilites-2": "Probabilites",
};
const themeColors: Record<string, string> = {
  "geometrie-2": "#4f8ef7",
  trigonometrie: "#2ec4b6",
  "statistiques-2": "#ffd166",
  "probabilites-2": "#ff6b6b",
};

export default function BilanMaths4eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "geometrie-2": 0,
    trigonometrie: 0,
    "statistiques-2": 0,
    "probabilites-2": 0,
  });
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        setBestScore(await getBestScore("4eme", "maths", "bilan-2"));
        setLastScore(await getLastScore("4eme", "maths", "bilan-2"));
      }
      setChargement(false);
    };
    init();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);

  const progression = ((qIndex + 1) / shuffledQuestions.length) * 100;
  const totalScore = scoreRef.current;
  const mention =
    totalScore >= 18
      ? { label: "Excellent !", icon: "🏆", color: "#2ec4b6" }
      : totalScore >= 14
        ? { label: "Tres bien !", icon: "⭐", color: "#4f8ef7" }
        : totalScore >= 10
          ? { label: "Bien !", icon: "👍", color: "#ffd166" }
          : { label: "Continue !", icon: "💪", color: "#ff6b6b" };

  const handleReponse = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === shuffledQuestions[qIndex].reponse) {
      scoreRef.current += 1;
      setScores((prev) => ({
        ...prev,
        [shuffledQuestions[qIndex].theme]:
          (prev[shuffledQuestions[qIndex].theme] || 0) + 1,
      }));
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current && estConnecte) {
        isSaving.current = true;
        await saveScore({
          classe: "4eme",
          matiere: "maths",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "maths", "bilan-2"));
        setLastScore(await getLastScore("4eme", "maths", "bilan-2"));
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreRef.current = 0;
    isSaving.current = false;
    setScores({
      "geometrie-2": 0,
      trigonometrie: 0,
      "statistiques-2": 0,
      "probabilites-2": 0,
    });
    setQIndex(0);
    setSelected(null);
    setEtape("qcm");
  };

  if (chargement)
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#aaa" }}>
        Chargement...
      </div>
    );

  if (!estConnecte)
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div
          style={{
            maxWidth: "500px",
            margin: "80px auto",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            Bilan reserve aux inscrits
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Inscris-toi gratuitement pour acceder au bilan !
          </p>
          <button
            onClick={() => router.push("/inscription")}
            style={{
              background: "linear-gradient(135deg, #f7974f, #f74f4f)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "16px 32px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            S inscrire gratuitement
          </button>
        </div>
      </div>
    );

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/4eme/maths")}
            style={{ cursor: "pointer" }}
          >
            Maths 4eme
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">Bilan Maths 4eme — Partie 2</div>
          <h1 className="lecon-titre">Bilan Maths 4eme — Partie 2</h1>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Record
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 themes de Maths 4eme Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>5 questions</span>
              <span>Geometrie et Thales</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>5 questions</span>
              <span>Trigonometrie</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>5 questions</span>
              <span>Statistiques</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>5 questions</span>
              <span>Probabilites</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <div>
          <div className="progression-wrapper">
            <div className="progression-info">
              <span>
                Question {qIndex + 1} / {shuffledQuestions.length}
              </span>
              <span
                style={{ color: themeColors[shuffledQuestions[qIndex].theme] }}
              >
                {themeLabels[shuffledQuestions[qIndex].theme]}
              </span>
            </div>
            <div className="progression-bar">
              <div
                className="progression-fill"
                style={{ width: `${progression}%` }}
              />
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let cn = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    cn += " correct";
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
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Bravo !"
                      : "Pas tout a fait..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "Voir mon bilan"
                  : "Question suivante"}
              </button>
            )}
          </div>
        </div>
      )}

      {etape === "fini" && (
        <div className="resultat-wrapper">
          <div className="resultat-icon">{mention.icon}</div>
          <h2 className="resultat-titre" style={{ color: mention.color }}>
            {mention.label}
          </h2>
          <div className="resultat-score" style={{ color: mention.color }}>
            {totalScore} / 20
          </div>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46,196,182,0.1)",
                    borderRadius: "12px",
                    border: "1px solid #2ec4b6",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Meilleur
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {bestScore.score}/20
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Detail par theme</h3>
            {Object.entries(scores as Record<string, number>).map(
              ([theme, scoreVal]) => (
                <div key={theme} className="bilan-detail-row">
                  <span className="bilan-detail-label">
                    {themeLabels[theme]}
                  </span>
                  <div className="bilan-detail-bar-wrapper">
                    <div
                      className="bilan-detail-bar"
                      style={{
                        width: `${(scoreVal / 5) * 100}%`,
                        backgroundColor: themeColors[theme],
                      }}
                    />
                  </div>
                  <span className="bilan-detail-score">{scoreVal}/5</span>
                </div>
              ),
            )}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Bravo, tu maitrises les Maths 4eme Partie 2 !"
              : totalScore >= 14
                ? "Tres bon niveau !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Reprends les lecons et reessaie !"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/4eme/maths/page-2")}
            >
              Retour aux themes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
