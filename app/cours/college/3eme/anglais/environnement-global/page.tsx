"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "environnement-global";

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
    question: "What does 'global warming' mean?",
    options: [
      "The cooling of the Earth's atmosphere",
      "The gradual increase in the Earth's average temperature",
      "Warming weather in summer",
      "The melting of ice in Antarctica only",
    ],
    answer: "The gradual increase in the Earth's average temperature",
    fiche: {
      regle:
        "Global warming refers to the long-term rise in Earth's average surface temperature due to human activities, mainly burning fossil fuels which release greenhouse gases.",
      exemple:
        "Global warming causes: rising sea levels, more extreme weather events, melting glaciers, threats to biodiversity.",
      piege:
        "Global warming ≠ hot weather. It's a long-term trend affecting the whole planet's climate system, not just temperature in one place.",
      astuce:
        "Key vocabulary: global warming, climate change, greenhouse effect, greenhouse gases (CO2, methane), fossil fuels, carbon footprint.",
    },
  },
  {
    question: "Which of these is a renewable energy source?",
    options: ["Coal", "Natural gas", "Solar power", "Oil"],
    answer: "Solar power",
    fiche: {
      regle:
        "Renewable energy sources are naturally replenished: solar, wind, hydroelectric, geothermal, tidal. Non-renewable (fossil fuels): coal, oil, natural gas — they take millions of years to form.",
      exemple:
        "Renewable: solar panels, wind turbines, hydroelectric dams, geothermal plants. Non-renewable: coal-fired power stations, petrol cars, gas heating.",
      piege:
        "Nuclear energy is NOT renewable (uranium is finite) but produces low carbon emissions. Don't confuse 'renewable' with 'clean'.",
      astuce:
        "Renewable = replenished naturally and quickly. Solar, wind, water, earth heat = renewable. Coal, oil, gas = fossil fuels = non-renewable.",
    },
  },
  {
    question: "What is the 'greenhouse effect'?",
    options: [
      "Growing plants in glass houses",
      "The trapping of heat in the Earth's atmosphere by gases",
      "The cooling effect of forests",
      "The reflection of sunlight by ice caps",
    ],
    answer: "The trapping of heat in the Earth's atmosphere by gases",
    fiche: {
      regle:
        "The greenhouse effect: the sun's heat enters the atmosphere, greenhouse gases (CO2, methane, water vapour) trap some of that heat instead of letting it escape. This is natural but human activities are intensifying it.",
      exemple:
        "Without any greenhouse effect: Earth would be -18°C (too cold). Too much: temperatures rise dangerously. CO2 from burning fossil fuels = main human-caused greenhouse gas.",
      piege:
        "The greenhouse effect itself is natural and necessary for life. The ENHANCED greenhouse effect (from human activity) is the problem.",
      astuce:
        "Greenhouse gases: CO2 (carbon dioxide), methane (CH4), nitrous oxide, water vapour. They act like a blanket around the Earth.",
    },
  },
  {
    question: "What does 'biodiversity' mean?",
    options: [
      "The variety of life forms on Earth",
      "The study of biology",
      "The diversity of human cultures",
      "A type of renewable energy",
    ],
    answer: "The variety of life forms on Earth",
    fiche: {
      regle:
        "Biodiversity = the variety of all living organisms on Earth: plants, animals, fungi, bacteria. It includes genetic diversity, species diversity and ecosystem diversity. It is threatened by habitat loss, pollution and climate change.",
      exemple:
        "The Amazon rainforest has extraordinary biodiversity. Coral reefs host 25% of marine species. Species extinction is happening 1000x faster than natural rates.",
      piege:
        "Biodiversity is not just about animals. It includes ALL living organisms: plants, insects, microorganisms, fungi — everything.",
      astuce:
        "Bio = life. Diversity = variety. Biodiversity = variety of life. Threats: deforestation, pollution, invasive species, climate change, overexploitation.",
    },
  },
  {
    question: "What is 'deforestation'?",
    options: [
      "Planting new trees in forests",
      "The clearing of forests for other land uses",
      "A method to protect endangered species",
      "The study of forest ecosystems",
    ],
    answer: "The clearing of forests for other land uses",
    fiche: {
      regle:
        "Deforestation is the large-scale removal of forests, mainly for agriculture, cattle ranching, logging and urban development. It contributes to climate change (trees absorb CO2), biodiversity loss and soil erosion.",
      exemple:
        "The Amazon loses millions of hectares each year. Palm oil plantations in Southeast Asia destroy orangutan habitats. Deforestation releases stored carbon into the atmosphere.",
      piege:
        "Deforestation ≠ sustainable forestry. Responsible logging replants trees. Deforestation is permanent removal without replanting.",
      astuce:
        "De- = remove/undo. Forest → deforestation = removing forests. Opposite: reforestation (planting trees). Forests = 'lungs of the Earth'.",
    },
  },
  {
    question: "Which phrase means reducing your environmental impact?",
    options: [
      "Increasing your carbon footprint",
      "Lowering your carbon footprint",
      "Expanding your ecological niche",
      "Growing your carbon offset",
    ],
    answer: "Lowering your carbon footprint",
    fiche: {
      regle:
        "Carbon footprint = total amount of greenhouse gases (especially CO2) produced by a person, organisation or activity. Reducing it means using less energy, eating less meat, travelling by public transport, etc.",
      exemple:
        "Ways to lower your carbon footprint: use public transport, reduce meat consumption, recycle, buy local food, use renewable energy, fly less.",
      piege:
        "A high carbon footprint = bad for the environment. Lowering = reducing emissions. Don't confuse 'carbon footprint' with 'carbon offset' (paying to compensate emissions).",
      astuce:
        "Carbon footprint = environmental impact measured in CO2. Lower it by: reduce, reuse, recycle. The 3 Rs of sustainability.",
    },
  },
  {
    question: "What does 'sustainable development' mean?",
    options: [
      "Economic growth without any environmental concern",
      "Development that meets present needs without compromising future generations",
      "Stopping all industrial development",
      "Development focused only on wealthy countries",
    ],
    answer:
      "Development that meets present needs without compromising future generations",
    fiche: {
      regle:
        "Sustainable development (concept from the Brundtland Report, 1987): development that meets the needs of the present without compromising the ability of future generations to meet their own needs.",
      exemple:
        "UN Sustainable Development Goals (SDGs): clean energy, no poverty, climate action, responsible consumption, clean water. Examples: organic farming, eco-tourism, green buildings.",
      piege:
        "Sustainable ≠ no development. It's about balancing economic growth, social equity and environmental protection — the three pillars of sustainability.",
      astuce:
        "Sustainable = can be maintained long-term. Three pillars: economic (prosperity), social (equity), environmental (protection). All three must be balanced.",
    },
  },
  {
    question: "What is 'pollution'?",
    options: [
      "The natural cycle of waste in ecosystems",
      "The introduction of harmful substances into the environment",
      "The study of environmental problems",
      "A method of recycling waste",
    ],
    answer: "The introduction of harmful substances into the environment",
    fiche: {
      regle:
        "Pollution = contamination of the environment with harmful substances. Types: air pollution (vehicle emissions, factories), water pollution (chemicals, plastic), soil pollution (pesticides, waste), noise pollution, light pollution.",
      exemple:
        "Air pollution: smog in cities. Water pollution: plastic in oceans, chemical runoff. Soil pollution: pesticides, industrial waste. Solutions: clean technology, regulations, recycling.",
      piege:
        "Not all waste causes pollution immediately, but accumulates over time. Microplastics are tiny but hugely damaging to marine ecosystems.",
      astuce:
        "Types of pollution: air, water, soil, noise, light. Sources: industry, transport, agriculture, waste. Solutions: regulation, clean tech, behaviour change.",
    },
  },
  {
    question: "What does 'to recycle' mean?",
    options: [
      "To throw away waste",
      "To reprocess used materials to make new products",
      "To reduce the amount of goods produced",
      "To use products only once",
    ],
    answer: "To reprocess used materials to make new products",
    fiche: {
      regle:
        "Recycling = converting waste into reusable material. The 3Rs hierarchy: Reduce (use less), Reuse (use again), Recycle (process into new material). Recycling is the last resort after reducing and reusing.",
      exemple:
        "Recyclable materials: paper, glass, metal, some plastics. Benefits: saves energy, reduces landfill, conserves raw materials. E.g. recycling aluminium uses 95% less energy than making new aluminium.",
      piege:
        "Recycling is important but REDUCING consumption is even better. The 3Rs order matters: Reduce first, then Reuse, then Recycle.",
      astuce:
        "3Rs: Reduce, Reuse, Recycle. In that order of priority. Recycling transforms waste into new materials. Composting is also a form of recycling (organic).",
    },
  },
  {
    question:
      "Which international agreement focuses on fighting climate change?",
    options: [
      "The Geneva Convention",
      "The Paris Agreement",
      "The Kyoto Protocol on Human Rights",
      "The Maastricht Treaty",
    ],
    answer: "The Paris Agreement",
    fiche: {
      regle:
        "The Paris Agreement (2015): international treaty where countries commit to limiting global warming to 1.5-2°C above pre-industrial levels. Nearly all countries signed it. Each country sets its own emission reduction targets (NDCs).",
      exemple:
        "COP (Conference of Parties): annual UN climate summit. COP21 = Paris 2015. COP26 = Glasgow 2021. Greta Thunberg and Fridays for Future = youth climate activism.",
      piege:
        "The Paris Agreement is about climate change, not other environmental issues. The Kyoto Protocol (1997) was its predecessor focused on developed nations only.",
      astuce:
        "Paris Agreement 2015 = global climate commitment. 1.5°C target. NDCs = Nationally Determined Contributions. COP = annual climate conference.",
    },
  },
];

export default function EnvironnementGlobalPage() {
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
          <h1 className="lecon-titre">Environment & Global Issues</h1>
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
            Learn essential vocabulary about{" "}
            <strong>climate change, pollution, biodiversity</strong> and global
            environmental issues in English.
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
                🌡️ Climate change vocabulary
              </div>
              <div className="lecon-point-texte">
                Global warming, greenhouse effect, greenhouse gases (CO2,
                methane), fossil fuels, carbon footprint, renewable energy
                (solar, wind, hydroelectric), deforestation.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> to reduce
                emissions, to lower your carbon footprint, to switch to
                renewable energy, climate action.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🌿 Biodiversity & pollution
              </div>
              <div className="lecon-point-texte">
                Biodiversity = variety of life. Threats: habitat loss, pollution
                (air/water/soil), invasive species. Recycle, reuse, reduce.
                Sustainable development = meeting present needs without harming
                the future.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> endangered
                species, habitat destruction, to recycle, to compost, zero
                waste, eco-friendly.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🌍 Global action</div>
              <div className="lecon-point-texte">
                Paris Agreement (2015): limit warming to 1.5°C. COP = annual UN
                climate summit. UN SDGs (Sustainable Development Goals).
                Activists: Greta Thunberg, Fridays for Future.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> climate
                summit, carbon neutral, net zero, international treaty,
                environmental policy.
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
