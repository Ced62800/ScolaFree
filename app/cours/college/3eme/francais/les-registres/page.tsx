"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "les-registres";

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
    question: "Qu'est-ce qu'un registre littéraire ?",
    options: [
      "Le niveau de langue utilisé dans un texte",
      "L'effet dominant qu'un texte cherche à produire sur le lecteur",
      "Le genre littéraire d'un texte (roman, poème, théâtre)",
      "La période historique dans laquelle un texte est écrit",
    ],
    answer: "L'effet dominant qu'un texte cherche à produire sur le lecteur",
    fiche: {
      regle:
        "Le registre littéraire désigne l'effet dominant qu'un texte cherche à produire sur le lecteur : émouvoir, faire rire, faire peur, convaincre, indigner... Il est différent du genre (forme) et du niveau de langue.",
      exemple:
        "✅ Un roman peut être tragique (registre) tout en étant réaliste (genre). Un poème peut être lyrique (registre) ou satirique (registre).",
      piege:
        "Registre ≠ genre. Le genre = la forme (roman, poème, théâtre). Le registre = l'effet visé sur le lecteur (tragique, comique, lyrique...).",
      astuce:
        "Registre = effet voulu sur le lecteur. Demande-toi : 'Comment ce texte veut-il me faire réagir ?' La réponse = le registre.",
    },
  },
  {
    question: "Quels sont les indices du registre lyrique ?",
    options: [
      "Ironie, exagération, moquerie",
      "Expression des sentiments personnels, première personne, exclamations, images poétiques",
      "Vocabulaire scientifique, objectivité, démonstration",
      "Suspense, tension, rebondissements",
    ],
    answer:
      "Expression des sentiments personnels, première personne, exclamations, images poétiques",
    fiche: {
      regle:
        "Le registre lyrique exprime les sentiments et émotions intimes du locuteur (amour, mélancolie, nostalgie, joie). Indices : première personne, exclamations, apostrophes, images poétiques, musicalité.",
      exemple:
        "✅ Lamartine 'Le Lac' : 'O temps, suspends ton vol !' Expression de la mélancolie, du temps qui passe, de l'amour perdu. Registre lyrique typique.",
      piege:
        "Lyrique ≠ poétique. Un texte peut être poétique (en vers) sans être lyrique (expressif des sentiments). La lyrique concerne l'expression des émotions.",
      astuce:
        "Lyrique = lyre (instrument de musique). Expression musicale et personnelle des émotions. Je + sentiments + images = lyrique.",
    },
  },
  {
    question: "Qu'est-ce que le registre épique ?",
    options: [
      "Un registre qui fait pleurer le lecteur",
      "Un registre qui amplifie des actions héroïques pour susciter l'admiration",
      "Un registre qui critique la société avec humour",
      "Un registre qui exprime la peur et l'angoisse",
    ],
    answer:
      "Un registre qui amplifie des actions héroïques pour susciter l'admiration",
    fiche: {
      regle:
        "Le registre épique magnifie des actions héroïques, des batailles ou des aventures extraordinaires. Il utilise l'hyperbole, les énumérations, les comparaisons grandioses pour susciter admiration et enthousiasme.",
      exemple:
        "✅ Hugo 'Les Misérables' (bataille de Waterloo). 'L'Iliade' d'Homère. Indices : hyperboles, héros surhumains, combats grandioses, vocabulaire de la gloire.",
      piege:
        "Epique ≠ épopée. L'épopée est un genre (long poème narratif). Le registre épique peut apparaitre dans n'importe quel genre (roman, discours, poème).",
      astuce:
        "Epique = héros + exploits + grandeur. Hyperbole + admiration = épique. Hugo décrit Waterloo de façon épique dans 'Les Misérables'.",
    },
  },
  {
    question: "Quels sont les indices du registre tragique ?",
    options: [
      "Ironie, légèreté, jeux de mots",
      "Destin fatal, fatalité, souffrance inévitable, ton grave",
      "Peur soudaine, suspense, mystère",
      "Exagération comique, situations absurdes",
    ],
    answer: "Destin fatal, fatalité, souffrance inévitable, ton grave",
    fiche: {
      regle:
        "Le registre tragique met en scène un personnage confronté à un destin fatal et inévitable. Indices : champ lexical de la mort et de la souffrance, fatalité, ton grave et solennel, sentiment d'impuissance.",
      exemple:
        "✅ Racine 'Phèdre' : amour impossible + honte + mort. Antigone (Sophocle) : devoir moral contre loi humaine + mort inévitable. Le héros tragique ne peut échapper à son destin.",
      piege:
        "Tragique ≠ triste. Un texte triste n'est pas forcément tragique. Le tragique implique une fatalité, un destin inévitable que le personnage ne peut fuir.",
      astuce:
        "Tragique = destin inévitable + souffrance + mort. Le héros sait souvent ce qui l'attend mais ne peut l'éviter. Fatalité = mot-clé du tragique.",
    },
  },
  {
    question: "Qu'est-ce que le registre fantastique ?",
    options: [
      "Un registre qui exagère la réalité de façon héroïque",
      "Un registre qui crée une hésitation entre explication naturelle et surnaturelle",
      "Un registre basé uniquement sur la peur",
      "Un registre propre aux contes de fées",
    ],
    answer:
      "Un registre qui crée une hésitation entre explication naturelle et surnaturelle",
    fiche: {
      regle:
        "Le registre fantastique (théorisé par Todorov) crée une hésitation entre une explication rationnelle et une explication surnaturelle d'un événement étrange. Le lecteur et le personnage ne savent pas si c'est réel ou imaginaire.",
      exemple:
        "✅ Maupassant 'Le Horla' : le narrateur voit-il vraiment un être invisible ou est-il fou ? Gogol 'Le Nez'. Kafka 'La Métamorphose'. L'hésitation est l'essence du fantastique.",
      piege:
        "Fantastique ≠ merveilleux. Dans le merveilleux (contes), le surnaturel est accepté comme normal. Dans le fantastique, il crée une angoisse et une hésitation.",
      astuce:
        "Fantastique = hésitation entre réel et surnaturel. Merveilleux = surnaturel accepté. Etrange = explication rationnelle trouvée. Les trois à distinguer.",
    },
  },
  {
    question: "Qu'est-ce que le registre satirique ?",
    options: [
      "Un registre qui exprime la tristesse et la mélancolie",
      "Un registre qui critique avec humour, ironie ou moquerie les vices et travers d'une société",
      "Un registre qui raconte des histoires de guerre",
      "Un registre propre aux fables et aux contes",
    ],
    answer:
      "Un registre qui critique avec humour, ironie ou moquerie les vices et travers d'une société",
    fiche: {
      regle:
        "Le registre satirique dénonce et critique les défauts, vices, injustices d'une société ou de personnages par le biais de l'humour, de l'ironie, de l'exagération ou de la moquerie. Il vise à corriger en faisant rire.",
      exemple:
        "✅ Molière satirise l'avarice ('L'Avare'), l'hypocrisie religieuse ('Tartuffe'). Voltaire satirise la guerre et l'optimisme naif ('Candide'). La Fontaine satirise les puissants dans ses fables.",
      piege:
        "Satirique ≠ comique. La satire a une intention critique et morale. Le comique peut exister sans critique sociale. La satire rit POUR dénoncer.",
      astuce:
        "Satirique = critiquer en riant. Ironie + exagération + moquerie = satire. Molière + Voltaire + La Fontaine = maitres de la satire française.",
    },
  },
  {
    question: "Qu'est-ce que le registre pathétique ?",
    options: [
      "Un registre qui provoque la colère du lecteur",
      "Un registre qui cherche à susciter la pitié et l'émotion du lecteur",
      "Un registre propre aux textes argumentatifs",
      "Un registre qui exprime la joie et l'enthousiasme",
    ],
    answer:
      "Un registre qui cherche à susciter la pitié et l'émotion du lecteur",
    fiche: {
      regle:
        "Le registre pathétique cherche à émouvoir profondément le lecteur, à susciter sa pitié, sa compassion. Il met en scène la souffrance, le malheur, l'injustice de façon à toucher le coeur. Indices : champ lexical de la douleur, exclamations, larmes.",
      exemple:
        "✅ Hugo 'Les Misérables' : mort de Gavroche, misère de Fantine. Zola décrit la misère des mineurs dans 'Germinal'. Le lecteur ressent pitié et compassion.",
      piege:
        "Pathétique ≠ tragique. Le tragique implique la fatalité. Le pathétique implique la souffrance qui émeut. Un texte peut être pathétique sans être tragique.",
      astuce:
        "Pathétique = pathos (souffrance en grec). Cherche à faire pleurer, à susciter la pitié. Souffrance + émotion du lecteur = pathétique.",
    },
  },
  {
    question: "Quels indices caractérisent le registre comique ?",
    options: [
      "Vocabulaire soutenu, situations graves, ton solennel",
      "Quiproquos, jeux de mots, situations absurdes, personnages ridicules",
      "Hésitation entre réel et surnaturel, angoisse",
      "Champ lexical de la guerre, héros surhumains",
    ],
    answer:
      "Quiproquos, jeux de mots, situations absurdes, personnages ridicules",
    fiche: {
      regle:
        "Le registre comique cherche à faire rire par différents procédés : comique de situation (quiproquo, renversement), comique de caractère (personnage ridicule), comique de mots (jeux de mots, calembours), comique de gestes.",
      exemple:
        "✅ Molière 'Le Bourgeois Gentilhomme' : M. Jourdain croit parler en prose sans le savoir (comique de situation + caractère). Comique de mots : 'Belle Marquise, vos beaux yeux me font mourir d'amour.'",
      piege:
        "Comique ≠ humoristique. L'humour est subtil et bienveillant. Le comique peut être plus grossier ou satirique. Les deux font rire mais pas de la même façon.",
      astuce:
        "4 types de comique : situation (quiproquo), caractère (personnage ridicule), mots (calembours), gestes (grimaces, chutes). Molière maitrise les quatre.",
    },
  },
  {
    question: "Qu'est-ce que le registre polémique ?",
    options: [
      "Un registre qui exprime la peur et l'horreur",
      "Un registre qui attaque vivement une idée ou une personne avec indignation",
      "Un registre propre aux textes scientifiques",
      "Un registre qui exprime la joie collective",
    ],
    answer:
      "Un registre qui attaque vivement une idée ou une personne avec indignation",
    fiche: {
      regle:
        "Le registre polémique est un ton combatif et passionné qui attaque une position adverse, une injustice ou une personne avec véhémence. Il use de l'ironie, de l'indignation, des questions rhétoriques et de l'hyperbole.",
      exemple:
        "✅ Zola 'J'accuse' (1898) : lettre ouverte contre l'injustice faite à Dreyfus. Voltaire contre l'Eglise. Hugo contre Napoléon III. Ton indigné + attaque directe = polémique.",
      piege:
        "Polémique ≠ argumentatif. Le texte argumentatif peut être calme et nuancé. Le polémique est toujours passionné, véhément et combat une position.",
      astuce:
        "Polémique = combat verbal + indignation + attaque. Zola 'J'accuse' = modèle parfait. Ironie + hyperbole + questions rhétoriques = outils du polémique.",
    },
  },
  {
    question: "Un même texte peut-il avoir plusieurs registres ?",
    options: [
      "Non, un texte a toujours un seul registre dominant",
      "Oui, un texte peut mêler plusieurs registres selon les passages",
      "Non, les registres s'excluent mutuellement",
      "Oui, mais uniquement dans les romans",
    ],
    answer: "Oui, un texte peut mêler plusieurs registres selon les passages",
    fiche: {
      regle:
        "Un texte peut combiner plusieurs registres. Le registre dominant est celui qui caractérise l'ensemble, mais des passages peuvent adopter d'autres registres pour créer des effets de contraste ou de nuance.",
      exemple:
        "✅ Hugo mêle souvent épique et pathétique. Molière mêle comique et satirique. Voltaire dans 'Candide' mêle comique, ironique et pathétique dans un même récit.",
      piege:
        "Il faut identifier le registre DOMINANT (celui qui caractérise l'ensemble) et les registres secondaires. Ne pas multiplier les registres sans justification.",
      astuce:
        "Registre dominant = effet principal du texte. Registres secondaires = effets ponctuels. Demande-toi quel effet prime sur l'ensemble du texte.",
    },
  },
];

export default function LesRegistresPage() {
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
          <div className="lecon-badge">📜 Français — 3ème</div>
          <h1 className="lecon-titre">Les registres littéraires</h1>
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
            En 3ème, tu identifies et analyses les{" "}
            <strong>registres littéraires</strong> : tragique, comique, lyrique,
            épique, fantastique, satirique, pathétique et polémique.
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
              <div className="lecon-point-titre">😢 Registres qui émeuvent</div>
              <div className="lecon-point-texte">
                Tragique (destin fatal + fatalité), pathétique (pitié +
                souffrance), lyrique (sentiments personnels + première
                personne). Ces registres touchent et émeuvent le lecteur.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Tragique :
                Phèdre (Racine). Pathétique : Fantine dans Les Misérables.
                Lyrique : Lamartine 'O temps, suspends ton vol !'
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                😄 Registres qui font réagir
              </div>
              <div className="lecon-point-texte">
                Comique (faire rire : quiproquo, jeux de mots), satirique
                (critiquer en riant), polémique (attaquer avec indignation),
                épique (admirer les héros).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Comique :
                Molière. Satirique : Voltaire 'Candide'. Polémique : Zola
                'J'accuse'. Epique : Hugo à Waterloo.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">👻 Registre fantastique</div>
              <div className="lecon-point-texte">
                Hésitation entre réel et surnaturel. Ni merveilleux (surnaturel
                accepté) ni étrange (explication rationnelle). L'angoisse nait
                de l'incertitude.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Maupassant 'Le
                Horla' : est-il fou ou y a-t-il vraiment un être invisible ?
                Kafka 'La Métamorphose'.
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
