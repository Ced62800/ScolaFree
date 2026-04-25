"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "present-perfect";

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
    question: "How do you form the Present Perfect?",
    options: [
      "was/were + verb-ing",
      "have/has + past participle",
      "did + infinitive",
      "will + infinitive",
    ],
    answer: "have/has + past participle",
    fiche: {
      regle:
        "Present Perfect = have/has + past participle. I have eaten. She has gone. We have seen.",
      exemple:
        "I have visited Paris. He has never eaten sushi. They have just arrived.",
      piege:
        "Don't confuse with Past Simple. Present Perfect links past to present. Past Simple is a finished action.",
      astuce:
        "HAVE for I/you/we/they. HAS for he/she/it. + past participle (regular: -ed, irregular: learn the list).",
    },
  },
  {
    question: "Which sentence uses the Present Perfect correctly?",
    options: [
      "I have went to school yesterday.",
      "She has seen that film last week.",
      "We have just finished our homework.",
      "He have eaten lunch.",
    ],
    answer: "We have just finished our homework.",
    fiche: {
      regle:
        "Present Perfect is NOT used with finished time expressions (yesterday, last week, in 2020). Use Past Simple then.",
      exemple:
        "WRONG: I have seen him yesterday. RIGHT: I saw him yesterday. RIGHT: I have seen him (recently/ever).",
      piege:
        "Yesterday, last week, ago, in 2020 = Past Simple, NOT Present Perfect!",
      astuce:
        "Time expressions: just/already/yet/ever/never = Present Perfect. Yesterday/ago/last = Past Simple.",
    },
  },
  {
    question: "Fill in: She _____ never _____ sushi. (eat)",
    options: ["has / eaten", "have / eaten", "has / ate", "did / eat"],
    answer: "has / eaten",
    fiche: {
      regle:
        "She = he/she/it = use HAS. Never comes between have/has and the past participle.",
      exemple:
        "She has never eaten sushi. He has always loved music. She has never been to London.",
      piege:
        "HAS for she (not HAVE). Past participle of eat = eaten (not ate, which is Past Simple).",
      astuce:
        "Never/ever/always go BETWEEN have/has and the past participle. She has NEVER eaten.",
    },
  },
  {
    question: "What does 'yet' mean in: 'Have you finished yet?'",
    options: [
      "already",
      "never",
      "by now / up to now (in questions/negatives)",
      "just",
    ],
    answer: "by now / up to now (in questions/negatives)",
    fiche: {
      regle:
        "YET = used in questions and negatives to ask if something has happened by now. Already = in affirmatives.",
      exemple:
        "Have you eaten yet? / I haven't eaten yet. VS I have already eaten. / Have you already eaten?",
      piege:
        "Yet = questions + negatives. Already = affirmatives (and surprised questions). Don't mix them up!",
      astuce:
        "YET: Have you done it YET? / Not YET. ALREADY: I have ALREADY done it. Just: I have JUST done it.",
    },
  },
  {
    question: "Choose the correct sentence:",
    options: [
      "I have seen him yesterday.",
      "I saw him yesterday.",
      "I have saw him yesterday.",
      "I did see him yesterday.",
    ],
    answer: "I saw him yesterday.",
    fiche: {
      regle:
        "Yesterday = finished time = Past Simple. Never use Present Perfect with yesterday.",
      exemple:
        "Yesterday I SAW a great film. (Past Simple). I HAVE SEEN a great film. (Present Perfect, no time given).",
      piege:
        "'I have seen him yesterday' is a very common mistake. Yesterday = Past Simple always!",
      astuce:
        "No time expression or recent/unfinished = Present Perfect. Specific past time = Past Simple.",
    },
  },
  {
    question: "Translate: 'Je n'ai jamais mange de hamburger.'",
    options: [
      "I never ate a hamburger.",
      "I have never eaten a hamburger.",
      "I didn't eat a hamburger.",
      "I haven't ate a hamburger.",
    ],
    answer: "I have never eaten a hamburger.",
    fiche: {
      regle:
        "Never with Present Perfect = I have never + past participle. This expresses a life experience (up to now).",
      exemple:
        "I have never been to Japan. She has never seen snow. They have never tried Indian food.",
      piege:
        "Never = Present Perfect (experience in life). Ate = Past Simple. Haven't ate = WRONG (ate, not eaten).",
      astuce:
        "NEVER = Present Perfect. I have NEVER + past participle. Eaten (not ate) is the past participle of eat.",
    },
  },
  {
    question: "What is the past participle of 'go'?",
    options: ["goed", "went", "gone", "going"],
    answer: "gone",
    fiche: {
      regle:
        "Go is irregular: go / went / gone. Present Perfect: I have gone (I am gone now) / I have been (and returned).",
      exemple:
        "She has gone to Paris. (she is there now). She has been to Paris. (she visited and came back).",
      piege:
        "Went = Past Simple (I went to Paris). Gone = Past Participle. Don't confuse them!",
      astuce:
        "Gone = away now. Been = visited and returned. I have been to Paris = I visited Paris (and I'm back).",
    },
  },
  {
    question: "Choose the correct translation of 'Elle vient juste de partir.'",
    options: [
      "She just left.",
      "She has just left.",
      "She is just leaving.",
      "She just has left.",
    ],
    answer: "She has just left.",
    fiche: {
      regle:
        "Just = very recently = Present Perfect. She has just + past participle.",
      exemple:
        "He has just called. / The train has just arrived. / I have just eaten.",
      piege:
        "Just with Present Perfect = very recent action. Don't say 'She just has left' (wrong word order).",
      astuce:
        "JUST goes BETWEEN have/has and the past participle. She has JUST left.",
    },
  },
  {
    question: "How long have you lived here? Choose the correct answer:",
    options: [
      "I live here for 5 years.",
      "I lived here for 5 years.",
      "I have lived here for 5 years.",
      "I am living here since 5 years.",
    ],
    answer: "I have lived here for 5 years.",
    fiche: {
      regle:
        "FOR + duration / SINCE + starting point = Present Perfect (ongoing situation from past to now).",
      exemple:
        "I have lived here FOR 5 years. / I have lived here SINCE 2019. / She has worked here FOR a long time.",
      piege:
        "For = duration (5 years, a long time). Since = starting point (2019, Monday, I was born). Both use Present Perfect.",
      astuce:
        "FOR + duration. SINCE + point in time. Both with Present Perfect for ongoing situations.",
    },
  },
  {
    question:
      "Which adverb is used with Present Perfect to show a recent action?",
    options: ["yesterday", "ago", "just", "last year"],
    answer: "just",
    fiche: {
      regle:
        "Just = very recently = Present Perfect. Yesterday/ago/last year = Past Simple.",
      exemple:
        "I have JUST arrived. / She has JUST called. / We have JUST finished.",
      piege:
        "Just, already, yet, ever, never, for, since = Present Perfect. Yesterday, ago, last = Past Simple.",
      astuce:
        "JUST SEEN ALREADY NEVER = Present Perfect key words. Memorise them!",
    },
  },
];

export default function PresentPerfectPage() {
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
          <h1 className="lecon-titre">The Present Perfect</h1>
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
            Master the <strong>Present Perfect</strong>: experiences, recent
            actions and situations from the past to now.
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
                have/has + past participle. HAVE for I/you/we/they. HAS for
                he/she/it. Regular PP: verb + ed. Irregular: memorise!
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I have eaten.
                She has gone. We have seen.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Key words</div>
              <div className="lecon-point-texte">
                Just (recent), already (affirmative), yet (questions/negatives),
                ever/never (experience), for (duration), since (starting point).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I have just
                arrived. Have you eaten yet? I have never tried it.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                Present Perfect vs Past Simple
              </div>
              <div className="lecon-point-texte">
                Yesterday/ago/last = Past Simple. No specific time or recent =
                Present Perfect.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I SAW him
                yesterday. / I HAVE SEEN him (recently).
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
                    <p
                      style={{
                        color: "#ffd166",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
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
