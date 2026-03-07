"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // Grammaire (5)
  {
    id: 1,
    question: "Quelle est la classe du mot 'chien' dans 'Le chien court' ?",
    options: ["verbe", "adjectif", "nom", "déterminant"],
    reponse: "nom",
    explication: "'chien' est un nom.",
    theme: "grammaire",
  },
  {
    id: 2,
    question: "Quelle est la classe du mot 'grand' dans 'un grand arbre' ?",
    options: ["nom", "verbe", "adjectif", "déterminant"],
    reponse: "adjectif",
    explication: "'grand' est un adjectif — il qualifie 'arbre'.",
    theme: "grammaire",
  },
  {
    id: 3,
    question: "Quel mot est un déterminant ?",
    options: ["mange", "beau", "mon", "vite"],
    reponse: "mon",
    explication: "'mon' est un déterminant possessif.",
    theme: "grammaire",
  },
  {
    id: 4,
    question:
      "Quelle est la classe du mot 'sur' dans 'Le livre est sur la table' ?",
    options: ["nom", "verbe", "adjectif", "préposition"],
    reponse: "préposition",
    explication: "'sur' est une préposition invariable.",
    theme: "grammaire",
  },
  {
    id: 5,
    question:
      "Quelle est la classe du mot 'mais' dans 'Je veux partir mais il pleut' ?",
    options: ["préposition", "adjectif", "conjonction", "pronom"],
    reponse: "conjonction",
    explication: "'mais' est une conjonction de coordination.",
    theme: "grammaire",
  },
  // Conjugaison (5)
  {
    id: 6,
    question: "Complète au passé composé : 'Elle ___ à l'école.' (aller)",
    options: ["a allé", "est allée", "a allée", "est allé"],
    reponse: "est allée",
    explication: "'aller' utilise 'être'. Féminin → 'allée'.",
    theme: "conjugaison",
  },
  {
    id: 7,
    question: "Complète au passé composé : 'Nous ___ nos devoirs.' (faire)",
    options: ["avons fait", "sommes fait", "avons fais", "avons faits"],
    reponse: "avons fait",
    explication: "'faire' utilise 'avoir' : nous avons fait.",
    theme: "conjugaison",
  },
  {
    id: 8,
    question: "Quelle phrase est au passé composé ?",
    options: ["Je mangeais.", "Je mangerai.", "J'ai mangé.", "Je mange."],
    reponse: "J'ai mangé.",
    explication: "Auxiliaire avoir + participe passé = passé composé.",
    theme: "conjugaison",
  },
  {
    id: 9,
    question: "Quel verbe se conjugue avec 'être' au passé composé ?",
    options: ["manger", "finir", "partir", "chanter"],
    reponse: "partir",
    explication: "'partir' est un verbe de mouvement — il utilise 'être'.",
    theme: "conjugaison",
  },
  {
    id: 10,
    question: "Complète : 'Mes parents ___ en France.' (naître)",
    options: ["ont né", "sont nés", "ont nés", "sont né"],
    reponse: "sont nés",
    explication: "'naître' utilise 'être'. Masculin pluriel → 'nés'.",
    theme: "conjugaison",
  },
  // Orthographe (5)
  {
    id: 11,
    question: "Complète : 'Il range ___ affaires.'",
    options: ["ces", "ses", "son", "sont"],
    reponse: "ses",
    explication: "'ses' = les siennes ✅",
    theme: "orthographe",
  },
  {
    id: 12,
    question: "Complète : 'Les enfants ___ fatigués.'",
    options: ["son", "sont", "ses", "ces"],
    reponse: "sont",
    explication: "'sont' = verbe être (étaient ✅)",
    theme: "orthographe",
  },
  {
    id: 13,
    question: "Complète : 'La ville ___ je vis est belle.'",
    options: ["ou", "où", "son", "sont"],
    reponse: "où",
    explication: "'où' indique le lieu.",
    theme: "orthographe",
  },
  {
    id: 14,
    question: "Complète : 'Il a perdu ___ cahier.'",
    options: ["ses", "ces", "son", "sont"],
    reponse: "son",
    explication: "'son' = le sien ✅",
    theme: "orthographe",
  },
  {
    id: 15,
    question: "Quelle phrase contient une erreur ?",
    options: [
      "Ces enfants sont sages.",
      "Il aime son chien.",
      "Ses amis où gentils.",
      "Tu viens ou tu restes ?",
    ],
    reponse: "Ses amis où gentils.",
    explication: "Il faut 'sont' : 'Ses amis sont gentils'.",
    theme: "orthographe",
  },
  // Vocabulaire (5)
  {
    id: 16,
    question: "Quel niveau de langue est 'C'est trop cool !' ?",
    options: ["soutenu", "courant", "familier", "littéraire"],
    reponse: "familier",
    explication: "'trop cool' est familier.",
    theme: "vocabulaire",
  },
  {
    id: 17,
    question: "Quel mot appartient au niveau familier ?",
    options: ["domicile", "maison", "baraque", "demeure"],
    reponse: "baraque",
    explication: "'baraque' est familier pour 'maison'.",
    theme: "vocabulaire",
  },
  {
    id: 18,
    question: "Quel mot appartient au niveau soutenu ?",
    options: ["bagnole", "voiture", "véhicule", "caisse"],
    reponse: "véhicule",
    explication: "'véhicule' est soutenu.",
    theme: "vocabulaire",
  },
  {
    id: 19,
    question: "Quel est le niveau courant de 'J'ai rien mangé' ?",
    options: [
      "J'ai tout mangé.",
      "Je n'ai rien mangé.",
      "Je n'ai point mangé.",
      "Je n'ai guère mangé.",
    ],
    reponse: "Je n'ai rien mangé.",
    explication: "'Je n'ai rien mangé' est le niveau courant.",
    theme: "vocabulaire",
  },
  {
    id: 20,
    question: "Quelle phrase est au niveau soutenu ?",
    options: [
      "C'est super beau !",
      "C'est beau.",
      "C'est magnifique.",
      "C'est trop beau !",
    ],
    reponse: "C'est magnifique.",
    explication: "'magnifique' est un adjectif soutenu.",
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

  const shuffledQuestions = useMemo(() => shuffleArray(questions), []);
  const shuffledOptions = useMemo(
    () => shuffleArray(shuffledQuestions[qIndex].options),
    [qIndex, shuffledQuestions],
  );
  const progression = Math.round((qIndex / questions.length) * 100);

  const handleReponse = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === shuffledQuestions[qIndex].reponse;
    if (correct) {
      const theme = shuffledQuestions[qIndex].theme;
      setScores((s) => ({ ...s, [theme]: s[theme] + 1 }));
      setTotalScore((s) => s + 1);
    }
  };

  const handleSuivant = () => {
    if (qIndex + 1 >= shuffledQuestions.length) setEtape("fini");
    else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
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
          onClick={() => router.push("/cours/francais/primaire/cm1")}
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
              onClick={() => router.push("/cours/francais/primaire/cm1")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
