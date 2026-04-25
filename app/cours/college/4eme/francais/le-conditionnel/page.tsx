"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "le-conditionnel";

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
    question: "Comment se forme le conditionnel présent ?",
    options: [
      "Radical du futur + terminaisons de l'imparfait",
      "Radical de l'imparfait + terminaisons du futur",
      "Infinitif + terminaisons du présent",
      "Radical du présent + terminaisons de l'imparfait",
    ],
    answer: "Radical du futur + terminaisons de l'imparfait",
    fiche: {
      regle:
        "Conditionnel présent = radical du futur + terminaisons de l'imparfait (-ais, -ais, -ait, -ions, -iez, -aient). Ex : aimer → aimer- + -ais = j'aimerais.",
      exemple:
        "✅ Aimer : j'aimerais, tu aimerais, il aimerait, nous aimerions, vous aimeriez, ils aimeraient.",
      piege:
        "Le radical est celui du FUTUR (pas de l'infinitif pour les irréguliers). Aller → ir- (futur). Avoir → aur-. Être → ser-.",
      astuce:
        "Conditionnel = futur + imparfait. Même radical que le futur. Mêmes terminaisons que l'imparfait. Deux en un !",
    },
  },
  {
    question:
      "Quelle est la terminaison du conditionnel présent pour 'il/elle' ?",
    options: ["-ait", "-ait", "-ait", "Toutes les réponses sont identiques"],
    answer: "Toutes les réponses sont identiques",
    fiche: {
      regle:
        "Terminaisons du conditionnel présent : je -ais, tu -ais, il/elle -ait, nous -ions, vous -iez, ils/elles -aient. Identiques à celles de l'imparfait.",
      exemple:
        "✅ Je chanterais, tu chanterais, il chanterait, nous chanterions, vous chanteriez, ils chanteraient.",
      piege:
        "Ne pas confondre conditionnel (-rait) et futur (-ra). 'Il chantera' = futur. 'Il chanterait' = conditionnel.",
      astuce:
        "Futur : -ai, -as, -a, -ons, -ez, -ont. Conditionnel : -ais, -ais, -ait, -ions, -iez, -aient. Le R est commun !",
    },
  },
  {
    question: "Dans quelle phrase le conditionnel exprime-t-il une hypothèse ?",
    options: [
      "Je voudrais un café.",
      "Si j'avais de l'argent, j'achèterais une voiture.",
      "Il faudrait partir plus tôt.",
      "Tu pourrais m'aider ?",
    ],
    answer: "Si j'avais de l'argent, j'achèterais une voiture.",
    fiche: {
      regle:
        "L'hypothèse irréelle : Si + imparfait → conditionnel présent. C'est la structure classique du conditionnel hypothétique.",
      exemple:
        "✅ Si j'avais du temps, je voyagerais. Si elle travaillait plus, elle réussirait. Si + imparfait → conditionnel.",
      piege:
        "Ne JAMAIS mettre le conditionnel dans la proposition avec 'si' ! 'Si j'aurais' → FAUX. 'Si j'avais' → CORRECT.",
      astuce:
        "Si + IMPARFAIT → CONDITIONNEL. Retiens : jamais de conditionnel après 'si'. C'est la règle d'or !",
    },
  },
  {
    question:
      "Quel emploi du conditionnel reconnaît-on dans : 'Vous pourriez fermer la fenêtre ?'",
    options: [
      "Une hypothèse",
      "Une politesse/atténuation",
      "Un souhait",
      "Une information non vérifiée",
    ],
    answer: "Une politesse/atténuation",
    fiche: {
      regle:
        "Le conditionnel de politesse atténue une demande directe. 'Pouvez-vous ?' (direct) → 'Pourriez-vous ?' (poli). Très utilisé dans les formules de politesse.",
      exemple:
        "✅ Je voudrais un café. (plus poli que 'je veux'). Pourriez-vous m'aider ? Tu pourrais te taire ?",
      piege:
        "Ce n'est pas une hypothèse ici ! C'est juste une façon polie de demander quelque chose.",
      astuce:
        "Conditionnel de politesse = plus gentil, moins brusque. Je veux → je voudrais. Peux-tu → pourrais-tu.",
    },
  },
  {
    question:
      "Identifie l'emploi du conditionnel : 'Selon les médias, il serait arrêté.'",
    options: [
      "Hypothèse",
      "Politesse",
      "Souhait",
      "Fait non vérifié (journalistique)",
    ],
    answer: "Fait non vérifié (journalistique)",
    fiche: {
      regle:
        "Le conditionnel journalistique exprime une information non confirmée, dont on n'est pas sûr. Il prend ses distances par rapport à l'information. 'Selon des sources, il serait...'",
      exemple:
        "✅ 'Le président serait malade.' 'Il y aurait plusieurs victimes.' Le journaliste n'est pas sûr : il utilise le conditionnel.",
      piege:
        "Ce n'est pas une hypothèse avec 'si' ! C'est une information non vérifiée. Nuance importante.",
      astuce:
        "Conditionnel journalistique = 'selon des sources' = pas sûr. Très utilisé dans les médias pour se protéger !",
    },
  },
  {
    question:
      "Conjugue au conditionnel présent : 'Être' à la 1ère personne du singulier.",
    options: ["J'étais", "Je serai", "Je serais", "Je sois"],
    answer: "Je serais",
    fiche: {
      regle:
        "Être est irrégulier au futur/conditionnel. Futur : je serai. Conditionnel : je serais. Radical : ser-. Terminaison : -ais.",
      exemple:
        "✅ Je serais, tu serais, il serait, nous serions, vous seriez, ils seraient.",
      piege:
        "'J'étais' = imparfait. 'Je serai' = futur. 'Je serais' = conditionnel. Bien distinguer les trois !",
      astuce:
        "Être : futur = ser + ai/as/a... Conditionnel = ser + ais/ais/ait... Même radical 'ser', terminaisons différentes.",
    },
  },
  {
    question: "Comment se forme le conditionnel passé ?",
    options: [
      "Conditionnel présent de 'avoir' ou 'être' + participe passé",
      "Imparfait de 'avoir' ou 'être' + participe passé",
      "Futur de 'avoir' ou 'être' + participe passé",
      "Présent de 'avoir' ou 'être' + participe passé",
    ],
    answer: "Conditionnel présent de 'avoir' ou 'être' + participe passé",
    fiche: {
      regle:
        "Conditionnel passé = auxiliaire (avoir/être) au conditionnel présent + participe passé. Exprime une hypothèse dans le passé.",
      exemple:
        "✅ J'aurais mangé. Elle serait partie. Ils auraient pu. Si j'avais su, j'aurais agi différemment.",
      piege:
        "Conditionnel passé = auxiliaire au CONDITIONNEL (pas imparfait). 'J'aurais' (conditionnel) + mangé ≠ 'J'avais' (imparfait) + mangé.",
      astuce:
        "Conditionnel passé = aurais/serais + PP. 'J'aurais mangé' = je l'aurais fait mais je ne l'ai pas fait.",
    },
  },
  {
    question: "Dans quelle structure utilise-t-on le conditionnel passé ?",
    options: [
      "Si + présent → conditionnel passé",
      "Si + imparfait → conditionnel passé",
      "Si + plus-que-parfait → conditionnel passé",
      "Si + futur → conditionnel passé",
    ],
    answer: "Si + plus-que-parfait → conditionnel passé",
    fiche: {
      regle:
        "Hypothèse dans le passé : Si + plus-que-parfait → conditionnel passé. 'Si j'avais su' = plus-que-parfait. 'J'aurais agi' = conditionnel passé.",
      exemple:
        "✅ Si j'avais étudié, j'aurais réussi. Si elle était partie plus tôt, elle aurait attrapé le train.",
      piege:
        "Trois structures conditionnelles : Si + présent → futur. Si + imparfait → conditionnel présent. Si + PQP → conditionnel passé.",
      astuce:
        "3 structures : présent→futur / imparfait→conditionnel présent / plus-que-parfait→conditionnel passé. Du plus réel au plus hypothétique !",
    },
  },
  {
    question: "Identifie le temps dans : 'Il aurait voulu te parler.'",
    options: [
      "Conditionnel présent",
      "Conditionnel passé",
      "Plus-que-parfait",
      "Futur antérieur",
    ],
    answer: "Conditionnel passé",
    fiche: {
      regle:
        "Conditionnel passé = 'aurait/serait' + participe passé. 'Il aurait voulu' = conditionnel passé. Exprime un regret, une hypothèse passée non réalisée.",
      exemple:
        "✅ Il aurait voulu = il voulait mais ne l'a pas fait (regret). Il aurait dû partir. Elle serait partie si...",
      piege:
        "'Il aurait voulu' ≠ 'Il avait voulu' (plus-que-parfait). La différence : aurait (conditionnel) vs avait (imparfait).",
      astuce:
        "Conditionnel passé = aurait/serait + PP. Exprime regret ou hypothèse passée non réalisée.",
    },
  },
  {
    question: "Dans quelle phrase le conditionnel exprime-t-il un souhait ?",
    options: [
      "Si j'avais de l'argent, j'achèterais une maison.",
      "Je voudrais voyager autour du monde.",
      "Il serait arrêté, selon les témoins.",
      "Pourriez-vous me passer le sel ?",
    ],
    answer: "Je voudrais voyager autour du monde.",
    fiche: {
      regle:
        "Le conditionnel de souhait exprime un désir, un rêve. Souvent avec 'vouloir', 'aimer', 'souhaiter' au conditionnel.",
      exemple:
        "✅ Je voudrais devenir médecin. J'aimerais voyager. Il souhaiterait te rencontrer. Exprime un rêve ou désir.",
      piege:
        "Souhait ≠ hypothèse ≠ politesse. Le souhait = désir personnel sans condition explicite.",
      astuce:
        "Souhait : je voudrais, j'aimerais, je souhaiterais. Politesse : pourriez-vous. Hypothèse : si + imparfait.",
    },
  },
];

export default function LeConditionnelPage() {
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
          <div className="lecon-badge">⚡ Français — 4ème</div>
          <h1 className="lecon-titre">Le conditionnel</h1>
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
            Le <strong>conditionnel</strong> exprime l'hypothèse, le souhait, la
            politesse et le fait non vérifié. Maîtrise ses formes présent et
            passé.
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
              <div className="lecon-point-titre">🔨 Formation</div>
              <div className="lecon-point-texte">
                Conditionnel présent = radical futur + terminaisons imparfait
                (-ais, -ais, -ait, -ions, -iez, -aient). Conditionnel passé =
                aurait/serait + participe passé.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> J'aimerais. Il
                aurait voulu. Nous serions partis.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎯 Emplois</div>
              <div className="lecon-point-texte">
                Hypothèse (si + imparfait → conditionnel). Souhait (je
                voudrais). Politesse (pourriez-vous ?). Fait non vérifié (il
                serait arrêté).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Si j'avais le
                temps, je voyagerais. (hypothèse).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ La règle d'or</div>
              <div className="lecon-point-texte">
                JAMAIS de conditionnel après 'si' ! Si + présent → futur. Si +
                imparfait → conditionnel présent. Si + plus-que-parfait →
                conditionnel passé.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Si j'aurais' →
                FAUX. 'Si j'avais' → CORRECT.
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
                  {estCorrecte ? "Bravo !" : "Pas tout à fait..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellente réponse !"
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
                      😅 6 erreurs !
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
                    📖 Voir la fiche pédagogique
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
        ? "Excellent travail !"
        : pourcentage >= 60
          ? "Bien joué !"
          : "Continue à t'entraîner !";
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
