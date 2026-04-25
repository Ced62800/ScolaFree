"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Futur will (5)
  {
    id: 1,
    theme: "futur-will",
    question: "How do you form the future with 'will'?",
    options: [
      "will + verb-ing",
      "will + verb (base)",
      "will + verb-ed",
      "will + to + verb",
    ],
    reponse: "will + verb (base)",
    explication:
      "Will + BASE for all subjects. I will go, she will come, they will play.",
  },
  {
    id: 2,
    theme: "futur-will",
    question: "What is the negative of 'will'?",
    options: ["don't will", "will not / won't", "not will", "will don't"],
    reponse: "will not / won't",
    explication:
      "Will not = won't. I won't go. She won't come. Won't = contraction of will not.",
  },
  {
    id: 3,
    theme: "futur-will",
    question: "'Look at the clouds! It ___ rain.' (visible proof)",
    options: ["will", "is going to", "would", "might"],
    reponse: "is going to",
    explication:
      "Visible proof → going to. I think → will. Look at the clouds = evidence → going to rain!",
  },
  {
    id: 4,
    theme: "futur-will",
    question: "When do we use 'will'?",
    options: [
      "Plans made in advance",
      "Predictions, spontaneous decisions, promises",
      "Current habits",
      "Ongoing actions",
    ],
    reponse: "Predictions, spontaneous decisions, promises",
    explication:
      "Will = predictions, spontaneous decisions ('I'll help!'), promises ('I'll call you').",
  },
  {
    id: 5,
    theme: "futur-will",
    question: "How do you say 'Je promets que j'appellerai'?",
    options: [
      "I promise I would call.",
      "I promise I will call.",
      "I promise I am calling.",
      "I promise I called.",
    ],
    reponse: "I promise I will call.",
    explication:
      "Promises → will. I promise I will call = je promets que j'appellerai.",
  },
  // Comparatifs (5)
  {
    id: 6,
    theme: "comparatifs",
    question: "Comparative of 'tall' (short adjective)?",
    options: ["more tall", "taller", "tallest", "the tallest"],
    reponse: "taller",
    explication:
      "Short adjective → -ER + than. Tall → taller. Short → shorter. Fast → faster.",
  },
  {
    id: 7,
    theme: "comparatifs",
    question: "Superlative of 'beautiful' (long adjective)?",
    options: [
      "beautifullest",
      "more beautiful",
      "the most beautiful",
      "the beautifulest",
    ],
    reponse: "the most beautiful",
    explication:
      "Long adjective → THE MOST + adj. The most beautiful, the most interesting.",
  },
  {
    id: 8,
    theme: "comparatifs",
    question: "Comparative of 'good'?",
    options: ["gooder", "more good", "better", "best"],
    reponse: "better",
    explication:
      "Good is irregular. Good → better → the best. Bad → worse → the worst.",
  },
  {
    id: 9,
    theme: "comparatifs",
    question: "How do you say 'aussi grand que'?",
    options: ["as tall than", "so tall that", "as tall as", "more tall as"],
    reponse: "as tall as",
    explication:
      "Equality: AS + adj + AS. He is as tall as his father. Two AS = equal!",
  },
  {
    id: 10,
    theme: "comparatifs",
    question: "Which sentence is correct?",
    options: [
      "She is the most tall.",
      "She is the tallest.",
      "She is more tall.",
      "She is taller of all.",
    ],
    reponse: "She is the tallest.",
    explication:
      "Short adjective superlative: THE + -EST. 'The most tall' → WRONG. 'The tallest' → CORRECT.",
  },
  // Santé & sport (5)
  {
    id: 11,
    theme: "sante-sport",
    question: "How do you say 'J'ai mal à la tête'?",
    options: [
      "I have headache.",
      "I have a headache.",
      "My head hurt.",
      "I am headache.",
    ],
    reponse: "I have a headache.",
    explication:
      "I have A headache. Always with the article 'a'. My head hurts also correct.",
  },
  {
    id: 12,
    theme: "sante-sport",
    question: "Which verb do you use with 'football'?",
    options: ["do football", "go football", "play football", "make football"],
    reponse: "play football",
    explication:
      "PLAY + ball sports (football, tennis, basketball). DO = general. GO + -ing = individual.",
  },
  {
    id: 13,
    theme: "sante-sport",
    question: "What does 'to warm up' mean?",
    options: [
      "se réchauffer après",
      "s'échauffer avant le sport",
      "transpirer",
      "se reposer",
    ],
    reponse: "s'échauffer avant le sport",
    explication:
      "Warm up = s'échauffer BEFORE exercise. Cool down = récupérer AFTER. Logical!",
  },
  {
    id: 14,
    theme: "sante-sport",
    question: "Complete: 'You ___ eat more vegetables.' (advice)",
    options: ["must", "should", "will", "can"],
    reponse: "should",
    explication:
      "Should = advice (conseil). Must = strong obligation. For health advice → should.",
  },
  {
    id: 15,
    theme: "sante-sport",
    question: "Which sport uses 'go' in English?",
    options: ["football", "tennis", "swimming", "basketball"],
    reponse: "swimming",
    explication:
      "GO + -ing: go swimming, go running, go cycling. PLAY for team/ball sports.",
  },
  // Vie quotidienne (5)
  {
    id: 16,
    theme: "vie-quotidienne",
    question: "'Appartement' in British English?",
    options: ["apartment", "flat", "room", "house"],
    reponse: "flat",
    explication:
      "Flat (UK) = apartment (US). Lift (UK) = elevator (US). British vs American English!",
  },
  {
    id: 17,
    theme: "vie-quotidienne",
    question: "What is 'Thanksgiving'?",
    options: [
      "La fête nationale UK",
      "Une fête américaine pour remercier",
      "L'équivalent d'Halloween",
      "Une fête australienne",
    ],
    reponse: "Une fête américaine pour remercier",
    explication:
      "Thanksgiving = US (4th Thursday November). Turkey, family, giving thanks for the harvest.",
  },
  {
    id: 18,
    theme: "vie-quotidienne",
    question: "What does 'chores' mean?",
    options: [
      "loisirs",
      "tâches ménagères",
      "devoirs scolaires",
      "courses alimentaires",
    ],
    reponse: "tâches ménagères",
    explication:
      "Chores = household chores = tâches ménagères. Dishes, laundry, vacuuming.",
  },
  {
    id: 19,
    theme: "vie-quotidienne",
    question: "How do you say 'traîner avec des amis'?",
    options: ["to hang around", "to hang out", "to hang up", "to hang on"],
    reponse: "to hang out",
    explication:
      "Hang out (with friends) = traîner, passer du temps. Very common informal expression!",
  },
  {
    id: 20,
    theme: "vie-quotidienne",
    question: "What is 'public transport'?",
    options: [
      "transport privé",
      "les transports en commun",
      "les camions",
      "les taxis",
    ],
    reponse: "les transports en commun",
    explication:
      "Public transport = transports en commun. Bus, tube, train, tram, ferry.",
  },
];

const themeLabels: Record<string, string> = {
  "futur-will": "🔮 Futur avec will",
  comparatifs: "📊 Comparatifs",
  "sante-sport": "🏃 Santé & sport",
  "vie-quotidienne": "🌎 Vie quotidienne",
};
const themeColors: Record<string, string> = {
  "futur-will": "#4f8ef7",
  comparatifs: "#2ec4b6",
  "sante-sport": "#ffd166",
  "vie-quotidienne": "#ff6b6b",
};

export default function BilanAnglais5eme2() {
  const router = useRouter();
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "futur-will": 0,
    comparatifs: 0,
    "sante-sport": 0,
    "vie-quotidienne": 0,
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
        setBestScore(await getBestScore("5eme", "anglais", "bilan-2"));
        setLastScore(await getLastScore("5eme", "anglais", "bilan-2"));
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
      ? { label: "Excellent!", icon: "🏆", color: "#2ec4b6" }
      : totalScore >= 14
        ? { label: "Well done!", icon: "⭐", color: "#4f8ef7" }
        : totalScore >= 10
          ? { label: "Good job!", icon: "👍", color: "#ffd166" }
          : { label: "Keep trying!", icon: "💪", color: "#ff6b6b" };

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
          matiere: "anglais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        setBestScore(await getBestScore("5eme", "anglais", "bilan-2"));
        setLastScore(await getLastScore("5eme", "anglais", "bilan-2"));
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
      "futur-will": 0,
      comparatifs: 0,
      "sante-sport": 0,
      "vie-quotidienne": 0,
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
            onClick={() => router.push("/cours/college/5eme/anglais")}
            style={{ cursor: "pointer" }}
          >
            Anglais 5ème
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan · Anglais 5ème — Partie 2</div>
          <h1 className="lecon-titre">Bilan — Anglais 5ème Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes d'Anglais 5ème — Partie 2.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>🔮</span>
              <span>5 questions — Futur avec will</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>📊</span>
              <span>5 questions — Comparatifs</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>🏃</span>
              <span>5 questions — Santé & sport</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>🌎</span>
              <span>5 questions — Vie quotidienne</span>
            </div>
          </div>
          <div className="bilan-score-info">
            Score final sur <strong>20</strong>
          </div>
          <button className="lecon-btn" onClick={() => setEtape("qcm")}>
            Start the test →
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
                      ? "Well done! 🎉"
                      : "Not quite..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= shuffledQuestions.length
                  ? "See my results →"
                  : "Next question →"}
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
                    🏆 Best
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
                    🕒 Last
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="bilan-detail">
            <h3 className="bilan-detail-titre">Results by topic</h3>
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
              ? "Amazing! You've mastered English 5ème Part 2! 🚀"
              : totalScore >= 14
                ? "Great score, keep it up!"
                : totalScore >= 10
                  ? "Good progress!"
                  : "Keep practising, you'll get there!"}
          </p>
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Try again
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/college/5eme/anglais/page-2")}
            >
              Back to Part 2 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
