"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "revision-brevet";

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
    question: "Combien de points vaut l'épreuve de français au Brevet ?",
    options: ["50 points", "100 points", "75 points", "200 points"],
    answer: "100 points",
    fiche: {
      regle:
        "L'épreuve de français au Brevet des collèges vaut 100 points. Elle se compose de deux parties : compréhension et compétences linguistiques (50 pts) et rédaction (50 pts). La durée est de 3 heures.",
      exemple:
        "✅ Partie 1 (50 pts) : questions sur un texte + grammaire + orthographe. Partie 2 (50 pts) : rédaction (dictée + sujet d'écriture ou réécriture).",
      piege:
        "Ne pas confondre la note sur 100 avec la note sur 20. Le Brevet a une note globale sur 400 pts (4 épreuves de 100 pts chacune).",
      astuce:
        "Français Brevet = 100 pts. 50 pts compréhension/langue + 50 pts rédaction. 3 heures. Bien gérer son temps est essentiel.",
    },
  },
  {
    question: "Qu'est-ce qu'un connecteur logique d'opposition ?",
    options: [
      "Donc, ainsi, par conséquent",
      "Car, parce que, puisque",
      "Cependant, néanmoins, toutefois, or",
      "Premièrement, deuxièmement, enfin",
    ],
    answer: "Cependant, néanmoins, toutefois, or",
    fiche: {
      regle:
        "Les connecteurs logiques organisent les idées. Opposition : cependant, néanmoins, toutefois, or, pourtant, en revanche. Cause : car, parce que, puisque. Consequence : donc, ainsi, par conséquent.",
      exemple:
        "✅ 'Il travaille beaucoup, cependant il échoue.' 'Il est intelligent, or il ne réussit pas.' Opposition = rupture entre deux idées.",
      piege:
        "'Or' est un connecteur d'opposition/de transition, pas de temps. Ne pas confondre avec 'maintenant' ou 'alors'.",
      astuce:
        "Opposition = CEPENDANT, NÉANMOINS, TOUTEFOIS, OR, POURTANT. Ces mots signalent une rupture entre deux idées. Très fréquents au Brevet.",
    },
  },
  {
    question:
      "Dans une analyse de texte, que signifie 'justifier par un relevé précis' ?",
    options: [
      "Donner son opinion personnelle sur le texte",
      "Citer des mots ou phrases du texte entre guillemets pour appuyer sa réponse",
      "Résumer le texte en quelques lignes",
      "Donner le contexte historique de l'oeuvre",
    ],
    answer:
      "Citer des mots ou phrases du texte entre guillemets pour appuyer sa réponse",
    fiche: {
      regle:
        "Justifier par un relevé = citer précisément le texte (entre guillemets) pour prouver son interprétation. Une réponse sans citation n'est pas justifiée. La citation doit être courte et pertinente.",
      exemple:
        "✅ Question : 'Le personnage est-il courageux ?' Réponse justifiée : 'Oui, il est courageux, comme le montre : \"il avança seul face aux flammes\".'",
      piege:
        "Ne jamais répondre sans citer le texte ! Même une réponse juste sans citation peut perdre des points au Brevet.",
      astuce:
        "Relevé = citation entre guillemets + indication de ligne. Structure : Idée + 'comme le montre' + 'citation'. Toujours citer, toujours justifier.",
    },
  },
  {
    question:
      "Quelle est la structure d'une introduction de rédaction au Brevet ?",
    options: [
      "Thèse + arguments + conclusion",
      "Accroche + présentation du sujet + annonce du plan",
      "Résumé du sujet + opinion personnelle",
      "Citation + développement + morale",
    ],
    answer: "Accroche + présentation du sujet + annonce du plan",
    fiche: {
      regle:
        "Une introduction bien structurée comprend : 1) Accroche (phrase qui interpelle, citation, question), 2) Présentation du sujet (reformulation de la problématique), 3) Annonce du plan (les grandes parties du devoir).",
      exemple:
        "✅ Accroche : 'Les réseaux sociaux occupent une place croissante dans nos vies.' Sujet : 'Sont-ils bénéfiques ?' Plan : 'Nous verrons d'abord... puis...'",
      piege:
        "Ne pas commencer par 'Je vais vous parler de...' ou 'Dans ce devoir...' Ces formules sont trop scolaires et doivent être évitées.",
      astuce:
        "Introduction = 3 temps : accrocher + présenter + annoncer. Comme un entonnoir : du général au particulier. Jamais trop longue (5-8 lignes).",
    },
  },
  {
    question: "Qu'est-ce que la modalisation dans un texte ?",
    options: [
      "La façon dont le texte est mis en page",
      "Les moyens linguistiques qui expriment le degré de certitude ou le point de vue de l'auteur",
      "Le type de narration utilisé (première ou troisième personne)",
      "La longueur des phrases dans un texte",
    ],
    answer:
      "Les moyens linguistiques qui expriment le degré de certitude ou le point de vue de l'auteur",
    fiche: {
      regle:
        "La modalisation désigne les marques linguistiques qui expriment l'attitude du locuteur : certitude (il est certain que), doute (il semble que, peut-être), jugement (heureusement, malheureusement), verbes modaux (devoir, pouvoir, falloir).",
      exemple:
        "✅ Certitude : 'Il est évident que...' Doute : 'Il semble que... peut-être...' Jugement : 'Heureusement, il réussit.' Verbe modal : 'Il doit partir.'",
      piege:
        "Modalisation ≠ ponctuation. Les modalisateurs sont des mots ou expressions qui nuancent l'affirmation. La ponctuation peut aussi modaliser (point d'interrogation, points de suspension).",
      astuce:
        "Modalisation = degrés de certitude. Certain (est) vs probable (semble) vs possible (peut). Repère les adverbes, verbes modaux et expressions de jugement.",
    },
  },
  {
    question: "Comment identifier le point de vue d'un texte narratif ?",
    options: [
      "En comptant le nombre de personnages",
      "En observant qui raconte, ce qu'il sait et ce qu'il ressent",
      "En regardant le temps des verbes uniquement",
      "En identifiant le genre littéraire du texte",
    ],
    answer: "En observant qui raconte, ce qu'il sait et ce qu'il ressent",
    fiche: {
      regle:
        "3 points de vue : Interne (narrateur = personnage, voit par ses yeux, dit 'je' ou suit un personnage en 'il'), Externe (narrateur observe de dehors, peu d'infos sur les pensées), Omniscient/zéro (narrateur sait tout sur tous).",
      exemple:
        "✅ Interne : 'Je tremblais...' ou 'Elle pensait que...' Externe : 'Il entra et s'assit.' Omniscient : 'Elle pensait à lui sans savoir qu'il pensait à elle aussi.'",
      piege:
        "Le point de vue interne n'implique pas forcément la première personne. Un récit à la troisième personne peut avoir un point de vue interne.",
      astuce:
        "PDV interne = dans la tête D'UN. PDV omniscient = dans la tête DE TOUS. PDV externe = observe de dehors. Que sait le narrateur ? = la question clé.",
    },
  },
  {
    question: "Qu'est-ce qu'un champ lexical ?",
    options: [
      "Un ensemble de mots de même famille grammaticale",
      "Un ensemble de mots se rapportant au même thème ou à la même notion",
      "Les mots d'une même conjugaison",
      "Les synonymes d'un mot dans un texte",
    ],
    answer:
      "Un ensemble de mots se rapportant au même thème ou à la même notion",
    fiche: {
      regle:
        "Le champ lexical est un ensemble de mots (de natures grammaticales variées) qui se rapportent au même thème dans un texte. Il révèle les thèmes dominants et l'intention de l'auteur.",
      exemple:
        "✅ Champ lexical de la guerre : 'bataille, soldat, sang, canon, défaite, victoire, ennemi.' Ces mots de natures différentes forment un ensemble thématique cohérent.",
      piege:
        "Champ lexical ≠ champ sémantique. Le champ sémantique = tous les sens d'un mot. Le champ lexical = ensemble de mots autour d'un thème dans UN texte précis.",
      astuce:
        "Champ lexical = mots du même THEME. Cherche le thème dominant : nature, mort, amour, guerre... Puis relève tous les mots qui s'y rapportent.",
    },
  },
  {
    question: "Comment réussir la partie réécriture au Brevet ?",
    options: [
      "Réécrire le texte en changeant complètement le sens",
      "Appliquer mécaniquement les transformations demandées en respectant les accords",
      "Résumer le passage en quelques mots",
      "Inventer une suite au texte",
    ],
    answer:
      "Appliquer mécaniquement les transformations demandées en respectant les accords",
    fiche: {
      regle:
        "La réécriture demande de transformer un passage selon une consigne précise (changer de temps, de personne, de genre). Il faut appliquer TOUTES les modifications qui découlent de la transformation et soigner les accords.",
      exemple:
        "✅ Consigne : 'Mettez au passé composé.' Chaque verbe doit être transformé. Consigne : 'Remplacez 'il' par 'ils'.' Le genre et le nombre changent partout.",
      piege:
        "Ne pas oublier les modifications en cascade ! Si on change la personne, les accords des adjectifs et participes passés changent aussi. Tout doit être cohérent.",
      astuce:
        "Réécriture = transformation systématique. Lis d'abord tout le passage. Transforme CHAQUE élément concerné. Relis pour vérifier la cohérence des accords.",
    },
  },
  {
    question: "Qu'est-ce qu'un texte argumentatif efficace pour le Brevet ?",
    options: [
      "Un texte qui exprime uniquement ses émotions",
      "Un texte avec une thèse claire, des arguments organisés, des exemples et une conclusion",
      "Un texte très long avec beaucoup de détails",
      "Un texte qui cite uniquement des auteurs célèbres",
    ],
    answer:
      "Un texte avec une thèse claire, des arguments organisés, des exemples et une conclusion",
    fiche: {
      regle:
        "Un texte argumentatif efficace au Brevet : thèse claire dès l'introduction, arguments organisés en paragraphes (un argument par paragraphe), exemples concrets, connecteurs logiques, conclusion qui reprend la thèse et ouvre.",
      exemple:
        "✅ Structure : Introduction (thèse) + Paragraphe 1 (argument 1 + exemple) + Paragraphe 2 (argument 2 + exemple) + Conclusion (bilan + ouverture).",
      piege:
        "Eviter les arguments sans exemples (trop vagues) et les exemples sans arguments (trop concrets). L'un justifie l'autre. Toujours les deux ensemble.",
      astuce:
        "Plan argumentatif = TACO : Thèse + Argument + Conclusion + Ouverture. Chaque paragraphe = 1 argument + 1 exemple + 1 phrase de liaison.",
    },
  },
  {
    question:
      "Quelle figure de style est présente dans : 'La mer chantait doucement sous les étoiles' ?",
    options: ["Métaphore", "Comparaison", "Personnification", "Hyperbole"],
    answer: "Personnification",
    fiche: {
      regle:
        "La personnification attribue des caractéristiques humaines (actions, sentiments, paroles) à un objet, un animal ou un phénomène naturel. C'est une figure très fréquente au Brevet.",
      exemple:
        "✅ 'La mer chantait' = la mer fait une action humaine (chanter). 'Le vent soupirait.' 'La nuit murmurait.' Toutes ces phrases personnifient des éléments naturels.",
      piege:
        "Personnification ≠ métaphore. La métaphore compare sans outil de comparaison. La personnification attribue spécifiquement des caractéristiques HUMAINES à un non-humain.",
      astuce:
        "Personnification = un non-humain fait quelque chose d'humain. Chanter, pleurer, sourire, parler = actions humaines. Si la mer chante = personnification.",
    },
  },
];

export default function RevisionBrevetPage() {
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
          <div className="lecon-badge">🎓 Français — 3ème</div>
          <h1 className="lecon-titre">Révision Brevet — Français</h1>
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
            Prépare le <strong>Brevet de Français</strong> : méthode d'analyse,
            figures de style, points de vue, champs lexicaux, rédaction
            argumentative et réécriture.
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
              <div className="lecon-point-titre">📋 Structure de l'épreuve</div>
              <div className="lecon-point-texte">
                100 pts au total. Partie 1 (50 pts) : compréhension + grammaire
                + orthographe. Partie 2 (50 pts) : dictée + rédaction ou
                réécriture. Durée : 3 heures.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Conseil :</span> Gère ton temps
                : 1h30 par partie. Relis toujours avant de rendre. Les points de
                grammaire sont faciles à ne pas perdre.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">🔍 Analyse de texte</div>
              <div className="lecon-point-texte">
                Toujours justifier par des citations entre guillemets.
                Identifier : registre, point de vue, champ lexical, figures de
                style. Structure : Idée + 'comme le montre' + citation.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Le texte est
                tragique, comme le montre le champ lexical de la mort : "agonie,
                funèbre, dernier souffle".'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ✍️ Rédaction et réécriture
              </div>
              <div className="lecon-point-texte">
                Rédaction : thèse + arguments + exemples + connecteurs.
                Réécriture : appliquer TOUTES les transformations demandées,
                vérifier les accords en cascade.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Conseil :</span> Plan TACO :
                Thèse + Arguments + Conclusion + Ouverture. Un argument par
                paragraphe. Toujours un exemple concret.
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
        ? "Tu es prêt(e) pour le Brevet !"
        : pourcentage >= 60
          ? "Bien joué, continue !"
          : "Encore un peu de révision !";
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
