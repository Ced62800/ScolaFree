/**
 * fix-estconnecte-double.js
 * Supprime le useState estConnecte en double dans les fiches fondamentaux.
 * Lancer avec : node fix-estconnecte-double.js
 */

const fs = require("fs");
const path = require("path");

const FONDAMENTAUX_DIR = path.join(
  __dirname,
  "app",
  "fondamentaux",
  "francais"
);

const fiches = fs
  .readdirSync(FONDAMENTAUX_DIR)
  .filter((f) => fs.statSync(path.join(FONDAMENTAUX_DIR, f)).isDirectory())
  .map((f) => path.join(FONDAMENTAUX_DIR, f, "page.tsx"))
  .filter((f) => fs.existsSync(f));

console.log(`\n📂 ${fiches.length} fiches trouvées\n`);

let modifiees = 0;

fiches.forEach((fichier) => {
  let contenu = fs.readFileSync(fichier, "utf8");
  const nom = path.basename(path.dirname(fichier));

  // Supprimer le useState estConnecte (désormais fourni par useDecouverte)
  const avant = contenu;

  // Supprimer la ligne du useState estConnecte
  contenu = contenu.replace(
    /\s*const \[estConnecte, setEstConnecte\] = useState\(false\);\n/g,
    "\n"
  );

  // Supprimer la ligne setEstConnecte(true) dans le useEffect init
  contenu = contenu.replace(/\s*setEstConnecte\(true\);\n/g, "\n");

  if (contenu !== avant) {
    fs.writeFileSync(fichier, contenu, "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — rien à corriger`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
