"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "probabilites-3";

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
      "On lance un de a 6 faces. Quelle est la probabilite d'obtenir un nombre pair ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    answer: "1/2",
    fiche: {
      regle:
        "Probabilite = nombre de cas favorables / nombre de cas possibles. Nombres pairs sur un de : 2, 4, 6 (3 cas). Total : 6 cas. P(pair) = 3/6 = 1/2.",
      exemple:
        "P(pair) = 3/6 = 1/2. P(impair) = 3/6 = 1/2. P(6) = 1/6. P(plus grand que 4) = 2/6 = 1/3.",
      piege:
        "La probabilite est toujours entre 0 et 1. P=0 = impossible. P=1 = certain. P=1/2 = aussi probable qu'improbable.",
      astuce:
        "P(evenement) = cas favorables / cas totaux. Toujours compter soigneusement les cas favorables et les cas totaux.",
    },
  },
  {
    question:
      "Une urne contient 4 boules rouges, 3 bleues et 3 vertes. On tire une boule au hasard. Quelle est la probabilite de tirer une boule rouge ?",
    options: ["4/10", "3/10", "4/7", "1/4"],
    answer: "4/10",
    fiche: {
      regle:
        "Total de boules = 4+3+3 = 10. Boules rouges = 4. P(rouge) = 4/10 = 2/5. On peut simplifier la fraction.",
      exemple:
        "P(rouge) = 4/10 = 2/5 = 0,4. P(bleue) = 3/10. P(verte) = 3/10. Verification : 4/10 + 3/10 + 3/10 = 10/10 = 1.",
      piege:
        "Ne pas oublier de compter le total de toutes les boules. Le denominateur est le nombre TOTAL d'issues possibles.",
      astuce:
        "Somme de toutes les probabilites = 1. Toujours verifier : P(rouge) + P(bleue) + P(verte) = 1.",
    },
  },
  {
    question:
      "On lance deux pieces de monnaie. Quelle est la probabilite d'obtenir deux faces ?",
    options: ["1/2", "1/3", "1/4", "1/6"],
    answer: "1/4",
    fiche: {
      regle:
        "Avec deux pieces, les issues possibles sont : (P,P), (P,F), (F,P), (F,F) - 4 issues equiprobables. Un seul cas favorable : (F,F). P = 1/4.",
      exemple:
        "Issues : PP, PF, FP, FF. P(deux faces) = 1/4. P(au moins une face) = 3/4. P(exactement une face) = 2/4 = 1/2.",
      piege:
        "Ne pas dire P = 1/3 en confondant les cas (PP, PF, FF). PF et FP sont deux cas DISTINCTS, pas un seul.",
      astuce:
        "Avec 2 pieces independantes : 2 x 2 = 4 issues. Avec 3 pieces : 2^3 = 8 issues. Lister toutes les issues evite les erreurs.",
    },
  },
  {
    question:
      "Dans un sac : 5 billes rouges et 3 billes bleues. On tire deux billes SANS remise. Quelle est la probabilite que les deux soient rouges ?",
    options: ["5/8 x 5/8", "5/8 x 4/7", "25/64", "5/14"],
    answer: "5/8 x 4/7",
    fiche: {
      regle:
        "Sans remise : la 2eme probabilite depend du resultat du 1er tirage. P(R1) = 5/8. Apres avoir tire une rouge, il reste 4 rouges sur 7 billes. P(R2|R1) = 4/7. P(R1 et R2) = 5/8 x 4/7.",
      exemple: "P(deux rouges) = 5/8 x 4/7 = 20/56 = 5/14 environ 0,357.",
      piege:
        "Sans remise : ne pas reutiliser 5/8 pour le 2eme tirage. Apres avoir retire une bille, il en reste 7 et 4 rouges.",
      astuce:
        "Avec remise = independance, memes probabilites a chaque tirage. Sans remise = dependance, les probabilites changent a chaque tirage.",
    },
  },
  {
    question: "Qu'est-ce que la probabilite conditionnelle P(A|B) ?",
    options: [
      "La probabilite que A et B se produisent simultanement",
      "La probabilite de A sachant que B s'est produit",
      "La probabilite de A plus la probabilite de B",
      "La probabilite que ni A ni B ne se produisent",
    ],
    answer: "La probabilite de A sachant que B s'est produit",
    fiche: {
      regle:
        "P(A|B) = probabilite de A sachant que B est realise = P(A et B) / P(B). La barre | se lit 'sachant que'. On restreint l'univers a B.",
      exemple:
        "Dans une classe : 60% ont reussi maths, 40% ont reussi les deux matieres. P(reussi francais | reussi maths) = 0,4/0,6 = 2/3.",
      piege:
        "P(A|B) n'est pas egal a P(B|A) en general. Ce sont deux probabilites conditionnelles differentes.",
      astuce:
        "P(A|B) = P(A et B) / P(B). Lire : 'Parmi les cas ou B est realise, quelle fraction verifie aussi A ?'",
    },
  },
  {
    question:
      "Un arbre de probabilites montre que P(A) = 0,3 et P(B|A) = 0,6. Quelle est P(A et B) ?",
    options: ["0,9", "0,18", "0,3", "0,6"],
    answer: "0,18",
    fiche: {
      regle:
        "Regle de multiplication : P(A et B) = P(A) x P(B|A) = 0,3 x 0,6 = 0,18. Sur un arbre, on multiplie les probabilites le long des branches.",
      exemple:
        "P(A) = 0,3. P(B|A) = 0,6. P(A et B) = 0,3 x 0,6 = 0,18. De meme : P(A) = 0,3 et P(non-B|A) = 0,4 : P(A et non-B) = 0,3 x 0,4 = 0,12.",
      piege:
        "Sur un arbre : multiplier le long des branches (ET). Pour obtenir P(B) au total : additionner les branches qui menent a B (OU).",
      astuce:
        "Arbre : x le long des branches (ET). + entre les branches paralleles (OU). Verification : somme des feuilles = 1.",
    },
  },
  {
    question:
      "On tire une carte dans un jeu de 32 cartes. Quelle est la probabilite de tirer un as OU un roi ?",
    options: ["1/8", "1/4", "2/32", "1/16"],
    answer: "1/4",
    fiche: {
      regle:
        "Dans un jeu de 32 cartes : 4 as + 4 rois = 8 cartes favorables. P(as ou roi) = 8/32 = 1/4. Quand les evenements sont incompatibles (mutuellement exclusifs) : P(A ou B) = P(A) + P(B).",
      exemple:
        "P(as) = 4/32 = 1/8. P(roi) = 4/32 = 1/8. P(as ou roi) = 4/32 + 4/32 = 8/32 = 1/4. Les evenements 'as' et 'roi' sont incompatibles.",
      piege:
        "P(A ou B) = P(A) + P(B) SEULEMENT si A et B sont incompatibles. Si ils peuvent se produire en meme temps : P(A ou B) = P(A) + P(B) - P(A et B).",
      astuce:
        "Incompatibles (mutuellement exclusifs) : P(A ou B) = P(A) + P(B). Compatibles : P(A ou B) = P(A) + P(B) - P(A et B).",
    },
  },
  {
    question:
      "Dans un tableau de contingence : 200 eleves dont 120 filles. 80 filles aiment les maths et 40 garcons aiment les maths. P(aime maths | fille) = ?",
    options: ["80/200", "80/120", "80/160", "120/200"],
    answer: "80/120",
    fiche: {
      regle:
        "P(aime maths | fille) = nombre de filles qui aiment maths / nombre total de filles = 80/120 = 2/3. On restreint l'univers aux filles uniquement.",
      exemple:
        "P(aime maths | fille) = 80/120 = 2/3 environ 0,667. P(aime maths | garcon) = 40/80 = 1/2 = 0,5.",
      piege:
        "Le denominateur est le nombre de filles (120), pas le nombre total d'eleves (200). La probabilite conditionnelle restreint l'univers.",
      astuce:
        "Probabilite conditionnelle sur tableau : regarder uniquement la ligne ou colonne concernee. Denominateur = total de cette ligne/colonne.",
    },
  },
  {
    question: "Deux evenements A et B sont independants si :",
    options: [
      "P(A et B) = P(A) + P(B)",
      "P(A et B) = P(A) x P(B)",
      "P(A|B) = P(B)",
      "P(A) = P(B)",
    ],
    answer: "P(A et B) = P(A) x P(B)",
    fiche: {
      regle:
        "Deux evenements sont independants si la realisation de l'un n'influence pas la probabilite de l'autre. Definition : P(A et B) = P(A) x P(B), ce qui equivaut a P(A|B) = P(A).",
      exemple:
        "Lancer deux des : P(6 sur de 1 ET 6 sur de 2) = 1/6 x 1/6 = 1/36. Les deux des sont independants.",
      piege:
        "Independance n'est pas la meme chose qu'incompatibilite. Des evenements incompatibles (P(A et B)=0) sont tres dependants, pas independants !",
      astuce:
        "Independants : P(A et B) = P(A) x P(B). Incompatibles : P(A et B) = 0. Bien distinguer les deux concepts.",
    },
  },
  {
    question:
      "Loi des grands nombres : si on repete une experience aleatoire un tres grand nombre de fois, la frequence d'un evenement :",
    options: [
      "Reste toujours egale a la probabilite theorique",
      "Se rapproche de la probabilite theorique",
      "Devient superieure a la probabilite theorique",
      "Est impossible a predire",
    ],
    answer: "Se rapproche de la probabilite theorique",
    fiche: {
      regle:
        "La loi des grands nombres stipule que la frequence observee d'un evenement se rapproche de sa probabilite theorique quand le nombre d'experiences augmente. Elle ne devient jamais egale (a cause du hasard).",
      exemple:
        "On lance une piece 10 fois : on peut obtenir 7 faces (frequence 0,7, loin de 0,5). Avec 10 000 lancers, la frequence sera tres proche de 0,5.",
      piege:
        "La frequence se RAPPROCHE de la probabilite mais n'est jamais exactement egale (sauf par hasard). Le hasard subsiste toujours.",
      astuce:
        "Loi des grands nombres = plus on repete, plus la frequence s'approche de la probabilite. Fondement de la simulation et des statistiques.",
    },
  },
];

export default function Probabilites3Page() {
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
          <div className="lecon-badge">🎲 Maths — 3ème</div>
          <h1 className="lecon-titre">Probabilites</h1>
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
            En 3eme, tu approfondis les <strong>probabilites</strong> :
            probabilite conditionnelle, arbres, tableaux de contingence,
            independance et loi des grands nombres.
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
              <div className="lecon-point-titre">📊 Probabilite de base</div>
              <div className="lecon-point-texte">
                P(A) = cas favorables / cas totaux. Toujours entre 0 et 1. Somme
                de toutes les probabilites = 1. Avec/sans remise : les
                probabilites changent sans remise.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> De a 6 faces :
                P(pair) = 3/6 = 1/2. P(6) = 1/6. P(pair ou impair) = 1.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🌳 Arbres et probabilite conditionnelle
              </div>
              <div className="lecon-point-texte">
                P(A|B) = probabilite de A sachant B = P(A et B)/P(B). Sur un
                arbre : multiplier le long des branches (ET), additionner les
                branches paralleles (OU).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> P(A)=0,3 et
                P(B|A)=0,6. P(A et B) = 0,3 x 0,6 = 0,18.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔗 Independance et loi des grands nombres
              </div>
              <div className="lecon-point-texte">
                Independants : P(A et B) = P(A) x P(B). Loi des grands nombres :
                quand n augmente, la frequence se rapproche de la probabilite
                theorique.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Deux des :
                P(double 6) = 1/6 x 1/6 = 1/36. 10 000 lancers d'une piece :
                frequence face environ 0,5.
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
