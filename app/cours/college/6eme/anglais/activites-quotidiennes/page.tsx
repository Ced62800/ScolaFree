"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "activites-quotidiennes";

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
    question: "How do you say 'Je me lève à 7 heures' in English?",
    options: [
      "I get up at 7 o'clock.",
      "I wake at 7 o'clock.",
      "I rise up 7 hours.",
      "I am up 7 o'clock.",
    ],
    answer: "I get up at 7 o'clock.",
    fiche: {
      regle:
        "Get up = se lever. I get up at + heure. Toujours AT pour les heures.",
      exemple: "✅ I get up at 7 o'clock. / She gets up at 6:30.",
      piege:
        "Get up (se lever), pas 'wake up' (se réveiller) — attention à la nuance !",
      astuce:
        "Get up = se lever. Wake up = se réveiller. AT + heure. I get up AT 7 !",
    },
  },
  {
    question: "How do you say 'Je prends le petit-déjeuner' in English?",
    options: [
      "I take the breakfast.",
      "I eat the breakfast.",
      "I have breakfast.",
      "I do breakfast.",
    ],
    answer: "I have breakfast.",
    fiche: {
      regle:
        "Have breakfast = prendre le petit-déjeuner. Pas d'article après have breakfast/lunch/dinner.",
      exemple: "✅ I have breakfast at 7:30. / We have lunch at noon.",
      piege: "Pas de 'the' : I have breakfast (pas 'the breakfast').",
      astuce:
        "Have + repas (sans article). Have breakfast, have lunch, have dinner !",
    },
  },
  {
    question: "What does 'I go to school' mean?",
    options: [
      "Je rentre à la maison.",
      "Je vais à l'école.",
      "J'aime l'école.",
      "Je quitte l'école.",
    ],
    answer: "Je vais à l'école.",
    fiche: {
      regle:
        "Go to school = aller à l'école. Go to + lieu (sans article pour school, church, bed...).",
      exemple: "✅ I go to school at 8 o'clock. / She goes to school by bus.",
      piege:
        "Go to school (pas 'go to the school'). Certains lieux n'ont pas d'article !",
      astuce:
        "Go to school / go to bed / go to church — pas d'article ! C'est une exception.",
    },
  },
  {
    question: "How do you say 'Je fais mes devoirs' in English?",
    options: [
      "I make my homework.",
      "I do my homework.",
      "I have my homework.",
      "I take my homework.",
    ],
    answer: "I do my homework.",
    fiche: {
      regle: "Do homework = faire ses devoirs. DO (pas make) avec homework.",
      exemple:
        "✅ I do my homework after school. / She does her homework at 5pm.",
      piege:
        "DO my homework (pas MAKE). En anglais : do homework, do sport, do cooking.",
      astuce:
        "DO = faire (pour les activités). I DO my homework. She DOES her homework (he/she/it → does).",
    },
  },
  {
    question: "How do you say 'Il est midi' in English?",
    options: [
      "It is midday.",
      "It is noon.",
      "It is 12 o'clock.",
      "All answers are correct.",
    ],
    answer: "All answers are correct.",
    fiche: {
      regle:
        "Midi en anglais : noon, midday, ou 12 o'clock. Les trois sont corrects !",
      exemple:
        "✅ I have lunch at noon. / It is 12 o'clock = It is noon = It is midday.",
      piege: "Midnight = minuit (pas midi). Noon/Midday = midi.",
      astuce:
        "Noon = midi. Midnight = minuit. Mid = milieu, Night = nuit, Day = jour !",
    },
  },
  {
    question: "How do you say 'Je regarde la télévision' in English?",
    options: [
      "I look the TV.",
      "I see the TV.",
      "I watch TV.",
      "I view television.",
    ],
    answer: "I watch TV.",
    fiche: {
      regle:
        "Watch TV = regarder la télévision. Watch (pas look ou see) pour la TV.",
      exemple: "✅ I watch TV in the evening. / We watch a film on Saturdays.",
      piege:
        "Watch TV (pas 'look the TV'). Watch = regarder quelque chose qui bouge.",
      astuce:
        "WATCH TV. Watch = regarder (films, sport, TV). Look = regarder (une photo, un objet).",
    },
  },
  {
    question: "What time is 'half past eight' in French?",
    options: ["8h00", "8h15", "8h30", "8h45"],
    answer: "8h30",
    fiche: {
      regle:
        "Half past + heure = heure + 30 minutes. Half = moitié. Past = après.",
      exemple: "✅ Half past eight = 8h30. Half past seven = 7h30.",
      piege:
        "Half past EIGHT = 8h30. Ne pas confondre avec 'half to eight' qui n'existe pas.",
      astuce:
        "Half past 8 = 8 + half (moitié d'heure) = 8h30. Quarter past = 8h15 !",
    },
  },
  {
    question: "How do you say 'Je vais au lit à 9 heures' in English?",
    options: [
      "I go to my bed at 9.",
      "I go to bed at 9 o'clock.",
      "I sleep at 9 o'clock.",
      "I put to bed at 9.",
    ],
    answer: "I go to bed at 9 o'clock.",
    fiche: {
      regle:
        "Go to bed = aller au lit / se coucher. Pas d'article devant bed dans cette expression.",
      exemple: "✅ I go to bed at 9 o'clock. / She goes to bed early.",
      piege: "Go to bed (pas 'go to my bed' ni 'go to the bed').",
      astuce: "Go to bed = se coucher. Get up = se lever. Opposés !",
    },
  },
  {
    question: "How do you say 'le matin' in English?",
    options: [
      "in the evening",
      "at night",
      "in the morning",
      "in the afternoon",
    ],
    answer: "in the morning",
    fiche: {
      regle:
        "Les moments de la journée : in the morning (matin), in the afternoon (après-midi), in the evening (soir), at night (nuit).",
      exemple: "✅ I have English in the morning. / I watch TV in the evening.",
      piege:
        "At night (pas 'in the night'). Night est une exception — AT et non IN.",
      astuce:
        "Morning/Afternoon/Evening = IN the... Night = AT night. Night est l'exception !",
    },
  },
  {
    question: "Complete: 'She ___ to school by bus.' (aller)",
    options: ["go", "goes", "going", "is go"],
    answer: "goes",
    fiche: {
      regle:
        "Avec he/she/it au présent simple, on ajoute -s ou -es au verbe. Go → goes.",
      exemple: "✅ I go / You go / He goes / She goes / We go / They go.",
      piege:
        "She GO → FAUX. She GOES → CORRECT. Avec he/she/it, toujours ajouter -s/-es !",
      astuce:
        "He/She/It + verbe + S. Goes, likes, watches, does... Le S est obligatoire !",
    },
  },
];

export default function ActivitesQuotidiennesPage() {
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
  const boutonBloque =
    fautesRef.current >= 6 && !ficheObligatoireLue && estCorrecte === false;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🇬🇧 Anglais — 6ème</div>
          <h1 className="lecon-titre">Les activités quotidiennes</h1>
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
            Apprends à parler de ta <strong>routine quotidienne</strong> en
            anglais : se lever, aller à l'école, faire ses devoirs...
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
              <div className="lecon-point-titre">⏰ La routine du matin</div>
              <div className="lecon-point-texte">
                Get up (se lever), have breakfast (prendre le petit-déj), go to
                school (aller à l'école).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I get up at 7.
                I have breakfast at 7:30.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🕐 L'heure</div>
              <div className="lecon-point-texte">
                O'clock (heure pile), half past (et demie), quarter past (et
                quart), quarter to (moins le quart).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Half past eight
                = 8h30. Quarter past nine = 9h15.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📺 Les activités</div>
              <div className="lecon-point-texte">
                Watch TV (regarder la TV), do homework (faire ses devoirs), go
                to bed (se coucher), play (jouer).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I watch TV in
                the evening. I go to bed at 9.
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
                {!estCorrecte &&
                  fautesRef.current >= 6 &&
                  !ficheObligatoireLue && (
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
