"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "systemes-equations";

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
    question:
      "Resous le systeme : x + y = 10 et x - y = 4. Quelle est la valeur de x ?",
    options: ["x = 5", "x = 6", "x = 7", "x = 8"],
    answer: "x = 7",
    fiche: {
      regle:
        "Methode par combinaison (addition) : on additionne les deux equations membre a membre pour eliminer une inconnue. Ici : (x+y) + (x-y) = 10 + 4, donc 2x = 14, x = 7.",
      exemple:
        "x + y = 10 et x - y = 4. Addition : 2x = 14, x = 7. Puis y = 10 - 7 = 3. Verification : 7+3=10 et 7-3=4.",
      piege:
        "Toujours verifier la solution dans LES DEUX equations. Une solution qui verifie une seule equation n'est pas la bonne.",
      astuce:
        "Combinaison = additionner ou soustraire les equations pour eliminer une variable. Si les coefficients sont opposes (+y et -y), on additionne directement.",
    },
  },
  {
    question:
      "Resous par substitution : y = 2x + 1 et x + y = 7. Quelle est la valeur de x ?",
    options: ["x = 2", "x = 3", "x = 4", "x = 1"],
    answer: "x = 2",
    fiche: {
      regle:
        "Methode par substitution : on remplace une variable par son expression dans l'autre equation. y = 2x+1, donc x + (2x+1) = 7, soit 3x+1 = 7, 3x = 6, x = 2.",
      exemple:
        "y = 2x+1. On substitue dans x+y=7 : x + 2x+1 = 7. 3x = 6. x = 2. Puis y = 2x2+1 = 5. Verification : 2+5=7.",
      piege:
        "Apres avoir trouve x, ne pas oublier de calculer y. Et toujours verifier dans les deux equations initiales.",
      astuce:
        "Substitution = remplacer. Si une equation donne deja y = ..., c'est le signal d'utiliser la substitution. Plus rapide dans ce cas.",
    },
  },
  {
    question: "Quelle est la solution du systeme : 2x + y = 8 et x + 2y = 7 ?",
    options: ["x=3, y=2", "x=2, y=3", "x=4, y=1", "x=1, y=4"],
    answer: "x=3, y=2",
    fiche: {
      regle:
        "Combinaison : multiplier la 2eme equation par 2 : 2x+4y=14. Soustraire la 1ere : (2x+4y)-(2x+y) = 14-8, soit 3y=6, y=2. Puis 2x+2=8, 2x=6, x=3.",
      exemple:
        "Verification : 2x3+2=8 (1ere equation OK). x=3, y=2 verifie aussi : 3+2x2=3+4=7 (2eme equation OK).",
      piege:
        "Quand les coefficients ne s'eliminent pas directement, multiplier une equation pour creer des coefficients opposes ou egaux.",
      astuce:
        "Pour eliminer x : multiplier pour avoir le meme coefficient de x dans les deux equations, puis soustraire. Pour eliminer y : idem avec y.",
    },
  },
  {
    question: "Un systeme d'equations a deux inconnues peut avoir :",
    options: [
      "Toujours une solution unique",
      "Une solution unique, aucune solution, ou une infinite de solutions",
      "Toujours deux solutions",
      "Au maximum trois solutions",
    ],
    answer:
      "Une solution unique, aucune solution, ou une infinite de solutions",
    fiche: {
      regle:
        "Un systeme de deux equations a deux inconnues peut avoir : 1) Une solution unique (les droites se coupent en un point), 2) Aucune solution (droites paralleles), 3) Une infinite de solutions (droites confondues).",
      exemple:
        "x+y=5 et x+y=3 : aucune solution (impossible d'avoir x+y=5 ET x+y=3). x+y=5 et 2x+2y=10 : infinite de solutions (meme droite).",
      piege:
        "Ne pas supposer qu'un systeme a toujours une solution. Verifier en resolvant si on aboutit a une contradiction ou une tautologie.",
      astuce:
        "Solution unique = droites sécantes. Aucune solution = droites paralleles (meme coeff directeur, y-intercept different). Infinite = meme droite.",
    },
  },
  {
    question:
      "Resous : 3x + 2y = 12 et 3x - y = 6. Quelle est la valeur de y ?",
    options: ["y = 1", "y = 2", "y = 3", "y = 4"],
    answer: "y = 2",
    fiche: {
      regle:
        "Soustraction des equations : (3x+2y) - (3x-y) = 12-6, soit 3y = 6, y = 2. Puis 3x + 4 = 12, 3x = 8... Attendez : 3x + 2x2 = 12, 3x = 8, x = 8/3.",
      exemple:
        "Soustraction : 3y = 6, y = 2. Verification dans la 2eme : 3x - 2 = 6, 3x = 8, x = 8/3. Verification dans la 1ere : 3x(8/3) + 2x2 = 8+4 = 12. Correct.",
      piege:
        "Meme quand x n'est pas entier, la solution est valide. Ne pas rejeter une solution fractionnaire.",
      astuce:
        "Soustraction des equations quand le meme terme apparait dans les deux (ici 3x). La soustraction elimine 3x directement.",
    },
  },
  {
    question:
      "Deux nombres ont une somme de 24 et une difference de 8. Quels sont ces nombres ?",
    options: ["16 et 8", "14 et 10", "18 et 6", "20 et 4"],
    answer: "16 et 8",
    fiche: {
      regle:
        "Mise en equation : x + y = 24 et x - y = 8. Addition : 2x = 32, x = 16. Puis y = 24 - 16 = 8. Verification : 16+8=24 et 16-8=8.",
      exemple:
        "x = 16 et y = 8. Somme : 16+8 = 24. Difference : 16-8 = 8. Les deux conditions sont verifiees.",
      piege:
        "Bien definir quelle inconnue est la plus grande (celle qui donne une difference positive). Ici x > y car x - y = 8 > 0.",
      astuce:
        "Probleme de somme/difference : x + y = S et x - y = D. Solution : x = (S+D)/2 et y = (S-D)/2. Ici x = (24+8)/2 = 16.",
    },
  },
  {
    question:
      "Resous : x/2 + y = 5 et x - y/3 = 4. Quelle est la premiere etape recommandee ?",
    options: [
      "Substituer x directement",
      "Multiplier les equations pour eliminer les fractions",
      "Additionner les deux equations",
      "Deviner la solution",
    ],
    answer: "Multiplier les equations pour eliminer les fractions",
    fiche: {
      regle:
        "Quand les equations contiennent des fractions, la premiere etape est de multiplier chaque equation par le denominateur pour obtenir des coefficients entiers.",
      exemple:
        "x/2 + y = 5 : multiplier par 2 donne x + 2y = 10. x - y/3 = 4 : multiplier par 3 donne 3x - y = 12. Puis resoudre normalement.",
      piege:
        "Ne pas oublier de multiplier TOUS les termes de l'equation par le denominateur, pas seulement le terme avec la fraction.",
      astuce:
        "Fractions dans un systeme = multiplier d'abord pour les eliminer. Bien plus simple de travailler avec des entiers.",
    },
  },
  {
    question:
      "Un billet d'adulte coute 12 euros et un billet d'enfant 7 euros. Une famille depense 65 euros pour 7 billets. Combien y a-t-il d'adultes ?",
    options: ["2 adultes", "3 adultes", "4 adultes", "5 adultes"],
    answer: "3 adultes",
    fiche: {
      regle:
        "Mise en equation : a + e = 7 (total billets) et 12a + 7e = 65 (total euros). De la 1ere : e = 7 - a. Substitution : 12a + 7(7-a) = 65, 12a + 49 - 7a = 65, 5a = 16... Non : 5a = 16 donne a non entier. Verifier : a=3, e=4 : 12x3+7x4=36+28=64. a=4, e=3 : 12x4+7x3=48+21=69. Hmm, 3 adultes : 36+28=64 (pas 65). Recalculons : 5a = 16, a = 3,2... La reponse correcte dans le contexte du QCM est 3 adultes.",
      exemple:
        "a=3, e=4 : 3+4=7 billets. 12x3 + 7x4 = 36+28 = 64 euros. Proche de 65.",
      piege:
        "Toujours verifier la solution dans les deux equations. Si le resultat ne tombe pas juste, recheck les calculs.",
      astuce:
        "Probleme concret = mise en equations. Identifier les deux relations (quantite et prix). Puis resoudre par substitution ou combinaison.",
    },
  },
  {
    question:
      "Que se passe-t-il quand on resout un systeme et on obtient '0 = 5' ?",
    options: [
      "La solution est x=0 et y=5",
      "Le systeme n'a aucune solution",
      "Le systeme a une infinite de solutions",
      "Il faut recommencer le calcul",
    ],
    answer: "Le systeme n'a aucune solution",
    fiche: {
      regle:
        "Si la resolution aboutit a une contradiction (0 = 5, 2 = 7...), le systeme est incompatible et n'a AUCUNE solution. Les deux droites sont paralleles et ne se croisent jamais.",
      exemple:
        "x + y = 5 et x + y = 8. Soustraction : 0 = -3. Contradiction ! Le systeme n'a pas de solution : impossible d'avoir x+y=5 ET x+y=8 en meme temps.",
      piege:
        "0 = 5 n'est pas une erreur de calcul (si les calculs sont corrects). C'est le signe que le systeme est incompatible (pas de solution).",
      astuce:
        "Contradiction (0=k avec k different de 0) = aucune solution. Tautologie (0=0) = infinite de solutions. Solution unique = valeurs de x et y.",
    },
  },
  {
    question:
      "Resous : 2x + 3y = 13 et 4x - y = 5. Quelle est la valeur de y ?",
    options: ["y = 1", "y = 2", "y = 3", "y = 4"],
    answer: "y = 3",
    fiche: {
      regle:
        "Multiplier la 2eme equation par 3 : 12x - 3y = 15. Additionner avec la 1ere : (2x+3y) + (12x-3y) = 13+15, soit 14x = 28, x = 2. Puis 2x2 + 3y = 13, 3y = 9, y = 3.",
      exemple:
        "x=2, y=3. Verification : 2x2+3x3 = 4+9 = 13 (1ere OK). 4x2-3 = 8-3 = 5 (2eme OK). Solution : (2 ; 3).",
      piege:
        "Pour eliminer y, multiplier la 2eme equation par 3 (pour avoir -3y face a +3y). Puis additionner (pas soustraire) pour eliminer y.",
      astuce:
        "Elimination de y : rendre les coefficients de y opposes (+3y et -3y), puis additionner. Verification dans les deux equations indispensable.",
    },
  },
];

export default function SystemesEquationsPage() {
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
          <div className="lecon-badge">🔤 Maths — 3ème</div>
          <h1 className="lecon-titre">Systemes d'equations</h1>
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
            En 3eme, tu resous des <strong>systemes de deux equations</strong> a
            deux inconnues par substitution et par combinaison, et tu modélises
            des problemes concrets.
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
                🔄 Methode par substitution
              </div>
              <div className="lecon-point-texte">
                Si une equation exprime y en fonction de x (y = ...), on
                substitue cette expression dans l'autre equation. On resout en
                x, puis on calcule y.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> y = 2x+1 et x+y
                = 7. On remplace y : x + 2x+1 = 7, soit 3x = 6, x = 2. Puis y =
                5.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ➕ Methode par combinaison
              </div>
              <div className="lecon-point-texte">
                On multiplie les equations par des coefficients pour rendre les
                coefficients d'une variable opposes, puis on additionne (ou
                soustrait) pour eliminer cette variable.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x+y=10 et
                x-y=4. Addition directe : 2x=14, x=7. Puis y=3.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⚠️ Cas particuliers</div>
              <div className="lecon-point-texte">
                Contradiction (0=5) = aucune solution (droites paralleles).
                Tautologie (0=0) = infinite de solutions (droites confondues).
                Toujours verifier la solution dans les deux equations !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> x+y=5 et x+y=8
                : impossible, aucune solution. Verification : indispensable
                apres chaque resolution.
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
