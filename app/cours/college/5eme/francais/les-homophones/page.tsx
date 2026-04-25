"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "5eme";
const MATIERE = "francais";
const THEME = "les-homophones";

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
    question: "Choisissez la bonne orthographe : 'Il ___ faim et ___ soif.'",
    options: ["a / a", "à / à", "a / à", "à / a"],
    answer: "a / à",
    fiche: {
      regle:
        "'A' = verbe avoir (conjugué). 'À' = préposition (accent grave). Astuce : remplace par 'avait'. Si ça marche → 'a'. Sinon → 'à'.",
      exemple:
        "✅ Il A faim (= il avait faim ✓). Il va À l'école (= il va avait l'école ✗ → à).",
      piege:
        "Ne pas mettre d'accent sur 'a' verbe avoir. L'accent distingue les deux mots.",
      astuce:
        "A = avait (verbe). À = pas avait (préposition). Test : remplace par 'avait'. Si ça marche = A sans accent.",
    },
  },
  {
    question: "Complétez : '___ part en vacances, mais ___ valise est lourde.'",
    options: ["On / on", "On / ont", "Ont / on", "Ont / ont"],
    answer: "On / on",
    fiche: {
      regle:
        "'On' = pronom sujet (= il/elle). 'Ont' = verbe avoir conjugué (ils ont). Astuce : remplace par 'ils'. Si 'ils ont' marche → 'ont'. Si 'ils partent' marche → 'on'.",
      exemple:
        "✅ ON part (= il part ✓). Ils ONT une valise (= ils ont ✓ → ont). SA valise = son → possession.",
      piege:
        "'On' peut être sujet du verbe. 'Ont' est toujours suivi d'un participe passé ou d'un attribut.",
      astuce:
        "ON = pronom (remplace il/elle). ONT = ils ont. Test : remplace par 'ils'. Ils ONT → ont. Ils partent → on.",
    },
  },
  {
    question: "Choisissez : 'C'est ___ livre ___ appartient à mon frère.'",
    options: ["ce / qui", "se / qui", "ce / qu'", "se / qu'"],
    answer: "ce / qui",
    fiche: {
      regle:
        "'Ce' = démonstratif (ce livre, ce que...). 'Se' = pronom réfléchi (il se lave). Ici 'ce' est démonstratif + 'qui' pronom relatif.",
      exemple:
        "✅ CE livre (démonstratif = ce livre-là). QUI appartient (pronom relatif sujet). Il SE lave (réfléchi).",
      piege:
        "'Se' précède toujours un verbe pronominal. 'Ce' précède un nom ou introduit une relative (ce qui, ce que).",
      astuce:
        "CE = désigne quelque chose (ce livre, ce que je veux). SE = action réfléchie (il SE lave, elle SE coiffe).",
    },
  },
  {
    question:
      "Complétez : 'Je ne sais pas ___ il viendra, ___ s'il est disponible.'",
    options: ["si / ou", "si / où", "s'il / ou", "si / ou"],
    answer: "si / ou",
    fiche: {
      regle:
        "'Si' = conjonction (condition ou interrogation indirecte). 'Ou' = conjonction de coordination (= ou bien). 'Où' (accent) = lieu ou temps.",
      exemple:
        "✅ Je ne sais pas SI il viendra (interrogation indirecte). OU s'il est disponible (= ou bien). Il habite OÙ ? (lieu).",
      piege:
        "'Où' avec accent = lieu/temps. 'Ou' sans accent = ou bien. Teste : remplace par 'ou bien'. Si ça marche → 'ou'.",
      astuce:
        "OÙ accent = lieu (Il est OÙ ?). OU sans accent = ou bien (café OU thé). SI = condition/question.",
    },
  },
  {
    question: "Choisissez : '___ amis ___ beaucoup ri hier soir.'",
    options: ["Ses / ont", "Ces / ont", "Ses / on", "Ces / on"],
    answer: "Ses / ont",
    fiche: {
      regle:
        "'Ses' = possessif pluriel (ses amis = les amis de quelqu'un). 'Ces' = démonstratif pluriel (ces amis-là). 'Ont' = ils ont.",
      exemple:
        "✅ SES amis (= les amis de lui/elle). CES amis (= ces amis que tu vois). Ils ONT ri → ont.",
      piege:
        "Ses/ces se distinguent par le sens : ses = possession, ces = désignation. Ont/on : ils ont ri → ont.",
      astuce:
        "SES = les siens (possession). CES = ceux-là (désignation). Pour ont/on : remplace par 'ils ont' ou 'il'.",
    },
  },
  {
    question: "Complétez : 'Elle ___ regarde dans le miroir et ___ coiffe.'",
    options: ["se / se", "ce / se", "se / ce", "ce / ce"],
    answer: "se / se",
    fiche: {
      regle:
        "'Se' = pronom réfléchi des verbes pronominaux (se regarder, se coiffer). 'Ce' = démonstratif ou pronom neutre.",
      exemple:
        "✅ Elle SE regarde (verbe pronominal se regarder). Elle SE coiffe (verbe pronominal se coiffer). Les deux = SE.",
      piege:
        "Quand le sujet fait l'action sur lui-même → SE. 'Ce' ne précède pas un verbe directement.",
      astuce:
        "SE + verbe = action réfléchie. Elle SE regarde = elle regarde ELLE-MÊME. Toujours SE devant un verbe pronominal.",
    },
  },
  {
    question: "Choisissez : '___ que tu dis est vrai, ___ il faut le prouver.'",
    options: ["Ce / mais", "Se / mais", "Ce / met", "Se / met"],
    answer: "Ce / mais",
    fiche: {
      regle:
        "'Ce que' = pronom démonstratif neutre (= la chose que). 'Mais' = conjonction d'opposition. 'Met' = verbe mettre.",
      exemple:
        "✅ CE que tu dis (= la chose que tu dis). MAIS il faut... (= cependant, or, pourtant).",
      piege:
        "'Mais' vs 'met' : mais = conjonction, met = verbe (il met son manteau). Teste si c'est un verbe ou une liaison.",
      astuce:
        "MAIS = cependant/pourtant (conjonction). MET = il pose/place (verbe mettre). CE que = la chose que.",
    },
  },
  {
    question: "Complétez : 'Il ___ levé tôt et ___ habillé rapidement.'",
    options: [
      "s'est / s'est",
      "c'est / c'est",
      "s'est / c'est",
      "c'est / s'est",
    ],
    answer: "s'est / s'est",
    fiche: {
      regle:
        "'S'est' = pronom se + auxiliaire est (verbe pronominal au passé composé). 'C'est' = pronom ce + est (= cela est).",
      exemple:
        "✅ Il S'EST levé (= il s'est levé, verbe pronominal). IL S'EST habillé (idem). C'EST beau (= cela est beau).",
      piege:
        "S'est précède un participe passé (levé, habillé). C'est précède un adjectif ou un nom.",
      astuce:
        "S'EST + participe passé = passé composé pronominal. C'EST + adjectif/nom = identification. S'est levé vs C'est beau.",
    },
  },
  {
    question: "Choisissez : '___ élèves ___ appliqués.'",
    options: ["Ces / sont", "Ses / sont", "Ces / son", "Ses / son"],
    answer: "Ces / sont",
    fiche: {
      regle:
        "'Ces' = démonstratif pluriel. 'Sont' = verbe être (ils sont). 'Son' = possessif singulier (son livre). 'Ses' = possessif pluriel.",
      exemple:
        "✅ CES élèves (= ces élèves-là, démonstratif pluriel). Ils SONT appliqués (= ils sont, verbe être).",
      piege:
        "Son/sont : remplace par 'étaient'. Si ça marche → 'sont'. Sinon → 'son'. Ces/ses : cherche si c'est une possession.",
      astuce:
        "SONT = étaient (verbe). SON = sien (possession). CES = ceux-là (démonstratif). SES = les siens (possessif pluriel).",
    },
  },
  {
    question: "Complétez : 'Tu peux venir chez moi, ___ tu veux.'",
    options: ["si", "s'il", "s'y", "si y"],
    answer: "si",
    fiche: {
      regle:
        "'Si' = conjonction de condition (si tu veux = dans le cas où tu veux). 'S'il' = si + il (pronom). 'S'y' = se + y.",
      exemple:
        "✅ Si TU veux (condition avec sujet 'tu'). S'IL vient (si + il). Il S'Y habitue (se + y = à cela).",
      piege:
        "Si devant 'il' ou 'ils' → s'il, s'ils (élision). Si devant tous les autres pronoms → si (pas d'élision).",
      astuce:
        "SI + il = s'il. SI + tu = si tu. SI + elle = si elle. Élision SEULEMENT devant IL et ILS.",
    },
  },
];

export default function LesHomophonesPage() {
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
          <div className="lecon-badge">✏️ Français — 5ème</div>
          <h1 className="lecon-titre">Les homophones</h1>
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
            Les <strong>homophones</strong> sont des mots qui se prononcent de
            la même façon mais s'écrivent différemment. Maîtrise-les pour ne
            plus faire d'erreurs !
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
                🔤 a / à — on / ont — son / sont
              </div>
              <div className="lecon-point-texte">
                A = avait (verbe). À = préposition. On = il/elle. Ont = ils ont.
                Son = sien. Sont = ils sont.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Astuce :</span> Remplace par
                'avait' (a/à), par 'ils ont' (on/ont), par 'étaient' (son/sont).
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔤 ce / se — ou / où — si / s'il
              </div>
              <div className="lecon-point-texte">
                Ce = démonstratif. Se = réfléchi. Ou = ou bien. Où = lieu. Si =
                condition. S'il = si + il.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Astuce :</span> Ou = ou bien. Où
                = là où. Se précède un verbe pronominal.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                🔤 ces / ses — mais / met — s'est / c'est
              </div>
              <div className="lecon-point-texte">
                Ces = démonstratif pluriel. Ses = possessif pluriel. Mais =
                cependant. Met = verbe mettre. S'est = verbe pronominal PC.
                C'est = cela est.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Astuce :</span> S'est +
                participe passé. C'est + nom/adjectif.
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
