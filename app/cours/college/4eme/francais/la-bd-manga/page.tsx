"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "la-bd-manga";

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
      "Comment s'appelle un espace délimité contenant une image dans une BD ?",
    options: [
      "Une bulle",
      "Une case",
      "Une vignette",
      "Les deux réponses b et c sont correctes",
    ],
    answer: "Les deux réponses b et c sont correctes",
    fiche: {
      regle:
        "Une case (ou vignette) est un espace rectangulaire délimité contenant une image dessinée dans une BD. La planche est l'ensemble des cases d'une page.",
      exemple:
        "✅ Une planche de BD contient en général 6 à 9 cases. Chaque case montre une action ou un moment précis.",
      piege:
        "Case et vignette sont synonymes ! Les deux termes sont acceptés. La bulle, elle, contient les paroles.",
      astuce:
        "Case/vignette = image dessinée. Bulle = paroles. Planche = page entière. Bande = rangée de cases.",
    },
  },
  {
    question:
      "Comment s'appelle le texte qui décrit l'action ou donne des informations dans une BD (hors dialogues) ?",
    options: ["Une bulle", "Un cartouche", "Une onomatopée", "Une case"],
    answer: "Un cartouche",
    fiche: {
      regle:
        "Le cartouche (ou récitatif) est un encadré rectangulaire contenant du texte narratif (descriptions, indications de lieu, de temps). Il est différent de la bulle qui contient les paroles.",
      exemple:
        "✅ Cartouche : 'Le lendemain matin...' ou 'Paris, 1942'. La bulle : 'Bonjour !' dit par un personnage.",
      piege:
        "Cartouche ≠ bulle. Le cartouche = voix du narrateur. La bulle = voix des personnages.",
      astuce:
        "Cartouche = narrateur (comme dans un roman). Bulle = personnage qui parle. Onomatopée = son écrit (BOUM !).",
    },
  },
  {
    question: "Qu'est-ce qu'une onomatopée dans une BD ?",
    options: [
      "Un mot qui imite un son",
      "Une bulle de pensée",
      "Un personnage sans paroles",
      "Un dessin sans texte",
    ],
    answer: "Un mot qui imite un son",
    fiche: {
      regle:
        "L'onomatopée est un mot qui imite phonétiquement un son. Très utilisée en BD pour rendre l'action vivante et dynamique.",
      exemple:
        "✅ BOUM (explosion), BING (choc), VROOM (voiture), SPLASH (eau), POW (coup de poing), GRRR (grognement).",
      piege:
        "Les onomatopées ne sont pas des mots 'normaux'. Ce sont des créations sonores qui imitent le bruit réel.",
      astuce:
        "Onomatopée = le mot sonne comme ce qu'il décrit. SPLASH = bruit de l'eau. POW = coup. Très visuelles en BD !",
    },
  },
  {
    question: "Dans quel sens se lit un manga japonais ?",
    options: [
      "De gauche à droite, de haut en bas",
      "De droite à gauche, de haut en bas",
      "De bas en haut",
      "Dans le sens des aiguilles d'une montre",
    ],
    answer: "De droite à gauche, de haut en bas",
    fiche: {
      regle:
        "Les mangas japonais se lisent de droite à gauche (sens de lecture japonais). La première page est ce qui serait la dernière page pour nous. Les cases se lisent aussi de droite à gauche.",
      exemple:
        "✅ Naruto, One Piece, Dragon Ball = mangas japonais, lecture droite→gauche. Dans les éditions françaises, certains sont 'retournés'.",
      piege:
        "Ne pas commencer à lire un manga de gauche à droite ! Commence par ce qui ressemble à la 'fin' pour nous.",
      astuce:
        "Manga japonais → droite vers gauche. BD franco-belge (Tintin, Astérix) → gauche vers droite. Sens inverse !",
    },
  },
  {
    question: "Qu'est-ce qu'une planche dans une BD ?",
    options: [
      "Un seul dessin grand format",
      "Une page entière de BD composée de cases",
      "Une bulle très grande",
      "Le titre de l'album",
    ],
    answer: "Une page entière de BD composée de cases",
    fiche: {
      regle:
        "La planche est une page entière de BD. Elle est composée de bandes (rangées de cases horizontales), elles-mêmes composées de cases. La mise en page des cases s'appelle la mise en planche.",
      exemple:
        "✅ Une planche classique = 3 bandes × 3 cases = 9 cases. Mais la mise en page peut varier énormément.",
      piege:
        "Planche ≠ case. La planche contient plusieurs cases. Une case est l'unité de base, la planche est l'ensemble.",
      astuce:
        "Planche = page. Bande = rangée horizontale. Case = unité. Bulle = paroles. Cartouche = narration.",
    },
  },
  {
    question:
      "Que représente une bulle avec un contour en pointillés ou en nuage ?",
    options: [
      "Des paroles prononcées à voix haute",
      "Des pensées intérieures du personnage",
      "Un cri",
      "Un chuchotement",
    ],
    answer: "Des pensées intérieures du personnage",
    fiche: {
      regle:
        "Les formes de bulles : ronde normale = paroles. Nuage ou pointillés = pensées. Dentelée/en éclairs = cri ou voix forte. Petite avec pointillés vers l'oreille = chuchotement.",
      exemple:
        "✅ Bulle ronde → 'Je vais y aller !' (parole). Bulle nuage → 'Il est si beau...' (pensée). Bulle dentelée → 'AU SECOURS !' (cri).",
      piege:
        "La forme de la bulle donne des informations sur le type d'expression ! Ne pas les confondre.",
      astuce:
        "Ronde = parle. Nuage = pense. Dentelée = crie. Petite pointillée = chuchote. La forme = le ton !",
    },
  },
  {
    question: "Qu'est-ce que le 'gutter' dans une BD ?",
    options: [
      "Le titre de l'album",
      "L'espace blanc entre les cases",
      "La couverture",
      "La dernière page",
    ],
    answer: "L'espace blanc entre les cases",
    fiche: {
      regle:
        "Le 'gutter' (terme anglais) ou gouttière est l'espace blanc entre les cases. C'est dans cet espace que le lecteur imagine ce qui se passe entre deux cases. C'est la magie de la BD !",
      exemple:
        "✅ Case 1 : personnage lève le poing. Case 2 : adversaire à terre. Le gutter = le lecteur imagine le coup.",
      piege:
        "Le gutter n'est pas vide ! C'est là que se passe l'action imaginée par le lecteur. Essentiel en BD.",
      astuce:
        "Gutter/gouttière = espace entre cases = espace de l'imagination du lecteur. La BD ne montre pas tout !",
    },
  },
  {
    question:
      "Quelle est la différence principale entre la BD franco-belge et le manga ?",
    options: [
      "Le manga est en couleur, la BD non",
      "La BD est plus longue",
      "Le manga vient du Japon, se lit de droite à gauche et est souvent en noir et blanc",
      "Il n'y a pas de différence",
    ],
    answer:
      "Le manga vient du Japon, se lit de droite à gauche et est souvent en noir et blanc",
    fiche: {
      regle:
        "BD franco-belge : couleur, lecture gauche→droite, albums indépendants. Manga : Japon, noir et blanc, lecture droite→gauche, souvent très long (100+ tomes), styles graphiques différents.",
      exemple:
        "✅ Tintin = BD franco-belge (couleur, 24 pages). Naruto = manga (N&B, 72 volumes). Styles et cultures très différents.",
      piege:
        "Il existe aussi des manga en couleur (Yotsuba). Et des BD franco-belges en N&B. Ce sont des tendances, pas des règles absolues.",
      astuce:
        "Manga = Japon + droite→gauche + souvent N&B + très long. BD = Europe + gauche→droite + couleur + plus court.",
    },
  },
  {
    question: "Qu'est-ce qu'un 'plan d'ensemble' dans une BD ?",
    options: [
      "Un gros plan sur le visage",
      "Une vue large montrant le décor et les personnages",
      "Un plan en contre-plongée",
      "Un personnage vu de dos",
    ],
    answer: "Une vue large montrant le décor et les personnages",
    fiche: {
      regle:
        "Les plans en BD (comme au cinéma) : plan d'ensemble (vue large, décor), plan moyen (personnage en entier), plan américain (jusqu'aux genoux), gros plan (visage), très gros plan (détail).",
      exemple:
        "✅ Plan d'ensemble : 'On voit la forêt et deux silhouettes au loin.' Gros plan : 'On voit les yeux écarquillés du héros.'",
      piege:
        "La BD utilise les mêmes techniques que le cinéma ! Les plans ont les mêmes noms et les mêmes effets.",
      astuce:
        "Plan d'ensemble = large = décor. Gros plan = proche = émotions. Plus on est proche, plus on ressent les émotions !",
    },
  },
  {
    question: "Qu'est-ce que le 'scénariste' dans une BD ?",
    options: [
      "Celui qui dessine",
      "Celui qui écrit l'histoire et les dialogues",
      "Celui qui colorie",
      "Celui qui publie l'album",
    ],
    answer: "Celui qui écrit l'histoire et les dialogues",
    fiche: {
      regle:
        "Une BD est souvent créée par deux personnes : le scénariste (écrit l'histoire, les dialogues, les indications) et le dessinateur (met en images). Parfois la même personne fait les deux (auteur complet).",
      exemple:
        "✅ Goscinny (scénariste) + Uderzo (dessinateur) = Astérix. Hergé était auteur complet de Tintin.",
      piege:
        "Le scénariste n'est pas l'auteur des dessins ! En BD, le travail est souvent partagé entre plusieurs artistes.",
      astuce:
        "Scénariste = mots + histoire. Dessinateur = images. Coloriste = couleurs. Souvent une équipe !",
    },
  },
];

export default function LaBDMangaPage() {
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
          <div className="lecon-badge">🎨 Français — 4ème</div>
          <h1 className="lecon-titre">La BD et le manga</h1>
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
            Apprends le <strong>langage de la BD et du manga</strong> : cases,
            bulles, cartouches, plans et codes graphiques de ces arts
            populaires.
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
              <div className="lecon-point-titre">🖼️ Éléments de la BD</div>
              <div className="lecon-point-texte">
                Case/vignette (image), bulle (paroles), cartouche (narration),
                planche (page), bande (rangée), gouttière (espace entre cases),
                onomatopée (son).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> BOUM =
                onomatopée. 'Le lendemain...' = cartouche. Nuage = pensée.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📷 Les plans</div>
              <div className="lecon-point-texte">
                Plan d'ensemble (large), plan moyen (personnage entier), gros
                plan (visage), très gros plan (détail). Comme au cinéma !
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Gros plan =
                émotions intenses. Plan d'ensemble = situer le décor.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🇯🇵 BD vs Manga</div>
              <div className="lecon-point-texte">
                Manga : Japon, droite→gauche, souvent N&B. BD franco-belge :
                Europe, gauche→droite, souvent couleur.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Tintin (BD),
                Naruto (manga). Sens de lecture inversé !
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
                  📖 Lis la fiche pour débloquer !
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
                📖 Mode découverte. Inscris-toi pour les 10 questions !
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
