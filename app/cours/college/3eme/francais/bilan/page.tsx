"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "bilan";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // Le roman policier (5 questions)
  {
    id: 1,
    theme: "le-roman-policier",
    question: "Qu'est-ce qu'un 'whodunit' ?",
    options: [
      "Un roman policier violent",
      "Un roman où l'identité du coupable est le mystère central",
      "Un roman d'espionnage",
      "Un roman sans détective",
    ],
    reponse: "Un roman où l'identité du coupable est le mystère central",
    explication:
      "Le whodunit (who done it = qui l'a fait) est le sous-genre classique du policier centré sur la découverte du coupable.",
  },
  {
    id: 2,
    theme: "le-roman-policier",
    question: "Qu'est-ce qu'un 'red herring' dans un roman policier ?",
    options: [
      "La solution de l'enquête",
      "Un faux indice destiné à égarer le lecteur",
      "Le mobile du coupable",
      "Le détective principal",
    ],
    reponse: "Un faux indice destiné à égarer le lecteur",
    explication:
      "Le red herring (hareng rouge) est un faux indice placé par l'auteur pour tromper le lecteur et maintenir le suspense.",
  },
  {
    id: 3,
    theme: "le-roman-policier",
    question: "Quels sont les trois éléments que cherche le détective ?",
    options: [
      "Lieu, heure, victime",
      "Mobile, moyen, opportunité",
      "Suspect, alibi, témoin",
      "Indice, preuve, aveu",
    ],
    reponse: "Mobile, moyen, opportunité",
    explication:
      "Le détective cherche toujours les 3 M : Mobile (pourquoi ?), Moyen (comment ?), Opportunité (quand et où ?).",
  },
  {
    id: 4,
    theme: "le-roman-policier",
    question: "Qu'est-ce qu'un roman policier 'procédural' ?",
    options: [
      "Un roman très long",
      "Un roman qui suit les méthodes réelles d'une équipe de police",
      "Un roman sans coupable",
      "Un roman historique",
    ],
    reponse: "Un roman qui suit les méthodes réelles d'une équipe de police",
    explication:
      "Le roman procédural met en scène une équipe utilisant des méthodes réalistes : ADN, auditions, expertises légistes.",
  },
  {
    id: 5,
    theme: "le-roman-policier",
    question: "Qu'est-ce qu'un huis clos dans le roman policier ?",
    options: [
      "Un roman très court",
      "Une enquête où les suspects sont enfermés dans un espace limité",
      "Un roman sans dialogue",
      "Un roman à la première personne",
    ],
    reponse: "Une enquête où les suspects sont enfermés dans un espace limité",
    explication:
      "Le huis clos (île, train, manoir) ferme le cercle des suspects et intensifie le suspense. Ex : Agatha Christie.",
  },
  // La poésie moderne (5 questions)
  {
    id: 6,
    theme: "la-poesie-moderne",
    question: "Qu'est-ce que le vers libre ?",
    options: [
      "Un vers de 12 syllabes",
      "Un vers sans règle fixe de longueur ni de rime",
      "Un vers traduit d'une autre langue",
      "Un vers anonyme",
    ],
    reponse: "Un vers sans règle fixe de longueur ni de rime",
    explication:
      "Le vers libre rompt avec les contraintes classiques : pas de rime obligatoire, pas de longueur fixe.",
  },
  {
    id: 7,
    theme: "la-poesie-moderne",
    question: "Quel poète a inventé le calligramme ?",
    options: [
      "Paul Eluard",
      "Arthur Rimbaud",
      "Guillaume Apollinaire",
      "Charles Baudelaire",
    ],
    reponse: "Guillaume Apollinaire",
    explication:
      "Apollinaire est le créateur du calligramme : poème dont les mots forment une image visuelle liée au sujet.",
  },
  {
    id: 8,
    theme: "la-poesie-moderne",
    question: "Qu'est-ce que la synesthésie ?",
    options: [
      "Une répétition de sons",
      "L'association de sensations de sens différents",
      "Un retour en arrière",
      "Un poème sans ponctuation",
    ],
    reponse: "L'association de sensations de sens différents",
    explication:
      "La synesthésie associe des sensations de sens différents (ex : Rimbaud colore les voyelles dans 'Voyelles').",
  },
  {
    id: 9,
    theme: "la-poesie-moderne",
    question: "Quels sont les trois pères de la négritude ?",
    options: [
      "Hugo, Zola, Balzac",
      "Césaire, Senghor, Damas",
      "Breton, Eluard, Desnos",
      "Verlaine, Rimbaud, Mallarmé",
    ],
    reponse: "Césaire, Senghor, Damas",
    explication:
      "Aimé Césaire (Martinique), Léopold Sédar Senghor (Sénégal) et Léon-Gontran Damas (Guyane) fondent la négritude.",
  },
  {
    id: 10,
    theme: "la-poesie-moderne",
    question: "Qu'est-ce que le surréalisme ?",
    options: [
      "Un retour aux formes classiques",
      "Un mouvement explorant l'inconscient et le rêve",
      "Un mouvement uniquement pictural",
      "Un courant qui décrit la réalité avec précision",
    ],
    reponse: "Un mouvement explorant l'inconscient et le rêve",
    explication:
      "Le surréalisme (Breton) explore l'inconscient et produit des images inattendues. Ex : Eluard 'La terre est bleue comme une orange'.",
  },
  // Le subjonctif (5 questions)
  {
    id: 11,
    theme: "subjonctif",
    question: "Quelle phrase utilise correctement le subjonctif ?",
    options: [
      "Je veux que tu viens.",
      "Je veux que tu viennes.",
      "Je veux que tu viendras.",
      "Je veux que tu es venu.",
    ],
    reponse: "Je veux que tu viennes.",
    explication:
      "Après 'vouloir que', on utilise toujours le subjonctif présent. 'Viennes' est la forme correcte.",
  },
  {
    id: 12,
    theme: "subjonctif",
    question: "Conjugue 'être' au subjonctif : 'Il faut que nous ___'",
    options: ["sommes", "étions", "soyons", "serons"],
    reponse: "soyons",
    explication:
      "Etre au subjonctif : que je sois, tu sois, il soit, nous soyons, vous soyez, ils soient.",
  },
  {
    id: 13,
    theme: "subjonctif",
    question: "Quelle conjonction impose toujours le subjonctif ?",
    options: ["parce que", "pendant que", "bien que", "depuis que"],
    reponse: "bien que",
    explication:
      "'Bien que' impose toujours le subjonctif. 'Parce que', 'pendant que', 'depuis que' sont suivis de l'indicatif.",
  },
  {
    id: 14,
    theme: "subjonctif",
    question: "Conjugue 'avoir' au subjonctif : 'Il faut que tu ___'",
    options: ["as", "avais", "aies", "auras"],
    reponse: "aies",
    explication:
      "Avoir au subjonctif : que j'aie, tu aies, il ait, nous ayons, vous ayez, ils aient.",
  },
  {
    id: 15,
    theme: "subjonctif",
    question:
      "Quel verbe d'opinion est suivi de l'indicatif (forme affirmative) ?",
    options: ["vouloir que", "bien que", "penser que", "avant que"],
    reponse: "penser que",
    explication:
      "'Penser que' à la forme affirmative est suivi de l'indicatif. A la forme négative, le subjonctif est possible.",
  },
  // Les figures de rhétorique (5 questions)
  {
    id: 16,
    theme: "les-figures-de-rhetorique",
    question: "Qu'est-ce que l'hyperbole ?",
    options: [
      "Une figure qui atténue",
      "Une figure qui exagère la réalité",
      "Une figure qui compare avec 'comme'",
      "Une figure qui répète",
    ],
    reponse: "Une figure qui exagère la réalité",
    explication:
      "L'hyperbole est une exagération volontaire pour frapper l'imagination. Ex : 'Je meurs de faim.'",
  },
  {
    id: 17,
    theme: "les-figures-de-rhetorique",
    question: "Identifie la figure : 'Ce n'est pas mal' (= c'est très bien)",
    options: ["Hyperbole", "Litote", "Oxymore", "Antiphrase"],
    reponse: "Litote",
    explication:
      "La litote dit moins pour suggérer plus. 'Ce n'est pas mal' sous-entend que c'est très bien.",
  },
  {
    id: 18,
    theme: "les-figures-de-rhetorique",
    question: "Identifie la figure : 'Le silence hurlait'",
    options: ["Comparaison", "Métaphore", "Oxymore", "Gradation"],
    reponse: "Oxymore",
    explication:
      "L'oxymore associe deux contraires dans le même groupe. Silence (= absence de son) + hurler (= bruit fort).",
  },
  {
    id: 19,
    theme: "les-figures-de-rhetorique",
    question: "Qu'est-ce que la gradation ?",
    options: [
      "Une répétition exacte",
      "Une énumération ordonnée par intensité croissante ou décroissante",
      "Une inversion de l'ordre des mots",
      "Une question sans réponse",
    ],
    reponse:
      "Une énumération ordonnée par intensité croissante ou décroissante",
    explication:
      "La gradation enchaîne des termes en ordre progressif. Ex : 'Un souffle, une voix, un cri, un hurlement.'",
  },
  {
    id: 20,
    theme: "les-figures-de-rhetorique",
    question: "Qu'est-ce qu'une question rhétorique ?",
    options: [
      "Une question de grammaire",
      "Une question qui attend une réponse précise",
      "Une question qui n'attend pas de réponse et affirme une évidence",
      "Une question posée à un personnage",
    ],
    reponse: "Une question qui n'attend pas de réponse et affirme une évidence",
    explication:
      "La question rhétorique n'attend pas de réponse. Elle affirme ou nie une évidence. Ex : 'Peut-on rester indifférent ?'",
  },
];

const themeLabels: Record<string, string> = {
  "le-roman-policier": "Le roman policier",
  "la-poesie-moderne": "La poésie moderne",
  subjonctif: "Le subjonctif",
  "les-figures-de-rhetorique": "Les figures de rhétorique",
};

const themeColors: Record<string, string> = {
  "le-roman-policier": "#4f8ef7",
  "la-poesie-moderne": "#2ec4b6",
  subjonctif: "#ffd166",
  "les-figures-de-rhetorique": "#ff6b6b",
};

export default function BilanFrancais3emePage() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionsShuffled, setQuestionsShuffled] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [resultats, setResultats] = useState<boolean[]>([]);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const [estConnecte, setEstConnecte] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (user) {
        setEstConnecte(true);
        setUserId(user.id);
      } else router.push("/inscription");
    };
    init();
  }, []);

  const demarrer = () => {
    const shuffled = shuffleArray(questions);
    setQuestionsShuffled(shuffled);
    scoreRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setSelected(null);
    setResultats([]);
    setEtape("qcm");
  };

  const choisir = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === questionsShuffled[index].reponse;
    if (correct) scoreRef.current += 1;
    setResultats((r) => [...r, correct]);
  };

  const suivant = async () => {
    if (index + 1 >= questionsShuffled.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questionsShuffled.length,
        });
      }
      setEtape("fini");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const scoreParTheme = () => {
    const themes = Object.keys(themeLabels);
    return themes.map((t) => {
      const qs = questionsShuffled.filter((q) => q.theme === t);
      const idxs = qs.map((q) => questionsShuffled.indexOf(q));
      const bonnes = idxs.filter((i) => resultats[i]).length;
      return { theme: t, bonnes, total: qs.length };
    });
  };

  const total = questionsShuffled.length;
  const q = questionsShuffled[index];

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">🎯 Bilan — Français 3ème</div>
          <h1 className="lecon-titre">Bilan Final Français 3ème — Partie 1</h1>
          <div className="lecon-intro">
            Ce bilan couvre les 4 thèmes de la Partie 1 : le roman policier, la
            poésie moderne, le subjonctif et les figures de rhétorique. 20
            questions, score sur 20.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {Object.entries(themeLabels).map(([id, label]) => (
              <div
                key={id}
                style={{
                  background: `${themeColors[id]}18`,
                  border: `1px solid ${themeColors[id]}44`,
                  borderRadius: "12px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: themeColors[id],
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    marginTop: "4px",
                  }}
                >
                  5 questions
                </div>
              </div>
            ))}
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Commencer le bilan →
          </button>
        </div>
      </div>
    );

  if (etape === "qcm")
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
              {scoreRef.current} / {total}
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
          <div
            style={{
              fontSize: "0.8rem",
              color: themeColors[q.theme],
              fontWeight: 700,
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            {themeLabels[q.theme]}
          </div>
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((opt) => {
              let cn = "qcm-option";
              if (selected) {
                if (opt === q.reponse) cn += " correct";
                else if (opt === selected) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button key={opt} className={cn} onClick={() => choisir(opt)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className={`qcm-feedback ${selected === q.reponse ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">
                {selected === q.reponse ? "✅" : "❌"}
              </span>
              <div className="feedback-texte">
                <strong>
                  {selected === q.reponse ? "Bravo !" : "Pas tout à fait..."}
                </strong>
                <p>{q.explication}</p>
              </div>
            </div>
          )}
          {selected && (
            <button
              className="lecon-btn"
              onClick={suivant}
              style={{ marginTop: "16px" }}
            >
              {index + 1 >= total
                ? "Voir mon résultat →"
                : "Question suivante →"}
            </button>
          )}
        </div>
      </div>
    );

  if (etape === "fini") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const stats = scoreParTheme();
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">
            {pourcentage >= 80
              ? "Excellent !"
              : pourcentage >= 60
                ? "Bien joué !"
                : "Continue !"}
          </h2>
          <div className="resultat-score">
            {scoreRef.current} / {total}
          </div>
          <p className="resultat-desc">{pourcentage}% de bonnes réponses</p>
          <div style={{ width: "100%", marginBottom: "24px" }}>
            {stats.map((s) => (
              <div key={s.theme} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{ color: themeColors[s.theme], fontWeight: 700 }}
                  >
                    {themeLabels[s.theme]}
                  </span>
                  <span style={{ color: "#fff" }}>
                    {s.bonnes}/{s.total}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background: themeColors[s.theme],
                      borderRadius: "8px",
                      height: "8px",
                      width: `${(s.bonnes / s.total) * 100}%`,
                      transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              🔄 Recommencer
            </button>
            <button
              className="lecon-btn-outline"
              onClick={() => router.push("/cours/college/3eme/francais")}
            >
              ← Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
