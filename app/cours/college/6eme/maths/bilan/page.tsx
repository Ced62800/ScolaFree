"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Nombres entiers (5)
  {
    id: 1,
    theme: "nombres-entiers",
    question: "Quel est le chiffre des milliers dans 84 593 ?",
    options: ["8", "4", "5", "9"],
    reponse: "4",
    explication:
      "Dans 84 593 : 8=dizaines de milliers / 4=milliers / 5=centaines / 9=dizaines / 3=unités.",
  },
  {
    id: 2,
    theme: "nombres-entiers",
    question: "Quel est l'arrondi de 7 842 à la centaine près ?",
    options: ["7 800", "7 900", "8 000", "7 840"],
    reponse: "7 800",
    explication: "Le chiffre des dizaines est 4 < 5 → on reste à 7 800.",
  },
  {
    id: 3,
    theme: "nombres-entiers",
    question: "Lequel est le plus grand ?",
    options: ["98 765", "9 999", "100 001", "99 999"],
    reponse: "100 001",
    explication:
      "100 001 a 6 chiffres, les autres en ont 5 → 100 001 est le plus grand.",
  },
  {
    id: 4,
    theme: "nombres-entiers",
    question: "Comment écrit-on « cent mille cinquante » ?",
    options: ["100 500", "100 050", "10 050", "100 005"],
    reponse: "100 050",
    explication: "Cent mille = 100 000 + cinquante = 50 → 100 050.",
  },
  {
    id: 5,
    theme: "nombres-entiers",
    question: "Quelle est la valeur du chiffre 3 dans 130 472 ?",
    options: ["3", "300", "3 000", "30 000"],
    reponse: "30 000",
    explication:
      "Le 3 est au rang des dizaines de milliers → 3 × 10 000 = 30 000.",
  },
  // Nombres décimaux (5)
  {
    id: 6,
    theme: "nombres-decimaux",
    question: "Quel est le chiffre des centièmes dans 12,374 ?",
    options: ["1", "3", "7", "4"],
    reponse: "7",
    explication: "Après la virgule : 3=dixièmes / 7=centièmes / 4=millièmes.",
  },
  {
    id: 7,
    theme: "nombres-decimaux",
    question: "Lequel est le plus grand ?",
    options: ["4,09", "4,9", "4,19", "4,091"],
    reponse: "4,9",
    explication: "4,9 = 4,900 → 9 dixièmes > 0 dixième > 1 dixième.",
  },
  {
    id: 8,
    theme: "nombres-decimaux",
    question: "Comment écrit-on « huit unités et trois centièmes » ?",
    options: ["8,3", "8,03", "8,30", "80,3"],
    reponse: "8,03",
    explication: "3 centièmes = 2ème rang après la virgule → 8,03.",
  },
  {
    id: 9,
    theme: "nombres-decimaux",
    question: "Quel est l'arrondi de 5,763 au dixième près ?",
    options: ["5,7", "5,8", "6,0", "5,76"],
    reponse: "5,8",
    explication: "Le chiffre des centièmes est 6 ≥ 5 → on monte à 5,8.",
  },
  {
    id: 10,
    theme: "nombres-decimaux",
    question: "Combien de dixièmes y a-t-il dans 2,4 ?",
    options: ["2", "4", "24", "0,4"],
    reponse: "24",
    explication: "2,4 × 10 = 24 → il y a 24 dixièmes dans 2,4.",
  },
  // Fractions (5)
  {
    id: 11,
    theme: "fractions",
    question: "Dans la fraction 5/8, que représente le 8 ?",
    options: [
      "Le numérateur",
      "Le dénominateur",
      "Le quotient",
      "La partie entière",
    ],
    reponse: "Le dénominateur",
    explication:
      "Dans a/b : b = dénominateur (en bas) = nombre total de parts.",
  },
  {
    id: 12,
    theme: "fractions",
    question: "Quelle fraction est égale à 2/3 ?",
    options: ["3/4", "4/6", "3/6", "2/4"],
    reponse: "4/6",
    explication:
      "2/3 × (2/2) = 4/6. On multiplie numérateur ET dénominateur par 2.",
  },
  {
    id: 13,
    theme: "fractions",
    question: "Laquelle de ces fractions est supérieure à 1 ?",
    options: ["3/5", "6/7", "9/8", "4/5"],
    reponse: "9/8",
    explication: "9/8 : numérateur (9) > dénominateur (8) → fraction > 1.",
  },
  {
    id: 14,
    theme: "fractions",
    question: "Quelle est la fraction simplifiée de 8/12 ?",
    options: ["4/6", "2/3", "1/2", "3/4"],
    reponse: "2/3",
    explication: "PGCD(8,12) = 4 → 8÷4 / 12÷4 = 2/3.",
  },
  {
    id: 15,
    theme: "fractions",
    question: "Quelle est la somme de 2/5 + 1/5 ?",
    options: ["3/10", "3/5", "2/5", "1/5"],
    reponse: "3/5",
    explication:
      "Même dénominateur → additionne les numérateurs : 2+1=3 → 3/5.",
  },
  // Géométrie (5)
  {
    id: 16,
    theme: "geometrie",
    question: "Quelle est la somme des angles d'un triangle ?",
    options: ["90°", "180°", "270°", "360°"],
    reponse: "180°",
    explication: "La somme des angles d'un triangle est toujours 180°.",
  },
  {
    id: 17,
    theme: "geometrie",
    question: "Comment s'appellent deux droites qui ne se croisent jamais ?",
    options: ["Perpendiculaires", "Sécantes", "Parallèles", "Obliques"],
    reponse: "Parallèles",
    explication:
      "Des droites parallèles ne se croisent jamais, comme les rails de chemin de fer.",
  },
  {
    id: 18,
    theme: "geometrie",
    question: "Combien d'axes de symétrie a un rectangle ?",
    options: ["1", "2", "4", "0"],
    reponse: "2",
    explication: "Un rectangle a 2 axes de symétrie (les deux médianes).",
  },
  {
    id: 19,
    theme: "geometrie",
    question: "Quel polygone a 6 côtés ?",
    options: ["Pentagone", "Hexagone", "Octogone", "Heptagone"],
    reponse: "Hexagone",
    explication: "Hexa = 6. Pentagone = 5, Heptagone = 7, Octogone = 8.",
  },
  {
    id: 20,
    theme: "geometrie",
    question: "Dans un cercle, le diamètre est égal à :",
    options: ["Rayon ÷ 2", "Rayon × 2", "Rayon + 2", "Rayon × 3"],
    reponse: "Rayon × 2",
    explication: "Diamètre = 2 × rayon. Le diamètre passe par le centre.",
  },
];

const themeLabels: Record<string, string> = {
  "nombres-entiers": "🔢 Nombres entiers",
  "nombres-decimaux": "🔡 Nombres décimaux",
  fractions: "➗ Fractions",
  geometrie: "📐 Géométrie",
};

const themeColors: Record<string, string> = {
  "nombres-entiers": "#4f8ef7",
  "nombres-decimaux": "#2ec4b6",
  fractions: "#ffd166",
  geometrie: "#ff6b6b",
};

export default function BilanMaths6eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "nombres-entiers": 0,
    "nombres-decimaux": 0,
    fractions: 0,
    geometrie: 0,
  });
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstConnecte(!!user);
      if (user) {
        const b = await getBestScore("6eme", "maths", "bilan");
        const l = await getLastScore("6eme", "maths", "bilan");
        setBestScore(b);
        setLastScore(l);
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
        ? { label: "Très bien !", icon: "⭐", color: "#4f8ef7" }
        : totalScore >= 10
          ? { label: "Bien joué !", icon: "👍", color: "#ffd166" }
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
          classe: "6eme",
          matiere: "maths",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "maths", "bilan");
        const l = await getLastScore("6eme", "maths", "bilan");
        setBestScore(b);
        setLastScore(l);
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
      "nombres-entiers": 0,
      "nombres-decimaux": 0,
      fractions: 0,
      geometrie: 0,
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

  if (!estConnecte) {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
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
            Bilan réservé aux inscrits
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px", lineHeight: "1.6" }}>
            Inscris-toi gratuitement pour accéder au bilan et sauvegarder tes
            scores !
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
            ✨ S'inscrire gratuitement →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/6eme/maths")}
            style={{ cursor: "pointer" }}
          >
            Maths 6ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan 1 · Maths 6ème</div>
          <h1 className="lecon-titre">Bilan 1 — Maths 6ème</h1>
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
                    🏆 Record
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
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe les 4 thèmes de Maths 6ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔢</span>
              <span>5 questions — Nombres entiers</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>🔡</span>
              <span>5 questions — Nombres décimaux</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>➗</span>
              <span>5 questions — Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📐</span>
              <span>5 questions — Géométrie</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Commencer le bilan →
          </button>
        </div>
      )}

      {etape === "qcm" && (
        <>
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
              ></div>
            </div>
          </div>
          <div className="qcm-wrapper">
            <div className="qcm-question">
              {shuffledQuestions[qIndex].question}
            </div>
            <div className="qcm-options">
              {shuffledOptions.map((opt) => {
                let className = "qcm-option";
                if (selected) {
                  if (opt === shuffledQuestions[qIndex].reponse)
                    className += " correct";
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
                className={`qcm-feedback ${selected === shuffledQuestions[qIndex].reponse ? "feedback-correct" : "feedback-incorrect"}`}
              >
                <div className="feedback-icon">
                  {selected === shuffledQuestions[qIndex].reponse ? "✅" : "❌"}
                </div>
                <div className="feedback-texte">
                  <strong>
                    {selected === shuffledQuestions[qIndex].reponse
                      ? "Bravo !"
                      : "Pas tout à fait..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "Voir mon bilan →"
                  : "Question suivante →"}
              </button>
            )}
          </div>
        </>
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
                    🏆 Meilleur
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
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Détail par thème</h3>
            {Object.entries(scores).map(([theme, score]) => (
              <div key={theme} className="bilan-detail-row">
                <span className="bilan-detail-label">{themeLabels[theme]}</span>
                <div className="bilan-detail-bar-wrapper">
                  <div
                    className="bilan-detail-bar"
                    style={{
                      width: `${(score / 5) * 100}%`,
                      backgroundColor: themeColors[theme],
                    }}
                  ></div>
                </div>
                <span className="bilan-detail-score">{score}/5</span>
              </div>
            ))}
          </div>
          <p className="resultat-desc">
            {totalScore >= 18
              ? "Bravo, tu maîtrises les Maths 6ème Partie 1 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau, continue !"
                : totalScore >= 10
                  ? "Tu progresses bien !"
                  : "Courage ! Reprends les leçons et réessaie."}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/6eme/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
