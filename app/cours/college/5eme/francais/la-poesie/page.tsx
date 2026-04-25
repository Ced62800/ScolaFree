"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "la-poesie";

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
    question: "Qu'est-ce qu'une métaphore ?",
    options: [
      "Une comparaison avec 'comme'",
      "Une comparaison sans mot comparatif",
      "Une répétition de sons",
      "Une question sans réponse",
    ],
    answer: "Une comparaison sans mot comparatif",
    fiche: {
      regle:
        "La métaphore est une figure de style qui compare deux éléments SANS mot comparatif (comme, tel, ainsi que...). Elle affirme directement que A est B.",
      exemple:
        "✅ Métaphore : 'La vie est un voyage.' (pas de 'comme'). Comparaison : 'La vie est COMME un voyage.'",
      piege:
        "Métaphore ≠ comparaison. La comparaison utilise 'comme', 'tel', 'pareil à'. La métaphore, non.",
      astuce:
        "Métaphore = comparaison SANS 'comme'. Comparaison = comparaison AVEC 'comme'. Retiens la différence !",
    },
  },
  {
    question: "Combien de syllabes compte un alexandrin ?",
    options: ["8 syllabes", "10 syllabes", "12 syllabes", "14 syllabes"],
    answer: "12 syllabes",
    fiche: {
      regle:
        "L'alexandrin est le vers classique français à 12 syllabes. Il est souvent coupé en deux hémistiches de 6 syllabes par une césure.",
      exemple:
        "✅ 'Je-fais-sou-vent-ce-rêve / é-trange-et-pé-né-trant' = 6+6 = 12 syllabes (Verlaine).",
      piege:
        "Ne pas oublier de compter le 'e' muet : 'étran-ge' = 2 syllabes si suivi d'une consonne.",
      astuce:
        "Alexan-drin = 12. Pensez à Alexandre le Grand et ses 12 travaux... non, c'est Hercule ! Mais 12 = alexandrin.",
    },
  },
  {
    question: "Qu'est-ce qu'une allitération ?",
    options: [
      "La répétition d'une même voyelle",
      "La répétition d'une même consonne",
      "Une rime en fin de vers",
      "Une métaphore filée",
    ],
    answer: "La répétition d'une même consonne",
    fiche: {
      regle:
        "L'allitération est la répétition d'un même son consonantique dans des mots proches. Elle crée un effet musical ou expressif.",
      exemple:
        "✅ 'Pour qui sont ces serpents qui sifflent sur vos têtes ?' (Racine) → répétition du son [s].",
      piege:
        "Allitération = consonne. Assonance = voyelle. Ne pas les confondre !",
      astuce:
        "Allitération = lettres. A comme Allitération, A comme Après (consonne). Assonance = voyelle = A, E, I, O, U.",
    },
  },
  {
    question: "Qu'appelle-t-on la 'rime embrassée' ?",
    options: ["ABAB", "ABBA", "AABB", "ABCD"],
    answer: "ABBA",
    fiche: {
      regle:
        "La rime embrassée suit le schéma ABBA : la rime extérieure 'embrasse' la rime intérieure. Comme deux bras qui encerclent.",
      exemple:
        "✅ ABBA : 'nuit(A) / silence(B) / souvenance(B) / bruit(A)' — la rime A embrasse la rime B.",
      piege:
        "ABAB = rime croisée. AABB = rime suivie. ABBA = rime embrassée. Trois schémas différents !",
      astuce:
        "Embrassée = ABBA. Pensez à ABBA le groupe de musique ! Croisée = ABAB. Suivie = AABB.",
    },
  },
  {
    question: "Qu'est-ce qu'une personnification ?",
    options: [
      "Comparer une personne à un animal",
      "Donner des caractéristiques humaines à un objet ou animal",
      "Décrire un personnage en détail",
      "Exagérer les qualités d'un héros",
    ],
    answer: "Donner des caractéristiques humaines à un objet ou animal",
    fiche: {
      regle:
        "La personnification attribue des caractéristiques humaines (sentiments, actions, paroles) à des objets inanimés, des animaux ou des idées abstraites.",
      exemple:
        "✅ 'Le vent gémit dans les arbres.' → le vent ne peut pas gémir, c'est une personnification.",
      piege:
        "Personnification ≠ métaphore. Une personnification est une métaphore particulière qui humanise quelque chose.",
      astuce:
        "Personnification = rendre PERSONNE ce qui n'est pas humain. Le soleil sourit, la mer chante, la nuit murmure...",
    },
  },
  {
    question: "Qu'est-ce qu'une hyperbole ?",
    options: [
      "Une litote (en dire moins)",
      "Une exagération volontaire pour créer un effet",
      "Une comparaison avec la nature",
      "Une répétition de mots",
    ],
    answer: "Une exagération volontaire pour créer un effet",
    fiche: {
      regle:
        "L'hyperbole est une figure qui consiste à exagérer volontairement pour créer un effet dramatique, comique ou poétique.",
      exemple:
        "✅ 'Je t'ai dit mille fois de ranger ta chambre !' (mille fois = hyperbole). 'Je meurs de faim !'",
      piege:
        "Hyperbole ≠ mensonge. C'est une exagération stylistique volontaire pour créer un effet, pas pour tromper.",
      astuce:
        "Hyperbole = exagération ÉNORME. Hyper = au-dessus. Hypermarché = grand marché. Hyperbole = grande exagération !",
    },
  },
  {
    question: "Qu'est-ce que la versification ?",
    options: [
      "L'étude des romans",
      "L'ensemble des règles qui gouvernent la poésie",
      "La traduction de poèmes",
      "L'écriture de biographies",
    ],
    answer: "L'ensemble des règles qui gouvernent la poésie",
    fiche: {
      regle:
        "La versification est l'ensemble des règles de la poésie : le mètre (nombre de syllabes), les rimes, le rythme, la strophe.",
      exemple:
        "✅ La versification inclut : compter les syllabes, identifier les types de rimes (ABAB, ABBA, AABB), repérer les strophes (quatrain, tercet...).",
      piege:
        "Ne pas confondre strophe (groupe de vers) et paragraphe (groupe de phrases en prose).",
      astuce:
        "Vers = ligne de poésie. Strophe = groupe de vers. Quatrain = 4 vers. Tercet = 3 vers. Distique = 2 vers.",
    },
  },
  {
    question: "Qu'est-ce qu'une anaphore ?",
    options: [
      "Une rime riche",
      "La répétition d'un mot ou groupe de mots en début de phrase ou vers",
      "Une métaphore animale",
      "Un alexandrin",
    ],
    answer:
      "La répétition d'un mot ou groupe de mots en début de phrase ou vers",
    fiche: {
      regle:
        "L'anaphore est la répétition d'un même mot ou groupe de mots au début de plusieurs phrases ou vers consécutifs. Elle crée un effet de rythme et d'insistance.",
      exemple:
        "✅ 'J'ai un rêve... J'ai un rêve... J'ai un rêve...' (Martin Luther King) → 'J'ai un rêve' répété en début = anaphore.",
      piege:
        "Anaphore ≠ allitération. L'anaphore répète des mots entiers au début. L'allitération répète des sons de consonnes.",
      astuce:
        "Anaphore = MÊME DÉBUT répété. Ana = en haut, en avant. Le mot revient DEVANT.",
    },
  },
  {
    question: "Qu'est-ce qu'une assonance ?",
    options: [
      "La répétition d'une consonne",
      "La répétition d'une voyelle",
      "Un type de strophe",
      "Une rime embrassée",
    ],
    answer: "La répétition d'une voyelle",
    fiche: {
      regle:
        "L'assonance est la répétition d'un même son vocalique (voyelle) dans des mots proches. Elle crée une musicalité particulière.",
      exemple:
        "✅ 'Les sanglots longs des violons de l'automne' (Verlaine) → répétition du son [ɔ̃].",
      piege:
        "Assonance = voyelle. Allitération = consonne. A comme Assonance, A comme voyelle !",
      astuce:
        "ASSOnance = voyelle. ALLitération = consonne. Deux A, deux effets différents !",
    },
  },
  {
    question: "Qu'est-ce qu'une litote ?",
    options: [
      "Une grande exagération",
      "Dire moins pour suggérer plus",
      "Une rime croisée",
      "Une figure qui humanise",
    ],
    answer: "Dire moins pour suggérer plus",
    fiche: {
      regle:
        "La litote est une figure qui consiste à dire moins pour en faire comprendre davantage. Elle atténue pour mieux exprimer.",
      exemple:
        "✅ 'Va, je ne te hais point.' (Corneille) = 'Je t'aime'. On dit le contraire du contraire pour exprimer l'amour.",
      piege:
        "Litote ≠ hyperbole. Litote = dire moins (sous-entendu plus). Hyperbole = dire plus (exagérer).",
      astuce:
        "Litote = litote. 'C'est pas mal' pour dire 'c'est très bien'. En dire MOINS pour suggérer PLUS.",
    },
  },
];

export default function LaPoesiePage() {
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
          <div className="lecon-badge">🎭 Français — 5ème</div>
          <h1 className="lecon-titre">La poésie</h1>
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
            En 5ème, tu étudies les <strong>figures de style</strong> et la{" "}
            <strong>versification</strong>. Des outils essentiels pour
            comprendre et analyser la poésie.
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
              <div className="lecon-point-titre">🎨 Les figures de style</div>
              <div className="lecon-point-texte">
                Métaphore (comparaison sans 'comme'), comparaison (avec
                'comme'), personnification (humaniser), hyperbole (exagérer),
                anaphore (répétition en début).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'La vie est un
                long fleuve tranquille.' → métaphore.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎵 La versification</div>
              <div className="lecon-point-texte">
                Alexandrin = 12 syllabes. Octosyllabe = 8. Rimes : croisées
                (ABAB), embrassées (ABBA), suivies (AABB).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Quatrain (4
                vers), tercet (3 vers), distique (2 vers).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔊 Les effets sonores</div>
              <div className="lecon-point-texte">
                Allitération = répétition de consonnes. Assonance = répétition
                de voyelles. Crée une musicalité.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Pour qui sont
                ces serpents qui sifflent sur vos têtes ?' → allitération en
                [s].
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
