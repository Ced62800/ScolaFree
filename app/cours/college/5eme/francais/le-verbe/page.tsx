"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "le-verbe";

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
    question: "Comment identifier le verbe dans une phrase ?",
    options: [
      "C'est le mot le plus long",
      "C'est le mot qui se conjugue et varie avec le temps et la personne",
      "C'est toujours le premier mot",
      "C'est le mot qui désigne une action physique",
    ],
    answer:
      "C'est le mot qui se conjugue et varie avec le temps et la personne",
    fiche: {
      regle:
        "Le verbe est le mot qui se conjugue : il varie selon la personne (je, tu, il...) et le temps (présent, passé, futur). Il exprime une action ou un état.",
      exemple:
        "✅ 'Les enfants jouent.' → joue-nt (3ème personne pluriel présent). 'Il jouait' → jouait (3ème sg. imparfait).",
      piege:
        "Un verbe à l'infinitif (manger, courir) ne se conjugue pas. Il n'est pas le verbe conjugué de la phrase.",
      astuce:
        "Teste si le mot change avec 'je, tu, il' et avec hier/demain. Si oui = verbe conjugué !",
    },
  },
  {
    question: "À quel groupe appartient le verbe 'finir' ?",
    options: ["1er groupe", "2ème groupe", "3ème groupe", "Verbe irrégulier"],
    answer: "2ème groupe",
    fiche: {
      regle:
        "2ème groupe = verbes en -IR dont le participe présent se termine en -ISSANT. Ex: finir → finissant. 1er groupe = verbes en -ER (sauf aller). 3ème groupe = tous les autres.",
      exemple:
        "✅ Finir → finissant → 2ème groupe. Chanter → chantant → 1er groupe. Partir → partant → 3ème groupe.",
      piege:
        "Tous les verbes en -ir ne sont pas du 2ème groupe ! Partir, venir, tenir sont du 3ème groupe.",
      astuce:
        "2ème groupe = -IR + -ISSANT. Finir (finissant ✅), grandir (grandissant ✅), MAIS partir (partant ❌ = 3ème groupe).",
    },
  },
  {
    question: "Qu'est-ce qu'un verbe d'état ?",
    options: [
      "Un verbe qui exprime une action physique",
      "Un verbe qui relie le sujet à un attribut",
      "Un verbe au passé",
      "Un verbe à l'infinitif",
    ],
    answer: "Un verbe qui relie le sujet à un attribut",
    fiche: {
      regle:
        "Les verbes d'état relient le sujet à son attribut. Principaux verbes d'état : être, paraître, sembler, devenir, rester, demeurer, avoir l'air.",
      exemple:
        "✅ 'Il est grand.' → est = verbe d'état, grand = attribut du sujet. 'Elle semble fatiguée.' → semble = verbe d'état.",
      piege:
        "'Avoir' n'est pas toujours un verbe d'état. 'Il a faim' = verbe d'action. Mais 'avoir l'air' = verbe d'état.",
      astuce:
        "Verbe d'état = ÊTRE et ses synonymes (paraître, sembler, devenir, rester, demeurer). Ils précèdent un attribut.",
    },
  },
  {
    question: "Quelle est la fonction du verbe dans la phrase ?",
    options: [
      "Sujet",
      "Prédicat (noyau du groupe verbal)",
      "Complément d'objet",
      "Attribut du sujet",
    ],
    answer: "Prédicat (noyau du groupe verbal)",
    fiche: {
      regle:
        "Le verbe conjugué est le noyau du groupe verbal (GV), aussi appelé prédicat. C'est l'élément central de la phrase qui exprime ce que fait ou est le sujet.",
      exemple:
        "✅ 'Les élèves [travaillent dur].' → travaillent = noyau du GV. La phrase tourne autour du verbe.",
      piege:
        "Le verbe n'est pas sujet. C'est le sujet qui fait l'action du verbe, pas l'inverse.",
      astuce:
        "Dans toute phrase, cherche le verbe en premier → puis le sujet (qui fait l'action ?) → puis les compléments.",
    },
  },
  {
    question: "Qu'est-ce que la voix passive ?",
    options: [
      "Quand le sujet fait l'action",
      "Quand le sujet subit l'action",
      "Quand le verbe est à l'infinitif",
      "Quand il n'y a pas de sujet",
    ],
    answer: "Quand le sujet subit l'action",
    fiche: {
      regle:
        "À la voix passive, le sujet subit l'action. La forme est : auxiliaire ÊTRE + participe passé. Le complément d'agent indique qui fait l'action (introduit par 'par' ou 'de').",
      exemple:
        "✅ Voix active : 'Le chat mange la souris.' Voix passive : 'La souris est mangée par le chat.' Sujet = la souris (subit l'action).",
      piege:
        "Ne pas confondre voix passive (être + PP) et temps composés (avoir + PP). 'Il est arrivé' ≠ passif.",
      astuce:
        "Passif = sujet SUBIT. Actif = sujet FAIT. La souris EST MANGÉE (passif). Le chat MANGE (actif).",
    },
  },
  {
    question: "Comment se forme la voix passive ?",
    options: [
      "Auxiliaire avoir + participe passé",
      "Auxiliaire être + participe passé",
      "Verbe modal + infinitif",
      "Verbe pronominal",
    ],
    answer: "Auxiliaire être + participe passé",
    fiche: {
      regle:
        "La voix passive se forme avec : auxiliaire ÊTRE (conjugué au temps voulu) + participe passé du verbe (accordé avec le sujet).",
      exemple:
        "✅ 'La lettre est écrite par Marie.' = est (être au présent) + écrite (PP accordé avec lettre, fém. sg.).",
      piege:
        "Le PP s'accorde avec le SUJET (pas le complément d'agent). 'Les lettres SONT ÉCRITES' → écrites s'accorde avec lettres.",
      astuce:
        "Passif = ÊTRE + PP. Le PP s'accorde avec le sujet. La souris est manGÉE (fém. sg. comme souris).",
    },
  },
  {
    question: "Qu'est-ce que le mode subjonctif ?",
    options: [
      "Un temps du passé",
      "Un mode qui exprime le doute, le souhait, la nécessité",
      "Un mode utilisé pour les ordres",
      "Un mode du futur",
    ],
    answer: "Un mode qui exprime le doute, le souhait, la nécessité",
    fiche: {
      regle:
        "Le subjonctif est un mode (pas un temps) qui exprime le doute, le souhait, la crainte, la nécessité, le regret. Il est souvent introduit par 'que'.",
      exemple:
        "✅ 'Il faut que tu viennes.' (nécessité). 'Je veux qu'il parte.' (souhait). 'Bien qu'il fasse froid...' (concession).",
      piege:
        "Le subjonctif n'est pas un temps mais un MODE. Il a son propre présent et imparfait.",
      astuce:
        "Subjonctif = mode du DOUTE et du SOUHAIT. Après 'il faut que', 'vouloir que', 'bien que' → subjonctif !",
    },
  },
  {
    question:
      "Conjuguez 'aller' à la 1ère personne du singulier du présent de l'indicatif.",
    options: ["j'alle", "je vais", "j'allais", "j'irai"],
    answer: "je vais",
    fiche: {
      regle:
        "Aller est un verbe très irrégulier du 3ème groupe. Présent : je vais, tu vas, il va, nous allons, vous allez, ils vont.",
      exemple:
        "✅ Je vais au cinéma. Tu vas bien ? Il va partir. Nous allons marcher.",
      piege:
        "Ne jamais dire 'j'alle' — aller est très irrégulier au présent. Je VAIS (pas je alle).",
      astuce:
        "ALLER au présent : je VAIS, tu VAS, il VA, nous ALL-ONS, vous ALL-EZ, ils VONT. Trois radicaux différents !",
    },
  },
  {
    question: "Quel est le mode de 'mange' dans 'Mange tes légumes !' ?",
    options: ["Indicatif", "Subjonctif", "Impératif", "Conditionnel"],
    answer: "Impératif",
    fiche: {
      regle:
        "L'impératif est le mode qui exprime un ordre, un conseil ou une demande. Il ne se conjugue qu'à 3 personnes : 2ème sg., 1ère pl., 2ème pl. Il n'a pas de sujet exprimé.",
      exemple:
        "✅ 'Mange !' (2ème sg.), 'Mangeons !' (1ère pl.), 'Mangez !' (2ème pl.). Pas de pronom sujet !",
      piege:
        "À la 2ème personne du singulier, les verbes du 1er groupe perdent le -s de l'indicatif : 'Tu manges' → 'Mange !' (pas 'Manges !').",
      astuce:
        "Impératif = ordre sans sujet. Mange ! (pas Tu mange). Particularité : 1er groupe → pas de -s : Mange (pas Manges) !",
    },
  },
  {
    question: "Qu'est-ce qu'un verbe pronominal ?",
    options: [
      "Un verbe sans sujet",
      "Un verbe accompagné d'un pronom réfléchi (me, te, se, nous, vous)",
      "Un verbe au passif",
      "Un verbe à l'infinitif",
    ],
    answer: "Un verbe accompagné d'un pronom réfléchi (me, te, se, nous, vous)",
    fiche: {
      regle:
        "Un verbe pronominal est accompagné d'un pronom réfléchi de la même personne que le sujet : me, te, se, nous, vous. Ex: se laver, se souvenir, s'appeler.",
      exemple:
        "✅ 'Je me lave.' (me = 1ère sg.), 'Il se souvient.' (se = 3ème sg.), 'Nous nous promenons.' (nous = 1ère pl.).",
      piege:
        "Aux temps composés, les verbes pronominaux se conjuguent avec ÊTRE. 'Elle s'est lavée.' (être + PP accordé).",
      astuce:
        "Pronominal = pronom réfléchi MÊME personne que sujet. Je ME lave. Tu TE laves. Il SE lave.",
    },
  },
];

export default function LeVerbePage() {
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
          <div className="lecon-badge">⏰ Français — 5ème</div>
          <h1 className="lecon-titre">Le verbe</h1>
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
            En 5ème, tu approfondis l'étude du <strong>verbe</strong> : groupes,
            modes, voix active/passive et verbes pronominaux.
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
              <div className="lecon-point-titre">📚 Les groupes de verbes</div>
              <div className="lecon-point-texte">
                1er groupe : -ER (chanter). 2ème groupe : -IR + -ISSANT
                (finir/finissant). 3ème groupe : tous les autres (partir, venir,
                aller...).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Finir
                (finissant) = 2ème groupe. Partir (partant) = 3ème groupe.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Voix active et passive</div>
              <div className="lecon-point-texte">
                Active : sujet fait l'action. Passive : sujet subit l'action
                (être + PP). Le complément d'agent introduit par 'par'.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Le chat mange
                la souris (actif) → La souris est mangée par le chat (passif).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎭 Les modes verbaux</div>
              <div className="lecon-point-texte">
                Indicatif (faits réels), impératif (ordres), subjonctif
                (doute/souhait), conditionnel (hypothèse), infinitif, participe.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il faut que tu
                viennes' → subjonctif. 'Mange !' → impératif.
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
                  📖 Lis la fiche pour débloquer la question suivante !
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
                📖 Mode découverte (5 questions). Inscris-toi pour les 10
                questions !
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
