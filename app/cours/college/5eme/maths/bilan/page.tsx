"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Nombres relatifs (5)
  {
    id: 1,
    theme: "nombres-relatifs",
    question: "Quel est le résultat de (+5) + (-8) ?",
    options: ["+13", "-3", "+3", "-13"],
    reponse: "-3",
    explication:
      "(+5)+(-8) : signes différents → 8-5=3, signe du plus grand (8, négatif) → -3.",
  },
  {
    id: 2,
    theme: "nombres-relatifs",
    question: "Quel est l'opposé de -6 ?",
    options: ["-6", "+6", "1/6", "-1/6"],
    reponse: "+6",
    explication: "L'opposé d'un nombre = changer le signe. Opposé de -6 = +6.",
  },
  {
    id: 3,
    theme: "nombres-relatifs",
    question: "Calcule : (-4) × (+3)",
    options: ["+12", "-12", "-1", "+7"],
    reponse: "-12",
    explication: "(-) × (+) = (-). (-4) × (+3) = -(4×3) = -12.",
  },
  {
    id: 4,
    theme: "nombres-relatifs",
    question: "Quel est le résultat de (-8) - (-3) ?",
    options: ["-11", "-5", "+5", "+11"],
    reponse: "-5",
    explication:
      "(-8)-(-3) = (-8)+(+3) = -5. Soustraire un négatif = additionner son opposé.",
  },
  {
    id: 5,
    theme: "nombres-relatifs",
    question: "Comparez : -2 et -9",
    options: ["-2 < -9", "-2 > -9", "-2 = -9", "Impossible"],
    reponse: "-2 > -9",
    explication: "Sur la droite, -2 est plus à droite que -9. Donc -2 > -9.",
  },
  // Fractions (5)
  {
    id: 6,
    theme: "fractions",
    question: "Simplifie 8/12.",
    options: ["4/6", "2/3", "1/2", "3/4"],
    reponse: "2/3",
    explication: "PGCD(8,12)=4. 8÷4=2, 12÷4=3 → 2/3.",
  },
  {
    id: 7,
    theme: "fractions",
    question: "Calcule 1/3 + 1/6.",
    options: ["2/9", "1/2", "2/6", "3/9"],
    reponse: "1/2",
    explication: "PPCM(3,6)=6. 1/3=2/6. 2/6+1/6=3/6=1/2.",
  },
  {
    id: 8,
    theme: "fractions",
    question: "Calcule 3/4 × 2/3.",
    options: ["5/7", "6/12", "1/2", "9/8"],
    reponse: "1/2",
    explication: "3/4 × 2/3 = 6/12 = 1/2.",
  },
  {
    id: 9,
    theme: "fractions",
    question: "Laquelle est la plus grande : 2/3 ou 3/4 ?",
    options: ["2/3", "3/4", "Égales", "Impossible"],
    reponse: "3/4",
    explication: "PPCM=12. 2/3=8/12. 3/4=9/12. 9>8 donc 3/4>2/3.",
  },
  {
    id: 10,
    theme: "fractions",
    question: "Calcule 5/6 ÷ 5/12.",
    options: ["1/2", "2", "25/72", "10/6"],
    reponse: "2",
    explication: "5/6 ÷ 5/12 = 5/6 × 12/5 = 60/30 = 2.",
  },
  // Calcul littéral (5)
  {
    id: 11,
    theme: "calcul-litteral",
    question: "Développe 4(x + 3).",
    options: ["4x + 3", "4x + 12", "x + 12", "4x + 7"],
    reponse: "4x + 12",
    explication: "4(x+3) = 4×x + 4×3 = 4x + 12.",
  },
  {
    id: 12,
    theme: "calcul-litteral",
    question: "Simplifie 5x + 3x - 2x.",
    options: ["6x", "8x", "10x", "x"],
    reponse: "6x",
    explication: "5x+3x-2x = (5+3-2)x = 6x.",
  },
  {
    id: 13,
    theme: "calcul-litteral",
    question: "Que vaut 3x - 1 pour x = 5 ?",
    options: ["14", "16", "10", "4"],
    reponse: "14",
    explication: "3×5 - 1 = 15 - 1 = 14.",
  },
  {
    id: 14,
    theme: "calcul-litteral",
    question: "Factorise 6x + 9.",
    options: ["3(2x + 9)", "6(x + 3)", "3(2x + 3)", "2(3x + 9)"],
    reponse: "3(2x + 3)",
    explication: "PGCD(6,9)=3. 6x+9 = 3(2x+3).",
  },
  {
    id: 15,
    theme: "calcul-litteral",
    question: "Développe -(3x - 4).",
    options: ["-3x - 4", "-3x + 4", "3x - 4", "3x + 4"],
    reponse: "-3x + 4",
    explication: "-(3x-4) = -3x + 4. Le - change tous les signes.",
  },
  // Proportionnalité (5)
  {
    id: 16,
    theme: "proportionnalite",
    question: "Si 4 cahiers coûtent 8€, combien coûtent 6 cahiers ?",
    options: ["10€", "12€", "14€", "16€"],
    reponse: "12€",
    explication: "1 cahier = 8÷4 = 2€. 6 cahiers = 6×2 = 12€.",
  },
  {
    id: 17,
    theme: "proportionnalite",
    question: "Calcule 20% de 60.",
    options: ["10", "12", "15", "20"],
    reponse: "12",
    explication: "20% de 60 = 20/100 × 60 = 0,2 × 60 = 12.",
  },
  {
    id: 18,
    theme: "proportionnalite",
    question: "Un prix de 50€ augmente de 10%. Nouveau prix ?",
    options: ["55€", "60€", "51€", "45€"],
    reponse: "55€",
    explication: "10% de 50 = 5€. 50+5 = 55€. Ou 50×1,1=55€.",
  },
  {
    id: 19,
    theme: "proportionnalite",
    question: "Tableau : 3→9, 5→?",
    options: ["11", "15", "12", "7"],
    reponse: "15",
    explication: "Coefficient k=9/3=3. 5×3=15.",
  },
  {
    id: 20,
    theme: "proportionnalite",
    question: "Échelle 1/25 000, distance carte = 4 cm. Distance réelle ?",
    options: ["100 m", "1 km", "10 km", "400 m"],
    reponse: "1 km",
    explication: "4×25 000 = 100 000 cm = 1 000 m = 1 km.",
  },
];

const themeLabels: Record<string, string> = {
  "nombres-relatifs": "➕ Nombres relatifs",
  fractions: "½ Fractions",
  "calcul-litteral": "🔤 Calcul littéral",
  proportionnalite: "📊 Proportionnalité",
};
const themeColors: Record<string, string> = {
  "nombres-relatifs": "#4f8ef7",
  fractions: "#2ec4b6",
  "calcul-litteral": "#ffd166",
  proportionnalite: "#ff6b6b",
};

export default function BilanMaths5eme() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "nombres-relatifs": 0,
    fractions: 0,
    "calcul-litteral": 0,
    proportionnalite: 0,
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
        setBestScore(await getBestScore("5eme", "maths", "bilan"));
        setLastScore(await getLastScore("5eme", "maths", "bilan"));
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
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("5eme", "maths", "bilan"));
        setLastScore(await getLastScore("5eme", "maths", "bilan"));
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
      "nombres-relatifs": 0,
      fractions: 0,
      "calcul-litteral": 0,
      proportionnalite: 0,
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
          <span className="breadcrumb-active">Bilan</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Maths 5ème</div>
          <h1 className="lecon-titre">Bilan — Maths 5ème</h1>
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
            Ce bilan regroupe les 4 thèmes de Maths 5ème — Partie 1.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>➕</span>
              <span>5 questions — Nombres relatifs</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>½</span>
              <span>5 questions — Fractions</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🔤</span>
              <span>5 questions — Calcul littéral</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📊</span>
              <span>5 questions — Proportionnalité</span>
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
              ? "Bravo, tu maîtrises les Maths 5ème Partie 1 ! 🚀"
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
              onClick={() => router.push("/cours/college/5eme/maths")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
