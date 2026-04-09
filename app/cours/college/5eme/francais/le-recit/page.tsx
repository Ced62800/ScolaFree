"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "le-recit";

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
    question: "Qu'est-ce que le schéma narratif ?",
    options: [
      "La liste des personnages",
      "Les 5 étapes de l'histoire",
      "Le point de vue du narrateur",
      "Le lieu de l'action",
    ],
    answer: "Les 5 étapes de l'histoire",
    fiche: {
      regle:
        "Le schéma narratif comporte 5 étapes : situation initiale, élément perturbateur, péripéties, élément de résolution, situation finale.",
      exemple:
        "✅ Situation initiale : le roi vit paisiblement. Élément perturbateur : un dragon attaque. Péripéties : le héros part combattre. Résolution : il tue le dragon. Finale : la paix revient.",
      piege:
        "Ne pas confondre élément perturbateur (ce qui déclenche l'action) et élément de résolution (ce qui résout le problème).",
      astuce:
        "Retiens : SI-EP-P-ER-SF. Situation Initiale, Élément Perturbateur, Péripéties, Élément de Résolution, Situation Finale.",
    },
  },
  {
    question: "Qu'est-ce qu'un narrateur interne ?",
    options: [
      "Un narrateur qui raconte à la 3ème personne",
      "Un narrateur qui est un personnage de l'histoire",
      "Un narrateur qui connaît tout",
      "Un narrateur absent de l'histoire",
    ],
    answer: "Un narrateur qui est un personnage de l'histoire",
    fiche: {
      regle:
        "Le narrateur interne (ou homodiégétique) est un personnage de l'histoire. Il raconte à la 1ère personne (je, nous) et ne connaît que ce qu'il vit.",
      exemple:
        "✅ 'Je m'appelais Jean et je vivais à Paris...' → narrateur interne car il dit 'je' et est dans l'histoire.",
      piege:
        "Narrateur interne ≠ narrateur omniscient. Le narrateur interne ne sait pas tout, il est limité à son point de vue.",
      astuce:
        "Interne = dans l'histoire = JE. Externe = hors de l'histoire = IL/ELLE. Simple !",
    },
  },
  {
    question: "Qu'est-ce qu'un narrateur omniscient ?",
    options: [
      "Un narrateur qui raconte à la 1ère personne",
      "Un narrateur qui ne sait rien",
      "Un narrateur qui sait tout sur tous les personnages",
      "Un narrateur qui est aveugle",
    ],
    answer: "Un narrateur qui sait tout sur tous les personnages",
    fiche: {
      regle:
        "Le narrateur omniscient (qui sait tout) connaît les pensées, les sentiments et les actions de tous les personnages. Il est externe à l'histoire.",
      exemple:
        "✅ 'Marie pensait secrètement que Paul avait menti, mais celui-ci ignorait qu'elle le savait.' → seul un narrateur omniscient peut savoir les deux.",
      piege:
        "Omniscient vient du latin 'omnis' (tout) et 'sciens' (sachant). Ce n'est pas un personnage de l'histoire.",
      astuce:
        "Omni = tout. Omniscient = qui sait tout. Comme un dieu qui voit tout le monde !",
    },
  },
  {
    question:
      "Quel est l'élément perturbateur dans : 'Le village vivait en paix. Un soir, une tempête détruisit toutes les maisons.' ?",
    options: ["Le village", "La paix", "La tempête", "Les maisons"],
    answer: "La tempête",
    fiche: {
      regle:
        "L'élément perturbateur est l'événement qui vient rompre l'équilibre de la situation initiale et déclenche l'action.",
      exemple:
        "✅ Situation initiale : village en paix. Élément perturbateur : la tempête. C'est elle qui brise l'équilibre.",
      piege:
        "L'élément perturbateur n'est pas forcément mauvais — il peut être une bonne nouvelle qui change tout !",
      astuce:
        "Perturbateur = ce qui perturbe, qui rompt la paix du début. Cherche le 'mais soudain...' dans le texte.",
    },
  },
  {
    question: "Dans un récit, les péripéties sont :",
    options: [
      "Le début de l'histoire",
      "Les aventures et obstacles que vit le héros",
      "La fin heureuse",
      "La description des lieux",
    ],
    answer: "Les aventures et obstacles que vit le héros",
    fiche: {
      regle:
        "Les péripéties sont les épreuves, aventures et obstacles que le héros doit surmonter entre l'élément perturbateur et la résolution.",
      exemple:
        "✅ Ulysse doit affronter le cyclope, les sirènes, Charybde et Scylla... ce sont des péripéties.",
      piege:
        "Péripéties (pluriel) = plusieurs aventures. Ne pas confondre avec l'élément de résolution qui est l'événement final qui résout tout.",
      astuce:
        "Péripéties = les aventures du milieu. L'histoire : début → aventures (péripéties) → fin.",
    },
  },
  {
    question:
      "Quel temps verbal est principalement utilisé pour les actions principales dans un récit au passé ?",
    options: ["L'imparfait", "Le présent", "Le passé simple", "Le futur"],
    answer: "Le passé simple",
    fiche: {
      regle:
        "Dans un récit au passé : le passé simple exprime les actions principales (ce qui avance l'histoire). L'imparfait décrit le décor et les habitudes.",
      exemple:
        "✅ 'Il faisait nuit (imparfait = décor) quand le loup arriva (passé simple = action principale).'",
      piege:
        "Imparfait ≠ passé simple. L'imparfait décrit, le passé simple raconte les actions.",
      astuce:
        "Passé simple = action qui avance. Imparfait = description qui reste. PS = flèche, IMP = fond.",
    },
  },
  {
    question: "Qu'est-ce que le point de vue interne dans un récit ?",
    options: [
      "On voit tout depuis l'extérieur",
      "On voit depuis l'intérieur d'un personnage",
      "On ne voit rien",
      "On voit depuis le futur",
    ],
    answer: "On voit depuis l'intérieur d'un personnage",
    fiche: {
      regle:
        "Point de vue interne = le lecteur voit et ressent comme un personnage. On a accès à ses pensées et sentiments mais pas à ceux des autres.",
      exemple:
        "✅ 'Je sentais mon cœur battre, je ne savais pas si Paul m'aimait encore.' → point de vue interne (on est dans la tête du personnage).",
      piege:
        "Point de vue interne ≠ narrateur interne. Un narrateur externe peut adopter un point de vue interne sur un personnage.",
      astuce:
        "Interne = dans la tête d'un personnage. Externe = comme une caméra qui observe. Omniscient = dans la tête de tout le monde.",
    },
  },
  {
    question: "Qu'appelle-t-on le 'schéma actantiel' ?",
    options: [
      "Les 5 étapes du récit",
      "Les rôles des personnages dans l'histoire",
      "La liste des lieux",
      "Les temps verbaux utilisés",
    ],
    answer: "Les rôles des personnages dans l'histoire",
    fiche: {
      regle:
        "Le schéma actantiel décrit les rôles des personnages : sujet (héros), objet (but), destinateur (qui envoie), destinataire (pour qui), adjuvant (aide), opposant (obstacle).",
      exemple:
        "✅ Dans Cendrillon : sujet = Cendrillon, objet = le bal/prince, adjuvant = la fée, opposant = la marâtre.",
      piege:
        "Actantiel vient d'actant = personnage jouant un rôle. Ce n'est pas la même chose que le schéma narratif.",
      astuce:
        "Sujet cherche Objet, aidé par Adjuvant, bloqué par Opposant. Comme un jeu vidéo !",
    },
  },
  {
    question:
      "Dans quel type de récit retrouve-t-on souvent la structure 'quête du héros' ?",
    options: [
      "Le roman policier",
      "Le conte merveilleux",
      "Le journal intime",
      "La biographie",
    ],
    answer: "Le conte merveilleux",
    fiche: {
      regle:
        "Le conte merveilleux suit souvent la structure de la quête : un héros part en voyage pour accomplir une mission, affronte des épreuves et revient transformé.",
      exemple:
        "✅ Cendrillon, Le Petit Poucet, La Belle au Bois Dormant... tous suivent le schéma de la quête.",
      piege:
        "La quête du héros se retrouve aussi dans d'autres genres (fantasy, épopée) mais le conte merveilleux en est l'exemple classique.",
      astuce:
        "Conte merveilleux = personnages magiques + quête + épreuves + fin heureuse. Toujours !",
    },
  },
  {
    question: "Qu'est-ce qu'un récit enchâssé ?",
    options: [
      "Un récit sans personnages",
      "Un récit dans un autre récit",
      "Un récit très court",
      "Un récit sans fin",
    ],
    answer: "Un récit dans un autre récit",
    fiche: {
      regle:
        "Un récit enchâssé (ou récit dans le récit) est une histoire racontée à l'intérieur d'une autre histoire. Le narrateur principal laisse parler un personnage qui raconte une histoire.",
      exemple:
        "✅ Dans Les Mille et Une Nuits, Schéhérazade raconte des histoires (récits enchâssés) pour sauver sa vie.",
      piege:
        "Enchâssé = emboîté dans. Le récit cadre contient le récit enchâssé, comme une boîte dans une boîte.",
      astuce:
        "Enchâssé = dans un cadre. Comme une photo dans un cadre. Récit cadre → récit enchâssé.",
    },
  },
];

export default function LeRecitPage() {
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
          <div className="lecon-badge">📖 Français — 5ème</div>
          <h1 className="lecon-titre">Le récit</h1>
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
            En 5ème, tu approfondis l'étude du <strong>récit</strong> : schéma
            narratif, types de narrateurs, points de vue et structure des
            histoires.
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
              <div className="lecon-point-titre">📋 Le schéma narratif</div>
              <div className="lecon-point-texte">
                5 étapes : situation initiale → élément perturbateur →
                péripéties → élément de résolution → situation finale.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Le Petit Poucet
                vit heureux → ses parents l'abandonnent → il affronte l'ogre →
                il vole les bottes → il revient riche.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                👁️ Les types de narrateurs
              </div>
              <div className="lecon-point-texte">
                Narrateur interne (personnage, dit "je") / Narrateur externe
                omniscient (sait tout) / Narrateur externe neutre (observe sans
                commenter).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> "Je marchais
                seul" = interne. "Il marchait, ignorant le danger" = externe
                omniscient.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎭 Les temps du récit</div>
              <div className="lecon-point-texte">
                Passé simple = actions principales qui font avancer l'histoire.
                Imparfait = descriptions, décors, habitudes.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> "Il faisait
                froid (imp.) quand le loup apparut (PS)."
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
