/**
 * fix-hydration-v2.js
 * Corrige l'erreur d'hydratation dans les fiches fondamentaux maths.
 * Gère l'encodage UTF-16.
 * Lancer avec : node fix-hydration-v2.js
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
  let contenu = lireFichier(fichier);
  const nom = path.basename(path.dirname(fichier));

  // Vérifie si le bug est présent
  if (!contenu.includes("useState(() => melangerTableau")) {
    console.log(`⏭️  ${nom} — déjà ok`);
    return;
  }

  // 1. Remplace useState avec mélange par tableau vide
  contenu = contenu.replace(
    /const \[questions, setQuestions\] = useState\(\(\) => melangerTableau\(TOUTES_LES_QUESTIONS\)\.slice\(0, NB_QUESTIONS\)\);/g,
    `const [questions, setQuestions] = useState<typeof TOUTES_LES_QUESTIONS>([]);

  useEffect(() => {
    setQuestions(melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS));
  }, []);`
  );

  fs.writeFileSync(fichier, contenu, "utf8");
  console.log(`✅ ${nom} — corrigé`);
  modifiees++;
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
