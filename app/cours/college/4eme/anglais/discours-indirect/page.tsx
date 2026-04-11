"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "discours-indirect";

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
    question: "Transform to reported speech: He said: 'I am tired.'",
    options: [
      "He said that he is tired.",
      "He said that he was tired.",
      "He said that I was tired.",
      "He told that he was tired.",
    ],
    answer: "He said that he was tired.",
    fiche: {
      regle:
        "Reported speech: say/said that + clause. Present simple becomes past simple (am becomes was).",
      exemple:
        "He said: 'I am tired.' = He said that he was tired. The pronoun I changes to he.",
      piege:
        "Said that (not told that). Tell needs an object: He told ME that... But said that has no object.",
      astuce:
        "SAY + (that) + clause. TELL + person + (that) + clause. Am/is/are becomes was/were.",
    },
  },
  {
    question: "Transform: She said: 'I will come tomorrow.'",
    options: [
      "She said she will come tomorrow.",
      "She said she would come the next day.",
      "She said she comes the next day.",
      "She told she would come the next day.",
    ],
    answer: "She said she would come the next day.",
    fiche: {
      regle:
        "Will becomes would in reported speech. Tomorrow becomes the next day (time expressions change).",
      exemple:
        "She said: 'I will come tomorrow.' = She said she would come the next day.",
      piege:
        "Tomorrow = the next day. Will = would. Said (not told here - no direct object person).",
      astuce:
        "Will = would. Can = could. May = might. Tomorrow = the next day. Yesterday = the day before.",
    },
  },
  {
    question: "Transform the question: He asked: 'Are you happy?'",
    options: [
      "He asked if I was happy.",
      "He asked that I was happy.",
      "He asked was I happy.",
      "He asked me if you were happy.",
    ],
    answer: "He asked if I was happy.",
    fiche: {
      regle:
        "Yes/No questions in reported speech: asked if/whether + subject + verb (no inversion). Are = was.",
      exemple:
        "He asked: 'Are you happy?' = He asked if I was happy. (if + statement word order)",
      piege:
        "No inversion in reported questions! Not 'he asked was I happy'. Use if/whether + subject + verb.",
      astuce:
        "Yes/No question = asked if/whether + STATEMENT order (subject + verb). No question mark needed.",
    },
  },
  {
    question: "Transform: She asked: 'Where do you live?'",
    options: [
      "She asked where I lived.",
      "She asked where did I live.",
      "She asked where I live.",
      "She asked that I lived.",
    ],
    answer: "She asked where I lived.",
    fiche: {
      regle:
        "Wh- questions in reported speech: asked + wh-word + subject + verb (no inversion). Do/does disappears.",
      exemple:
        "She asked: 'Where do you live?' = She asked where I lived. (no did, no inversion)",
      piege:
        "Don't keep the auxiliary do/does/did. 'Where did I live' is wrong. Just: where I lived.",
      astuce:
        "Wh-question reported: asked + WHY/WHERE/WHEN/HOW + subject + verb. Statement order!",
    },
  },
  {
    question: "Transform: He told me: 'Open the window!'",
    options: [
      "He told me to open the window.",
      "He told me that I open the window.",
      "He said me to open the window.",
      "He told me open the window.",
    ],
    answer: "He told me to open the window.",
    fiche: {
      regle:
        "Commands/imperatives in reported speech: told + person + to + infinitive (positive) or not to + infinitive (negative).",
      exemple: "He said: 'Open the window!' = He told me to open the window.",
      piege:
        "SAY + to + infinitive is wrong! Use TELL + person + to + infinitive for commands.",
      astuce:
        "Command: told + person + TO + infinitive. Negative: told + person + NOT TO + infinitive.",
    },
  },
  {
    question: "Which tense change is correct in reported speech?",
    options: [
      "Present simple stays present simple",
      "Present simple becomes past simple",
      "Past simple becomes present perfect",
      "Future becomes present",
    ],
    answer: "Present simple becomes past simple",
    fiche: {
      regle:
        "Tense backshift in reported speech: present simple = past simple. Present perfect = past perfect. Will = would.",
      exemple:
        "He said: 'I eat' = He said he ate. She said: 'I have finished' = She said she had finished.",
      piege:
        "Tenses go one step back in time. Present = past. Past simple = past perfect. Will = would.",
      astuce:
        "Backshift: present becomes past. Past becomes past perfect. Will becomes would. One step back!",
    },
  },
  {
    question: "What does 'yesterday' change to in reported speech?",
    options: ["tomorrow", "the next day", "the day before", "that day"],
    answer: "the day before",
    fiche: {
      regle:
        "Time expressions change in reported speech: yesterday = the day before. Tomorrow = the next day. Today = that day. Now = then.",
      exemple:
        "She said: 'I went there yesterday.' = She said she had gone there the day before.",
      piege:
        "Yesterday does NOT stay yesterday. It changes to the day before (or the previous day).",
      astuce:
        "Yesterday = the day before. Tomorrow = the next day. Today = that day. Now = then. Ago = before.",
    },
  },
  {
    question: "Transform: 'Don't touch that!' he shouted.",
    options: [
      "He shouted to not touch that.",
      "He shouted that I didn't touch that.",
      "He told me not to touch that.",
      "He said me not touch that.",
    ],
    answer: "He told me not to touch that.",
    fiche: {
      regle:
        "Negative command in reported speech: told + person + NOT TO + infinitive.",
      exemple:
        "Don't touch that = told me not to touch that. Don't move = told me not to move.",
      piege:
        "TOLD + person + NOT TO + infinitive. Not 'said me' (wrong). Not 'to not touch' (not standard).",
      astuce:
        "Negative command: TOLD + person + NOT TO + verb. Simple and consistent!",
    },
  },
  {
    question: "Transform: She said: 'I can swim.'",
    options: [
      "She said she can swim.",
      "She said she could swim.",
      "She said she may swim.",
      "She told she could swim.",
    ],
    answer: "She said she could swim.",
    fiche: {
      regle:
        "Modal verbs change in reported speech: can = could. May = might. Must = had to. Will = would.",
      exemple:
        "She said: 'I can swim.' = She said she could swim. He said: 'I must go.' = He said he had to go.",
      piege:
        "Can = could (not can). Must = had to (must doesn't stay must). Will = would.",
      astuce:
        "Modal backshift: CAN = could. MAY = might. MUST = had to. WILL = would. SHALL = should.",
    },
  },
  {
    question: "Choose the correctly reported sentence:",
    options: [
      "He said he is going to Paris.",
      "He said that he was going to Paris.",
      "He said that he go to Paris.",
      "He told that he was going to Paris.",
    ],
    answer: "He said that he was going to Paris.",
    fiche: {
      regle:
        "Said that + past tense. Is going (present continuous) becomes was going (past continuous).",
      exemple:
        "He said: 'I am going to Paris.' = He said that he was going to Paris.",
      piege:
        "Said that (not told that - no direct object). Is going = was going (tense backshift).",
      astuce:
        "SAID THAT = no object needed. TOLD + object + that. Is/are + -ing becomes was/were + -ing.",
    },
  },
];

export default function DiscoursIndirectPage() {
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
          <h1 className="lecon-titre">Reported Speech</h1>
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
            Master <strong>reported speech</strong>: tense changes, pronouns,
            time expressions and reported questions.
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
              <div className="lecon-point-titre">Tense backshift</div>
              <div className="lecon-point-texte">
                Present = past. Will = would. Can = could. Present perfect =
                past perfect. Everything goes one step back.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I am tired = he
                said he WAS tired.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Say vs Tell</div>
              <div className="lecon-point-texte">
                SAY + (that) + clause (no object needed). TELL + person + (that)
                + clause (need an object).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> He said that...
                / He told me that...
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Questions and commands</div>
              <div className="lecon-point-texte">
                Yes/No = asked if/whether. Wh = asked + wh-word + statement.
                Command = told + to + infinitive.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Are you happy? =
                asked if I was happy.
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
