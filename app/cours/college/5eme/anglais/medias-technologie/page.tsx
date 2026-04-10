"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "medias-technologie";

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
    question: "What does 'to surf the web' mean?",
    options: [
      "faire du surf",
      "naviguer sur Internet",
      "télécharger des fichiers",
      "envoyer des emails",
    ],
    answer: "naviguer sur Internet",
    fiche: {
      regle:
        "Expressions Internet : surf the web (naviguer), browse (parcourir), download (télécharger), upload (envoyer/mettre en ligne), stream (diffuser en direct).",
      exemple:
        "✅ I surf the web every day. She downloaded the app. He streams music online.",
      piege:
        "Upload ≠ download. Upload = envoyer (vers le cloud). Download = recevoir (sur son appareil).",
      astuce:
        "Upload = UP = vers le haut = mettre en ligne. Download = DOWN = vers le bas = télécharger sur ton appareil.",
    },
  },
  {
    question:
      "What is a 'smartphone' feature called when it takes a photo of yourself?",
    options: ["a screenshot", "a selfie", "a thumbnail", "a wallpaper"],
    answer: "a selfie",
    fiche: {
      regle:
        "Vocabulaire technologique : selfie (autoportrait), screenshot (capture d'écran), wallpaper (fond d'écran), thumbnail (miniature), notification (notification).",
      exemple:
        "✅ She took a selfie at the Eiffel Tower. Take a screenshot to save the image. Change your wallpaper.",
      piege:
        "Screenshot ≠ selfie. Screenshot = capturer l'écran. Selfie = photo de soi-même avec son téléphone.",
      astuce:
        "Selfie = self (soi-même) + ie. Screenshot = screen (écran) + shot (coup/photo). Screen + shoot = capturer l'écran !",
    },
  },
  {
    question:
      "Complete: 'Social media ___ a big impact on teenagers.' (have/has)",
    options: [
      "have",
      "has",
      "Both are possible depending on context.",
      "is having",
    ],
    answer: "Both are possible depending on context.",
    fiche: {
      regle:
        "Social media peut être singulier ou pluriel selon le contexte. 'Social media has' (collectif) et 'Social media have' (plusieurs réseaux) sont tous deux acceptés.",
      exemple:
        "✅ Social media has changed communication. (collectif). Social media have their advantages and disadvantages. (pluriel).",
      piege:
        "Media est déjà pluriel (medium → media). Mais 'social media' est souvent traité comme singulier collectif.",
      astuce:
        "En pratique : social media has = le plus courant aujourd'hui. Mais social media have = aussi correct.",
    },
  },
  {
    question: "What does 'fake news' mean in French?",
    options: [
      "nouvelles récentes",
      "vraies nouvelles",
      "fausses informations",
      "nouvelles importantes",
    ],
    answer: "fausses informations",
    fiche: {
      regle:
        "Media literacy vocabulary : fake news (fausses informations), reliable source (source fiable), fact-check (vérifier les faits), bias (biais), clickbait (appât à clics).",
      exemple:
        "✅ Always check if the news is reliable. Fake news can spread quickly on social media.",
      piege:
        "Fake = faux. News = informations (pluriel, mais sans 's' apparent). Fake news = fausses INFORMATIONS.",
      astuce:
        "Fake = faux. Fake news = fausses nouvelles. Fake friend = faux ami. Fake = pas réel, pas vrai.",
    },
  },
  {
    question: "What is 'cyberbullying' in French?",
    options: [
      "la cybersécurité",
      "le cyberharcèlement",
      "la cyberaddiction",
      "le cybercrime",
    ],
    answer: "le cyberharcèlement",
    fiche: {
      regle:
        "Online safety : cyberbullying (cyberharcèlement), hacker (pirate informatique), password (mot de passe), privacy (vie privée), screen time (temps d'écran).",
      exemple:
        "✅ Cyberbullying is a serious problem. Protect your password. Respect others' privacy online.",
      piege:
        "Cyberbullying ≠ cybercrime. Bullying = harcèlement (entre individus). Crime = acte illégal plus grave.",
      astuce:
        "Bully = harceleur. Cyberbully = harceleur en ligne. Cyberbullying = harcèlement en ligne.",
    },
  },
  {
    question: "How do you say 'Je poste des photos sur Instagram' in English?",
    options: [
      "I put photos on Instagram.",
      "I post photos on Instagram.",
      "I send photos to Instagram.",
      "I share photos at Instagram.",
    ],
    answer: "I post photos on Instagram.",
    fiche: {
      regle:
        "Réseaux sociaux : post (publier/poster), share (partager), like (aimer), comment (commenter), follow (suivre), unfollow (ne plus suivre), tag (étiqueter).",
      exemple:
        "✅ I post photos on Instagram. She shared the video. He liked my photo. Follow me on Twitter.",
      piege:
        "Post on (pas to ou at). On Instagram, on Twitter, on Facebook. Préposition ON pour les plateformes.",
      astuce:
        "ON social media. Post ON Instagram. ON = pour les plateformes en ligne. Share, like, comment, follow = verbes réseaux sociaux.",
    },
  },
  {
    question: "What does 'to go viral' mean?",
    options: [
      "avoir un virus informatique",
      "se propager rapidement sur Internet",
      "supprimer un fichier",
      "pirater un compte",
    ],
    answer: "se propager rapidement sur Internet",
    fiche: {
      regle:
        "Go viral = devenir viral = se propager très rapidement sur les réseaux sociaux. Comme un virus biologique, ça se propage vite.",
      exemple:
        "✅ The video went viral overnight. The meme went viral and got millions of views.",
      piege:
        "Go viral ≠ avoir un virus informatique. Viral (figuré) = qui se propage très vite sur les réseaux.",
      astuce:
        "Viral = comme un virus (ça se propage). Go viral = devenir viral = énorme succès rapide sur les réseaux.",
    },
  },
  {
    question: "What is 'screen time' in French?",
    options: [
      "l'heure sur l'écran",
      "le temps passé devant les écrans",
      "la résolution de l'écran",
      "le mode nuit",
    ],
    answer: "le temps passé devant les écrans",
    fiche: {
      regle:
        "Screen time = temps d'écran = temps passé devant les écrans (téléphone, tablette, ordi, TV). Trop de screen time est mauvais pour la santé.",
      exemple:
        "✅ Reduce your screen time before bed. She spends 5 hours of screen time a day.",
      piege:
        "Screen time ≠ l'heure sur l'écran. C'est le TEMPS TOTAL passé devant les écrans.",
      astuce:
        "Screen = écran. Time = temps. Screen time = temps passé sur les écrans. Recommended limit: 2h/day for teens.",
    },
  },
  {
    question: "Complete: 'She is addicted ___ her smartphone.'",
    options: ["to", "of", "with", "at"],
    answer: "to",
    fiche: {
      regle:
        "Addicted TO + chose. Be addicted to = être accro à. Addiction TO = addiction à. Toujours la préposition TO.",
      exemple:
        "✅ She is addicted to her phone. He is addicted to social media. Addiction to gaming is a real problem.",
      piege:
        "Addicted TO (pas of, with ou at). Addicted + TO = toujours cette préposition.",
      astuce:
        "Addicted TO. Interested IN. Good AT. Ces adjectifs ont chacun leur préposition attitrée à mémoriser.",
    },
  },
  {
    question: "What does 'artificial intelligence' (AI) mean in French?",
    options: [
      "intelligence artificielle",
      "intelligence augmentée",
      "apprentissage automatique",
      "réalité virtuelle",
    ],
    answer: "intelligence artificielle",
    fiche: {
      regle:
        "Tech vocabulary : AI/artificial intelligence (intelligence artificielle), VR/virtual reality (réalité virtuelle), AR/augmented reality (réalité augmentée), machine learning (apprentissage automatique).",
      exemple:
        "✅ AI is changing the world. Virtual reality is used in gaming. Machine learning helps computers learn.",
      piege:
        "AI = Artificial Intelligence (pas Augmented Intelligence). AR = Augmented Reality (pas Artificial Reality).",
      astuce:
        "AI = Intelligence Artificielle. VR = Réalité Virtuelle. AR = Réalité Augmentée. Les acronymes sont les mêmes en anglais et français !",
    },
  },
];

export default function MediasTechnologiePage() {
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
          <div className="lecon-badge">📱 Anglais — 5ème</div>
          <h1 className="lecon-titre">Médias & technologie</h1>
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
            Apprends le vocabulaire des{" "}
            <strong>médias et de la technologie</strong> en anglais : réseaux
            sociaux, Internet, intelligence artificielle...
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
              <div className="lecon-point-titre">🌐 Internet & appareils</div>
              <div className="lecon-point-texte">
                Surf the web, download/upload, stream, screenshot, selfie,
                wallpaper. Go viral = devenir viral.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> The video went
                viral. I downloaded the app. Post ON Instagram.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📲 Réseaux sociaux</div>
              <div className="lecon-point-texte">
                Post, share, like, comment, follow, tag. On social media. Fake
                news, reliable source, cyberbullying.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> She posts
                photos on Instagram. Beware of fake news!
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🤖 Technologies du futur</div>
              <div className="lecon-point-texte">
                AI (artificial intelligence), VR (virtual reality), AR
                (augmented reality), machine learning. Screen time = temps
                d'écran.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> AI is changing
                the world. Reduce your screen time.
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
                  {estCorrecte ? "Well done! 🎉" : "Not quite..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellent answer!"
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
                    📖 Voir la fiche
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
        ? "Excellent!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep trying!";
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
