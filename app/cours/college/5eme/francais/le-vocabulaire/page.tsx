"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "le-vocabulaire";

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
    question: "Qu'est-ce qu'un préfixe ?",
    options: [
      "Un élément ajouté à la fin d'un mot",
      "Un élément ajouté au début d'un mot pour en modifier le sens",
      "La racine d'un mot",
      "Un suffixe",
    ],
    answer: "Un élément ajouté au début d'un mot pour en modifier le sens",
    fiche: {
      regle:
        "Un préfixe est un élément placé AVANT la racine d'un mot pour en changer le sens. Ex: in-, dé-, re-, pré-, anti-...",
      exemple:
        "✅ Possible → IMpossible (préfixe in-/im- = négation). Faire → REfaire (re- = à nouveau). Guerre → ANTIguerre.",
      piege:
        "Préfixe = AVANT le mot. Suffixe = APRÈS le mot. Ne pas les confondre.",
      astuce:
        "PRÉfixe = PRÉ (avant). SUFfixe = SUF... vient après. Pré est avant, suf est après !",
    },
  },
  {
    question: "Quel est le sens du préfixe 'in-' dans 'invisible' ?",
    options: ["Très", "À nouveau", "Négation (pas)", "Avant"],
    answer: "Négation (pas)",
    fiche: {
      regle:
        "Le préfixe in- (ou im-, il-, ir- selon le son suivant) exprime la négation, le contraire. Invisible = pas visible.",
      exemple:
        "✅ Invisible (pas visible), impossible (pas possible), illogique (pas logique), irrégulier (pas régulier).",
      piege:
        "In- peut aussi signifier 'dans' dans certains mots (intérieur, inclure). Contexte important !",
      astuce:
        "IN/IM/IL/IR- = pas, non. Impossible = pas possible. Irrégulier = pas régulier. Même sens, forme qui change selon le son.",
    },
  },
  {
    question: "Qu'est-ce qu'un suffixe ?",
    options: [
      "Un élément ajouté avant la racine",
      "Un élément ajouté après la racine qui change la nature ou le sens du mot",
      "La racine grecque d'un mot",
      "Un mot autonome",
    ],
    answer:
      "Un élément ajouté après la racine qui change la nature ou le sens du mot",
    fiche: {
      regle:
        "Un suffixe est un élément placé APRÈS la racine pour former un nouveau mot, souvent d'une autre nature grammaticale.",
      exemple:
        "✅ Chant (verbe) + -eur = chanteur (nom). Beau (adjectif) + -té = beauté (nom). Rapid + -ement = rapidement (adverbe).",
      piege:
        "Le suffixe peut changer la nature du mot : adjectif → nom (-té, -ité), verbe → nom (-eur, -age), adj → adverbe (-ment).",
      astuce:
        "Suffixe après = change la nature. -MENT = adverbe. -EUR = nom de personne. -TION = nom d'action. -IBLE/-ABLE = adjectif.",
    },
  },
  {
    question: "Qu'est-ce qu'un champ lexical ?",
    options: [
      "L'ensemble des synonymes d'un mot",
      "L'ensemble des mots qui se rapportent à un même thème",
      "Les mots de la même famille",
      "Les mots ayant le même sens",
    ],
    answer: "L'ensemble des mots qui se rapportent à un même thème",
    fiche: {
      regle:
        "Le champ lexical est l'ensemble des mots (de natures différentes) qui se rapportent à un même thème ou sujet dans un texte.",
      exemple:
        "✅ Champ lexical de la mer : vague, bateau, nager, marin, bleu, sel, plage, horizon, voile, tempête...",
      piege:
        "Champ lexical ≠ famille de mots. Le champ lexical regroupe des mots de natures variées autour d'un thème.",
      astuce:
        "Champ lexical = tout ce qui évoque un thème. Guerre : soldat, bataille, blessure, victoire, arme, paix... Tous liés à la guerre.",
    },
  },
  {
    question: "Qu'est-ce qu'une famille de mots ?",
    options: [
      "Des mots qui ont le même sens",
      "Des mots construits à partir d'une même racine",
      "Des mots du même champ lexical",
      "Des synonymes",
    ],
    answer: "Des mots construits à partir d'une même racine",
    fiche: {
      regle:
        "Une famille de mots est un ensemble de mots formés à partir d'une même racine (radical), avec des préfixes ou suffixes différents.",
      exemple:
        "✅ Famille de 'terre' : terrain, enterrer, terrestre, atterrir, souterrain, territoire, terreau...",
      piege:
        "Famille de mots ≠ champ lexical. La famille partage une RACINE commune. Le champ lexical partage un THÈME.",
      astuce:
        "Famille = même RACINE. Champ lexical = même THÈME. Terre → terrain, terrestre (famille). Mer, bateau, vague (champ lexical de la mer).",
    },
  },
  {
    question: "Qu'est-ce qu'un synonyme ?",
    options: [
      "Un mot de sens contraire",
      "Un mot de même sens ou sens proche",
      "Un mot de même famille",
      "Un mot du même champ lexical",
    ],
    answer: "Un mot de même sens ou sens proche",
    fiche: {
      regle:
        "Un synonyme est un mot qui a le même sens (ou un sens très proche) qu'un autre mot. Les synonymes permettent d'éviter les répétitions.",
      exemple:
        "✅ Beau = joli, magnifique, splendide, superbe. Marcher = aller, se promener, avancer, déambuler.",
      piege:
        "Les synonymes sont rarement parfaitement identiques. 'Maison' et 'demeure' sont synonymes mais 'demeure' est plus soutenu.",
      astuce:
        "Synonyme = même sens. Antonyme = sens contraire. Homonyme = même son, sens différent. Trois relations différentes !",
    },
  },
  {
    question: "Qu'est-ce qu'un antonyme ?",
    options: [
      "Un mot de même sens",
      "Un mot de sens contraire ou opposé",
      "Un mot de même famille",
      "Un préfixe négatif",
    ],
    answer: "Un mot de sens contraire ou opposé",
    fiche: {
      regle:
        "Un antonyme est un mot de sens contraire ou opposé. On peut former des antonymes avec des préfixes (in-, dé-, mal-).",
      exemple:
        "✅ Grand ↔ petit. Chaud ↔ froid. Possible ↔ impossible (préfixe in-). Faire ↔ défaire (préfixe dé-).",
      piege:
        "Certains antonymes se forment avec des préfixes. Impossible est l'antonyme de possible (pas un mot différent).",
      astuce:
        "ANTonyme = ANTi = contre. Grand/petit, chaud/froid, aimer/détester = antonymes. Contraires !",
    },
  },
  {
    question: "Qu'est-ce qu'un registre de langue ?",
    options: [
      "La longueur des mots",
      "Le niveau de langage adapté à la situation (familier, courant, soutenu)",
      "Le champ lexical d'un texte",
      "La ponctuation d'un texte",
    ],
    answer:
      "Le niveau de langage adapté à la situation (familier, courant, soutenu)",
    fiche: {
      regle:
        "Le registre de langue est le niveau de langue choisi selon la situation de communication. 3 niveaux : familier (amis), courant (quotidien), soutenu (écrit formel).",
      exemple:
        "✅ Familier : 'T'as vu le film ?' Courant : 'Tu as vu le film ?' Soutenu : 'Avez-vous visionné ce film ?'",
      piege:
        "Pas de registre meilleur qu'un autre. Chacun est adapté à une situation. Le familier n'est pas 'faux'.",
      astuce:
        "Familier = copains. Courant = quotidien. Soutenu = écrit formel ou discours. Adapte ton registre à la situation !",
    },
  },
  {
    question: "Quelle est la racine latine du mot 'aquatique' ?",
    options: ["aqua (eau)", "aque (air)", "aqui (feu)", "aquat (terre)"],
    answer: "aqua (eau)",
    fiche: {
      regle:
        "Connaître les racines latines et grecques aide à comprendre et mémoriser le vocabulaire. 'Aqua' (latin) = eau.",
      exemple:
        "✅ Aquatique, aquarium, aqueduc, aquarelle → tous contiennent 'aqua' = eau.",
      piege:
        "Les racines permettent de déduire le sens d'un mot inconnu. Aqua + -tique = relatif à l'eau.",
      astuce:
        "Aqua = eau. Bio = vie. Terra = terre. Photo = lumière. Graph = écrire. Ces racines se retrouvent dans des centaines de mots !",
    },
  },
  {
    question: "Que signifie le suffixe '-tion' dans 'construction' ?",
    options: [
      "Qui fait l'action",
      "Action ou résultat de l'action",
      "Relatif à",
      "Qui peut être",
    ],
    answer: "Action ou résultat de l'action",
    fiche: {
      regle:
        "Le suffixe -tion (ou -sion, -ation) forme des noms qui désignent une action ou son résultat. Il transforme un verbe en nom.",
      exemple:
        "✅ Construire → construction (l'action de construire). Réviser → révision. Éduquer → éducation. Organiser → organisation.",
      piege:
        "-TION ≠ -TEUR. -tion = l'action. -teur = celui qui fait. Construction (l'acte) vs constructeur (celui qui construit).",
      astuce:
        "-TION = action/résultat (nom féminin). -TEUR = celui qui fait (nom masculin). Construction vs constructeur.",
    },
  },
];

export default function LeVocabulairePage() {
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
          <div className="lecon-badge">📚 Français — 5ème</div>
          <h1 className="lecon-titre">Le vocabulaire</h1>
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
            Enrichis ton <strong>vocabulaire</strong> en maîtrisant la formation
            des mots (préfixes, suffixes, racines) et les relations entre les
            mots (synonymes, antonymes, champs lexicaux).
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
              <div className="lecon-point-titre">🔨 Formation des mots</div>
              <div className="lecon-point-texte">
                Préfixe (avant) + Racine + Suffixe (après). Ex: in- + visible +
                -ité → invisibilité.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Re-faire (re- =
                à nouveau). Im-possible (im- = pas). Chant-eur (-eur = celui qui
                fait).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔗 Relations entre les mots
              </div>
              <div className="lecon-point-texte">
                Synonyme (même sens), antonyme (sens contraire), homonyme (même
                son), paronymie (sons proches).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Beau/joli
                (synonymes). Grand/petit (antonymes). Ver/verre/vert
                (homonymes).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🌊 Champ lexical et famille
              </div>
              <div className="lecon-point-texte">
                Champ lexical = même thème. Famille de mots = même racine.
                Registres : familier, courant, soutenu.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span>{" "}
                Mer/bateau/vague = champ lexical. Terre/terrain/terrestre =
                famille de mots.
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
