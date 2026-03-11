"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const questions = [
  // --- GRAMMAIRE (5) ---
  {
    id: 1,
    theme: "grammaire",
    question: "Trouve le verbe dans : 'Le chat attrape la souris.'",
    options: ["chat", "attrape", "souris", "le"],
    reponse: "attrape",
    explication: "Le verbe est l'action : c'est le mot 'attrape'.",
  },
  {
    id: 2,
    theme: "grammaire",
    question: "Quel est le sujet dans : 'Maman prépare un gâteau.' ?",
    options: ["Maman", "prépare", "gâteau", "un"],
    reponse: "Maman",
    explication: "C'est Maman qui fait l'action de préparer.",
  },
  {
    id: 3,
    theme: "grammaire",
    question: "Quel est le pluriel de 'Le petit garçon' ?",
    options: [
      "Les petits garçons",
      "Les petit garçons",
      "Le petits garçon",
      "Les petits garçon",
    ],
    reponse: "Les petits garçons",
    explication: "Tout le groupe nominal s'accorde au pluriel.",
  },
  {
    id: 4,
    theme: "grammaire",
    question: "Trouve l'adjectif dans : 'Une jolie fleur rouge.'",
    options: ["fleur", "une", "jolie", "est"],
    reponse: "jolie",
    explication:
      "'Jolie' donne une précision sur la fleur : c'est un adjectif.",
  },
  {
    id: 5,
    theme: "grammaire",
    question:
      "Quel type de phrase se termine par un point d'interrogation (?) ?",
    options: ["Déclarative", "Exclamative", "Interrogative", "Impérative"],
    reponse: "Interrogative",
    explication: "On utilise le point d'interrogation pour poser une question.",
  },
  // --- CONJUGAISON (5) ---
  {
    id: 6,
    theme: "conjugaison",
    question: "Conjugue : 'Tu (chanter) une chanson.'",
    options: ["chante", "chantes", "chantons", "chantez"],
    reponse: "chantes",
    explication: "Au présent, avec 'Tu', les verbes en -er prennent un 's'.",
  },
  {
    id: 7,
    theme: "conjugaison",
    question: "Quel est l'auxiliaire dans : 'Ils ont mangé' ?",
    options: ["Ils", "ont", "mangé", "avoir"],
    reponse: "ont",
    explication: "C'est l'auxiliaire 'avoir' conjugué au présent.",
  },
  {
    id: 8,
    theme: "conjugaison",
    question: "Trouve le verbe 'Être' au présent avec 'Nous' :",
    options: ["sommes", "somme", "êtes", "sont"],
    reponse: "sommes",
    explication: "On dit : Nous sommes.",
  },
  {
    id: 9,
    theme: "conjugaison",
    question: "Demain, je (jouer) au foot. (Futur)",
    options: ["jouerai", "jouerait", "jouait", "joue"],
    reponse: "jouerai",
    explication: "Au futur, avec 'je', la terminaison est -ai.",
  },
  {
    id: 10,
    theme: "conjugaison",
    question: "Choisissez la bonne forme : 'Elles ___ faim.'",
    options: ["ont", "on", "sont", "font"],
    reponse: "ont",
    explication: "C'est le verbe avoir (elles ont). 'On' est un pronom sujet.",
  },
  // --- ORTHOGRAPHE (5) ---
  {
    id: 11,
    theme: "orthographe",
    question: "Le pluriel de 'un journal' est :",
    options: ["des journals", "des journaux", "des journales", "des journauxs"],
    reponse: "des journaux",
    explication: "Les noms en -al font leur pluriel en -aux.",
  },
  {
    id: 12,
    theme: "orthographe",
    question: "Comment écrit-on le féminin de 'un lion' ?",
    options: ["une lionne", "une lione", "une lionte", "une lionn"],
    reponse: "une lionne",
    explication: "On double souvent la consonne au féminin : une lionne.",
  },
  {
    id: 13,
    theme: "orthographe",
    question: "Mets au pluriel : 'un clou'",
    options: ["des clous", "des cloux", "des clous s", "des cloues"],
    reponse: "des clous",
    explication: "C'est une exception, 'clou' prend un 's' et pas un 'x'.",
  },
  {
    id: 14,
    theme: "orthographe",
    question: "On écrit : 'Un ___ homme'.",
    options: ["beau", "belle", "bel", "beaux"],
    reponse: "bel",
    explication:
      "Devant un nom masculin commençant par une voyelle ou un h, on utilise 'bel'.",
  },
  {
    id: 15,
    theme: "orthographe",
    question: "Complète : 'Il y a ___ de monde.'",
    options: ["beaucoup", "beaucoup s", "beaucou", "bocoup"],
    reponse: "beaucoup",
    explication: "C'est un mot invariable qui s'écrit toujours 'beaucoup'.",
  },
  // --- VOCABULAIRE (5) ---
  {
    id: 16,
    theme: "vocabulaire",
    question: "Quel est le synonyme de 'content' ?",
    options: ["triste", "heureux", "colère", "fatigué"],
    reponse: "heureux",
    explication: "Un synonyme est un mot qui a le même sens.",
  },
  {
    id: 17,
    theme: "vocabulaire",
    question: "Quel est le contraire de 'monter' ?",
    options: ["grimper", "descendre", "courir", "sauter"],
    reponse: "descendre",
    explication: "L'antonyme (contraire) de monter est descendre.",
  },
  {
    id: 18,
    theme: "vocabulaire",
    question: "Trouve l'intrus :",
    options: ["Pomme", "Banane", "Carotte", "Poire"],
    reponse: "Carotte",
    explication: "La carotte est un légume, les autres sont des fruits.",
  },
  {
    id: 19,
    theme: "vocabulaire",
    question: "Quel mot appartient à la famille de 'dent' ?",
    options: ["dentiste", "danseur", "demain", "douche"],
    reponse: "dentiste",
    explication: "Le dentiste soigne les dents.",
  },
  {
    id: 20,
    theme: "vocabulaire",
    question: "Que signifie le préfixe 're-' dans 'refaire' ?",
    options: ["Ne pas", "Encore", "Avant", "Contre"],
    reponse: "Encore",
    explication: "Le préfixe 're-' indique la répétition (faire à nouveau).",
  },
];

const themeLabels: Record<string, string> = {
  grammaire: "📖 Grammaire",
  conjugaison: "⏳ Conjugaison",
  orthographe: "✍️ Orthographe",
  vocabulaire: "📚 Vocabulaire",
};

const themeColors: Record<string, string> = {
  grammaire: "#4f8ef7",
  conjugaison: "#2ec4b6",
  orthographe: "#ffd166",
  vocabulaire: "#ff6b6b",
};

export default function BilanCE2Francais() {
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

  // Persistance des scores
  const [bestScore, setBestScore] = useState<any>(null);
  const [lastScore, setLastScore] = useState<any>(null);
  const isSaving = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      const b = await getBestScore("ce2", "francais", "bilan");
      const l = await getLastScore("ce2", "francais", "bilan");
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
    }
  };

  const handleSuivant = async () => {
    if (qIndex + 1 >= shuffledQuestions.length) {
      if (!isSaving.current) {
        isSaving.current = true;
        await saveScore({
          classe: "ce2",
          matiere: "francais",
          theme: "bilan",
          score: totalScore,
          total: 20,
        });
        const b = await getBestScore("ce2", "francais", "bilan");
        setBestScore(b);
      }
      setEtape("fini");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRecommencer = () => {
    isSaving.current = false;
    setEtape("intro");
    setQIndex(0);
    setSelected(null);
    setScores({ grammaire: 0, conjugaison: 0, orthographe: 0, vocabulaire: 0 });
    setTotalScore(0);
  };

  const getMention = (score: number) => {
    if (score >= 18)
      return { label: "Excellent !", icon: "🏆", color: "#2ec4b6" };
    if (score >= 14)
      return { label: "Bien joué !", icon: "⭐", color: "#4f8ef7" };
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
          onClick={() => router.push("/cours/francais/primaire/ce2")}
        >
          ← Retour
        </button>
        <div className="cours-breadcrumb">
          <span>CE2</span>
          <span className="breadcrumb-sep">›</span>
          <span>Français</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">Bilan Final</span>
        </div>
      </div>

      {etape === "intro" && (
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan Final · CE2 Français</div>
          <h1 className="lecon-titre">Bilan Final — CE2 Français</h1>

          {/* Records personnels */}
          {(bestScore || lastScore) && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "rgba(46, 196, 182, 0.1)",
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
                    background: "rgba(255, 255, 255, 0.05)",
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
            Ce bilan regroupe des questions sur les 4 thèmes de Français du CE2.
          </p>
          <div className="bilan-info-grid">
            {Object.entries(themeLabels).map(([key, label]) => (
              <div
                key={key}
                className="bilan-info-card"
                style={{ borderColor: themeColors[key] }}
              >
                <span>{label.split(" ")[0]}</span>
                <span>5 questions de {label.split(" ")[1]}</span>
              </div>
            ))}
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
              <span>Question {qIndex + 1} / 20</span>
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
              {shuffledOptions.map((opt) => (
                <button
                  key={opt}
                  className={`qcm-option ${selected ? (opt === shuffledQuestions[qIndex].reponse ? "correct" : opt === selected ? "incorrect" : "disabled") : ""}`}
                  onClick={() => handleReponse(opt)}
                >
                  {opt}
                </button>
              ))}
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
                      : "Oups..."}
                  </strong>
                  <p>{shuffledQuestions[qIndex].explication}</p>
                </div>
              </div>
            )}
            {selected && (
              <button className="lecon-btn" onClick={handleSuivant}>
                {qIndex + 1 >= 20 ? "Voir mon bilan →" : "Question suivante →"}
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
          <div className="resultat-actions">
            <button className="lecon-btn-outline" onClick={handleRecommencer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn"
              onClick={() => router.push("/cours/francais/primaire/ce2")}
            >
              Menu CE2 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
