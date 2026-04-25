"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "maths";
const THEME = "nombres-decimaux";

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
    question: "Quel est le chiffre des centièmes dans 45,382 ?",
    options: ["4", "3", "8", "2"],
    answer: "8",
    fiche: {
      regle:
        "Dans un nombre décimal, après la virgule : dixièmes (1er rang), centièmes (2ème rang), millièmes (3ème rang).",
      exemple: "✅ 45,382 : 3 = dixièmes / 8 = centièmes / 2 = millièmes",
      piege:
        "Ne pas confondre les rangs avant la virgule (entiers) et après (décimaux) !",
      astuce:
        "Après la virgule : 1er chiffre = dixièmes, 2ème = centièmes, 3ème = millièmes !",
    },
  },
  {
    question: "Lequel de ces nombres est le plus grand ?",
    options: ["3,09", "3,9", "3,090", "3,19"],
    answer: "3,9",
    fiche: {
      regle:
        "Pour comparer des décimaux : on compare d'abord la partie entière, puis les chiffres après la virgule rang par rang.",
      exemple:
        "✅ 3,9 = 3,900 et 3,19 = 3,190 : 9 dixièmes est plus grand que 1 dixième",
      piege:
        "3,9 n'est pas plus petit que 3,19 ! 3,9 = 3,90 qui est plus grand que 3,19.",
      astuce:
        "Ajoute des zéros pour avoir le même nombre de décimales et compare chiffre par chiffre !",
    },
  },
  {
    question: "Comment écrit-on sept unités et cinq centièmes ?",
    options: ["7,5", "7,05", "7,50", "70,5"],
    answer: "7,05",
    fiche: {
      regle:
        "Cinq centièmes = 5 au rang des centièmes (2ème rang après la virgule). Le rang des dixièmes est vide donc on met 0.",
      exemple:
        "✅ 7 unités et 5 centièmes = 7,05 (le 0 occupe la place des dixièmes)",
      piege:
        "7,5 = 7 et 5 dixièmes, ce n'est pas 7 et 5 centièmes. Ne pas oublier le zéro des dixièmes !",
      astuce:
        "Centièmes = 2ème rang après la virgule. Si le 1er rang est vide mets un 0 !",
    },
  },
  {
    question: "Quel est l'arrondi de 6,847 au dixième près ?",
    options: ["6,8", "6,9", "7,0", "6,85"],
    answer: "6,8",
    fiche: {
      regle:
        "Pour arrondir au dixième : on regarde le chiffre des centièmes. Si ce chiffre est 5 ou plus on monte. Si moins de 5 on reste.",
      exemple: "✅ 6,847 : centièmes = 4, moins de 5 donc on garde 6,8",
      piege: "6,847 : centièmes = 4 donc on reste à 6,8 et non 6,9 !",
      astuce:
        "Règle du 5 : centièmes 5 ou plus monte, moins de 5 reste. 4 est moins de 5 donc 6,8 !",
    },
  },
  {
    question: "Range dans l'ordre croissant : 0,5 / 0,15 / 0,51 / 0,05",
    options: [
      "0,05 < 0,15 < 0,5 < 0,51",
      "0,5 < 0,51 < 0,15 < 0,05",
      "0,05 < 0,5 < 0,15 < 0,51",
      "0,15 < 0,05 < 0,51 < 0,5",
    ],
    answer: "0,05 < 0,15 < 0,5 < 0,51",
    fiche: {
      regle:
        "Pour comparer : aligne les virgules et compare chiffre par chiffre. Ajoute des zéros si nécessaire.",
      exemple:
        "✅ 0,05 / 0,15 / 0,50 / 0,51 : 5 centièmes, 15 centièmes, 50 centièmes, 51 centièmes",
      piege:
        "0,5 n'est pas égal à 0,05 ! 0,5 = 5 dixièmes = 50 centièmes, bien plus grand que 0,05 !",
      astuce:
        "Transforme tout en centièmes : 0,5 = 50 centièmes / 0,15 = 15 centièmes, facile à comparer !",
    },
  },
  {
    question: "Quelle est la valeur du chiffre 7 dans 12,074 ?",
    options: ["7 dixièmes", "7 centièmes", "7 millièmes", "7 unités"],
    answer: "7 centièmes",
    fiche: {
      regle:
        "Après la virgule : 1er rang = dixièmes / 2ème rang = centièmes / 3ème rang = millièmes.",
      exemple:
        "✅ 12,074 : 0 = dixièmes / 7 = centièmes / 4 = millièmes donc 7 centièmes = 0,07",
      piege:
        "Le 0 occupe le rang des dixièmes, donc le 7 est bien au rang des centièmes !",
      astuce:
        "Compte les rangs depuis la virgule : 0 dixièmes, 7 centièmes, 4 millièmes !",
    },
  },
  {
    question: "Combien de dixièmes y a-t-il dans 3,7 ?",
    options: ["3", "7", "37", "0,7"],
    answer: "37",
    fiche: {
      regle:
        "3,7 = 3 unités + 7 dixièmes = 30 dixièmes + 7 dixièmes = 37 dixièmes. Pour trouver le nombre de dixièmes : multiplie par 10.",
      exemple: "✅ 3,7 x 10 = 37 donc il y a 37 dixièmes dans 3,7",
      piege:
        "Ne pas répondre 7 ! Les 3 unités comptent aussi : 3 unités = 30 dixièmes.",
      astuce: "Nombre de dixièmes = nombre x 10. 3,7 x 10 = 37 dixièmes !",
    },
  },
  {
    question: "Quel nombre décimal correspond à 5 + 3/10 + 4/100 ?",
    options: ["5,34", "5,043", "5,304", "53,4"],
    answer: "5,34",
    fiche: {
      regle:
        "3/10 = 3 dixièmes = 0,3 et 4/100 = 4 centièmes = 0,04. Donc 5 + 0,3 + 0,04 = 5,34.",
      exemple: "✅ 5 + 3/10 + 4/100 = 5 + 0,3 + 0,04 = 5,34",
      piege:
        "Ne pas écrire 5,304 ! Le 3 est au rang des dixièmes et le 4 au rang des centièmes.",
      astuce:
        "3/10 donne le 1er chiffre après la virgule, 4/100 donne le 2ème donc 5,34 !",
    },
  },
  {
    question: "Lequel de ces nombres est égal à 2,50 ?",
    options: ["2,500", "2,05", "25,0", "0,25"],
    answer: "2,500",
    fiche: {
      regle:
        "Un zéro à la fin d'un nombre décimal ne change pas sa valeur : 2,50 = 2,500 = 2,5.",
      exemple:
        "✅ 2,50 = 2,500 (les zéros finaux sont inutiles) / 2,05 est différent de 2,50 !",
      piege:
        "2,05 est différent de 2,50 ! 2,05 a 0 dixième et 5 centièmes. 2,50 a 5 dixièmes et 0 centième.",
      astuce:
        "Les zéros à la fin d'un décimal ne changent pas la valeur : 2,50 = 2,500 !",
    },
  },
  {
    question: "Quelle opération donne 0,1 ?",
    options: [
      "1 divise par 100",
      "1 divise par 10",
      "10 divise par 1",
      "1 divise par 1000",
    ],
    answer: "1 divise par 10",
    fiche: {
      regle:
        "0,1 = 1 dixième = 1/10. Diviser par 10 déplace la virgule d'un rang vers la gauche.",
      exemple: "✅ 1 / 10 = 0,1 et 1 / 100 = 0,01 et 1 / 1000 = 0,001",
      piege:
        "Ne pas confondre diviser par 10, par 100 et par 1000 qui donnent des résultats très différents !",
      astuce:
        "Diviser par 10 donne 0,1 / par 100 donne 0,01 / par 1000 donne 0,001 !",
    },
  },
];

export default function NombresDecimauxPage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
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
      setFicheObligatoireLue(false);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current === 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🔢 Maths — 6ème</div>
          <h1 className="lecon-titre">Les nombres décimaux</h1>
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
            Les <strong>nombres décimaux</strong> ont une partie entière et une
            partie décimale séparées par une virgule. Ex : 3,14 ou 45,7.
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
              <div className="lecon-point-titre">🔢 Les rangs décimaux</div>
              <div className="lecon-point-texte">
                Après la virgule : <strong>dixièmes</strong> (1er rang),{" "}
                <strong>centièmes</strong> (2ème rang),{" "}
                <strong>millièmes</strong> (3ème rang).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 45,382 : 3
                dixièmes / 8 centièmes / 2 millièmes
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📊 Comparer des décimaux</div>
              <div className="lecon-point-texte">
                Aligne les virgules, ajoute des zéros si nécessaire, puis
                compare chiffre par chiffre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 3,9 vs 3,19 :
                3,90 est plus grand que 3,19 car 9 dixièmes est plus grand que 1
                dixième
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔄 Arrondir</div>
              <div className="lecon-point-texte">
                On regarde le chiffre juste après la position voulue. 5 ou plus
                on monte, moins de 5 on reste.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 6,847 au
                dixième : centièmes = 4, moins de 5 donc 6,8
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
                      Tu dois relire la fiche avant de continuer. Elle est là
                      pour t'aider ! 💪
                    </p>
                  </div>
                )}
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
