"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "l-argumentation";

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
    question: "Qu'est-ce que la thèse dans un texte argumentatif ?",
    options: [
      "Un exemple concret qui illustre une idée",
      "La position défendue par l'auteur sur un sujet",
      "La conclusion du texte",
      "Un argument contre l'opinion de l'auteur",
    ],
    answer: "La position défendue par l'auteur sur un sujet",
    fiche: {
      regle:
        "La thèse est l'opinion, la position ou le point de vue que l'auteur défend dans son texte argumentatif. Elle répond à la question : 'Qu'est-ce que l'auteur veut nous convaincre ?'",
      exemple:
        "✅ Thèse : 'La peine de mort est injuste.' Arguments : 'Elle est irréversible.' 'Elle ne dissuade pas les criminels.' Exemples : statistiques, cas réels.",
      piege:
        "Thèse ≠ sujet. Le sujet est la question posée ('La peine de mort est-elle juste ?'). La thèse est la réponse défendue ('Non, elle est injuste').",
      astuce:
        "Thèse = opinion + défense. Repère : 'Je pense que...', 'Il faut...', 'Nous devons...'. La thèse peut être explicite ou implicite.",
    },
  },
  {
    question: "Qu'est-ce qu'un argument par l'exemple ?",
    options: [
      "Un argument basé sur une loi scientifique",
      "Un argument qui s'appuie sur un cas concret pour illustrer une idée générale",
      "Un argument qui cite l'opinion d'un expert",
      "Un argument qui repose sur la logique pure",
    ],
    answer:
      "Un argument qui s'appuie sur un cas concret pour illustrer une idée générale",
    fiche: {
      regle:
        "L'argument par l'exemple (ou illustration) consiste à appuyer une idée générale sur un cas concret, un fait réel, une anecdote ou une statistique. Il rend l'argument plus vivant et crédible.",
      exemple:
        "✅ Thèse : 'Le sport est bénéfique pour la santé.' Argument par exemple : 'Des études montrent que 30 minutes de marche par jour réduit de 35% le risque cardiaque.'",
      piege:
        "Exemple ≠ preuve suffisante. Un seul exemple ne prouve pas une thèse. Il faut plusieurs arguments de natures différentes pour convaincre.",
      astuce:
        "Argument par exemple = du général au particulier. Idée générale + cas concret qui l'illustre. Les statistiques et faits réels renforcent l'argument.",
    },
  },
  {
    question: "Qu'est-ce que la concession dans un texte argumentatif ?",
    options: [
      "Abandonner sa thèse face aux arguments adverses",
      "Reconnaitre une part de vérité dans la thèse adverse avant de la réfuter",
      "Répéter sa thèse de façon insistante",
      "Citer un exemple pour illustrer son argument",
    ],
    answer:
      "Reconnaitre une part de vérité dans la thèse adverse avant de la réfuter",
    fiche: {
      regle:
        "La concession consiste à admettre qu'une partie de la thèse adverse est valide, puis à la nuancer ou réfuter. Elle renforce la crédibilité de l'auteur et montre qu'il a considéré les deux côtés.",
      exemple:
        "✅ 'Certes, les réseaux sociaux permettent de garder contact avec ses proches (concession), mais ils favorisent aussi l'isolement réel (réfutation).'",
      piege:
        "Concession ≠ capitulation. L'auteur ne renonce pas à sa thèse ! Il reconnaît une nuance pour mieux la dépasser et renforcer son argument principal.",
      astuce:
        "Concession = certes... mais / il est vrai que... cependant / on peut admettre... toutefois. La structure : reconnaitre + dépasser.",
    },
  },
  {
    question: "Quel connecteur logique exprime la cause ?",
    options: ["Cependant", "Par conséquent", "En effet", "Néanmoins"],
    answer: "En effet",
    fiche: {
      regle:
        "Les connecteurs logiques organisent l'argumentation : Cause : car, parce que, en effet, puisque. Consequence : donc, ainsi, par conséquent, c'est pourquoi. Opposition : mais, cependant, néanmoins, toutefois.",
      exemple:
        "✅ Cause : 'Il réussit car il travaille.' Conséquence : 'Il travaille, donc il réussit.' Opposition : 'Il travaille, cependant il échoue.'",
      piege:
        "'En effet' introduit une explication (cause), pas une conséquence. Ne pas confondre avec 'en fait' (rectification) ou 'en outre' (addition).",
      astuce:
        "Cause = pourquoi ? (car, parce que, en effet). Conséquence = quoi alors ? (donc, ainsi). Opposition = mais (cependant, néanmoins).",
    },
  },
  {
    question: "Qu'est-ce que le plan dialectique ?",
    options: [
      "Un plan en deux parties : avantages / inconvénients",
      "Un plan en trois parties : thèse / antithèse / synthèse",
      "Un plan chronologique du plus ancien au plus récent",
      "Un plan qui présente uniquement les arguments pour",
    ],
    answer: "Un plan en trois parties : thèse / antithèse / synthèse",
    fiche: {
      regle:
        "Le plan dialectique (ou plan thèse-antithèse-synthèse) est une structure argumentative en 3 parties : 1) Thèse (arguments pour), 2) Antithèse (arguments contre), 3) Synthèse (dépassement nuancé).",
      exemple:
        "✅ Sujet : 'Les écrans sont-ils néfastes ?' 1) Oui, ils isolent. 2) Non, ils connectent. 3) Tout dépend de l'usage qu'on en fait.",
      piege:
        "La synthèse n'est pas une simple conclusion qui résume. Elle doit apporter un dépassement, une nuance, une nouvelle perspective.",
      astuce:
        "Dialectique = thèse + antithèse + synthèse. Pour / Contre / Nuance. Le 'oui mais' structuré en 3 parties.",
    },
  },
  {
    question: "Qu'est-ce que l'argument d'autorité ?",
    options: [
      "Un argument imposé par la force",
      "Un argument qui s'appuie sur l'opinion d'un expert ou d'une source reconnue",
      "Un argument basé sur des sentiments",
      "Un argument qui cite des statistiques",
    ],
    answer:
      "Un argument qui s'appuie sur l'opinion d'un expert ou d'une source reconnue",
    fiche: {
      regle:
        "L'argument d'autorité consiste à citer l'opinion d'une personne reconnue (expert, scientifique, philosophe) ou d'une institution (OMS, ONU) pour appuyer sa thèse. Il emprunte la crédibilité d'autrui.",
      exemple:
        "✅ 'Selon l'OMS, 150 minutes d'activité physique par semaine réduisent la mortalité.' 'Comme le disait Einstein : l'imagination est plus importante que le savoir.'",
      piege:
        "Argument d'autorité ≠ preuve absolue. Une autorité peut se tromper ou être partiale. Il ne faut pas l'utiliser seul sans autres arguments.",
      astuce:
        "Autorité = emprunter la crédibilité d'un expert. Selon + [nom expert/institution] + [affirmation]. Renforce mais ne prouve pas à lui seul.",
    },
  },
  {
    question: "Qu'est-ce que la réfutation ?",
    options: [
      "Reformuler sa thèse en conclusion",
      "Démontrer qu'un argument adverse est faux ou insuffisant",
      "Citer un exemple qui soutient sa thèse",
      "Admettre que l'adversaire a raison",
    ],
    answer: "Démontrer qu'un argument adverse est faux ou insuffisant",
    fiche: {
      regle:
        "La réfutation consiste à attaquer et démolir un argument de la thèse adverse en montrant qu'il est faux, incomplet, mal raisonné ou fondé sur de fausses prémisses.",
      exemple:
        "✅ Thèse adverse : 'Les jeux vidéo rendent violent.' Réfutation : 'Des études scientifiques (Anderson, 2020) montrent qu'aucun lien causal n'a été démontré.'",
      piege:
        "Réfutation ≠ concession. La concession admet une part de vérité. La réfutation nie ou invalide l'argument. Les deux peuvent s'enchaîner.",
      astuce:
        "Réfuter = démolir l'argument adverse. Montrer qu'il est faux, exagéré ou non prouvé. Souvent après une concession : 'certes... mais en réalité...'",
    },
  },
  {
    question: "Qu'est-ce que le registre polémique ?",
    options: [
      "Un texte qui raconte une histoire de guerre",
      "Un discours qui attaque vivement une position adverse avec véhémence",
      "Un texte qui présente les deux côtés de façon équilibrée",
      "Un argument basé sur des faits scientifiques",
    ],
    answer:
      "Un discours qui attaque vivement une position adverse avec véhémence",
    fiche: {
      regle:
        "Le registre polémique est un ton argumentatif agressif, passionné et combatif. L'auteur attaque l'adversaire avec véhémence, ironie ou indignation. Il cherche à convaincre par l'émotion autant que par la raison.",
      exemple:
        "✅ Voltaire contre l'Eglise. Zola dans 'J'accuse' (affaire Dreyfus). Les pamphlets politiques. Le registre polémique use de l'ironie, de l'hyperbole et de la question rhétorique.",
      piege:
        "Polémique ≠ simple désaccord. C'est un affrontement violent et passionné. Il implique une dénonciation forte, souvent avec des figures de style expressives.",
      astuce:
        "Polémique = combat verbal. Ironie + indignation + attaque directe. Zola 'J'accuse' = exemple parfait de texte polémique au programme.",
    },
  },
  {
    question: "Quelle est la structure d'un paragraphe argumentatif ?",
    options: [
      "Introduction / développement / conclusion",
      "Idée directrice / argument / exemple / conclusion partielle",
      "Thèse / antithèse / synthèse",
      "Sujet / verbe / complément",
    ],
    answer: "Idée directrice / argument / exemple / conclusion partielle",
    fiche: {
      regle:
        "Un paragraphe argumentatif bien construit suit la structure IAEC : Idée directrice (la thèse du paragraphe), Argument (la raison), Exemple (illustration concrète), Conclusion partielle (lien avec la thèse générale).",
      exemple:
        "✅ ID : 'Le sport améliore la santé mentale.' Argument : 'Il libère des endorphines.' Exemple : 'Une étude de Harvard (2018) montre une réduction de 26% de la dépression.' Conclusion : 'Ainsi, le sport est un outil thérapeutique.'",
      piege:
        "Un paragraphe = UNE idée directrice. Si tu changes d'idée, tu changes de paragraphe. La cohérence interne est essentielle.",
      astuce:
        "IAEC = Idée + Argument + Exemple + Conclusion. Un paragraphe bien construit tient en 4 à 6 lignes avec ces 4 éléments.",
    },
  },
  {
    question: "Qu'est-ce que l'argument ad hominem ?",
    options: [
      "Un argument qui s'attaque à la personne plutôt qu'à ses idées",
      "Un argument basé sur l'expérience humaine",
      "Un argument qui cite un grand homme",
      "Un argument qui fait appel à l'émotion du lecteur",
    ],
    answer: "Un argument qui s'attaque à la personne plutôt qu'à ses idées",
    fiche: {
      regle:
        "L'argument ad hominem est un sophisme (faux raisonnement) qui consiste à attaquer la personne qui soutient une thèse plutôt que la thèse elle-même. C'est une technique rhétorique incorrecte mais fréquente.",
      exemple:
        "✅ 'Tu ne peux pas défendre l'écologie, tu prends l'avion !' (attaque la personne, pas l'argument écologique). 'Cet économiste est de gauche, donc son analyse est fausse.'",
      piege:
        "Ad hominem ≠ argument valide. C'est un sophisme : même si la personne est incohérente, son argument peut être juste. L'attaque personnelle ne réfute pas l'idée.",
      astuce:
        "Ad hominem = attaquer l'homme, pas l'idée. C'est un sophisme à identifier et dénoncer. 'Tu n'es pas qualifié pour...' = ad hominem.",
    },
  },
];

export default function LArgumentationPage() {
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
          <div className="lecon-badge">💡 Français — 3ème</div>
          <h1 className="lecon-titre">L'argumentation</h1>
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
            En 3ème, tu maitrises l'<strong>argumentation</strong> : thèse,
            arguments, exemples, concession, réfutation, connecteurs logiques et
            plans dialectiques pour convaincre et persuader.
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
                🎯 Thèse, arguments et exemples
              </div>
              <div className="lecon-point-texte">
                La thèse = position défendue. Arguments = raisons. Exemples =
                illustrations concrètes. Structure IAEC : Idée + Argument +
                Exemple + Conclusion partielle.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Thèse : 'Le
                sport est bénéfique.' Argument : 'Il libère des endorphines.'
                Exemple : 'Etude Harvard 2018.'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔄 Concession et réfutation
              </div>
              <div className="lecon-point-texte">
                Concession = admettre une part de vérité adverse (certes...
                mais). Réfutation = démolir l'argument adverse. Plan dialectique
                : thèse / antithèse / synthèse.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Certes les
                réseaux sociaux connectent (concession), mais ils isolent dans
                la vie réelle (réfutation).'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔗 Connecteurs et registre polémique
              </div>
              <div className="lecon-point-texte">
                Cause : car, en effet. Conséquence : donc, ainsi. Opposition :
                cependant, néanmoins. Le registre polémique (Zola, Voltaire)
                attaque avec ironie et indignation.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> 'Il travaille,
                donc il réussit.' 'Certes il travaille, cependant il échoue.'
                Zola 'J'accuse' = polémique.
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
