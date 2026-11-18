"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import {
  corrigerTexte,
  expliquerMot,
  resumeErreurs,
  type Explication,
  type MotCorrige,
  type ResultatCorrection,
} from "@/lib/entrainement/correction";
import { getNotion } from "@/lib/entrainement/notions";
import type { Dictee } from "@/lib/entrainement/types";
import { LIBELLES_CLASSES } from "@/lib/entrainement/types";
import { saveScore } from "@/lib/scores";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const ACCENT = "#f4a261";
const VERT = "#4ade80";
const ROUGE = "#ff6b6b";

type Etape = "intro" | "ecriture" | "bilan";

export default function DicteeExercice({ dictee }: { dictee: Dictee }) {
  const { estConnecte } = useDecouverte();
  const theme = `dictee-${dictee.id}`;

  const [etape, setEtape] = useState<Etape>("intro");
  const [index, setIndex] = useState(0);
  const [saisies, setSaisies] = useState<string[]>(() =>
    dictee.phrases.map(() => ""),
  );
  // Correction de chaque phrase, remplie au clic sur « Vérifier »
  const [corrections, setCorrections] = useState<(ResultatCorrection | null)[]>(
    () => dictee.phrases.map(() => null),
  );
  const [audioIndispo, setAudioIndispo] = useState(false);
  const [enLecture, setEnLecture] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const correctionRef = useRef<HTMLDivElement | null>(null);
  const scoreSaved = useRef(false);

  // Mots travaillés par la dictée (ex. « et », « est »)
  const motsNotion = useMemo(
    () => dictee.notions.flatMap((id) => getNotion(id)?.mots ?? []),
    [dictee],
  );

  // Lecteur audio unique (balise <audio>, pas de Web Speech API)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.onended = () => setEnLecture(false);
    audio.onerror = () => {
      setEnLecture(false);
      setAudioIndispo(true);
    };
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const jouer = (src: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    setEnLecture(true);
    audio.play().catch(() => {
      setEnLecture(false);
      setAudioIndispo(true);
    });
  };

  const arreterAudio = () => {
    audioRef.current?.pause();
    setEnLecture(false);
  };

  const correction = corrections[index];

  // Après « Vérifier », on fait défiler jusqu'à la correction (utile sur téléphone)
  useEffect(() => {
    if (correction && correctionRef.current) {
      correctionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [correction]);

  const bilan = useMemo(() => {
    const faites = corrections.filter((c): c is ResultatCorrection => c !== null);
    const somme = (
      cle: "nbMotsAttendus" | "nbMotsJustes" | "nbOrthographe" | "nbMajuscule" | "nbPonctuation",
    ) => faites.reduce((acc, c) => acc + c[cle], 0);
    // Mots à retenir : « mot écrit → bon mot », sans doublon
    const aRetenir: string[] = [];
    for (const c of faites) {
      for (const mot of c.mots) {
        if (mot.erreurs.length === 0) continue;
        const ligne =
          mot.saisi === null
            ? `(oublié) → ${mot.attendu}`
            : mot.attendu === null
              ? `${mot.saisi} → (en trop)`
              : `${mot.saisi} → ${mot.attendu}`;
        if (!aRetenir.includes(ligne)) aRetenir.push(ligne);
      }
    }
    return {
      total: somme("nbMotsAttendus"),
      justes: somme("nbMotsJustes"),
      nbOrthographe: somme("nbOrthographe"),
      nbMajuscule: somme("nbMajuscule"),
      nbPonctuation: somme("nbPonctuation"),
      aRetenir,
    };
  }, [corrections]);

  useEffect(() => {
    if (etape !== "bilan" || scoreSaved.current || !estConnecte) return;
    if (bilan.total === 0) return;
    scoreSaved.current = true;
    saveScore({
      classe: "entrainement",
      matiere: "francais",
      theme,
      score: bilan.justes,
      total: bilan.total,
    });
  }, [etape, estConnecte, bilan, theme]);

  const phrase = dictee.phrases[index];
  const derniere = index + 1 >= dictee.phrases.length;

  const majSaisie = (valeur: string) => {
    if (correction) return; // phrase déjà corrigée : non modifiable
    setSaisies((s) => s.map((v, i) => (i === index ? valeur : v)));
  };

  const verifier = () => {
    if (!phrase || correction || !saisies[index].trim()) return;
    arreterAudio();
    const resultat = corrigerTexte(phrase.texte, saisies[index]);
    setCorrections((c) => c.map((v, i) => (i === index ? resultat : v)));
  };

  const suivant = () => {
    arreterAudio();
    if (derniere) setEtape("bilan");
    else setIndex((i) => i + 1);
  };

  const recommencer = () => {
    arreterAudio();
    setSaisies(dictee.phrases.map(() => ""));
    setCorrections(dictee.phrases.map(() => null));
    setIndex(0);
    setEtape("intro");
    scoreSaved.current = false;
  };

  const titre = (
    <div style={{ textAlign: "center", marginBottom: "16px" }}>
      <h1 style={{ color: ACCENT, fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
        🎧 Dictée : {dictee.titre}
      </h1>
      <span style={styles.etiquette}>{LIBELLES_CLASSES[dictee.classe]}</span>
    </div>
  );

  const messageAudio = audioIndispo && (
    <div style={styles.alerte}>
      🔇 L&apos;audio de cette dictée n&apos;est pas encore disponible.
    </div>
  );

  const retour = (
    <Link href="/entrainement" style={styles.retour}>
      ← Entraînement
    </Link>
  );

  // --- Étape 1 : présentation et écoute complète ---
  if (etape === "intro") {
    return (
      <div style={styles.page}>
        <div style={styles.conteneur}>
          {retour}
          {titre}
          {messageAudio}
          <div style={styles.carte}>
            <p style={styles.texte}>
              1. Écoute d&apos;abord toute la dictée, sans écrire.
              <br />
              2. Ensuite, écris une phrase à la fois. Tu peux la réécouter
              autant de fois que tu veux.
              <br />
              3. Clique sur « Vérifier » : tu verras tout de suite tes erreurs,
              et pourquoi.
              <br />
              4. Pense aux majuscules et aux points : ils comptent !
            </p>
          </div>
          <div style={styles.ligneBoutons}>
            <button
              onClick={() => jouer(dictee.audioComplet)}
              style={styles.boutonSecondaireBtn}
            >
              {enLecture ? "🔊 Lecture..." : "▶ Écouter toute la dictée"}
            </button>
            <button
              onClick={() => {
                arreterAudio();
                setEtape("ecriture");
              }}
              style={styles.boutonPrincipal}
            >
              Commencer à écrire →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Étape 3 : bilan final ---
  if (etape === "bilan") {
    const pourcentage = bilan.total > 0 ? Math.round((bilan.justes / bilan.total) * 100) : 0;
    const couleur = pourcentage >= 80 ? VERT : pourcentage >= 50 ? "#ffd166" : ROUGE;
    return (
      <div style={styles.page}>
        <div style={styles.conteneur}>
          {retour}
          {titre}

          <div style={{ ...styles.carte, textAlign: "center", border: `2px solid ${couleur}40` }}>
            <div style={{ fontSize: "2.4rem" }}>
              {pourcentage >= 80 ? "🎉" : pourcentage >= 50 ? "💪" : "📖"}
            </div>
            <div style={{ fontSize: "2.4rem", fontWeight: 900, color: couleur }}>
              {bilan.justes}/{bilan.total}
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: "0 0 10px" }}>
              mots écrits sans erreur
            </p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", margin: 0 }}>
              {resumeErreurs(bilan)}
            </p>
            {!estConnecte && (
              <p style={{ color: "#ffd166", fontSize: "0.8rem", margin: "12px 0 0" }}>
                💡{" "}
                <Link href="/connexion" style={{ color: "#ffd166" }}>
                  Connecte-toi
                </Link>{" "}
                pour garder ton score
              </p>
            )}
          </div>

          <div style={styles.carte}>
            <p style={{ color: "#fff", fontWeight: 700, margin: "0 0 8px" }}>
              📌 Mots à retenir
            </p>
            {bilan.aRetenir.length === 0 ? (
              <p style={{ color: VERT, margin: 0, fontSize: "0.9rem" }}>
                Aucun ! Tu as tout écrit juste. Bravo !
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {bilan.aRetenir.map((ligne) => (
                  <li key={ligne} style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.8 }}>
                    {ligne}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={styles.ligneBoutons}>
            <button onClick={recommencer} style={styles.boutonPrincipal}>
              🔄 Recommencer
            </button>
            {dictee.notions.map((id) => {
              const notion = getNotion(id);
              return notion ? (
                <Link key={id} href={notion.fiche} style={styles.boutonSecondaire}>
                  📘 Revoir {notion.titre}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Étape 2 : une phrase à la fois, corrigée tout de suite ---
  if (!phrase) return null;

  return (
    <div style={styles.page}>
      <div style={styles.conteneur}>
        {retour}
        {titre}
        {messageAudio}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Phrase {index + 1}/{dictee.phrases.length}
          </span>
          <button
            onClick={() => jouer(dictee.audioComplet)}
            style={{ ...styles.lien, fontSize: "0.8rem" }}
          >
            Réécouter toute la dictée
          </button>
        </div>

        <div style={styles.barreFond}>
          <div
            style={{
              ...styles.barre,
              width: `${((index + (correction ? 1 : 0)) / dictee.phrases.length) * 100}%`,
            }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: "14px" }}>
          <button onClick={() => jouer(phrase.audio)} style={styles.boutonPrincipal}>
            {enLecture ? "🔊 Lecture..." : "▶ Écouter la phrase"}
          </button>
        </div>

        <textarea
          value={saisies[index]}
          onChange={(e) => majSaisie(e.target.value)}
          readOnly={correction !== null}
          placeholder="Écris la phrase ici..."
          rows={3}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          style={{
            ...styles.zoneTexte,
            ...(correction ? { opacity: 0.7, cursor: "default" } : {}),
          }}
        />

        {!correction && (
          <>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", textAlign: "center", margin: "12px 0" }}>
              👀 Relis bien ta phrase avant de vérifier.
            </p>
            <div style={styles.ligneBoutons}>
              <button
                onClick={verifier}
                disabled={!saisies[index].trim()}
                style={{
                  ...styles.boutonPrincipal,
                  ...(!saisies[index].trim() ? { opacity: 0.4, cursor: "default" } : {}),
                }}
              >
                Vérifier ✓
              </button>
            </div>
          </>
        )}

        {correction && (
          <div ref={correctionRef} style={{ marginTop: "16px" }}>
            <div style={styles.carte}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: "0 0 6px" }}>
                Correction
              </p>
              <p style={{ margin: 0, lineHeight: 2 }}>
                {correction.mots.map((mot, j) => (
                  <MotAffiche key={j} mot={mot} />
                ))}
              </p>
            </div>

            <EncadrePourquoi
              mots={correction.mots}
              aides={phrase.aides}
              motsNotion={motsNotion}
            />

            <div style={styles.ligneBoutons}>
              <button onClick={suivant} style={styles.boutonPrincipal}>
                {derniere ? "Voir mon bilan →" : "Phrase suivante →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Un mot dans la phrase corrigée : vert si juste, rouge si faux (+ le bon mot)
function MotAffiche({ mot }: { mot: MotCorrige }) {
  const espace = " ";
  if (mot.saisi === null) {
    return (
      <>
        <span
          style={{
            color: ROUGE,
            border: `1px dashed ${ROUGE}`,
            borderRadius: "6px",
            padding: "0 4px",
            fontSize: "0.9rem",
          }}
        >
          {mot.attendu} <small>(oublié)</small>
        </span>
        {espace}
      </>
    );
  }
  if (mot.attendu === null) {
    return (
      <>
        <span style={{ color: ROUGE, textDecoration: "line-through", fontSize: "0.95rem" }}>
          {mot.saisi}
        </span>
        {espace}
      </>
    );
  }
  if (mot.erreurs.length === 0) {
    return (
      <>
        <span style={{ color: VERT, fontSize: "0.95rem", fontWeight: 600 }}>{mot.saisi}</span>
        {espace}
      </>
    );
  }
  return (
    <>
      <span
        style={{
          color: ROUGE,
          borderBottom: `2px solid ${ROUGE}`,
          fontWeight: 700,
          fontSize: "0.95rem",
        }}
      >
        {mot.saisi}
      </span>
      <small style={{ color: "rgba(255,255,255,0.75)", marginLeft: "3px" }}>
        ({mot.attendu})
      </small>
      {espace}
    </>
  );
}

// Encadré « Pourquoi ? » : pour chaque erreur, ce qui a été écrit, le bon mot, l'explication.
// Les mots de la notion écrits juste reçoivent aussi leur explication, en vert.
function EncadrePourquoi({
  mots,
  aides,
  motsNotion,
}: {
  mots: MotCorrige[];
  aides?: Record<string, string>;
  motsNotion: string[];
}) {
  const lignes = mots
    .map((mot) => ({ mot, explications: expliquerMot(mot, { aides, motsNotion }) }))
    .filter((l) => l.explications.length > 0);

  const toutJuste = mots.every((m) => m.erreurs.length === 0);

  return (
    <div style={styles.encadrePourquoi}>
      <p style={{ color: "#fff", fontWeight: 800, margin: "0 0 10px", fontSize: "1rem" }}>
        🤔 Pourquoi ?
      </p>
      {toutJuste && (
        <p style={{ color: VERT, fontWeight: 700, margin: "0 0 10px" }}>
          Tout est juste. Bravo !
        </p>
      )}
      {lignes.map(({ mot, explications }, i) => (
        <div key={i} style={{ marginBottom: i < lignes.length - 1 ? "12px" : 0 }}>
          <p style={{ margin: "0 0 4px", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>
            {titreLigne(mot)}
          </p>
          {explications.map((e, k) => (
            <p key={k} style={{ ...styles.explication, color: couleurExplication(e) }}>
              {e.texte}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function titreLigne(mot: MotCorrige) {
  if (mot.saisi === null) {
    return (
      <>
        Tu as oublié : <strong style={{ color: ROUGE }}>{mot.attendu}</strong>
      </>
    );
  }
  if (mot.attendu === null) {
    return (
      <>
        Tu as écrit en trop : <strong style={{ color: ROUGE }}>{mot.saisi}</strong>
      </>
    );
  }
  if (mot.erreurs.length === 0) {
    return <strong style={{ color: VERT }}>✅ {mot.saisi}</strong>;
  }
  return (
    <>
      Tu as écrit <strong style={{ color: ROUGE }}>{mot.saisi}</strong>
      {" → on écrit "}
      <strong style={{ color: VERT }}>{mot.attendu}</strong>
    </>
  );
}

function couleurExplication(e: Explication): string {
  return e.ton === "erreur" ? "#ffb3b3" : VERT;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f0f23",
    padding: "80px 20px 24px 20px",
  },
  conteneur: { maxWidth: "680px", margin: "0 auto" },
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
  alerte: {
    background: "rgba(255,209,102,0.1)",
    border: "1px solid rgba(255,209,102,0.4)",
    color: "#ffd166",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.85rem",
    marginBottom: "14px",
    textAlign: "center",
  },
  carte: {
    background: "rgba(255,255,255,0.05)",
    border: "2px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "14px",
  },
  encadrePourquoi: {
    background: "rgba(244,162,97,0.08)",
    border: "2px solid rgba(244,162,97,0.35)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
  },
  explication: {
    margin: "0 0 2px 0",
    paddingLeft: "12px",
    borderLeft: "3px solid rgba(255,255,255,0.15)",
    fontSize: "0.88rem",
    lineHeight: 1.55,
  },
  texte: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.9rem",
    lineHeight: 1.8,
    margin: 0,
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
  zoneTexte: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    border: "2px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",
    color: "#fff",
    fontSize: "1.1rem",
    lineHeight: 1.6,
    padding: "14px",
    resize: "vertical",
    fontFamily: "inherit",
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
    padding: "12px 24px",
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
  boutonSecondaireBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "14px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  lien: {
    background: "none",
    border: "none",
    color: ACCENT,
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
  },
};
