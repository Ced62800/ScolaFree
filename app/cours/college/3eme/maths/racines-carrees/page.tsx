"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "racines-carrees";

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
    question: "Quelle est la valeur exacte de racine(144) ?",
    options: ["11", "12", "13", "14"],
    answer: "12",
    fiche: {
      regle:
        "La racine carree d'un nombre n est le nombre positif dont le carre est egal a n. racine(n) = x signifie x^2 = n et x est positif.",
      exemple:
        "racine(144) = 12 car 12^2 = 144. Carres a connaitre : 1,4,9,16,25,36,49,64,81,100,121,144,169,196,225.",
      piege:
        "La racine carree est toujours positive. racine(144) = 12, pas -12 (meme si (-12)^2 = 144 aussi).",
      astuce:
        "Connaitre les carres parfaits jusqu'a 225 : 1^2=1, 2^2=4, 3^2=9, 4^2=16, 5^2=25, 6^2=36, 7^2=49, 8^2=64, 9^2=81, 10^2=100, 11^2=121, 12^2=144, 13^2=169, 14^2=196, 15^2=225.",
    },
  },
  {
    question: "Simplifie racine(75).",
    options: [
      "5 x racine(3)",
      "3 x racine(5)",
      "15 x racine(1)",
      "25 x racine(3)",
    ],
    answer: "5 x racine(3)",
    fiche: {
      regle:
        "Pour simplifier une racine carree, on cherche le plus grand carre parfait qui divise le nombre. racine(a x b) = racine(a) x racine(b).",
      exemple:
        "75 = 25 x 3. racine(75) = racine(25 x 3) = racine(25) x racine(3) = 5 x racine(3).",
      piege:
        "Ne pas confondre racine(75) = 5 x racine(3) avec 5 x 3 = 15. La racine(3) reste sous le radical.",
      astuce:
        "Decompose le nombre en facteur carre x reste : 75 = 25 x 3. Prends la racine du carre (5) et laisse le reste sous le radical.",
    },
  },
  {
    question: "Calcule racine(3) x racine(12).",
    options: ["racine(15)", "6", "racine(36)", "racine(4)"],
    answer: "6",
    fiche: {
      regle:
        "Propriete : racine(a) x racine(b) = racine(a x b). Puis simplifier si possible.",
      exemple: "racine(3) x racine(12) = racine(3 x 12) = racine(36) = 6.",
      piege:
        "racine(3) x racine(12) n'est pas egale a racine(3+12) = racine(15). La multiplication des racines donne racine du produit.",
      astuce:
        "Racines x racines = racine du produit. Puis cherche si c'est un carre parfait. 3 x 12 = 36 = 6^2, donc racine(36) = 6.",
    },
  },
  {
    question: "Entre quels entiers consecutifs se trouve racine(50) ?",
    options: ["6 et 7", "7 et 8", "5 et 6", "8 et 9"],
    answer: "7 et 8",
    fiche: {
      regle:
        "Pour encadrer racine(n), trouve les deux carres parfaits consecutifs qui encadrent n. Si a^2 < n < b^2, alors a < racine(n) < b.",
      exemple:
        "7^2 = 49 et 8^2 = 64. Comme 49 < 50 < 64, on a 7 < racine(50) < 8. Donc racine(50) est entre 7 et 8.",
      piege:
        "Ne pas confondre racine(50) avec 50/2 = 25. L'encadrement necessite de connaitre les carres parfaits.",
      astuce:
        "Encadrement : trouve les carres de part et d'autre. 7^2 = 49 < 50 < 64 = 8^2, donc 7 < racine(50) < 8.",
    },
  },
  {
    question: "Quelle est la valeur de (racine(5))^2 ?",
    options: ["25", "racine(10)", "5", "2,5"],
    answer: "5",
    fiche: {
      regle:
        "Par definition, (racine(a))^2 = a pour tout a positif. La racine carree et le carre sont des operations inverses.",
      exemple: "(racine(5))^2 = 5. (racine(7))^2 = 7. (racine(100))^2 = 100.",
      piege:
        "(racine(5))^2 n'est pas egal a racine(5^2) = racine(25) = 5 (meme resultat mais raisonnement different). Les deux donnent 5.",
      astuce:
        "Carre et racine carree s'annulent. (racine(a))^2 = a. Toujours. C'est la definition meme de la racine carree.",
    },
  },
  {
    question: "Simplifie racine(48).",
    options: [
      "4 x racine(3)",
      "6 x racine(2)",
      "3 x racine(4)",
      "2 x racine(12)",
    ],
    answer: "4 x racine(3)",
    fiche: {
      regle:
        "48 = 16 x 3. racine(48) = racine(16 x 3) = racine(16) x racine(3) = 4 x racine(3). Chercher le PLUS GRAND carre parfait diviseur.",
      exemple:
        "48 = 4 x 12 = 16 x 3. On choisit 16 (le plus grand carre parfait). racine(48) = 4 x racine(3).",
      piege:
        "Si on prend 4 x 12 : racine(4 x 12) = 2 x racine(12) = 2 x 2 x racine(3) = 4 x racine(3). Meme resultat mais il faut continuer a simplifier.",
      astuce:
        "Toujours prendre le PLUS GRAND carre parfait pour simplifier en une etape. 48 = 16 x 3 (pas 4 x 12).",
    },
  },
  {
    question: "Calcule racine(18) + racine(2).",
    options: ["racine(20)", "4 x racine(2)", "3 x racine(2)", "2 x racine(5)"],
    answer: "4 x racine(2)",
    fiche: {
      regle:
        "Pour additionner des racines carrees, il faut les reduire a la meme forme. racine(18) = racine(9 x 2) = 3 x racine(2). Puis : 3 x racine(2) + racine(2) = 4 x racine(2).",
      exemple:
        "racine(18) = 3 x racine(2). Donc racine(18) + racine(2) = 3 x racine(2) + 1 x racine(2) = 4 x racine(2).",
      piege:
        "racine(18) + racine(2) n'est pas egal a racine(20). On ne peut additionner que des racines IDENTIQUES.",
      astuce:
        "Additionner des racines = simplifier d'abord, puis factoriser. Comme les fractions : meme denominateur pour additionner.",
    },
  },
  {
    question: "Quelle est la racine carree de 0,25 ?",
    options: ["0,5", "0,125", "0,025", "5"],
    answer: "0,5",
    fiche: {
      regle:
        "racine(0,25) = racine(25/100) = racine(25) / racine(100) = 5/10 = 0,5. La propriete racine(a/b) = racine(a)/racine(b) s'applique.",
      exemple:
        "0,25 = 1/4. racine(1/4) = racine(1)/racine(4) = 1/2 = 0,5. Verification : 0,5^2 = 0,25.",
      piege:
        "racine(0,25) n'est pas 0,25/2 = 0,125. La racine carree n'est pas une division par 2.",
      astuce:
        "Convertir en fraction : 0,25 = 1/4. racine(1/4) = 1/2 = 0,5. Ou memoriser : racine(0,25) = 0,5.",
    },
  },
  {
    question: "Que vaut racine(a^2) pour a positif ?",
    options: ["a^2", "2a", "a", "racine(a)"],
    answer: "a",
    fiche: {
      regle:
        "Pour tout reel a positif ou nul, racine(a^2) = a. La racine carree et le carre s'annulent pour les nombres positifs.",
      exemple:
        "racine(5^2) = racine(25) = 5. racine(7^2) = racine(49) = 7. racine(x^2) = x si x est positif.",
      piege:
        "Si a est negatif, racine(a^2) = -a (valeur absolue). En 3eme, on considere generalement a positif.",
      astuce:
        "racine(a^2) = a pour a positif. C'est la definition de la racine carree. Carre et racine s'annulent.",
    },
  },
  {
    question: "Laquelle de ces expressions est correcte ?",
    options: [
      "racine(9 + 16) = racine(9) + racine(16)",
      "racine(9 x 16) = racine(9) x racine(16)",
      "racine(9 - 4) = racine(9) - racine(4)",
      "racine(9 / 4) = racine(9) - racine(4)",
    ],
    answer: "racine(9 x 16) = racine(9) x racine(16)",
    fiche: {
      regle:
        "Seule la multiplication se distribue sur les racines : racine(a x b) = racine(a) x racine(b). Les autres operations (addition, soustraction) NE se distribuent PAS.",
      exemple:
        "racine(9 x 16) = racine(144) = 12 = 3 x 4 = racine(9) x racine(16). Mais racine(9+16) = racine(25) = 5, pas 3+4 = 7.",
      piege:
        "racine(a+b) est different de racine(a) + racine(b). C'est une erreur tres frequente ! Seul le produit se distribue.",
      astuce:
        "Regle d'or : racine(a x b) = racine(a) x racine(b). Tout le reste (addition, soustraction) NE fonctionne PAS avec les racines.",
    },
  },
];

export default function RacinesCarreesPage() {
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
          <div className="lecon-badge">√ Maths — 3ème</div>
          <h1 className="lecon-titre">Les racines carrees</h1>
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
              Mode decouverte — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Inscris-toi
              </span>{" "}
              pour les 10 questions completes !
            </div>
          )}
          <div className="lecon-intro">
            En 3eme, tu maitrises les <strong>racines carrees</strong> :
            definition, simplification, operations et encadrement.
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
                📖 Definition et carres parfaits
              </div>
              <div className="lecon-point-texte">
                racine(n) = x signifie x^2 = n et x positif. Carres parfaits :
                1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> racine(144) =
                12 car 12^2 = 144. (racine(5))^2 = 5.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✂️ Simplification</div>
              <div className="lecon-point-texte">
                racine(a x b) = racine(a) x racine(b). Pour simplifier : trouver
                le plus grand carre parfait diviseur. Attention : racine(a+b)
                est different de racine(a) + racine(b) !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> racine(75) =
                racine(25 x 3) = 5 x racine(3). racine(48) = 4 x racine(3).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Encadrement</div>
              <div className="lecon-point-texte">
                Pour encadrer racine(n) : trouver a et b tels que a^2 {"<"} n{" "}
                {"<"} b^2. Alors a {"<"} racine(n) {"<"} b.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 7^2 = 49 {"<"}{" "}
                50 {"<"} 64 = 8^2, donc 7 {"<"} racine(50) {"<"} 8.
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
              {scoreRef.current} bonne{scoreRef.current > 1 ? "s" : ""} reponse
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
                  {estCorrecte ? "Bravo !" : "Pas tout a fait..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellente reponse !"
                    : `La bonne reponse est : "${q.answer}"`}
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
                    📖 Voir la fiche pedagogique
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
                  📖 Lis la fiche pour debloquer !
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
                  ? "Voir mon resultat →"
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
                📖 Fiche pedagogique
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
                  📚 La regle
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
                  ⚠️ Le piege
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
          ? "Bien joue !"
          : "Continue a t'entrainer !";
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
            Tu as repondu correctement a {scoreRef.current} question
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
                Mode decouverte. Inscris-toi pour les 10 questions !
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
                S'inscrire gratuitement →
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
              🔄 Reessayer
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
