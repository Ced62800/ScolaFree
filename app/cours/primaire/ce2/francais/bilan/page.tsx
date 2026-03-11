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
    question: "Quel est le sujet dans : 'Le chat dort sur le canapé' ?",
    options: ["dort", "canapé", "Le chat", "sur"],
    reponse: "Le chat",
    explication: "Qui est-ce qui dort ? → Le chat.",
    theme: "grammaire",
  },
  {
    id: 2,
    question: "Quelle phrase est correcte ?",
    options: [
      "Les enfants joue.",
      "Les enfants jouent.",
      "Les enfant jouent.",
      "Les enfants joues.",
    ],
    reponse: "Les enfants jouent.",
    explication: "Avec 'les enfants' (pluriel), le verbe prend -nt.",
    theme: "grammaire",
  },
  {
    id: 3,
    question: "Complète : 'Mon frère ___ au foot.'",
    options: ["jouent", "jouez", "joue", "jouons"],
    reponse: "joue",
    explication: "'Mon frère' est singulier → 'joue'.",
    theme: "grammaire",
  },
  {
    id: 4,
    question: "Quelle phrase contient une erreur d'accord sujet-verbe ?",
    options: [
      "Les élèves travaillent.",
      "Le professeur explique.",
      "Les chiens aboie.",
      "Nous chantons.",
    ],
    reponse: "Les chiens aboie.",
    explication: "'Les chiens' est pluriel → il faut 'aboient'.",
    theme: "grammaire",
  },
  {
    id: 5,
    question: "Complète : 'La maîtresse et les élèves ___ la leçon.'",
    options: ["prépare", "prépares", "préparent", "préparez"],
    reponse: "préparent",
    explication: "Deux sujets = pluriel → 'préparent'.",
    theme: "grammaire",
  },
  // Conjugaison (5)
  {
    id: 6,
    question:
      "Quel temps est utilisé : 'Quand j'étais petit, je jouais au ballon' ?",
    options: ["présent", "imparfait", "futur", "passé composé"],
    reponse: "imparfait",
    explication: "'jouais' est à l'imparfait.",
    theme: "conjugaison",
  },
  {
    id: 7,
    question:
      "Complète à l'imparfait : 'Nous ___ au parc tous les dimanches.' (aller)",
    options: ["allons", "irons", "allions", "allez"],
    reponse: "allions",
    explication: "À l'imparfait avec 'nous' : 'allions'.",
    theme: "conjugaison",
  },
  {
    id: 8,
    question: "Quelle phrase est à l'imparfait ?",
    options: [
      "Je mange ma soupe.",
      "Je mangerai ma soupe.",
      "Je mangeais ma soupe.",
      "Je mangerais ma soupe.",
    ],
    reponse: "Je mangeais ma soupe.",
    explication: "'mangeais' est à l'imparfait — terminaison -ais.",
    theme: "conjugaison",
  },
  {
    id: 9,
    question: "Complète au futur : 'Vous ___ vos amis ce week-end.' (voir)",
    options: ["voyez", "verrez", "voyiez", "voir"],
    reponse: "verrez",
    explication: "Au futur avec 'vous', 'voir' devient 'verrez'.",
    theme: "conjugaison",
  },
  {
    id: 10,
    question: "Complète : 'Autrefois, les gens ___ sans électricité.' (vivre)",
    options: ["vivent", "vivront", "vivaient", "vivez"],
    reponse: "vivaient",
    explication: "'Autrefois' = habitude dans le passé → imparfait.",
    theme: "conjugaison",
  },
  // Orthographe (5)
  {
    id: 11,
    question: "Complète : 'Il ___ très faim ce soir.'",
    options: ["à", "a", "est", "et"],
    reponse: "a",
    explication: "'a' = verbe avoir (il avait très faim ✅).",
    theme: "orthographe",
  },
  {
    id: 12,
    question: "Complète : 'Elle va ___ l'école.'",
    options: ["a", "à", "est", "et"],
    reponse: "à",
    explication: "'à' indique le lieu.",
    theme: "orthographe",
  },
  {
    id: 13,
    question: "Complète : 'Elle ___ très gentille.'",
    options: ["et", "est", "a", "à"],
    reponse: "est",
    explication: "'est' = verbe être (elle était très gentille ✅).",
    theme: "orthographe",
  },
  {
    id: 14,
    question: "Complète : 'Les élèves ___ bien travaillé.'",
    options: ["on", "ont", "son", "a"],
    reponse: "ont",
    explication: "'ont' = verbe avoir au pluriel.",
    theme: "orthographe",
  },
  {
    id: 15,
    question: "Quelle phrase contient une erreur ?",
    options: [
      "Elle a mangé.",
      "Il est grand et fort.",
      "On à froid.",
      "Ils ont chaud.",
    ],
    reponse: "On à froid.",
    explication: "Il faut 'a' (verbe avoir) : 'On a froid'.",
    theme: "orthographe",
  },
  // Vocabulaire (5)
  {
    id: 16,
    question: "Quel est le synonyme de 'content' ?",
    options: ["triste", "heureux", "fatigué", "fâché"],
    reponse: "heureux",
    explication: "'heureux' et 'content' ont le même sens.",
    theme: "vocabulaire",
  },
  {
    id: 17,
    question: "Quel est l'antonyme de 'grand' ?",
    options: ["énorme", "long", "petit", "haut"],
    reponse: "petit",
    explication: "'petit' est le contraire de 'grand'.",
    theme: "vocabulaire",
  },
  {
    id: 18,
    question: "Quel mot est un synonyme de 'rapide' ?",
    options: ["lent", "vite", "calme", "lourd"],
    reponse: "vite",
    explication: "'vite' et 'rapide' ont le même sens.",
    theme: "vocabulaire",
  },
  {
    id: 19,
    question: "Quel est l'antonyme de 'possible' ?",
    options: ["difficile", "impossible", "facile", "probable"],
    reponse: "impossible",
    explication: "Le préfixe 'im-' forme le contraire.",
    theme: "vocabulaire",
  },
  {
    id: 20,
    question: "Quel est l'antonyme de 'commencer' ?",
    options: ["continuer", "reprendre", "finir", "avancer"],
    reponse: "finir",
    explication: "'finir' est le contraire de 'commencer'.",
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

export default function BilanFinalCE2() {
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
          onClick={() => router.push("/cours/primaire/ce2/francais")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE2</div>
          <h1 className="lecon-titre">Bilan Final — CE2 Français</h1>
          <p className="lecon-intro">
            Ce bilan regroupe des questions sur les 4 thèmes du CE2 : Grammaire,
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
              ? "Bravo ! Tu es prêt(e) pour le CM1 ! 🚀"
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
              onClick={() => router.push("/cours/primaire/ce2/francais")}
            >
              Retour aux thèmes →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
