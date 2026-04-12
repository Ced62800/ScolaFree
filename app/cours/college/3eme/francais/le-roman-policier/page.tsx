"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "le-roman-policier";

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
    question: "Qu'est-ce qu'un roman policier ?",
    options: [
      "Un roman d'amour avec un détective",
      "Un récit centré sur une enquête criminelle et la résolution d'un mystère",
      "Un roman historique sur la police",
      "Un roman fantastique avec des crimes",
    ],
    answer:
      "Un récit centré sur une enquête criminelle et la résolution d'un mystère",
    fiche: {
      regle:
        "Le roman policier est un genre narratif dont le sujet central est la résolution d'un crime ou d'un mystère. Il met en scène un enquêteur (détective, policier, amateur) qui collecte des indices pour identifier le coupable.",
      exemple:
        "✅ 'Le Chien des Baskerville' de Conan Doyle (Sherlock Holmes). 'Dix Petits Nègres' d'Agatha Christie. 'Maigret' de Simenon.",
      piege:
        "Le roman policier n'est pas uniquement axé sur l'action. L'enquête, la déduction et le raisonnement logique sont au coeur du genre.",
      astuce:
        "Roman policier = crime + enquête + indices + résolution. Le lecteur cherche le coupable avec le détective.",
    },
  },
  {
    question: "Qu'est-ce qu'un 'whodunit' ?",
    options: [
      "Un roman policier américain violent",
      "Un type de roman policier où l'identité du coupable est le mystère central",
      "Un roman d'espionnage",
      "Un roman policier sans détective",
    ],
    answer:
      "Un type de roman policier où l'identité du coupable est le mystère central",
    fiche: {
      regle:
        "Le 'whodunit' (contraction de 'who done it' = qui l'a fait) est le sous-genre classique du roman policier. Le crime est commis au début, et toute l'histoire consiste à trouver le coupable parmi plusieurs suspects.",
      exemple:
        "✅ Agatha Christie est la reine du whodunit. Dans 'Le Meurtre de Roger Ackroyd', le lecteur est tenu en haleine jusqu'à la révélation finale.",
      piege:
        "Whodunit ne signifie pas 'roman violent'. C'est souvent un récit en huis clos, très cérébral, basé sur la déduction.",
      astuce:
        "Whodunit = 'qui a fait le coup ?' Tous les suspects semblent coupables. La révélation finale surprend le lecteur.",
    },
  },
  {
    question: "Quel est le rôle des indices dans un roman policier ?",
    options: [
      "Décorer le récit",
      "Permettre au détective et au lecteur de résoudre l'enquête",
      "Ralentir l'action",
      "Présenter les personnages secondaires",
    ],
    answer: "Permettre au détective et au lecteur de résoudre l'enquête",
    fiche: {
      regle:
        "Les indices sont des éléments (objets, témoignages, comportements) qui permettent de reconstituer la vérité. L'auteur les distille tout au long du récit. Certains sont de faux indices (leurres) pour égarer le lecteur.",
      exemple:
        "✅ Une tache de sang, une empreinte, un alibi fragile, une lettre anonyme sont des indices classiques du roman policier.",
      piege:
        "Attention aux faux indices (red herrings) ! L'auteur en place volontairement pour tromper le lecteur et maintenir le suspense.",
      astuce:
        "Indice = preuve ou élément de la vérité. Red herring = faux indice pour égarer. Le lecteur doit distinguer les deux !",
    },
  },
  {
    question: "Qu'est-ce que le 'roman noir' ?",
    options: [
      "Un roman policier avec une couverture noire",
      "Un sous-genre sombre centré sur la violence, la corruption et l'atmosphère urbaine",
      "Un roman d'horreur",
      "Un roman policier classique à énigme",
    ],
    answer:
      "Un sous-genre sombre centré sur la violence, la corruption et l'atmosphère urbaine",
    fiche: {
      regle:
        "Le roman noir (hard-boiled en anglais) est un sous-genre du policier né aux États-Unis dans les années 1920-1930. Il se distingue par une atmosphère sombre, des personnages moralement ambigus, la corruption sociale et la violence.",
      exemple:
        "✅ Raymond Chandler ('Le Grand Sommeil'), Dashiell Hammett ('Le Faucon maltais'). En France : Léo Malet avec Nestor Burma.",
      piege:
        "Roman noir ≠ roman policier classique. Le roman noir critique la société et montre un monde corrompu, pas seulement une énigme à résoudre.",
      astuce:
        "Roman noir = atmosphère sombre + détective cynique + critique sociale. Roman classique = énigme + déduction + révélation finale.",
    },
  },
  {
    question:
      "Quel personnage est récurrent dans le roman policier classique ?",
    options: [
      "Le vampire",
      "Le détective à la logique infaillible",
      "Le héros romantique",
      "Le narrateur omniscient",
    ],
    answer: "Le détective à la logique infaillible",
    fiche: {
      regle:
        "Le roman policier classique met souvent en scène un détective au génie hors du commun, qui résout les crimes par la déduction logique. Ce personnage récurrent (série) est un pilier du genre.",
      exemple:
        "✅ Sherlock Holmes (Conan Doyle), Hercule Poirot (Christie), le commissaire Maigret (Simenon), Nestor Burma (Léo Malet).",
      piege:
        "Le détective n'est pas toujours policier. Il peut être amateur (Holmes, Poirot) ou journaliste. Ce qui le définit, c'est sa méthode de déduction.",
      astuce:
        "Détective = observateur + logique + déduction. Sa méthode (pas sa profession) le distingue. Souvent accompagné d'un acolyte naïf.",
    },
  },
  {
    question: "Qu'est-ce qu'un 'huis clos' dans le roman policier ?",
    options: [
      "Un roman sans dialogue",
      "Une enquête où le crime et les suspects sont enfermés dans un espace limité",
      "Un roman policier très court",
      "Une enquête sans détective",
    ],
    answer:
      "Une enquête où le crime et les suspects sont enfermés dans un espace limité",
    fiche: {
      regle:
        "Le huis clos est une situation narrative où les personnages sont enfermés dans un espace restreint (manoir, île, train, avion). Le coupable est forcément parmi eux. Ce procédé intensifie le suspense.",
      exemple:
        "✅ 'Dix Petits Nègres' d'Agatha Christie : 10 personnes sur une île, l'une d'elles est le meurtrier. 'Le Crime de l'Orient-Express' : dans un train bloqué.",
      piege:
        "Huis clos ne signifie pas que les portes sont fermées ! C'est une situation narrative où le cercle des suspects est fermé et connu.",
      astuce:
        "Huis clos = espace fermé + suspects connus + tension maximale. Le lecteur sait que le coupable est là, mais lequel ?",
    },
  },
  {
    question:
      "Quel procédé narrative l'auteur utilise-t-il pour maintenir le suspense ?",
    options: [
      "La description de la nature",
      "Le cliffhanger et la rétention d'informations",
      "Les longues digressions philosophiques",
      "La narration chronologique stricte",
    ],
    answer: "Le cliffhanger et la rétention d'informations",
    fiche: {
      regle:
        "L'auteur crée le suspense par : le cliffhanger (fin de chapitre haletante), la rétention d'informations (le narrateur ne dit pas tout), les faux indices, les rebondissements et les révélations progressives.",
      exemple:
        "✅ Cliffhanger : 'Alors qu'il ouvrait la porte, il vit... Chapitre suivant.' Rétention : le détective sait qui est le coupable mais ne le révèle qu'à la fin.",
      piege:
        "Le suspense n'est pas seulement l'action. La rétention d'informations (ce que l'auteur cache au lecteur) est souvent plus efficace.",
      astuce:
        "Suspense = cliffhanger + rétention + faux indices + révélations progressives. L'auteur joue avec ce que le lecteur sait ou croit savoir.",
    },
  },
  {
    question: "Qu'est-ce que le 'roman policier à énigme' ou 'puzzle story' ?",
    options: [
      "Un roman où les personnages jouent à des jeux",
      "Un roman dont la résolution repose entièrement sur la logique et la déduction",
      "Un roman avec beaucoup d'action",
      "Un roman policier pour enfants",
    ],
    answer:
      "Un roman dont la résolution repose entièrement sur la logique et la déduction",
    fiche: {
      regle:
        "Le roman à énigme (ou puzzle story) est le sous-genre le plus intellectuel du policier. Tous les indices sont donnés loyalement au lecteur. La solution doit être logiquement déductible. L'auteur joue à armes égales avec le lecteur.",
      exemple:
        "✅ Agatha Christie respecte toujours cette règle : tous les indices sont dans le texte. Le lecteur peut (en théorie) trouver le coupable avant la révélation finale.",
      piege:
        "Dans un bon roman à énigme, l'auteur ne triche pas. Tous les indices sont là, mais habilement dissimulés dans le récit.",
      astuce:
        "Enigme = jeu loyal avec le lecteur. Tous les indices sont présents. La solution est logique. Si tu relis, tu te dis 'Bien sûr !'",
    },
  },
  {
    question: "Quel est le rôle du 'mobile' dans une enquête policière ?",
    options: [
      "Le téléphone du détective",
      "La raison qui pousse le coupable à commettre le crime",
      "Le moyen de transport utilisé",
      "L'alibi du suspect",
    ],
    answer: "La raison qui pousse le coupable à commettre le crime",
    fiche: {
      regle:
        "Dans une enquête, le détective cherche trois éléments : le mobile (pourquoi ?), le moyen (comment ?) et l'opportunité (quand et où ?). Le mobile est la motivation du coupable : jalousie, argent, vengeance, peur...",
      exemple:
        "✅ Mobile = jalousie dans un crime passionnel. Moyen = le poison. Opportunité = seul avec la victime entre 18h et 20h.",
      piege:
        "Mobile ≠ preuve. Un mobile fort ne prouve pas la culpabilité. Plusieurs suspects peuvent avoir un mobile.",
      astuce:
        "Enquête = Mobile + Moyen + Opportunité. Les 3 M. Sans les trois réunis, on ne peut pas accuser quelqu'un.",
    },
  },
  {
    question: "Qu'est-ce qu'un roman policier 'procédural' ?",
    options: [
      "Un roman très long avec beaucoup de procédures judiciaires",
      "Un roman qui suit les méthodes réelles d'investigation d'une équipe de police",
      "Un roman sans détective",
      "Un roman basé sur un fait divers réel",
    ],
    answer:
      "Un roman qui suit les méthodes réelles d'investigation d'une équipe de police",
    fiche: {
      regle:
        "Le roman policier procédural (police procedural) met en scène une équipe de policiers qui enquête en suivant des méthodes réalistes : analyses ADN, auditions, filatures, expertises légistes. Moins de génie individuel, plus de travail collectif.",
      exemple:
        "✅ Les séries télévisées 'Engrenages' ou 'The Wire' sont procédurales. En roman : Fred Vargas avec le commissaire Adamsberg mêle procédural et originalité.",
      piege:
        "Procédural ≠ roman classique. Le héros n'est pas un génie solitaire mais une équipe qui utilise des méthodes scientifiques réalistes.",
      astuce:
        "Procédural = équipe + méthodes réalistes + police technique. Classique = détective génial + déduction logique. Deux approches différentes.",
    },
  },
];

export default function LeRomanPolicierPage() {
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
          <div className="lecon-badge">📖 Français — 3ème</div>
          <h1 className="lecon-titre">Le roman policier</h1>
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
            En 3ème, tu explores le <strong>roman policier</strong> : ses
            origines, ses sous-genres (whodunit, roman noir, procédural), ses
            personnages types et les techniques narratives qui créent le
            suspense.
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
              <div className="lecon-point-titre">🔍 Le genre policier</div>
              <div className="lecon-point-texte">
                Crime + enquête + détective + résolution. Sous-genres : whodunit
                (qui a fait le coup ?), roman noir (atmosphère sombre),
                procédural (méthodes réalistes).
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Sherlock Holmes
                = classique. Maigret = procédural. Roman noir américain =
                hard-boiled.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🕵️ Le détective et les suspects
              </div>
              <div className="lecon-point-texte">
                Le détective (génie ou équipe) cherche mobile, moyen et
                opportunité. Les suspects ont tous un motif. Le coupable est
                révélé à la fin.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Mobile =
                jalousie. Moyen = poison. Opportunité = seul avec la victime.
                Les 3 M de l'enquête.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ⚡ Les techniques du suspense
              </div>
              <div className="lecon-point-texte">
                Cliffhanger, rétention d'informations, faux indices (red
                herrings), huis clos, rebondissements. L'auteur joue avec ce que
                le lecteur sait.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Exemple :</span> Huis clos :
                suspects enfermés sur une île. Red herring : faux indice pour
                égarer. Cliffhanger : fin de chapitre haletante.
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
