"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "groupe-nominal";

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
  fiche: {
    regle: string;
    exemple: string;
    piege: string;
    astuce: string;
  };
};

const questionsBase: Question[] = [
  {
    question: "Qu'est-ce qu'un groupe nominal (GN) ?",
    options: [
      "Un verbe et son sujet",
      "Un nom et les mots qui l'accompagnent",
      "Une phrase complète",
      "Un adverbe et un adjectif",
    ],
    answer: "Un nom et les mots qui l'accompagnent",
    fiche: {
      regle:
        "Le groupe nominal (GN) est un groupe de mots construit autour d'un nom. Il est composé au minimum d'un déterminant et d'un nom.",
      exemple:
        "✅ le chat / une belle maison / ces trois petits enfants curieux",
      piege:
        "Un nom seul n'est pas un groupe nominal complet. Il faut au minimum un déterminant : 'chat' ≠ GN / 'le chat' = GN.",
      astuce:
        "Le groupe nominal répond à la question 'qui ?' ou 'quoi ?' devant le verbe. C'est souvent le sujet ou le complément !",
    },
  },
  {
    question:
      "Quel est le nom noyau dans ce groupe nominal : « une belle robe rouge » ?",
    options: ["une", "belle", "robe", "rouge"],
    answer: "robe",
    fiche: {
      regle:
        "Le nom noyau est le mot le plus important du groupe nominal. Tous les autres mots du GN sont là pour le préciser ou le qualifier.",
      exemple:
        "✅ 'une belle robe rouge' → robe est le noyau / 'le petit chien blanc' → chien est le noyau",
      piege:
        "Ne pas confondre le nom noyau avec les adjectifs qui l'entourent. Les adjectifs qualifient le nom mais ne sont pas le noyau !",
      astuce:
        "Pour trouver le nom noyau, supprime tous les adjectifs et le déterminant — ce qui reste est le noyau !",
    },
  },
  {
    question: "Lequel de ces groupes est un groupe nominal ?",
    options: [
      "mange rapidement",
      "le petit chien blanc",
      "très joyeusement",
      "parce que",
    ],
    answer: "le petit chien blanc",
    fiche: {
      regle:
        "Un groupe nominal contient obligatoirement un nom (noyau) et un déterminant. Il peut aussi contenir des adjectifs, des compléments du nom...",
      exemple:
        "✅ le petit chien blanc = déterminant + adjectif + nom + adjectif",
      piege:
        "'mange rapidement' est un groupe verbal, pas un GN. Un GN ne peut pas commencer par un verbe conjugué !",
      astuce:
        "Cherche le nom — si tu en trouves un avec un déterminant, c'est un GN !",
    },
  },
  {
    question: "Dans « le livre de mon ami », quel est le complément du nom ?",
    options: ["le livre", "de mon ami", "mon ami", "livre"],
    answer: "de mon ami",
    fiche: {
      regle:
        "Le complément du nom (CDN) est un groupe de mots qui précise le nom noyau. Il est souvent introduit par les prépositions 'de', 'à', 'en'.",
      exemple:
        "✅ le livre de mon ami → 'de mon ami' complète 'livre' / la maison en pierre → 'en pierre' complète 'maison'",
      piege:
        "Le complément du nom commence souvent par 'de' mais pas toujours ! Ex : 'un sac à dos', 'une table en bois'.",
      astuce:
        "Pour repérer le CDN, pose la question 'quel + nom ?' : 'quel livre ?' → 'le livre de mon ami' → CDN = 'de mon ami'.",
    },
  },
  {
    question: "Comment s'accorde l'adjectif dans un GN ?",
    options: [
      "Il ne s'accorde pas",
      "Il s'accorde avec le verbe",
      "Il s'accorde en genre et en nombre avec le nom noyau",
      "Il s'accorde uniquement en nombre",
    ],
    answer: "Il s'accorde en genre et en nombre avec le nom noyau",
    fiche: {
      regle:
        "Dans un groupe nominal, l'adjectif qualificatif s'accorde toujours en genre (masculin/féminin) et en nombre (singulier/pluriel) avec le nom noyau.",
      exemple:
        "✅ un petit chat → petit (masc. sing.) / une petite chatte → petite (fém. sing.) / de petits chats → petits (masc. plur.)",
      piege:
        "Si le GN contient plusieurs noms de genres différents, l'adjectif se met au masculin pluriel : 'un garçon et une fille heureux'.",
      astuce:
        "Trouve le nom noyau → regarde son genre et son nombre → accorde l'adjectif pareil !",
    },
  },
  {
    question: "Lequel de ces GN est correctement accordé ?",
    options: [
      "des belle fleurs rouge",
      "des belles fleurs rouges",
      "des belle fleur rouge",
      "des belles fleur rouge",
    ],
    answer: "des belles fleurs rouges",
    fiche: {
      regle:
        "Dans un GN au pluriel, le déterminant, le nom ET tous les adjectifs prennent la marque du pluriel (généralement -s).",
      exemple:
        "✅ une belle fleur rouge → des belles fleurs rouges (tout s'accorde au féminin pluriel)",
      piege:
        "Oublier d'accorder l'adjectif APRÈS le nom est une erreur très fréquente ! 'rouges' s'accorde aussi !",
      astuce:
        "Dans un GN, tous les mots variables (déterminant, adjectifs) s'accordent avec le nom noyau !",
    },
  },
  {
    question: "Quel est le rôle du déterminant dans un groupe nominal ?",
    options: [
      "Il indique l'action du nom",
      "Il introduit le nom et indique son genre et son nombre",
      "Il qualifie le nom",
      "Il remplace le nom",
    ],
    answer: "Il introduit le nom et indique son genre et son nombre",
    fiche: {
      regle:
        "Le déterminant introduit le nom dans la phrase. Il s'accorde avec le nom et permet de connaître son genre (masc./fém.) et son nombre (sing./plur.).",
      exemple:
        "✅ le (masc. sing.) / la (fém. sing.) / les (plur.) / un (masc. sing.) / une (fém. sing.) / des (plur.)",
      piege:
        "Ne pas confondre déterminant et adjectif : le déterminant introduit le nom, l'adjectif le qualifie.",
      astuce:
        "Le déterminant est toujours juste avant le nom (ou avant l'adjectif qui précède le nom) !",
    },
  },
  {
    question:
      "Dans « ces magnifiques oiseaux migrateurs », combien d'adjectifs y a-t-il ?",
    options: ["0", "1", "2", "3"],
    answer: "2",
    fiche: {
      regle:
        "Un GN peut contenir plusieurs adjectifs. Ils peuvent être placés avant ou après le nom noyau, et tous s'accordent avec le nom.",
      exemple:
        "✅ 'ces magnifiques oiseaux migrateurs' : magnifiques (avant le nom) + migrateurs (après le nom) = 2 adjectifs",
      piege:
        "'ces' est un déterminant démonstratif, pas un adjectif ! Ne pas le compter comme adjectif.",
      astuce:
        "Cherche les mots qui donnent des informations sur le nom — qualité, caractéristique. Ce sont les adjectifs !",
    },
  },
  {
    question:
      "Quelle expansion enrichit le GN dans : « la maison avec un grand jardin » ?",
    options: [
      "Un adjectif qualificatif",
      "Un complément du nom",
      "Un pronom",
      "Un adverbe",
    ],
    answer: "Un complément du nom",
    fiche: {
      regle:
        "Le GN peut être enrichi par différentes expansions : adjectif qualificatif, complément du nom (introduit par une préposition) ou proposition relative.",
      exemple:
        "✅ la maison rouge → adjectif / la maison de Pierre → CDN / la maison qui est belle → proposition relative",
      piege:
        "'avec un grand jardin' commence par une préposition → c'est un complément du nom, pas un adjectif !",
      astuce:
        "Si l'expansion commence par une préposition (de, à, avec, en...), c'est un complément du nom !",
    },
  },
  {
    question: "Lequel de ces groupes nominaux est au féminin singulier ?",
    options: [
      "un grand chien",
      "des petites souris",
      "une jolie fleur",
      "les beaux oiseaux",
    ],
    answer: "une jolie fleur",
    fiche: {
      regle:
        "Pour identifier le genre et le nombre d'un GN, regarde le déterminant : 'une' = féminin singulier / 'un' = masculin singulier / 'des/les' = pluriel.",
      exemple:
        "✅ une jolie fleur → 'une' = fém. sing. / un grand chien → 'un' = masc. sing. / les beaux oiseaux → 'les' = plur.",
      piege:
        "Ne regarde pas l'adjectif pour déterminer le genre — regarde le déterminant qui est le plus fiable !",
      astuce:
        "Le déterminant est la clé ! 'une' → féminin singulier, toujours !",
    },
  },
];

export default function GroupeNominalPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(false);
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
    const charger = async () => {
      const best = await getBestScore(CLASSE, MATIERE, THEME);
      const last = await getLastScore(CLASSE, MATIERE, THEME);
      setBestScore(best);
      setLastScore(last);
    };
    charger();
  }, []);

  const demarrer = () => {
    const q = shuffleArray(questionsBase).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setQuestions(q);
    scoreRef.current = 0;
    fautesRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
    setFicheObligatoireLue(false);
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
      if (fautesRef.current === 1) {
        setFicheOuverte(true);
        setFicheObligatoireLue(false);
      } else if (fautesRef.current === 6) {
        setFicheObligatoireLue(false);
      }
    }
  };

  const questionSuivante = async () => {
    setFicheOuverte(false);
    if (index + 1 >= questions.length) {
      if (!scoreSaved.current) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questions.length,
        });
        const best = await getBestScore(CLASSE, MATIERE, THEME);
        const last = await getLastScore(CLASSE, MATIERE, THEME);
        setBestScore(best);
        setLastScore(last);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
      setEstCorrecte(null);
      setFicheObligatoireLue(false);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current === 6;
  const boutonBloque = est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">📖 Français — 6ème</div>
          <h1 className="lecon-titre">Le groupe nominal</h1>
          <div className="lecon-intro">
            Le <strong>groupe nominal (GN)</strong> est un groupe de mots
            organisé autour d'un nom. C'est l'un des éléments essentiels de la
            phrase française !
          </div>

          {(bestScore || lastScore) && (
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
              <div className="lecon-point-titre">🏗️ La structure du GN</div>
              <div className="lecon-point-texte">
                Un GN est composé au minimum d'un <strong>déterminant</strong> +
                un <strong>nom noyau</strong>. On peut l'enrichir avec des
                adjectifs ou des compléments.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Minimal :</span> le chat
                <br />
                <span className="exemple-label">Enrichi :</span> le petit chat
                blanc de ma voisine
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎯 Le nom noyau</div>
              <div className="lecon-point-texte">
                Le <strong>nom noyau</strong> est le mot principal du GN. Tous
                les autres mots s'accordent avec lui.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> "une belle robe
                rouge" → <strong>robe</strong> est le noyau → belle et rouge
                sont au féminin singulier
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">➕ Les expansions du GN</div>
              <div className="lecon-point-texte">
                On peut enrichir un GN avec :
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Adjectif :</span> un grand
                jardin
                <br />
                <span className="exemple-label">Complément du nom :</span> le
                jardin de la maison
                <br />
                <span className="exemple-label">Proposition relative :</span> le
                jardin qui est fleuri
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✅ L'accord dans le GN</div>
              <div className="lecon-point-texte">
                Le déterminant et les adjectifs s'accordent en{" "}
                <strong>genre</strong> et en <strong>nombre</strong> avec le nom
                noyau.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Sing. :</span> une belle fleur
                rouge
                <br />
                <span className="exemple-label">Plur. :</span> des belles fleurs
                rouges
              </div>
            </div>
          </div>

          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
          </button>
        </div>
      </div>
    );
  }

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
              let className = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) className += " correct";
                else if (option === reponseChoisie) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={option}
                  className={className}
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
                      Tu dois relire la fiche pédagogique avant de continuer.
                      Elle est là pour t'aider ! 💪
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
                  📖 Lis la fiche pédagogique pour débloquer la question
                  suivante !
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
          {(bestScore || lastScore) && (
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
