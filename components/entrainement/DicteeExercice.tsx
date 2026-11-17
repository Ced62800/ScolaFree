"use client";

import { useDecouverte } from "@/components/DecouverteContext";
import {
  corrigerTexte,
  resumeErreurs,
  type MotCorrige,
  type TypeErreur,
} from "@/lib/entrainement/correction";
import { getNotion } from "@/lib/entrainement/notions";
import type { Dictee } from "@/lib/entrainement/types";
import { LIBELLES_CLASSES } from "@/lib/entrainement/types";
import { saveScore } from "@/lib/scores";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const ACCENT = "#f4a261";

const COULEURS: Record<TypeErreur, string> = {
  orthographe: "#ff6b6b",
  majuscule: "#ffa94d",
  ponctuation: "#b197fc",
};

type Etape = "intro" | "ecriture" | "resultat";

export default function DicteeExercice({ dictee }: { dictee: Dictee }) {
  const { estConnecte } = useDecouverte();
  const theme = `dictee-${dictee.id}`;

  const [etape, setEtape] = useState<Etape>("intro");
  const [index, setIndex] = useState(0);
  const [saisies, setSaisies] = useState<string[]>(() =>
    dictee.phrases.map(() => ""),
  );
  const [audioIndispo, setAudioIndispo] = useState(false);
  const [enLecture, setEnLecture] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scoreSaved = useRef(false);

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

  const corrections = useMemo(
    () =>
      etape === "resultat"
        ? dictee.phrases.map((p, i) => corrigerTexte(p.texte, saisies[i]))
        : [],
    [etape, dictee, saisies],
  );

  const bilan = useMemo(() => {
    const somme = (cle: "nbMotsAttendus" | "nbMotsJustes" | "nbOrthographe" | "nbMajuscule" | "nbPonctuation") =>
      corrections.reduce((acc, c) => acc + c[cle], 0);
    return {
      total: somme("nbMotsAttendus"),
      justes: somme("nbMotsJustes"),
      nbOrthographe: somme("nbOrthographe"),
      nbMajuscule: somme("nbMajuscule"),
      nbPonctuation: somme("nbPonctuation"),
    };
  }, [corrections]);

  useEffect(() => {
    if (etape !== "resultat" || scoreSaved.current || !estConnecte) return;
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
    setSaisies((s) => s.map((v, i) => (i === index ? valeur : v)));
  };

  const recommencer = () => {
    setSaisies(dictee.phrases.map(() => ""));
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

  // --- Étape 1 : présentation et écoute complète ---
  if (etape === "intro") {
    return (
      <div style={styles.page}>
        <div style={styles.conteneur}>
          <Link href="/entrainement" style={styles.retour}>
            ← Entraînement
          </Link>
          {titre}
          {messageAudio}
          <div style={styles.carte}>
            <p style={styles.texte}>
              1. Écoute d&apos;abord toute la dictée, sans écrire.
              <br />
              2. Ensuite, écris-la phrase par phrase. Tu peux réécouter chaque
              phrase autant de fois que tu veux.
              <br />
              3. Pense aux majuscules et à la ponctuation : elles comptent !
            </p>
          </div>
          <div style={styles.ligneBoutons}>
            <button
              onClick={() => jouer(dictee.audioComplet)}
              style={styles.boutonSecondaireBtn}
            >
              {enLecture ? "🔊 Lecture..." : "▶ Écouter toute la dictée"}
            </button>
            <button onClick={() => setEtape("ecriture")} style={styles.boutonPrincipal}>
              Commencer à écrire →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Étape 3 : correction ---
  if (etape === "resultat") {
    const pourcentage = bilan.total > 0 ? Math.round((bilan.justes / bilan.total) * 100) : 0;
    const couleur =
      pourcentage >= 80 ? "#2ec4b6" : pourcentage >= 50 ? "#ffd166" : "#ff6b6b";
    return (
      <div style={styles.page}>
        <div style={styles.conteneur}>
          <Link href="/entrainement" style={styles.retour}>
            ← Entraînement
          </Link>
          {titre}

          <div style={{ ...styles.carte, textAlign: "center", border: `2px solid ${couleur}40` }}>
            <div style={{ fontSize: "2.4rem", fontWeight: 900, color: couleur }}>
              {bilan.justes}/{bilan.total}
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: "0 0 10px" }}>
              mots écrits sans erreur
            </p>
            <p style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>
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

          <div style={styles.legende}>
            <span style={{ color: COULEURS.orthographe }}>■ orthographe</span>
            <span style={{ color: COULEURS.majuscule }}>■ majuscule</span>
            <span style={{ color: COULEURS.ponctuation }}>■ ponctuation</span>
          </div>

          {corrections.map((c, i) => (
            <div key={i} style={{ ...styles.carte, textAlign: "left" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "0 0 6px" }}>
                Phrase {i + 1}
              </p>
              <p style={{ margin: 0, lineHeight: 2 }}>
                {c.mots.map((mot, j) => (
                  <MotAffiche key={j} mot={mot} />
                ))}
              </p>
              {c.mots.some((m) => m.erreurs.length > 0) && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", margin: "8px 0 0" }}>
                  ✏️ Correction : {dictee.phrases[i].texte}
                </p>
              )}
            </div>
          ))}

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

  // --- Étape 2 : écriture phrase par phrase ---
  if (!phrase) return null;

  return (
    <div style={styles.page}>
      <div style={styles.conteneur}>
        <Link href="/entrainement" style={styles.retour}>
          ← Entraînement
        </Link>
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
              width: `${(index / dictee.phrases.length) * 100}%`,
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
          placeholder="Écris la phrase ici..."
          rows={3}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          style={styles.zoneTexte}
        />

        <div style={{ ...styles.ligneBoutons, marginTop: "14px" }}>
          {index > 0 && (
            <button onClick={() => setIndex((i) => i - 1)} style={styles.boutonSecondaireBtn}>
              ← Phrase précédente
            </button>
          )}
          <button
            onClick={() => (derniere ? setEtape("resultat") : setIndex((i) => i + 1))}
            style={styles.boutonPrincipal}
          >
            {derniere ? "Corriger ma dictée ✓" : "Phrase suivante →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MotAffiche({ mot }: { mot: MotCorrige }) {
  const espace = " ";
  // Mot oublié : on montre le mot attendu barré en pointillés
  if (mot.saisi === null) {
    return (
      <>
        <span
          title="Mot oublié"
          style={{
            color: COULEURS.orthographe,
            border: `1px dashed ${COULEURS.orthographe}`,
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
  // Mot en trop
  if (mot.attendu === null) {
    return (
      <>
        <span
          title="Mot en trop"
          style={{ color: COULEURS.orthographe, textDecoration: "line-through", fontSize: "0.95rem" }}
        >
          {mot.saisi}
        </span>
        {espace}
      </>
    );
  }
  if (mot.erreurs.length === 0) {
    return (
      <>
        <span style={{ color: "#fff", fontSize: "0.95rem" }}>{mot.saisi}</span>
        {espace}
      </>
    );
  }
  const couleur = COULEURS[mot.erreurs[0]];
  return (
    <>
      <span
        title={mot.erreurs.join(", ")}
        style={{
          color: couleur,
          borderBottom: `2px solid ${couleur}`,
          fontWeight: 700,
          fontSize: "0.95rem",
        }}
      >
        {mot.saisi}
      </span>
      <small style={{ color: "rgba(255,255,255,0.6)", marginLeft: "3px" }}>
        ({mot.attendu})
      </small>
      {espace}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f0f23",
    padding: "80px 20px 16px 20px",
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
  texte: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.9rem",
    lineHeight: 1.8,
    margin: 0,
  },
  legende: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
    fontSize: "0.78rem",
    marginBottom: "12px",
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
