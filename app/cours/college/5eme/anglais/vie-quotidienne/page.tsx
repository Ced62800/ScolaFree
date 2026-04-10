"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "anglais";
const THEME = "vie-quotidienne";

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
      "What is the difference between 'British English' and 'American English' for 'appartement'?",
    options: [
      "flat (UK) / apartment (US)",
      "apartment (UK) / flat (US)",
      "Both say 'apartment'",
      "Both say 'flat'",
    ],
    answer: "flat (UK) / apartment (US)",
    fiche: {
      regle:
        "Différences UK/US : flat (UK) = apartment (US). Lift (UK) = elevator (US). Biscuit (UK) = cookie (US). Lorry (UK) = truck (US).",
      exemple:
        "✅ I live in a flat. (UK) = I live in an apartment. (US). Take the lift (UK) / elevator (US).",
      piege:
        "Flat (UK) ≠ flat (adj = plat). Flat = appartement au Royaume-Uni. Contexte important !",
      astuce:
        "Flat/apartment, lift/elevator, biscuit/cookie, lorry/truck, rubbish/garbage, autumn/fall. UK vs US pairs !",
    },
  },
  {
    question: "How do you say 'les transports en commun' in English?",
    options: [
      "common transports",
      "public transport",
      "community transport",
      "shared transport",
    ],
    answer: "public transport",
    fiche: {
      regle:
        "Public transport = transports en commun. Includes: bus, tube/subway (métro), train, tram, ferry. Commute = trajets domicile-travail.",
      exemple:
        "✅ I take public transport to school. She commutes by train. The London tube is very famous.",
      piege:
        "Tube (UK) = subway (US) = métro. Ne pas confondre tube (métro) et tube (tube/tuyau).",
      astuce:
        "Public transport = bus, train, tube/subway, tram. Tube = métro londonien. Subway = métro américain.",
    },
  },
  {
    question: "What is 'Thanksgiving' and where is it celebrated?",
    options: [
      "Une fête religieuse célébrée en UK",
      "Une fête américaine pour remercier et partager",
      "Une fête célébrée en Australie",
      "Le Noël américain",
    ],
    answer: "Une fête américaine pour remercier et partager",
    fiche: {
      regle:
        "Thanksgiving = fête américaine (4ème jeudi de novembre) et canadienne (2ème lundi d'octobre). On remercie pour les récoltes, en famille autour d'une dinde.",
      exemple:
        "✅ Americans celebrate Thanksgiving with turkey, mashed potatoes and pumpkin pie. It's a family holiday.",
      piege:
        "Thanksgiving est AMÉRICAIN (et canadien), pas britannique. Noël = Christmas, pas Thanksgiving.",
      astuce:
        "Thanksgiving = remercier (to thank). Turkey, pumpkin pie, cranberry sauce = plats traditionnels. 4ème jeudi de novembre aux USA.",
    },
  },
  {
    question: "How do you describe your daily routine? 'Je me lève à 7h'",
    options: [
      "I wake up at 7.",
      "I get up at 7.",
      "I rise at 7.",
      "Both a and b are correct.",
    ],
    answer: "Both a and b are correct.",
    fiche: {
      regle:
        "Wake up = se réveiller (ouvrir les yeux). Get up = se lever (sortir du lit). Les deux sont souvent utilisés ensemble ou interchangeables.",
      exemple:
        "✅ I wake up at 7 and get up at 7:15. First I wake up, then I get up.",
      piege:
        "Wake up = se réveiller (les yeux). Get up = se lever (le corps). Nuance mais les deux sont acceptés.",
      astuce:
        "Wake up → yeux ouverts. Get up → corps debout. 'I wake up at 7, then get up.' Séquence naturelle.",
    },
  },
  {
    question: "What is 'Guy Fawkes Night' in the UK?",
    options: [
      "La fête nationale britannique",
      "Une nuit de feux d'artifice le 5 novembre",
      "L'équivalent d'Halloween",
      "Une fête de printemps",
    ],
    answer: "Une nuit de feux d'artifice le 5 novembre",
    fiche: {
      regle:
        "Guy Fawkes Night (Bonfire Night) = 5 novembre. Commémore l'échec du Gunpowder Plot de 1605. Feux d'artifice et grands feux de joie dans tout le Royaume-Uni.",
      exemple:
        "✅ On Guy Fawkes Night, British people light bonfires and watch fireworks. 'Remember, remember the fifth of November!'",
      piege:
        "Guy Fawkes Night ≠ Halloween (31 octobre). Deux fêtes différentes en octobre/novembre au UK.",
      astuce:
        "Bonfire Night = Guy Fawkes Night = 5 novembre. Bonfire = grand feu. Fireworks = feux d'artifice.",
    },
  },
  {
    question: "How do you say 'faire les courses' in English?",
    options: [
      "to do the races",
      "to go shopping / to do the shopping",
      "to make shopping",
      "to run errands",
    ],
    answer: "to go shopping / to do the shopping",
    fiche: {
      regle:
        "Go shopping = aller faire du shopping (plaisir). Do the shopping = faire les courses (nécessité). Run errands = faire des courses/commissions.",
      exemple:
        "✅ I go shopping on Saturdays. (plaisir). She does the shopping every week. (nécessité).",
      piege:
        "'Do the races' → FAUX. Go shopping ou do the shopping = faire les courses. Run errands aussi.",
      astuce:
        "Go shopping (plaisir). Do the shopping (nécessité). Run errands (commissions multiples). Trois expressions utiles !",
    },
  },
  {
    question: "What does 'chores' mean in French?",
    options: [
      "les loisirs",
      "les tâches ménagères",
      "les courses",
      "les devoirs",
    ],
    answer: "les tâches ménagères",
    fiche: {
      regle:
        "Chores = household chores = tâches ménagères. Do the dishes (faire la vaisselle), do the laundry (faire la lessive), vacuum (passer l'aspirateur), tidy up (ranger).",
      exemple:
        "✅ I do my chores every weekend. My chores include doing the dishes and vacuuming.",
      piege:
        "Chores ≠ homework (devoirs scolaires). Chores = tâches à LA MAISON. Homework = devoirs pour L'ÉCOLE.",
      astuce:
        "Chores = tâches ménagères. Do the dishes, tidy up, vacuum, do the laundry = exemples de chores.",
    },
  },
  {
    question:
      "How do you express habitual actions in the past? 'Quand j'étais jeune, je jouais au foot.'",
    options: [
      "When I was young, I played football.",
      "When I was young, I used to play football.",
      "Both are correct.",
      "When I was young, I was playing football.",
    ],
    answer: "Both are correct.",
    fiche: {
      regle:
        "Habitudes passées : Past Simple (I played) ou Used to (I used to play). Les deux expriment une habitude passée qui n'existe plus.",
      exemple:
        "✅ When I was young, I played football. = When I was young, I used to play football. Même sens.",
      piege:
        "Used to = exclusivement pour le passé (habitude passée terminée). Pas pour le présent.",
      astuce:
        "Used to + BASE = habitude passée terminée. I used to eat meat (mais plus maintenant). Past Simple aussi correct.",
    },
  },
  {
    question: "What is the meaning of 'to hang out'?",
    options: [
      "étendre le linge",
      "traîner/passer du temps avec des amis",
      "sortir tard le soir",
      "se battre",
    ],
    answer: "traîner/passer du temps avec des amis",
    fiche: {
      regle:
        "Hang out (phrasal verb) = traîner, passer du temps (avec des amis). Hang out with friends = passer du temps avec des amis. Très informel.",
      exemple:
        "✅ We usually hang out at the park after school. Do you want to hang out this weekend?",
      piege:
        "Hang out ≠ hang out washing (étendre le linge). Contexte différent. Hang out WITH someone = traîner.",
      astuce:
        "Hang out = traîner (argot). Hang out WITH friends = passer du temps avec. Très utilisé par les jeunes anglophones !",
    },
  },
  {
    question: "How do you say 'les feux de circulation' in English?",
    options: ["traffic lights", "road signs", "crossroads", "roundabout"],
    answer: "traffic lights",
    fiche: {
      regle:
        "Vocabulaire de la rue : traffic lights (feux de circulation), road signs (panneaux de signalisation), crossroads (carrefour), roundabout (rond-point), pavement/sidewalk (trottoir).",
      exemple:
        "✅ Stop at the traffic lights. Turn left at the roundabout. Cross at the crossroads.",
      piege:
        "Roundabout (UK) = traffic circle (US) = rond-point. Pavement (UK) = sidewalk (US) = trottoir.",
      astuce:
        "Traffic lights = feux. Roundabout = rond-point. Crossroads = carrefour. Pavement (UK)/Sidewalk (US) = trottoir.",
    },
  },
];

export default function VieQuotidiennePage() {
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
          <div className="lecon-badge">🌎 Anglais — 5ème</div>
          <h1 className="lecon-titre">Vie quotidienne & culture anglophone</h1>
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
            Découvre la <strong>vie quotidienne</strong> dans les pays
            anglophones : différences UK/US, fêtes culturelles, routines et
            expressions du quotidien.
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
              <div className="lecon-point-titre">🇬🇧🇺🇸 UK vs USA</div>
              <div className="lecon-point-texte">
                Flat/apartment, lift/elevator, biscuit/cookie, lorry/truck,
                tube/subway, pavement/sidewalk.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Flat (UK) =
                apartment (US). Lift (UK) = elevator (US).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎉 Fêtes anglophones</div>
              <div className="lecon-point-texte">
                Thanksgiving (US, 4ème jeudi novembre). Guy Fawkes Night (UK, 5
                nov). Halloween (31 oct). Christmas (25 déc).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Americans eat
                turkey at Thanksgiving. Brits have bonfires on Guy Fawkes Night.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🏠 Vie de tous les jours</div>
              <div className="lecon-point-texte">
                Chores (tâches ménagères), public transport, hang out (traîner),
                used to (habitudes passées).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I do my chores.
                We hang out after school. I used to live in London.
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
