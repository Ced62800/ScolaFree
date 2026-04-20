/**
 * fix-hydration.js
 * Corrige l'erreur d'hydratation dans les fiches fondamentaux maths.
 * Remplace le useState avec melangerTableau par une initialisation vide
 * puis un useEffect qui mélange.
 * Lancer avec : node fix-hydration.js
 */

const fs = require("fs");
const path = require("path");

const MATHS_DIR = path.join(__dirname, "app", "fondamentaux", "maths");

const fiches = fs
  .readdirSync(MATHS_DIR)
  .filter((f) => fs.statSync(path.join(MATHS_DIR, f)).isDirectory())
  .map((f) => path.join(MATHS_DIR, f, "page.tsx"))
  .filter((f) => fs.existsSync(f));

console.log(`\n📂 ${fiches.length} fiches trouvées\n`);

let modifiees = 0;

fiches.forEach((fichier) => {
  let lignes = fs.readFileSync(fichier, "utf8").split("\n");
  const nom = path.basename(path.dirname(fichier));
  let modifie = false;

  // Cherche la ligne avec useState(() => melangerTableau
  for (let i = 0; i < lignes.length; i++) {
    if (lignes[i].includes("useState(() =>") && lignes[i].includes("melangerTableau")) {
      // Remplace par une initialisation avec slice sans mélange
      lignes[i] = lignes[i].replace(
        /useState\(\(\) => melangerTableau\(TOUTES_LES_QUESTIONS\)\.slice\(0, NB_QUESTIONS\)\)/,
        "useState<typeof TOUTES_LES_QUESTIONS>([])"
      );
      modifie = true;
      break;
    }
  }

  // Ajoute un useEffect pour mélanger après le montage
  if (modifie) {
    // Cherche le premier useEffect existant et insère avant
    for (let i = 0; i < lignes.length; i++) {
      if (lignes[i].includes("useEffect(() => {") && lignes[i + 1]?.includes("const init")) {
        lignes.splice(i, 0,
          "  useEffect(() => {",
          "    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));",
          "  }, []);",
          ""
        );
        break;
      }
    }

    // Aussi corriger recommencer() pour garder le mélange
    // (déjà correct normalement)

    fs.writeFileSync(fichier, lignes.join("\n"), "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — déjà ok ou pattern non trouvé`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
