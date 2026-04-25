"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "bilan-2";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // Modal verbs (5)
  {
    id: 1,
    theme: "modal-verbs",
    question: "Which sentence expresses prohibition?",
    options: [
      "You don't have to wear a uniform.",
      "You mustn't park here.",
      "You shouldn't eat too much.",
      "You couldn't go there.",
    ],
    reponse: "You mustn't park here.",
    explication:
      "Mustn't = prohibition (forbidden). Don't have to = not necessary (optional). Should = advice. Critical Brevet distinction!",
  },
  {
    id: 2,
    theme: "modal-verbs",
    question: "Modal + base form: which is correct?",
    options: [
      "You should to study.",
      "You should studying.",
      "You should study.",
      "You should studied.",
    ],
    reponse: "You should study.",
    explication:
      "Modal verbs are ALWAYS followed by the BASE FORM (no to, no -ing, no -ed). Should + study (not to study / studying).",
  },
  {
    id: 3,
    theme: "modal-verbs",
    question:
      "Choose the correct modal for past ability: 'When I was 5, I ___ read.'",
    options: ["can", "could", "should", "might"],
    reponse: "could",
    explication:
      "Could = past of can. Past ability: 'I could read when I was 5.' For specific past achievement: was able to.",
  },
  {
    id: 4,
    theme: "modal-verbs",
    question:
      "'She must be at home — her lights are on.' What does 'must' express here?",
    options: ["Obligation", "Logical deduction", "Permission", "Advice"],
    reponse: "Logical deduction",
    explication:
      "Must (deduction) = I'm certain based on evidence. 'Her lights are on' = evidence → 'she must be home' = deduction.",
  },
  {
    id: 5,
    theme: "modal-verbs",
    question: "Complete: 'You ___ have studied harder. Now it's too late.'",
    options: ["must", "can", "should", "might"],
    reponse: "should",
    explication:
      "Should have + past participle = past regret/criticism. 'Should have studied' = you didn't, and I'm criticising it. Too late to change.",
  },
  // Relative clauses (5)
  {
    id: 6,
    theme: "relative-clauses",
    question:
      "Choose the correct pronoun: 'The man ___ called you is my friend.'",
    options: ["which", "whose", "who", "where"],
    reponse: "who",
    explication:
      "WHO = people (subject). 'The man who called' — who is the subject of the relative clause.",
  },
  {
    id: 7,
    theme: "relative-clauses",
    question: "Choose: 'The girl ___ bag was stolen called the police.'",
    options: ["who", "which", "whose", "that"],
    reponse: "whose",
    explication:
      "WHOSE = possession. 'Her bag' → 'whose bag'. Always followed by a noun. Don't confuse with who's (= who is).",
  },
  {
    id: 8,
    theme: "relative-clauses",
    question: "Which has a non-defining relative clause?",
    options: [
      "The man who lives here is nice.",
      "The book which I read was good.",
      "My sister, who is a nurse, works nights.",
      "The car that broke down was new.",
    ],
    reponse: "My sister, who is a nurse, works nights.",
    explication:
      "Non-defining = commas + extra info + no 'that'. 'My sister' is already identified → clause adds info → non-defining.",
  },
  {
    id: 9,
    theme: "relative-clauses",
    question: "In which sentence can 'that' be omitted?",
    options: [
      "The man who is waiting is my uncle.",
      "The girl whose bag was stolen cried.",
      "The book that I read was amazing.",
      "The place where I was born is small.",
    ],
    reponse: "The book that I read was amazing.",
    explication:
      "Object relative pronoun can be omitted. 'I' is the subject after 'that' → 'that' is object → can omit: 'The book I read'.",
  },
  {
    id: 10,
    theme: "relative-clauses",
    question: "Combine: 'I know a man. His son is a doctor.'",
    options: [
      "I know a man who his son is a doctor.",
      "I know a man whose son is a doctor.",
      "I know a man which son is a doctor.",
      "I know a man who son is a doctor.",
    ],
    reponse: "I know a man whose son is a doctor.",
    explication:
      "Possession → whose. 'His son' → 'whose son'. WHOSE + noun (no article between whose and noun).",
  },
  // British culture (5)
  {
    id: 11,
    theme: "culture-britannique",
    question: "What does 'UK' stand for?",
    options: [
      "United Kingdoms",
      "United Kingdom of Great Britain and Northern Ireland",
      "United Kingdom of Great Britain and Ireland",
      "United Kingdoms of Britain",
    ],
    reponse: "United Kingdom of Great Britain and Northern Ireland",
    explication:
      "UK = 4 nations: England, Scotland, Wales (= Great Britain) + Northern Ireland. Capital: London.",
  },
  {
    id: 12,
    theme: "culture-britannique",
    question: "What is the 'Union Jack'?",
    options: [
      "England's flag",
      "Scotland's flag",
      "The UK flag combining three crosses",
      "Wales's dragon flag",
    ],
    reponse: "The UK flag combining three crosses",
    explication:
      "Union Jack = St George (England) + St Andrew (Scotland) + St Patrick (Ireland). Wales NOT represented.",
  },
  {
    id: 13,
    theme: "culture-britannique",
    question: "What is 'Brexit'?",
    options: [
      "UK joining the EU",
      "UK leaving the EU in 2020",
      "A British economic reform",
      "UK leaving NATO",
    ],
    reponse: "UK leaving the EU in 2020",
    explication:
      "Brexit = British Exit. 2016 referendum: 52% voted Leave. Officially left EU: 31 January 2020.",
  },
  {
    id: 14,
    theme: "culture-britannique",
    question: "What is the Commonwealth?",
    options: [
      "A political union replacing the Empire",
      "56 countries mostly from the former British Empire",
      "The European Union plus UK",
      "A trade deal between English-speaking nations",
    ],
    reponse: "56 countries mostly from the former British Empire",
    explication:
      "Commonwealth = 56 voluntary member states, mostly former British Empire. Commonwealth Games every 4 years.",
  },
  {
    id: 15,
    theme: "culture-britannique",
    question: "What is Shakespeare famous for?",
    options: [
      "He was the first British Prime Minister",
      "He invented the English language",
      "He is considered the greatest writer in English",
      "He was a famous British painter",
    ],
    reponse: "He is considered the greatest writer in English",
    explication:
      "Shakespeare (1564-1616): 37 plays, 154 sonnets. Hamlet, Macbeth, Romeo and Juliet. Globe Theatre. ~1,700 new words.",
  },
  // Brevet revision (5)
  {
    id: 16,
    theme: "revision-brevet-anglais",
    question: "Report: 'I can swim,' she said.",
    options: [
      "She said she can swim.",
      "She said she could swim.",
      "She said she could swam.",
      "She said I could swim.",
    ],
    reponse: "She said she could swim.",
    explication:
      "Modal shift: can → could in reported speech. Pronoun: I → she. 'She said she could swim.'",
  },
  {
    id: 17,
    theme: "revision-brevet-anglais",
    question: "Choose the correct sentence for writing:",
    options: [
      "I have visited Paris last year.",
      "I visited Paris last year.",
      "I have been visit Paris last year.",
      "I had visit Paris last year.",
    ],
    reponse: "I visited Paris last year.",
    explication:
      "Specific past time (last year) → Simple Past. Present Perfect + specific past time = WRONG. 'I visited' is correct.",
  },
  {
    id: 18,
    theme: "revision-brevet-anglais",
    question: "Translate: 'Il n'aurait pas dû mentir.'",
    options: [
      "He should not lie.",
      "He must not have lied.",
      "He shouldn't have lied.",
      "He couldn't lie.",
    ],
    reponse: "He shouldn't have lied.",
    explication:
      "Aurait pas dû = shouldn't have + past participle. Past regret/criticism. 'He shouldn't have lied' = he lied and it was wrong.",
  },
  {
    id: 19,
    theme: "revision-brevet-anglais",
    question: "Complete: 'If she ___ harder, she would pass the exam.'",
    options: ["studies", "studied", "would study", "has studied"],
    reponse: "studied",
    explication:
      "Second conditional: If + Past Simple, would + base form. Hypothetical situation. 'If she studied' (she probably doesn't).",
  },
  {
    id: 20,
    theme: "revision-brevet-anglais",
    question: "Which is a defining relative clause?",
    options: [
      "My dog, which is black, is friendly.",
      "London, which is the capital, is huge.",
      "The car that I bought is red.",
      "Shakespeare, who was born in 1564, is famous.",
    ],
    reponse: "The car that I bought is red.",
    explication:
      "Defining = no commas, essential info, can use 'that'. 'The car that I bought' = which car? Essential. Non-defining uses commas.",
  },
];

const themeLabels: Record<string, string> = {
  "modal-verbs": "Modal Verbs",
  "relative-clauses": "Relative Clauses",
  "culture-britannique": "British Culture",
  "revision-brevet-anglais": "Brevet Revision",
};

const themeColors: Record<string, string> = {
  "modal-verbs": "#4f8ef7",
  "relative-clauses": "#2ec4b6",
  "culture-britannique": "#ffd166",
  "revision-brevet-anglais": "#ff6b6b",
};

export default function BilanAnglais3emePageDeux() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionsShuffled, setQuestionsShuffled] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [resultats, setResultats] = useState<boolean[]>([]);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (user) setEstConnecte(true);
      else router.push("/inscription");
    };
    init();
  }, []);

  const demarrer = () => {
    const shuffled = shuffleArray(questions);
    setQuestionsShuffled(shuffled);
    scoreRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setSelected(null);
    setResultats([]);
    setEtape("qcm");
  };

  const choisir = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === questionsShuffled[index].reponse;
    if (correct) scoreRef.current += 1;
    setResultats((r) => [...r, correct]);
  };

  const suivant = async () => {
    if (index + 1 >= questionsShuffled.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questionsShuffled.length,
        });
      }
      setEtape("fini");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const scoreParTheme = () => {
    return Object.keys(themeLabels).map((t) => {
      const qs = questionsShuffled.filter((q) => q.theme === t);
      const idxs = qs.map((q) => questionsShuffled.indexOf(q));
      const bonnes = idxs.filter((i) => resultats[i]).length;
      return { theme: t, bonnes, total: qs.length };
    });
  };

  const total = questionsShuffled.length;
  const q = questionsShuffled[index];

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Final Test — English 3ème</div>
          <h1 className="lecon-titre">Final Test — English Part 2</h1>
          <div className="lecon-intro">
            This test covers the 4 topics of Part 2: Modal Verbs, Relative
            Clauses, British Culture and Brevet Revision. 20 questions, score
            out of 20.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {Object.entries(themeLabels).map(([id, label]) => (
              <div
                key={id}
                style={{
                  background: `${themeColors[id]}18`,
                  border: `1px solid ${themeColors[id]}44`,
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: themeColors[id],
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    marginTop: "4px",
                  }}
                >
                  5 questions
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Start the test →
          </button>
        </div>
      </div>
    );

  if (etape === "qcm")
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
              {scoreRef.current} / {total}
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
          <div
            style={{
              fontSize: "0.8rem",
              color: themeColors[q.theme],
              fontWeight: 700,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {themeLabels[q.theme]}
          </div>
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === q.reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button key={opt} className={cn} onClick={() => choisir(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === q.reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">
                {selected === q.reponse ? "✅" : "❌"}
              </span>
              <div className="feedback-texte">
                <strong>
                  {selected === q.reponse ? "Well done! 🎉" : "Not quite..."}
                </strong>
                <p>{q.explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button
              className="lecon-btn"
              onClick={suivant}
              style={{ marginTop: "16px" }}
            >
              {index + 1 >= total ? "See my result →" : "Next question →"}
            </button>
          )}
        </div>
      </div>
    );

  if (etape === "fini") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const stats = scoreParTheme();
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">
            {pourcentage >= 80
              ? "Excellent!"
              : pourcentage >= 60
                ? "Well done!"
                : "Keep going!"}
          </h2>
          <div className="resultat-score">
            {scoreRef.current} / {total}
          </div>
          <p className="resultat-desc">{pourcentage}% correct answers</p>
          <div style={{ width: "100%", marginBottom: "24px" }}>
            {stats.map((s) => (
              <div key={s.theme} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{ color: themeColors[s.theme], fontWeight: 700 }}
                  >
                    {themeLabels[s.theme]}
                  </span>
                  <span style={{ color: "#fff" }}>
                    {s.bonnes}/{s.total}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background: themeColors[s.theme],
                      borderRadius: "8px",
                      height: "8px",
                      width: `${(s.bonnes / s.total) * 100}%`,
                      transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              🔄 Try again
            </button>
            <button
              className="lecon-btn-outline"
              onClick={() => router.push("/cours/college/3eme/anglais/page-2")}
            >
              ← Back to topics
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
