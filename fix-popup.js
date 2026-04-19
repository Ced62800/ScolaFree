/**
 * fix-popup.js
 * Ajoute showPopup et PopupInscription dans toutes les fiches fondamentaux.
 * Lancer avec : node fix-popup.js
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
  let modifie = false;

  // ── 1. Ajouter [showPopup, setShowPopup] après scoreSaved ──
  if (!lignes.some(l => l.includes("showPopup"))) {
    for (let i = 0; i < lignes.length; i++) {
      if (lignes[i].includes("scoreSaved") && lignes[i].includes("useRef")) {
        lignes.splice(i + 1, 0, "  const [showPopup, setShowPopup] = useState(false);");
        modifie = true;
        break;
      }
    }
  }

  // ── 2. Corriger suivant() — remplacer setTermine(true) par popup + setTermine ──
  if (!lignes.some(l => l.includes("setShowPopup(true)"))) {
    for (let i = 0; i < lignes.length; i++) {
      if (lignes[i].includes("nbQuestions") && lignes[i].includes("setTermine(true)")) {
        lignes[i] = lignes[i].replace(
          "setTermine(true);",
          "if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);"
        );
        modifie = true;
        break;
      }
      // Pattern multiligne : cherche la ligne avec nbQuestions puis setTermine sur la ligne suivante
      if (lignes[i].includes("indexActuel + 1 >= nbQuestions") && !lignes[i].includes("setTermine")) {
        // Cherche setTermine dans les 3 lignes suivantes
        for (let j = i + 1; j < Math.min(i + 4, lignes.length); j++) {
          if (lignes[j].includes("setTermine(true)") && !lignes[j].includes("estConnecte")) {
            lignes[j] = lignes[j].replace(
              "setTermine(true);",
              "if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);"
            );
            modifie = true;
            break;
          }
        }
        break;
      }
    }
  }

  // ── 3. Ajouter setShowPopup(false) dans recommencer ──
  if (!lignes.some(l => l.includes("setShowPopup(false)"))) {
    for (let i = 0; i < lignes.length; i++) {
      if (lignes[i].includes("scoreSaved.current = false")) {
        lignes[i] = lignes[i].replace(
          "scoreSaved.current = false;",
          "scoreSaved.current = false; setShowPopup(false);"
        );
        modifie = true;
        break;
      }
    }
  }

  // ── 4. Ajouter {showPopup && <PopupInscription .../>} dans le return ──
  if (!lignes.some(l => l.includes("PopupInscription"))) {
    for (let i = 0; i < lignes.length; i++) {
      if (lignes[i].includes('padding: "80px 20px 16px 20px"')) {
        // Cherche la ligne avec le div fermant après ce padding
        for (let j = i; j < Math.min(i + 5, lignes.length); j++) {
          if (lignes[j].includes(">") && !lignes[j].includes("padding")) {
            lignes.splice(j + 1, 0, "      {showPopup && <PopupInscription onRecommencer={recommencer} />}");
            modifie = true;
            break;
          }
        }
        break;
      }
    }
  }

  if (modifie) {
    fs.writeFileSync(fichier, lignes.join("\n"), "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — déjà ok`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
