"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "modal-verbs";

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
    question: "Which sentence expresses an obligation?",
    options: [
      "You should eat more vegetables.",
      "You must wear a seatbelt.",
      "You might be right.",
      "You could try again.",
    ],
    answer: "You must wear a seatbelt.",
    fiche: {
      regle:
        "MUST expresses strong obligation or necessity. SHOULD expresses advice or recommendation. MIGHT/COULD express possibility. Must = it is necessary, compulsory.",
      exemple:
        "You must pay your taxes. (obligation). You should exercise more. (advice). You might be late. (possibility). You could call her. (suggestion).",
      piege:
        "Must ≠ should. Must = strong obligation (you have no choice). Should = advice (you have a choice but it would be good).",
      astuce:
        "Must = obligatoire (pas le choix). Should = conseil (c'est bien mais optionnel). Could = possibilite ou suggestion. Might = faible possibilite.",
    },
  },
  {
    question:
      "Choose the correct modal: 'She ___ speak three languages fluently.'",
    options: ["must", "should", "can", "might"],
    answer: "can",
    fiche: {
      regle:
        "CAN expresses ability (something someone is able to do). Could = past ability or polite possibility. Can = present ability.",
      exemple:
        "I can swim. (ability). Can you help me? (request). She can speak French. (ability). Could you open the door? (polite request).",
      piege:
        "Can ≠ may. Can = ability or informal permission. May = formal permission or possibility. 'Can I go?' is informal. 'May I go?' is formal.",
      astuce:
        "CAN = ability (je peux/je sais faire). COULD = past ability or polite request. CAN'T = impossibility or prohibition.",
    },
  },
  {
    question: "What does 'might' express in: 'It might rain tomorrow.'?",
    options: ["Certainty", "Obligation", "Weak possibility", "Prohibition"],
    answer: "Weak possibility",
    fiche: {
      regle:
        "MIGHT expresses weak possibility (maybe, perhaps — less certain than 'may'). MAY expresses moderate possibility. WILL expresses certainty about the future.",
      exemple:
        "It might rain. (weak possibility — maybe 30%). It may rain. (moderate — maybe 50%). It will rain. (certain — 100%).",
      piege:
        "Might ≠ must. Might = maybe. Must = certainty about a logical deduction or obligation. 'He must be tired' = I'm sure he is tired.",
      astuce:
        "Possibility scale: will (certain) > may (likely) > might (possible) > could (slight chance). Might = moins certain que may.",
    },
  },
  {
    question: "Which sentence uses 'should' correctly?",
    options: [
      "You should to study more.",
      "You should studying more.",
      "You should study more.",
      "You should studied more.",
    ],
    answer: "You should study more.",
    fiche: {
      regle:
        "Modal verbs (can, could, should, must, may, might, will, would) are ALWAYS followed by the BASE FORM (infinitive without 'to'). Never add -ing, -ed or 'to' after a modal.",
      exemple:
        "You should study. (correct). You must go. (correct). She can swim. (correct). You could try. (correct). NEVER: should to go / must going / can swam.",
      piege:
        "The most common mistake: adding 'to' after a modal. 'You should TO study' is wrong. Modal + base form = always correct.",
      astuce:
        "Modal + BASE FORM (no to, no -ing, no -ed). Should go. Must leave. Can swim. Will help. Would like. Could try. Always!",
    },
  },
  {
    question:
      "Choose the correct modal for past ability: 'When I was young, I ___ run very fast.'",
    options: ["can", "could", "should", "must"],
    answer: "could",
    fiche: {
      regle:
        "COULD is the past form of CAN. It expresses past ability (something you were able to do in the past but perhaps cannot anymore). Also used for polite requests.",
      exemple:
        "I could run fast when I was young. (past ability). She could speak Italian as a child. (past ability). Could you help me? (polite request).",
      piege:
        "Could ≠ was able to in every context. For a specific successful action in the past, use 'was/were able to': 'I was able to finish on time' (NOT 'I could finish' for a specific achievement).",
      astuce:
        "Could = past of can. For general past ability: could. For specific past achievement: was able to. Polite request: Could you...?",
    },
  },
  {
    question: "Which modal expresses a prohibition?",
    options: [
      "You don't have to wear a tie.",
      "You mustn't smoke here.",
      "You might not come.",
      "You shouldn't stay too long.",
    ],
    answer: "You mustn't smoke here.",
    fiche: {
      regle:
        "MUSTN'T = strong prohibition (it is forbidden, do not do it). DON'T HAVE TO = no obligation (you are not required to, but you can if you want). These are completely different!",
      exemple:
        "You mustn't enter. (forbidden). You don't have to come. (it's optional). You mustn't lie. (prohibition). You don't have to wear a uniform. (no obligation).",
      piege:
        "Mustn't ≠ don't have to. Mustn't = FORBIDDEN. Don't have to = NOT NECESSARY (but allowed). Extremely common exam mistake!",
      astuce:
        "Mustn't = interdit (forbidden). Don't have to = pas obligatoire (not necessary). Must = obligatoire. These three are essential to distinguish.",
    },
  },
  {
    question:
      "Choose the correct modal: '___ I open the window? It's hot in here.'",
    options: ["Must", "Should", "May", "Would"],
    answer: "May",
    fiche: {
      regle:
        "MAY is used for formal permission requests: 'May I...?' = Puis-je...? CAN is informal: 'Can I...?' Both are correct but May is more polite and formal.",
      exemple:
        "May I use your phone? (formal). Can I sit here? (informal). May I leave early? (formal permission). You may go. (granting permission).",
      piege:
        "May ≠ might in permission context. May = permission request. Might = possibility. 'May I go?' = permission. 'It might rain.' = possibility.",
      astuce:
        "Permission: May I? (formal) / Can I? (informal). Possibility: may / might. Offering: Would you like...? Shall I...?",
    },
  },
  {
    question: "What does 'would' express in: 'Would you like some tea?'",
    options: [
      "Past habit",
      "Strong obligation",
      "Polite offer or request",
      "Prohibition",
    ],
    answer: "Polite offer or request",
    fiche: {
      regle:
        "WOULD is used for: polite offers and requests ('Would you like...?', 'Would you mind...?'), conditional sentences ('I would go if...'), past habits ('We would often visit...').",
      exemple:
        "Would you like coffee? (polite offer). Would you mind closing the door? (polite request). I would help if I could. (conditional). We would go there every summer. (past habit).",
      piege:
        "Would can express past habits (like 'used to') but 'used to' is also possible. 'We would visit' = 'We used to visit'. Would is more formal.",
      astuce:
        "Would: polite offers (Would you like?), polite requests (Would you mind?), conditionals (I would if...), past habits (We would often...).",
    },
  },
  {
    question: "Complete: 'You ___ have studied harder. Now it's too late.'",
    options: ["should", "must", "can", "might"],
    answer: "should",
    fiche: {
      regle:
        "SHOULD HAVE + past participle = past regret or criticism. It means someone didn't do something they were supposed to do. 'Should have done' = 'aurais du faire'.",
      exemple:
        "You should have studied. (you didn't — regret/criticism). He should have called. (he didn't). I should have left earlier. (I didn't — I regret it).",
      piege:
        "Should have + p.p. ≠ should + base form. 'Should study' (present advice). 'Should have studied' (past regret — it's done, can't change it).",
      astuce:
        "Should have + p.p. = regret or criticism about the past. Shouldn't have = you did something wrong. Must have = logical deduction about the past.",
    },
  },
  {
    question: "Which sentence uses 'must' for logical deduction?",
    options: [
      "You must finish your homework.",
      "She must be at home — her car is outside.",
      "You must not enter.",
      "Students must wear uniform.",
    ],
    answer: "She must be at home — her car is outside.",
    fiche: {
      regle:
        "MUST has two main uses: 1) Obligation ('You must do it'). 2) Logical deduction ('She must be tired' = I'm sure she is, based on evidence). Context determines the meaning.",
      exemple:
        "Obligation: You must pay. Deduction: He must be lying — his story doesn't make sense. She must have left — her bag is gone. They must be rich — look at that house!",
      piege:
        "Must (deduction) is positive certainty. Can't (deduction) is negative certainty: 'She can't be at home — I saw her leave.'",
      astuce:
        "Must (deduction) = I'm certain based on evidence. Can't (deduction) = I'm certain it's NOT true. Might/could = I think maybe. Evidence → deduction!",
    },
  },
];

export default function ModalVerbsPage() {
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
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="UK"
              style={{
                width: "24px",
                verticalAlign: "middle",
                borderRadius: "3px",
                marginRight: "8px",
              }}
            />
            Anglais — 3ème
          </div>
          <h1 className="lecon-titre">Modal Verbs</h1>
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
              Discovery mode — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Sign up
              </span>{" "}
              for all 10 questions!
            </div>
          )}
          <div className="lecon-intro">
            Master <strong>modal verbs</strong>: can, could, must, should, may,
            might, would and their uses for ability, obligation, permission,
            possibility and deduction.
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
                    🏆 Best score
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
                    🕐 Last score
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
              <div className="lecon-point-titre">📋 Key modal uses</div>
              <div className="lecon-point-texte">
                Must = obligation or deduction. Should = advice. Can = ability.
                Could = past ability or polite request. May = formal permission
                or possibility. Might = weak possibility. Would = polite offer
                or conditional.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Critical:</span> Mustn't =
                FORBIDDEN. Don't have to = NOT NECESSARY (but allowed). These
                are totally different!
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📐 Grammar rule</div>
              <div className="lecon-point-texte">
                Modal + BASE FORM (never to, -ing or -ed). Should go. Must
                leave. Can swim. Might rain. Would like. Past modal: should have
                + p.p. (regret), must have + p.p. (deduction).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> You should
                study. (present). You should have studied. (past regret — too
                late now).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🎯 Deduction with must/can't
              </div>
              <div className="lecon-point-texte">
                Must (positive deduction) = I'm sure it's true. Can't (negative
                deduction) = I'm sure it's NOT true. Might/could = maybe. All
                based on evidence.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> She must be
                tired — she worked all night. He can't be home — his lights are
                off.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Start exercises →
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
            ← Retour
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
                <strong>
                  {estCorrecte ? "Well done! 🎉" : "Not quite..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellent answer!"
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
                      😅 6 mistakes!
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Read the study card before continuing! 💪
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
                    📖 View study card
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
                  📖 Read the card to unlock!
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
                {index + 1 >= total ? "See my result →" : "Next question →"}
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
                📖 Study card
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
                    textTransform: "uppercase",
                  }}
                >
                  📚 The rule
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
                    textTransform: "uppercase",
                  }}
                >
                  ✏️ Example
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
                    textTransform: "uppercase",
                  }}
                >
                  ⚠️ Watch out
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
                    textTransform: "uppercase",
                  }}
                >
                  💡 Tip
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
                Got it! Continue →
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
            ← Retour
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
                Sign up for free →
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
                    🏆 Best score
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
                    🕐 Last score
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
              🔄 Try again
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              ← Back to topics
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
