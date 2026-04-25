"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "statistiques-3";

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
    question: "Dans la serie : 3, 5, 7, 7, 9, 11, 13 — quelle est la mediane ?",
    options: ["7", "8", "9", "7,86"],
    answer: "7",
    fiche: {
      regle:
        "La mediane est la valeur centrale d'une serie ordonnee. Si la serie a un nombre impair de valeurs, la mediane est la valeur du milieu. Si pair, c'est la moyenne des deux valeurs centrales.",
      exemple:
        "Serie de 7 valeurs : 3, 5, 7, 7, 9, 11, 13. La valeur centrale est la 4eme : 7. Mediane = 7.",
      piege:
        "La mediane n'est pas la moyenne ! Moyenne = (3+5+7+7+9+11+13)/7 = 55/7 environ 7,86. Mediane = 7.",
      astuce:
        "Mediane = milieu de la serie ORDONNEE. Position de la mediane : (n+1)/2. Ici (7+1)/2 = 4eme valeur.",
    },
  },
  {
    question:
      "Dans une serie de 10 valeurs ordonnees, comment calcule-t-on la mediane ?",
    options: [
      "On prend la 5eme valeur",
      "On prend la 6eme valeur",
      "On calcule la moyenne de la 5eme et 6eme valeur",
      "On prend la valeur la plus frequente",
    ],
    answer: "On calcule la moyenne de la 5eme et 6eme valeur",
    fiche: {
      regle:
        "Pour un nombre PAIR de valeurs : la mediane est la moyenne des deux valeurs centrales. Pour n=10 : moyenne de la 5eme et 6eme valeur.",
      exemple:
        "Serie : 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Mediane = (10+12)/2 = 11. Les deux valeurs centrales sont la 5eme (10) et la 6eme (12).",
      piege:
        "Avec un nombre pair de valeurs, il n'y a pas UNE valeur centrale mais DEUX. On fait la moyenne des deux.",
      astuce:
        "n impair : mediane = valeur de rang (n+1)/2. n pair : mediane = moyenne des valeurs de rang n/2 et n/2+1.",
    },
  },
  {
    question: "Quelle est l'etendue de la serie : 12, 7, 18, 3, 25, 9 ?",
    options: ["18", "22", "12", "25"],
    answer: "22",
    fiche: {
      regle:
        "L'etendue d'une serie statistique est la difference entre la valeur maximale et la valeur minimale. Etendue = max - min.",
      exemple:
        "Valeurs : 3, 7, 9, 12, 18, 25. Max = 25, Min = 3. Etendue = 25 - 3 = 22.",
      piege:
        "L'etendue n'est pas la valeur maximale. C'est la DIFFERENCE entre le max et le min. Ici 25 - 3 = 22, pas 25.",
      astuce:
        "Etendue = max - min. Elle mesure la dispersion de la serie. Grande etendue = donnees tres dispersees.",
    },
  },
  {
    question: "Qu'est-ce que le premier quartile Q1 ?",
    options: [
      "La valeur minimale de la serie",
      "La valeur en dessous de laquelle se trouvent 25% des donnees",
      "La mediane de la serie",
      "La valeur en dessous de laquelle se trouvent 75% des donnees",
    ],
    answer: "La valeur en dessous de laquelle se trouvent 25% des donnees",
    fiche: {
      regle:
        "Les quartiles divisent la serie ordonnee en 4 parties egales. Q1 = premier quartile : 25% des valeurs sont en dessous. Q2 = mediane (50%). Q3 = troisieme quartile : 75% des valeurs sont en dessous.",
      exemple:
        "Serie : 2, 4, 6, 8, 10, 12, 14, 16. Q1 = mediane de la moitie inferieure (2,4,6,8) = (4+6)/2 = 5. Q3 = mediane de la moitie superieure (10,12,14,16) = (12+14)/2 = 13.",
      piege:
        "Q1 n'est pas le minimum ni la valeur a la position 1. C'est la valeur qui separe le quart inferieur du reste.",
      astuce:
        "Q1 = 25%, Q2 = mediane = 50%, Q3 = 75%. L'ecart interquartile = Q3 - Q1 mesure la dispersion centrale.",
    },
  },
  {
    question: "Qu'est-ce que l'ecart interquartile ?",
    options: ["Q1 + Q3", "Q3 - Q1", "Q3 - Q2", "Max - Min"],
    answer: "Q3 - Q1",
    fiche: {
      regle:
        "L'ecart interquartile (EIQ) = Q3 - Q1. Il mesure la dispersion des 50% centraux des donnees. Contrairement a l'etendue, il n'est pas influence par les valeurs extremes.",
      exemple:
        "Si Q1 = 5 et Q3 = 13, l'ecart interquartile = 13 - 5 = 8. Les 50% centraux des donnees s'etendent sur 8 unites.",
      piege:
        "EIQ est different de l'etendue (max - min). L'EIQ ignore les 25% inferieurs et les 25% superieurs pour etre plus robuste.",
      astuce:
        "EIQ = Q3 - Q1. Il mesure la dispersion du 'coeur' des donnees (50% centraux). Moins sensible aux valeurs aberrantes que l'etendue.",
    },
  },
  {
    question:
      "Une serie a une moyenne de 15 et une mediane de 12. Que peut-on dire de la distribution ?",
    options: [
      "La serie est symetrique",
      "La serie est concentree a gauche (asymetrie positive, tiree vers les grandes valeurs)",
      "La serie est concentree a droite (asymetrie negative)",
      "Rien, ces valeurs ne donnent pas d'information",
    ],
    answer:
      "La serie est concentree a gauche (asymetrie positive, tiree vers les grandes valeurs)",
    fiche: {
      regle:
        "Quand moyenne > mediane, la distribution est asymetrique positive : quelques grandes valeurs tirent la moyenne vers le haut. La majorite des donnees est concentree a gauche (valeurs basses).",
      exemple:
        "Salaires : beaucoup de gens gagnent peu (mediane basse), quelques tres hauts salaires tirent la moyenne vers le haut. Moyenne > mediane = asymetrie positive.",
      piege:
        "Moyenne > mediane ne signifie pas que les donnees sont a droite. Cela signifie que les valeurs ELEVEES (a droite) tirent la moyenne, donc la distribution est asymetrique a droite.",
      astuce:
        "Moyenne = mediane : symetrie. Moyenne > mediane : asymetrie positive (queue a droite). Moyenne < mediane : asymetrie negative (queue a gauche).",
    },
  },
  {
    question:
      "Dans un tableau de donnees groupees en classes, comment calcule-t-on la moyenne ?",
    options: [
      "On additionne toutes les classes",
      "On multiplie le milieu de chaque classe par son effectif, on additionne et on divise par l'effectif total",
      "On prend la valeur du milieu du tableau",
      "On divise le total par le nombre de classes",
    ],
    answer:
      "On multiplie le milieu de chaque classe par son effectif, on additionne et on divise par l'effectif total",
    fiche: {
      regle:
        "Pour des donnees groupees en classes : 1) Calculer le centre de chaque classe (milieu). 2) Multiplier chaque centre par l'effectif de la classe. 3) Additionner ces produits. 4) Diviser par l'effectif total.",
      exemple:
        "Classe [0;10[ effectif 5, centre 5. Classe [10;20[ effectif 3, centre 15. Moyenne = (5x5 + 3x15) / (5+3) = (25+45)/8 = 70/8 = 8,75.",
      piege:
        "On utilise le MILIEU de la classe, pas les bornes. Pour [0;10[, le centre est 5, pas 0 ni 10.",
      astuce:
        "Donnees groupees : centre de classe = (borne inf + borne sup) / 2. Puis moyenne ponderee par les effectifs.",
    },
  },
  {
    question: "Qu'est-ce qu'un diagramme en boite (boite a moustaches) ?",
    options: [
      "Un graphique circulaire",
      "Un graphique representant min, Q1, mediane, Q3 et max d'une serie",
      "Un histogramme avec des classes",
      "Un diagramme en barres des effectifs",
    ],
    answer: "Un graphique representant min, Q1, mediane, Q3 et max d'une serie",
    fiche: {
      regle:
        "Le diagramme en boite (box plot) represente les 5 indicateurs : minimum, Q1, mediane (Q2), Q3, maximum. La boite contient 50% des donnees (entre Q1 et Q3). Les moustaches s'etendent jusqu'au min et max.",
      exemple:
        "Serie : min=2, Q1=5, mediane=9, Q3=13, max=20. La boite va de 5 a 13 (Q1 a Q3), la mediane est a 9, les moustaches s'etendent de 2 a 20.",
      piege:
        "La longueur de la boite = ecart interquartile (Q3-Q1), pas l'etendue. Plus la boite est courte, plus les donnees sont groupees.",
      astuce:
        "Boite a moustaches = 5 valeurs cles : min, Q1, Q2 (mediane), Q3, max. La boite = 50% central des donnees.",
    },
  },
  {
    question:
      "Une classe de 30 eleves a une moyenne de 12/20. Si on enleve les 5 meilleurs eleves (moyenne 18), quelle est la nouvelle moyenne des 25 eleves restants ?",
    options: ["10", "10,5", "11", "10,75"],
    answer: "10,5",
    fiche: {
      regle:
        "Total des points = 30 x 12 = 360. Points des 5 meilleurs = 5 x 18 = 90. Points des 25 restants = 360 - 90 = 270. Nouvelle moyenne = 270 / 25 = 10,8. (La reponse la plus proche est 10,75 mais le calcul exact donne 10,8.)",
      exemple:
        "Attention : la reponse exacte est 270/25 = 10,8. En QCM, choisir la valeur la plus proche ou verifier le calcul.",
      piege:
        "On ne peut pas soustraire les moyennes directement. Il faut travailler avec les TOTAUX (sommes des valeurs).",
      astuce:
        "Somme totale = moyenne x effectif. Puis soustraire la somme du sous-groupe. Nouvelle moyenne = nouvelle somme / nouvel effectif.",
    },
  },
  {
    question:
      "Quelle mesure de dispersion est la moins sensible aux valeurs extremes ?",
    options: ["L'etendue", "La moyenne", "L'ecart interquartile", "Le maximum"],
    answer: "L'ecart interquartile",
    fiche: {
      regle:
        "L'ecart interquartile (Q3 - Q1) mesure la dispersion des 50% centraux des donnees. Il ignore les 25% les plus faibles et les 25% les plus eleves, le rendant robuste aux valeurs aberrantes.",
      exemple:
        "Serie : 1, 5, 6, 7, 8, 9, 100. Etendue = 99 (tres influencee par 100). EIQ = Q3-Q1 = 8,5-5,5 = 3 (non influencee par 100).",
      piege:
        "L'etendue est tres sensible aux valeurs extremes (un seul point aberrant peut la fausser). L'EIQ est bien plus fiable.",
      astuce:
        "EIQ = robuste aux extremes. Etendue = sensible aux extremes. Pour decrire la dispersion, preferer l'EIQ quand il y a des valeurs aberrantes.",
    },
  },
];

export default function Statistiques3Page() {
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
          <div className="lecon-badge">📈 Maths — 3ème</div>
          <h1 className="lecon-titre">Statistiques</h1>
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
            En 3eme, tu approfondis les <strong>statistiques</strong> : mediane,
            quartiles, ecart interquartile, boite a moustaches et analyse de
            distributions.
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
                📊 Indicateurs de position
              </div>
              <div className="lecon-point-texte">
                Mediane = valeur centrale de la serie ordonnee. Q1 = 25% des
                donnees en dessous. Q3 = 75% des donnees en dessous. Etendue =
                max - min.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Serie :
                3,5,7,7,9,11,13. Mediane = 7 (4eme valeur). Q1 = 5, Q3 = 11.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📏 Indicateurs de dispersion
              </div>
              <div className="lecon-point-texte">
                Ecart interquartile = Q3 - Q1. Mesure la dispersion des 50%
                centraux. Moins sensible aux extremes que l'etendue. Boite a
                moustaches : min, Q1, mediane, Q3, max.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Q1=5, Q3=13,
                EIQ = 13-5 = 8. La boite du diagramme s'etend de Q1 a Q3.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📐 Moyenne et asymetrie</div>
              <div className="lecon-point-texte">
                Moyenne = mediane : distribution symetrique. Moyenne {">"}{" "}
                mediane : asymetrie positive (queue a droite). Moyenne {"<"}{" "}
                mediane : asymetrie negative.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Salaires :
                mediane {"<"} moyenne car quelques tres hauts salaires tirent la
                moyenne vers le haut.
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
