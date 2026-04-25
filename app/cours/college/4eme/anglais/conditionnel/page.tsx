"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "conditionnel";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Question = {
  question: string;
  options: string[];
  answer: string;
  fiche: { regle: string; exemple: string; piege: string; astuce: string };
};

const questionsBase: Question[] = [
  {
    question:
      "Complete the Type 1 conditional: 'If it rains, I _____ my umbrella.'",
    options: ["would take", "will take", "took", "take"],
    answer: "will take",
    fiche: {
      regle:
        "Type 1 (real/possible): If + present simple, will + infinitive. Possible future situation.",
      exemple:
        "If it rains, I will take my umbrella. If you study, you will pass.",
      piege:
        "Type 1 uses WILL (not would). Would is for Type 2 (hypothetical).",
      astuce:
        "Type 1: If + PRESENT, WILL + verb. Real and possible situation in the future.",
    },
  },
  {
    question:
      "Complete the Type 2 conditional: 'If I _____ a million euros, I would travel the world.'",
    options: ["have", "had", "will have", "would have"],
    answer: "had",
    fiche: {
      regle:
        "Type 2 (unreal/hypothetical): If + past simple, would + infinitive. Imaginary present/future situation.",
      exemple:
        "If I had a million euros, I would travel. If she were taller, she would be a model.",
      piege:
        "Type 2 uses PAST SIMPLE after if, not present. Don't say 'If I have' for hypothetical!",
      astuce:
        "Type 2: If + PAST SIMPLE, WOULD + verb. Imaginary situation. Would = conditionnel en francais.",
    },
  },
  {
    question: "Which sentence is a Type 1 conditional?",
    options: [
      "If I were you, I would study more.",
      "If it is sunny, we will go to the beach.",
      "If she had studied, she would have passed.",
      "I would buy a car if I had money.",
    ],
    answer: "If it is sunny, we will go to the beach.",
    fiche: {
      regle:
        "Type 1: If + present simple + will. Type 2: If + past simple + would. Type 3: If + past perfect + would have.",
      exemple:
        "Type 1: If it is sunny, we will go. (possible). Type 2: If I were rich, I would travel. (imaginary).",
      piege:
        "Check the verb after IF: present = Type 1. Past = Type 2. Past perfect = Type 3.",
      astuce:
        "IF + PRESENT = Type 1 (real). IF + PAST = Type 2 (imaginary). IF + PAST PERFECT = Type 3 (past regret).",
    },
  },
  {
    question:
      "Complete: 'If she _____ harder, she would have passed the exam.' (Type 3)",
    options: ["studied", "had studied", "studies", "would study"],
    answer: "had studied",
    fiche: {
      regle:
        "Type 3 (past unreal): If + past perfect (had + PP), would have + PP. Past regret or impossible past.",
      exemple:
        "If she had studied, she would have passed. If I had seen him, I would have told him.",
      piege:
        "Type 3 uses HAD + past participle after IF. Not just past simple!",
      astuce:
        "Type 3: If + HAD + PP, WOULD HAVE + PP. Imaginary past. Expresses regret about the past.",
    },
  },
  {
    question: "What does 'unless' mean in conditionals?",
    options: ["if", "if not / except if", "because", "although"],
    answer: "if not / except if",
    fiche: {
      regle:
        "Unless = if not / except if. Unless + positive verb = negative condition.",
      exemple:
        "Unless you hurry, you will miss the bus. = If you don't hurry, you will miss the bus.",
      piege:
        "Unless already includes the negative. Don't say 'unless you don't hurry' (double negative).",
      astuce:
        "Unless = if not. Unless you study = if you don't study. Replace easily!",
    },
  },
  {
    question: "Choose the correct Type 2 conditional:",
    options: [
      "If I am you, I would apologise.",
      "If I were you, I would apologise.",
      "If I were you, I will apologise.",
      "If I was you, I would apologise.",
    ],
    answer: "If I were you, I would apologise.",
    fiche: {
      regle:
        "In Type 2 conditionals, we use WERE (not was) for all persons, especially with I. 'If I were you' is the standard form.",
      exemple:
        "If I were you, I would study more. If she were here, she would know what to do.",
      piege:
        "If I WAS you is informal/colloquial. In formal/exam English, always use IF I WERE YOU.",
      astuce:
        "If I were you = si j'etais toi. WERE for all persons in Type 2. This is the subjunctive form.",
    },
  },
  {
    question: "Translate: 'Si tu travaillais plus, tu reussirais.' (Type 2)",
    options: [
      "If you work more, you will succeed.",
      "If you worked more, you would succeed.",
      "If you had worked more, you would have succeeded.",
      "If you were working more, you succeed.",
    ],
    answer: "If you worked more, you would succeed.",
    fiche: {
      regle:
        "French imparfait + conditionnel = English Type 2: If + past simple, would + infinitive.",
      exemple:
        "Si tu travaillais = If you worked. Tu reussirais = you would succeed. Type 2!",
      piege:
        "French conditionnel (tu reussirais) = English would + verb. Both express hypothetical situations.",
      astuce:
        "French Type 2: Si + imparfait, conditionnel = English Type 2: If + past simple, would + infinitive.",
    },
  },
  {
    question:
      "What type of conditional is: 'If I had known, I would have called you.'?",
    options: ["Type 1", "Type 2", "Type 3", "Zero conditional"],
    answer: "Type 3",
    fiche: {
      regle:
        "Type 3: If + past perfect (had known), would have + PP (would have called). Impossible past situation.",
      exemple:
        "If I had known = si j'avais su. I would have called = j'aurais appele. Past regret.",
      piege:
        "Had known = past perfect (not past simple knew). Would have called = past conditional.",
      astuce:
        "Type 3 = past regret. Si j'avais su = If I had known. J'aurais fait = I would have done.",
    },
  },
  {
    question: "What is the 'zero conditional' used for?",
    options: [
      "Imaginary situations",
      "General truths and scientific facts",
      "Past regrets",
      "Future plans",
    ],
    answer: "General truths and scientific facts",
    fiche: {
      regle:
        "Zero conditional: If + present simple, present simple. Used for scientific facts, general truths, habits.",
      exemple:
        "If you heat water to 100 degrees, it boils. If you eat too much, you gain weight.",
      piege:
        "Zero conditional uses PRESENT in BOTH parts (not will/would). It's always true!",
      astuce:
        "Zero: If + PRESENT, PRESENT. Always true facts. Type 1: If + PRESENT, WILL. Possible future.",
    },
  },
  {
    question: "Choose the correct sentence:",
    options: [
      "If I would have money, I would buy a car.",
      "If I have money, I would buy a car.",
      "If I had money, I would buy a car.",
      "If I had money, I will buy a car.",
    ],
    answer: "If I had money, I would buy a car.",
    fiche: {
      regle:
        "Type 2: If + PAST SIMPLE, WOULD + infinitive. Never use would in the if-clause!",
      exemple:
        "If I had money, I would buy a car. (Type 2 - hypothetical). If I have money, I will buy a car. (Type 1 - possible).",
      piege:
        "NEVER 'If I would have'. The if-clause NEVER takes would. If + past simple (not would)!",
      astuce:
        "Golden rule: NO WOULD after IF. If + would = always wrong. If + past simple = correct Type 2.",
    },
  },
];

export default function ConditionnelPage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(true);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const fautesRef = useRef(0);

  useEffect(() => {
    if (estConnecte) {
      getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
      getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
    }
  }, [estConnecte]);

  const demarrer = () => {
    const q = shuffleArray(questionsBase)
      .slice(0, maxQuestions)
      .map((q) => ({ ...q, options: shuffleArray(q.options) }));
    setQuestions(q);
    scoreRef.current = 0;
    fautesRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
    setFicheObligatoireLue(true);
    setEtape("quiz");
  };

  const choisirReponse = (option: string) => {
    if (reponseChoisie) return;
    setReponseChoisie(option);
    const correct = option === questions[index].answer;
    setEstCorrecte(correct);
    if (correct) {
      scoreRef.current += 1;
    } else {
      fautesRef.current += 1;
      if (fautesRef.current === 1) setFicheOuverte(true);
      if (fautesRef.current === 6) setFicheObligatoireLue(false);
    }
  };

  const questionSuivante = async () => {
    setFicheOuverte(false);
    if (index + 1 >= questions.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questions.length,
        });
        getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
        getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
      setEstCorrecte(null);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current >= 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">Anglais 4eme</div>
          <h1 className="lecon-titre">Conditionals</h1>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "10px",
                padding: "10px 16px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: "#aaa",
                textAlign: "center",
              }}
            >
              Discovery mode — 5 questions.{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Sign up
              </span>{" "}
              for all 10!
            </div>
          )}
          <div className="lecon-intro">
            Master <strong>conditionals</strong>: Type 1 (real), Type 2
            (hypothetical) and Type 3 (past regret).
          </div>
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    Best score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    Last score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="lecon-points">
            <div className="lecon-point">
              <div className="lecon-point-titre">Type 1 — Real / Possible</div>
              <div className="lecon-point-texte">
                If + present simple, will + infinitive. Possible future
                situation.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> If it rains, I
                will stay home.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Type 2 — Hypothetical</div>
              <div className="lecon-point-texte">
                If + past simple, would + infinitive. Imaginary present or
                future. If I were you = si j'etais toi.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> If I had money,
                I would travel.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Type 3 — Past regret</div>
              <div className="lecon-point-texte">
                If + past perfect, would have + PP. Impossible past. Regret.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> If I had
                studied, I would have passed.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            Start the exercises
          </button>
        </div>
      </div>
    );

  if (etape === "quiz" && questions.length > 0) {
    const q = questions[index];
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {index + 1} / {total}
            </span>
            <span>
              {scoreRef.current} correct answer{scoreRef.current > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="qcm-wrapper">
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((option) => {
              let cn = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) cn += " correct";
                else if (option === reponseChoisie) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={option}
                  className={cn}
                  onClick={() => choisirReponse(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {reponseChoisie && (
            <div
              className={`qcm-feedback ${estCorrecte ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">{estCorrecte ? "✅" : "❌"}</span>
              <div className="feedback-texte">
                <strong>{estCorrecte ? "Well done!" : "Not quite..."}</strong>
                <p>
                  {estCorrecte
                    ? "Great answer!"
                    : `The correct answer is: "${q.answer}"`}
                </p>
                {!estCorrecte && est6emeFaute && !ficheObligatoireLue && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.15)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <p style={{ color: "#ffd166", fontWeight: 700 }}>
                      6 mistakes! Read the card first!
                    </p>
                  </div>
                )}
                {!estCorrecte && (
                  <button
                    onClick={() => setFicheOuverte(true)}
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.2)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      color: "#ffd166",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    See the card
                  </button>
                )}
              </div>
            </div>
          )}
          {reponseChoisie && (
            <div style={{ marginTop: "16px" }}>
              {boutonBloque && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                  }}
                >
                  Read the card to unlock!
                </p>
              )}
              <button
                className="lecon-btn"
                onClick={questionSuivante}
                disabled={boutonBloque}
                style={{
                  opacity: boutonBloque ? 0.4 : 1,
                  cursor: boutonBloque ? "not-allowed" : "pointer",
                }}
              >
                {index + 1 >= total ? "See my result" : "Next question"}
              </button>
            </div>
          )}
        </div>
        {ficheOuverte && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                border: "1px solid rgba(255,209,102,0.4)",
                borderRadius: "20px",
                padding: "28px",
                maxWidth: "500px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#ffd166",
                  marginBottom: "20px",
                }}
              >
                Grammar card
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#4f8ef7",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  THE RULE
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.regle}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(46,196,182,0.1)",
                  border: "1px solid rgba(46,196,182,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#2ec4b6",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  EXAMPLE
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.exemple}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(255,107,107,0.1)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ff6b6b",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  WATCH OUT
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.piege}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "20px",
                  background: "rgba(255,209,102,0.1)",
                  border: "1px solid rgba(255,209,102,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ffd166",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  TIP
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.astuce}
                </div>
              </div>
              <button
                onClick={() => {
                  setFicheOuverte(false);
                  setFicheObligatoireLue(true);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Got it! Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (etape === "resultat") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const message =
      pourcentage >= 80
        ? "Excellent work!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep practising!";
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">{message}</h2>
          <div className="resultat-score">
            {scoreRef.current}/{total}
          </div>
          <p className="resultat-desc">
            You answered {scoreRef.current} question
            {scoreRef.current > 1 ? "s" : ""} correctly out of {total} (
            {pourcentage}%).
          </p>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#aaa",
                  fontSize: "0.9rem",
                  marginBottom: "12px",
                }}
              >
                Sign up for all 10 questions!
              </p>
              <button
                onClick={() => router.push("/inscription")}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign up for free
              </button>
            </div>
          )}
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    Best score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    Last score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              Try again
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              Back to lessons
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
