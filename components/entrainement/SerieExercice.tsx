"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import { getNotion } from "@/lib/entrainement/notions";
import { verifierSaisie } from "@/lib/entrainement/saisie";
import type { Question, QuestionSaisie, Serie } from "@/lib/entrainement/types";
import { estSaisie, LIBELLES_CLASSES } from "@/lib/entrainement/types";
import { getLastScore, saveScore } from "@/lib/scores";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ACCENT = "#f4a261";

// Lettres proposées sous le champ de saisie (les accents sont pénibles à taper sur téléphone)
const LETTRES_ACCENTUEES = ["é", "è", "ê", "à", "â", "ç", "ù", "û", "î", "ô"];

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

type Etat = "attente" | "correct" | "incorrect";

// La phrase d'une question de saisie : un trou, puis le verbe (et le temps) entre parenthèses.
function PhraseAvecTrou({ question }: { question: QuestionSaisie }) {
  const [avant, apres = ""] = question.phrase.split("___");
  const indice = question.temps ? `${question.verbe}, ${question.temps}` : question.verbe;
  return (
    <>
      {avant}
      <span style={styles.trou}>{" ".repeat(8)}</span>{" "}
      <span style={styles.indice}>({indice})</span>
      {apres}
    </>
  );
}

export default function SerieExercice({ serie }: { serie: Serie }) {
  const notion = getNotion(serie.notion);
  const theme = `serie-${serie.id}`;
  const { estConnecte } = useDecouverte();

  // Mélange dans un useEffect (jamais dans l'initialiseur : ça casse l'hydratation)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [etat, setEtat] = useState<Etat>("attente");
  const [choixFait, setChoixFait] = useState<string | null>(null);
  // Questions de saisie : ce que l'élève a tapé, le message de correction, « Je ne sais pas »
  const [saisie, setSaisie] = useState("");
  const [retourSaisie, setRetourSaisie] = useState<string | null>(null);
  const [abandon, setAbandon] = useState(false);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [ancienScore, setAncienScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const champRef = useRef<HTMLInputElement | null>(null);
  const blocSaisieRef = useRef<HTMLDivElement | null>(null);
  const retourRef = useRef<HTMLDivElement | null>(null);

  const total = Math.min(serie.nbQuestions, serie.questions.length);

  useEffect(() => {
    setQuestions(melanger(serie.questions).slice(0, total));
  }, [serie, total]);

  useEffect(() => {
    getLastScore("entrainement", "francais", theme).then(setAncienScore);
  }, [theme]);

  useEffect(() => {
    if (!termine || scoreSaved.current || !estConnecte) return;
    scoreSaved.current = true;
    saveScore({
      classe: "entrainement",
      matiere: "francais",
      theme,
      score: scoreRef.current,
      total,
    });
  }, [termine, estConnecte, theme, total]);

  const question = questions[index];
  const questionSaisie = question && estSaisie(question) ? question : null;

  // Sur ordinateur, le curseur est déjà dans le champ. Sur téléphone, on n'ouvre pas le
  // clavier tout seul : il cacherait la règle et la phrase. L'enfant touche le champ.
  useEffect(() => {
    if (!questionSaisie || etat !== "attente") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    champRef.current?.focus();
  }, [questionSaisie, etat]);

  // Quand le clavier du téléphone s'ouvre, on remet le champ dans la zone visible.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const amener = () => {
      if (document.activeElement === champRef.current) {
        blocSaisieRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    vv.addEventListener("resize", amener);
    return () => vv.removeEventListener("resize", amener);
  }, []);

  // Après la validation, le clavier se ferme : on amène la correction à l'écran.
  useEffect(() => {
    if (!questionSaisie || etat === "attente") return;
    retourRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [questionSaisie, etat]);

  const repondre = (choix: string) => {
    if (etat !== "attente" || !question || estSaisie(question)) return;
    setChoixFait(choix);
    if (choix === question.reponse) {
      setEtat("correct");
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      setEtat("incorrect");
    }
  };

  const valider = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (etat !== "attente" || !questionSaisie || saisie.trim() === "") return;
    const resultat = verifierSaisie(questionSaisie, saisie);
    champRef.current?.blur(); // ferme le clavier du téléphone
    if (resultat.verdict === "correct") {
      setEtat("correct");
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      setEtat("incorrect");
      setRetourSaisie(resultat.message);
    }
  };

  // « Je ne sais pas » : la question compte comme fausse, la bonne réponse s'affiche.
  const passer = () => {
    if (etat !== "attente" || !questionSaisie) return;
    champRef.current?.blur();
    setAbandon(true);
    setRetourSaisie(null);
    setEtat("incorrect");
  };

  const insererLettre = (lettre: string) => {
    const champ = champRef.current;
    if (!champ || etat !== "attente") return;
    const debut = champ.selectionStart ?? saisie.length;
    const fin = champ.selectionEnd ?? saisie.length;
    setSaisie(saisie.slice(0, debut) + lettre + saisie.slice(fin));
    requestAnimationFrame(() => {
      champ.focus();
      champ.setSelectionRange(debut + lettre.length, debut + lettre.length);
    });
  };

  const reinitialiserQuestion = () => {
    setEtat("attente");
    setChoixFait(null);
    setSaisie("");
    setRetourSaisie(null);
    setAbandon(false);
  };

  const suivant = () => {
    if (index + 1 >= questions.length) {
      setTermine(true);
    } else {
      setIndex((i) => i + 1);
      reinitialiserQuestion();
    }
  };

  const recommencer = () => {
    if (estConnecte && scoreSaved.current) {
      // Le score de la partie précédente devient le « score précédent »
      setAncienScore({ score: scoreRef.current, total });
    }
    setQuestions(melanger(serie.questions).slice(0, total));
    setIndex(0);
    reinitialiserQuestion();
    scoreRef.current = 0;
    setScore(0);
    setTermine(false);
    scoreSaved.current = false;
  };

  const niveau = serie.classes.map((c) => LIBELLES_CLASSES[c]).join(" - ");

  if (termine) {
    const pourcentage = Math.round((score / total) * 100);
    const couleur =
      pourcentage >= 80 ? "#2ec4b6" : pourcentage >= 50 ? "#ffd166" : "#ff6b6b";
    return (
      <div style={styles.page}>
        <div style={{ ...styles.carteResultat, border: `2px solid ${couleur}40` }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
            {pourcentage >= 80 ? "🎉" : pourcentage >= 50 ? "💪" : "📖"}
          </div>
          <h2 style={styles.titreResultat}>Série terminée !</h2>
          <div style={{ fontSize: "2.8rem", fontWeight: 900, color: couleur, margin: "16px 0" }}>
            {score}/{total}
          </div>
          {ancienScore !== null && (
            <p style={styles.petitGris}>
              Score précédent : {ancienScore.score}/{ancienScore.total}
            </p>
          )}
          {!estConnecte && (
            <p style={{ color: "#ffd166", fontSize: "0.8rem", marginBottom: "16px" }}>
              💡{" "}
              <Link href="/connexion" style={{ color: "#ffd166" }}>
                Connecte-toi
              </Link>{" "}
              pour garder ton score
            </p>
          )}
          <div style={styles.ligneBoutons}>
            <button onClick={recommencer} style={styles.boutonPrincipal}>
              🔄 Recommencer
            </button>
            {notion && (
              <Link href={notion.fiche} style={styles.boutonSecondaire}>
                📘 Revoir la règle
              </Link>
            )}
            <Link href="/entrainement" style={styles.boutonSecondaire}>
              ← Entraînement
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const couleurChamp =
    etat === "correct" ? "#2ec4b6" : etat === "incorrect" ? "#ff6b6b" : "rgba(255,255,255,0.25)";

  return (
    <div
      style={{
        ...styles.page,
        // Place sous le contenu pour pouvoir le remonter au-dessus du clavier du téléphone
        ...(questionSaisie ? { paddingBottom: "min(45vh, 320px)" } : {}),
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <Link href="/entrainement" style={styles.retour}>
          ← Entraînement
        </Link>

        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h1 style={{ color: ACCENT, fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
            {notion?.emoji} {serie.titre}
          </h1>
          <span style={styles.etiquette}>{niveau}</span>
        </div>

        <div style={styles.encadreRegle}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
            💡 {serie.microRegle}
          </p>
          {notion && (
            <Link href={notion.fiche} style={{ color: ACCENT, fontSize: "0.8rem", fontWeight: 700 }}>
              Revoir la règle complète →
            </Link>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Question {index + 1}/{questions.length}
          </span>
          <span style={{ color: ACCENT, fontWeight: 700, fontSize: "0.85rem" }}>
            Score : {score}
          </span>
        </div>

        <div style={styles.barreFond}>
          <div
            style={{
              ...styles.barre,
              width: `${(index / questions.length) * 100}%`,
            }}
          />
        </div>

        <div style={styles.cartePhrase}>
          <p style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            {questionSaisie ? <PhraseAvecTrou question={questionSaisie} /> : question.phrase}
          </p>
        </div>

        {estSaisie(question) ? (
          <form onSubmit={valider} style={{ marginBottom: "16px" }}>
            <div ref={blocSaisieRef} style={styles.blocSaisie}>
              <input
                ref={champRef}
                type="text"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                onFocus={() =>
                  window.setTimeout(
                    () => blocSaisieRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
                    300,
                  )
                }
                disabled={etat !== "attente"}
                aria-label="Ta réponse"
                lang="fr"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                maxLength={40}
                placeholder="Écris ta réponse"
                style={{ ...styles.champ, border: `2px solid ${couleurChamp}`, color: etat === "attente" ? "#fff" : couleurChamp }}
              />
              {etat === "attente" && (
                <>
                  <div style={styles.rangeeLettres}>
                    {LETTRES_ACCENTUEES.map((lettre) => (
                      <button
                        key={lettre}
                        type="button"
                        // Garde le curseur dans le champ : le clavier ne se ferme pas
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insererLettre(lettre)}
                        aria-label={`Ajouter ${lettre}`}
                        style={styles.boutonLettre}
                      >
                        {lettre}
                      </button>
                    ))}
                  </div>
                  <div style={styles.ligneBoutons}>
                    <button
                      type="submit"
                      disabled={saisie.trim() === ""}
                      style={{ ...styles.boutonPrincipal, opacity: saisie.trim() === "" ? 0.5 : 1 }}
                    >
                      Valider
                    </button>
                    <button type="button" onClick={passer} style={styles.boutonPasser}>
                      Je ne sais pas
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
            {question.choix.map((choix) => {
              let bg = "rgba(255,255,255,0.07)";
              let bord = "rgba(255,255,255,0.15)";
              let texte = "#fff";
              if (etat !== "attente" && choix === question.reponse) {
                bg = "rgba(46,196,182,0.2)";
                bord = "#2ec4b6";
                texte = "#2ec4b6";
              } else if (etat !== "attente" && choix === choixFait) {
                bg = "rgba(255,107,107,0.2)";
                bord = "#ff6b6b";
                texte = "#ff6b6b";
              }
              return (
                <button
                  key={choix}
                  onClick={() => repondre(choix)}
                  disabled={etat !== "attente"}
                  style={{
                    background: bg,
                    border: `2px solid ${bord}`,
                    color: texte,
                    padding: "10px 24px",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    cursor: etat === "attente" ? "pointer" : "default",
                    minWidth: "110px",
                  }}
                >
                  {choix}
                </button>
              );
            })}
          </div>
        )}

        {etat !== "attente" && (
          <>
            <div
              ref={retourRef}
              aria-live="polite"
              style={{
                background: etat === "correct" ? "rgba(46,196,182,0.1)" : "rgba(255,107,107,0.1)",
                border: `1px solid ${etat === "correct" ? "#2ec4b6" : "#ff6b6b"}40`,
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: etat === "correct" ? "#2ec4b6" : "#ff6b6b",
                  fontWeight: 700,
                  marginBottom: "4px",
                  fontSize: "0.95rem",
                }}
              >
                {etat === "correct"
                  ? "✅ Bonne réponse !"
                  : abandon
                    ? "💭 Voici la réponse"
                    : "❌ Pas tout à fait..."}
              </p>
              {etat === "incorrect" && choixFait && question.erreurs?.[choixFait] && (
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", margin: "0 0 6px 0" }}>
                  Tu as mis « {choixFait} » ? {question.erreurs[choixFait]}
                </p>
              )}
              {etat === "incorrect" && questionSaisie && retourSaisie && (
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", margin: "0 0 6px 0" }}>
                  {retourSaisie}
                </p>
              )}
              {etat === "incorrect" && questionSaisie && (
                <p style={{ color: "#fff", fontSize: "0.95rem", margin: "0 0 6px 0" }}>
                  La bonne réponse : « <strong>{questionSaisie.reponse}</strong> »
                </p>
              )}
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0 }}>
                {question.explication}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <button onClick={suivant} style={styles.boutonPrincipal}>
                {index + 1 >= questions.length ? "Voir mon score" : "Question suivante →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f0f23",
    padding: "80px 20px 16px 20px",
  },
  retour: {
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontSize: "0.9rem",
    display: "inline-block",
    marginBottom: "16px",
  },
  etiquette: {
    display: "inline-block",
    background: "rgba(244,162,97,0.15)",
    border: "1px solid rgba(244,162,97,0.4)",
    color: ACCENT,
    borderRadius: "999px",
    padding: "2px 10px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  encadreRegle: {
    background: "rgba(244,162,97,0.08)",
    border: "1px solid rgba(244,162,97,0.3)",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  barreFond: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "6px",
    height: "6px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  barre: {
    background: `linear-gradient(90deg, ${ACCENT}, #ffd166)`,
    height: "100%",
    transition: "width 0.3s",
    borderRadius: "6px",
  },
  cartePhrase: {
    background: "rgba(255,255,255,0.05)",
    border: "2px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "20px 16px",
    textAlign: "center",
    marginBottom: "16px",
  },
  trou: {
    display: "inline-block",
    borderBottom: "3px solid rgba(255,255,255,0.6)",
    verticalAlign: "baseline",
    lineHeight: 1,
  },
  indice: {
    color: ACCENT,
    fontSize: "0.95rem",
    fontStyle: "italic",
  },
  blocSaisie: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    scrollMarginTop: "90px",
  },
  champ: {
    width: "100%",
    maxWidth: "360px",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "12px 14px",
    // 16 px minimum : en dessous, le navigateur de l'iPhone zoome sur le champ
    fontSize: "1.15rem",
    fontWeight: 700,
    textAlign: "center",
    outline: "none",
  },
  rangeeLettres: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
  },
  boutonLettre: {
    width: "42px",
    height: "42px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 700,
    cursor: "pointer",
    touchAction: "manipulation",
  },
  boutonPasser: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "rgba(255,255,255,0.7)",
    padding: "12px 20px",
    borderRadius: "14px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  carteResultat: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "24px",
    padding: "40px 28px",
    maxWidth: "480px",
    width: "100%",
    margin: "0 auto",
    textAlign: "center",
  },
  titreResultat: {
    color: "#fff",
    fontSize: "1.5rem",
    fontWeight: 800,
    marginBottom: "8px",
  },
  petitGris: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  ligneBoutons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  boutonPrincipal: {
    background: `linear-gradient(135deg, ${ACCENT}, #e76f51)`,
    border: "none",
    color: "#fff",
    padding: "12px 28px",
    borderRadius: "14px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  boutonSecondaire: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "14px",
    fontSize: "0.95rem",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
};
