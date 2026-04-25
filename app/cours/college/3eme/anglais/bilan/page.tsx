"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "bilan";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // Past Perfect (5)
  {
    id: 1,
    theme: "past-perfect",
    question: "Complete: 'When she arrived, he ___ already left.'",
    options: ["has", "had", "have", "was"],
    reponse: "had",
    explication:
      "Past Perfect = had + p.p. The action of leaving happened BEFORE she arrived. 'Had already left' = Past Perfect.",
  },
  {
    id: 2,
    theme: "past-perfect",
    question: "What is the past participle of 'go'?",
    options: ["went", "goed", "gone", "going"],
    reponse: "gone",
    explication:
      "Irregular verb: go → went (past simple) → gone (past participle). He had gone. She has gone.",
  },
  {
    id: 3,
    theme: "past-perfect",
    question: "Choose the correct sentence:",
    options: [
      "She was tired because she worked all night.",
      "She was tired because she had worked all night.",
      "She was tired because she has worked all night.",
      "She was tired because she works all night.",
    ],
    reponse: "She was tired because she had worked all night.",
    explication:
      "The cause (working all night) happened BEFORE the effect (being tired). Cause first in time = Past Perfect.",
  },
  {
    id: 4,
    theme: "past-perfect",
    question: "'By the time we arrived, the concert ___ finished.'",
    options: ["has", "had", "was", "is"],
    reponse: "had",
    explication:
      "'By the time' signals Past Perfect. The concert finished BEFORE we arrived. 'had finished' = Past Perfect.",
  },
  {
    id: 5,
    theme: "past-perfect",
    question: "Which is Past Perfect negative?",
    options: [
      "He didn't finish.",
      "He hadn't finished.",
      "He hasn't finished.",
      "He wasn't finishing.",
    ],
    reponse: "He hadn't finished.",
    explication:
      "Past Perfect negative = hadn't + past participle. hadn't = had not. Never use 'didn't had'.",
  },
  // Reported Speech (5)
  {
    id: 6,
    theme: "discours-indirect-2",
    question: "Report: She said: 'I love chocolate.'",
    options: [
      "She said she loves chocolate.",
      "She said she loved chocolate.",
      "She said I loved chocolate.",
      "She said she love chocolate.",
    ],
    reponse: "She said she loved chocolate.",
    explication:
      "Tense shift: Present Simple → Past Simple. 'I love' → 'she loved'. Pronoun: I → she.",
  },
  {
    id: 7,
    theme: "discours-indirect-2",
    question: "Report: 'Do you like coffee?' he asked.",
    options: [
      "He asked if I like coffee.",
      "He asked if I liked coffee.",
      "He asked did I like coffee.",
      "He asked that I liked coffee.",
    ],
    reponse: "He asked if I liked coffee.",
    explication:
      "Yes/No question in reported speech: asked + if + subject + verb (no inversion). Tense shift: like → liked.",
  },
  {
    id: 8,
    theme: "discours-indirect-2",
    question: "'Clean your room!' she told me. Report:",
    options: [
      "She said me to clean my room.",
      "She told to clean my room.",
      "She told me to clean my room.",
      "She said to clean my room.",
    ],
    reponse: "She told me to clean my room.",
    explication:
      "Commands: told + object + to + infinitive. TELL needs an object (me, him, us). SAY does not take an object.",
  },
  {
    id: 9,
    theme: "discours-indirect-2",
    question: "Report: 'I will call you tomorrow,' she said.",
    options: [
      "She said she will call me tomorrow.",
      "She said she would call me the next day.",
      "She said she called me the next day.",
      "She said she would call you tomorrow.",
    ],
    reponse: "She said she would call me the next day.",
    explication:
      "Will → would. Tomorrow → the next day. You → me (if I'm the listener). Time and pronoun changes are essential.",
  },
  {
    id: 10,
    theme: "discours-indirect-2",
    question: "Which is correct? (say vs tell)",
    options: [
      "He told that he was tired.",
      "He said me that he was tired.",
      "He said that he was tired.",
      "He told that he is tired.",
    ],
    reponse: "He said that he was tired.",
    explication:
      "SAY + (that) + clause (no object after say). TELL + person + (that) + clause. 'He told that...' is wrong — told needs an object.",
  },
  // Environment (5)
  {
    id: 11,
    theme: "environnement-global",
    question: "What is 'global warming'?",
    options: [
      "The cooling of the planet",
      "The gradual rise in Earth's average temperature",
      "Warm weather in summer",
      "A type of renewable energy",
    ],
    reponse: "The gradual rise in Earth's average temperature",
    explication:
      "Global warming = long-term rise in Earth's temperature due to greenhouse gas emissions from human activities.",
  },
  {
    id: 12,
    theme: "environnement-global",
    question: "Which is a renewable energy source?",
    options: ["Coal", "Oil", "Wind power", "Natural gas"],
    reponse: "Wind power",
    explication:
      "Renewable energy = naturally replenished: wind, solar, hydroelectric, geothermal. Fossil fuels (coal, oil, gas) are non-renewable.",
  },
  {
    id: 13,
    theme: "environnement-global",
    question: "What does 'deforestation' mean?",
    options: [
      "Planting new trees",
      "The large-scale clearing of forests",
      "A method to protect animals",
      "Sustainable farming",
    ],
    reponse: "The large-scale clearing of forests",
    explication:
      "Deforestation = removing forests for agriculture, cattle, logging, urban development. Releases CO2, destroys habitats.",
  },
  {
    id: 14,
    theme: "environnement-global",
    question: "What is 'biodiversity'?",
    options: [
      "A type of pollution",
      "The variety of all life forms on Earth",
      "The study of biology",
      "A renewable energy source",
    ],
    reponse: "The variety of all life forms on Earth",
    explication:
      "Biodiversity = variety of all living organisms. Threatened by habitat loss, pollution, climate change, invasive species.",
  },
  {
    id: 15,
    theme: "environnement-global",
    question: "What is the Paris Agreement?",
    options: [
      "A trade deal between France and UK",
      "An international treaty to limit global warming to 1.5-2°C",
      "A European environmental law",
      "A UN human rights declaration",
    ],
    reponse: "An international treaty to limit global warming to 1.5-2°C",
    explication:
      "Paris Agreement (2015) = nearly all countries committed to limit warming. COP21. NDCs = each country's emission targets.",
  },
  // Media & Society (5)
  {
    id: 16,
    theme: "medias-societe",
    question: "What is 'fake news'?",
    options: [
      "Old news republished",
      "False or misleading information presented as real news",
      "News from foreign countries",
      "News about celebrities",
    ],
    reponse: "False or misleading information presented as real news",
    explication:
      "Fake news = deliberately false information. Fact-check: check the source, find other reports, verify images. Critical thinking essential.",
  },
  {
    id: 17,
    theme: "medias-societe",
    question: "What is 'cyberbullying'?",
    options: [
      "Hacking computers",
      "Bullying that takes place online through digital devices",
      "Sharing positive messages",
      "A computer security problem",
    ],
    reponse: "Bullying that takes place online through digital devices",
    explication:
      "Cyberbullying = harassment via digital technology (messages, photos, rumours). Can happen 24/7. Serious psychological consequences.",
  },
  {
    id: 18,
    theme: "medias-societe",
    question: "What does 'going viral' mean?",
    options: [
      "Getting a virus",
      "Content spreading rapidly across the internet",
      "Deleting a social media post",
      "Becoming ill from screens",
    ],
    reponse: "Content spreading rapidly across the internet",
    explication:
      "Going viral = content spreading extremely quickly via shares and reposts. Can reach millions in hours. Can be positive or negative.",
  },
  {
    id: 19,
    theme: "medias-societe",
    question: "What is 'streaming'?",
    options: [
      "Downloading files to watch later",
      "Watching content in real time over the internet",
      "Recording TV shows",
      "Sharing on social media",
    ],
    reponse: "Watching content in real time over the internet",
    explication:
      "Streaming = receiving and playing audio/video in real time (Netflix, YouTube, Spotify). No download needed. Needs internet connection.",
  },
  {
    id: 20,
    theme: "medias-societe",
    question: "What is an 'influencer'?",
    options: [
      "A government official",
      "A person who influences others through their online presence",
      "A type of algorithm",
      "A traditional journalist",
    ],
    reponse: "A person who influences others through their online presence",
    explication:
      "Influencer = someone with significant online following who shapes opinions and buying decisions. Works on Instagram, TikTok, YouTube.",
  },
];

const themeLabels: Record<string, string> = {
  "past-perfect": "The Past Perfect",
  "discours-indirect-2": "Reported Speech",
  "environnement-global": "Environment",
  "medias-societe": "Media & Society",
};

const themeColors: Record<string, string> = {
  "past-perfect": "#4f8ef7",
  "discours-indirect-2": "#2ec4b6",
  "environnement-global": "#ffd166",
  "medias-societe": "#ff6b6b",
};

export default function BilanAnglais3emePage() {
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
          <h1 className="lecon-titre">Final Test — English Part 1</h1>
          <div className="lecon-intro">
            This test covers the 4 topics of Part 1: Past Perfect, Reported
            Speech, Environment and Media & Society. 20 questions, score out of
            20.
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
              onClick={() => router.push("/cours/college/3eme/anglais")}
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
