"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "le-roman";

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
    question: "Qu'est-ce qu'un roman ?",
    options: [
      "Un texte court en vers",
      "Une œuvre narrative longue en prose avec des personnages fictifs",
      "Un texte de théâtre",
      "Un texte argumentatif",
    ],
    answer: "Une œuvre narrative longue en prose avec des personnages fictifs",
    fiche: {
      regle:
        "Le roman est une œuvre narrative longue en prose. Il raconte une histoire avec des personnages, un lieu, une époque. Il peut être réaliste, fantastique, policier, d'aventure...",
      exemple:
        "✅ 'Les Misérables' de Victor Hugo est un roman réaliste. 'Harry Potter' est un roman fantastique.",
      piege:
        "Le roman est en PROSE (pas en vers). Une épopée en vers (comme L'Odyssée) n'est pas un roman.",
      astuce:
        "Roman = prose + fiction + long + personnages. Distingue : roman (prose) / poème (vers) / pièce (théâtre).",
    },
  },
  {
    question: "Qu'est-ce que le narrateur ?",
    options: [
      "Le personnage principal",
      "Celui qui raconte l'histoire",
      "L'auteur du roman",
      "Le lecteur",
    ],
    answer: "Celui qui raconte l'histoire",
    fiche: {
      regle:
        "Le narrateur est celui qui raconte l'histoire. Il ne faut pas le confondre avec l'auteur (réel) ni avec le personnage principal. Le narrateur peut être un personnage (interne) ou extérieur à l'histoire (externe).",
      exemple:
        "✅ Dans 'Oliver Twist', le narrateur externe raconte. Dans 'Robinson Crusoé', Robinson est narrateur interne (je).",
      piege:
        "L'auteur écrit le livre. Le narrateur raconte l'histoire. Ce sont deux entités différentes !",
      astuce:
        "Narrateur ≠ auteur. Narrateur = voix qui raconte. Interne (je/nous) ou externe (il/elle/ils).",
    },
  },
  {
    question: "Qu'est-ce que le point de vue interne ?",
    options: [
      "Le narrateur sait tout sur tous les personnages",
      "Le narrateur voit tout de l'extérieur",
      "Le narrateur raconte depuis le point de vue d'un seul personnage",
      "Le narrateur est absent",
    ],
    answer: "Le narrateur raconte depuis le point de vue d'un seul personnage",
    fiche: {
      regle:
        "3 points de vue : Interne (on voit par les yeux d'un personnage), Externe (observation de l'extérieur, peu d'infos), Omniscient (narrateur sait tout sur tous).",
      exemple:
        "✅ Interne : 'Je tremblais de peur...' Omniscient : 'Il pensait à sa mère sans le savoir.' Externe : 'Il entra et s'assit.'",
      piege:
        "Point de vue interne ≠ narration à la 1ère personne. On peut avoir un 'il' avec point de vue interne.",
      astuce:
        "Interne = dans la tête d'UN personnage. Omniscient = dans la tête de TOUS. Externe = observe de dehors.",
    },
  },
  {
    question: "Qu'est-ce qu'un personnage 'rond' (round character) ?",
    options: [
      "Un personnage physiquement gros",
      "Un personnage complexe qui évolue",
      "Un personnage secondaire",
      "Un personnage méchant",
    ],
    answer: "Un personnage complexe qui évolue",
    fiche: {
      regle:
        "Personnage rond = complexe, nuancé, qui évolue au fil du récit. Personnage plat = sans profondeur, stéréotypé, ne change pas.",
      exemple:
        "✅ Jean Valjean (Les Misérables) est rond : il passe du criminel au saint. Un simple méchant de conte est plat.",
      piege:
        "Rond ne désigne pas la forme physique ! C'est un terme littéraire pour désigner la complexité d'un personnage.",
      astuce:
        "Rond = complexe + évolue. Plat = stéréotypé + ne change pas. Les grands héros de roman sont toujours ronds.",
    },
  },
  {
    question:
      "Quelle est la différence entre le temps de l'histoire et le temps de la narration ?",
    options: [
      "Il n'y a pas de différence",
      "Le temps de l'histoire = durée des événements, temps de la narration = façon de les raconter",
      "Le temps de l'histoire est toujours plus long",
      "Le temps de la narration est toujours chronologique",
    ],
    answer:
      "Le temps de l'histoire = durée des événements, temps de la narration = façon de les raconter",
    fiche: {
      regle:
        "Temps de l'histoire = durée réelle des événements (ex: 10 ans). Temps de la narration = comment c'est raconté (ellipse, résumé, pause, scène). L'auteur choisit ce qu'il accélère ou ralentit.",
      exemple:
        "✅ Ellipse : '10 ans passèrent...' (résumé en 3 mots). Scène : dialogue en temps réel. Pause : description qui arrête l'action.",
      piege:
        "Le narrateur ne raconte pas tout à la même vitesse. Il choisit d'accélérer (ellipse) ou de ralentir (description).",
      astuce:
        "Ellipse = sauter du temps. Résumé = accélérer. Scène = temps réel. Pause = arrêter l'action pour décrire.",
    },
  },
  {
    question: "Qu'est-ce qu'une analepse ?",
    options: [
      "Un retour en arrière dans le récit",
      "Un saut vers le futur",
      "Une description du paysage",
      "Un dialogue entre personnages",
    ],
    answer: "Un retour en arrière dans le récit",
    fiche: {
      regle:
        "Analepse = retour en arrière (flashback). Prolepse = saut vers le futur (flash-forward). Ces deux procédés permettent de rompre la chronologie.",
      exemple:
        "✅ Analepse : 'Il se souvint alors de cette nuit de 1942...' Prolepse : 'Des années plus tard, il comprendrait son erreur.'",
      piege:
        "Analepse ≠ prolepse. Analepse = ARRIÈRE (passé). Prolepse = AVANT (futur). Facile de les confondre !",
      astuce:
        "Analepse = ANA = en arrière (retour en arrière). Prolepse = PRO = en avant (anticipation). Les deux = ruptures chronologiques.",
    },
  },
  {
    question: "Qu'est-ce que le schéma narratif d'un roman ?",
    options: [
      "La liste des personnages",
      "La structure en 5 étapes du récit",
      "Le résumé de l'histoire",
      "La biographie de l'auteur",
    ],
    answer: "La structure en 5 étapes du récit",
    fiche: {
      regle:
        "Schéma narratif = 5 étapes : 1) Situation initiale (équilibre) 2) Élément perturbateur 3) Péripéties 4) Élément de résolution 5) Situation finale.",
      exemple:
        "✅ Cendrillon : 1) Vie misérable 2) Invitation au bal 3) Aventures 4) Retrouver la pantoufle 5) Mariage avec le prince.",
      piege:
        "Ne pas confondre 'élément perturbateur' et 'élément de résolution'. L'un crée le problème, l'autre le résout.",
      astuce:
        "5 étapes : Équilibre → Rupture → Action → Solution → Nouvel équilibre. Toute histoire suit ce schéma !",
    },
  },
  {
    question: "Qu'est-ce qu'un roman réaliste ?",
    options: [
      "Un roman avec des éléments magiques",
      "Un roman qui décrit la réalité sociale avec précision",
      "Un roman de science-fiction",
      "Un roman policier",
    ],
    answer: "Un roman qui décrit la réalité sociale avec précision",
    fiche: {
      regle:
        "Le roman réaliste (XIXe siècle) cherche à représenter fidèlement la société : les classes sociales, les conditions de vie, la psychologie des personnages. Auteurs : Balzac, Zola, Flaubert.",
      exemple:
        "✅ 'Germinal' de Zola décrit la vie des mineurs. 'Le Père Goriot' de Balzac décrit la société parisienne.",
      piege:
        "Réaliste ≠ vrai. C'est une fiction qui cherche à donner l'illusion du réel, pas un document historique.",
      astuce:
        "Réalisme = descriptions précises + personnages typiques d'une époque + critique sociale. XIXe siècle.",
    },
  },
  {
    question: "Qu'est-ce que la focalisation zéro ?",
    options: [
      "Le narrateur ne sait rien",
      "Le narrateur sait tout (omniscient)",
      "Le narrateur voit par les yeux d'un seul personnage",
      "Le narrateur observe de l'extérieur",
    ],
    answer: "Le narrateur sait tout (omniscient)",
    fiche: {
      regle:
        "Focalisation zéro = narrateur omniscient, il sait tout sur tous les personnages (pensées, sentiments, passé, futur). Focalisation interne = un personnage. Externe = observation.",
      exemple:
        "✅ Zéro : 'Elle pensait à lui sans savoir qu'il pensait à elle.' Interne : 'Elle pensait à lui.' Externe : 'Elle regardait par la fenêtre.'",
      piege:
        "Zéro = le narrateur en sait PLUS que les personnages. Interne = autant. Externe = MOINS.",
      astuce:
        "Zéro = 0 limite (il sait tout). Interne = limité à 1 personnage. Externe = limité à l'observation extérieure.",
    },
  },
  {
    question: "Qu'est-ce qu'un roman d'apprentissage (Bildungsroman) ?",
    options: [
      "Un roman historique",
      "Un roman qui retrace l'évolution d'un jeune héros vers l'âge adulte",
      "Un roman policier",
      "Un roman épistolaire",
    ],
    answer:
      "Un roman qui retrace l'évolution d'un jeune héros vers l'âge adulte",
    fiche: {
      regle:
        "Roman d'apprentissage (Bildungsroman) = le héros part jeune et inexpérimenté, vit des aventures formatrices, et arrive à maturité. Parcours initiatique.",
      exemple:
        "✅ 'David Copperfield' de Dickens, 'L'Attrape-cœurs' de Salinger, 'Oliver Twist'. Le héros grandit et apprend de la vie.",
      piege:
        "Bildungsroman ≠ biographie. C'est une fiction qui suit la maturation d'un personnage jeune.",
      astuce:
        "Bildung (allemand) = formation. Roman d'apprentissage = héros jeune → expériences → adulte mûr. Parcours de formation.",
    },
  },
];

export default function LeRomanPage() {
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
          <div className="lecon-badge">📖 Français — 4ème</div>
          <h1 className="lecon-titre">Le roman</h1>
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
            En 4ème, tu approfondis l'étude du <strong>roman</strong> :
            narrateur, points de vue, personnages, temps du récit et grands
            genres romanesques.
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
                🗣️ Narrateur et points de vue
              </div>
              <div className="lecon-point-texte">
                Narrateur interne (je), externe ou omniscient. Focalisation :
                zéro (tout sait), interne (un perso), externe (observe).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Focalisation
                zéro : il sait les pensées de tous. Interne : voit par les yeux
                d'un seul.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⏱️ Temps du récit</div>
              <div className="lecon-point-texte">
                Analepse (retour en arrière), prolepse (anticipation), ellipse
                (sauter du temps), scène (temps réel), résumé.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Analepse :
                flashback. Prolepse : flash-forward. Ellipse : '10 ans
                passèrent...'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📚 Genres romanesques</div>
              <div className="lecon-point-texte">
                Roman réaliste (XIXe), d'apprentissage (Bildungsroman),
                policier, fantastique, épistolaire, historique.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Zola =
                réaliste. Dickens = apprentissage. Conan Doyle = policier.
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
