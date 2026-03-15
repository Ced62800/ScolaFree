"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire 2 - Accord nom/adjectif (5)
  {
    id: 1,
    question: "Complète : 'Une fleur ___.' (beau)",
    options: ["beau", "beaux", "belle", "belles"],
    reponse: "belle",
    explication: "'fleur' est féminin singulier → 'belle'.",
    theme: "grammaire-2",
  },
  {
    id: 2,
    question: "Complète : 'Des chats ___.' (noir)",
    options: ["noir", "noire", "noirs", "noires"],
    reponse: "noirs",
    explication: "'chats' est masculin pluriel → 'noirs'.",
    theme: "grammaire-2",
  },
  {
    id: 3,
    question: "Quelle phrase est correcte ?",
    options: [
      "Un grand arbre.",
      "Un grandes arbre.",
      "Une grand arbre.",
      "Des grand arbres.",
    ],
    reponse: "Un grand arbre.",
    explication: "'arbre' est masculin singulier → 'grand'.",
    theme: "grammaire-2",
  },
  {
    id: 4,
    question: "Complète : 'Des robes ___.' (rouge)",
    options: ["rouge", "rouges", "rougis", "rougeau"],
    reponse: "rouges",
    explication: "'robes' est féminin pluriel → 'rouges'.",
    theme: "grammaire-2",
  },
  {
    id: 5,
    question: "Quel adjectif s'accorde avec 'une petite fille ___ et ___' ?",
    options: [
      "gentil et courageux",
      "gentille et courageuse",
      "gentilles et courageuses",
      "gentil et courageuse",
    ],
    reponse: "gentille et courageuse",
    explication:
      "'fille' est féminin singulier → les deux adjectifs prennent le féminin.",
    theme: "grammaire-2",
  },
  // Conjugaison 2 - Futur et imparfait (5)
  {
    id: 6,
    question: "Complète au futur : 'Demain, je ___ au parc.' (aller)",
    options: ["allais", "vais", "irai", "allons"],
    reponse: "irai",
    explication: "Au futur avec 'je', le verbe aller donne 'irai'.",
    theme: "conjugaison-2",
  },
  {
    id: 7,
    question: "Quel temps est : 'Il jouait dehors tous les soirs.' ?",
    options: ["présent", "futur", "imparfait", "passé composé"],
    reponse: "imparfait",
    explication: "'jouait' est à l'imparfait — habitude dans le passé.",
    theme: "conjugaison-2",
  },
  {
    id: 8,
    question: "Complète à l'imparfait : 'Nous ___ souvent à la mer.' (aller)",
    options: ["irons", "allons", "allions", "aller"],
    reponse: "allions",
    explication: "À l'imparfait avec 'nous', le verbe aller donne 'allions'.",
    theme: "conjugaison-2",
  },
  {
    id: 9,
    question: "Complète au futur : 'Ils ___ le match.' (gagner)",
    options: ["gagnaient", "gagnent", "gagneront", "gagnez"],
    reponse: "gagneront",
    explication: "Au futur avec 'ils', on ajoute -ront : 'gagneront'.",
    theme: "conjugaison-2",
  },
  {
    id: 10,
    question: "Quel mot indique l'imparfait ?",
    options: ["demain", "bientôt", "autrefois", "tout à l'heure"],
    reponse: "autrefois",
    explication: "'autrefois' indique une action passée → imparfait.",
    theme: "conjugaison-2",
  },
  // Orthographe 2 - Homophones (5)
  {
    id: 11,
    question: "Complète : 'Il ___ faim.' (a ou à)",
    options: ["à", "a"],
    reponse: "a",
    explication: "'a' = verbe avoir. On peut dire 'il avait faim'.",
    theme: "orthographe-2",
  },
  {
    id: 12,
    question: "Complète : 'Elle va ___ l'école.' (a ou à)",
    options: ["a", "à"],
    reponse: "à",
    explication:
      "'à' est une préposition. On ne peut pas dire 'avait l'école'.",
    theme: "orthographe-2",
  },
  {
    id: 13,
    question: "Complète : 'Le chien ___ gentil.' (est ou et)",
    options: ["et", "est"],
    reponse: "est",
    explication: "'est' = verbe être. On peut dire 'le chien était gentil'.",
    theme: "orthographe-2",
  },
  {
    id: 14,
    question: "Complète : '___ mange une pomme.' (on ou ont)",
    options: ["ont", "on"],
    reponse: "on",
    explication: "'on' = pronom. On peut dire 'il mange une pomme'.",
    theme: "orthographe-2",
  },
  {
    id: 15,
    question: "Complète : 'Ils ___ fini leurs devoirs.' (on ou ont)",
    options: ["on", "ont"],
    reponse: "ont",
    explication: "'ont' = verbe avoir. On peut dire 'ils avaient fini'.",
    theme: "orthographe-2",
  },
  // Vocabulaire 2 - Familles de mots (5)
  {
    id: 16,
    question: "Quel mot appartient à la famille de 'jardin' ?",
    options: ["jardinier", "journal", "jambe", "jaune"],
    reponse: "jardinier",
    explication: "'jardinier' vient de 'jardin' — même racine.",
    theme: "vocabulaire-2",
  },
  {
    id: 17,
    question: "Quel mot appartient à la famille de 'chanter' ?",
    options: ["chapeau", "chanteur", "chariot", "chandail"],
    reponse: "chanteur",
    explication: "'chanteur' vient de 'chanter' — même racine.",
    theme: "vocabulaire-2",
  },
  {
    id: 18,
    question: "Quel mot N'appartient PAS à la famille de 'mer' ?",
    options: ["marin", "marine", "merci", "maritime"],
    reponse: "merci",
    explication: "'merci' n'a pas de lien avec la mer.",
    theme: "vocabulaire-2",
  },
  {
    id: 19,
    question: "Quel mot appartient à la famille de 'école' ?",
    options: ["écolier", "éclair", "écharpe", "écran"],
    reponse: "écolier",
    explication: "'écolier' vient de 'école' — même racine.",
    theme: "vocabulaire-2",
  },
  {
    id: 20,
    question: "Trouve l'intrus dans la famille de 'terre' :",
    options: ["terrasse", "territoire", "terrible", "enterrer"],
    reponse: "terrible",
    explication: "'terrible' vient de 'terreur', pas de 'terre'.",
    theme: "vocabulaire-2",
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

export default function BilanCE1FrancaisPage2() {
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
    const loadData = async () => {
      const b = await getBestScore("ce1", "francais", "bilan-2");
      const l = await getLastScore("ce1", "francais", "bilan-2");
      setBestScore(b);
      setLastScore(l);
    };
    loadData();
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
          theme: "bilan-2",
          score: scoreRef.current,
          total: 20,
        });
        const b = await getBestScore("ce1", "francais", "bilan-2");
        const l = await getLastScore("ce1", "francais", "bilan-2");
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
          onClick={() => router.push("/cours/primaire/ce1/francais/page-2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE1</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Partie 2</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Partie 2 · CE1</div>
          <h1 className="lecon-titre">Bilan Français CE1 — Partie 2</h1>
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
            Ce bilan regroupe les 4 thèmes de la partie 2 du CE1 Français.
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
              ? "Bravo, tu maîtrises le français CE1 partie 2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/ce1/francais/page-2")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
