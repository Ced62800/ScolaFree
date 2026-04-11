"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "4eme";
const MATIERE = "francais";
const THEME = "discours-indirect";

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
    question: "Transforme au discours indirect : Il dit : 'Je suis fatigué.'",
    options: [
      "Il dit qu'il est fatigué.",
      "Il dit qu'il était fatigué.",
      "Il dit qu'il sera fatigué.",
      "Il dit être fatigué.",
    ],
    answer: "Il dit qu'il est fatigué.",
    fiche: {
      regle:
        "Au discours indirect avec verbe introducteur au PRÉSENT, les temps ne changent pas. 'dit' (présent) → 'je suis' reste 'il est'. La personne change : je → il.",
      exemple:
        "✅ Il dit : 'Je suis content.' → Il dit qu'il est content. Verbe introducteur présent = pas de changement de temps.",
      piege:
        "Les temps changent SEULEMENT si le verbe introducteur est au PASSÉ. Au présent, les temps restent identiques.",
      astuce:
        "Présent → temps inchangés. Passé → concordance des temps. Vérifie d'abord le temps du verbe introducteur !",
    },
  },
  {
    question:
      "Transforme au discours indirect : Elle a dit : 'Je viendrai demain.'",
    options: [
      "Elle a dit qu'elle viendra demain.",
      "Elle a dit qu'elle viendrait le lendemain.",
      "Elle a dit qu'elle est venue le lendemain.",
      "Elle a dit qu'elle vient le lendemain.",
    ],
    answer: "Elle a dit qu'elle viendrait le lendemain.",
    fiche: {
      regle:
        "Verbe introducteur au passé : futur → conditionnel présent. 'Viendrai' (futur) → 'viendrait' (conditionnel). 'Demain' → 'le lendemain' (changement des adverbes de temps).",
      exemple:
        "✅ Elle a dit : 'Je viendrai demain.' → Elle a dit qu'elle viendrait le lendemain. Futur→conditionnel, demain→lendemain.",
      piege:
        "Ne pas oublier de changer AUSSI les expressions de temps : demain→lendemain, hier→la veille, aujourd'hui→ce jour-là.",
      astuce:
        "Futur → conditionnel. Demain → lendemain. Hier → la veille. Aujourd'hui → ce jour-là. Deux changements à faire !",
    },
  },
  {
    question:
      "Quel mot introducteur utilise-t-on pour rapporter une question fermée (oui/non) ?",
    options: ["que", "si", "quand", "comment"],
    answer: "si",
    fiche: {
      regle:
        "Question fermée (réponse oui/non) → discours indirect avec 'si'. Question ouverte (avec mot interrogatif) → on garde le mot interrogatif (quand, comment, pourquoi, où...).",
      exemple:
        "✅ 'Tu viens ?' → Il demande si tu viens. 'Quand pars-tu ?' → Il demande quand tu pars.",
      piege:
        "'Est-ce que' disparaît au discours indirect. 'Est-ce que tu viens ?' → Il demande si tu viens (pas 'si est-ce que').",
      astuce:
        "Oui/non → SI. Mot interrogatif → on le garde. 'Est-ce que' → disparaît. Simple !",
    },
  },
  {
    question:
      "Que devient le présent de l'indicatif au discours indirect au passé ?",
    options: [
      "Il reste au présent",
      "Il devient imparfait",
      "Il devient passé composé",
      "Il devient conditionnel",
    ],
    answer: "Il devient imparfait",
    fiche: {
      regle:
        "Concordance des temps (verbe introducteur au passé) : présent → imparfait, futur → conditionnel présent, passé composé → plus-que-parfait.",
      exemple:
        "✅ Il a dit : 'Je mange.' → Il a dit qu'il mangeait. 'Je mangerai.' → Il a dit qu'il mangerait. 'J'ai mangé.' → Il a dit qu'il avait mangé.",
      piege:
        "Cette règle s'applique SEULEMENT quand le verbe introducteur est au passé. Au présent, pas de changement.",
      astuce:
        "Passé intro → présent devient imparfait. Comme si tout reculait d'un cran dans le passé !",
    },
  },
  {
    question:
      "Transforme en discours direct : Il m'a demandé si je voulais partir.",
    options: [
      "Il m'a dit : 'Veux-tu partir ?'",
      "Il m'a dit : 'Est-ce que je veux partir ?'",
      "Il m'a dit : 'Tu veux partir ?'",
      "Les réponses a et c sont correctes.",
    ],
    answer: "Les réponses a et c sont correctes.",
    fiche: {
      regle:
        "Pour passer du discours indirect au direct, on retrouve les guillemets, les deux-points, et on 'reconstruit' la question originale en rétablissant les temps et personnes.",
      exemple:
        "✅ Il m'a demandé si je voulais partir. → Il m'a dit : 'Veux-tu partir ?' ou 'Tu veux partir ?'. Les deux formes sont acceptées.",
      piege:
        "Au discours direct, la question peut avoir plusieurs formes valides : inversion, est-ce que, ou intonation.",
      astuce:
        "Indirect → direct : remet les guillemets, change les personnes, rétablit les temps, remets les mots interrogatifs.",
    },
  },
  {
    question:
      "Quelle transformation subit 'hier' au discours indirect au passé ?",
    options: [
      "Il reste 'hier'",
      "Il devient 'la veille'",
      "Il devient 'demain'",
      "Il disparaît",
    ],
    answer: "Il devient 'la veille'",
    fiche: {
      regle:
        "Changements d'adverbes de temps au discours indirect au passé : hier → la veille, demain → le lendemain, aujourd'hui → ce jour-là, maintenant → alors, ici → là.",
      exemple:
        "✅ 'J'irai demain.' → Il a dit qu'il irait le lendemain. 'Je suis venu hier.' → Il a dit qu'il était venu la veille.",
      piege:
        "Ces changements ne se font qu'au discours indirect AU PASSÉ. Au présent, 'hier' reste 'hier'.",
      astuce:
        "Hier → veille. Demain → lendemain. Aujourd'hui → ce jour-là. Maintenant → alors. Ici → là. À mémoriser !",
    },
  },
  {
    question: "Quel signe de ponctuation DISPARAÎT au discours indirect ?",
    options: ["Le point", "Les guillemets", "La virgule", "Les parenthèses"],
    answer: "Les guillemets",
    fiche: {
      regle:
        "Au discours direct : guillemets, tirets de dialogue, deux-points. Au discours indirect : ces signes disparaissent. La parole est intégrée dans la phrase avec une conjonction (que, si...).",
      exemple:
        "✅ Direct : Il dit : 'Je suis là.' → Indirect : Il dit qu'il est là. Les guillemets et les deux-points disparaissent.",
      piege:
        "Au discours indirect, il ne reste que la ponctuation normale de la phrase. Plus de guillemets ni de tirets.",
      astuce:
        "Direct = guillemets + deux-points + majuscule. Indirect = rien de tout ça, juste 'que/si' + proposition.",
    },
  },
  {
    question:
      "Transforme au discours indirect : Le professeur ordonne : 'Taisez-vous !'",
    options: [
      "Le professeur ordonne qu'ils se taisent.",
      "Le professeur ordonne de se taire.",
      "Le professeur ordonne qu'ils se taisaient.",
      "Le professeur ordonne qu'ils taisent.",
    ],
    answer: "Le professeur ordonne de se taire.",
    fiche: {
      regle:
        "Pour les ordres et injonctions au discours indirect : on utilise 'de' + infinitif. Pas de 'que' + subjonctif pour les ordres simples. Le professeur ordonne DE + infinitif.",
      exemple:
        "✅ 'Partez !' → Il ordonne de partir. 'Mangez !' → Il dit de manger. 'Viens !' → Elle dit de venir.",
      piege:
        "Pour un ordre : DE + infinitif (pas 'que' + subjonctif). Il ordonne DE se taire (pas 'qu'ils se taisent').",
      astuce:
        "Ordre → discours indirect = DE + infinitif. Question → SI. Affirmation → QUE. Trois structures différentes !",
    },
  },
  {
    question: "Qu'est-ce que le discours indirect libre ?",
    options: [
      "Un discours sans verbe introducteur ni guillemets",
      "Un discours avec guillemets mais sans verbe introducteur",
      "Un discours avec verbe introducteur mais sans guillemets",
      "Un discours entièrement au présent",
    ],
    answer: "Un discours sans verbe introducteur ni guillemets",
    fiche: {
      regle:
        "Le discours indirect libre mélange les caractéristiques du direct (ton, exclamations) et de l'indirect (pas de guillemets, pas de verbe introducteur). Très utilisé dans les romans modernes.",
      exemple:
        "✅ 'Il rentra chez lui. Quelle journée horrible ! Jamais il ne leur pardonnerait.' → Les pensées sont rapportées sans 'il pensait que'.",
      piege:
        "Le discours indirect libre est ambigu : on ne sait pas toujours si c'est le narrateur ou le personnage qui parle.",
      astuce:
        "Libre = sans verbe introducteur + sans guillemets. Mélange du direct (ton) et indirect (pas de marques). Très littéraire !",
    },
  },
  {
    question:
      "Identifie le type de discours : 'Il pensait qu'il devait partir au plus vite.'",
    options: [
      "Discours direct",
      "Discours indirect",
      "Discours indirect libre",
      "Discours narrativisé",
    ],
    answer: "Discours indirect",
    fiche: {
      regle:
        "Discours indirect = verbe introducteur ('pensait') + conjonction ('que') + proposition subordonnée. Pas de guillemets. Les temps sont à la concordance.",
      exemple:
        "✅ Direct : 'Je dois partir.' Indirect : Il pensait qu'il devait partir. Indirect libre : Il devait partir. Urgence !",
      piege:
        "Ne pas confondre les trois types. Indirect = verbe intro + que/si. Libre = ni verbe intro ni guillemets.",
      astuce:
        "Direct = guillemets. Indirect = verbe intro + que. Indirect libre = aucune marque. Mémorise les 3 !",
    },
  },
];

export default function DiscoursIndirectPage() {
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
          <div className="lecon-badge">💬 Français — 4ème</div>
          <h1 className="lecon-titre">Le discours indirect</h1>
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
            Le <strong>discours indirect</strong> permet de rapporter les
            paroles de quelqu'un sans guillemets, avec des changements de temps,
            de personnes et d'adverbes.
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
              <div className="lecon-point-titre">📝 Les mots introducteurs</div>
              <div className="lecon-point-texte">
                Affirmation → que. Question oui/non → si. Ordre → de +
                infinitif. Question ouverte → garde le mot interrogatif.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Je suis là' →
                dit qu'il est là. 'Tu viens ?' → demande si tu viens.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">⏱️ Concordance des temps</div>
              <div className="lecon-point-texte">
                Verbe intro au passé : présent → imparfait, futur →
                conditionnel, passé composé → plus-que-parfait.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Je mange' → il
                a dit qu'il mangeait. 'Je viendrai' → qu'il viendrait.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📅 Changements d'adverbes</div>
              <div className="lecon-point-texte">
                Hier → la veille. Demain → le lendemain. Aujourd'hui → ce
                jour-là. Maintenant → alors. Ici → là.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Je viendrai
                demain' → qu'il viendrait le lendemain.
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
