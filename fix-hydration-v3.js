/**
 * fix-hydration-v3.js
 * Corrige l'erreur d'hydratation - pattern multiligne.
 * Lancer avec : node fix-hydration-v3.js
 */

const fs = require("fs");
const path = require("path");

const MATHS_DIR = path.join(__dirname, "app", "fondamentaux", "maths");

function lireFichier(fichier) {
  const buf = fs.readFileSync(fichier);
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.slice(2).toString("utf16le");
  if (buf[0] === 0xFE && buf[1] === 0xFF) return buf.slice(2).swap16().toString("utf16le");
  return buf.toString("utf8");
}

const fiches = fs
  .readdirSync(MATHS_DIR)
  .filter((f) => fs.statSync(path.join(MATHS_DIR, f)).isDirectory())
  .map((f) => path.join(MATHS_DIR, f, "page.tsx"))
  .filter((f) => fs.existsSync(f));

console.log(`\n📂 ${fiches.length} fiches trouvées\n`);

let modifiees = 0;

fiches.forEach((fichier) => {
  let lignes = lireFichier(fichier).split("\n");
  const nom = path.basename(path.dirname(fichier));
  let modifie = false;

  for (let i = 0; i < lignes.length; i++) {
    // Détecte la ligne qui commence le useState multiligne
    if (
      lignes[i].includes("useState(() =>") &&
      lignes[i].includes("setQuestions") &&
      !lignes[i].includes("melangerTableau")
    ) {
      // Cherche la ligne suivante avec melangerTableau
      if (i + 1 < lignes.length && lignes[i + 1].includes("melangerTableau")) {
        // Remplace les 2-3 lignes par l'initialisation vide + useEffect
        let j = i + 1;
        // Trouve la fin du useState (ligne avec );)
        while (j < lignes.length && !lignes[j].includes(");")) j++;

        // Remplace tout le bloc
        lignes.splice(i, j - i + 1,
          "  const [questions, setQuestions] = useState<typeof TOUTES_LES_QUESTIONS>([]);",
          "",
          "  useEffect(() => {",
          "    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));",
          "  }, []);",
        );
        modifie = true;
        break;
      }
    }
  }

  if (modifie) {
    fs.writeFileSync(fichier, lignes.join("\n"), "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — pattern non trouvé`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
