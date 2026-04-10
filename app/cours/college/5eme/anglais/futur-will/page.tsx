"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "futur-will";

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
    question: "How do you form the future with 'will'?",
    options: [
      "will + verb-ing",
      "will + verb + -ed",
      "will + verb (base)",
      "will + to + verb",
    ],
    answer: "will + verb (base)",
    fiche: {
      regle:
        "Le futur avec will : will + verbe BASE (infinitif sans 'to'). Pour tous les sujets. Will ne change jamais.",
      exemple:
        "✅ I will go. She will come. They will play. It will rain tomorrow.",
      piege:
        "Will + BASE. Jamais 'will going' ou 'will goes'. Le verbe reste toujours à la BASE après will.",
      astuce:
        "WILL + BASE. Comme les modaux (can, must), will est suivi du verbe BASE. Will = même forme pour tous !",
    },
  },
  {
    question: "When do we use 'will' to express the future?",
    options: [
      "Pour un plan prévu à l'avance",
      "Pour des prédictions, décisions spontanées et promesses",
      "Pour des habitudes présentes",
      "Pour des actions en cours",
    ],
    answer: "Pour des prédictions, décisions spontanées et promesses",
    fiche: {
      regle:
        "Will s'utilise pour : 1) prédictions (I think it will rain), 2) décisions spontanées (I'll help you!), 3) promesses (I will call you).",
      exemple:
        "✅ Prédiction : It will be cold tomorrow. Décision : I'll have the pizza! Promesse : I'll never forget you.",
      piege:
        "Will ≠ going to. Going to = plan prévu. Will = décision spontanée ou prédiction générale.",
      astuce:
        "WILL = décision sur le moment, prédiction, promesse. GOING TO = plan décidé avant.",
    },
  },
  {
    question: "What is the negative form of 'will'?",
    options: ["will not / won't", "don't will", "will don't", "not will"],
    answer: "will not / won't",
    fiche: {
      regle:
        "Négatif : will not = won't (contraction). Won't + verbe BASE. Pour tous les sujets.",
      exemple:
        "✅ I won't go. She will not come. They won't play. It won't rain.",
      piege: "Won't ≠ want. Won't = will not. Contraction à bien retenir !",
      astuce: "WILL NOT = WON'T. Won't go, won't come, won't play. Facile !",
    },
  },
  {
    question: "Choose the correct form: 'Look at those clouds! It ___ rain.'",
    options: ["will", "is going to", "Both are correct.", "would"],
    answer: "is going to",
    fiche: {
      regle:
        "Going to = prédiction basée sur une preuve visible (les nuages). Will = prédiction générale sans preuve visible.",
      exemple:
        "✅ Look at the clouds → it's GOING TO rain (preuve visible). I think it will rain tomorrow (prédiction générale).",
      piege:
        "Preuve visible maintenant → going to. Prédiction générale → will.",
      astuce:
        "Preuve + going to. 'Look!' = signe visible → going to. Sans preuve = will.",
    },
  },
  {
    question: "How do you say 'Je promets que je ne le ferai plus' in English?",
    options: [
      "I promise I won't do it again.",
      "I promise I'm not doing it again.",
      "I promise I didn't do it again.",
      "I promise I wouldn't do it again.",
    ],
    answer: "I promise I won't do it again.",
    fiche: {
      regle:
        "Pour les promesses → will/won't. 'I promise I won't...' = je promets que je ne vais pas...",
      exemple: "✅ I promise I will call you. I promise I won't be late.",
      piege:
        "Une promesse au futur → will/won't. Pas le présent ni le conditionnel.",
      astuce:
        "Promise + WILL/WON'T = promesse au futur. I promise I won't do it again.",
    },
  },
  {
    question: "Complete: 'I think robots ___ do most jobs in the future.'",
    options: ["are going to", "will", "Both are correct.", "would"],
    answer: "Both are correct.",
    fiche: {
      regle:
        "Pour les prédictions futures, will ET going to sont souvent interchangeables.",
      exemple:
        "✅ I think robots will do most jobs. = I think robots are going to do most jobs.",
      piege:
        "Will et going to ne sont PAS toujours interchangeables. Pour les décisions spontanées → will seulement.",
      astuce:
        "Prédiction → will OU going to. Décision spontanée → will SEULEMENT.",
    },
  },
  {
    question: "Complete: 'If it rains tomorrow, I ___ stay at home.'",
    options: ["will", "would", "am going to", "Both a and b are possible."],
    answer: "Both a and b are possible.",
    fiche: {
      regle:
        "Conditionnel réel (likely) : If + présent → will. Conditionnel irréel : If + past → would.",
      exemple:
        "✅ If it rains tomorrow, I will stay home. (possible). If it rained, I would stay home. (hypothétique).",
      piege:
        "If + présent → will. If + passé → would. Ne pas mélanger dans le même conditionnel.",
      astuce:
        "Conditionnel réel : If + PRESENT → WILL. Hypothétique : If + PAST → WOULD.",
    },
  },
  {
    question: "How do you say 'Je pense qu'il fera beau demain' in English?",
    options: [
      "I think it will be sunny tomorrow.",
      "I think it is going to be sunny tomorrow.",
      "I think it would be sunny tomorrow.",
      "Both a and b are correct.",
    ],
    answer: "Both a and b are correct.",
    fiche: {
      regle:
        "Pour une prédiction, will et going to sont tous deux corrects. 'I think' introduit souvent une prédiction avec will.",
      exemple: "✅ I think it will be sunny. = I think it's going to be sunny.",
      piege: "Would = conditionnel (hypothèse). Will/going to = futur réel.",
      astuce:
        "I think + WILL = prédiction classique. I think + GOING TO = aussi correct.",
    },
  },
  {
    question: "Complete: '___ you help me with this?' (question polie)",
    options: ["Will", "Would", "Both are correct.", "Do"],
    answer: "Both are correct.",
    fiche: {
      regle:
        "Will you...? = question directe. Would you...? = forme plus polie. Les deux sont corrects.",
      exemple:
        "✅ Will you help me? (direct). Would you help me? (plus poli). Would you like some tea? (très poli).",
      piege:
        "Would est plus poli que will. Dans un contexte formel, préférer would.",
      astuce:
        "Will = direct. Would = plus poli. Would you like...? = la forme la plus polie.",
    },
  },
  {
    question: "What does 'shall' mean compared to 'will'?",
    options: [
      "Shall est identique à will",
      "Shall est plus formel, utilisé avec I/we pour offrir ou suggérer",
      "Shall exprime le passé",
      "Shall n'existe pas en anglais moderne",
    ],
    answer: "Shall est plus formel, utilisé avec I/we pour offrir ou suggérer",
    fiche: {
      regle:
        "Shall = forme plus formelle ou britannique. Principalement avec I/we pour offrir (Shall I help?) ou suggérer (Shall we go?).",
      exemple:
        "✅ Shall I open the window? (offre). Shall we go? (suggestion). Très britannique.",
      piege:
        "Shall est moins courant aujourd'hui. Will le remplace souvent. Mais 'shall we?' reste fréquent.",
      astuce:
        "Shall we...? = suggestion. Shall I...? = offre. Très poli et britannique !",
    },
  },
];

export default function FuturWillPage() {
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
          <div className="lecon-badge">🔮 Anglais — 5ème</div>
          <h1 className="lecon-titre">Le futur avec will</h1>
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
            Maîtrise le <strong>futur avec will</strong> : prédictions,
            décisions spontanées, promesses.
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
              <div className="lecon-point-titre">✅ Formation</div>
              <div className="lecon-point-texte">
                will + verbe BASE. Négatif : won't + BASE. Question : Will +
                sujet + BASE ?
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> It will rain.
                She won't come. Will you help?
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎯 Quand utiliser will</div>
              <div className="lecon-point-texte">
                Prédiction, décision spontanée, promesse, offre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I'll have the
                pizza! (décision). I will call you. (promesse).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚡ Will vs Going to</div>
              <div className="lecon-point-texte">
                Will = décision spontanée ou prédiction générale. Going to =
                plan prévu ou preuve visible.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Look! → going
                to rain. I think → it will rain.
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
