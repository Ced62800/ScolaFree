"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "culture-britannique";

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
    question: "What does 'UK' stand for?",
    options: [
      "United Kingdom of Great Britain and Northern Ireland",
      "United Kingdoms of Great Britain",
      "United Kingdom of Great Britain and Ireland",
      "United Kingdoms of Britain and Ireland",
    ],
    answer: "United Kingdom of Great Britain and Northern Ireland",
    fiche: {
      regle:
        "The UK = United Kingdom of Great Britain and Northern Ireland. It consists of 4 nations: England, Scotland, Wales (= Great Britain) and Northern Ireland. Capital: London.",
      exemple:
        "England (capital: London). Scotland (capital: Edinburgh). Wales (capital: Cardiff). Northern Ireland (capital: Belfast). The Republic of Ireland is NOT part of the UK.",
      piege:
        "Great Britain ≠ UK. Great Britain = England + Scotland + Wales only. The UK also includes Northern Ireland. The Republic of Ireland is a separate country.",
      astuce:
        "UK = 4 nations. Great Britain = 3 (England, Scotland, Wales). British Isles = geographic term including Republic of Ireland. Don't mix them up!",
    },
  },
  {
    question: "What is the UK's system of government?",
    options: [
      "A republic with an elected president",
      "A constitutional monarchy with a Parliament",
      "A federal state with no monarch",
      "A direct democracy",
    ],
    answer: "A constitutional monarchy with a Parliament",
    fiche: {
      regle:
        "The UK is a constitutional monarchy: the monarch (King/Queen) is head of state but has limited power. Real power is held by Parliament (elected). The Prime Minister heads the government.",
      exemple:
        "King Charles III is the current monarch (since 2022). The Prime Minister leads the government. Parliament has two houses: House of Commons (elected) and House of Lords (appointed).",
      piege:
        "The UK monarch is NOT an absolute ruler. The constitution (unwritten but existing) limits royal power. The PM and Parliament govern.",
      astuce:
        "UK system: Monarch (head of state, ceremonial) + Parliament (laws) + Prime Minister (head of government). Constitutional monarchy = king/queen with limited power.",
    },
  },
  {
    question: "Which flag is known as the 'Union Jack'?",
    options: [
      "The flag of England (red cross on white)",
      "The flag of Scotland (white cross on blue)",
      "The flag of the United Kingdom (combined red, white and blue)",
      "The flag of Wales (red dragon on white and green)",
    ],
    answer: "The flag of the United Kingdom (combined red, white and blue)",
    fiche: {
      regle:
        "The Union Jack combines three crosses: St George's Cross (England — red on white), St Andrew's Cross (Scotland — white on blue), St Patrick's Cross (Ireland — red on white diagonal). Wales is not represented.",
      exemple:
        "St George = England (patron saint, red cross). St Andrew = Scotland (white diagonal cross on blue). St Patrick = Ireland (red diagonal cross). Combined = Union Jack.",
      piege:
        "Wales is NOT represented in the Union Jack — its dragon flag was not included. The Union Jack is the UK flag, not just England's flag.",
      astuce:
        "Union Jack = 3 crosses combined. England (+ on white) + Scotland (X on blue) + Ireland (X on white) = Union Jack. Wales not included.",
    },
  },
  {
    question: "What is 'Guy Fawkes Night' (Bonfire Night)?",
    options: [
      "The celebration of the Queen's birthday",
      "The anniversary of a failed plot to blow up Parliament in 1605",
      "A traditional harvest festival",
      "The celebration of the end of World War II",
    ],
    answer: "The anniversary of a failed plot to blow up Parliament in 1605",
    fiche: {
      regle:
        "Guy Fawkes Night (5 November): commemorates the Gunpowder Plot of 1605, when Guy Fawkes and conspirators tried to blow up the Houses of Parliament. Celebrated with bonfires and fireworks.",
      exemple:
        "'Remember, remember the fifth of November' — traditional rhyme. Effigies of Guy Fawkes are burned on bonfires. Fireworks displays across the UK.",
      piege:
        "Bonfire Night is NOT a celebration of Guy Fawkes — it celebrates his FAILURE. He was caught before the plot succeeded.",
      astuce:
        "5 November = Guy Fawkes Night = Bonfire Night. 1605 Gunpowder Plot failed. Bonfires + fireworks. 'Remember, remember the 5th of November.'",
    },
  },
  {
    question: "Which of these is a famous British tradition?",
    options: [
      "Eating croissants for breakfast",
      "Afternoon tea with sandwiches and scones",
      "The siesta after lunch",
      "Celebrating Bastille Day on July 14th",
    ],
    answer: "Afternoon tea with sandwiches and scones",
    fiche: {
      regle:
        "Afternoon tea is a British tradition: served at 3-5pm with tea, finger sandwiches, scones (with clotted cream and jam) and cakes. Originated in the 1840s. Part of British cultural identity.",
      exemple:
        "Other British traditions: Bonfire Night, Trooping the Colour (King's birthday), Wimbledon (tennis), the Proms (classical music), Boxing Day (26 December).",
      piege:
        "Not all British people have afternoon tea daily — it's more of a special occasion or tourist experience now. But it remains a strong cultural symbol.",
      astuce:
        "British traditions: afternoon tea, pub culture, queuing, cricket, Bonfire Night, Wimbledon, the Proms, Boxing Day, bank holidays.",
    },
  },
  {
    question: "What is the Commonwealth?",
    options: [
      "The European Union plus the UK",
      "An association of countries mostly formerly part of the British Empire",
      "A trade agreement between English-speaking nations only",
      "A political union replacing the British Empire",
    ],
    answer:
      "An association of countries mostly formerly part of the British Empire",
    fiche: {
      regle:
        "The Commonwealth of Nations = 56 member countries, most formerly part of the British Empire. They share values of democracy, human rights and the rule of law. The UK monarch is symbolic head.",
      exemple:
        "Commonwealth members: Australia, Canada, India, South Africa, Jamaica, Nigeria, New Zealand, Pakistan. Commonwealth Games held every 4 years.",
      piege:
        "The Commonwealth is NOT a political union. Members are fully independent states. Membership is voluntary and not restricted to former British colonies.",
      astuce:
        "Commonwealth = 56 countries, voluntary association, former British Empire mostly. Commonwealth Games = every 4 years. Head = UK monarch (symbolic).",
    },
  },
  {
    question: "What is the significance of Shakespeare for British culture?",
    options: [
      "He was the first British Prime Minister",
      "He is considered the greatest writer in the English language, with global cultural impact",
      "He invented the English language",
      "He was a famous British painter from the 18th century",
    ],
    answer:
      "He is considered the greatest writer in the English language, with global cultural impact",
    fiche: {
      regle:
        "William Shakespeare (1564-1616) is considered the greatest playwright and poet in the English language. He wrote 37 plays and 154 sonnets. His works influenced literature, language and theatre worldwide.",
      exemple:
        "Famous plays: Hamlet, Romeo and Juliet, Macbeth, A Midsummer Night's Dream, Othello. Globe Theatre in London. His birthplace: Stratford-upon-Avon.",
      piege:
        "Shakespeare did not 'invent' English — the language existed before him. But he invented about 1,700 words still used today (bedroom, lonely, generous...).",
      astuce:
        "Shakespeare: born 1564, Stratford-upon-Avon. Plays: tragedies (Hamlet, Macbeth), comedies (A Midsummer Night's Dream), histories. Globe Theatre. 1,700 new words.",
    },
  },
  {
    question: "What does 'Brexit' refer to?",
    options: [
      "Britain's entry into the European Union in 1973",
      "Britain's exit from the European Union, completed in 2020",
      "A British economic reform in the 1980s",
      "Britain's withdrawal from NATO",
    ],
    answer: "Britain's exit from the European Union, completed in 2020",
    fiche: {
      regle:
        "Brexit = British Exit from the EU. The UK voted 52% to 48% to leave the EU in the June 2016 referendum. The UK officially left the EU on 31 January 2020.",
      exemple:
        "Consequences: no free movement between UK and EU, new trade agreements, passport checks, changes for UK citizens in EU and EU citizens in UK.",
      piege:
        "Brexit ≠ leaving Europe (the continent). The UK is still geographically in Europe. Brexit = leaving the political/economic EU institutions.",
      astuce:
        "Brexit = Britain + Exit. 2016 referendum: 52% leave. 2020: officially left EU. Major political, economic and social consequences for UK and EU.",
    },
  },
  {
    question: "Which city is the capital of Scotland?",
    options: ["Glasgow", "Aberdeen", "Edinburgh", "Inverness"],
    answer: "Edinburgh",
    fiche: {
      regle:
        "Edinburgh is the capital of Scotland. Glasgow is the largest city. Edinburgh hosts the famous Edinburgh Festival (world's largest arts festival) every August and has Edinburgh Castle.",
      exemple:
        "Edinburgh: capital, castle, Royal Mile, Scottish Parliament, Edinburgh Festival. Glasgow: largest city, industrial heritage, vibrant arts scene. Both on the River Clyde/Forth.",
      piege:
        "Glasgow is larger than Edinburgh but Edinburgh is the capital. Common confusion: many people assume the biggest city is always the capital.",
      astuce:
        "UK capitals: London (England + UK), Edinburgh (Scotland), Cardiff (Wales), Belfast (Northern Ireland). Know all four for exams!",
    },
  },
  {
    question: "What is 'Cockney' rhyming slang?",
    options: [
      "A formal dialect spoken by the Royal Family",
      "A form of English slang where a phrase rhymes with the word it replaces",
      "The official accent of BBC journalists",
      "A Scottish Gaelic dialect",
    ],
    answer:
      "A form of English slang where a phrase rhymes with the word it replaces",
    fiche: {
      regle:
        "Cockney rhyming slang = a form of British slang originating in East London. A rhyming phrase replaces a word: 'plates of meat' = feet. 'Dog and bone' = phone. 'Apples and pears' = stairs.",
      exemple:
        "'Use your loaf!' (loaf of bread = head = brain). 'Adam and Eve' = believe. 'Butcher's hook' = look. Often the rhyming word is omitted: 'Use your loaf!'",
      piege:
        "In real usage, the rhyming part is often dropped: 'dog' = phone (not 'dog and bone'). This makes it confusing even for native speakers.",
      astuce:
        "Cockney = East London dialect. Rhyming slang: phrase that rhymes with the word. Plates of meat = feet. Dog and bone = phone. Apples and pears = stairs.",
    },
  },
];

export default function CultureBritanniquePage() {
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
          <h1 className="lecon-titre">British & American Culture</h1>
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
            Discover{" "}
            <strong>
              British institutions, traditions, history and culture
            </strong>
            : the UK, Parliament, the Commonwealth, Shakespeare, Brexit and
            more.
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
              <div className="lecon-point-titre">
                🏛️ Institutions & Government
              </div>
              <div className="lecon-point-texte">
                UK = 4 nations (England, Scotland, Wales, N. Ireland).
                Constitutional monarchy: Monarch + Parliament + Prime Minister.
                House of Commons (elected) + House of Lords. Union Jack = 3
                crosses.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Capitals:</span> London
                (England/UK), Edinburgh (Scotland), Cardiff (Wales), Belfast (N.
                Ireland).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎭 Culture & Traditions</div>
              <div className="lecon-point-texte">
                Shakespeare (1564-1616): greatest English playwright. Afternoon
                tea. Bonfire Night (5 Nov). Wimbledon. The Proms. Cockney
                rhyming slang. The BBC. The pub as social institution.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key facts:</span> Shakespeare:
                Hamlet, Macbeth, Romeo and Juliet. Globe Theatre. 1,700 words
                invented.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🌍 UK & the World</div>
              <div className="lecon-point-texte">
                Commonwealth: 56 countries, former British Empire. Brexit: UK
                left EU in 2020 (52% voted Leave in 2016). English = global
                language (1.5 billion speakers). Special relationship with USA.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key dates:</span> 1605 Gunpowder
                Plot. 2016 Brexit vote. 2020 UK leaves EU. 2022 King Charles
                III.
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
