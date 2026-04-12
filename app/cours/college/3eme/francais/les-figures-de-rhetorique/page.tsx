"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "les-figures-de-rhetorique";

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
    question: "Qu'est-ce que l'hyperbole ?",
    options: [
      "Une figure qui atténue la réalité",
      "Une figure qui exagère la réalité pour produire un effet fort",
      "Une figure qui compare deux éléments avec 'comme'",
      "Une figure qui personnifie un objet",
    ],
    answer: "Une figure qui exagère la réalité pour produire un effet fort",
    fiche: {
      regle:
        "L'hyperbole est une figure d'exagération volontaire qui amplifie la réalité pour frapper l'imagination ou renforcer l'expression d'un sentiment.",
      exemple:
        "✅ 'Je t'ai attendu une éternité.' 'Il y avait un million de personnes.' 'Je meurs de faim.' Toutes ces phrases exagèrent volontairement.",
      piege:
        "Hyperbole ≠ mensonge. C'est une exagération stylistique consciente, pas une erreur. L'effet recherché est l'intensité.",
      astuce:
        "Hyperbole = hyper (au-delà) + bole (lancer). On lance la réalité bien au-delà de ce qu'elle est. Exagération volontaire = hyperbole.",
    },
  },
  {
    question: "Qu'est-ce que la litote ?",
    options: [
      "Une figure qui exagère la réalité",
      "Une figure qui dit moins pour suggérer plus",
      "Une figure qui répète le même mot",
      "Une figure qui inverse l'ordre des mots",
    ],
    answer: "Une figure qui dit moins pour suggérer plus",
    fiche: {
      regle:
        "La litote consiste à atténuer l'expression d'une idée pour en suggérer davantage. On dit moins que ce qu'on pense, mais le lecteur comprend plus que ce qui est dit.",
      exemple:
        "✅ 'Va, je ne te hais point' (Corneille) = je t'aime. 'Ce n'est pas mal' = c'est très bien. 'Il n'est pas bête' = il est intelligent.",
      piege:
        "Litote ≠ euphémisme. La litote dit moins pour suggérer plus. L'euphémisme adoucit une réalité désagréable. Les deux atténuent mais pas de la même façon.",
      astuce:
        "Litote = sous-entendu par le bas. 'Ce n'est pas mauvais' = c'est excellent. Cherche ce que la phrase suggère AU-DELA de ce qu'elle dit.",
    },
  },
  {
    question:
      "Identifie la figure de style : 'Le silence du désert hurlait dans ses oreilles.'",
    options: ["Comparaison", "Métaphore", "Oxymore", "Personnification"],
    answer: "Oxymore",
    fiche: {
      regle:
        "L'oxymore (ou oxymoron) associe deux termes contradictoires pour créer un effet de paradoxe saisissant. Les deux mots semblent s'opposer mais leur rapprochement crée une image forte.",
      exemple:
        "✅ 'Le silence hurlait' (silence ≠ hurler). 'Une obscure clarté' (Corneille). 'Cette obscure clarté qui tombe des étoiles.' 'Un mort-vivant.'",
      piege:
        "Oxymore ≠ antithèse. L'oxymore associe deux contraires dans le MEME groupe de mots. L'antithèse oppose deux idées dans des propositions différentes.",
      astuce:
        "Oxymore = deux contraires collés ensemble. Silence + hurler. Obscure + clarté. Chaud + froid. La contradiction est dans le même groupe.",
    },
  },
  {
    question: "Qu'est-ce que l'antiphrase ?",
    options: [
      "Une répétition de mots en début de phrase",
      "Dire le contraire de ce qu'on pense, souvent avec ironie",
      "Une comparaison sans outil de comparaison",
      "Une énumération de termes similaires",
    ],
    answer: "Dire le contraire de ce qu'on pense, souvent avec ironie",
    fiche: {
      regle:
        "L'antiphrase consiste à dire le contraire de ce que l'on pense, généralement avec une intention ironique ou sarcastique. Le contexte permet au lecteur de comprendre le vrai sens.",
      exemple:
        "✅ 'C'est vraiment malin !' (dit à quelqu'un qui a fait une bêtise). 'Bravo, quel génie !' (ironiquement). 'Il fait un temps magnifique' (sous la pluie).",
      piege:
        "Antiphrase ≠ mensonge. C'est une figure intentionnelle. Le contexte révèle l'ironie. Sans contexte, l'antiphrase serait incompréhensible.",
      astuce:
        "Antiphrase = contre-phrase. On dit le contraire de sa pensée. L'ironie et le sarcasme utilisent souvent l'antiphrase.",
    },
  },
  {
    question: "Qu'est-ce que l'ellipse dans un texte argumentatif ?",
    options: [
      "Une figure qui ajoute des détails inutiles",
      "Une figure qui omet des éléments pour aller à l'essentiel et créer un effet de rapidité",
      "Une figure qui répète plusieurs fois la même idée",
      "Une figure qui compare deux arguments opposés",
    ],
    answer:
      "Une figure qui omet des éléments pour aller à l'essentiel et créer un effet de rapidité",
    fiche: {
      regle:
        "L'ellipse est l'omission volontaire d'un ou plusieurs éléments dans une phrase ou un texte. Elle crée un effet de rapidité, de densité ou de tension. Le lecteur doit combler les blancs.",
      exemple:
        "✅ 'Veni, vidi, vici' (Je suis venu, j'ai vu, j'ai vaincu) — ellipse du sujet et du verbe répétés. 'Partir, c'est mourir un peu' — ellipse du verbe dans la comparaison.",
      piege:
        "Ellipse ≠ erreur grammaticale. C'est une suppression volontaire et stylistique. Elle crée un effet de vitesse ou de concentration.",
      astuce:
        "Ellipse = on enlève pour aller plus vite. Plus c'est court, plus c'est dense. 'Veni, vidi, vici' = ellipse célèbre de César.",
    },
  },
  {
    question:
      "Identifie la figure : 'La raison du plus fort est toujours la meilleure.' (La Fontaine)",
    options: ["Hyperbole", "Antiphrase", "Ironie", "Litote"],
    answer: "Ironie",
    fiche: {
      regle:
        "L'ironie consiste à dire quelque chose tout en laissant entendre le contraire, de façon à critiquer ou se moquer. Elle est proche de l'antiphrase mais plus subtile et souvent moins marquée.",
      exemple:
        "✅ La Fontaine critique la loi du plus fort en la présentant ironiquement comme une 'meilleure' raison. Voltaire use constamment de l'ironie dans 'Candide'.",
      piege:
        "Ironie ≠ humour simple. L'ironie a souvent une visée critique ou satirique. Elle peut blesser ou dénoncer une injustice.",
      astuce:
        "Ironie = dire une chose, penser l'opposé, avec intention de critiquer. La Fontaine, Voltaire, Molière = maîtres de l'ironie.",
    },
  },
  {
    question: "Qu'est-ce que la gradation ?",
    options: [
      "Une figure qui inverse l'ordre normal des mots",
      "Une énumération dont les termes sont ordonnés par intensité croissante ou décroissante",
      "Une répétition exacte d'une phrase entière",
      "Une comparaison entre deux personnages",
    ],
    answer:
      "Une énumération dont les termes sont ordonnés par intensité croissante ou décroissante",
    fiche: {
      regle:
        "La gradation est une figure qui consiste à enchaîner des termes dans un ordre progressif d'intensité croissante (climax) ou décroissante (anticlimax). Elle crée un effet de montée ou de descente en puissance.",
      exemple:
        "✅ Climax : 'Je le vis, je rougis, je pâlis à sa vue.' (Racine) — intensité croissante des réactions. 'Un souffle, une voix, un cri, un hurlement.'",
      piege:
        "Gradation ≠ simple énumération. Dans une énumération ordinaire, l'ordre n'a pas d'importance. Dans la gradation, l'ordre est essentiel (du moins fort au plus fort, ou inversement).",
      astuce:
        "Gradation = escalier. Chaque marche monte (climax) ou descend (anticlimax). L'ordre des mots n'est pas interchangeable.",
    },
  },
  {
    question: "Qu'est-ce que l'euphémisme ?",
    options: [
      "Une exagération pour dramatiser",
      "Une formulation atténuée pour adoucir une réalité difficile ou choquante",
      "Une répétition de sons identiques",
      "Une question posée sans attendre de réponse",
    ],
    answer:
      "Une formulation atténuée pour adoucir une réalité difficile ou choquante",
    fiche: {
      regle:
        "L'euphémisme consiste à remplacer une expression jugée trop dure, choquante ou vulgaire par une formulation plus douce. Il adoucit la réalité pour la rendre plus acceptable.",
      exemple:
        "✅ 'Il nous a quittés' (il est mort). 'Une personne en situation de handicap' (handicapé). 'Un conflit armé' (une guerre). 'Des dommages collatéraux' (des morts civils).",
      piege:
        "Euphémisme ≠ litote. L'euphémisme adoucit une réalité difficile. La litote dit moins pour suggérer plus. Les deux atténuent mais avec des intentions différentes.",
      astuce:
        "Euphémisme = eu (bien) + pheme (parole). Parler en bien de quelque chose de difficile. Mort = 'nous a quittés'. Guerre = 'conflit'.",
    },
  },
  {
    question: "Qu'est-ce que la chiasme ?",
    options: [
      "Une répétition de mots en début de phrase",
      "Une structure croisée de type A-B / B-A",
      "Une série de métaphores enchaînées",
      "Une question rhétorique sans réponse",
    ],
    answer: "Une structure croisée de type A-B / B-A",
    fiche: {
      regle:
        "Le chiasme est une figure de construction qui consiste à disposer des éléments en ordre croisé (A-B / B-A). Il crée un effet de symétrie inversée et met en valeur les termes en miroir.",
      exemple:
        "✅ 'Il faut manger pour vivre et non vivre pour manger.' (A=manger, B=vivre / B=vivre, A=manger). 'Un roi chantait en bas, en haut mourait un dieu.' (Hugo)",
      piege:
        "Chiasme ≠ parallélisme. Le parallélisme répète la même structure (A-B / A-B). Le chiasme croise (A-B / B-A). L'inversion est ce qui définit le chiasme.",
      astuce:
        "Chiasme = croix (du grec khiasmos). Structure en X : A-B puis B-A. 'Vivre pour manger / manger pour vivre' = chiasme célèbre de Molière.",
    },
  },
  {
    question: "Qu'est-ce que la question rhétorique ?",
    options: [
      "Une question posée à un personnage dans un roman",
      "Une question qui n'attend pas de réponse car elle affirme ou nie une évidence",
      "Une question de grammaire sur la rhétorique",
      "Une question posée au début d'un discours pour capter l'attention",
    ],
    answer:
      "Une question qui n'attend pas de réponse car elle affirme ou nie une évidence",
    fiche: {
      regle:
        "La question rhétorique (ou interrogation oratoire) est une question posée non pour obtenir une réponse, mais pour affirmer ou nier une évidence, impliquer le lecteur ou renforcer un argument.",
      exemple:
        "✅ 'Peut-on rester indifférent face à la misère ?' (= non, on ne peut pas). 'Qui ne connaît pas Molière ?' (= tout le monde le connaît). 'Sommes-nous des bêtes ?' (= non).",
      piege:
        "Question rhétorique ≠ vraie question. Elle n'attend pas de réponse. Sa forme interrogative sert à affirmer ou impliquer, pas à demander.",
      astuce:
        "Rhétorique = question qui contient déjà sa réponse. Elle engage le lecteur et renforce l'argumentation. Très utilisée dans les discours et textes persuasifs.",
    },
  },
];

export default function LesFiguresDeRhetoriquePage() {
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
          <div className="lecon-badge">🎭 Français — 3ème</div>
          <h1 className="lecon-titre">Les figures de rhétorique</h1>
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
            En 3ème, tu identifies et analyses les{" "}
            <strong>figures de rhétorique</strong> : hyperbole, litote, oxymore,
            antiphrase, ironie, gradation, euphémisme, chiasme et question
            rhétorique.
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
              <div className="lecon-point-titre">📏 Figures d'intensité</div>
              <div className="lecon-point-texte">
                Hyperbole (exagération), litote (dire moins pour plus),
                gradation (intensité croissante/décroissante), euphémisme
                (adoucir la réalité).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Hyperbole : 'Je
                meurs de faim.' Litote : 'Ce n'est pas mal' (= c'est très bien).
                Gradation : 'un souffle, un cri, un hurlement.'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔄 Figures de contradiction
              </div>
              <div className="lecon-point-texte">
                Oxymore (deux contraires collés), antiphrase (dire le
                contraire), ironie (critiquer par le contraire), question
                rhétorique (question sans réponse attendue).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Oxymore : 'le
                silence hurlait'. Antiphrase : 'c'est vraiment malin !'
                (ironique). Question rhétorique : 'Peut-on rester indifférent ?'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🏗️ Figures de construction
              </div>
              <div className="lecon-point-texte">
                Chiasme (structure croisée A-B/B-A), ellipse (omission
                volontaire), anaphore (répétition en début). La construction de
                la phrase crée l'effet.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Chiasme :
                'Vivre pour manger / manger pour vivre.' Ellipse : 'Veni, vidi,
                vici.' Anaphore : 'Je t'aime... Je t'aime...'
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
