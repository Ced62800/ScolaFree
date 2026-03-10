"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire (5)
  {
    id: 1,
    theme: "grammaire",
    question: "Quelle est la classe du mot 'chien' dans 'Le chien court' ?",
    options: ["verbe", "adjectif", "nom", "déterminant"],
    reponse: "nom",
    explication: "'chien' est un nom.",
  },
  {
    id: 2,
    theme: "grammaire",
    question: "Quelle est la classe du mot 'grand' dans 'un grand arbre' ?",
    options: ["nom", "verbe", "adjectif", "déterminant"],
    reponse: "adjectif",
    explication: "'grand' est un adjectif — il qualifie 'arbre'.",
  },
  {
    id: 3,
    theme: "grammaire",
    question: "Quel mot est un déterminant ?",
    options: ["mange", "beau", "mon", "vite"],
    reponse: "mon",
    explication: "'mon' est un déterminant possessif.",
  },
  {
    id: 4,
    theme: "grammaire",
    question:
      "Quelle est la classe du mot 'sur' dans 'Le livre est sur la table' ?",
    options: ["nom", "verbe", "adjectif", "préposition"],
    reponse: "préposition",
    explication: "'sur' est une préposition invariable.",
  },
  {
    id: 5,
    theme: "grammaire",
    question:
      "Quelle est la classe du mot 'mais' dans 'Je veux partir mais il pleut' ?",
    options: ["préposition", "adjectif", "conjonction", "pronom"],
    reponse: "conjonction",
    explication: "'mais' est une conjonction de coordination.",
  },
  // Conjugaison (5)
  {
    id: 6,
    theme: "conjugaison",
    question: "Complète au passé composé : 'Elle ___ à l'école.' (aller)",
    options: ["a allé", "est allée", "a allée", "est allé"],
    reponse: "est allée",
    explication: "'aller' utilise 'être'. Féminin → 'allée'.",
  },
  {
    id: 7,
    theme: "conjugaison",
    question: "Complète au passé composé : 'Nous ___ nos devoirs.' (faire)",
    options: ["avons fait", "sommes fait", "avons fais", "avons faits"],
    reponse: "avons fait",
    explication: "'faire' utilise 'avoir' : nous avons fait.",
  },
  {
    id: 8,
    theme: "conjugaison",
    question: "Quelle phrase est au passé composé ?",
    options: ["Je mangeais.", "Je mangerai.", "J'ai mangé.", "Je mange."],
    reponse: "J'ai mangé.",
    explication: "Auxiliaire avoir + participe passé = passé composé.",
  },
  {
    id: 9,
    theme: "conjugaison",
    question: "Quel verbe se conjugue avec 'être' au passé composé ?",
    options: ["manger", "finir", "partir", "chanter"],
    reponse: "partir",
    explication: "'partir' est un verbe de mouvement — il utilise 'être'.",
  },
  {
    id: 10,
    theme: "conjugaison",
    question: "Complète : 'Mes parents ___ en France.' (naître)",
    options: ["ont né", "sont nés", "ont nés", "sont né"],
    reponse: "sont nés",
    explication: "'naître' utilise 'être'. Masculin pluriel → 'nés'.",
  },
  // Orthographe (5)
  {
    id: 11,
    theme: "orthographe",
    question: "Complète : 'Il range ___ affaires.'",
    options: ["ces", "ses", "son", "sont"],
    reponse: "ses",
    explication: "'ses' = les siennes ✅",
  },
  {
    id: 12,
    theme: "orthographe",
    question: "Complète : 'Les enfants ___ fatigués.'",
    options: ["son", "sont", "ses", "ces"],
    reponse: "sont",
    explication: "'sont' = verbe être (étaient ✅)",
  },
  {
    id: 13,
    theme: "orthographe",
    question: "Complète : 'La ville ___ je vis est belle.'",
    options: ["ou", "où", "son", "sont"],
    reponse: "où",
    explication: "'où' indique le lieu.",
  },
  {
    id: 14,
    theme: "orthographe",
    question: "Complète : 'Il a perdu ___ cahier.'",
    options: ["ses", "ces", "son", "sont"],
    reponse: "son",
    explication: "'son' = le sien ✅",
  },
  {
    id: 15,
    theme: "orthographe",
    question: "Quelle phrase contient une erreur ?",
    options: [
      "Ces enfants sont sages.",
      "Il aime son chien.",
      "Ses amis où gentils.",
      "Tu viens ou tu restes ?",
    ],
    reponse: "Ses amis où gentils.",
    explication: "Il faut 'sont' : 'Ses amis sont gentils'.",
  },
  // Vocabulaire (5)
  {
    id: 16,
    theme: "vocabulaire",
    question: "Quel niveau de langue est 'C'est trop cool !' ?",
    options: ["soutenu", "courant", "familier", "littéraire"],
    reponse: "familier",
    explication: "'trop cool' est familier.",
  },
  {
    id: 17,
    theme: "vocabulaire",
    question: "Quel mot appartient au niveau familier ?",
    options: ["domicile", "maison", "baraque", "demeure"],
    reponse: "baraque",
    explication: "'baraque' est familier pour 'maison'.",
  },
  {
    id: 18,
    theme: "vocabulaire",
    question: "Quel mot appartient au niveau soutenu ?",
    options: ["bagnole", "voiture", "véhicule", "caisse"],
    reponse: "véhicule",
    explication: "'véhicule' est soutenu.",
  },
  {
    id: 19,
    theme: "vocabulaire",
    question: "Quel est le niveau courant de 'J'ai rien mangé' ?",
    options: [
      "J'ai tout mangé.",
      "Je n'ai rien mangé.",
      "Je n'ai point mangé.",
      "Je n'ai guère mangé.",
    ],
    reponse: "Je n'ai rien mangé.",
    explication: "'Je n'ai rien mangé' est le niveau courant.",
  },
  {
    id: 20,
    theme: "vocabulaire",
    question: "Quelle phrase est au niveau soutenu ?",
    options: [
      "C'est super beau !",
      "C'est beau.",
      "C'est magnifique.",
      "C'est trop beau !",
    ],
    reponse: "C'est magnifique.",
    explication: "'magnifique' est un adjectif soutenu.",
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

export default function BilanFinalCM1() {
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
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreSaved = useRef(false);
  const scoreRef = useRef(0);

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  useEffect(() => {
    getBestScore("cm1", "francais", "bilan").then(setBestScore);
    getLastScore("cm1", "francais", "bilan").then(setLastScore);
  }, []);

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
      if (scoreSaved.current) return;
      scoreSaved.current = true;
      await saveScore({
        classe: "cm1",
        matiere: "francais",
        theme: "bilan",
        score: scoreRef.current,
        total: 20,
      });
      const [best, last] = await Promise.all([
        getBestScore("cm1", "francais", "bilan"),
        getLastScore("cm1", "francais", "bilan"),
      ]);
      setBestScore(best);
      setLastScore(last);
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    scoreSaved.current = false;
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
          onClick={() => router.push("/cours/primaire/cm1/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CM1</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CM1</div>
          <h1 className="lecon-titre">Bilan Final — CM1 Français</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes du CM1 : Grammaire,
            Conjugaison, Orthographe et Vocabulaire.
          </p>
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
                </div>
              )}
            </div>
          )}
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
            <div style={{ display: "flex", gap: "10px", margin: "12px 0" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#4f8ef7",
                    textAlign: "center",
                  }}
                >
                  🏆 Meilleur
                  <br />
                  <strong>
                    {bestScore.score} / {bestScore.total}
                  </strong>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "0.85rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  🕐 Dernier
                  <br />
                  <strong style={{ color: "#fff" }}>
                    {lastScore.score} / {lastScore.total}
                  </strong>
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
              ? "Bravo ! Tu es prêt(e) pour le CM2 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/cm1/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
