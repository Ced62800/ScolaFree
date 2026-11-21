import type { Verbe } from "@/lib/entrainement/tableaux-conjugaison";

// Tableaux de conjugaison affichés dans les fiches Fondamentaux.
// terminaisons : colore la fin des formes (ce qui change), le début du verbe reste blanc.

const LIGNES = [
  { cle: "je", pronom: "je" },
  { cle: "tu", pronom: "tu" },
  { cle: "il", pronom: "il / elle" },
  { cle: "nous", pronom: "nous" },
  { cle: "vous", pronom: "vous" },
  { cle: "ils", pronom: "ils / elles" },
] as const;

// Le début commun à toutes les formes (« chant » pour chanter)
function debutCommun(formes: string[]): string {
  let debut = formes[0];
  for (const forme of formes) {
    while (!forme.startsWith(debut)) debut = debut.slice(0, -1);
  }
  return debut;
}

export default function TableauConjugaison({
  verbes,
  terminaisons = false,
}: {
  verbes: Verbe[];
  terminaisons?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "10px",
        marginBottom: "16px",
      }}
    >
      {verbes.map((verbe) => {
        const formes = LIGNES.map((l) => verbe[l.cle]);
        const debut = terminaisons ? debutCommun(formes) : "";
        return (
          <div
            key={verbe.infinitif}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "10px 14px",
            }}
          >
            <p
              style={{
                color: "#2ec4b6",
                fontWeight: 800,
                fontSize: "0.9rem",
                margin: "0 0 6px 0",
                textTransform: "capitalize",
              }}
            >
              {verbe.infinitif}
            </p>
            {LIGNES.map((ligne, i) => {
              const forme = formes[i];
              // « je » devient « j' » devant une voyelle ou un h muet
              const elision = ligne.cle === "je" && /^[aeiouyéèêâîôûh]/i.test(forme);
              return (
                <div
                  key={ligne.cle}
                  style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.88rem", lineHeight: 1.7 }}
                >
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    {elision ? "j'" : `${ligne.pronom} `}
                  </span>
                  {terminaisons && debut && forme.startsWith(debut) ? (
                    <>
                      {debut}
                      <strong style={{ color: "#f4a261" }}>{forme.slice(debut.length)}</strong>
                    </>
                  ) : (
                    <strong>{forme}</strong>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
