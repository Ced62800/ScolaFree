"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Géométrie (5)
  {
    id: 1,
    theme: "geometrie",
    question: "Quelle est l'aire d'un triangle base=8 cm, hauteur=5 cm ?",
    options: ["40 cm²", "20 cm²", "13 cm²", "80 cm²"],
    reponse: "20 cm²",
    explication: "A = (base × hauteur)/2 = (8×5)/2 = 40/2 = 20 cm².",
  },
  {
    id: 2,
    theme: "geometrie",
    question: "Quelle est la formule de l'aire d'un disque de rayon r ?",
    options: ["2πr", "πr²", "πr", "2πr²"],
    reponse: "πr²",
    explication: "Aire = πr². Périmètre = 2πr. Aire en cm², périmètre en cm.",
  },
  {
    id: 3,
    theme: "geometrie",
    question:
      "Quelle est l'aire d'un trapèze (bases 4 et 8 cm, hauteur 3 cm) ?",
    options: ["18 cm²", "24 cm²", "12 cm²", "36 cm²"],
    reponse: "18 cm²",
    explication: "A = ((4+8)×3)/2 = (12×3)/2 = 36/2 = 18 cm².",
  },
  {
    id: 4,
    theme: "geometrie",
    question: "Combien de faces a un cube ?",
    options: ["4", "6", "8", "12"],
    reponse: "6",
    explication: "Un cube a 6 faces carrées, 12 arêtes et 8 sommets.",
  },
  {
    id: 5,
    theme: "geometrie",
    question: "Volume d'un cylindre r=2 cm, h=5 cm (en termes de π) ?",
    options: ["10π cm³", "20π cm³", "4π cm³", "40π cm³"],
    reponse: "20π cm³",
    explication: "V = πr²h = π×4×5 = 20π cm³.",
  },
  // Triangles & Pythagore (5)
  {
    id: 6,
    theme: "triangles-pythagore",
    question:
      "Dans un triangle rectangle, côtés a=6 et b=8. Quelle est l'hypoténuse ?",
    options: ["10", "14", "√28", "48"],
    reponse: "10",
    explication: "c²=6²+8²=36+64=100. c=√100=10 cm.",
  },
  {
    id: 7,
    theme: "triangles-pythagore",
    question: "L'hypoténuse vaut 13, un côté vaut 5. L'autre côté ?",
    options: ["8", "12", "18", "√134"],
    reponse: "12",
    explication: "b²=13²-5²=169-25=144. b=√144=12.",
  },
  {
    id: 8,
    theme: "triangles-pythagore",
    question: "Un triangle a les côtés 5, 12, 13. Est-il rectangle ?",
    options: ["Non", "Oui", "Impossible à dire", "Seulement si angle=90°"],
    reponse: "Oui",
    explication:
      "5²+12²=25+144=169=13². Réciproque de Pythagore → triangle rectangle.",
  },
  {
    id: 9,
    theme: "triangles-pythagore",
    question: "Qu'est-ce que l'hypoténuse ?",
    options: [
      "Le côté adjacent à l'angle droit",
      "Le côté le plus court",
      "Le côté en face de l'angle droit",
      "La hauteur du triangle",
    ],
    reponse: "Le côté en face de l'angle droit",
    explication:
      "L'hypoténuse est le côté opposé à l'angle droit = le côté le plus long.",
  },
  {
    id: 10,
    theme: "triangles-pythagore",
    question: "Qu'est-ce qu'un triangle isocèle ?",
    options: [
      "3 côtés égaux",
      "2 côtés égaux",
      "1 angle droit",
      "2 angles droits",
    ],
    reponse: "2 côtés égaux",
    explication: "Isocèle = 2 côtés égaux. Équilatéral = 3 côtés égaux.",
  },
  // Statistiques (5)
  {
    id: 11,
    theme: "statistiques",
    question: "Moyenne de : 6, 10, 14, 8, 12 ?",
    options: ["8", "10", "12", "9"],
    reponse: "10",
    explication: "(6+10+14+8+12)÷5 = 50÷5 = 10.",
  },
  {
    id: 12,
    theme: "statistiques",
    question: "Médiane de : 3, 5, 7, 9, 11 ?",
    options: ["5", "7", "9", "6"],
    reponse: "7",
    explication: "Série triée : 3,5,7,9,11. Valeur centrale (3ème) = 7.",
  },
  {
    id: 13,
    theme: "statistiques",
    question: "Étendue de : 4, 7, 2, 15, 9 ?",
    options: ["11", "13", "7", "15"],
    reponse: "13",
    explication: "Étendue = max - min = 15 - 2 = 13.",
  },
  {
    id: 14,
    theme: "statistiques",
    question: "25% des données = quel angle dans un diagramme circulaire ?",
    options: ["25°", "45°", "90°", "180°"],
    reponse: "90°",
    explication: "25% × 360° = 90°. 1/4 du disque = 90°.",
  },
  {
    id: 15,
    theme: "statistiques",
    question: "Qu'est-ce que le mode ?",
    options: [
      "La valeur centrale",
      "La valeur la plus fréquente",
      "La valeur moyenne",
      "La plus grande valeur",
    ],
    reponse: "La valeur la plus fréquente",
    explication:
      "Le mode est la valeur qui apparaît le plus souvent dans la série.",
  },
  // Probabilités (5)
  {
    id: 16,
    theme: "probabilites",
    question: "Dé à 6 faces. P(obtenir un nombre pair) ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    reponse: "1/2",
    explication: "Nombres pairs : 2,4,6 (3 cas). Total : 6. P = 3/6 = 1/2.",
  },
  {
    id: 17,
    theme: "probabilites",
    question: "Sac : 2 rouges, 3 bleues, 5 vertes. P(verte) ?",
    options: [
      "1/2",
      "5/10",
      "1/3",
      "Les deux premières réponses sont correctes",
    ],
    reponse: "Les deux premières réponses sont correctes",
    explication: "P(verte) = 5/10 = 1/2. Les deux fractions sont équivalentes.",
  },
  {
    id: 18,
    theme: "probabilites",
    question: "P(A) = 0,4. Quelle est P(Ā) ?",
    options: ["0,4", "0,6", "0,8", "1,4"],
    reponse: "0,6",
    explication: "P(Ā) = 1 - P(A) = 1 - 0,4 = 0,6.",
  },
  {
    id: 19,
    theme: "probabilites",
    question: "Quelle est la probabilité d'un événement impossible ?",
    options: ["0,5", "1", "0", "-1"],
    reponse: "0",
    explication: "Impossible → P = 0. Certain → P = 1. Toujours entre 0 et 1.",
  },
  {
    id: 20,
    theme: "probabilites",
    question: "On lance 2 dés. Combien y a-t-il de résultats possibles ?",
    options: ["6", "12", "36", "18"],
    reponse: "36",
    explication: "6 résultats par dé × 6 = 36 résultats possibles au total.",
  },
];

const themeLabels: Record<string, string> = {
  geometrie: "📐 Géométrie",
  "triangles-pythagore": "📏 Triangles & Pythagore",
  statistiques: "📈 Statistiques",
  probabilites: "🎲 Probabilités",
};
const themeColors: Record<string, string> = {
  geometrie: "#4f8ef7",
  "triangles-pythagore": "#2ec4b6",
  statistiques: "#ffd166",
  probabilites: "#ff6b6b",
};

export default function BilanMaths5eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    geometrie: 0,
    "triangles-pythagore": 0,
    statistiques: 0,
    probabilites: 0,
  });
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        setBestScore(await getBestScore("5eme", "maths", "bilan-2"));
        setLastScore(await getLastScore("5eme", "maths", "bilan-2"));
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
          classe: "5eme",
          matiere: "maths",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("5eme", "maths", "bilan-2"));
        setLastScore(await getLastScore("5eme", "maths", "bilan-2"));
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
      geometrie: 0,
      "triangles-pythagore": 0,
      statistiques: 0,
      probabilites: 0,
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
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Inscris-toi gratuitement pour accéder au bilan !
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

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button className="cours-back" onClick={() => router.back()}>
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span
            onClick={() => router.push("/cours/college/5eme/maths")}
            style={{ cursor: "pointer" }}
          >
            Maths 5ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Maths 5ème — Partie 2</div>
          <h1 className="lecon-titre">Bilan — Maths 5ème Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de Maths 5ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📐</span>
              <span>5 questions — Géométrie</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📏</span>
              <span>5 questions — Triangles & Pythagore</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📈</span>
              <span>5 questions — Statistiques</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🎲</span>
              <span>5 questions — Probabilités</span>
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
                      ? "Bravo ! 🎉"
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
              ? "Bravo, tu maîtrises les Maths 5ème Partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/college/5eme/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
