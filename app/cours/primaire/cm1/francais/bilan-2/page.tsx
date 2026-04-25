"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire 2 - accord participe passé (5)
  {
    id: 1,
    theme: "grammaire-2",
    question: "Complète : 'Elle est ___.' (partir)",
    options: ["parti", "partis", "partie", "parties"],
    reponse: "partie",
    explication: "Auxiliaire être + sujet féminin singulier → 'partie'.",
  },
  {
    id: 2,
    theme: "grammaire-2",
    question: "Complète : 'Ils sont ___.' (arriver)",
    options: ["arrivé", "arrivée", "arrivés", "arrivées"],
    reponse: "arrivés",
    explication: "Auxiliaire être + sujet masculin pluriel → 'arrivés'.",
  },
  {
    id: 3,
    theme: "grammaire-2",
    question: "Complète : 'Elle a ___.' (manger)",
    options: ["mangé", "mangée", "mangés", "mangées"],
    reponse: "mangé",
    explication: "Auxiliaire avoir → pas d'accord.",
  },
  {
    id: 4,
    theme: "grammaire-2",
    question: "Quelle phrase est correcte ?",
    options: [
      "Elle a mangée.",
      "Elle a mangé.",
      "Elle est mangé.",
      "Ils ont joués.",
    ],
    reponse: "Elle a mangé.",
    explication: "'manger' utilise 'avoir' → pas d'accord.",
  },
  {
    id: 5,
    theme: "grammaire-2",
    question: "Complète : 'Les filles sont ___.' (venir)",
    options: ["venu", "venue", "venus", "venues"],
    reponse: "venues",
    explication: "Auxiliaire être + sujet féminin pluriel → 'venues'.",
  },
  // Conjugaison 2 - futur simple (5)
  {
    id: 6,
    theme: "conjugaison-2",
    question: "Complète au futur : 'Demain, je ___ mes devoirs.' (faire)",
    options: ["fais", "faisais", "ferai", "ai fait"],
    reponse: "ferai",
    explication: "Futur de 'faire' avec 'je' : ferai.",
  },
  {
    id: 7,
    theme: "conjugaison-2",
    question: "Complète au futur : 'Il ___ à Paris l'année prochaine.' (aller)",
    options: ["va", "allait", "est allé", "ira"],
    reponse: "ira",
    explication: "Futur de 'aller' avec 'il' : ira.",
  },
  {
    id: 8,
    theme: "conjugaison-2",
    question: "Complète au futur : 'Nous ___ contents.' (être)",
    options: ["sommes", "étions", "serons", "avons été"],
    reponse: "serons",
    explication: "Futur de 'être' avec 'nous' : serons.",
  },
  {
    id: 9,
    theme: "conjugaison-2",
    question: "Complète au futur : 'Ils ___ leur match.' (gagner)",
    options: ["gagnent", "gagnaient", "gagneront", "ont gagné"],
    reponse: "gagneront",
    explication: "Futur de 'gagner' avec 'ils' : gagneront.",
  },
  {
    id: 10,
    theme: "conjugaison-2",
    question: "Complète au futur : 'Elle ___ nous rejoindre.' (venir)",
    options: ["vient", "venait", "viendra", "est venue"],
    reponse: "viendra",
    explication: "Futur de 'venir' avec 'elle' : viendra.",
  },
  // Orthographe 2 - préfixes/suffixes (5)
  {
    id: 11,
    theme: "orthographe-2",
    question: "Quel est le préfixe dans 'impossible' ?",
    options: ["im", "possible", "ible", "po"],
    reponse: "im",
    explication: "'im-' signifie 'pas' : impossible = pas possible.",
  },
  {
    id: 12,
    theme: "orthographe-2",
    question: "Que signifie le préfixe 're-' dans 'relire' ?",
    options: ["avant", "à nouveau", "contraire", "après"],
    reponse: "à nouveau",
    explication: "'re-' = à nouveau : relire = lire à nouveau.",
  },
  {
    id: 13,
    theme: "orthographe-2",
    question: "Que signifie 'maisonnette' ?",
    options: [
      "grande maison",
      "petite maison",
      "belle maison",
      "vieille maison",
    ],
    reponse: "petite maison",
    explication: "Le suffixe '-ette' indique quelque chose de petit.",
  },
  {
    id: 14,
    theme: "orthographe-2",
    question: "Quel suffixe indique une personne qui fait une action ?",
    options: ["-tion", "-ment", "-eur", "-ette"],
    reponse: "-eur",
    explication: "'-eur' : chanteur, joueur...",
  },
  {
    id: 15,
    theme: "orthographe-2",
    question: "Quel préfixe signifie 'avant' ?",
    options: ["re-", "im-", "pré-", "dé-"],
    reponse: "pré-",
    explication: "'pré-' signifie 'avant' : prévoir = voir avant.",
  },
  // Vocabulaire 2 - figures de style (5)
  {
    id: 16,
    theme: "vocabulaire-2",
    question:
      "Dans 'Il court comme le vent', quelle figure de style est utilisée ?",
    options: ["Métaphore", "Comparaison", "Hyperbole", "Personnification"],
    reponse: "Comparaison",
    explication: "Mot comparatif 'comme' → comparaison.",
  },
  {
    id: 17,
    theme: "vocabulaire-2",
    question:
      "Dans 'Le soleil souriait', quelle figure de style est utilisée ?",
    options: ["Comparaison", "Hyperbole", "Personnification", "Métaphore"],
    reponse: "Personnification",
    explication: "Action humaine attribuée au soleil → personnification.",
  },
  {
    id: 18,
    theme: "vocabulaire-2",
    question: "Dans 'J'ai attendu mille ans !', quelle figure est utilisée ?",
    options: ["Comparaison", "Répétition", "Anaphore", "Hyperbole"],
    reponse: "Hyperbole",
    explication: "Exagération volontaire → hyperbole.",
  },
  {
    id: 19,
    theme: "vocabulaire-2",
    question:
      "Dans 'C'est un lion sur le terrain', quelle figure est utilisée ?",
    options: ["Comparaison", "Métaphore", "Personnification", "Hyperbole"],
    reponse: "Métaphore",
    explication: "Comparaison sans mot comparatif → métaphore.",
  },
  {
    id: 20,
    theme: "vocabulaire-2",
    question: "Laquelle est une personnification ?",
    options: [
      "Il court comme le vent.",
      "La forêt murmurait des secrets.",
      "J'ai mangé mille pizzas !",
      "C'est un tigre.",
    ],
    reponse: "La forêt murmurait des secrets.",
    explication: "Action humaine attribuée à la forêt → personnification.",
  },
];

const themeLabels: Record<string, string> = {
  "grammaire-2": "📝 Grammaire",
  "conjugaison-2": "⏰ Conjugaison",
  "orthographe-2": "✏️ Orthographe",
  "vocabulaire-2": "📚 Vocabulaire",
};

const themeColors: Record<string, string> = {
  "grammaire-2": "#4f8ef7",
  "conjugaison-2": "#2ec4b6",
  "orthographe-2": "#ffd166",
  "vocabulaire-2": "#ff6b6b",
};

export default function BilanCM1FrancaisPage2() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    "grammaire-2": 0,
    "conjugaison-2": 0,
    "orthographe-2": 0,
    "vocabulaire-2": 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const b = await getBestScore("cm1", "francais", "bilan-2");
      const l = await getLastScore("cm1", "francais", "bilan-2");
      setBestScore(b);
      setLastScore(l);
    };
    load();
  }, []);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(() => {
    if (!shuffledQuestions[qIndex]) return [];
    return shuffleArray(shuffledQuestions[qIndex].options);
  }, [qIndex, shuffledQuestions]);
  const progression = Math.round((qIndex / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
      scoreRef.current += 1;
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "cm1",
          matiere: "francais",
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("cm1", "francais", "bilan-2");
        const l = await getLastScore("cm1", "francais", "bilan-2");
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
    isSaving.current = false;
    scoreRef.current = 0;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({
      "grammaire-2": 0,
      "conjugaison-2": 0,
      "orthographe-2": 0,
      "vocabulaire-2": 0,
    });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14) return { label: "Bien !", icon: "⭐", color: "#4f8ef7" };
    if (score >= 10)
      return { label: "Assez bien !", icon: "👍", color: "#ffd166" };
    return { label: "À revoir !", icon: "💪", color: "#ff6b6b" };
  };

  const mention = getMention(totalScore);

  return (
    <div className="cours-page">
      <div className="cours-header">
        <button
          className="cours-back"
          onClick={() => router.push("/cours/primaire/cm1/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CM1</div>
          <h1 className="lecon-titre">Bilan Français CM1 — Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de la partie 2 du CM1 Français.
          </p>
          <div className="bilan-info-grid">
            <div className="bilan-info-card" style={{ borderColor: "#4f8ef7" }}>
              <span>📝</span>
              <span>5 questions de Grammaire</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#2ec4b6" }}>
              <span>⏰</span>
              <span>5 questions de Conjugaison</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ffd166" }}>
              <span>✏️</span>
              <span>5 questions d'Orthographe</span>
            </div>
            <div className="bilan-info-card" style={{ borderColor: "#ff6b6b" }}>
              <span>📚</span>
              <span>5 questions de Vocabulaire</span>
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
              ? "Bravo, tu maîtrises le français CM1 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm1/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
