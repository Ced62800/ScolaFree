/**
 * fix-suivant.js
 * Corrige la fonction suivant() et recommencer() dans toutes les fiches fondamentaux.
 * Lancer avec : node fix-suivant.js
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
  let contenu = fs.readFileSync(fichier, "utf8");
  const nom = path.basename(path.dirname(fichier));
  const avant = contenu;

  // 1. Corriger la fonction suivant() — remplacer NB_QUESTIONS par nbQuestions
  // Pattern: if (indexActuel + 1 >= NB_QUESTIONS) { setTermine(true); }
  contenu = contenu.replace(
    /if \(indexActuel \+ 1 >= NB_QUESTIONS\) \{\s*setTermine\(true\);\s*\} else \{/g,
    `if (indexActuel + 1 >= nbQuestions) {\n      if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);\n    } else {`
  );

  // 2. Corriger le bouton "Question suivante" — NB_QUESTIONS → nbQuestions
  contenu = contenu.replace(
    /indexActuel \+ 1 >= NB_QUESTIONS\s*\?\s*"Voir mon score"\s*:\s*"Question suivante →"/g,
    `indexActuel + 1 >= nbQuestions ? "Voir mon score" : "Question suivante →"`
  );

  // 3. Ajouter showPopup dans recommencer si absent
  if (!contenu.includes("setShowPopup(false)")) {
    contenu = contenu.replace(
      /scoreSaved\.current = false;(\s*)\}/,
      `scoreSaved.current = false; setShowPopup(false);$1}`
    );
  }

  // 4. Ajouter PopupInscription dans le return si absent
  if (!contenu.includes("PopupInscription")) {
    contenu = contenu.replace(
      `padding: "80px 20px 16px 20px",\n      }}\n    >\n      <div style={{ maxWidth:`,
      `padding: "80px 20px 16px 20px",\n      }}\n    >\n      {showPopup && <PopupInscription onRecommencer={recommencer} />}\n      <div style={{ maxWidth:`
    );
  }

  if (contenu !== avant) {
    fs.writeFileSync(fichier, contenu, "utf8");
    console.log(`✅ ${nom} — corrigé`);
    modifiees++;
  } else {
    console.log(`⏭️  ${nom} — rien à corriger`);
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches corrigées.\n`);
