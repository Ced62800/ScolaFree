"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "maths";
const THEME = "geometrie-3";

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
    question: "Quelle est la formule du volume d'une sphere de rayon r ?",
    options: [
      "V = 4 x pi x r^2",
      "V = (4/3) x pi x r^3",
      "V = pi x r^3",
      "V = 2 x pi x r^3",
    ],
    answer: "V = (4/3) x pi x r^3",
    fiche: {
      regle:
        "Volume sphere = (4/3) x pi x r^3. Aire de la sphere = 4 x pi x r^2. A ne pas confondre : r^3 pour le volume, r^2 pour l'aire.",
      exemple:
        "Sphere de rayon 3 cm : V = (4/3) x pi x 27 = 36 x pi environ 113,1 cm^3. Aire = 4 x pi x 9 = 36 x pi environ 113,1 cm^2.",
      piege:
        "Volume sphere : r^3 (pas r^2). Aire sphere : r^2 (pas r^3). Les deux formules ont le meme coefficient 4 x pi mais les exposants different.",
      astuce:
        "Sphere : V = (4/3) pi r^3. Retiens : 4/3 et r^3. L'aire = 4 pi r^2 (meme 4, mais r^2). Apprendre les deux ensemble.",
    },
  },
  {
    question:
      "Quelle est la formule du volume d'un cone de rayon r et de hauteur h ?",
    options: [
      "V = pi x r^2 x h",
      "V = (1/3) x pi x r^2 x h",
      "V = (2/3) x pi x r^2 x h",
      "V = pi x r x h",
    ],
    answer: "V = (1/3) x pi x r^2 x h",
    fiche: {
      regle:
        "Volume cone = (1/3) x pi x r^2 x h. C'est un tiers du volume du cylindre de meme base et meme hauteur. Volume cylindre = pi x r^2 x h.",
      exemple:
        "Cone de rayon 4 cm et hauteur 9 cm : V = (1/3) x pi x 16 x 9 = 48 x pi environ 150,8 cm^3.",
      piege:
        "Ne pas oublier le (1/3) ! V cone = (1/3) V cylindre. Sans ce facteur, on calcule le volume du cylindre, pas du cone.",
      astuce:
        "Cone = 1/3 cylindre. Pyramide = 1/3 prisme. Le facteur 1/3 s'applique a toutes les pointes ! Cylindre : pi r^2 h. Cone : (1/3) pi r^2 h.",
    },
  },
  {
    question:
      "Un cylindre a un rayon de 5 cm et une hauteur de 10 cm. Quel est son volume (en cm^3, arrondi) ?",
    options: ["785 cm^3", "1571 cm^3", "314 cm^3", "500 cm^3"],
    answer: "785 cm^3",
    fiche: {
      regle:
        "Volume cylindre = pi x r^2 x h. Avec r = 5 cm et h = 10 cm : V = pi x 25 x 10 = 250 x pi environ 785,4 cm^3.",
      exemple: "V = pi x 5^2 x 10 = pi x 25 x 10 = 250 pi environ 785 cm^3.",
      piege:
        "Bien utiliser le rayon (5 cm), pas le diametre (10 cm). Si l'enonce donne le diametre, diviser par 2 pour obtenir le rayon.",
      astuce:
        "Cylindre : V = pi r^2 h. Retiens : base circulaire (pi r^2) x hauteur. Comme un prisme : aire de la base x hauteur.",
    },
  },
  {
    question: "Qu'est-ce qu'un patron d'un solide ?",
    options: [
      "La vue de dessus du solide",
      "Le developpement plan du solide obtenu en 'deroulant' ses faces",
      "La section du solide par un plan",
      "La projection du solide sur un plan",
    ],
    answer: "Le developpement plan du solide obtenu en 'deroulant' ses faces",
    fiche: {
      regle:
        "Le patron (ou developpement) d'un solide est la figure plane obtenue en decoupant et deroulant les faces du solide. En pliant le patron, on retrouve le solide.",
      exemple:
        "Patron d'un cube : 6 carres disposes en croix. Patron d'un cone : un secteur circulaire + un disque (la base). Patron d'un cylindre : rectangle + 2 disques.",
      piege:
        "Un meme solide peut avoir plusieurs patrons differents. Il n'y a pas un unique patron. Il faut verifier que le patron se referme correctement.",
      astuce:
        "Pour verifier un patron : les faces doivent avoir les bonnes dimensions et pouvoir se coller sans chevauchement ni manque.",
    },
  },
  {
    question:
      "Quelle est la section d'une sphere par un plan passant par son centre ?",
    options: ["Une ellipse", "Un disque", "Un cercle", "Un rectangle"],
    answer: "Un cercle",
    fiche: {
      regle:
        "La section d'une sphere de rayon R par un plan passant par son centre (grand cercle) est un cercle de rayon R. Une section par un plan quelconque donne aussi un cercle, mais de rayon plus petit.",
      exemple:
        "Sphere de rayon 5 cm coupee par un plan passant par le centre : cercle de rayon 5 cm. Si le plan est a 3 cm du centre : cercle de rayon 4 cm (Pythagore : 5^2-3^2=16, r=4).",
      piege:
        "La section d'une sphere est toujours un CERCLE (pas une ellipse). C'est une propriete specifique de la sphere.",
      astuce:
        "Sphere coupee par un plan = cercle. Grand cercle = plan par le centre (rayon = R). Petit cercle = plan pas par le centre (rayon < R).",
    },
  },
  {
    question:
      "Quelle est la formule du volume d'une pyramide a base carree de cote a et de hauteur h ?",
    options: [
      "V = a^2 x h",
      "V = (1/3) x a^2 x h",
      "V = (1/2) x a^2 x h",
      "V = a x h",
    ],
    answer: "V = (1/3) x a^2 x h",
    fiche: {
      regle:
        "Volume pyramide = (1/3) x Aire de la base x hauteur. Pour une base carree de cote a : V = (1/3) x a^2 x h.",
      exemple:
        "Pyramide a base carree 6 cm, hauteur 9 cm : V = (1/3) x 36 x 9 = (1/3) x 324 = 108 cm^3.",
      piege:
        "Hauteur de la pyramide = hauteur perpendiculaire a la base (apotheme de volume), pas l'arete laterale. Bien distinguer les deux.",
      astuce:
        "Pyramide (et cone) = (1/3) x base x hauteur. Le 1/3 s'applique toujours aux solides a pointe. Prisme et cylindre : base x hauteur (sans 1/3).",
    },
  },
  {
    question: "Qu'est-ce que l'apotheme d'une pyramide reguliere ?",
    options: [
      "La hauteur de la pyramide",
      "La longueur d'une arete laterale",
      "La hauteur d'une face triangulaire laterale",
      "Le rayon de la base",
    ],
    answer: "La hauteur d'une face triangulaire laterale",
    fiche: {
      regle:
        "L'apotheme d'une pyramide reguliere est la hauteur d'une face triangulaire laterale, mesuree depuis le sommet de la pyramide jusqu'au milieu d'un cote de la base.",
      exemple:
        "Pour calculer l'aire laterale d'une pyramide : Aire laterale = (1/2) x perimetre de la base x apotheme. Utile pour calculer l'aire totale.",
      piege:
        "Apotheme ≠ hauteur de la pyramide. La hauteur va du sommet au centre de la base. L'apotheme va du sommet au milieu d'un cote de la base.",
      astuce:
        "Apotheme = hauteur d'une FACE (triangulaire). Hauteur = hauteur du SOLIDE (perpendiculaire a la base). Deux choses distinctes.",
    },
  },
  {
    question:
      "Un cube de 4 cm de cote est plonge dans de l'eau. De combien l'eau monte-t-elle dans un recipient de base 10 cm x 10 cm ?",
    options: ["6,4 cm", "0,64 cm", "1,6 cm", "4 cm"],
    answer: "0,64 cm",
    fiche: {
      regle:
        "Volume du cube = 4^3 = 64 cm^3. Ce volume correspond a la montee d'eau dans le recipient. Hauteur de montee = Volume / Aire de la base = 64 / (10 x 10) = 64/100 = 0,64 cm.",
      exemple:
        "V cube = 64 cm^3. Aire base recipient = 100 cm^2. Montee = 64/100 = 0,64 cm.",
      piege:
        "La montee d'eau depend du volume du solide plonge ET de la base du recipient. Ne pas confondre les deux dimensions.",
      astuce:
        "Principe d'Archimede simplifie : volume solide = base recipient x montee d'eau. Montee = V solide / Aire base.",
    },
  },
  {
    question:
      "Quelle est l'aire totale d'un cylindre de rayon 3 cm et hauteur 8 cm (en cm^2, arrondie) ?",
    options: ["188 cm^2", "207 cm^2", "150 cm^2", "226 cm^2"],
    answer: "207 cm^2",
    fiche: {
      regle:
        "Aire totale cylindre = 2 x pi x r^2 (les 2 bases) + 2 x pi x r x h (la surface laterale). Avec r=3 et h=8 : 2 x pi x 9 + 2 x pi x 3 x 8 = 18pi + 48pi = 66pi environ 207,3 cm^2.",
      exemple:
        "2 bases : 2 x pi x 9 = 18pi. Surface laterale : 2 x pi x 3 x 8 = 48pi. Total = 66pi environ 207 cm^2.",
      piege:
        "Aire totale = 2 bases + surface laterale. Ne pas oublier les 2 disques (bases). La surface laterale seule = 2 x pi x r x h.",
      astuce:
        "Cylindre : 3 parties. 2 disques (bases) = 2 pi r^2. Rectangle enroule (surface laterale) = 2 pi r h. Total = 2 pi r (r + h).",
    },
  },
  {
    question:
      "Un cone a une hauteur de 12 cm et un rayon de base de 5 cm. Quelle est la longueur de sa generatrice (arete laterale) ?",
    options: ["13 cm", "17 cm", "7 cm", "15 cm"],
    answer: "13 cm",
    fiche: {
      regle:
        "La generatrice du cone, le rayon et la hauteur forment un triangle rectangle. generatrice^2 = r^2 + h^2. Avec r=5 et h=12 : g^2 = 25+144 = 169, g = 13 cm.",
      exemple:
        "g^2 = 5^2 + 12^2 = 25 + 144 = 169. g = 13 cm. Triplet (5, 12, 13) !",
      piege:
        "La generatrice n'est pas la hauteur. La hauteur est perpendiculaire a la base. La generatrice va du sommet a un point du cercle de base.",
      astuce:
        "Generatrice cone = hypotenuse du triangle rectangle forme par r, h et g. g = racine(r^2 + h^2). Triplet (5,12,13) frequemment utilise.",
    },
  },
];

export default function Geometrie3Page() {
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
          <div className="lecon-badge">📐 Maths — 3ème</div>
          <h1 className="lecon-titre">Geometrie dans l'espace</h1>
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
            En 3eme, tu calcules des{" "}
            <strong>volumes et aires de solides</strong> : sphere, cone,
            cylindre, pyramide, et tu travailles sur les patrons et sections.
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
              <div className="lecon-point-titre">📦 Volumes des solides</div>
              <div className="lecon-point-texte">
                Cylindre : pi r^2 h. Cone : (1/3) pi r^2 h. Sphere : (4/3) pi
                r^3. Pyramide : (1/3) x base x h. Les solides a pointe ont
                toujours le facteur 1/3.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Sphere r=3 : V
                = (4/3) pi x 27 = 36 pi. Cone r=4, h=9 : V = (1/3) pi x 16 x 9 =
                48 pi.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📏 Aires des solides</div>
              <div className="lecon-point-texte">
                Sphere : 4 pi r^2. Cylindre : 2 pi r^2 + 2 pi r h = 2 pi r
                (r+h). Cone : pi r^2 + pi r g (g = generatrice). Generatrice
                cone : g = racine(r^2 + h^2).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Cylindre r=3,
                h=8 : aire = 2 pi x 3 x (3+8) = 6 pi x 11 = 66 pi.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">✂️ Patrons et sections</div>
              <div className="lecon-point-texte">
                Patron = developpement plan du solide. Section par un plan =
                forme obtenue en coupant le solide. Sphere coupee = cercle.
                Cylindre coupe parallelement a la base = cercle.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Patron cylindre
                = rectangle + 2 disques. Patron cone = secteur circulaire +
                disque.
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
