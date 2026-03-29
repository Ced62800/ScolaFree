"use client";

import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "6eme";
const MATIERE = "francais";
const THEME = "vocabulaire";

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
    question: "Quel est le synonyme de « rapide » ?",
    options: ["lent", "vite", "grand", "fort"],
    answer: "vite",
    fiche: {
      regle:
        "Les synonymes sont des mots qui ont un sens proche ou identique. Ils appartiennent à la même classe grammaticale.",
      exemple:
        "✅ rapide = vite = prompt / lent = s'oppose à rapide (antonyme)",
      piege:
        "Un synonyme doit avoir la même classe grammaticale : 'rapide' (adjectif) → 'vite' peut être adverbe. Cherche 'prompt' !",
      astuce:
        "Pour trouver un synonyme, cherche un mot qui peut remplacer l'original dans la phrase !",
    },
  },
  {
    question: "Quel est l'antonyme (contraire) de « courageux » ?",
    options: ["brave", "vaillant", "lâche", "fort"],
    answer: "lâche",
    fiche: {
      regle:
        "Les antonymes sont des mots qui ont un sens opposé. On peut souvent les former avec un préfixe (in-, dé-, im-).",
      exemple: "✅ courageux ≠ lâche / grand ≠ petit / possible ≠ impossible",
      piege:
        "Ne pas confondre synonyme (même sens) et antonyme (sens contraire) !",
      astuce:
        "Pour trouver un antonyme, demande-toi quel mot a le sens opposé !",
    },
  },
  {
    question: "À quelle famille de mots appartient « jardinier » ?",
    options: [
      "La famille de 'jardinage'",
      "La famille de 'jardin'",
      "La famille de 'jard'",
      "La famille de 'nier'",
    ],
    answer: "La famille de 'jardin'",
    fiche: {
      regle:
        "Une famille de mots regroupe des mots formés à partir du même radical. Ils ont tous un lien de sens.",
      exemple: "✅ jardin → jardinier, jardinage, jardiner, jardinière",
      piege:
        "Le radical peut changer légèrement : jardin → jardin-ier, jardin-age. Le sens reste lié !",
      astuce:
        "Cherche le mot de base (le radical) et trouve tous les mots construits avec lui !",
    },
  },
  {
    question: "Quel est le sens du préfixe « in- » dans « invisible » ?",
    options: ["Beaucoup", "Pas du tout", "Très", "Encore"],
    answer: "Pas du tout",
    fiche: {
      regle:
        "Le préfixe 'in-' (ou im-, il-, ir-) indique la négation, le contraire.",
      exemple:
        "✅ visible → invisible (pas visible) / possible → impossible / légal → illégal / régulier → irrégulier",
      piege:
        "Attention : 'in-' peut aussi signifier 'dans' dans certains mots (insérer, inhaler) !",
      astuce:
        "in- / im- / il- / ir- = contraire. Vérifie le sens dans le contexte !",
    },
  },
  {
    question: "Quel mot est un synonyme de « triste » ?",
    options: ["joyeux", "gai", "mélancolique", "heureux"],
    answer: "mélancolique",
    fiche: {
      regle:
        "Les synonymes partagent un sens proche mais pas forcément identique. 'Mélancolique' exprime une tristesse douce et rêveuse.",
      exemple:
        "✅ triste = mélancolique = morne = morose / joyeux = gai = heureux (antonymes)",
      piege:
        "Joyeux, gai et heureux sont des antonymes de 'triste', pas des synonymes !",
      astuce:
        "Teste le mot dans une phrase pour vérifier qu'il a bien le même sens !",
    },
  },
  {
    question: "Que signifie le suffixe « -eur » dans « chanteur » ?",
    options: [
      "L'action de chanter",
      "Celui qui chante",
      "La qualité du chant",
      "L'endroit où on chante",
    ],
    answer: "Celui qui chante",
    fiche: {
      regle:
        "Le suffixe '-eur' indique souvent une personne qui fait l'action : chanter → chanteur, nager → nageur.",
      exemple:
        "✅ chanter → chanteur / courir → coureur / nager → nageur / conduire → conducteur",
      piege:
        "Attention : '-eur' peut aussi indiquer une qualité (chaleur, blancheur) !",
      astuce:
        "Si le mot de base est un verbe, '-eur' indique souvent la personne qui fait l'action !",
    },
  },
  {
    question: "Quel est le niveau de langue de « bouquin » ?",
    options: ["Soutenu", "Courant", "Familier", "Littéraire"],
    answer: "Familier",
    fiche: {
      regle:
        "Il existe 3 niveaux de langue : familier (bouquin), courant (livre), soutenu (ouvrage).",
      exemple:
        "✅ Familier : bouquin / Courant : livre / Soutenu : ouvrage, tome",
      piege:
        "On adapte son niveau de langue selon la situation : on ne parle pas à un prof comme à ses amis !",
      astuce:
        "Familier = entre amis / Courant = usage normal / Soutenu = écrit formel, discours !",
    },
  },
  {
    question: "Quel est le mot de la même famille que « lumière » ?",
    options: ["lune", "lumineux", "lampe", "soleil"],
    answer: "lumineux",
    fiche: {
      regle:
        "Les mots de la même famille partagent le même radical et ont un sens proche.",
      exemple:
        "✅ lumière → lumineux, illuminer, luminosité / lune et lampe n'ont pas le même radical",
      piege:
        "Lune et lampe ne font pas partie de la famille de 'lumière' malgré la lettre 'l' !",
      astuce:
        "Cherche le radical commun : lumière → lumin- → lumineux, luminosité, illuminer !",
    },
  },
  {
    question: "Que signifie « périphérie » ?",
    options: [
      "Le centre d'une ville",
      "Les bords, la zone autour d'un centre",
      "Un type de transport",
      "Un quartier historique",
    ],
    answer: "Les bords, la zone autour d'un centre",
    fiche: {
      regle:
        "Le préfixe 'péri-' signifie 'autour'. La périphérie est donc ce qui est autour du centre.",
      exemple:
        "✅ périphérie (autour) / périmètre (mesure autour) / périphérique (route autour d'une ville)",
      piege: "Ne pas confondre avec 'centre' qui est l'opposé de périphérie !",
      astuce:
        "péri- = autour. Retiens : périmètre = mesure autour, périphérie = zone autour !",
    },
  },
  {
    question: "Quel mot est l'antonyme de « optimiste » ?",
    options: ["confiant", "joyeux", "pessimiste", "serein"],
    answer: "pessimiste",
    fiche: {
      regle:
        "L'antonyme est le contraire. Optimiste (qui voit le bon côté) ≠ pessimiste (qui voit le mauvais côté).",
      exemple:
        "✅ optimiste ≠ pessimiste / confiant ≠ méfiant / joyeux ≠ triste",
      piege:
        "Confiant et joyeux sont proches du sens d'optimiste (synonymes), pas ses antonymes !",
      astuce:
        "Optimiste → pense que tout ira bien. Pessimiste → pense que tout ira mal. Opposés !",
    },
  },
];

export default function VocabulairePage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(false);
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
    setFicheObligatoireLue(false);
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
      if (fautesRef.current === 1) {
        setFicheOuverte(true);
        setFicheObligatoireLue(false);
      } else if (fautesRef.current === 6) {
        setFicheObligatoireLue(false);
      }
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
      setFicheObligatoireLue(false);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current === 6;
  const boutonBloque = est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro") {
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">📖 Français — 6ème</div>
          <h1 className="lecon-titre">Le vocabulaire</h1>
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
            Le vocabulaire en 6ème, c'est enrichir son lexique :{" "}
            <strong>synonymes</strong>, <strong>antonymes</strong>,{" "}
            <strong>familles de mots</strong>,{" "}
            <strong>préfixes et suffixes</strong> !
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
              <div className="lecon-point-titre">🔁 Synonymes et antonymes</div>
              <div className="lecon-point-texte">
                <strong>Synonymes</strong> = même sens ·{" "}
                <strong>Antonymes</strong> = sens contraire
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Synonymes :</span> rapide = vite
                = prompt
                <br />
                <span className="exemple-label">Antonymes :</span> rapide ≠ lent
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">👨‍👩‍👧 Familles de mots</div>
              <div className="lecon-point-texte">
                Des mots construits sur le même <strong>radical</strong> et liés
                par le sens.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Famille de jardin :</span>{" "}
                jardinier, jardinage, jardiner
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🧩 Préfixes et suffixes</div>
              <div className="lecon-point-texte">
                Des éléments ajoutés avant ou après le radical pour former de
                nouveaux mots.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Préfixes :</span> in-
                (contraire), péri- (autour), re- (à nouveau)
                <br />
                <span className="exemple-label">Suffixes :</span> -eur (celui
                qui), -age (action), -ier (métier)
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer les exercices →
          </button>
        </div>
      </div>
    );
  }

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
              let className = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) className += " correct";
                else if (option === reponseChoisie) className += " incorrect";
                else className += " disabled";
              }
              return (
                <button
                  key={option}
                  className={className}
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
                      😅 Aïe, 6 erreurs !
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Tu dois relire la fiche avant de continuer. Elle est là
                      pour t'aider ! 💪
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
                  📖 Lis la fiche pour débloquer la question suivante !
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
                📖 Mode découverte (5 questions). Inscris-toi pour les 10
                questions !
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
