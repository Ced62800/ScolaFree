"use client";

import { useClasseEleve } from "@/components/entrainement/useClasseEleve";
import { DICTEES } from "@/lib/entrainement/dictees";
import { getNotion } from "@/lib/entrainement/notions";
import { SERIES } from "@/lib/entrainement/series";
import type { Classe, Dictee, Serie } from "@/lib/entrainement/types";
import { LIBELLES_CLASSES } from "@/lib/entrainement/types";
import Link from "next/link";

const ACCENT = "#f4a261";
const ORDRE: Classe[] = ["cp", "ce1", "ce2", "cm1", "cm2", "6eme", "5eme", "4eme", "3eme"];

function CarteSerie({ serie }: { serie: Serie }) {
  const notion = getNotion(serie.notion);
  return (
    <Link href={`/entrainement/series/${serie.id}`} style={{ textDecoration: "none" }}>
      <div style={styles.carte}>
        <span style={{ fontSize: "1.2rem" }}>{notion?.emoji ?? "✏️"}</span>
        <div style={{ flex: 1 }}>
          <div style={styles.titreCarte}>{serie.titre}</div>
          <div style={styles.sousTitre}>
            {serie.nbQuestions} questions ·{" "}
            {serie.classes.map((c) => LIBELLES_CLASSES[c]).join(" - ")}
          </div>
        </div>
        <span style={styles.fleche}>→</span>
      </div>
    </Link>
  );
}

function CarteDictee({ dictee }: { dictee: Dictee }) {
  return (
    <Link href={`/entrainement/dictees/${dictee.id}`} style={{ textDecoration: "none" }}>
      <div style={styles.carte}>
        <span style={{ fontSize: "1.2rem" }}>🎧</span>
        <div style={{ flex: 1 }}>
          <div style={styles.titreCarte}>{dictee.titre}</div>
          <div style={styles.sousTitre}>
            {dictee.phrases.length} phrases · {LIBELLES_CLASSES[dictee.classe]}
          </div>
        </div>
        <span style={styles.fleche}>→</span>
      </div>
    </Link>
  );
}

export default function EntrainementPage() {
  const { classe } = useClasseEleve();

  const seriesClasse = classe
    ? SERIES.filter((s) => (s.classes as string[]).includes(classe))
    : [];
  const dicteesClasse = classe ? DICTEES.filter((d) => d.classe === classe) : [];
  const aMettreEnAvant = seriesClasse.length + dicteesClasse.length > 0;

  // Séries regroupées par notion
  const notionsIds = [...new Set(SERIES.map((s) => s.notion))];
  // Dictées regroupées par classe, dans l'ordre scolaire
  const classesDictees = ORDRE.filter((c) => DICTEES.some((d) => d.classe === c));

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <Link href="/cours" style={styles.retour}>
          ← Retour
        </Link>

        <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
          🏋️ Entraînement
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "24px" }}>
          Des séries courtes et des dictées pour t&apos;exercer en orthographe.
          Tout est accessible, à ton rythme.
        </p>

        {aMettreEnAvant && classe && (
          <section style={{ marginBottom: "28px" }}>
            <p style={styles.rubrique}>
              ⭐ Pour ta classe ({LIBELLES_CLASSES[classe as Classe] ?? classe})
            </p>
            <div style={styles.liste}>
              {seriesClasse.map((s) => (
                <CarteSerie key={s.id} serie={s} />
              ))}
              {dicteesClasse.map((d) => (
                <CarteDictee key={d.id} dictee={d} />
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: "28px" }}>
          <p style={styles.rubrique}>✏️ Séries par notion</p>
          {notionsIds.map((id) => {
            const notion = getNotion(id);
            return (
              <div key={id} style={{ marginBottom: "14px" }}>
                <div style={styles.enteteNotion}>
                  <span>
                    {notion?.emoji} {notion?.titre ?? id}
                  </span>
                  {notion && (
                    <Link href={notion.fiche} style={{ color: ACCENT, fontSize: "0.78rem" }}>
                      Voir la règle
                    </Link>
                  )}
                </div>
                <div style={styles.liste}>
                  {SERIES.filter((s) => s.notion === id).map((s) => (
                    <CarteSerie key={s.id} serie={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section>
          <p style={styles.rubrique}>🎧 Dictées par classe</p>
          {classesDictees.map((c) => (
            <div key={c} style={{ marginBottom: "14px" }}>
              <div style={styles.enteteNotion}>
                <span>{LIBELLES_CLASSES[c]}</span>
              </div>
              <div style={styles.liste}>
                {DICTEES.filter((d) => d.classe === c).map((d) => (
                  <CarteDictee key={d.id} dictee={d} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a1a",
    padding: "80px 16px 24px 16px",
  },
  retour: {
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontSize: "0.85rem",
    display: "inline-block",
    marginBottom: "24px",
  },
  rubrique: {
    color: ACCENT,
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "10px",
  },
  enteteNotion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.92rem",
    marginBottom: "6px",
  },
  liste: { display: "flex", flexDirection: "column", gap: "8px" },
  carte: {
    background: "rgba(244,162,97,0.08)",
    border: "1px solid rgba(244,162,97,0.35)",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  titreCarte: { color: ACCENT, fontWeight: 700, fontSize: "0.92rem" },
  sousTitre: { color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" },
  fleche: { color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" },
};
