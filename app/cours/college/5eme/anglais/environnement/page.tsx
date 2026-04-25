"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "environnement";

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
    question: "What does 'global warming' mean in French?",
    options: [
      "la pollution",
      "le réchauffement climatique",
      "la déforestation",
      "les énergies renouvelables",
    ],
    answer: "le réchauffement climatique",
    fiche: {
      regle:
        "Vocabulaire environnemental clé : global warming (réchauffement climatique), pollution, deforestation (déforestation), renewable energy (énergie renouvelable), greenhouse effect (effet de serre).",
      exemple:
        "✅ Global warming is causing sea levels to rise. Deforestation destroys animal habitats.",
      piege:
        "Global warming ≠ global weather. Warming = réchauffement, pas météo.",
      astuce:
        "Global = mondial. Warming = réchauffement. Global warming = réchauffement de toute la planète.",
    },
  },
  {
    question: "How do you say 'recycler' in English?",
    options: ["to recycle", "to reuse", "to reduce", "to repair"],
    answer: "to recycle",
    fiche: {
      regle:
        "Les 3R de l'environnement : Reduce (réduire), Reuse (réutiliser), Recycle (recycler). Chacun a un rôle différent.",
      exemple:
        "✅ We should recycle paper and glass. Try to reduce your waste. Reuse shopping bags.",
      piege:
        "Recycle ≠ reuse. Recycle = transformer en matière première. Reuse = utiliser à nouveau tel quel.",
      astuce:
        "3R : Reduce (moins consommer), Reuse (réutiliser), Recycle (recycler). Dans cet ordre de priorité !",
    },
  },
  {
    question: "Complete: 'We ___ protect the environment.' (obligation)",
    options: ["can", "must", "might", "would"],
    answer: "must",
    fiche: {
      regle:
        "Must = obligation forte (il faut absolument). Should = conseil (tu devrais). Can = capacité. Might = possibilité.",
      exemple:
        "✅ We must protect the environment. You should recycle. We mustn't pollute rivers.",
      piege:
        "Must (obligation) ≠ should (conseil). 'You must stop' = c'est obligatoire. 'You should stop' = c'est conseillé.",
      astuce:
        "MUST = obligation. SHOULD = conseil. MUSTN'T = interdit. SHOULDN'T = déconseillé.",
    },
  },
  {
    question: "What is 'a drought' in French?",
    options: [
      "une inondation",
      "une tempête",
      "une sécheresse",
      "un tremblement de terre",
    ],
    answer: "une sécheresse",
    fiche: {
      regle:
        "Catastrophes naturelles : drought (sécheresse), flood (inondation), storm (tempête), earthquake (tremblement de terre), wildfire (incendie de forêt).",
      exemple:
        "✅ The drought caused crop failures. Floods destroyed many homes. The wildfire spread quickly.",
      piege:
        "Drought (sécheresse) ≠ flood (inondation). Ce sont des opposés ! Drought = pas d'eau. Flood = trop d'eau.",
      astuce:
        "Drought = pas d'eau. Flood = trop d'eau. Storm = tempête. Earthquake = tremblement de TERRE.",
    },
  },
  {
    question: "What does 'endangered species' mean?",
    options: [
      "espèce abondante",
      "espèce en voie de disparition",
      "espèce sauvage",
      "espèce domestique",
    ],
    answer: "espèce en voie de disparition",
    fiche: {
      regle:
        "Endangered = en danger. Endangered species = espèce en voie de disparition. Extinct = éteinte (disparue). Wildlife = faune sauvage.",
      exemple:
        "✅ Tigers are an endangered species. Many animals are becoming extinct due to deforestation.",
      piege:
        "Endangered = en danger (existe encore mais menacée). Extinct = disparue pour toujours. Ne pas confondre.",
      astuce:
        "Endangered = en DANGER. Extinct = EX (n'existe plus). Pandas are endangered. Dinosaurs are extinct.",
    },
  },
  {
    question: "How do you say 'les énergies renouvelables' in English?",
    options: [
      "fossil fuels",
      "renewable energy",
      "nuclear power",
      "natural gas",
    ],
    answer: "renewable energy",
    fiche: {
      regle:
        "Sources d'énergie : renewable energy (renouvelable : solaire, éolien, hydraulique), fossil fuels (combustibles fossiles : pétrole, charbon, gaz), nuclear power (nucléaire).",
      exemple:
        "✅ Solar and wind are renewable energies. Oil and coal are fossil fuels that cause pollution.",
      piege:
        "Renewable = qui se renouvelle naturellement. Fossil fuels = réserves limitées qui pollent.",
      astuce:
        "Renew = renouveler. Renewable energy = se renouvelle (soleil, vent). Fossil = fossile = non renouvelable.",
    },
  },
  {
    question: "What is 'carbon footprint' in French?",
    options: [
      "l'empreinte carbone",
      "la pollution de l'air",
      "le trou dans la couche d'ozone",
      "les gaz à effet de serre",
    ],
    answer: "l'empreinte carbone",
    fiche: {
      regle:
        "Carbon footprint = empreinte carbone. C'est la quantité de CO2 produite par nos activités. Réduire son empreinte carbone = polluer moins.",
      exemple:
        "✅ Flying has a big carbon footprint. Taking the bus reduces your carbon footprint.",
      piege:
        "Footprint = empreinte (de pied). Carbon footprint = la 'trace' en carbone qu'on laisse. Métaphore !",
      astuce:
        "Carbon footprint = la 'trace' de carbone. Plus tu pollues, plus ton empreinte est grande. Réduire = polluer moins.",
    },
  },
  {
    question:
      "Complete: 'If we don't act now, many species ___ disappear.' (future consequence)",
    options: ["will", "would", "might", "All are possible."],
    answer: "All are possible.",
    fiche: {
      regle:
        "Will = futur certain. Might = possible. Would = conditionnel. Dans le contexte environnemental, les trois sont utilisés selon le niveau de certitude.",
      exemple:
        "✅ Species will disappear (certain). Species might disappear (possible). Species would disappear (conditionnel).",
      piege:
        "Will ≠ would. Will = futur réel. Would = hypothétique. Might = peut-être. Nuances importantes !",
      astuce:
        "Will = CERTAIN (it will rain tomorrow). Might = POSSIBLE (it might rain). Would = HYPOTHETICAL (if..., it would rain).",
    },
  },
  {
    question: "What does 'to pollute' mean?",
    options: ["nettoyer", "recycler", "polluer", "planter"],
    answer: "polluer",
    fiche: {
      regle:
        "Pollution vocabulary : to pollute (polluer), pollution (la pollution), pollutant (polluant), polluted (pollué). Air pollution, water pollution, soil pollution.",
      exemple:
        "✅ Factories pollute the air. Oil spills pollute the ocean. Cars produce pollutants.",
      piege:
        "Pollute (verbe) vs pollution (nom). 'Factories pollute' (verbe). 'Pollution is a problem' (nom).",
      astuce:
        "Pollute = verbe. Pollution = nom. Polluted = adjectif. The river IS polluted. Factories POLLUTE.",
    },
  },
  {
    question:
      "What is the main cause of climate change according to scientists?",
    options: [
      "volcanic eruptions",
      "greenhouse gas emissions",
      "solar activity",
      "ocean currents",
    ],
    answer: "greenhouse gas emissions",
    fiche: {
      regle:
        "Greenhouse gases (gaz à effet de serre) = CO2, méthane... émis par les activités humaines. Ils retiennent la chaleur du soleil et réchauffent la planète.",
      exemple:
        "✅ Burning fossil fuels releases greenhouse gases. CO2 emissions are the main cause of climate change.",
      piege:
        "Greenhouse effect = naturel et nécessaire. Greenhouse gas EMISSIONS excessives = problème causé par l'homme.",
      astuce:
        "Greenhouse = serre. Les gaz font comme une serre autour de la Terre → retient la chaleur → réchauffement.",
    },
  },
];

export default function EnvironnementPage() {
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
          <div className="lecon-badge">🌍 Anglais — 5ème</div>
          <h1 className="lecon-titre">L'environnement</h1>
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
              📖 Mode découverte — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Inscris-toi
              </span>{" "}
              pour les 10 questions complètes !
            </div>
          )}
          <div className="lecon-intro">
            Apprends le vocabulaire de l'<strong>environnement</strong> en
            anglais : problèmes climatiques, solutions et actions pour protéger
            la planète.
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
                    🏆 Meilleur score
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
                    🕐 Dernier score
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
                🌡️ Problèmes environnementaux
              </div>
              <div className="lecon-point-texte">
                Global warming (réchauffement), pollution, deforestation,
                drought (sécheresse), flood (inondation), endangered species.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Global warming
                causes droughts and floods.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">♻️ Solutions</div>
              <div className="lecon-point-texte">
                3R : Reduce, Reuse, Recycle. Renewable energy (solaire, éolien).
                Reduce carbon footprint. Must/should + action.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> We must reduce
                our carbon footprint. We should use renewable energy.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔋 Énergie</div>
              <div className="lecon-point-texte">
                Renewable energy (renouvelable) vs fossil fuels (combustibles
                fossiles). Greenhouse gases = gaz à effet de serre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Solar panels
                produce renewable energy. Oil is a fossil fuel.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
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
              {scoreRef.current} bonne{scoreRef.current > 1 ? "s" : ""} réponse
              {scoreRef.current > 1 ? "s" : ""}
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
                    : `La bonne réponse est : "${q.answer}"`}
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
                      😅 Aïe, 6 erreurs !
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Relis la fiche avant de continuer ! 💪
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
                    📖 Voir la fiche
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
                  📖 Lis la fiche pour débloquer !
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
                {index + 1 >= total
                  ? "Voir mon résultat →"
                  : "Question suivante →"}
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
                📖 Fiche pédagogique
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
                  📚 La règle
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
                  ✏️ Exemple
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
                  ⚠️ Le piège
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
                  💡 L'astuce
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
                J'ai compris ! Continuer →
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
        ? "Excellent!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep trying!";
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
            Tu as répondu correctement à {scoreRef.current} question
            {scoreRef.current > 1 ? "s" : ""} sur {total} ({pourcentage}%).
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
                📖 Mode découverte. Inscris-toi pour les 10 questions !
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
                ✨ S'inscrire gratuitement →
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
                    🏆 Meilleur score
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
                    🕐 Dernier score
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
              🔄 Réessayer
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              ← Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
