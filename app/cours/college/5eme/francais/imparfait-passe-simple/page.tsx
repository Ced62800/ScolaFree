"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "imparfait-passe-simple";

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
    question: "Quel est le rôle de l'imparfait dans un récit au passé ?",
    options: [
      "Exprimer les actions principales",
      "Décrire le décor, les habitudes, les états",
      "Indiquer des actions futures",
      "Marquer une action terminée précisément",
    ],
    answer: "Décrire le décor, les habitudes, les états",
    fiche: {
      regle:
        "L'imparfait sert à décrire : le décor, les habitudes passées, les états d'âme, les actions en cours. C'est le temps de l'arrière-plan du récit.",
      exemple:
        "✅ 'Le soleil brillait (décor). Les enfants jouaient souvent ensemble (habitude). Il se sentait seul (état).'",
      piege:
        "L'imparfait ne marque pas une action terminée précisément. Il exprime une durée ou une répétition dans le passé.",
      astuce:
        "Imparfait = fond du tableau. Passé simple = actions qui avancent. IMP décrit, PS raconte.",
    },
  },
  {
    question:
      "Quelle est la terminaison de 'chanter' à la 1ère personne du singulier de l'imparfait ?",
    options: ["je chantai", "je chantais", "je chanterai", "je chante"],
    answer: "je chantais",
    fiche: {
      regle:
        "Terminaisons de l'imparfait : -ais, -ais, -ait, -ions, -iez, -aient. Pour tous les verbes (1er, 2ème, 3ème groupe).",
      exemple:
        "✅ Je chantais, tu chantais, il chantait, nous chantions, vous chantiez, ils chantaient.",
      piege:
        "Ne pas confondre 'je chantai' (passé simple) et 'je chantais' (imparfait). Le passé simple n'a pas de -s à la 1ère personne.",
      astuce:
        "Imparfait = toujours -AIS, -AIS, -AIT, -IONS, -IEZ, -AIENT. Retiens ces 6 terminaisons !",
    },
  },
  {
    question: "Comment se forme l'imparfait ?",
    options: [
      "Radical de l'infinitif + terminaisons",
      "Radical de la 1ère personne du pluriel du présent + terminaisons",
      "Auxiliaire + participe passé",
      "Même forme que le présent",
    ],
    answer: "Radical de la 1ère personne du pluriel du présent + terminaisons",
    fiche: {
      regle:
        "Pour former l'imparfait : prendre la 1ère personne du pluriel du présent (nous), enlever -ons, ajouter les terminaisons : -ais, -ais, -ait, -ions, -iez, -aient.",
      exemple:
        "✅ Finir → nous finissons → finiss- → je finissais. Avoir → nous avons → av- → j'avais. Être → nous sommes → ét- → j'étais (exception).",
      piege:
        "Être est une exception : radical ét- (pas somm-). Nous sommes → mais j'étais (pas je sommais).",
      astuce:
        "Imparfait = nous finissONS → enlève -ons → finiss- + -ais = finissais. Sauf ÊTRE = étais !",
    },
  },
  {
    question: "Conjuguez 'avoir' à la 3ème personne du pluriel de l'imparfait.",
    options: ["ils ont", "ils eurent", "ils avaient", "ils auraient"],
    answer: "ils avaient",
    fiche: {
      regle:
        "Avoir à l'imparfait : j'avais, tu avais, il avait, nous avions, vous aviez, ils avaient.",
      exemple:
        "✅ Ils avaient beaucoup d'argent. / Nous avions faim. / Tu avais raison.",
      piege:
        "'Ils eurent' = passé simple d'avoir. 'Ils auraient' = conditionnel. 'Ils avaient' = imparfait.",
      astuce:
        "AVOIR imparfait : av- + terminaisons. J'avais, tu avais, il avait... Facile !",
    },
  },
  {
    question: "Quel est le rôle du passé simple dans un récit ?",
    options: [
      "Décrire le décor",
      "Exprimer les actions principales qui font avancer l'histoire",
      "Indiquer des habitudes passées",
      "Exprimer une condition",
    ],
    answer: "Exprimer les actions principales qui font avancer l'histoire",
    fiche: {
      regle:
        "Le passé simple est le temps des actions principales dans un récit littéraire au passé. Chaque action au PS fait avancer l'histoire. C'est le temps du premier plan.",
      exemple:
        "✅ 'Il entra dans la forêt (PS), traversa un ruisseau (PS) et aperçut une cabane (PS).' → 3 actions qui avancent.",
      piege:
        "Le passé simple est rare à l'oral. À l'écrit littéraire, il remplace le passé composé pour les récits.",
      astuce:
        "PS = flèche → chaque action avance. IMP = fond statique. Ils se complètent dans le récit.",
    },
  },
  {
    question:
      "Quelle est la terminaison du passé simple pour les verbes du 1er groupe (ex: chanter) à la 3ème personne du singulier ?",
    options: ["-it", "-a", "-ut", "-ait"],
    answer: "-a",
    fiche: {
      regle:
        "Passé simple des verbes en -ER (1er groupe) : -ai, -as, -a, -âmes, -âtes, -èrent.",
      exemple:
        "✅ Je chantai, tu chantas, il chanta, nous chantâmes, vous chantâtes, ils chantèrent.",
      piege:
        "1er groupe : -a (il chanta). 2ème/3ème groupe en -ir : -it (il finit). Verbes en -oir/-re : -ut (il put, il vit).",
      astuce:
        "1er groupe PS : je chantAI, il chantA, ils chantÈRENT. Les terminaisons changent selon le groupe !",
    },
  },
  {
    question:
      "Conjuguez 'être' à la 3ème personne du singulier du passé simple.",
    options: ["il était", "il est", "il fut", "il sera"],
    answer: "il fut",
    fiche: {
      regle:
        "Être au passé simple : je fus, tu fus, il fut, nous fûmes, vous fûtes, ils furent.",
      exemple:
        "✅ 'Il fut un grand roi.' / 'Ils furent vainqueurs.' / 'Ce fut une belle journée.'",
      piege:
        "'Il était' = imparfait. 'Il fut' = passé simple. Deux temps différents pour deux rôles différents.",
      astuce:
        "ÊTRE PS = fus, fus, FUT, fûmes, fûtes, furent. Retiens : 'Il FUT' pour le passé simple d'être.",
    },
  },
  {
    question:
      "Dans 'Il faisait nuit quand le loup surgit', quel est le rôle de chaque temps ?",
    options: [
      "faisait = action principale / surgit = décor",
      "faisait = décor / surgit = action principale",
      "Les deux sont au même niveau",
      "faisait = futur / surgit = présent",
    ],
    answer: "faisait = décor / surgit = action principale",
    fiche: {
      regle:
        "Imparfait = décor/description (faisait nuit). Passé simple = action principale qui fait avancer (surgit). Les deux temps se complètent.",
      exemple:
        "✅ 'Il faisait nuit (IMP = décor) quand le loup surgit (PS = action). La forêt était sombre (IMP) et le héros trembla (PS).'",
      piege:
        "Ne pas inverser les rôles. L'imparfait DÉCRIT, le passé simple RACONTE l'action.",
      astuce:
        "IMP = comme une photo (statique). PS = comme une vidéo (en mouvement). Deux rôles complémentaires.",
    },
  },
  {
    question: "Conjuguez 'finir' à la 2ème personne du pluriel de l'imparfait.",
    options: [
      "vous finîtes",
      "vous finissiez",
      "vous finirez",
      "vous finissez",
    ],
    answer: "vous finissiez",
    fiche: {
      regle:
        "Finir (2ème groupe) à l'imparfait : je finissais, tu finissais, il finissait, nous finissions, vous finissiez, ils finissaient.",
      exemple: "✅ Vous finissiez votre repas quand il arriva.",
      piege:
        "'Vous finîtes' = passé simple. 'Vous finissez' = présent. 'Vous finissiez' = imparfait.",
      astuce:
        "2ème groupe IMP : radical finiss- + terminaisons. Vous finiss-IEZ = vous finissiez.",
    },
  },
  {
    question:
      "Quel temps est utilisé dans les romans et contes classiques pour les actions principales ?",
    options: [
      "Le présent",
      "Le passé composé",
      "Le passé simple",
      "Le futur antérieur",
    ],
    answer: "Le passé simple",
    fiche: {
      regle:
        "Dans les textes littéraires (romans, contes, nouvelles), le passé simple est le temps de narration des actions principales. Le passé composé est plutôt utilisé à l'oral et dans les textes modernes.",
      exemple:
        "✅ 'Il était une fois un roi qui régnait sur... Un jour, un dragon apparut (PS) et ravagea (PS) le royaume.'",
      piege:
        "Dans la vie courante, on utilise le passé composé. Dans les textes littéraires et contes = passé simple.",
      astuce:
        "Contes et romans = passé simple. Oral et écrits modernes = passé composé. Deux registres différents !",
    },
  },
];

export default function ImparfaitPasseSimplePage() {
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
          <div className="lecon-badge">⏳ Français — 5ème</div>
          <h1 className="lecon-titre">Imparfait et passé simple</h1>
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
            Les deux grands temps du récit au passé : l'
            <strong>imparfait</strong> pour le décor et les habitudes, le{" "}
            <strong>passé simple</strong> pour les actions principales.
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
                🖼️ L'imparfait — le fond du tableau
              </div>
              <div className="lecon-point-texte">
                Décrit le décor, les habitudes, les états. Formation : radical
                (nous du présent) + -ais, -ais, -ait, -ions, -iez, -aient.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il faisait
                froid. Les loups hurlaient souvent le soir.'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ➡️ Le passé simple — les actions
              </div>
              <div className="lecon-point-texte">
                Actions principales qui font avancer le récit. 1er groupe : -ai,
                -as, -a, -âmes, -âtes, -èrent. Être : fus, fut, furent.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Le loup surgit
                et attaqua le village.'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🎯 Utilisation combinée</div>
              <div className="lecon-point-texte">
                Dans un récit, imparfait et passé simple se combinent : IMP =
                décor / PS = actions. Ils jouent des rôles complémentaires.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il faisait
                nuit (IMP) quand le loup surgit (PS).'
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
