"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "revision-brevet-maths";

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
    question: "Combien de points vaut l'epreuve de maths au Brevet ?",
    options: ["50 points", "75 points", "100 points", "200 points"],
    answer: "100 points",
    fiche: {
      regle:
        "L'epreuve de maths au Brevet vaut 100 points. Elle dure 2 heures et comprend des exercices de calcul, geometrie, statistiques, probabilites et resolution de problemes.",
      exemple:
        "Structure typique : exercice de calcul (20 pts), geometrie (25 pts), statistiques/probabilites (25 pts), probleme (30 pts). Les points varient selon les annees.",
      piege:
        "Ne pas confondre avec le francais (3h). Les maths durent 2h. Bien gerer son temps : ne pas rester bloque sur un exercice.",
      astuce:
        "Brevet maths = 100 pts, 2h. Commencer par les exercices qu'on maitrise. Toujours montrer sa demarche meme si la reponse est fausse.",
    },
  },
  {
    question: "Simplifie l'expression : 3(x + 2) - 2(x - 1)",
    options: ["x + 8", "x + 4", "5x + 8", "x - 4"],
    answer: "x + 8",
    fiche: {
      regle:
        "Developper et reduire : 3(x+2) - 2(x-1) = 3x + 6 - 2x + 2 = x + 8. Attention au signe lors de la distribution : -2 x (-1) = +2.",
      exemple:
        "3(x+2) = 3x + 6. -2(x-1) = -2x + 2. Total : 3x + 6 - 2x + 2 = x + 8.",
      piege:
        "-2(x-1) = -2x + 2, pas -2x - 2. Le signe moins distribue change le signe de chaque terme.",
      astuce:
        "Distribution : multiplier le facteur par CHAQUE terme. Attention aux signes : -2 x (-1) = +2. Reduire en regroupant les termes semblables.",
    },
  },
  {
    question:
      "Dans un triangle ABC rectangle en A, AB = 6 et BC = 10. Calcule sin(C).",
    options: [
      "sin(C) = 6/10",
      "sin(C) = 8/10",
      "sin(C) = 6/8",
      "sin(C) = 10/6",
    ],
    answer: "sin(C) = 6/10",
    fiche: {
      regle:
        "sin(C) = cote oppose a C / hypotenuse = AB / BC = 6/10 = 3/5. L'hypotenuse est BC (en face de l'angle droit A).",
      exemple:
        "Rectangle en A : hypotenuse = BC = 10. Pour angle C : oppose = AB = 6, adjacent = AC. sin(C) = 6/10 = 0,6.",
      piege:
        "Rectangle en A = angle droit en A. L'hypotenuse est BC (en face de A). Pour sin(C) : oppose a C = AB (pas AC).",
      astuce:
        "SOH : Sin = Oppose/Hypotenuse. Identifier d'abord l'hypotenuse (en face de l'angle droit), puis l'oppose a l'angle cherche.",
    },
  },
  {
    question:
      "Une sphere a un rayon de 3 cm. Quel est son volume (en cm^3, arrondi a l'unite) ?",
    options: ["113 cm^3", "36 cm^3", "339 cm^3", "28 cm^3"],
    answer: "113 cm^3",
    fiche: {
      regle:
        "V sphere = (4/3) x pi x r^3 = (4/3) x pi x 27 = 36 x pi environ 113,1 cm^3.",
      exemple:
        "r = 3 cm. r^3 = 27. V = (4/3) x pi x 27 = 36 pi environ 113 cm^3.",
      piege:
        "Ne pas confondre aire (4 pi r^2 = 4 pi x 9 = 36 pi aussi !) et volume. Ici les deux valent 36 pi mais avec des unites differentes (cm^2 vs cm^3).",
      astuce:
        "Sphere : V = (4/3) pi r^3. Aire = 4 pi r^2. Pour r=3 : les deux valent 36 pi ! Retenir les formules et les unites.",
    },
  },
  {
    question: "Dans une serie : 4, 7, 9, 12, 15, 18. Quelle est la mediane ?",
    options: ["9", "10,5", "12", "9,5"],
    answer: "10,5",
    fiche: {
      regle:
        "Serie de 6 valeurs (nombre pair). Mediane = moyenne des 2 valeurs centrales = (9 + 12) / 2 = 10,5.",
      exemple:
        "Positions : 4(1), 7(2), 9(3), 12(4), 15(5), 18(6). Valeurs centrales = 3eme et 4eme = 9 et 12. Mediane = (9+12)/2 = 10,5.",
      piege:
        "Avec un nombre pair de valeurs, la mediane est la MOYENNE des deux valeurs du milieu. Ici (9+12)/2 = 10,5, pas 9 ni 12.",
      astuce:
        "n pair : mediane = moyenne des valeurs de rang n/2 et n/2+1. Ici n=6 : rang 3 (9) et rang 4 (12). Mediane = 10,5.",
    },
  },
  {
    question: "Resous l'equation : 2x + 5 = 13",
    options: ["x = 3", "x = 4", "x = 9", "x = 6"],
    answer: "x = 4",
    fiche: {
      regle:
        "2x + 5 = 13. Soustraire 5 des deux membres : 2x = 8. Diviser par 2 : x = 4. Verification : 2x4 + 5 = 13. Correct.",
      exemple:
        "Etapes : 2x + 5 = 13 → 2x = 13 - 5 = 8 → x = 8/2 = 4. Toujours verifier en remplacant dans l'equation initiale.",
      piege:
        "Bien effectuer la meme operation des DEUX cotes de l'egalite. Soustraire 5 des deux cotes, puis diviser par 2 des deux cotes.",
      astuce:
        "Equation du 1er degre : isoler x etape par etape. Inverse de +5 = -5. Inverse de x2 = /2. Toujours verifier a la fin.",
    },
  },
  {
    question:
      "Un sac contient 5 billes rouges et 3 billes bleues. On tire une bille au hasard. Quelle est la probabilite de tirer une bille bleue ?",
    options: ["3/5", "3/8", "5/8", "1/3"],
    answer: "3/8",
    fiche: {
      regle: "Total = 5 + 3 = 8 billes. Billes bleues = 3. P(bleue) = 3/8.",
      exemple:
        "P(bleue) = 3/8. P(rouge) = 5/8. Verification : 3/8 + 5/8 = 8/8 = 1. Correct.",
      piege:
        "Le denominateur = nombre TOTAL de billes (8), pas juste les bleues ou les rouges.",
      astuce:
        "P(evenement) = cas favorables / cas totaux. Toujours compter le total de toutes les billes.",
    },
  },
  {
    question: "Quelle est la racine carree de 169 ?",
    options: ["11", "12", "13", "14"],
    answer: "13",
    fiche: {
      regle:
        "racine(169) = 13 car 13^2 = 169. Carres a connaitre : 11^2=121, 12^2=144, 13^2=169, 14^2=196, 15^2=225.",
      exemple:
        "13^2 = 169. Donc racine(169) = 13. Utilisation au Brevet : Pythagore, generalrice d'un cone, diagonale.",
      piege:
        "Ne pas confondre 169 avec 196 (14^2). Apprendre les carres de 1 a 15 evite les erreurs.",
      astuce:
        "Carres parfaits a memoriser jusqu'a 225. Au Brevet, reconnaitre 169 = 13^2 fait gagner du temps.",
    },
  },
  {
    question:
      "Un cone a une hauteur de 8 cm et un rayon de 6 cm. Quel est son volume (arrondi a l'unite) ?",
    options: ["301 cm^3", "904 cm^3", "288 cm^3", "150 cm^3"],
    answer: "301 cm^3",
    fiche: {
      regle:
        "V cone = (1/3) x pi x r^2 x h = (1/3) x pi x 36 x 8 = (1/3) x 288 x pi = 96 x pi environ 301,6 cm^3.",
      exemple:
        "r=6, h=8. r^2=36. V = (1/3) x pi x 36 x 8 = 96 pi environ 301 cm^3.",
      piege:
        "Ne pas oublier le (1/3) pour le cone. Sans ce facteur on calcule le volume du cylindre (904 cm^3), pas du cone.",
      astuce:
        "Cone = 1/3 cylindre. V = (1/3) pi r^2 h. Le 1/3 est essentiel pour tout solide a pointe.",
    },
  },
  {
    question:
      "Un triangle a des cotes 9 cm, 12 cm et 15 cm. Est-il rectangle ?",
    options: [
      "Non, car 9^2 + 12^2 est different de 15^2",
      "Oui, car 9^2 + 12^2 = 15^2",
      "On ne peut pas savoir",
      "Oui, car 15 est le plus grand",
    ],
    answer: "Oui, car 9^2 + 12^2 = 15^2",
    fiche: {
      regle:
        "Reciproque de Pythagore : si c^2 = a^2 + b^2 (c = plus grand cote), le triangle est rectangle. 9^2 + 12^2 = 81 + 144 = 225 = 15^2.",
      exemple:
        "9^2 = 81. 12^2 = 144. 81 + 144 = 225. 15^2 = 225. Egalite verifiee : triangle rectangle ! Triplet (9,12,15) = 3 x (3,4,5).",
      piege:
        "Toujours verifier avec le PLUS GRAND cote comme hypotenuse presumee. Ici 15 est le plus grand, donc on verifie si 9^2 + 12^2 = 15^2.",
      astuce:
        "Reconnaitre (9,12,15) = 3 x (3,4,5). Les multiples de triplets pythagoriciens sont aussi pythagoriciens. Gain de temps au Brevet.",
    },
  },
];

export default function RevisionBrevetMathsPage() {
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
          <div className="lecon-badge">🎓 Maths — 3ème</div>
          <h1 className="lecon-titre">Revision Brevet — Maths</h1>
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
            Prepare le <strong>Brevet de Maths</strong> : calcul, geometrie,
            statistiques, probabilites, Pythagore, trigonometrie et volumes.
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
                📋 Structure du Brevet Maths
              </div>
              <div className="lecon-point-texte">
                100 pts, 2 heures. Exercices de calcul, geometrie,
                statistiques/probabilites et probleme. Toujours montrer sa
                demarche meme si la reponse est fausse.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Conseil :</span> Commencer par
                les questions maitrisees. Ne pas rester bloque. Une demarche
                correcte rapporte des points meme sans le resultat final.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔑 Points cles a maitriser
              </div>
              <div className="lecon-point-texte">
                Pythagore et reciproque. Trigonometrie (sin/cos/tan). Volumes
                (sphere, cone, cylindre, pyramide). Statistiques (mediane,
                quartiles). Probabilites (arbres, tableaux).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Formules :</span> V sphere =
                (4/3) pi r^3. V cone = (1/3) pi r^2 h. sin = opp/hyp. cos =
                adj/hyp. tan = opp/adj.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">💡 Strategies d'examen</div>
              <div className="lecon-point-texte">
                Lire tout le sujet avant de commencer. Verifier les calculs.
                Faire des schemas en geometrie. Montrer toutes les etapes.
                Relire avant de rendre.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Conseil :</span> En geometrie :
                toujours faire un schema. En probabilites : faire un arbre ou un
                tableau. En calcul : verifier en remplacant.
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
        ? "Tu es pret(e) pour le Brevet !"
        : pourcentage >= 60
          ? "Bien joue, continue !"
          : "Encore un peu de revision !";
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
