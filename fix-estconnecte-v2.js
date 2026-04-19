/**
 * fix-estconnecte-v2.js
 * Supprime le useState estConnecte et setEstConnecte dans les fiches fondamentaux.
 * Lancer avec : node fix-estconnecte-v2.js
 */

const fs = require("fs");
const path = require("path");

const FONDAMENTAUX_DIR = path.join(__dirname, "app", "fondamentaux", "francais");

const fiches = fs
  .readdirSync(FONDAMENTAUX_DIR)
  .filter((f) => fs.statSync(path.join(FONDAMENTAUX_DIR, f)).isDirectory())
  .map((f) => path.join(FONDAMENTAUX_DIR, f, "page.tsx"))
  .filter((f) => fs.existsSync(f));

console.log(`\n📂 ${fiches.length} fiches trouvées\n`);

let modifiees = 0;

fiches.forEach((fichier) => {
  let lignes = fs.readFileSync(fichier, "utf8").split("\n");
  const nom = path.basename(path.dirname(fichier));
  const avant = lignes.length;

  // Filtrer les lignes contenant useState estConnecte ou setEstConnecte(true)
  const nouvelles = lignes.filter((ligne) => {
    if (ligne.includes("const [estConnecte, setEstConnecte] = useState")) return false;
    if (ligne.trim() === "setEstConnecte(true);") return false;
    if (ligne.trim() === "setEstConnecte(true);") return false;
    return true;
  });

  if (nouvelles.length !== avant) {
    fs.writeFileSync(fichier, nouvelles.join("\n"), "utf8");
    console.log(`✅ ${nom} — ${avant - nouvelles.length} ligne(s) supprimée(s)`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — rien à corriger`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
