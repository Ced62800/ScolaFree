"use client";

import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "classes-de-mots";

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
    question:
      "Quelle est la classe grammaticale du mot souligné : « Le chat dort. » (Le)",
    options: ["Nom", "Déterminant", "Adjectif", "Pronom"],
    answer: "Déterminant",
    fiche: {
      regle:
        "Le déterminant accompagne le nom et s'accorde avec lui en genre et en nombre. Les déterminants les plus courants sont les articles : le, la, les, un, une, des.",
      exemple:
        "✅ Le chat (masc. sing.) / La chatte (fém. sing.) / Les chats (masc. plur.)",
      piege:
        "Ne pas confondre 'le' déterminant (devant un nom) et 'le' pronom (qui remplace un nom) : 'Je le vois' → pronom.",
      astuce:
        "Le déterminant est toujours collé à un nom. Si tu peux le remplacer par 'un' ou 'une', c'est un déterminant !",
    },
  },
  {
    question: "Quelle est la classe grammaticale du mot : « courir » ?",
    options: ["Nom", "Adjectif", "Verbe", "Adverbe"],
    answer: "Verbe",
    fiche: {
      regle:
        "Le verbe exprime une action, un état ou une existence. Il se conjugue (change selon la personne, le temps). À l'infinitif, il se termine par -er, -ir, -re, -oir.",
      exemple: "✅ courir (action) / être (état) / sembler (existence)",
      piege:
        "Attention aux noms formés sur des verbes : 'la course' est un nom, 'courir' est un verbe !",
      astuce:
        "Le verbe est le seul mot qui se conjugue. Essaie de le mettre au passé ou au futur — si ça marche, c'est un verbe !",
    },
  },
  {
    question:
      "Quelle est la classe grammaticale du mot souligné : « Une belle maison. » (belle)",
    options: ["Nom", "Déterminant", "Adjectif qualificatif", "Verbe"],
    answer: "Adjectif qualificatif",
    fiche: {
      regle:
        "L'adjectif qualificatif donne une qualité ou une caractéristique au nom. Il s'accorde en genre et en nombre avec le nom qu'il qualifie.",
      exemple:
        "✅ Une belle maison (fém. sing.) / De beaux jardins (masc. plur.)",
      piege:
        "L'adjectif peut être placé avant ou après le nom : 'une belle fleur' ou 'une fleur magnifique'.",
      astuce:
        "L'adjectif répond à la question 'Comment est le nom ?' Si tu peux demander 'comment est-il/elle ?', c'est un adjectif !",
    },
  },
  {
    question: "Quelle est la classe grammaticale du mot : « rapidement » ?",
    options: ["Adjectif", "Nom", "Adverbe", "Préposition"],
    answer: "Adverbe",
    fiche: {
      regle:
        "L'adverbe est un mot invariable qui modifie un verbe, un adjectif ou un autre adverbe. Beaucoup d'adverbes se terminent en -ment.",
      exemple:
        "✅ Il court rapidement. (modifie le verbe) / Elle est très belle. (modifie l'adjectif)",
      piege:
        "L'adverbe ne s'accorde jamais ! Il reste toujours invariable, même si le nom est féminin ou pluriel.",
      astuce:
        "Si le mot se termine en -ment et qu'il est invariable, c'est presque toujours un adverbe !",
    },
  },
  {
    question:
      "Dans la phrase « Elle mange une pomme », quelle est la classe de « Elle » ?",
    options: ["Nom propre", "Déterminant", "Pronom personnel", "Adjectif"],
    answer: "Pronom personnel",
    fiche: {
      regle:
        "Le pronom personnel remplace un nom pour éviter la répétition. Les pronoms personnels sujets sont : je, tu, il, elle, nous, vous, ils, elles.",
      exemple:
        "✅ Marie mange → Elle mange. / Les enfants jouent → Ils jouent.",
      piege:
        "Ne pas confondre 'elle' pronom (remplace un nom) et 'elle' dans d'autres constructions.",
      astuce:
        "Le pronom remplace un nom. Cherche le nom qu'il remplace — si tu le trouves, c'est bien un pronom !",
    },
  },
  {
    question: "Quelle est la classe grammaticale du mot : « Paris » ?",
    options: ["Nom commun", "Nom propre", "Adjectif", "Déterminant"],
    answer: "Nom propre",
    fiche: {
      regle:
        "Le nom propre désigne une personne, un lieu ou une chose unique. Il prend toujours une majuscule. Le nom commun désigne une catégorie générale.",
      exemple:
        "✅ Paris, Marie, la France → noms propres / la ville, la fille, le pays → noms communs",
      piege:
        "Attention : 'le français' (la langue) = nom commun / 'un Français' (une personne) = nom propre !",
      astuce:
        "Majuscule = nom propre. Minuscule = nom commun. C'est la règle générale !",
    },
  },
  {
    question:
      "Dans « Le chat mange dans son bol », quelle est la classe de « dans » ?",
    options: ["Adverbe", "Préposition", "Conjonction", "Déterminant"],
    answer: "Préposition",
    fiche: {
      regle:
        "La préposition est un mot invariable qui relie deux éléments de la phrase. Les prépositions les plus courantes : à, de, dans, sur, sous, avec, pour, par, en.",
      exemple:
        "✅ Il marche dans la forêt. / Elle pense à toi. / Le livre est sur la table.",
      piege:
        "Les prépositions sont invariables — elles ne s'accordent jamais !",
      astuce:
        "Retiens les prépositions les plus courantes : à, de, dans, sur, sous, avec, pour, par, en, vers.",
    },
  },
  {
    question: "Quelle est la classe grammaticale du mot : « chien » ?",
    options: ["Nom commun", "Nom propre", "Adjectif", "Verbe"],
    answer: "Nom commun",
    fiche: {
      regle:
        "Le nom commun désigne une catégorie d'êtres, d'objets ou d'idées. Il s'écrit avec une minuscule (sauf en début de phrase) et est souvent accompagné d'un déterminant.",
      exemple: "✅ un chien, la maison, des idées, le bonheur",
      piege:
        "Le nom commun peut être concret (chien, maison) ou abstrait (bonheur, liberté) !",
      astuce:
        "Si tu peux mettre 'un', 'une' ou 'le', 'la' devant le mot, c'est un nom commun !",
    },
  },
  {
    question:
      "Dans « Il travaille mais il joue aussi », quelle est la classe de « mais » ?",
    options: [
      "Préposition",
      "Adverbe",
      "Conjonction de coordination",
      "Pronom",
    ],
    answer: "Conjonction de coordination",
    fiche: {
      regle:
        "La conjonction de coordination relie deux mots, groupes de mots ou propositions de même nature. Les 7 conjonctions de coordination : mais, ou, et, donc, or, ni, car.",
      exemple:
        "✅ Il chante et il danse. / Elle est fatiguée mais elle travaille. / Il pleut donc je prends mon parapluie.",
      piege:
        "Ne pas confondre avec les conjonctions de subordination (que, si, quand...) qui relient une proposition principale et une subordonnée.",
      astuce:
        "Retiens 'mais ou et donc or ni car' — une phrase pour les mémoriser : 'Mais où est donc Ornicar ?'",
    },
  },
  {
    question:
      "Quelle est la classe grammaticale du mot souligné : « Quel beau jardin ! » (Quel)",
    options: [
      "Adjectif qualificatif",
      "Déterminant exclamatif",
      "Pronom",
      "Adverbe",
    ],
    answer: "Déterminant exclamatif",
    fiche: {
      regle:
        "Le déterminant exclamatif (quel, quelle, quels, quelles) s'utilise dans les phrases exclamatives. Il s'accorde en genre et en nombre avec le nom.",
      exemple:
        "✅ Quel beau jardin ! / Quelle chance ! / Quels beaux enfants ! / Quelles belles fleurs !",
      piege:
        "Ne pas confondre 'quel' déterminant exclamatif et 'quel' déterminant interrogatif : 'Quel film regardes-tu ?' (interrogatif).",
      astuce:
        "Dans une phrase exclamative avec !, 'quel/quelle' est toujours un déterminant exclamatif !",
    },
  },
];

export default function ClassesDeMotsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
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
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
    setEtape("quiz");
  };

  const choisirReponse = (option: string) => {
    if (reponseChoisie) return;
    setReponseChoisie(option);
    const correct = option === questions[index].answer;
    setEstCorrecte(correct);
    if (!correct) setFicheOuverte(true);
    else scoreRef.current += 1;
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
    }
  };

  const total = questions.length;

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
          <h1 className="lecon-titre">Les classes de mots</h1>
          <div className="lecon-intro">
            En français, chaque mot appartient à une{" "}
            <strong>classe grammaticale</strong>. Connaître la classe d'un mot
            permet de mieux comprendre son rôle dans la phrase et de mieux
            l'orthographier.
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
              <div className="lecon-point-titre">📌 Les classes variables</div>
              <div className="lecon-point-texte">
                Ces mots <strong>s'accordent</strong> selon le genre et le
                nombre :
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Nom :</span> chat, maison,
                bonheur
                <br />
                <span className="exemple-label">Déterminant :</span> le, un,
                mon, ce
                <br />
                <span className="exemple-label">Adjectif :</span> beau, grand,
                rouge
                <br />
                <span className="exemple-label">Verbe :</span> manger, courir,
                être
                <br />
                <span className="exemple-label">Pronom :</span> il, elle, nous,
                celui
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📌 Les classes invariables
              </div>
              <div className="lecon-point-texte">
                Ces mots <strong>ne s'accordent jamais</strong> :
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Adverbe :</span> rapidement,
                très, bien
                <br />
                <span className="exemple-label">Préposition :</span> à, de,
                dans, sur, avec
                <br />
                <span className="exemple-label">Conjonction :</span> mais, et,
                car, que
                <br />
                <span className="exemple-label">Interjection :</span> ah !, oh
                !, hélas !
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">💡 Astuce générale</div>
              <div className="lecon-point-texte">
                Pour trouver la classe d'un mot, pose-toi ces questions :
              </div>
              <div className="lecon-point-exemple">
                1. Est-ce que ce mot se conjugue ? → <strong>Verbe</strong>
                <br />
                2. Est-ce qu'il accompagne un nom ? →{" "}
                <strong>Déterminant</strong>
                <br />
                3. Est-ce qu'il donne une qualité ? → <strong>Adjectif</strong>
                <br />
                4. Est-ce qu'il remplace un nom ? → <strong>Pronom</strong>
                <br />
                5. Est-ce qu'il est invariable ? →{" "}
                <strong>Adverbe / Préposition / Conjonction</strong>
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
                {!estCorrecte && (
                  <button
                    onClick={() => setFicheOuverte(true)}
                    style={{
                      marginTop: "8px",
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
            <button
              className="lecon-btn"
              onClick={questionSuivante}
              style={{ marginTop: "16px" }}
            >
              {index + 1 >= total
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
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
                onClick={() => setFicheOuverte(false)}
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
