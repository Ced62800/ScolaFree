"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "le-groupe-nominal";

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
    question: "Qu'est-ce qu'un groupe nominal (GN) ?",
    options: [
      "Un groupe de verbes",
      "Un groupe de mots dont le noyau est un nom",
      "Une proposition subordonnée",
      "Un groupe adverbial",
    ],
    answer: "Un groupe de mots dont le noyau est un nom",
    fiche: {
      regle:
        "Le groupe nominal (GN) est un groupe de mots organisé autour d'un nom noyau, accompagné d'un déterminant et éventuellement d'expansions (adjectifs, compléments...).",
      exemple:
        "✅ 'le grand chien noir' → noyau = chien, déterminant = le, expansions = grand et noir.",
      piege:
        "Le noyau est TOUJOURS un nom (ou pronom). Jamais un verbe ou adjectif.",
      astuce:
        "GN = Déterminant + Nom + (expansions). Sans déterminant ni nom = pas un GN !",
    },
  },
  {
    question: "Qu'est-ce qu'un adjectif épithète ?",
    options: [
      "Un adjectif séparé du nom par un verbe",
      "Un adjectif placé directement à côté du nom qu'il qualifie",
      "Un adjectif employé seul",
      "Un adjectif qui remplace un nom",
    ],
    answer: "Un adjectif placé directement à côté du nom qu'il qualifie",
    fiche: {
      regle:
        "L'adjectif épithète est directement rattaché au nom, sans verbe entre eux. Il peut être placé avant ou après le nom.",
      exemple:
        "✅ 'une belle fleur' → belle est épithète de fleur (direct, pas de verbe entre). 'La fleur est belle' → belle est attribut (verbe 'est' entre).",
      piege:
        "Épithète ≠ attribut. L'attribut est séparé du nom par un verbe d'état (être, paraître, sembler...).",
      astuce:
        "Épithète = COLLÉ au nom. Attribut = SÉPARÉ par un verbe. La belle fleur (épithète) vs La fleur EST belle (attribut).",
    },
  },
  {
    question: "Qu'est-ce qu'une apposition ?",
    options: [
      "Un adjectif épithète",
      "Un nom ou GN placé à côté d'un autre nom pour le préciser",
      "Un pronom relatif",
      "Un complément d'objet",
    ],
    answer: "Un nom ou GN placé à côté d'un autre nom pour le préciser",
    fiche: {
      regle:
        "L'apposition est un nom ou GN placé à côté d'un autre nom (ou pronom) pour apporter une précision. Elle est souvent séparée par des virgules.",
      exemple:
        "✅ 'Paris, capitale de la France, est magnifique.' → 'capitale de la France' est en apposition à Paris.",
      piege:
        "L'apposition est séparée par des virgules en général. Sans virgules, on peut la confondre avec un adjectif épithète.",
      astuce:
        "Apposition = nom qui EXPLIQUE un autre nom. 'Napoléon, général corse, devint empereur.' Général corse = apposition.",
    },
  },
  {
    question: "Qu'est-ce qu'un complément du nom ?",
    options: [
      "Un adjectif épithète",
      "Un groupe nominal qui complète un nom",
      "Un pronom personnel",
      "Un verbe conjugué",
    ],
    answer: "Un groupe nominal qui complète un nom",
    fiche: {
      regle:
        "Le complément du nom est un groupe qui complète un nom noyau. Il est introduit par une préposition (de, à, en, avec...) et apporte une précision sur le nom.",
      exemple:
        "✅ 'la maison de mes parents' → 'de mes parents' est complément du nom 'maison'. 'un verre à vin' → 'à vin' complète 'verre'.",
      piege:
        "Le complément du nom commence toujours par une préposition. Sans préposition = ce n'est pas un CDN.",
      astuce:
        "CDN = toujours introduit par DE, À, EN, AVEC, POUR... Maison DE pierre, couteau À pain, table EN bois.",
    },
  },
  {
    question:
      "Dans 'le vieux livre poussiéreux', combien y a-t-il d'adjectifs épithètes ?",
    options: ["0", "1", "2", "3"],
    answer: "2",
    fiche: {
      regle:
        "Un nom peut avoir plusieurs adjectifs épithètes. Ici 'vieux' et 'poussiéreux' sont tous les deux des épithètes de 'livre'.",
      exemple:
        "✅ 'le vieux livre poussiéreux' = déterminant (le) + adjectif épithète (vieux) + nom (livre) + adjectif épithète (poussiéreux).",
      piege:
        "Ne pas oublier de compter les adjectifs AVANT et APRÈS le nom. Les deux peuvent être épithètes.",
      astuce:
        "Compte tous les adjectifs collés au nom, avant et après. Chacun peut être épithète !",
    },
  },
  {
    question:
      "Quel est le noyau du GN 'une magnifique collection de timbres rares' ?",
    options: ["magnifique", "collection", "timbres", "rares"],
    answer: "collection",
    fiche: {
      regle:
        "Le noyau du GN est le nom principal autour duquel s'organisent les autres éléments. C'est le nom que désigne le GN.",
      exemple:
        "✅ 'une magnifique collection de timbres rares' → une (déterminant) + magnifique (épithète) + collection (NOYAU) + de timbres rares (CDN).",
      piege:
        "Le noyau n'est pas forcément le premier nom. 'De timbres rares' est un CDN, 'timbres' est le noyau du CDN, pas du GN principal.",
      astuce:
        "Cherche le nom principal que désigne tout le groupe. 'Une magnifique collection' → c'est UNE COLLECTION qu'on décrit.",
    },
  },
  {
    question: "Qu'est-ce qu'une proposition relative ?",
    options: [
      "Une proposition principale",
      "Une proposition qui complète un nom introduite par un pronom relatif",
      "Une proposition indépendante",
      "Une proposition circonstancielle",
    ],
    answer:
      "Une proposition qui complète un nom introduite par un pronom relatif",
    fiche: {
      regle:
        "La proposition relative est une expansion du nom, introduite par un pronom relatif (qui, que, dont, où, lequel...). Elle apporte une précision sur le nom antécédent.",
      exemple:
        "✅ 'Le livre que j'ai lu est passionnant.' → 'que j'ai lu' est une relative qui complète 'livre'. Pronom relatif = que.",
      piege:
        "Les pronoms relatifs : qui (sujet), que (COD), dont (CDN ou CC), où (lieu/temps), lequel/laquelle...",
      astuce:
        "Relative = introduite par QUI, QUE, DONT, OÙ, LEQUEL. Elle complète toujours un nom (son antécédent).",
    },
  },
  {
    question:
      "Dans 'la fille qui chante est ma cousine', quelle est la proposition relative ?",
    options: [
      "la fille",
      "qui chante",
      "est ma cousine",
      "la fille qui chante",
    ],
    answer: "qui chante",
    fiche: {
      regle:
        "La proposition relative commence par le pronom relatif. Ici 'qui chante' est introduit par 'qui' et complète 'fille'.",
      exemple:
        "✅ 'la fille [qui chante] est ma cousine.' → 'qui chante' = relative (pronom relatif 'qui' + verbe 'chante').",
      piege:
        "La relative peut être courte. Elle doit contenir un verbe conjugué et être introduite par un pronom relatif.",
      astuce:
        "Trouve le pronom relatif (qui, que, dont, où) → tout ce qui suit jusqu'à la fin de la proposition = la relative.",
    },
  },
  {
    question: "Qu'est-ce qu'un déterminant ?",
    options: [
      "Un adjectif qui qualifie le nom",
      "Un mot qui introduit le nom et en précise le genre et le nombre",
      "Un pronom qui remplace le nom",
      "Un verbe qui précède le nom",
    ],
    answer: "Un mot qui introduit le nom et en précise le genre et le nombre",
    fiche: {
      regle:
        "Le déterminant introduit le nom. Il s'accorde en genre et en nombre avec lui. Types : articles (le, la, les, un, une, des), adjectifs déterminatifs (mon, ce, tout...).",
      exemple:
        "✅ 'le chien' (article défini), 'une fleur' (article indéfini), 'mon livre' (possessif), 'ce garçon' (démonstratif).",
      piege:
        "Tout déterminant s'accorde avec le nom. 'Les chiens' → les = pluriel car chiens = pluriel.",
      astuce:
        "Déterminant = mot qui DÉTERMINE le nom, qui lui donne son genre/nombre. Le, la, les, un, une, des, mon, ce, tout...",
    },
  },
  {
    question: "Comment s'accorde l'adjectif épithète avec le nom ?",
    options: [
      "Il ne s'accorde pas",
      "Il s'accorde en genre et en nombre avec le nom",
      "Il s'accorde seulement en nombre",
      "Il s'accorde avec le sujet",
    ],
    answer: "Il s'accorde en genre et en nombre avec le nom",
    fiche: {
      regle:
        "L'adjectif épithète s'accorde en genre (masculin/féminin) et en nombre (singulier/pluriel) avec le nom qu'il qualifie.",
      exemple:
        "✅ 'un grand garçon' (masc. sg.), 'une grande fille' (fém. sg.), 'de grands garçons' (masc. pl.), 'de grandes filles' (fém. pl.).",
      piege:
        "Ne pas oublier d'accorder les adjectifs AVANT le nom aussi. 'De belles fleurs' (pas 'de beau fleurs').",
      astuce:
        "Adjectif → cherche le nom qu'il qualifie → copie son genre et nombre. Grand → chien (masc. sg.) → grand chien.",
    },
  },
];

export default function LeGroupeNominalPage() {
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
          <div className="lecon-badge">📝 Français — 5ème</div>
          <h1 className="lecon-titre">Le groupe nominal</h1>
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
            En 5ème, tu approfondis l'étude du <strong>groupe nominal</strong> :
            ses expansions (épithète, apposition, complément du nom, relative)
            et ses accords.
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
              <div className="lecon-point-titre">🔤 Structure du GN</div>
              <div className="lecon-point-texte">
                Déterminant + Nom noyau + expansions. Les expansions
                enrichissent le nom.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'le grand chien
                noir de mon voisin qui aboie' = Det + Adj (épithète) + Nom + Adj
                (épithète) + CDN + Relative.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📎 Les expansions du GN</div>
              <div className="lecon-point-texte">
                Adjectif épithète (collé au nom), apposition (nom après
                virgule), complément du nom (introduit par de/à/en...),
                proposition relative (qui, que, dont, où).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Paris,
                capitale de France, que j'aime' → apposition + CDN + relative.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✅ Les accords</div>
              <div className="lecon-point-texte">
                L'adjectif épithète s'accorde en genre et en nombre avec le nom
                noyau.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> une belle fleur
                bleue → belle et bleue s'accordent avec fleur (fém. sg.).
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
