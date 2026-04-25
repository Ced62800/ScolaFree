"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "les-figures-de-style";

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
    question: "Identifie la figure de style : 'Ses yeux sont des étoiles.'",
    options: ["Comparaison", "Métaphore", "Personnification", "Hyperbole"],
    answer: "Métaphore",
    fiche: {
      regle:
        "La métaphore compare deux éléments SANS outil de comparaison (sans comme, tel, pareil à...). Elle identifie directement les deux termes.",
      exemple:
        "✅ 'Ses yeux sont des étoiles' = métaphore (pas de 'comme'). 'Ses yeux sont comme des étoiles' = comparaison.",
      piege:
        "Métaphore ≠ comparaison. La métaphore n'a pas de mot comparatif. Sans 'comme' → métaphore. Avec 'comme' → comparaison.",
      astuce:
        "Métaphore = identification directe (A est B). Comparaison = rapprochement avec outil (A est comme B). Le 'comme' fait toute la différence !",
    },
  },
  {
    question: "Identifie la figure : 'Il mange comme un ogre.'",
    options: ["Métaphore", "Hyperbole", "Comparaison", "Personnification"],
    answer: "Comparaison",
    fiche: {
      regle:
        "La comparaison utilise un outil de comparaison : comme, tel, pareil à, semblable à, ressembler à, on dirait... Elle rapproche deux éléments en les maintenant distincts.",
      exemple:
        "✅ 'Il mange comme un ogre.' 'Elle est belle comme le jour.' 'Tel un lion, il rugit.'",
      piege:
        "Ne pas confondre avec la métaphore. La comparaison garde les deux termes distincts avec un outil. La métaphore les fusionne.",
      astuce:
        "Comparaison = COMME / TEL / PAREIL À. Cherche toujours l'outil comparatif pour identifier une comparaison.",
    },
  },
  {
    question: "Identifie la figure : 'J'ai attendu une éternité !'",
    options: ["Litote", "Euphémisme", "Hyperbole", "Métaphore"],
    answer: "Hyperbole",
    fiche: {
      regle:
        "L'hyperbole est une exagération volontaire pour renforcer l'expression. Elle dépasse la réalité pour créer un effet d'intensité.",
      exemple:
        "✅ 'J'ai attendu une éternité !' 'Il est mort de rire.' 'Je t'ai dit mille fois !' 'Je meurs de faim.'",
      piege:
        "L'hyperbole n'est pas prise au sens littéral. On n'a pas vraiment attendu une éternité !",
      astuce:
        "Hyperbole = exagération. Contraire = litote (dire moins pour suggérer plus). 'C'est pas mal' = litote pour 'c'est très bien'.",
    },
  },
  {
    question: "Identifie la figure : 'Le vent gémissait dans les arbres.'",
    options: ["Métaphore", "Comparaison", "Personnification", "Allitération"],
    answer: "Personnification",
    fiche: {
      regle:
        "La personnification attribue des caractéristiques humaines (sentiments, actions, paroles) à un objet, un animal ou un phénomène naturel.",
      exemple:
        "✅ 'Le vent gémissait' (gémit = action humaine). 'La mer en colère'. 'Le soleil sourit'. 'La mort le prit par la main.'",
      piege:
        "Personnification ≠ métaphore animale. La personnification donne des traits HUMAINS à un NON-humain.",
      astuce:
        "Personnification = donner vie humaine à une chose. Vent qui gémit, mer en colère, soleil qui sourit = humain appliqué à la nature.",
    },
  },
  {
    question: "Qu'est-ce qu'une litote ?",
    options: [
      "Une exagération",
      "Une figure qui dit moins pour suggérer plus",
      "Une répétition de sons",
      "Une comparaison sans outil",
    ],
    answer: "Une figure qui dit moins pour suggérer plus",
    fiche: {
      regle:
        "La litote dit moins que ce qu'on pense pour suggérer davantage. Elle atténue l'expression pour créer un effet d'ironie ou d'intensité discrète.",
      exemple:
        "✅ 'Ce n'est pas mal' = c'est très bien. 'Va, je ne te hais point' (Corneille) = je t'aime. 'Il n'est pas bête' = il est très intelligent.",
      piege:
        "Litote ≠ hyperbole. L'hyperbole exagère en plus. La litote atténue (dit moins). Effets inverses !",
      astuce:
        "Litote = euphémisme ironique. 'Ce n'est pas mal' → litote pour 'c'est très bien'. Contraire de l'hyperbole.",
    },
  },
  {
    question:
      "Identifie la figure : 'Pour toujours, pour toujours, pour toujours tu resteras dans mon cœur.'",
    options: ["Anaphore", "Allitération", "Assonance", "Chiasme"],
    answer: "Anaphore",
    fiche: {
      regle:
        "L'anaphore est la répétition d'un même mot ou groupe de mots au début de plusieurs propositions ou vers consécutifs. Elle crée un effet d'insistance.",
      exemple:
        "✅ 'Pour toujours, pour toujours, pour toujours...' Céline Dion. 'Je me souviens des jours, je me souviens des nuits...'",
      piege:
        "Anaphore = répétition en DÉBUT de phrase/vers. Épiphore = répétition en FIN. Deux figures différentes.",
      astuce:
        "Anaphore = ANA = en tête. Répétition du même mot au DÉBUT de chaque phrase. Très efficace pour insister.",
    },
  },
  {
    question: "Qu'est-ce qu'une allitération ?",
    options: [
      "Répétition d'une même voyelle",
      "Répétition d'une même consonne",
      "Répétition d'un même mot",
      "Répétition d'un même son global",
    ],
    answer: "Répétition d'une même consonne",
    fiche: {
      regle:
        "L'allitération est la répétition d'un même son consonantique dans plusieurs mots proches. Elle crée une musicalité, une harmonie imitative.",
      exemple:
        "✅ 'Pour qui sont ces serpents qui sifflent sur vos têtes ?' (Racine). Les 's' imitent le sifflement.",
      piege:
        "Allitération = consonnes. Assonance = voyelles. Les deux sont des figures de sonorité.",
      astuce:
        "Allitération = consonnes répétées. Assonance = voyelles répétées. 'Les sanglots longs des violons' = assonance en 'on'.",
    },
  },
  {
    question: "Qu'est-ce qu'un euphémisme ?",
    options: [
      "Une exagération",
      "Une expression atténuée pour dire quelque chose de difficile",
      "Une comparaison",
      "Une répétition",
    ],
    answer: "Une expression atténuée pour dire quelque chose de difficile",
    fiche: {
      regle:
        "L'euphémisme remplace une expression difficile, choquante ou tabou par une formulation plus douce. Il atténue la réalité.",
      exemple:
        "✅ 'Il nous a quittés' (au lieu de 'il est mort'). 'Il est dans le besoin' (au lieu de 'il est pauvre'). 'Malvoyant' (au lieu d'aveugle).",
      piege:
        "Euphémisme ≠ litote. L'euphémisme évite un mot difficile. La litote dit moins pour suggérer plus (avec ironie possible).",
      astuce:
        "Euphémisme = adoucir une réalité difficile. Mort → 'il nous a quittés'. Pauvreté → 'difficultés financières'.",
    },
  },
  {
    question: "Identifie la figure : 'La vie est un voyage.'",
    options: ["Comparaison", "Hyperbole", "Métaphore", "Personnification"],
    answer: "Métaphore",
    fiche: {
      regle:
        "Métaphore filée = une métaphore développée sur plusieurs phrases ou tout un texte. 'La vie est un voyage' peut se développer : 'On fait des escales, on rencontre des voyageurs...'",
      exemple:
        "✅ 'La vie est un voyage' → métaphore simple. Si on développe : 'elle a des escales, des tempêtes, des ports' → métaphore filée.",
      piege:
        "Sans 'comme' → métaphore. Avec 'comme' → comparaison. 'La vie est comme un voyage' = comparaison.",
      astuce:
        "Métaphore = identification sans outil. 'La vie EST un voyage' (pas 'comme'). Filée = développée sur plusieurs lignes.",
    },
  },
  {
    question: "Qu'est-ce qu'un oxymore ?",
    options: [
      "Une répétition",
      "Un rapprochement de deux termes contradictoires",
      "Une exagération",
      "Une personnification",
    ],
    answer: "Un rapprochement de deux termes contradictoires",
    fiche: {
      regle:
        "L'oxymore (ou oxymoron) rapproche deux termes de sens opposés pour créer un effet saisissant, paradoxal.",
      exemple:
        "✅ 'Cette obscure clarté' (Corneille). 'Un silence éloquent'. 'Une douce violence'. 'Cette sombre lumière'.",
      piege:
        "Oxymore ≠ antithèse. L'oxymore réunit les contraires dans le même groupe nominal. L'antithèse les oppose dans deux propositions.",
      astuce:
        "Oxymore = contraires COLLÉS ensemble (adj + nom). 'Douce violence'. Antithèse = contraires dans deux propositions séparées.",
    },
  },
];

export default function FiguresDeStylePage() {
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
          <div className="lecon-badge">✨ Français — 4ème</div>
          <h1 className="lecon-titre">Les figures de style</h1>
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
            Les <strong>figures de style</strong> sont des procédés d'écriture
            qui embellissent et enrichissent le langage. Apprends à les
            identifier et les utiliser.
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
              <div className="lecon-point-titre">🔍 Figures de comparaison</div>
              <div className="lecon-point-texte">
                Comparaison (avec comme/tel). Métaphore (sans outil).
                Personnification (traits humains). Allégorie (abstrait →
                concret).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Ses yeux sont
                des étoiles' (métaphore). 'Comme une étoile' (comparaison).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📢 Figures d'insistance</div>
              <div className="lecon-point-texte">
                Hyperbole (exagération). Litote (dire moins). Anaphore
                (répétition en tête). Oxymore (contraires réunis).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Je meurs de
                faim' (hyperbole). 'Ce n'est pas mal' (litote).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎵 Figures de sonorité</div>
              <div className="lecon-point-texte">
                Allitération (consonnes répétées). Assonance (voyelles
                répétées). Onomatopée (sons imités).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Pour qui sont
                ces serpents qui sifflent' (allitération en s).
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
