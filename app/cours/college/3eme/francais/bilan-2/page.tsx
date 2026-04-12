"use client";
import { saveScore } from "@/lib/scores";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "francais";
const THEME = "bilan-2";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const questions = [
  // L'argumentation (5 questions)
  {
    id: 1,
    theme: "l-argumentation",
    question: "Qu'est-ce que la thèse dans un texte argumentatif ?",
    options: [
      "Un exemple concret",
      "La position défendue par l'auteur",
      "La conclusion du texte",
      "Un argument contre l'auteur",
    ],
    reponse: "La position défendue par l'auteur",
    explication:
      "La thèse est l'opinion que l'auteur défend. Elle répond à : 'Qu'est-ce que l'auteur veut nous convaincre ?'",
  },
  {
    id: 2,
    theme: "l-argumentation",
    question: "Qu'est-ce que la concession ?",
    options: [
      "Abandonner sa thèse",
      "Reconnaitre une part de vérité adverse avant de la réfuter",
      "Répéter sa thèse en conclusion",
      "Citer un expert",
    ],
    reponse: "Reconnaitre une part de vérité adverse avant de la réfuter",
    explication:
      "Concession = 'certes... mais'. On admet une nuance sans abandonner sa thèse. Renforce la crédibilité.",
  },
  {
    id: 3,
    theme: "l-argumentation",
    question: "Quel connecteur exprime la conséquence ?",
    options: ["Cependant", "Par conséquent", "En effet", "Bien que"],
    reponse: "Par conséquent",
    explication:
      "'Par conséquent' exprime la conséquence (donc, ainsi, c'est pourquoi). 'Cependant' = opposition. 'En effet' = cause.",
  },
  {
    id: 4,
    theme: "l-argumentation",
    question: "Qu'est-ce que le plan dialectique ?",
    options: [
      "Avantages / inconvénients en 2 parties",
      "Thèse / antithèse / synthèse en 3 parties",
      "Un plan chronologique",
      "Un plan uniquement pour",
    ],
    reponse: "Thèse / antithèse / synthèse en 3 parties",
    explication:
      "Le plan dialectique = pour / contre / nuance. 3 parties : défense, réfutation, dépassement nuancé.",
  },
  {
    id: 5,
    theme: "l-argumentation",
    question: "Qu'est-ce que l'argument ad hominem ?",
    options: [
      "Un argument basé sur l'expérience",
      "Un argument qui cite un expert",
      "Un argument qui s'attaque à la personne plutôt qu'à ses idées",
      "Un argument fondé sur des statistiques",
    ],
    reponse: "Un argument qui s'attaque à la personne plutôt qu'à ses idées",
    explication:
      "L'ad hominem est un sophisme : attaquer la personne, pas l'idée. Ex : 'Tu prends l'avion, tu ne peux pas défendre l'écologie !'",
  },
  // Le théâtre (5 questions)
  {
    id: 6,
    theme: "le-theatre",
    question: "Qu'est-ce qu'une didascalie ?",
    options: [
      "Une longue réplique",
      "Une indication scénique de l'auteur pour la mise en scène",
      "Le titre d'une scène",
      "Un monologue intérieur",
    ],
    reponse: "Une indication scénique de l'auteur pour la mise en scène",
    explication:
      "Les didascalies guident le metteur en scène : gestes, décors, tons. Elles ne sont pas dites par les acteurs.",
  },
  {
    id: 7,
    theme: "le-theatre",
    question: "Qu'est-ce que la règle des trois unités ?",
    options: [
      "3 actes, 3 scènes, 3 personnages",
      "Unité de lieu, de temps et d'action",
      "3 genres théâtraux",
      "3 niveaux de langue",
    ],
    reponse: "Unité de lieu, de temps et d'action",
    explication:
      "La règle classique impose : 1 lieu, 24h max, 1 action principale. Racine la respecte. Hugo la brise en 1830.",
  },
  {
    id: 8,
    theme: "le-theatre",
    question: "Qu'est-ce que la catharsis ?",
    options: [
      "Un changement de décor",
      "La purification des passions par la tragédie",
      "La distribution des rôles",
      "Le moment final d'une pièce",
    ],
    reponse: "La purification des passions par la tragédie",
    explication:
      "La catharsis (Aristote) : le spectateur ressent pitié et terreur, puis en sort apaisé et purifié de ses passions.",
  },
  {
    id: 9,
    theme: "le-theatre",
    question: "Qu'est-ce que le théâtre de l'absurde ?",
    options: [
      "Un théâtre comique",
      "Un courant du XXe montrant l'absurdité de l'existence par des situations incohérentes",
      "Un théâtre sans acteurs",
      "Un théâtre basé sur des faits réels",
    ],
    reponse:
      "Un courant du XXe montrant l'absurdité de l'existence par des situations incohérentes",
    explication:
      "L'absurde (Beckett, Ionesco) montre l'impossibilité de trouver un sens à l'existence. Ex : 'En attendant Godot'.",
  },
  {
    id: 10,
    theme: "le-theatre",
    question: "Qu'est-ce qu'un aparté ?",
    options: [
      "Une scène sur un autre plateau",
      "Une réplique que les autres personnages n'entendent pas mais que le public entend",
      "Une didascalie de sortie",
      "Un dialogue entre personnages secondaires",
    ],
    reponse:
      "Une réplique que les autres personnages n'entendent pas mais que le public entend",
    explication:
      "L'aparté crée une complicité avec le public en révélant les vraies pensées d'un personnage.",
  },
  // Les registres (5 questions)
  {
    id: 11,
    theme: "les-registres",
    question: "Qu'est-ce qu'un registre littéraire ?",
    options: [
      "Le niveau de langue d'un texte",
      "L'effet dominant qu'un texte cherche à produire sur le lecteur",
      "Le genre d'un texte",
      "La période historique d'un texte",
    ],
    reponse: "L'effet dominant qu'un texte cherche à produire sur le lecteur",
    explication:
      "Le registre = l'effet voulu sur le lecteur (émouvoir, faire rire, faire peur...). Différent du genre (forme).",
  },
  {
    id: 12,
    theme: "les-registres",
    question: "Quels indices caractérisent le registre lyrique ?",
    options: [
      "Ironie, moquerie",
      "Première personne, sentiments, exclamations, images poétiques",
      "Destin fatal, fatalité",
      "Hésitation entre réel et surnaturel",
    ],
    reponse: "Première personne, sentiments, exclamations, images poétiques",
    explication:
      "Le lyrique exprime les émotions intimes. Indices : 'je', exclamations, images poétiques, musicalité. Ex : Lamartine.",
  },
  {
    id: 13,
    theme: "les-registres",
    question: "Qu'est-ce que le registre fantastique ?",
    options: [
      "Un registre propre aux contes de fées",
      "Un registre basé uniquement sur la peur",
      "Un registre qui crée une hésitation entre explication naturelle et surnaturelle",
      "Un registre qui exagère la réalité",
    ],
    reponse:
      "Un registre qui crée une hésitation entre explication naturelle et surnaturelle",
    explication:
      "Le fantastique (Todorov) = hésitation entre réel et surnaturel. Ex : Maupassant 'Le Horla' — est-il fou ou non ?",
  },
  {
    id: 14,
    theme: "les-registres",
    question: "Qu'est-ce que le registre épique ?",
    options: [
      "Un registre qui fait pleurer",
      "Un registre qui amplifie des actions héroïques pour susciter l'admiration",
      "Un registre qui critique avec humour",
      "Un registre qui exprime la peur",
    ],
    reponse:
      "Un registre qui amplifie des actions héroïques pour susciter l'admiration",
    explication:
      "L'épique magnifie les exploits héroïques. Indices : hyperboles, héros surhumains, batailles grandioses. Ex : Hugo à Waterloo.",
  },
  {
    id: 15,
    theme: "les-registres",
    question: "Qu'est-ce que le registre satirique ?",
    options: [
      "Un registre triste et mélancolique",
      "Un registre qui critique avec humour les vices d'une société",
      "Un registre propre aux fables uniquement",
      "Un registre qui raconte des batailles",
    ],
    reponse: "Un registre qui critique avec humour les vices d'une société",
    explication:
      "La satire dénonce en faisant rire. Ex : Molière satirise l'avarice, Voltaire satirise la guerre dans 'Candide'.",
  },
  // Révision Brevet (5 questions)
  {
    id: 16,
    theme: "revision-brevet",
    question: "Combien de points vaut l'épreuve de français au Brevet ?",
    options: ["50 points", "75 points", "100 points", "200 points"],
    reponse: "100 points",
    explication:
      "L'épreuve de français vaut 100 pts : 50 pts compréhension/langue + 50 pts rédaction. Durée : 3 heures.",
  },
  {
    id: 17,
    theme: "revision-brevet",
    question: "Que signifie 'justifier par un relevé précis' ?",
    options: [
      "Donner son opinion",
      "Citer des mots du texte entre guillemets pour appuyer sa réponse",
      "Résumer le texte",
      "Donner le contexte historique",
    ],
    reponse: "Citer des mots du texte entre guillemets pour appuyer sa réponse",
    explication:
      "Justifier = citer précisément (entre guillemets) + indiquer la ligne. Une réponse sans citation n'est pas justifiée.",
  },
  {
    id: 18,
    theme: "revision-brevet",
    question: "Quelle figure est présente dans 'La mer chantait doucement' ?",
    options: ["Métaphore", "Comparaison", "Personnification", "Hyperbole"],
    reponse: "Personnification",
    explication:
      "La personnification attribue une action humaine (chanter) à un élément naturel (la mer).",
  },
  {
    id: 19,
    theme: "revision-brevet",
    question: "Qu'est-ce que la modalisation ?",
    options: [
      "La mise en page du texte",
      "Les marques linguistiques qui expriment le degré de certitude de l'auteur",
      "Le type de narration",
      "La longueur des phrases",
    ],
    reponse:
      "Les marques linguistiques qui expriment le degré de certitude de l'auteur",
    explication:
      "Modalisation = certitude (il est évident), doute (peut-être, il semble), jugement (heureusement), verbes modaux.",
  },
  {
    id: 20,
    theme: "revision-brevet",
    question: "Quelle est la structure d'une introduction au Brevet ?",
    options: [
      "Thèse + arguments + conclusion",
      "Accroche + présentation du sujet + annonce du plan",
      "Résumé + opinion",
      "Citation + développement + morale",
    ],
    reponse: "Accroche + présentation du sujet + annonce du plan",
    explication:
      "Introduction = 3 temps : accroche (interpelle) + présentation (problématique) + annonce du plan.",
  },
];

const themeLabels: Record<string, string> = {
  "l-argumentation": "L'argumentation",
  "le-theatre": "Le théâtre",
  "les-registres": "Les registres",
  "revision-brevet": "Révision Brevet",
};

const themeColors: Record<string, string> = {
  "l-argumentation": "#4f8ef7",
  "le-theatre": "#2ec4b6",
  "les-registres": "#ffd166",
  "revision-brevet": "#ff6b6b",
};

export default function BilanFrancais3emePageDeux() {
  const router = useRouter();
  const [etape, setEtape] = useState<"intro" | "qcm" | "fini">("intro");
  const [questionsShuffled, setQuestionsShuffled] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [resultats, setResultats] = useState<boolean[]>([]);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (user) setEstConnecte(true);
      else router.push("/inscription");
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
          <h1 className="lecon-titre">Bilan Final Français 3ème — Partie 2</h1>
          <div className="lecon-intro">
            Ce bilan couvre les 4 thèmes de la Partie 2 : l'argumentation, le
            théâtre, les registres et la révision Brevet. 20 questions, score
            sur 20.
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
              onClick={() => router.push("/cours/college/3eme/francais/page-2")}
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
