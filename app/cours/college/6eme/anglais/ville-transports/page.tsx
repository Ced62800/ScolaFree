"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "anglais";
const THEME = "ville-transports";

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
    question: "What is a 'chemist's' in French?",
    options: [
      "une librairie",
      "une pharmacie",
      "une épicerie",
      "un magasin de vêtements",
    ],
    answer: "une pharmacie",
    fiche: {
      regle:
        "Les lieux en ville : chemist's (pharmacie), baker's (boulangerie), butcher's (boucherie), library (bibliothèque).",
      exemple:
        "✅ The chemist's is next to the bank. / I buy medicine at the chemist's.",
      piege:
        "Chemist's = pharmacie (pas chimiste). Library = bibliothèque (pas librairie !)",
      astuce:
        "Faux amis ! Library = bibliothèque (pas librairie). Chemist's = pharmacie !",
    },
  },
  {
    question: "How do you ask for directions: 'Où est la gare ?'",
    options: [
      "Where is the train station?",
      "How is the train station?",
      "What is the train station?",
      "When is the train station?",
    ],
    answer: "Where is the train station?",
    fiche: {
      regle: "Where is...? = Où est...? Pour demander l'emplacement d'un lieu.",
      exemple: "✅ Where is the train station? / Where is the nearest bank?",
      piege: "WHERE = où (lieu). WHEN = quand. HOW = comment. WHAT = quoi.",
      astuce:
        "WHERE = où. Where is the + lieu ? Simple pour demander un chemin !",
    },
  },
  {
    question: "How do you say 'Tournez à gauche' in English?",
    options: ["Turn right.", "Go straight on.", "Turn left.", "Go back."],
    answer: "Turn left.",
    fiche: {
      regle:
        "Les directions : turn left (tournez à gauche), turn right (tournez à droite), go straight on (allez tout droit).",
      exemple:
        "✅ Turn left at the traffic lights. / Go straight on for 200 metres.",
      piege: "Left = gauche, Right = droite. Ne pas les confondre !",
      astuce:
        "LEFT = gauche. RIGHT = droite. Go straight ON = tout droit. Les 3 directions clés !",
    },
  },
  {
    question: "How do you say 'C'est loin d'ici ?' in English?",
    options: [
      "Is it near?",
      "Is it far from here?",
      "Is it close?",
      "Is it far away here?",
    ],
    answer: "Is it far from here?",
    fiche: {
      regle:
        "Far from = loin de. Near = près de. Is it far from here? = Est-ce loin d'ici ?",
      exemple:
        "✅ Is it far from here? No, it's near. / It's about 5 minutes' walk.",
      piege: "Far FROM here (pas 'far of here' ou 'far away here').",
      astuce:
        "FAR from = loin de. NEAR = près. It's near the park = c'est près du parc !",
    },
  },
  {
    question: "What is 'a crossroads' in French?",
    options: [
      "un rond-point",
      "un carrefour",
      "un feu rouge",
      "un passage piéton",
    ],
    answer: "un carrefour",
    fiche: {
      regle:
        "Vocabulaire des directions : crossroads (carrefour), roundabout (rond-point), traffic lights (feux), zebra crossing (passage piéton).",
      exemple: "✅ Turn left at the crossroads. / There is a roundabout ahead.",
      piege:
        "Crossroads = carrefour (pas rond-point). Roundabout = rond-point.",
      astuce:
        "Cross = croix. Crossroads = là où les routes se croisent = carrefour !",
    },
  },
  {
    question: "How do you say 'Je vais à l'école en vélo' in English?",
    options: [
      "I go to school with bike.",
      "I go to school by bike.",
      "I go to school on bike.",
      "I cycle to school by.",
    ],
    answer: "I go to school by bike.",
    fiche: {
      regle:
        "Les transports : by + moyen de transport. By bus, by car, by bike, by train, by plane.",
      exemple:
        "✅ I go to school by bike. / She travels by train. / He goes by car.",
      piege:
        "BY + transport (pas 'with' ou 'on'). Exception : on foot (à pied).",
      astuce:
        "BY bus/car/bike/train/plane. Mais ON FOOT (à pied). BY = par/en moyen de transport !",
    },
  },
  {
    question: "How do you say 'Il y a une boulangerie près d'ici' in English?",
    options: [
      "There have a bakery near here.",
      "There is a bakery near here.",
      "It is a bakery near here.",
      "There are a bakery near here.",
    ],
    answer: "There is a bakery near here.",
    fiche: {
      regle:
        "There is + singulier = il y a (un/une). There are + pluriel = il y a (des).",
      exemple:
        "✅ There is a bakery near here. / There are two parks in the town.",
      piege:
        "There IS (singulier) / There ARE (pluriel). Ne pas dire 'there have'.",
      astuce:
        "There IS + singulier. There ARE + pluriel. Il Y A = there is/are !",
    },
  },
  {
    question: "How do you say 'Excuse-moi, pouvez-vous m'aider ?' in English?",
    options: [
      "Sorry, can you help me?",
      "Excuse me, could you help me?",
      "Pardon, you help me?",
      "Excuse me, help me please?",
    ],
    answer: "Excuse me, could you help me?",
    fiche: {
      regle:
        "Excuse me = excusez-moi (pour interpeller). Could you = pourriez-vous (poli).",
      exemple:
        "✅ Excuse me, could you help me? / Excuse me, where is the station?",
      piege:
        "Excuse me (interpeller quelqu'un). Sorry (s'excuser d'une erreur). Nuance !",
      astuce:
        "EXCUSE ME = pour interpeller. SORRY = pour s'excuser. Could = plus poli que can !",
    },
  },
  {
    question: "What does 'It's opposite the library' mean?",
    options: [
      "C'est à côté de la bibliothèque.",
      "C'est en face de la bibliothèque.",
      "C'est loin de la bibliothèque.",
      "C'est derrière la bibliothèque.",
    ],
    answer: "C'est en face de la bibliothèque.",
    fiche: {
      regle:
        "Opposite = en face de. Next to = à côté de. Behind = derrière. In front of = devant.",
      exemple:
        "✅ The school is opposite the park. / The bank is next to the post office.",
      piege: "Opposite = en face (pas à côté). Next to = à côté (pas en face).",
      astuce:
        "Opposite = en face. Next to = à côté. Behind = derrière. In front of = devant !",
    },
  },
  {
    question: "How do you say 'à pied' in English?",
    options: ["by foot", "with foot", "on foot", "in foot"],
    answer: "on foot",
    fiche: {
      regle:
        "On foot = à pied. Exception : on foot (pas by foot). Seul transport avec ON.",
      exemple: "✅ I go to school on foot. / It's 10 minutes on foot.",
      piege:
        "ON foot (pas by foot). C'est la seule exception au 'by + transport' !",
      astuce:
        "BY bus, BY car, BY bike... MAIS ON foot. L'exception à retenir !",
    },
  },
];

export default function VilleTransportsPage() {
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
  const boutonBloque =
    fautesRef.current >= 6 && !ficheObligatoireLue && estCorrecte === false;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🇬🇧 Anglais — 6ème</div>
          <h1 className="lecon-titre">La ville et les transports</h1>
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
            Apprends à te repérer dans une <strong>ville anglaise</strong> et à
            parler des <strong>transports</strong>. Directions, lieux,
            expressions clés !
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
              <div className="lecon-point-titre">🏙️ Les lieux en ville</div>
              <div className="lecon-point-texte">
                Train station (gare), chemist's (pharmacie), baker's
                (boulangerie), library (bibliothèque), post office (poste).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> The library is
                opposite the school.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🗺️ Les directions</div>
              <div className="lecon-point-texte">
                Turn left/right, go straight on, opposite (en face), next to (à
                côté), behind (derrière).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Turn left at
                the crossroads.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🚌 Les transports</div>
              <div className="lecon-point-texte">
                By bus/car/bike/train/plane. Exception : on foot (à pied).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> I go to school
                by bus. She walks on foot.
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
                {!estCorrecte &&
                  fautesRef.current >= 6 &&
                  !ficheObligatoireLue && (
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
