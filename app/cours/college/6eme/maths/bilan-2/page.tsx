"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Le calcul (5)
  {
    id: 1,
    theme: "calcul",
    question: "Combien vaut 5 + 3 x 4 ?",
    options: ["32", "17", "27", "20"],
    reponse: "17",
    explication:
      "La multiplication est prioritaire : 3 x 4 = 12 d'abord, puis 5 + 12 = 17.",
  },
  {
    id: 2,
    theme: "calcul",
    question: "Combien vaut (6 + 2) x 3 ?",
    options: ["12", "20", "24", "18"],
    reponse: "24",
    explication: "Les parenthèses d'abord : 6 + 2 = 8, puis 8 x 3 = 24.",
  },
  {
    id: 3,
    theme: "calcul",
    question: "Quel est le reste de 35 divise par 6 ?",
    options: ["4", "5", "6", "1"],
    reponse: "5",
    explication: "6 x 5 = 30 et 35 - 30 = 5. Donc quotient = 5, reste = 5.",
  },
  {
    id: 4,
    theme: "calcul",
    question: "Combien vaut 18 - 2 x 4 + 3 ?",
    options: ["68", "13", "16", "11"],
    reponse: "13",
    explication: "Priorité x : 2 x 4 = 8. Puis 18 - 8 + 3 = 10 + 3 = 13.",
  },
  {
    id: 5,
    theme: "calcul",
    question: "Quel est le quotient de 52 divise par 4 ?",
    options: ["11", "12", "13", "14"],
    reponse: "13",
    explication: "4 x 13 = 52. Vérification : 13 x 4 = 52.",
  },
  // La proportionnalité (5)
  {
    id: 6,
    theme: "proportionnalite",
    question: "Si 4 cahiers coûtent 8 euros, combien coûtent 10 cahiers ?",
    options: ["16 euros", "18 euros", "20 euros", "24 euros"],
    reponse: "20 euros",
    explication:
      "Prix d'un cahier = 8 / 4 = 2 euros. Pour 10 : 10 x 2 = 20 euros.",
  },
  {
    id: 7,
    theme: "proportionnalite",
    question: "Une voiture roule à 90 km/h. Quelle distance en 3 heures ?",
    options: ["180 km", "240 km", "270 km", "300 km"],
    reponse: "270 km",
    explication: "Distance = vitesse x temps = 90 x 3 = 270 km.",
  },
  {
    id: 8,
    theme: "proportionnalite",
    question:
      "Le coefficient de proportionnalité entre x et y est 5. Si x = 7, quelle est la valeur de y ?",
    options: ["2", "12", "35", "25"],
    reponse: "35",
    explication: "y = k x x = 5 x 7 = 35.",
  },
  {
    id: 9,
    theme: "proportionnalite",
    question:
      "Pour 6 personnes il faut 240g de riz. Combien pour 9 personnes ?",
    options: ["300g", "360g", "320g", "400g"],
    reponse: "360g",
    explication: "Pour 1 personne : 240 / 6 = 40g. Pour 9 : 40 x 9 = 360g.",
  },
  {
    id: 10,
    theme: "proportionnalite",
    question:
      "x et y sont proportionnels avec k = 6. Si y = 42, quelle est la valeur de x ?",
    options: ["5", "6", "7", "8"],
    reponse: "7",
    explication: "x = y / k = 42 / 6 = 7.",
  },
  // Aires et périmètres (5)
  {
    id: 11,
    theme: "aires-perimetres",
    question:
      "Quel est le périmètre d'un rectangle de longueur 9 cm et largeur 4 cm ?",
    options: ["26 cm", "36 cm", "13 cm", "72 cm"],
    reponse: "26 cm",
    explication: "P = 2 x (9 + 4) = 2 x 13 = 26 cm.",
  },
  {
    id: 12,
    theme: "aires-perimetres",
    question:
      "Quelle est l'aire d'un rectangle de longueur 6 cm et largeur 5 cm ?",
    options: ["22 cm2", "30 cm2", "11 cm2", "60 cm2"],
    reponse: "30 cm2",
    explication: "A = 6 x 5 = 30 cm2.",
  },
  {
    id: 13,
    theme: "aires-perimetres",
    question: "Quelle est l'aire d'un triangle de base 8 cm et hauteur 5 cm ?",
    options: ["40 cm2", "20 cm2", "13 cm2", "26 cm2"],
    reponse: "20 cm2",
    explication: "A = (base x hauteur) / 2 = (8 x 5) / 2 = 40 / 2 = 20 cm2.",
  },
  {
    id: 14,
    theme: "aires-perimetres",
    question: "Le périmètre d'un carré est 28 cm. Quel est son côté ?",
    options: ["4 cm", "7 cm", "14 cm", "56 cm"],
    reponse: "7 cm",
    explication: "Côté = périmètre / 4 = 28 / 4 = 7 cm.",
  },
  {
    id: 15,
    theme: "aires-perimetres",
    question: "Quelle est l'aire d'un carré de côté 8 cm ?",
    options: ["32 cm2", "64 cm2", "16 cm2", "24 cm2"],
    reponse: "64 cm2",
    explication: "A = côté x côté = 8 x 8 = 64 cm2.",
  },
  // Les statistiques (5)
  {
    id: 16,
    theme: "statistiques",
    question: "Quelle est la moyenne de ces notes : 10, 14, 8, 16, 12 ?",
    options: ["11", "12", "13", "14"],
    reponse: "12",
    explication: "(10+14+8+16+12) / 5 = 60 / 5 = 12.",
  },
  {
    id: 17,
    theme: "statistiques",
    question: "Dans la série 5, 8, 12, 15, 20, quelle est la médiane ?",
    options: ["8", "10", "12", "15"],
    reponse: "12",
    explication:
      "La médiane est la valeur centrale. 5 valeurs → 3ème valeur = 12.",
  },
  {
    id: 18,
    theme: "statistiques",
    question: "Dans la série 4, 7, 7, 9, 12, 7, quel est le mode ?",
    options: ["4", "7", "9", "12"],
    reponse: "7",
    explication: "Le mode est la valeur la plus fréquente. 7 apparait 3 fois.",
  },
  {
    id: 19,
    theme: "statistiques",
    question:
      "Les températures sont 14, 18, 11, 20, 17 degrés. Quelle est l'étendue ?",
    options: ["6", "8", "9", "11"],
    reponse: "9",
    explication: "Etendue = max - min = 20 - 11 = 9.",
  },
  {
    id: 20,
    theme: "statistiques",
    question:
      "Un sac contient 4 billes rouges et 6 billes bleues. Quelle est la probabilité de tirer une bille rouge ?",
    options: ["4/6", "6/10", "4/10", "2/5"],
    reponse: "4/10",
    explication: "P(rouge) = cas favorables / total = 4 / (4+6) = 4/10.",
  },
];

const themeLabels: Record<string, string> = {
  calcul: "➕ Le calcul",
  proportionnalite: "📊 Proportionnalité",
  "aires-perimetres": "📏 Aires et périmètres",
  statistiques: "📈 Statistiques",
};

const themeColors: Record<string, string> = {
  calcul: "#4f8ef7",
  proportionnalite: "#2ec4b6",
  "aires-perimetres": "#ffd166",
  statistiques: "#ff6b6b",
};

export default function BilanMaths6emePage2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    calcul: 0,
    proportionnalite: 0,
    "aires-perimetres": 0,
    statistiques: 0,
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
        const b = await getBestScore("6eme", "maths", "bilan-2");
        const l = await getLastScore("6eme", "maths", "bilan-2");
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
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("6eme", "maths", "bilan-2");
        const l = await getLastScore("6eme", "maths", "bilan-2");
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
      calcul: 0,
      proportionnalite: 0,
      "aires-perimetres": 0,
      statistiques: 0,
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
            onClick={() => router.push("/cours/college/6eme/maths/page-2")}
            style={{ cursor: "pointer" }}
          >
            Maths 6ème — Partie 2
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan 2 · Maths 6ème</div>
          <h1 className="lecon-titre">Bilan 2 — Maths 6ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Maths 6ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>➕</span>
              <span>5 questions — Le calcul</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📊</span>
              <span>5 questions — Proportionnalité</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>📏</span>
              <span>5 questions — Aires et périmètres</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📈</span>
              <span>5 questions — Statistiques</span>
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
              ? "Bravo, tu maîtrises les Maths 6ème Partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/college/6eme/maths/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
