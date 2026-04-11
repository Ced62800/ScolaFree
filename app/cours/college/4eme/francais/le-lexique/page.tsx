"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "le-lexique";

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
    question: "Qu'est-ce qu'un synonyme ?",
    options: [
      "Un mot de sens contraire",
      "Un mot de sens proche ou identique",
      "Un mot de la même famille",
      "Un mot de même prononciation",
    ],
    answer: "Un mot de sens proche ou identique",
    fiche: {
      regle:
        "Un synonyme est un mot qui a un sens proche ou identique à un autre. Les synonymes permettent d'éviter les répétitions et d'enrichir le style.",
      exemple:
        "✅ Beau/joli/magnifique. Triste/mélancolique/malheureux. Parler/dire/affirmer/déclarer.",
      piege:
        "Les synonymes ne sont jamais EXACTEMENT identiques. Chacun a des nuances. 'Maison' et 'demeure' sont synonymes mais 'demeure' est plus formel.",
      astuce:
        "Synonymes = mots de sens PROCHE (pas identique). Utilise-les pour varier ton style et éviter les répétitions !",
    },
  },
  {
    question: "Qu'est-ce qu'un antonyme ?",
    options: [
      "Un mot de même sens",
      "Un mot de sens contraire",
      "Un mot de la même famille",
      "Un préfixe",
    ],
    answer: "Un mot de sens contraire",
    fiche: {
      regle:
        "Un antonyme est un mot de sens contraire. Les antonymes s'opposent sémantiquement. Ils peuvent être formés avec des préfixes (in-, im-, il-, dé-, mal-).",
      exemple:
        "✅ Grand ↔ petit. Chaud ↔ froid. Heureux ↔ malheureux. Possible ↔ impossible. Faire ↔ défaire.",
      piege:
        "Certains antonymes se forment avec un préfixe. 'Heureux' → 'malheureux' (mal-). 'Possible' → 'impossible' (im-).",
      astuce:
        "Antonyme = contraire. Préfixes privatifs : in-, im-, il-, ir-, dé-, mal-, a-. Impossible = im + possible.",
    },
  },
  {
    question: "Qu'est-ce que le champ lexical ?",
    options: [
      "L'ensemble des synonymes d'un mot",
      "L'ensemble des mots liés à un même thème ou domaine",
      "La famille d'un mot",
      "Les différents sens d'un mot",
    ],
    answer: "L'ensemble des mots liés à un même thème ou domaine",
    fiche: {
      regle:
        "Le champ lexical est l'ensemble des mots (noms, verbes, adjectifs...) qui se rapportent à un même thème dans un texte.",
      exemple:
        "✅ Champ lexical de la mer : vagues, tempête, horizon, naviguer, marin, côte, profond... Champ lexical de la peur : trembler, frayeur, pâlir, terrifier...",
      piege:
        "Champ lexical ≠ famille de mots. Famille = mots dérivés du même radical. Champ lexical = mots liés par le THÈME.",
      astuce:
        "Champ lexical = famille THÉMATIQUE. Repère-le dans un texte pour identifier le sujet principal !",
    },
  },
  {
    question: "Qu'est-ce qu'un homonyme ?",
    options: [
      "Un mot de même sens",
      "Un mot de sens contraire",
      "Un mot qui se prononce pareil mais s'écrit différemment",
      "Un mot de même famille",
    ],
    answer: "Un mot qui se prononce pareil mais s'écrit différemment",
    fiche: {
      regle:
        "Les homophones (homonymes phonétiques) ont la même prononciation mais une orthographe et/ou un sens différents.",
      exemple:
        "✅ Mer/mère/maire. Verre/ver/vers/vert. Son/sont. Peut/peux/peu.",
      piege:
        "Homonymes ≠ synonymes. Les homonymes ont le même SON mais des sens différents. Les synonymes ont des sens proches.",
      astuce:
        "Homonymes = même son, sens différent. Mer/mère/maire. Verre/vert/vers/ver. Attention au contexte !",
    },
  },
  {
    question: "Qu'est-ce qu'un mot polysémique ?",
    options: [
      "Un mot qui n'a qu'un seul sens",
      "Un mot qui a plusieurs sens",
      "Un mot d'origine étrangère",
      "Un mot très rare",
    ],
    answer: "Un mot qui a plusieurs sens",
    fiche: {
      regle:
        "Un mot polysémique possède plusieurs sens. Le contexte permet de déterminer quel sens est utilisé. La plupart des mots courants sont polysémiques.",
      exemple:
        "✅ 'Vague' = (1) ondulation de la mer, (2) imprécis/flou. 'Vol' = (1) trajet en avion, (2) larcin. 'Grève' = (1) plage, (2) arrêt de travail.",
      piege:
        "Polysémique ≠ homonyme. Polysémique = UN mot avec PLUSIEURS sens liés. Homonyme = DEUX mots différents qui sonnent pareil.",
      astuce:
        "Polysémique = poly (plusieurs) + sème (sens). Un seul mot, plusieurs sens. Contexte essentiel pour comprendre !",
    },
  },
  {
    question: "Qu'est-ce que l'étymologie ?",
    options: [
      "La définition d'un mot",
      "L'étude de l'origine et de l'histoire des mots",
      "La liste des synonymes",
      "La prononciation d'un mot",
    ],
    answer: "L'étude de l'origine et de l'histoire des mots",
    fiche: {
      regle:
        "L'étymologie étudie l'origine et l'évolution des mots. Elle permet souvent de comprendre le sens d'un mot inconnu grâce aux racines grecques ou latines.",
      exemple:
        "✅ 'Philosophie' = philos (ami) + sophos (sagesse) = 'amour de la sagesse'. 'Biologie' = bios (vie) + logos (étude) = 'étude du vivant'.",
      piege:
        "L'étymologie ne donne pas toujours le sens actuel exact. Les mots évoluent ! Mais les racines aident à déduire le sens.",
      astuce:
        "Bio = vie. Logos = étude/parole. Philo = amour. Anthropo = homme. Geo = terre. Ces racines reviennent souvent !",
    },
  },
  {
    question: "Qu'est-ce qu'un préfixe ?",
    options: [
      "Un élément ajouté à la fin d'un mot",
      "Un élément ajouté au début d'un mot pour modifier son sens",
      "La racine d'un mot",
      "Un suffixe",
    ],
    answer: "Un élément ajouté au début d'un mot pour modifier son sens",
    fiche: {
      regle:
        "Le préfixe se place au DÉBUT du mot et modifie son sens. Le suffixe se place à la FIN. Ensemble avec le radical, ils forment des mots dérivés.",
      exemple:
        "✅ Re- (recommencer), dé- (défaire), in- (impossible), pré- (prévoir), sur- (surpasser), sous- (sous-chef).",
      piege:
        "Préfixe = AVANT le radical. Suffixe = APRÈS. Ne pas les confondre !",
      astuce:
        "PREfixe = avant (au DÉBUT). SUFfixe = après (à la FIN). RADICAL = la racine centrale du mot.",
    },
  },
  {
    question: "Qu'est-ce qu'un néologisme ?",
    options: [
      "Un mot très ancien",
      "Un mot nouveau créé récemment",
      "Un mot d'origine latine",
      "Un mot à sens contraire",
    ],
    answer: "Un mot nouveau créé récemment",
    fiche: {
      regle:
        "Un néologisme est un mot nouveau, récemment créé ou emprunté à une autre langue. La langue évolue constamment avec de nouveaux mots.",
      exemple:
        "✅ Selfie, hashtag, covoiturage, baladodiffusion (podcast), logiciel, informatique étaient des néologismes à leur époque.",
      piege:
        "Un néologisme peut devenir un mot courant avec le temps. 'Informatique' était un néologisme dans les années 1960 !",
      astuce:
        "Néo = nouveau. Néologisme = mot nouveau. Les réseaux sociaux créent beaucoup de néologismes : selfie, tweet, liker...",
    },
  },
  {
    question: "Quelle est la différence entre sens propre et sens figuré ?",
    options: [
      "Le sens propre est plus récent",
      "Le sens propre est littéral, le sens figuré est imagé/métaphorique",
      "Le sens figuré est plus courant",
      "Il n'y a pas de différence",
    ],
    answer:
      "Le sens propre est littéral, le sens figuré est imagé/métaphorique",
    fiche: {
      regle:
        "Sens propre = sens premier, concret, littéral. Sens figuré = sens imagé, métaphorique, dérivé du sens propre.",
      exemple:
        "✅ 'Croquer' : propre = mordre (croquer une pomme). Figuré = représenter (croquer un paysage). 'Brûlant' : propre = très chaud. Figuré = urgent (sujet brûlant).",
      piege:
        "Ne pas confondre sens propre (réel) et sens figuré (imagé). 'Il a le cœur brisé' = sens figuré (il est triste, pas de fracture réelle).",
      astuce:
        "Propre = CONCRET/RÉEL. Figuré = IMAGÉ/MÉTAPHORE. 'Cœur brisé' → pas cassé pour de vrai = sens figuré !",
    },
  },
  {
    question: "Qu'est-ce qu'un emprunt linguistique ?",
    options: [
      "Un mot qu'on emprunte à quelqu'un",
      "Un mot adopté d'une autre langue",
      "Un mot qu'on oublie",
      "Un mot vieilli",
    ],
    answer: "Un mot adopté d'une autre langue",
    fiche: {
      regle:
        "L'emprunt linguistique est un mot adopté d'une langue étrangère. Le français a emprunté beaucoup de mots à l'anglais (anglicismes), à l'arabe, à l'italien, à l'espagnol...",
      exemple:
        "✅ Anglicismes : football, sandwich, week-end, baby-sitter, hamburger. Arabismes : algèbre, zéro, café, sofa. Italianismes : balcon, banque, carnaval.",
      piege:
        "Les emprunts sont intégrés dans la langue et ne sont pas des erreurs ! 'Football' est un mot français maintenant.",
      astuce:
        "Emprunt = mot d'une autre langue intégré. Anglicisme (anglais), arabisme (arabe), italianisme (italien). Normal et naturel !",
    },
  },
];

export default function LeLexiquePage() {
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
          <div className="lecon-badge">📝 Français — 4ème</div>
          <h1 className="lecon-titre">Le lexique</h1>
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
            Enrichis ton <strong>vocabulaire</strong> : synonymes, antonymes,
            homonymes, champs lexicaux, étymologie et formation des mots.
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
                🔤 Relations entre les mots
              </div>
              <div className="lecon-point-texte">
                Synonymes (sens proche). Antonymes (sens contraire). Homophones
                (même son, sens différent). Polysémie (plusieurs sens).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Beau/joli
                (syno). Grand/petit (anto). Mer/mère/maire (homo).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🌳 Formation des mots</div>
              <div className="lecon-point-texte">
                Préfixe (avant) + Radical + Suffixe (après). Étymologie =
                origine des mots (racines grecques/latines). Néologismes = mots
                nouveaux.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span>{" "}
                Re+faire=refaire. Bio (vie) + logie (étude) = biologie.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎯 Sens propre et figuré</div>
              <div className="lecon-point-texte">
                Sens propre = concret/littéral. Sens figuré =
                imagé/métaphorique. Champ lexical = ensemble de mots liés à un
                thème.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Cœur brisé' =
                figuré (triste). 'Croquer une pomme' = propre (mordre).
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
