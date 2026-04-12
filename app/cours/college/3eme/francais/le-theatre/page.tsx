"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "le-theatre";

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
    question: "Qu'est-ce qu'une didascalie ?",
    options: [
      "Une réplique longue d'un personnage",
      "Une indication scénique écrite par l'auteur pour la mise en scène",
      "Le titre d'une scène de théâtre",
      "Un monologue intérieur",
    ],
    answer: "Une indication scénique écrite par l'auteur pour la mise en scène",
    fiche: {
      regle:
        "Les didascalies sont les indications de mise en scène écrites par le dramaturge : gestes, déplacements, tons, décors, costumes, éclairages. Elles ne sont pas dites par les acteurs mais lues par le metteur en scène.",
      exemple:
        "✅ '(Il entre en courant, haletant, les vêtements déchirés)' ou '(A part, avec ironie)' ou '(Le rideau tombe)' sont des didascalies.",
      piege:
        "Didascalie ≠ réplique. La réplique est dite par un acteur. La didascalie est une instruction technique qui guide la représentation.",
      astuce:
        "Didascalie = instruction de mise en scène. Entre parenthèses ou en italique dans le texte. L'auteur parle au metteur en scène, pas au public.",
    },
  },
  {
    question: "Qu'est-ce qu'un monologue au théâtre ?",
    options: [
      "Un dialogue entre deux personnages",
      "Une scène où un seul personnage parle, seul ou ignoré des autres",
      "Une tirade très courte",
      "Une conversation rapide entre plusieurs acteurs",
    ],
    answer: "Une scène où un seul personnage parle, seul ou ignoré des autres",
    fiche: {
      regle:
        "Le monologue est une longue prise de parole d'un seul personnage, seul en scène ou ignoré des autres. Il permet d'exprimer les pensées intérieures, les doutes, les décisions du personnage.",
      exemple:
        "✅ Le monologue de Hamlet ('Etre ou ne pas être'). Le monologue d'Harpagon cherchant sa cassette (Molière). Ils révèlent l'intériorité du personnage.",
      piege:
        "Monologue ≠ tirade. La tirade est une longue réplique dans un dialogue. Le monologue implique l'absence ou l'ignorance des autres personnages.",
      astuce:
        "Monologue = MONO (seul) + logue (parole). Un seul qui parle, seul. Révèle les pensées cachées. Hamlet, Harpagon = exemples célèbres.",
    },
  },
  {
    question: "Qu'est-ce que la tragédie classique ?",
    options: [
      "Une pièce comique avec une fin heureuse",
      "Une pièce sérieuse avec des personnages nobles qui finit mal",
      "Une pièce moderne qui critique la société",
      "Une pièce sans décor ni costume",
    ],
    answer: "Une pièce sérieuse avec des personnages nobles qui finit mal",
    fiche: {
      regle:
        "La tragédie classique (XVIIe siècle) met en scène des personnages nobles (rois, héros) confrontés à un destin fatal. Elle respecte la règle des trois unités (lieu, temps, action) et finit par la mort ou la catastrophe.",
      exemple:
        "✅ Racine : 'Phèdre', 'Andromaque', 'Bérénice'. Corneille : 'Le Cid'. Personnages nobles + conflit intérieur + fin tragique = tragédie classique.",
      piege:
        "Tragédie ≠ drame. La tragédie classique suit des règles strictes (trois unités, bienséance). Le drame (XIXe) mélange tragique et comique.",
      astuce:
        "Tragédie = personnages nobles + destin fatal + fin malheureuse. Règle des 3 unités : 1 lieu, 1 journée, 1 action. Racine = maitre de la tragédie.",
    },
  },
  {
    question: "Qu'est-ce que la règle des trois unités ?",
    options: [
      "Trois actes, trois scènes, trois personnages",
      "Unité de lieu, unité de temps et unité d'action",
      "Trois genres : tragédie, comédie, drame",
      "Trois niveaux de langage : soutenu, courant, familier",
    ],
    answer: "Unité de lieu, unité de temps et unité d'action",
    fiche: {
      regle:
        "La règle des trois unités (théâtre classique français, XVIIe) impose : unité de lieu (un seul endroit), unité de temps (24 heures maximum), unité d'action (une seule intrigue principale). Elle vise la vraisemblance.",
      exemple:
        "✅ Racine respecte strictement les trois unités. Les romantiques (Hugo) les ont brisées volontairement. 'Hernani' de Hugo (1830) a provoqué la 'Bataille d'Hernani' en refusant ces règles.",
      piege:
        "Unité d'action ≠ pas d'intrigues secondaires. Il peut y en avoir, mais elles doivent être liées à l'intrigue principale et ne pas la noyer.",
      astuce:
        "3 unités = 1 lieu + 1 jour + 1 action. Classique = respecte. Romantique = brise volontairement. Hugo contre Racine = deux visions du théâtre.",
    },
  },
  {
    question: "Qu'est-ce qu'un aparté au théâtre ?",
    options: [
      "Une scène jouée à part, sur un autre plateau",
      "Une réplique dite par un personnage que les autres n'entendent pas mais que le public entend",
      "Une didascalie indiquant une sortie de scène",
      "Un dialogue entre deux personnages secondaires",
    ],
    answer:
      "Une réplique dite par un personnage que les autres n'entendent pas mais que le public entend",
    fiche: {
      regle:
        "L'aparté est une convention théâtrale : un personnage dit quelque chose que les autres personnages sont censés ne pas entendre, mais que le public entend. Il crée souvent un effet comique ou révèle les vraies pensées.",
      exemple:
        "✅ Dans une comédie de Molière, un personnage dit en aparté : '(A part) Quel idiot !' pendant qu'il sourit à son interlocuteur. Le public rit de ce décalage.",
      piege:
        "Aparté ≠ monologue. Dans l'aparté, d'autres personnages sont présents mais ne 'entendent' pas. Dans le monologue, le personnage est seul.",
      astuce:
        "Aparté = secret partagé avec le public. Convention : les autres ne l'entendent pas. Crée complicité avec le public et révèle les vraies intentions.",
    },
  },
  {
    question: "Qu'est-ce que le drame romantique ?",
    options: [
      "Une pièce d'amour avec une fin heureuse",
      "Un genre du XIXe qui mélange tragique et comique et brise les règles classiques",
      "Une tragédie grecque adaptée en français",
      "Une comedie de moeurs du XVIIe siecle",
    ],
    answer:
      "Un genre du XIXe qui mélange tragique et comique et brise les règles classiques",
    fiche: {
      regle:
        "Le drame romantique (XIXe siècle) rejette les règles classiques. Il mélange tragique et comique, noble et populaire, passé et présent. Hugo théorise ce genre dans la préface de 'Cromwell' (1827).",
      exemple:
        "✅ Hugo : 'Hernani', 'Ruy Blas'. Musset : 'Lorenzaccio'. Ces pièces mélangent genres, niveaux de langue et brisent les trois unités. 'Sublime et grotesque' = théorie de Hugo.",
      piege:
        "Drame romantique ≠ comédie romantique. 'Romantique' ne signifie pas 'histoire d'amour' ! C'est un mouvement littéraire du XIXe siècle avec des valeurs précises.",
      astuce:
        "Drame romantique = mélange des genres + liberté de forme + héros en rébellion. Hugo + Musset = figures majeures. Contre les règles de Racine.",
    },
  },
  {
    question: "Qu'est-ce que la catharsis au théâtre ?",
    options: [
      "La transformation d'un décor en cours de représentation",
      "La purification des passions que ressent le spectateur en regardant la tragédie",
      "Le moment où le héros prend conscience de son destin",
      "La distribution des rôles entre les acteurs",
    ],
    answer:
      "La purification des passions que ressent le spectateur en regardant la tragédie",
    fiche: {
      regle:
        "La catharsis (Aristote) est l'effet purificateur que produit la tragédie sur le spectateur. En ressentant pitié et terreur devant le malheur du héros, le spectateur 'purge' ses propres passions et en ressort apaisé.",
      exemple:
        "✅ En regardant Phèdre mourir de honte et d'amour interdit, le spectateur ressent pitié et terreur, puis en sort soulagé de ses propres angoisses. C'est la catharsis.",
      piege:
        "Catharsis ≠ simple émotion. C'est un processus de purification et d'apaisement. Le spectateur ne doit pas rester dans la détresse, mais en sortir libéré.",
      astuce:
        "Catharsis = purification par les émotions. Pitié + terreur = catharsis. Concept d'Aristote dans la 'Poétique'. La tragédie sert à libérer les passions.",
    },
  },
  {
    question: "Qu'est-ce qu'une stichomythie ?",
    options: [
      "Un long monologue d'un seul personnage",
      "Un échange de répliques très courtes entre deux personnages",
      "Une scène sans paroles avec uniquement des gestes",
      "La dernière réplique d'une pièce de théâtre",
    ],
    answer: "Un échange de répliques très courtes entre deux personnages",
    fiche: {
      regle:
        "La stichomythie est un procédé dramatique consistant en un échange rapide de répliques très courtes (souvent un vers ou une phrase chacun) entre deux personnages. Elle crée tension, affrontement ou intensité émotionnelle.",
      exemple:
        "✅ Dans une dispute théâtrale : 'Tu mens !' / 'Non, c'est toi !' / 'Je te hais !' / 'Et moi je t'aime !' Chaque réplique répond immédiatement à la précédente.",
      piege:
        "Stichomythie ≠ dialogue ordinaire. Dans un dialogue normal, les répliques peuvent être longues. La stichomythie impose des répliques très courtes et rapides.",
      astuce:
        "Stichomythie = duel verbal en répliques courtes. Crée tension et rythme haletant. Souvent dans les scènes de dispute ou de confrontation.",
    },
  },
  {
    question: "Quel est le rôle du choeur dans la tragédie grecque ?",
    options: [
      "Jouer les personnages principaux",
      "Commenter l'action, exprimer les réactions collectives et donner une dimension morale",
      "Fournir les costumes et décors",
      "Souffler le texte aux acteurs qui oublient leurs répliques",
    ],
    answer:
      "Commenter l'action, exprimer les réactions collectives et donner une dimension morale",
    fiche: {
      regle:
        "Dans la tragédie grecque antique, le choeur est un groupe de personnages (citoyens, vieillards) qui chante, danse et commente l'action. Il exprime la réaction de la communauté, donne des avertissements et une dimension morale.",
      exemple:
        "✅ Dans 'Oedipe Roi' (Sophocle), le choeur commente les décisions d'Oedipe et exprime la détresse des Thébains. Il est à la fois témoin, commentateur et voix collective.",
      piege:
        "Choeur ≠ personnage individuel. Il représente la collectivité, pas un individu. Il n'agit pas dans l'intrigue mais la commente de l'extérieur.",
      astuce:
        "Choeur grec = voix collective + commentaire moral + chant et danse. Sophocle, Eschyle, Euripide = les trois grands tragiques grecs qui utilisent le choeur.",
    },
  },
  {
    question: "Qu'est-ce que le théâtre de l'absurde ?",
    options: [
      "Un théâtre comique basé sur des situations ridicules",
      "Un courant du XXe siècle qui montre l'absurdité de l'existence humaine par un langage et des situations incohérentes",
      "Un théâtre sans acteurs ni décors",
      "Un théâtre qui adapte des romans absurdes",
    ],
    answer:
      "Un courant du XXe siècle qui montre l'absurdité de l'existence humaine par un langage et des situations incohérentes",
    fiche: {
      regle:
        "Le théâtre de l'absurde (années 1950-1960) remet en question le sens de l'existence par des pièces aux situations illogiques, aux dialogues incohérents et aux personnages sans but. Il refuse les conventions théâtrales traditionnelles.",
      exemple:
        "✅ Samuel Beckett : 'En attendant Godot' (deux personnages attendent quelqu'un qui ne vient jamais). Ionesco : 'La Cantatrice chauve' (dialogue absurde). Camus a théorisé l'absurde en philosophie.",
      piege:
        "Absurde ≠ simple nonsense. L'absurde a un sens philosophique profond : il exprime l'impossibilité de trouver un sens à l'existence humaine.",
      astuce:
        "Absurde = sans sens + existence vide + langage incohérent. Beckett + Ionesco = figures majeures. 'En attendant Godot' = oeuvre emblématique.",
    },
  },
];

export default function LeTheatrePage() {
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
          <div className="lecon-badge">🎭 Français — 3ème</div>
          <h1 className="lecon-titre">Le théâtre</h1>
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
            En 3ème, tu maitrises le <strong>théâtre</strong> : genres
            (tragédie, comédie, drame romantique, absurde), techniques
            (didascalie, aparté, monologue, stichomythie) et grands auteurs.
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
              <div className="lecon-point-titre">🏛️ Les genres théâtraux</div>
              <div className="lecon-point-texte">
                Tragédie (Racine) : personnages nobles + fin fatale + 3 unités.
                Comédie (Molière) : critique sociale + fin heureuse. Drame
                romantique (Hugo) : mélange des genres. Absurde (Beckett) : sens
                de l'existence.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Racine 'Phèdre'
                = tragédie. Molière 'L'Avare' = comédie. Hugo 'Hernani' = drame.
                Beckett 'En attendant Godot' = absurde.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🎬 Les techniques théâtrales
              </div>
              <div className="lecon-point-texte">
                Didascalie = indication de mise en scène. Aparté = dit au
                public, pas aux autres. Monologue = seul en scène. Stichomythie
                = échanges courts et rapides. Catharsis = purification par les
                émotions.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Aparté : '(A
                part) Quel idiot !' Monologue : Hamlet 'Etre ou ne pas être.'
                Stichomythie : duel verbal en répliques courtes.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🏺 Du théâtre grec au théâtre moderne
              </div>
              <div className="lecon-point-texte">
                Grèce antique : choeur + catharsis + Sophocle/Eschyle. XVIIe :
                règle des 3 unités + Racine/Molière. XIXe : drame romantique +
                Hugo. XXe : absurde + Beckett/Ionesco.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Choeur grec
                commente l'action. 3 unités = 1 lieu + 1 jour + 1 action. Hugo
                brise ces règles en 1830 avec 'Hernani'.
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
