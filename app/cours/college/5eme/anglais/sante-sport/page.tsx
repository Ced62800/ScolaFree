"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "sante-sport";

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
    question: "How do you say 'J'ai mal à la tête' in English?",
    options: [
      "I have headache.",
      "I have a headache.",
      "My head hurts me.",
      "Both b and c are correct.",
    ],
    answer: "Both b and c are correct.",
    fiche: {
      regle:
        "Pour les maux : I have a headache. (j'ai mal à la tête) ou My head hurts. (ma tête fait mal). Les deux sont corrects.",
      exemple:
        "✅ I have a headache. I have a stomachache. My back hurts. My leg hurts.",
      piege:
        "'I have headache' → FAUX. Il faut l'article 'a' : I have A headache. Toujours avec l'article !",
      astuce:
        "I have A + ache. Headache, stomachache, backache, toothache. Ou : My + partie du corps + hurts.",
    },
  },
  {
    question: "What does 'to be fit' mean?",
    options: [
      "être malade",
      "être en bonne forme physique",
      "être fatigué",
      "être blessé",
    ],
    answer: "être en bonne forme physique",
    fiche: {
      regle:
        "Fit = en bonne condition physique. To keep fit = rester en forme. Fitness = condition physique. Fit ≠ skinny (maigre).",
      exemple:
        "✅ She is very fit, she goes to the gym every day. Keep fit by eating healthy and exercising.",
      piege:
        "Fit ≠ slim (mince). Fit = en forme physiquement. You can be slim but not fit, or fit but not slim.",
      astuce:
        "Fit = en forme. Keep fit = garder la forme. Get fit = se mettre en forme. Fitness = condition physique.",
    },
  },
  {
    question:
      "How do you say 'Il fait du sport trois fois par semaine' in English?",
    options: [
      "He makes sport three times a week.",
      "He does sport three times a week.",
      "He plays sport three times a week.",
      "He practises sport three times a week.",
    ],
    answer: "He does sport three times a week.",
    fiche: {
      regle:
        "DO sport/exercise = faire du sport (en général). PLAY + sport avec ballon (football, tennis). GO + sport en -ing (swimming, running).",
      exemple:
        "✅ She does sport. He plays football. They go swimming. I do yoga. She plays basketball.",
      piege:
        "'Make sport' → FAUX. On dit DO sport, PLAY football, GO swimming. Trois verbes différents selon le sport !",
      astuce:
        "DO sport (général). PLAY + ballon (football, tennis, basketball). GO + -ING (swimming, running, cycling).",
    },
  },
  {
    question: "What is 'a balanced diet' in French?",
    options: [
      "un régime strict",
      "une alimentation équilibrée",
      "un jeûne",
      "une diète végétarienne",
    ],
    answer: "une alimentation équilibrée",
    fiche: {
      regle:
        "Healthy eating vocabulary : balanced diet (alimentation équilibrée), junk food (malbouffe), nutrients (nutriments), calories, vitamins (vitamines), protein (protéines).",
      exemple:
        "✅ A balanced diet includes fruits, vegetables, proteins and carbohydrates. Avoid junk food.",
      piege:
        "Diet ≠ régime amaigrissant. Diet = régime alimentaire (en général). A balanced diet = une bonne alimentation.",
      astuce:
        "Balanced = équilibré. Diet = régime/alimentation. Balanced diet = bien manger, varié et équilibré.",
    },
  },
  {
    question: "How do you say 'se blesser' in English?",
    options: ["to hurt", "to injure", "to get injured", "All are correct."],
    answer: "All are correct.",
    fiche: {
      regle:
        "Se blesser : hurt (blesser/avoir mal), injure (blesser, souvent accidentellement), get injured (se faire blesser). Les trois sont utilisés.",
      exemple:
        "✅ He hurt his knee. She injured her ankle. The player got injured during the game.",
      piege:
        "Hurt = douleur ou blessure légère. Injure/injury = blessure plus sérieuse (souvent sportive ou accidentelle).",
      astuce:
        "Hurt = douleur courante. Injure/injury = blessure sérieuse. 'I hurt my finger' vs 'He injured his back'.",
    },
  },
  {
    question: "What does 'to warm up' mean in a sports context?",
    options: [
      "se réchauffer après le sport",
      "s'échauffer avant le sport",
      "transpirer",
      "se reposer",
    ],
    answer: "s'échauffer avant le sport",
    fiche: {
      regle:
        "Warm up (phrasal verb) = s'échauffer (avant l'effort). Cool down = récupérer (après l'effort). Always warm up before exercise to avoid injuries.",
      exemple:
        "✅ Always warm up before training. Cool down after your run. A good warm-up takes 10 minutes.",
      piege:
        "Warm up = s'échauffer AVANT (pas après). Cool down = récupérer APRÈS l'exercice.",
      astuce:
        "WARM UP = avant (chauffer les muscles). COOL DOWN = après (refroidir). Logique comme les températures !",
    },
  },
  {
    question: "Complete: 'You ___ eat more vegetables.' (advice)",
    options: ["must", "should", "will", "can"],
    answer: "should",
    fiche: {
      regle:
        "Should = conseil (tu devrais). Must = obligation (tu dois absolument). Should est plus doux, pour donner des conseils de santé.",
      exemple:
        "✅ You should eat more vegetables. You should exercise regularly. You shouldn't eat too much sugar.",
      piege:
        "Must = obligation forte. Should = conseil. Pour les conseils de santé → should (pas must, trop fort).",
      astuce:
        "Should = conseil. Must = obligation. Pour la santé : 'You should' est plus naturel que 'you must'.",
    },
  },
  {
    question: "What sport uses the verb 'go' in English?",
    options: ["football", "tennis", "swimming", "basketball"],
    answer: "swimming",
    fiche: {
      regle:
        "GO + sport en -ing : go swimming, go running, go cycling, go hiking, go skiing, go surfing. Sports avec mouvement/déplacement.",
      exemple:
        "✅ I go swimming every Sunday. She goes running in the morning. They go cycling at the weekend.",
      piege:
        "Football, tennis, basketball → PLAY (avec ballon). Swimming, running, cycling → GO + -ing.",
      astuce:
        "GO + -ING pour les sports de mouvement seul (sans équipe/ballon). Swimming → go swimming. Running → go running.",
    },
  },
  {
    question: "How do you say 'Il a une bonne santé' in English?",
    options: [
      "He is in good health.",
      "He has a good health.",
      "He is healthy.",
      "Both a and c are correct.",
    ],
    answer: "Both a and c are correct.",
    fiche: {
      regle:
        "Deux façons : He is in good health. (il est en bonne santé) ou He is healthy. (il est en bonne santé). Les deux sont corrects.",
      exemple:
        "✅ She is in good health. = She is healthy. He is not healthy. = He is in poor health.",
      piege:
        "'He has a good health' → FAUX. On dit 'he is in good health' (pas have) ou 'he is healthy'.",
      astuce:
        "In good health = healthy. In poor health = unhealthy/ill/sick. BE in good health / BE healthy.",
    },
  },
  {
    question: "What is the difference between 'ill' and 'sick' in English?",
    options: [
      "Ill = très malade, sick = légèrement malade",
      "En anglais britannique : ill et sick. En américain : sick surtout.",
      "Sick = avoir envie de vomir, ill = être malade (général)",
      "Both b and c are correct.",
    ],
    answer: "Both b and c are correct.",
    fiche: {
      regle:
        "Sick : anglais américain courant (je suis malade). Sick peut aussi = avoir envie de vomir (I feel sick). Ill : anglais britannique courant = être malade.",
      exemple:
        "✅ I am sick (US) / I am ill (UK) = je suis malade. I feel sick = j'ai envie de vomir.",
      piege:
        "Sick ≠ toujours 'malade'. 'I feel sick' peut vouloir dire 'j'ai la nausée' en anglais britannique.",
      astuce:
        "UK : ill = malade. US : sick = malade. Les deux : feel sick = avoir la nausée. Nuance importante !",
    },
  },
];

export default function SanteSportPage() {
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
          <div className="lecon-badge">🏃 Anglais — 5ème</div>
          <h1 className="lecon-titre">Santé & sport</h1>
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
            Apprends le vocabulaire de la <strong>santé et du sport</strong> en
            anglais : maux, blessures, alimentation, activité physique.
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
              <div className="lecon-point-titre">🤒 Santé & maux</div>
              <div className="lecon-point-texte">
                I have a headache/stomachache. My back hurts. Be fit (en forme).
                Be ill/sick (malade). Balanced diet (alimentation équilibrée).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I have a
                headache. She is very fit. Eat a balanced diet.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚽ Verbes de sport</div>
              <div className="lecon-point-texte">
                DO sport (général). PLAY + ballon (football, tennis). GO + -ing
                (swimming, running, cycling).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She plays
                tennis. He goes swimming. They do yoga.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">💪 Conseils de santé</div>
              <div className="lecon-point-texte">
                Should = conseil (tu devrais). Warm up before exercise. Cool
                down after. Get enough sleep.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> You should
                exercise regularly. Always warm up before sport.
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
