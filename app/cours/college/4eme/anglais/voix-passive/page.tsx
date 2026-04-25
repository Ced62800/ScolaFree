"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "voix-passive";

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
    question: "How do you form the passive voice?",
    options: [
      "do/does + infinitive",
      "be + past participle",
      "have + past participle",
      "get + present participle",
    ],
    answer: "be + past participle",
    fiche: {
      regle:
        "Passive voice = subject + be (conjugated) + past participle. The agent (doer) can be added with 'by'.",
      exemple:
        "The book is read (by students). The cake was eaten. The letter will be sent.",
      piege:
        "Don't confuse be+PP (passive) with have+PP (present perfect). They look similar but have different meanings.",
      astuce:
        "Passive: subject receives the action. Active: subject does the action. Be = changes tense. PP = stays same.",
    },
  },
  {
    question: "Transform to passive: 'The chef cooks the meal.'",
    options: [
      "The meal is cooked by the chef.",
      "The meal cooked by the chef.",
      "The meal is cooking by the chef.",
      "The meal was cooked by the chef.",
    ],
    answer: "The meal is cooked by the chef.",
    fiche: {
      regle:
        "Active (present): subject + verb. Passive (present): object becomes subject + is/are + PP + by + agent.",
      exemple:
        "Active: The chef cooks the meal. Passive: The meal is cooked by the chef.",
      piege:
        "The object (meal) becomes the subject. The subject (chef) becomes the agent (by the chef).",
      astuce:
        "Step 1: object becomes subject. Step 2: add is/are. Step 3: past participle. Step 4: by + agent.",
    },
  },
  {
    question: "Transform to passive: 'Shakespeare wrote Hamlet.'",
    options: [
      "Hamlet was written by Shakespeare.",
      "Hamlet is written by Shakespeare.",
      "Hamlet written by Shakespeare.",
      "Hamlet was wrote by Shakespeare.",
    ],
    answer: "Hamlet was written by Shakespeare.",
    fiche: {
      regle:
        "Past Simple passive: was/were + past participle. Write is irregular: write/wrote/written.",
      exemple:
        "Active: Shakespeare wrote Hamlet. Passive: Hamlet was written by Shakespeare.",
      piege:
        "Was WROTE is wrong! Written is the past participle of write (irregular). Was written is correct.",
      astuce:
        "Write/wrote/WRITTEN. Past simple passive = was/were + PP. Irregular verbs: learn their 3 forms!",
    },
  },
  {
    question: "Which sentence is in the passive voice?",
    options: [
      "The dog bit the man.",
      "The man was bitten by the dog.",
      "The man bites the dog.",
      "The man will bite the dog.",
    ],
    answer: "The man was bitten by the dog.",
    fiche: {
      regle:
        "Passive voice = the subject receives the action. Key: be + past participle. 'Was bitten' = passive.",
      exemple:
        "The man was bitten by the dog. (passive - the man received the action). The dog bit the man (active).",
      piege:
        "Passive: look for was/were/is/are + past participle. Active: the subject performs the action.",
      astuce:
        "If you can find 'be + past participle', it's passive. 'Was bitten' = was (be) + bitten (PP) = PASSIVE.",
    },
  },
  {
    question: "When do we use the passive voice?",
    options: [
      "When the doer is known and important",
      "When the action or result is more important than the doer",
      "When we are angry",
      "Only in formal writing",
    ],
    answer: "When the action or result is more important than the doer",
    fiche: {
      regle:
        "We use passive when: the doer is unknown, unimportant, or obvious. We focus on the action or result.",
      exemple:
        "The window was broken. (we don't know/care who). English is spoken here. (everyone speaks it).",
      piege:
        "Passive is common in science, news and formal writing. But it's used in everyday English too!",
      astuce:
        "Passive = focus on WHAT happened, not WHO did it. If the doer is unknown or obvious = use passive.",
    },
  },
  {
    question: "Transform: 'They will build a new school.'",
    options: [
      "A new school will built.",
      "A new school will be built.",
      "A new school was built.",
      "A new school is built.",
    ],
    answer: "A new school will be built.",
    fiche: {
      regle:
        "Future passive: will + be + past participle. Will NEVER changes. Be stays as 'be'. Then past participle.",
      exemple:
        "Active: They will build a school. Passive: A school will be built (by them).",
      piege:
        "Will + be (not 'will been' or 'will built'). The structure is: will + be + past participle.",
      astuce:
        "Future passive: WILL + BE + PP. Simple! Will is always 'will', be is always 'be', then PP.",
    },
  },
  {
    question: "Fill in: 'The results _____ announced tomorrow.'",
    options: [
      "will announce",
      "will be announced",
      "are announced",
      "were announced",
    ],
    answer: "will be announced",
    fiche: {
      regle:
        "Tomorrow = future. Passive future = will be + past participle. Announce is regular: announced.",
      exemple:
        "The results will be announced tomorrow. The winner will be chosen next week.",
      piege:
        "Tomorrow = future, so use 'will'. Passive = will be + PP. Not 'will announced' (missing 'be').",
      astuce:
        "Time clue: tomorrow = future. Passive + future = will be + past participle. Results = they (plural).",
    },
  },
  {
    question: "Make passive: 'People speak English in Australia.'",
    options: [
      "English is spoken in Australia.",
      "English speaks in Australia.",
      "English was spoken in Australia.",
      "English is speaking in Australia.",
    ],
    answer: "English is spoken in Australia.",
    fiche: {
      regle:
        "When the agent is 'people/they/someone', we usually omit it in the passive. Speak is irregular: spoken.",
      exemple:
        "People speak English = English is spoken. They sell newspapers = Newspapers are sold.",
      piege:
        "Speak/spoke/SPOKEN (irregular). 'Is spoke' is wrong - use the past participle 'spoken'.",
      astuce:
        "People/they/someone = agent is dropped in passive. Speak-spoke-SPOKEN (irregular past participle).",
    },
  },
  {
    question: "Which is correct passive (past)?",
    options: [
      "The letter was wrote.",
      "The letter is written.",
      "The letter was written.",
      "The letter were written.",
    ],
    answer: "The letter was written.",
    fiche: {
      regle:
        "Past passive = was/were + past participle. Letter is singular = WAS. Write is irregular: written.",
      exemple:
        "The letter was written (by her). The letters were written (plural). The emails were sent.",
      piege:
        "WAS for singular (letter, book, car). WERE for plural (letters, books, cars). Written not wrote!",
      astuce:
        "Singular = was + PP. Plural = were + PP. Write/wrote/WRITTEN. Was written = correct past passive.",
    },
  },
  {
    question: "Translate: 'Ce gateau a ete fait par ma mere.'",
    options: [
      "This cake made by my mother.",
      "This cake is made by my mother.",
      "This cake was made by my mother.",
      "This cake has made by my mother.",
    ],
    answer: "This cake was made by my mother.",
    fiche: {
      regle:
        "Passe compose in French = Past Simple passive in English (often). Was/were + past participle + by + agent.",
      exemple:
        "Ce gateau a ete fait = This cake was made. Il a ete construit = It was built.",
      piege:
        "French 'a ete fait' (passe compose) often translates to English 'was made' (past simple passive).",
      astuce:
        "French passe compose passif = English was/were + past participle. Make/made/MADE (irregular).",
    },
  },
];

export default function VoixPassivePage() {
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
          <h1 className="lecon-titre">The Passive Voice</h1>
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
              Mode decouverte — 5 questions.{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Inscris-toi
              </span>{" "}
              pour les 10 questions !
            </div>
          )}
          <div className="lecon-intro">
            Master the <strong>passive voice</strong>: formation, transformation
            and use in different tenses.
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
              <div className="lecon-point-titre">Formation</div>
              <div className="lecon-point-texte">
                be (conjugated) + past participle. Present: is/are + PP. Past:
                was/were + PP. Future: will be + PP.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> The meal is
                cooked. Hamlet was written. A school will be built.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Active to Passive</div>
              <div className="lecon-point-texte">
                Object becomes subject. Subject becomes agent (by...). Verb: be
                + past participle (same tense).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> The chef cooks
                the meal. The meal is cooked by the chef.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">When to use it</div>
              <div className="lecon-point-texte">
                When the doer is unknown, unimportant or obvious. Focus on the
                action/result, not the doer.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> The window was
                broken. English is spoken here.
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
                      padding: "10px 14px",
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
                    See the grammar card
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
                Discovery mode. Sign up for all 10 questions!
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
                  fontSize: "0.9rem",
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
