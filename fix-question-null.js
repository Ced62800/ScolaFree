/**
 * fix-question-null.js
 * Ajoute "if (!question) return null;" dans toutes les fiches maths.
 * Lancer avec : node fix-question-null.js
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

  // Déjà patché ?
  if (lignes.some(l => l.includes("if (!question) return null"))) {
    console.log(`⏭️  ${nom} — déjà ok`);
    return;
  }

  // Cherche la ligne "const question = questions[indexActuel];"
  let modifie = false;
  for (let i = 0; i < lignes.length; i++) {
    if (lignes[i].includes("const question = questions[indexActuel]")) {
      lignes.splice(i + 1, 0, "  if (!question) return null;");
      modifie = true;
      break;
    }
  }

  if (modifie) {
    fs.writeFileSync(fichier, lignes.join("\n"), "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⚠️  ${nom} — pattern non trouvé`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
