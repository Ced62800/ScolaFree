"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "relative-clauses";

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
      "Choose the correct relative pronoun: 'The woman ___ lives next door is a doctor.'",
    options: ["which", "whose", "who", "whom"],
    answer: "who",
    fiche: {
      regle:
        "WHO is used for people (subject). WHICH is used for things/animals. WHOSE is used for possession (people or things). WHOM is used for people (object — formal).",
      exemple:
        "The man who called you is my brother. (person, subject). The book which I read was great. (thing). The girl whose bag was stolen called the police. (possession).",
      piege:
        "Who = person (subject). Which = thing. Don't use 'which' for people: 'the man which...' is wrong. Don't use 'who' for things.",
      astuce:
        "WHO = people. WHICH = things. WHOSE = possession (de qui/dont). WHERE = place. WHEN = time. That = people OR things (informal).",
    },
  },
  {
    question:
      "Choose the correct relative pronoun: 'The book ___ I read last week was amazing.'",
    options: ["who", "whose", "which", "where"],
    answer: "which",
    fiche: {
      regle:
        "WHICH is used for things and animals (not people). It can be the subject or object of the relative clause. THAT can also be used for things in informal English.",
      exemple:
        "The film which I saw was brilliant. The car which broke down was new. The idea which he had was clever. (All: things as object of relative clause.)",
      piege:
        "Which ≠ who for people. 'The teacher which taught me' is wrong. Use WHO for people. WHICH for things.",
      astuce:
        "Which = chose/objet. Who = personne. That = personne OU chose (informel). Which ou that pour les choses — both work!",
    },
  },
  {
    question: "What is a 'defining relative clause'?",
    options: [
      "A clause that adds extra information, removable without changing the meaning",
      "A clause that identifies which person or thing is being talked about — essential to the meaning",
      "A clause that is always separated by commas",
      "A clause that uses 'whose' only",
    ],
    answer:
      "A clause that identifies which person or thing is being talked about — essential to the meaning",
    fiche: {
      regle:
        "Defining (restrictive) relative clause: identifies the noun — essential to the meaning. No commas. Non-defining: adds extra info — can be removed. Uses commas. Cannot use 'that' in non-defining.",
      exemple:
        "Defining: The man who called you is here. (which man? essential). Non-defining: My brother, who lives in London, is visiting. (extra info — we know which brother).",
      piege:
        "Non-defining uses commas and cannot use 'that'. Defining has no commas and can use 'that'. Removing a defining clause changes the meaning.",
      astuce:
        "Defining = no commas, essential. Non-defining = commas, extra info. Test: remove the clause — if meaning changes = defining. If not = non-defining.",
    },
  },
  {
    question:
      "Choose the correct sentence with a non-defining relative clause:",
    options: [
      "The student who passed the exam was happy.",
      "My sister, who is a nurse, works at night.",
      "The book which I read was interesting.",
      "The dog that barks is dangerous.",
    ],
    answer: "My sister, who is a nurse, works at night.",
    fiche: {
      regle:
        "Non-defining relative clauses: surrounded by commas. The information is extra — the sentence makes sense without it. THAT cannot be used. WHO/WHICH/WHOSE are used.",
      exemple:
        "Shakespeare, who wrote Hamlet, was English. (extra info — we know who Shakespeare is). London, which is the capital, has 9 million people.",
      piege:
        "Non-defining uses commas AND cannot use 'that'. 'My sister, that is a nurse...' is wrong. Use who/which in non-defining clauses.",
      astuce:
        "Non-defining = commas + who/which/whose (never that). The clause is like a bracket — extra info. Remove it: sentence still makes sense.",
    },
  },
  {
    question:
      "Choose the correct relative pronoun: 'The house ___ I grew up is now a museum.'",
    options: ["who", "which", "where", "whose"],
    answer: "where",
    fiche: {
      regle:
        "WHERE is used for places in relative clauses. It replaces 'in which', 'at which', etc. WHEN is used for times.",
      exemple:
        "The town where I was born is small. (= the town in which I was born). The school where she studied is famous. The day when we met was special.",
      piege:
        "Where (place) ≠ which. 'The house which I grew up' is grammatically incomplete — you need 'in which' or just 'where'. WHERE is simpler.",
      astuce:
        "WHERE = place (replaces 'in/at which'). WHEN = time (replaces 'on/in/at which'). WHY = reason (the reason why). Much simpler than prepositional phrases!",
    },
  },
  {
    question: "In which sentence can the relative pronoun be omitted?",
    options: [
      "The man who is standing there is my uncle.",
      "The book that I bought yesterday was expensive.",
      "The woman whose car was stolen called the police.",
      "The city where I was born is beautiful.",
    ],
    answer: "The book that I bought yesterday was expensive.",
    fiche: {
      regle:
        "The relative pronoun can be OMITTED when it is the OBJECT of the relative clause (not the subject). 'The book (that) I bought' — 'I' is the subject, 'that' is the object — can be omitted.",
      exemple:
        "The book I bought. (that omitted — object). The man I met. (who/that omitted — object). BUT: The man who called me — who is subject, CANNOT be omitted.",
      piege:
        "Subject relative pronoun = CANNOT be omitted. Object relative pronoun = CAN be omitted. Test: is there another subject in the clause? Yes → pronoun is object → can omit.",
      astuce:
        "Omit test: if after the pronoun there is SUBJECT + VERB → pronoun is object → can omit. If pronoun IS the subject → cannot omit.",
    },
  },
  {
    question: "Choose the correct sentence using 'whose':",
    options: [
      "The girl who bag was stolen was crying.",
      "The girl which bag was stolen was crying.",
      "The girl whose bag was stolen was crying.",
      "The girl that bag was stolen was crying.",
    ],
    answer: "The girl whose bag was stolen was crying.",
    fiche: {
      regle:
        "WHOSE is used to express possession in relative clauses. It replaces 'his', 'her', 'their', 'its'. It can refer to people OR things. Whose + noun (always followed by a noun).",
      exemple:
        "The boy whose father is a pilot. (his father). The company whose products are famous. (its products). The student whose work was best won a prize.",
      piege:
        "Whose ≠ who's. Whose = possession (relative pronoun). Who's = who is (contraction). 'The girl who's bag' is wrong — this means 'who is bag'.",
      astuce:
        "WHOSE = possession. Always followed by a noun: whose + NOUN. Whose bag, whose father, whose ideas. Don't confuse with who's (= who is).",
    },
  },
  {
    question: "Complete: 'That is the reason ___ I left early.'",
    options: ["who", "which", "where", "why"],
    answer: "why",
    fiche: {
      regle:
        "WHY is used after 'reason' in relative clauses. It replaces 'for which'. 'The reason why' is a common construction. WHY can often be omitted too.",
      exemple:
        "The reason why I came. The reason why she left. The reason (why) I called you. (why can be omitted). That's why = c'est pourquoi.",
      piege:
        "After 'reason', use WHY (not which or that). 'The reason which I left' is wrong. 'The reason why/that/— I left' are all correct.",
      astuce:
        "WHERE = place. WHEN = time. WHY = reason. Easy pattern: who (people), which (things), where (places), when (times), why (reasons).",
    },
  },
  {
    question: "Which sentence uses a relative clause correctly?",
    options: [
      "She is the person who she helped me.",
      "She is the person who helped me.",
      "She is the person which helped me.",
      "She is the person that she helped me.",
    ],
    answer: "She is the person who helped me.",
    fiche: {
      regle:
        "In a relative clause, the relative pronoun REPLACES the original pronoun. Don't repeat the subject: 'the person who SHE helped' is wrong — 'who' already replaced 'she'.",
      exemple:
        "Wrong: The man who he called me. Right: The man who called me. Wrong: The book which it was good. Right: The book which was good.",
      piege:
        "Never repeat the subject after the relative pronoun. 'The person who SHE helped' has two subjects (who and she) — wrong. The pronoun IS the subject.",
      astuce:
        "Relative pronoun = replacement. Don't add another pronoun after it. Who/which/that IS the subject or object — don't duplicate.",
    },
  },
  {
    question: "Combine: 'I know a girl. Her mother is a famous actress.'",
    options: [
      "I know a girl who her mother is a famous actress.",
      "I know a girl which mother is a famous actress.",
      "I know a girl whose mother is a famous actress.",
      "I know a girl who mother is a famous actress.",
    ],
    answer: "I know a girl whose mother is a famous actress.",
    fiche: {
      regle:
        "When combining sentences where one has a possessive (her, his, their, its), use WHOSE. 'Her mother' → 'whose mother'. Whose replaces the possessive adjective + links the sentences.",
      exemple:
        "I have a friend. His car is red. → I have a friend whose car is red. She works with a man. His wife is famous. → She works with a man whose wife is famous.",
      piege:
        "Whose (not who or which) for possession. 'A girl who mother' is wrong — 'who' cannot directly precede a noun. 'Whose + noun' is the correct structure.",
      astuce:
        "Possession in relative clauses → whose. Pattern: WHOSE + NOUN (no article between whose and noun). Whose mother, whose car, whose ideas.",
    },
  },
];

export default function RelativeClausesPage() {
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
          <h1 className="lecon-titre">Relative Clauses</h1>
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
            Master <strong>relative clauses</strong>: who, which, whose, where,
            when, why — defining vs non-defining, and when to omit the pronoun.
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
              <div className="lecon-point-titre">🔤 Relative pronouns</div>
              <div className="lecon-point-texte">
                WHO = people (subject). WHICH = things. WHOSE = possession.
                WHERE = place. WHEN = time. WHY = reason. THAT = people or
                things (informal, defining only).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Examples:</span> The man WHO
                called. The book WHICH I read. The girl WHOSE bag. The city
                WHERE I live.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📌 Defining vs Non-defining
              </div>
              <div className="lecon-point-texte">
                Defining = no commas, essential, can use 'that'. Non-defining =
                commas, extra info, cannot use 'that'. Remove the clause: if
                meaning changes = defining.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Defining: The
                car that I bought. Non-defining: My car, which is red, is fast.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✂️ Omitting the pronoun</div>
              <div className="lecon-point-texte">
                Object relative pronouns can be omitted. Test: is there another
                subject after the pronoun? YES → object → can omit. Subject
                pronouns CANNOT be omitted.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> The book (that)
                I bought. (object — can omit). The man who called. (subject —
                cannot omit).
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
