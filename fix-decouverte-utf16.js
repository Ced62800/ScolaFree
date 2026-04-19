/**
 * fix-decouverte-utf16.js
 * Ajoute le mode découverte dans toutes les fiches fondamentaux.
 * Gère les encodages UTF-8 et UTF-16.
 * Lancer avec : node fix-decouverte-utf16.js
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
let ignorees = 0;

function lireFichier(fichier) {
  const buf = fs.readFileSync(fichier);
  // Détecte BOM UTF-16 LE
  if (buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.slice(2).toString("utf16le");
  }
  // Détecte BOM UTF-16 BE
  if (buf[0] === 0xFE && buf[1] === 0xFF) {
    return buf.slice(2).swap16().toString("utf16le");
  }
  // UTF-8 par défaut
  return buf.toString("utf8");
}

function ecrireFichier(fichier, contenu) {
  fs.writeFileSync(fichier, contenu, "utf8");
}

fiches.forEach((fichier) => {
  const nom = path.basename(path.dirname(fichier));
  let contenu = lireFichier(fichier);

  // Déjà patché ?
  if (contenu.includes("showPopup") && contenu.includes("PopupInscription") && contenu.includes("nbQuestions")) {
    console.log(`⏭️  ${nom} — déjà patché`);
    ignorees++;
    return;
  }

  let modifie = false;

  // ── 1. Ajouter import PopupInscription si absent ──
  if (!contenu.includes("PopupInscription")) {
    contenu = contenu.replace(
      `import { useDecouverte } from "@/components/DecouverteContext";`,
      `import { useDecouverte } from "@/components/DecouverteContext";\nimport PopupInscription from "@/components/PopupInscription";`
    );
    modifie = true;
  }

  // ── 2. Ajouter nbQuestions après maxQuestions ──
  if (!contenu.includes("nbQuestions")) {
    contenu = contenu.replace(
      `const { estConnecte, maxQuestions } = useDecouverte();`,
      `const { estConnecte, maxQuestions } = useDecouverte();\n  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);`
    );
    modifie = true;
  }

  // ── 3. Ajouter showPopup state ──
  if (!contenu.includes("showPopup")) {
    contenu = contenu.replace(
      `const scoreSaved = useRef(false);`,
      `const scoreSaved = useRef(false);\n  const [showPopup, setShowPopup] = useState(false);`
    );
    modifie = true;
  }

  // ── 4. Corriger suivant() — NB_QUESTIONS → nbQuestions + popup ──
  // Pattern compact (une ligne)
  if (contenu.includes("if (indexActuel + 1 >= NB_QUESTIONS) { setTermine(true); }")) {
    contenu = contenu.replace(
      `if (indexActuel + 1 >= NB_QUESTIONS) { setTermine(true); }`,
      `if (indexActuel + 1 >= nbQuestions) {\n      if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);\n    }`
    );
    modifie = true;
  }

  // Pattern multiligne
  if (contenu.includes("if (indexActuel + 1 >= NB_QUESTIONS) {\n      setTermine(true);")) {
    contenu = contenu.replace(
      `if (indexActuel + 1 >= NB_QUESTIONS) {\n      setTermine(true);`,
      `if (indexActuel + 1 >= nbQuestions) {\n      if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);`
    );
    modifie = true;
  }

  // ── 5. Ajouter setShowPopup(false) dans recommencer ──
  if (!contenu.includes("setShowPopup(false)")) {
    contenu = contenu.replace(
      `scoreSaved.current = false;`,
      `scoreSaved.current = false; setShowPopup(false);`
    );
    modifie = true;
  }

  // ── 6. Remplacer NB_QUESTIONS par nbQuestions dans barre de progression ──
  contenu = contenu.replace(
    /\(indexActuel \/ NB_QUESTIONS\) \* 100/g,
    `(indexActuel / nbQuestions) * 100`
  );

  // ── 7. Remplacer NB_QUESTIONS par nbQuestions dans Question X/NB_QUESTIONS ──
  contenu = contenu.replace(
    /\{indexActuel \+ 1\}\/\{NB_QUESTIONS\}/g,
    `{indexActuel + 1}/{nbQuestions}`
  );

  // ── 8. Remplacer NB_QUESTIONS dans bouton suivant ──
  contenu = contenu.replace(
    /indexActuel \+ 1 >= NB_QUESTIONS \? "Voir mon score"/g,
    `indexActuel + 1 >= nbQuestions ? "Voir mon score"`
  );

  // ── 9. Ajouter PopupInscription dans le return ──
  if (!contenu.includes("{showPopup && <PopupInscription")) {
    contenu = contenu.replace(
      `padding: "80px 20px 16px 20px",\n      }}\n    >`,
      `padding: "80px 20px 16px 20px",\n      }}\n    >\n      {showPopup && <PopupInscription onRecommencer={recommencer} />}`
    );
    modifie = true;
  }

  if (modifie) {
    ecrireFichier(fichier, contenu);
    console.log(`✅ ${nom} — patché`);
    modifiees++;
  } else {
    console.log(`⚠️  ${nom} — patterns non trouvés, vérifier manuellement`);
    ignorees++;
  }
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches patchées, ${ignorees} ignorées.\n`);
