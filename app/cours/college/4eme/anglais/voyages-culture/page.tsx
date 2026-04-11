"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "voyages-culture";

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
    question: "What does a passport allow you to do?",
    options: [
      "Drive abroad",
      "Travel internationally and prove your identity",
      "Work in another country",
      "Get a discount on flights",
    ],
    answer: "Travel internationally and prove your identity",
    fiche: {
      regle:
        "A passport is an official document for international travel and proving your identity and nationality.",
      exemple:
        "You need a passport to travel to the USA, Australia or Canada. Some countries also require a visa.",
      piege:
        "A passport allows travel, not automatically the right to work or stay long-term in another country.",
      astuce:
        "Passport = travel document. Visa = permission to enter a specific country. Boarding pass = to board a plane.",
    },
  },
  {
    question: "Which of these is an English-speaking country?",
    options: ["Brazil", "New Zealand", "Egypt", "Japan"],
    answer: "New Zealand",
    fiche: {
      regle:
        "Main English-speaking countries: UK, USA, Canada, Australia, New Zealand, Ireland, South Africa.",
      exemple:
        "New Zealand is in the Pacific Ocean and English is its main language along with Maori.",
      piege:
        "Canada speaks both English AND French, especially in Quebec. South Africa has 11 official languages!",
      astuce:
        "English-speaking: Britain, USA, Canada, Ireland, Australia, New Zealand, South Africa.",
    },
  },
  {
    question: "What is the currency used in the United Kingdom?",
    options: ["Euro", "Dollar", "Pound Sterling", "Franc"],
    answer: "Pound Sterling",
    fiche: {
      regle:
        "The UK uses the Pound Sterling. The USA uses the Dollar. Australia uses the Australian Dollar.",
      exemple:
        "1 pound = 100 pence. Coins: 1p, 2p, 5p, 10p, 20p, 50p, 1 pound, 2 pounds.",
      piege: "The UK is NOT in the Eurozone and does NOT use the Euro!",
      astuce:
        "UK = Pound. USA = Dollar. Australia = AUS Dollar. Canada = CAD Dollar. All different!",
    },
  },
  {
    question: "What do you say to a hotel receptionist when you arrive?",
    options: [
      "Give me a room!",
      "I have a reservation, I would like to check in.",
      "Where is my room?",
      "The room is dirty.",
    ],
    answer: "I have a reservation, I would like to check in.",
    fiche: {
      regle:
        "Polite hotel phrases: I have a reservation. I would like to check in. Could I have a room, please?",
      exemple:
        "Good morning, I have a reservation under the name Smith. Could I check in, please?",
      piege:
        "Always be polite. Use I would like, not I want. Could I = very polite way to ask.",
      astuce:
        "Check in = arrive at hotel. Check out = leave hotel. Reception = front desk. Porter = carries bags.",
    },
  },
  {
    question: "What is a roundtrip ticket?",
    options: [
      "A ticket that goes in circles",
      "A ticket for one journey only",
      "A ticket that includes going and coming back",
      "A discounted ticket",
    ],
    answer: "A ticket that includes going and coming back",
    fiche: {
      regle:
        "Roundtrip (US English) = Return ticket (British English). Includes going AND coming back.",
      exemple:
        "I would like a roundtrip ticket from London to New York, please.",
      piege:
        "Roundtrip (American English) = Return (British English). Same meaning, different words!",
      astuce: "One-way = aller simple. Return/Roundtrip = aller-retour.",
    },
  },
  {
    question: "What does backpacker mean?",
    options: [
      "A person who carries a big suitcase",
      "A budget traveller who carries a backpack",
      "A tour guide",
      "A travel agent",
    ],
    answer: "A budget traveller who carries a backpack",
    fiche: {
      regle:
        "A backpacker is a budget traveller who travels independently, staying in hostels and carrying a backpack.",
      exemple:
        "Many backpackers travel through Southeast Asia on a low budget, staying in youth hostels.",
      piege:
        "Backpacker = budget independent traveller, NOT a tour guide or travel agent.",
      astuce:
        "Backpack = sac a dos. Backpacker = routard. Hostel = auberge de jeunesse.",
    },
  },
  {
    question: "What is jet lag?",
    options: [
      "A type of heavy luggage",
      "A feeling of tiredness after flying across time zones",
      "A delay at the airport",
      "A travel insurance",
    ],
    answer: "A feeling of tiredness after flying across time zones",
    fiche: {
      regle:
        "Jet lag = tiredness and disorientation caused by rapid travel across multiple time zones.",
      exemple:
        "After flying from Paris to New York, I always have terrible jet lag for a few days.",
      piege: "Jet lag is about TIME ZONES, not just the length of the flight.",
      astuce: "Jet lag = decalage horaire. Time zone = fuseau horaire.",
    },
  },
  {
    question: "Which sentence correctly asks for directions?",
    options: [
      "Where is the station, you!",
      "Could you tell me how to get to the train station?",
      "Tell me where station!",
      "Station where?",
    ],
    answer: "Could you tell me how to get to the train station?",
    fiche: {
      regle:
        "Asking directions politely: Could you tell me how to get to...? Excuse me, where is...?",
      exemple: "Excuse me, could you tell me how to get to the museum?",
      piege: "Always start with Excuse me. Use could for politeness.",
      astuce:
        "Excuse me + could you tell me + how to get to + place = perfect polite question.",
    },
  },
  {
    question: "What is a hostel?",
    options: [
      "A hospital",
      "A luxury hotel",
      "A cheap accommodation often with shared rooms",
      "An airport hotel",
    ],
    answer: "A cheap accommodation often with shared rooms",
    fiche: {
      regle:
        "A hostel is cheap accommodation with shared dormitories. Popular with backpackers and students.",
      exemple:
        "I stayed in a hostel in Dublin for only 15 euros per night, sharing a room with 5 travellers.",
      piege:
        "Hostel is NOT hospital. Hostel = cheap accommodation. Hospital = medical centre.",
      astuce:
        "Hostel = auberge de jeunesse. Dormitory = dortoir. Bunk bed = lits superposes.",
    },
  },
  {
    question: "What does customs mean at an airport?",
    options: [
      "Local traditions and habits",
      "The place where bags are checked for illegal items",
      "The passport control area",
      "The duty-free shop",
    ],
    answer: "The place where bags are checked for illegal items",
    fiche: {
      regle:
        "Customs = where officials check for illegal goods or items to declare.",
      exemple:
        "At customs, they checked my bags. Nothing to declare = green channel.",
      piege:
        "Customs is NOT passport control. Passport control = check your passport. Customs = check luggage.",
      astuce:
        "Sequence: Check-in, Security, Boarding, Arrival, Passport control, Customs, Baggage claim.",
    },
  },
];

export default function VoyagesCulturePage() {
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
          <h1 className="lecon-titre">Travel and Culture</h1>
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
            Discover vocabulary for <strong>travel, tourism and culture</strong>{" "}
            in English-speaking countries.
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
              <div className="lecon-point-titre">At the airport</div>
              <div className="lecon-point-texte">
                Passport, visa, boarding pass, check-in, customs, departure
                lounge, baggage claim.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I showed my
                passport at the border control.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Accommodation</div>
              <div className="lecon-point-texte">
                Hotel (check in/out), hostel (budget, shared rooms), B&B (bed
                and breakfast).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I have a
                reservation. Could I check in?
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">English-speaking world</div>
              <div className="lecon-point-texte">
                UK (Pound), USA (Dollar), Australia, Canada, New Zealand, South
                Africa, Ireland.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> English is
                spoken in over 50 countries.
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
