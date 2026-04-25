"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire (5 questions)
  {
    id: 1,
    question: "Quel mot est un verbe ?",
    options: ["maison", "courir", "beau", "table"],
    reponse: "courir",
    explication: "'courir' est un verbe — il exprime une action.",
    theme: "grammaire",
  },
  {
    id: 2,
    question: "Dans 'Les enfants jouent au parc', quel est le verbe ?",
    options: ["enfants", "parc", "jouent", "les"],
    reponse: "jouent",
    explication:
      "'jouent' est le verbe — les enfants ne jouent pas → ça marche !",
    theme: "grammaire",
  },
  {
    id: 3,
    question: "Quel mot N'est PAS un verbe ?",
    options: ["chanter", "dormir", "rapide", "manger"],
    reponse: "rapide",
    explication: "'rapide' est un adjectif, pas un verbe.",
    theme: "grammaire",
  },
  {
    id: 4,
    question:
      "Quelle est la bonne conjugaison ? 'Les enfants ___ dans la cour.'",
    options: ["joue", "jouons", "jouent", "jouez"],
    reponse: "jouent",
    explication: "Avec 'les enfants' (ils), on dit 'jouent'.",
    theme: "grammaire",
  },
  {
    id: 5,
    question: "Quel verbe complète : 'Nous ___ nos devoirs.' ?",
    options: ["fait", "fais", "faites", "faisons"],
    reponse: "faisons",
    explication: "Avec 'nous', on dit 'faisons'.",
    theme: "grammaire",
  },
  // Conjugaison (5 questions)
  {
    id: 6,
    question: "Quel temps est utilisé : 'Je mange une pomme' ?",
    options: ["passé", "présent", "futur", "on ne sait pas"],
    reponse: "présent",
    explication: "'mange' est au présent.",
    theme: "conjugaison",
  },
  {
    id: 7,
    question: "Complète au présent : 'Tu ___ au foot.' (jouer)",
    options: ["joueras", "joues", "joua", "jouez"],
    reponse: "joues",
    explication: "Au présent avec 'tu', on dit 'joues'.",
    theme: "conjugaison",
  },
  {
    id: 8,
    question: "Complète au présent : 'Il ___ grand.' (être)",
    options: ["sera", "était", "est", "soit"],
    reponse: "est",
    explication: "Au présent avec 'il', le verbe être donne 'est'.",
    theme: "conjugaison",
  },
  {
    id: 9,
    question: "Complète au présent : 'Nous ___ contents.' (être)",
    options: ["serons", "étions", "sommes", "soyons"],
    reponse: "sommes",
    explication: "Au présent avec 'nous', le verbe être donne 'sommes'.",
    theme: "conjugaison",
  },
  {
    id: 10,
    question: "Quel mot indique que la phrase est au présent ?",
    options: ["demain", "hier", "bientôt", "aujourd'hui"],
    reponse: "aujourd'hui",
    explication: "'aujourd'hui' indique que l'action se passe maintenant.",
    theme: "conjugaison",
  },
  // Orthographe (5 questions)
  {
    id: 11,
    question: "Quel groupe nominal est correct ?",
    options: [
      "un petite chat",
      "une petit chat",
      "un petit chat",
      "une petite chat",
    ],
    reponse: "un petit chat",
    explication: "'chat' est masculin → 'un petit chat'.",
    theme: "orthographe",
  },
  {
    id: 12,
    question: "Quel groupe nominal est correct ?",
    options: [
      "une grande maison",
      "un grande maison",
      "une grand maison",
      "un grand maison",
    ],
    reponse: "une grande maison",
    explication: "'maison' est féminin → 'une grande maison'.",
    theme: "orthographe",
  },
  {
    id: 13,
    question: "Complète : 'des ___ filles'",
    options: ["beau", "belle", "belles", "beaux"],
    reponse: "belles",
    explication: "'filles' est féminin pluriel → 'belles'.",
    theme: "orthographe",
  },
  {
    id: 14,
    question: "Quel groupe nominal est correct ?",
    options: [
      "les petites chiens",
      "les petit chiens",
      "les petits chiens",
      "les petits chien",
    ],
    reponse: "les petits chiens",
    explication: "'chiens' est masculin pluriel → 'les petits chiens'.",
    theme: "orthographe",
  },
  {
    id: 15,
    question: "Quel groupe nominal contient une erreur ?",
    options: [
      "une belle maison",
      "les grands arbres",
      "un petite garçon",
      "de jolies fleurs",
    ],
    reponse: "un petite garçon",
    explication: "'garçon' est masculin → 'un petit garçon'.",
    theme: "orthographe",
  },
  // Vocabulaire - Synonymes et antonymes (5 questions)
  {
    id: 16,
    question: "Quel est le synonyme de 'content' ?",
    options: ["triste", "joyeux", "fâché", "fatigué"],
    reponse: "joyeux",
    explication: "'Content' et 'joyeux' veulent dire la même chose.",
    theme: "vocabulaire",
  },
  {
    id: 17,
    question: "Quel est l'antonyme de 'grand' ?",
    options: ["gros", "fort", "petit", "long"],
    reponse: "petit",
    explication: "'Grand' et 'petit' sont des contraires.",
    theme: "vocabulaire",
  },
  {
    id: 18,
    question: "Quel est le synonyme de 'rapide' ?",
    options: ["lent", "vite", "lourd", "calme"],
    reponse: "vite",
    explication: "'Rapide' et 'vite' veulent dire la même chose.",
    theme: "vocabulaire",
  },
  {
    id: 19,
    question: "Quel est l'antonyme de 'jour' ?",
    options: ["matin", "soir", "nuit", "midi"],
    reponse: "nuit",
    explication: "'Jour' et 'nuit' sont des contraires.",
    theme: "vocabulaire",
  },
  {
    id: 20,
    question: "Quel est l'antonyme de 'commencer' ?",
    options: ["continuer", "avancer", "terminer", "chercher"],
    reponse: "terminer",
    explication: "'Commencer' et 'terminer' sont des contraires.",
    theme: "vocabulaire",
  },
];

const themeLabels: Record<string, string> = {
  grammaire: "📝 Grammaire",
  conjugaison: "⏰ Conjugaison",
  orthographe: "✏️ Orthographe",
  vocabulaire: "📚 Vocabulaire",
};

const themeColors: Record<string, string> = {
  grammaire: "#4f8ef7",
  conjugaison: "#2ec4b6",
  orthographe: "#ffd166",
  vocabulaire: "#ff6b6b",
};

export default function BilanFinalCE1() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    grammaire: 0,
    conjugaison: 0,
    orthographe: 0,
    vocabulaire: 0,
  });
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const loadScores = async () => {
      const b = await getBestScore("ce1", "francais", "bilan");
      const l = await getLastScore("ce1", "francais", "bilan");
      setBestScore(b);
      setLastScore(l);
    };
    loadScores();
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
          classe: "ce1",
          matiere: "francais",
          theme: "bilan",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce1", "francais", "bilan");
        const l = await getLastScore("ce1", "francais", "bilan");
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
    setScores({ grammaire: 0, conjugaison: 0, orthographe: 0, vocabulaire: 0 });
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
          onClick={() => router.push("/cours/primaire/ce1/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE1</div>
          <h1 className="lecon-titre">Bilan Final — CE1 Français</h1>
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
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Record
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
                      fontSize: "0.75rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {lastScore.score}/20
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes du CE1 : Grammaire,
            Conjugaison, Orthographe et Vocabulaire.
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

      {etape === "qcm" && shuffledQuestions[qIndex] && (
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
                      fontSize: "0.75rem",
                      color: "#2ec4b6",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🏆 Meilleur
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
                      fontSize: "0.75rem",
                      color: "#888",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    🕒 Dernier
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
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
              ? "Bravo ! Tu es prêt(e) pour le CE2 ! 🚀"
              : totalScore >= 14
                ? "Très bon niveau !"
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
              onClick={() => router.push("/cours/primaire/ce1/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
