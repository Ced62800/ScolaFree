"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "droits-citoyennete";

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
    question: "What is freedom of speech?",
    options: [
      "The right to speak any language",
      "The right to express your opinions freely",
      "The right to study for free",
      "The right to travel freely",
    ],
    answer: "The right to express your opinions freely",
    fiche: {
      regle:
        "Freedom of speech = the right to express opinions without censorship. A fundamental human right.",
      exemple:
        "In democratic countries, people can criticise the government without fear. This is freedom of speech.",
      piege:
        "Freedom of speech does not mean you can say anything (e.g. hate speech, defamation may be illegal).",
      astuce:
        "Freedom of speech = liberte d expression. Freedom of the press = liberte de la presse.",
    },
  },
  {
    question: "What does the right to vote allow citizens to do?",
    options: [
      "Travel without a passport",
      "Participate in elections to choose their leaders",
      "Study at any school",
      "Work in any country",
    ],
    answer: "Participate in elections to choose their leaders",
    fiche: {
      regle:
        "The right to vote (suffrage) allows citizens to elect their representatives in a democracy.",
      exemple:
        "In the UK, citizens can vote from the age of 18 in general elections and local elections.",
      piege:
        "Not everyone has always had the right to vote. Women's suffrage was a major historical struggle.",
      astuce:
        "Vote = voter. Suffrage = droit de vote. Election = election. Democracy = democratie.",
    },
  },
  {
    question: "What is discrimination?",
    options: [
      "A type of school subject",
      "Treating someone unfairly because of who they are",
      "A government law",
      "A form of protest",
    ],
    answer: "Treating someone unfairly because of who they are",
    fiche: {
      regle:
        "Discrimination = treating someone unfairly based on race, gender, religion, age, disability etc.",
      exemple:
        "Refusing to hire someone because of their race is racial discrimination. It is illegal in most countries.",
      piege:
        "Discrimination can be direct (obvious) or indirect (a rule that affects some groups more than others).",
      astuce:
        "Discriminate = discriminer. Equality = egalite. Equal rights = droits egaux. Fair = equitable.",
    },
  },
  {
    question: "What is the United Nations (UN)?",
    options: [
      "A university in New York",
      "An international organisation that promotes peace and human rights",
      "An American television channel",
      "A European political party",
    ],
    answer:
      "An international organisation that promotes peace and human rights",
    fiche: {
      regle:
        "The UN (United Nations) is an international organisation founded in 1945 to promote peace, security and human rights.",
      exemple:
        "The UN has 193 member states. It created the Universal Declaration of Human Rights in 1948.",
      piege:
        "The UN is international (worldwide), not just American or European, though its HQ is in New York.",
      astuce:
        "UN = Nations Unies. UNESCO = culture/education. UNICEF = children. WHO = world health.",
    },
  },
  {
    question: "What does equality mean?",
    options: [
      "Everyone being the same person",
      "Everyone having the same rights and opportunities",
      "Everyone earning the same salary",
      "Everyone speaking the same language",
    ],
    answer: "Everyone having the same rights and opportunities",
    fiche: {
      regle:
        "Equality = the state of being equal, especially having the same rights, status and opportunities.",
      exemple:
        "Gender equality means women and men have the same rights. Racial equality means equal treatment regardless of race.",
      piege:
        "Equality does not mean everyone is identical. It means everyone has the same rights and opportunities.",
      astuce:
        "Equality = egalite. Equity = equite (fair treatment considering differences). Equal rights = droits egaux.",
    },
  },
  {
    question: "What is a refugee?",
    options: [
      "A person on holiday",
      "A person who has fled their country due to persecution or war",
      "A foreign student",
      "A person who works abroad",
    ],
    answer: "A person who has fled their country due to persecution or war",
    fiche: {
      regle:
        "A refugee is a person forced to leave their country because of war, persecution or natural disaster.",
      exemple:
        "Many Syrian refugees fled to Europe during the civil war. They applied for asylum in other countries.",
      piege:
        "Refugee is different from immigrant (who chose to move). Refugees are forced to leave their country.",
      astuce:
        "Refugee = refugie. Asylum = asile. Migrate = migrer. Immigrant = immigrant. Flee = fuir.",
    },
  },
  {
    question: "What does democracy mean?",
    options: [
      "Rule by one person",
      "Government by the people or their elected representatives",
      "Rule by the military",
      "Government by the richest people",
    ],
    answer: "Government by the people or their elected representatives",
    fiche: {
      regle:
        "Democracy = government by the people. Citizens vote to choose their leaders and make decisions.",
      exemple:
        "The UK, France and the USA are democracies. Citizens vote in regular elections.",
      piege:
        "Democracy comes from Greek: demos (people) + kratos (power). Power of the people!",
      astuce:
        "Democracy = democratie. Dictator = dictateur. Election = election. Parliament = parlement.",
    },
  },
  {
    question: "What is the Universal Declaration of Human Rights?",
    options: [
      "An American law",
      "A UN document listing fundamental rights for all humans",
      "A European Union law",
      "A religious text",
    ],
    answer: "A UN document listing fundamental rights for all humans",
    fiche: {
      regle:
        "The Universal Declaration of Human Rights (1948) is a UN document listing fundamental rights for all humans.",
      exemple:
        "It includes rights like the right to life, freedom of speech, education and equality before the law.",
      piege:
        "It was created by the UN in 1948 after World War II. It applies to ALL humans, not just some countries.",
      astuce:
        "UDHR = Universal Declaration of Human Rights (1948). 30 articles. Fundamental = fondamental.",
    },
  },
  {
    question: "What does the word 'justice' mean?",
    options: [
      "Being fast",
      "Fairness and the quality of being morally right",
      "Being famous",
      "Being rich",
    ],
    answer: "Fairness and the quality of being morally right",
    fiche: {
      regle:
        "Justice = fairness, the principle that people get what they deserve. Also the legal system.",
      exemple:
        "We fight for justice when people are treated unfairly. The justice system includes courts and judges.",
      piege:
        "Justice can mean both fairness (abstract) and the legal system (courts, judges, law).",
      astuce:
        "Justice = justice. Court = tribunal. Judge = juge. Law = loi. Rights = droits. Duty = devoir.",
    },
  },
  {
    question: "What is a citizen's duty?",
    options: [
      "To travel abroad",
      "To fulfil responsibilities such as paying taxes and obeying laws",
      "To learn a foreign language",
      "To have a job",
    ],
    answer: "To fulfil responsibilities such as paying taxes and obeying laws",
    fiche: {
      regle:
        "Citizens have both RIGHTS (what they can do) and DUTIES (what they must do): pay taxes, obey laws, vote.",
      exemple:
        "In many countries, jury duty (serving on a jury) is a civic duty. Voting is also considered a civic duty.",
      piege:
        "Rights and duties go together. You cannot have rights without responsibilities.",
      astuce:
        "Right = droit (what you CAN do). Duty = devoir (what you MUST do). Rights AND responsibilities!",
    },
  },
];

export default function DroitsCitoyennetePage() {
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
          <h1 className="lecon-titre">Rights and Citizenship</h1>
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
            Learn vocabulary about{" "}
            <strong>human rights, democracy and citizenship</strong> in English.
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
              <div className="lecon-point-titre">Human rights</div>
              <div className="lecon-point-texte">
                Freedom of speech, right to vote, equality, justice. Universal
                Declaration of Human Rights (UN, 1948).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Everyone has the
                right to education and freedom of expression.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Democracy</div>
              <div className="lecon-point-texte">
                Government by the people. Citizens vote in elections.
                Parliament, president, prime minister.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> In a democracy,
                citizens choose their leaders.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Rights and duties</div>
              <div className="lecon-point-texte">
                Rights = what you CAN do. Duties = what you MUST do (pay taxes,
                obey laws). Citizen = citoyen.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Voting is both a
                right and a civic duty.
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
                Vocabulary card
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
