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
    theme: "nombres-relatifs-2",
    question: "Calcule : (-3) x (+5)",
    options: ["+15", "-15", "+8", "-8"],
    reponse: "-15",
    explication: "Signes differents : resultat negatif. (-3) x (+5) = -15.",
  },
  {
    id: 2,
    theme: "nombres-relatifs-2",
    question: "Calcule : (-4) x (-6)",
    options: ["-24", "+24", "-10", "+10"],
    reponse: "+24",
    explication: "Deux negatifs : resultat positif. (-4) x (-6) = +24.",
  },
  {
    id: 3,
    theme: "nombres-relatifs-2",
    question: "Calcule : (-2) a la puissance 3",
    options: ["-8", "+8", "-6", "+6"],
    reponse: "-8",
    explication: "Puissance impaire d un negatif = negatif. (-2)^3 = -8.",
  },
  {
    id: 4,
    theme: "nombres-relatifs-2",
    question: "Priorites : (-3) + 2 x (-4)",
    options: ["-20", "+5", "-11", "+11"],
    reponse: "-11",
    explication: "Multiplication d abord : 2x(-4)=-8, puis (-3)+(-8)=-11.",
  },
  {
    id: 5,
    theme: "nombres-relatifs-2",
    question: "Carre de (-7) ?",
    options: ["-49", "+49", "-14", "+14"],
    reponse: "+49",
    explication: "Puissance paire d un negatif = positif. (-7)^2 = +49.",
  },
  {
    id: 6,
    theme: "fractions-2",
    question: "Calcule : 2/3 + 5/4",
    options: ["7/7", "23/12", "7/12", "10/12"],
    reponse: "23/12",
    explication: "PPCM(3,4)=12. 8/12 + 15/12 = 23/12.",
  },
  {
    id: 7,
    theme: "fractions-2",
    question: "Calcule : (2/3) x (9/4)",
    options: ["18/12", "3/2", "11/7", "6/7"],
    reponse: "3/2",
    explication:
      "2/3 x 9/4 = 18/12 = 3/2. Simplifier avant : 2 et 4 par 2, 9 et 3 par 3.",
  },
  {
    id: 8,
    theme: "fractions-2",
    question: "Calcule : (5/6) divise par (5/9)",
    options: ["25/54", "3/2", "1/2", "10/15"],
    reponse: "3/2",
    explication:
      "Division = multiplier par l inverse. 5/6 x 9/5 = 45/30 = 3/2.",
  },
  {
    id: 9,
    theme: "fractions-2",
    question: "Simplifie : 36/48",
    options: ["18/24", "6/8", "3/4", "9/12"],
    reponse: "3/4",
    explication: "PGCD(36,48)=12. 36/12=3. 48/12=4. Forme irreductible : 3/4.",
  },
  {
    id: 10,
    theme: "fractions-2",
    question: "Resous : x/3 = 4/5",
    options: ["x = 12/5", "x = 12", "x = 20/3", "x = 3/20"],
    reponse: "x = 12/5",
    explication: "Multiplication en croix : 5x = 12. x = 12/5.",
  },
  {
    id: 11,
    theme: "equations",
    question: "Resous : x + 5 = 12",
    options: ["x = 17", "x = 7", "x = -7", "x = 60"],
    reponse: "x = 7",
    explication: "x = 12 - 5 = 7. Verification : 7+5=12.",
  },
  {
    id: 12,
    theme: "equations",
    question: "Resous : 3x = 15",
    options: ["x = 45", "x = 12", "x = 5", "x = -5"],
    reponse: "x = 5",
    explication: "x = 15/3 = 5. Verification : 3x5=15.",
  },
  {
    id: 13,
    theme: "equations",
    question: "Resous : 2x - 3 = 7",
    options: ["x = 2", "x = 5", "x = 8", "x = -2"],
    reponse: "x = 5",
    explication: "2x = 10. x = 5. Verification : 2x5-3=7.",
  },
  {
    id: 14,
    theme: "equations",
    question: "Resous : 5x + 2 = 3x + 10",
    options: ["x = 4", "x = 6", "x = 2", "x = 8"],
    reponse: "x = 4",
    explication: "5x-3x = 10-2. 2x = 8. x = 4.",
  },
  {
    id: 15,
    theme: "equations",
    question: "Resous : 3(x + 2) = 15",
    options: ["x = 3", "x = 5", "x = 1", "x = 7"],
    reponse: "x = 3",
    explication: "x + 2 = 5. x = 3. Ou : 3x+6=15, 3x=9, x=3.",
  },
  {
    id: 16,
    theme: "proportionnalite-2",
    question: "Un article coute 80€. Hausse de 15%. Nouveau prix ?",
    options: ["95€", "92€", "68€", "15€"],
    reponse: "92€",
    explication: "80 x 1,15 = 92€.",
  },
  {
    id: 17,
    theme: "proportionnalite-2",
    question: "Prix passe de 20€ a 25€. Taux d augmentation ?",
    options: ["5%", "20%", "25%", "125%"],
    reponse: "25%",
    explication: "(25-20)/20 x 100 = 25%.",
  },
  {
    id: 18,
    theme: "proportionnalite-2",
    question: "CM d une hausse de 30% ?",
    options: ["0,30", "1,30", "130", "0,70"],
    reponse: "1,30",
    explication: "CM = 1 + 30/100 = 1,30.",
  },
  {
    id: 19,
    theme: "proportionnalite-2",
    question: "+20% puis -20%. Le prix est ?",
    options: ["Inchange", "Inferieur", "Superieur", "Ca depend"],
    reponse: "Inferieur",
    explication:
      "CM = 1,2 x 0,8 = 0,96. Le prix final est 96% du prix initial.",
  },
  {
    id: 20,
    theme: "proportionnalite-2",
    question: "Apres -40%, un article coute 48€. Prix initial ?",
    options: ["28,80€", "67,20€", "80€", "88€"],
    reponse: "80€",
    explication: "48 / 0,60 = 80€.",
  },
];

const themeLabels: Record<string, string> = {
  "nombres-relatifs-2": "Nombres relatifs",
  "fractions-2": "Fractions",
  equations: "Equations",
  "proportionnalite-2": "Proportionnalite",
};
const themeColors: Record<string, string> = {
  "nombres-relatifs-2": "#4f8ef7",
  "fractions-2": "#2ec4b6",
  equations: "#ffd166",
  "proportionnalite-2": "#ff6b6b",
};

export default function BilanMaths4eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "nombres-relatifs-2": 0,
    "fractions-2": 0,
    equations: 0,
    "proportionnalite-2": 0,
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
        setBestScore(await getBestScore("4eme", "maths", "bilan"));
        setLastScore(await getLastScore("4eme", "maths", "bilan"));
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("4eme", "maths", "bilan"));
        setLastScore(await getLastScore("4eme", "maths", "bilan"));
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
      "nombres-relatifs-2": 0,
      "fractions-2": 0,
      equations: 0,
      "proportionnalite-2": 0,
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
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">Bilan Maths 4eme</div>
          <h1 className="lecon-titre">Bilan Maths 4eme — Partie 1</h1>
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
            Ce bilan regroupe les 4 themes de Maths 4eme Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>5 questions</span>
              <span>Nombres relatifs</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>5 questions</span>
              <span>Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>5 questions</span>
              <span>Equations</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>5 questions</span>
              <span>Proportionnalite</span>
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
              ? "Bravo, tu maitrises les Maths 4eme Partie 1 !"
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
              onClick={() => router.push("/cours/college/4eme/maths")}
            >
              Retour aux themes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
