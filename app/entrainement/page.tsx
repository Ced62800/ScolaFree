"use client";

import { useClasseEleve } from "@/components/entrainement/useClasseEleve";
import { DICTEES } from "@/lib/entrainement/dictees";
import { getNotion } from "@/lib/entrainement/notions";
import { SERIES } from "@/lib/entrainement/series";
import type { Classe, Dictee, Famille, Serie } from "@/lib/entrainement/types";
import { LIBELLES_CLASSES, LIBELLES_FAMILLES } from "@/lib/entrainement/types";
import Link from "next/link";
import { useState } from "react";

const ACCENT = "#f4a261";
const ORDRE: Classe[] = ["cp", "ce1", "ce2", "cm1", "cm2", "6eme", "5eme", "4eme", "3eme"];
const ORDRE_FAMILLES: Famille[] = ["sons", "homophones", "accords", "conjugaison"];

// Filtres proposés : seulement les classes et familles qui ont du contenu.
const CLASSES_FILTRE = ORDRE.filter(
  (c) => SERIES.some((s) => s.classes.includes(c)) || DICTEES.some((d) => d.classe === c),
);
const FAMILLES_FILTRE = ORDRE_FAMILLES.filter((f) =>
  SERIES.some((s) => getNotion(s.notion)?.famille === f),
);

function Pastille({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      style={{
        ...styles.pastille,
        background: actif ? ACCENT : "rgba(244,162,97,0.08)",
        color: actif ? "#0a0a1a" : ACCENT,
      }}
    >
      {children}
    </button>
  );
}

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
  // Filtres de l'accueil : « null » = tout afficher
  const [filtreClasse, setFiltreClasse] = useState<Classe | null>(null);
  const [filtreFamille, setFiltreFamille] = useState<Famille | null>(null);

  const seriesClasse = classe
    ? SERIES.filter((s) => (s.classes as string[]).includes(classe))
    : [];
  const dicteesClasse = classe ? DICTEES.filter((d) => d.classe === classe) : [];
  const aMettreEnAvant = seriesClasse.length + dicteesClasse.length > 0;

  // Séries qui passent les filtres, regroupées par notion
  const seriesFiltrees = SERIES.filter(
    (s) =>
      (!filtreClasse || s.classes.includes(filtreClasse)) &&
      (!filtreFamille || getNotion(s.notion)?.famille === filtreFamille),
  );
  const notionsIds = [...new Set(seriesFiltrees.map((s) => s.notion))];
  // Dictées regroupées par classe, dans l'ordre scolaire (seul le filtre de classe s'applique)
  const dicteesFiltrees = DICTEES.filter((d) => !filtreClasse || d.classe === filtreClasse);
  const classesDictees = ORDRE.filter((c) => dicteesFiltrees.some((d) => d.classe === c));

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

        <section style={{ marginBottom: "20px" }}>
          <p style={styles.rubrique}>🔎 Filtrer</p>
          <div style={styles.lignePastilles}>
            <Pastille actif={filtreClasse === null} onClick={() => setFiltreClasse(null)}>
              Toutes les classes
            </Pastille>
            {CLASSES_FILTRE.map((c) => (
              <Pastille key={c} actif={filtreClasse === c} onClick={() => setFiltreClasse(c)}>
                {LIBELLES_CLASSES[c]}
              </Pastille>
            ))}
          </div>
          {FAMILLES_FILTRE.length > 1 && (
            <div style={styles.lignePastilles}>
              <Pastille actif={filtreFamille === null} onClick={() => setFiltreFamille(null)}>
                Tout
              </Pastille>
              {FAMILLES_FILTRE.map((f) => (
                <Pastille key={f} actif={filtreFamille === f} onClick={() => setFiltreFamille(f)}>
                  {LIBELLES_FAMILLES[f]}
                </Pastille>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: "28px" }}>
          <p style={styles.rubrique}>✏️ Séries par notion</p>
          {notionsIds.length === 0 && (
            <p style={styles.vide}>Pas encore de série pour ce choix. Elles arrivent bientôt !</p>
          )}
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
                  {seriesFiltrees.filter((s) => s.notion === id).map((s) => (
                    <CarteSerie key={s.id} serie={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section>
          <p style={styles.rubrique}>🎧 Dictées par classe</p>
          {classesDictees.length === 0 && (
            <p style={styles.vide}>Pas encore de dictée pour cette classe. Elles arrivent bientôt !</p>
          )}
          {classesDictees.map((c) => (
            <div key={c} style={{ marginBottom: "14px" }}>
              <div style={styles.enteteNotion}>
                <span>{LIBELLES_CLASSES[c]}</span>
              </div>
              <div style={styles.liste}>
                {dicteesFiltrees.filter((d) => d.classe === c).map((d) => (
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
  lignePastilles: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" },
  pastille: {
    border: "1px solid rgba(244,162,97,0.5)",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  vide: { color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" },
};
