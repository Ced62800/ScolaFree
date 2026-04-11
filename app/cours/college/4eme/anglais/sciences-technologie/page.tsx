"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "anglais";
const THEME = "sciences-technologie";

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
    question: "What does AI stand for?",
    options: [
      "Automatic Internet",
      "Artificial Intelligence",
      "Advanced Information",
      "Applied Innovation",
    ],
    answer: "Artificial Intelligence",
    fiche: {
      regle:
        "AI = Artificial Intelligence. Computer systems that perform tasks requiring human intelligence.",
      exemple:
        "AI is used in voice assistants (Siri, Alexa), self-driving cars and medical diagnosis.",
      piege:
        "AI is an acronym. In English, acronyms are read letter by letter or as a word.",
      astuce:
        "AI = Artificial Intelligence. IT = Information Technology. Wi-Fi = Wireless Fidelity.",
    },
  },
  {
    question: "What is a renewable energy source?",
    options: ["Coal", "Oil", "Solar energy", "Natural gas"],
    answer: "Solar energy",
    fiche: {
      regle:
        "Renewable energy comes from sources replenished constantly: solar, wind, water, geothermal.",
      exemple:
        "Solar panels convert sunlight into electricity. Wind turbines convert wind into electricity.",
      piege:
        "Coal, oil, and natural gas are FOSSIL FUELS = non-renewable. They will eventually run out.",
      astuce:
        "Renewable = renouvelable. Solar, wind, hydro, geothermal = all renewable energy sources.",
    },
  },
  {
    question: "What does a scientist do in a laboratory?",
    options: [
      "Cook food",
      "Conduct experiments and research",
      "Teach students only",
      "Build machines",
    ],
    answer: "Conduct experiments and research",
    fiche: {
      regle:
        "A scientist conducts experiments, analyses data, makes observations and draws conclusions in a lab.",
      exemple:
        "Scientists in the lab are testing a new vaccine. They record their results carefully.",
      piege:
        "Scientists conduct (not do) experiments in English. Conduct = perform/carry out.",
      astuce:
        "Lab vocabulary: experiment, hypothesis, results, data, microscope, test tube, conclusion.",
    },
  },
  {
    question: "What is a smartphone?",
    options: [
      "A very loud phone",
      "A mobile phone with computer capabilities and internet access",
      "A phone for smart people only",
      "An old-fashioned telephone",
    ],
    answer: "A mobile phone with computer capabilities and internet access",
    fiche: {
      regle:
        "A smartphone is a mobile phone combining calling with computer features: internet, apps, camera, GPS.",
      exemple:
        "Smartphones allow us to video call, use social media, navigate, and access emails anywhere.",
      piege:
        "Smart = intelligent/capable in technology context. Not about the user!",
      astuce:
        "Smart technology: smartphone, smart TV, smartwatch, smart home. Smart = connected and capable.",
    },
  },
  {
    question: "What does download mean?",
    options: [
      "To send a file to someone",
      "To transfer data from the internet to your device",
      "To delete a file",
      "To print a document",
    ],
    answer: "To transfer data from the internet to your device",
    fiche: {
      regle:
        "Download = transfer data FROM the internet TO your device. Upload = the opposite direction.",
      exemple:
        "I downloaded the app on my phone. She uploaded her photos to Instagram.",
      piege:
        "Download and upload are opposites! Down = internet to you. Up = you to internet.",
      astuce:
        "Download = telecharger. Upload = mettre en ligne. Easy to remember with down/up!",
    },
  },
  {
    question: "What is a computer virus?",
    options: [
      "A biological disease",
      "A malicious program that damages computer systems",
      "A slow internet connection",
      "A type of software update",
    ],
    answer: "A malicious program that damages computer systems",
    fiche: {
      regle:
        "A computer virus is malicious software (malware) that can damage systems or steal data.",
      exemple:
        "Install antivirus software to protect your computer. Never click on suspicious links.",
      piege:
        "Computer virus uses the same word as biological virus, but they are completely different!",
      astuce:
        "Virus = malware. Antivirus = protection software. Hacker = someone who illegally accesses systems.",
    },
  },
  {
    question: "What does Wi-Fi allow you to do?",
    options: [
      "Make phone calls only",
      "Connect to the internet wirelessly",
      "Print documents",
      "Charge your phone",
    ],
    answer: "Connect to the internet wirelessly",
    fiche: {
      regle:
        "Wi-Fi = Wireless Fidelity. Connects devices to the internet without cables, using radio waves.",
      exemple:
        "The hotel offers free Wi-Fi. I connected my laptop to the Wi-Fi network.",
      piege: "Wi-Fi is wireless (sans fil). It needs a router to work.",
      astuce:
        "Wi-Fi = connexion internet sans fil. Router = routeur. Password = mot de passe Wi-Fi.",
    },
  },
  {
    question: "What is a robot?",
    options: [
      "A type of computer game",
      "A machine that can perform tasks automatically",
      "A human who works very fast",
      "A type of app",
    ],
    answer: "A machine that can perform tasks automatically",
    fiche: {
      regle:
        "A robot is a machine programmed to perform tasks automatically, often replacing human work.",
      exemple:
        "Car factories use robots to assemble vehicles. Robots are also used in surgery.",
      piege:
        "Robots do not have to look human. Many industrial robots are just mechanical arms!",
      astuce:
        "Robot vocabulary: automation, programmed, sensors, artificial intelligence, manufacturing.",
    },
  },
  {
    question: "What does recycle mean?",
    options: [
      "To use something once",
      "To throw something away",
      "To process used materials to make new products",
      "To buy new things",
    ],
    answer: "To process used materials to make new products",
    fiche: {
      regle:
        "Recycle = process waste materials (paper, glass, plastic, metal) to create new products.",
      exemple:
        "We recycle paper, glass and plastic at home. Recycling reduces waste in landfills.",
      piege:
        "Recycle is different from reuse (use again) and reduce (use less). The 3 Rs!",
      astuce:
        "3 Rs: Reduce = use less. Reuse = use again. Recycle = transform into something new.",
    },
  },
  {
    question: "What is social media?",
    options: [
      "Traditional newspapers",
      "Online platforms for sharing content and connecting with others",
      "Television programmes",
      "Radio broadcasts",
    ],
    answer: "Online platforms for sharing content and connecting with others",
    fiche: {
      regle:
        "Social media = online platforms where users create and share content: Instagram, TikTok, X.",
      exemple:
        "Many people use social media to share photos, news and opinions worldwide.",
      piege:
        "Social media is PLURAL in English. Say these media or just social networks.",
      astuce:
        "Social media vocabulary: post, share, like, follow, comment, hashtag, viral, influencer, story.",
    },
  },
];

export default function SciencesTechnologiePage() {
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
          <h1 className="lecon-titre">Science and Technology</h1>
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
            Learn vocabulary about <strong>science and technology</strong>:
            inventions, research and the digital world.
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
              <div className="lecon-point-titre">Digital world</div>
              <div className="lecon-point-texte">
                AI, Wi-Fi, download/upload, social media, smartphone, virus,
                robot, app.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> I downloaded the
                app. She uploaded her photos.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Science</div>
              <div className="lecon-point-texte">
                Experiment, hypothesis, laboratory, results, renewable energy,
                recycle.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> Scientists
                conduct experiments in the lab.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">Key acronyms</div>
              <div className="lecon-point-texte">
                AI = Artificial Intelligence. IT = Information Technology. Wi-Fi
                = Wireless Fidelity. GPS = Global Positioning System.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Example:</span> AI is changing
                the world of technology.
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
