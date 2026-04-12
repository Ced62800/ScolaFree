"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "subjonctif";

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
    question: "Dans quelle phrase le subjonctif est-il correctement utilisé ?",
    options: [
      "Je veux que tu viens demain.",
      "Je veux que tu viennes demain.",
      "Je veux que tu viendras demain.",
      "Je veux que tu es venu demain.",
    ],
    answer: "Je veux que tu viennes demain.",
    fiche: {
      regle:
        "Après 'vouloir que', on utilise toujours le subjonctif présent. La conjonction 'que' introduit une subordonnée au subjonctif quand le verbe principal exprime un souhait, une volonté ou un sentiment.",
      exemple:
        "✅ Je veux que tu viennes. Je souhaite qu'il parte. Il faut que nous soyons là.",
      piege:
        "Après 'vouloir que', on ne met jamais l'indicatif. 'Je veux que tu viens' est incorrect. Le subjonctif est obligatoire.",
      astuce:
        "Vouloir que + subjonctif. Souhaiter que + subjonctif. Toujours ! 'Que' + volonté = subjonctif.",
    },
  },
  {
    question:
      "Quelle est la conjugaison correcte de 'être' au subjonctif présent avec 'que nous' ?",
    options: [
      "que nous étions",
      "que nous soyons",
      "que nous sommes",
      "que nous serons",
    ],
    answer: "que nous soyons",
    fiche: {
      regle:
        "Le verbe 'être' est irrégulier au subjonctif : que je sois, que tu sois, qu'il soit, que nous soyons, que vous soyez, qu'ils soient. Il faut l'apprendre par coeur.",
      exemple:
        "✅ Il faut que nous soyons ponctuels. Je veux que vous soyez prêts. Bien que tu sois fatigué.",
      piege:
        "'Que nous étions' est l'imparfait de l'indicatif, pas le subjonctif. 'Que nous soyons' est le subjonctif présent.",
      astuce:
        "Etre au subjonctif = soi- (je/tu/il/ils) et soy- (nous/vous). Sois, sois, soit, soyons, soyez, soient.",
    },
  },
  {
    question: "Quelle conjonction introduit obligatoirement le subjonctif ?",
    options: ["parce que", "bien que", "pendant que", "depuis que"],
    answer: "bien que",
    fiche: {
      regle:
        "Certaines conjonctions imposent toujours le subjonctif : bien que, quoique, pour que, afin que, avant que, à moins que, pourvu que, bien que. D'autres imposent l'indicatif : parce que, pendant que, depuis que, quand.",
      exemple:
        "✅ Bien qu'il soit malade, il travaille. Pour que tu réussisses, travaille. Avant qu'il parte, dis-lui.",
      piege:
        "'Parce que', 'pendant que', 'depuis que' sont suivis de l'indicatif. Ne pas confondre avec les conjonctions de subjonctif !",
      astuce:
        "Bien que / quoique / pour que / afin que / avant que = toujours subjonctif. Parce que / quand / depuis que = toujours indicatif.",
    },
  },
  {
    question: "Conjugue 'avoir' au subjonctif présent : 'Il faut que tu ___'",
    options: ["as", "aies", "avais", "auras"],
    answer: "aies",
    fiche: {
      regle:
        "Le verbe 'avoir' est irrégulier au subjonctif : que j'aie, que tu aies, qu'il ait, que nous ayons, que vous ayez, qu'ils aient. A apprendre par coeur comme 'être'.",
      exemple:
        "✅ Il faut que tu aies de la patience. Je veux qu'il ait confiance. Bien qu'elle ait raison.",
      piege:
        "'Tu as' = indicatif présent. 'Tu aies' = subjonctif présent. Le -e final et le -i- caractérisent le subjonctif.",
      astuce:
        "Avoir au subjonctif : aie, aies, ait, ayons, ayez, aient. Retiens : ai- devient ay- avec nous et vous.",
    },
  },
  {
    question: "Dans quelle situation utilise-t-on le subjonctif ?",
    options: [
      "Pour raconter un fait certain dans le passé",
      "Pour exprimer un doute, un souhait, une obligation ou un sentiment",
      "Pour décrire une action habituelle",
      "Pour parler du futur uniquement",
    ],
    answer:
      "Pour exprimer un doute, un souhait, une obligation ou un sentiment",
    fiche: {
      regle:
        "Le subjonctif exprime : la volonté (vouloir que), le souhait (souhaiter que), le doute (douter que), la crainte (avoir peur que), l'obligation (il faut que), le sentiment (être content que, regretter que).",
      exemple:
        "✅ Il faut qu'il parte (obligation). Je doute qu'il vienne (doute). Je suis content qu'elle soit là (sentiment). Je souhaite que tu réussisses (souhait).",
      piege:
        "L'indicatif exprime des faits réels et certains. Le subjonctif exprime des faits envisagés, souhaités, douteux ou ressentis.",
      astuce:
        "Subjonctif = DOVE : Doute, Obligation, Volonté, Emotion/sentiment. Si la phrase exprime l'un de ces 4 éléments = subjonctif.",
    },
  },
  {
    question: "Conjugue 'aller' au subjonctif présent : 'Je veux qu'il ___'",
    options: ["va", "aille", "allait", "ira"],
    answer: "aille",
    fiche: {
      regle:
        "Le verbe 'aller' est irrégulier au subjonctif : que j'aille, que tu ailles, qu'il aille, que nous allions, que vous alliez, qu'ils aillent.",
      exemple:
        "✅ Je veux qu'il aille chez le médecin. Il faut que tu ailles voir ça. Bien qu'ils aillent vite.",
      piege:
        "'Il va' = indicatif présent. 'Il aille' = subjonctif présent. Le double -l- et le -e final caractérisent le subjonctif d'aller.",
      astuce:
        "Aller au subjonctif : aille, ailles, aille, allions, alliez, aillent. Retiens : aill- (je/tu/il/ils) et all- (nous/vous).",
    },
  },
  {
    question: "Quelle phrase contient un subjonctif passé ?",
    options: [
      "Je veux qu'il vienne.",
      "Il faut que tu sois parti avant midi.",
      "Bien qu'elle soit courageuse.",
      "Pour que nous partions ensemble.",
    ],
    answer: "Il faut que tu sois parti avant midi.",
    fiche: {
      regle:
        "Le subjonctif passé se forme avec l'auxiliaire 'être' ou 'avoir' au subjonctif présent + participe passé. Il exprime une action achevée dans la subordonnée subjonctive.",
      exemple:
        "✅ Il faut que tu sois parti (subjonctif passé). Je suis content qu'il ait reussi. Bien qu'elle soit arrivee en retard.",
      piege:
        "Subjonctif passé ≠ subjonctif présent. Présent : qu'il vienne. Passé : qu'il soit venu. L'auxiliaire (soit/ait) + participe passé = passé.",
      astuce:
        "Subjonctif passé = avoir/être au subjonctif + participe passé. Comme le passé composé, mais avec l'auxiliaire au subjonctif.",
    },
  },
  {
    question:
      "Laquelle de ces expressions est suivie de l'indicatif (pas du subjonctif) ?",
    options: ["il faut que", "je pense que", "bien que", "pour que"],
    answer: "je pense que",
    fiche: {
      regle:
        "Les verbes d'opinion à la forme affirmative (penser que, croire que, estimer que, trouver que) sont suivis de l'indicatif car ils expriment une certitude relative. A la forme négative ou interrogative, le subjonctif est possible.",
      exemple:
        "✅ Je pense qu'il viendra (indicatif). Je ne pense pas qu'il vienne (subjonctif). Crois-tu qu'il soit honnête ? (subjonctif possible).",
      piege:
        "Je pense que + indicatif (affirmatif). Je ne pense pas que + subjonctif (négatif). La forme (affirmatif/négatif) change tout !",
      astuce:
        "Penser/croire/trouver que = indicatif si affirmatif. Subjonctif possible si négatif ou interrogatif. L'affirmation = certitude = indicatif.",
    },
  },
  {
    question: "Conjugue 'faire' au subjonctif présent : 'Il faut que vous ___'",
    options: ["faites", "fassiez", "feriez", "faisiez"],
    answer: "fassiez",
    fiche: {
      regle:
        "Le verbe 'faire' est irrégulier au subjonctif : que je fasse, que tu fasses, qu'il fasse, que nous fassions, que vous fassiez, qu'ils fassent.",
      exemple:
        "✅ Il faut que vous fassiez attention. Je veux qu'il fasse son travail. Bien que nous fassions des efforts.",
      piege:
        "'Vous faites' = indicatif. 'Vous fassiez' = subjonctif. Le radical fass- (avec double -s-) caractérise le subjonctif de faire.",
      astuce:
        "Faire au subjonctif : fasse, fasses, fasse, fassions, fassiez, fassent. Radical : fass- avec double s. A ne pas confondre avec 'faites' (indicatif).",
    },
  },
  {
    question:
      "Pourquoi dit-on 'avant qu'il parte' et non 'avant qu'il partira' ?",
    options: [
      "Parce que 'avant que' est une conjonction de temps qui impose l'indicatif",
      "Parce que 'avant que' impose toujours le subjonctif",
      "Parce que le futur est interdit après 'avant'",
      "Parce que 'partir' est un verbe irrégulier",
    ],
    answer: "Parce que 'avant que' impose toujours le subjonctif",
    fiche: {
      regle:
        "La conjonction 'avant que' impose toujours le subjonctif, car elle exprime une action qui n'a pas encore eu lieu (hypothétique, envisagée). En revanche, 'après que' impose normalement l'indicatif.",
      exemple:
        "✅ Avant qu'il parte (subjonctif). Avant que tu arrives (subjonctif). Après qu'il est parti (indicatif — mais le subjonctif est souvent entendu par erreur).",
      piege:
        "Avant que = subjonctif. Après que = indicatif (en théorie). C'est une erreur très fréquente de mettre le subjonctif après 'après que'.",
      astuce:
        "Avant que = avant que l'action n'arrive = incertain = subjonctif. Après que = l'action est accomplie = certain = indicatif.",
    },
  },
];

export default function SubjonctifPage() {
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
          <div className="lecon-badge">⚡ Français — 3ème</div>
          <h1 className="lecon-titre">Le subjonctif</h1>
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
            En 3ème, tu maitrises le <strong>subjonctif</strong> : ses emplois
            (volonté, doute, sentiment, obligation), les conjonctions qui
            l'imposent, et la conjugaison des verbes irréguliers.
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
                🎯 Quand utiliser le subjonctif ?
              </div>
              <div className="lecon-point-texte">
                DOVE : Doute, Obligation, Volonté, Emotion. Il faut que, vouloir
                que, bien que, pour que, avant que imposent le subjonctif.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Il faut que tu
                viennes. Je veux qu'il parte. Bien qu'elle soit fatiguée.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📝 Verbes irréguliers au subjonctif
              </div>
              <div className="lecon-point-texte">
                Etre : sois, sois, soit, soyons, soyez, soient. Avoir : aie,
                aies, ait, ayons, ayez, aient. Aller : aille. Faire : fasse.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> que tu sois,
                que tu aies, qu'il aille, que vous fassiez.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ⚠️ Indicatif ou subjonctif ?
              </div>
              <div className="lecon-point-texte">
                Penser que + indicatif (affirmatif). Ne pas penser que +
                subjonctif. Apres que + indicatif. Avant que + subjonctif.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Je pense qu'il
                viendra (indicatif). Avant qu'il parte (subjonctif). Apres qu'il
                est parti (indicatif).
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
