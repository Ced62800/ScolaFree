/**
 * patch-fondamentaux-decouverte.js
 * Ajoute le mode découverte (3 questions sans inscription) à toutes les fiches fondamentaux.
 * Lancer avec : node patch-fondamentaux-decouverte.js
 */

const fs = require("fs");
const path = require("path");

const FONDAMENTAUX_DIR = path.join(
  __dirname,
  "app",
  "fondamentaux",
  "francais"
);

// Récupère tous les dossiers de fiches
const fiches = fs
  .readdirSync(FONDAMENTAUX_DIR)
  .filter((f) => {
    const full = path.join(FONDAMENTAUX_DIR, f);
    return fs.statSync(full).isDirectory();
  })
  .map((f) => path.join(FONDAMENTAUX_DIR, f, "page.tsx"))
  .filter((f) => fs.existsSync(f));

console.log(`\n📂 ${fiches.length} fiches trouvées\n`);

let modifiees = 0;
let ignorees = 0;

fiches.forEach((fichier) => {
  let contenu = fs.readFileSync(fichier, "utf8");
  const nom = path.basename(path.dirname(fichier));

  // Déjà patché ?
  if (contenu.includes("useDecouverte") || contenu.includes("PopupInscription")) {
    console.log(`⏭️  ${nom} — déjà patché, ignoré`);
    ignorees++;
    return;
  }

  // 1. Ajouter les imports après "use client"
  contenu = contenu.replace(
    `"use client";`,
    `"use client";\n\nimport { useDecouverte } from "@/components/DecouverteContext";\nimport PopupInscription from "@/components/PopupInscription";`
  );

  // 2. Ajouter useDecouverte() après les useState existants
  // On cherche le premier useState et on insère après le bloc d'états
  contenu = contenu.replace(
    `const scoreSaved = useRef(false);`,
    `const scoreSaved = useRef(false);\n  const { estConnecte, maxQuestions } = useDecouverte();\n  const [showPopup, setShowPopup] = useState(false);\n  const nbQuestions = Math.min(NB_QUESTIONS, maxQuestions);`
  );

  // 3. Remplacer NB_QUESTIONS par nbQuestions dans le slice
  contenu = contenu.replace(
    `melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS)`,
    `melangerTableau(TOUTES_LES_QUESTIONS).slice(0, NB_QUESTIONS)`
  );

  // 4. Dans la fonction suivant(), ajouter la logique popup
  contenu = contenu.replace(
    `  const suivant = () => {\n    if (indexActuel + 1 >= NB_QUESTIONS) { setTermine(true); } else { setIndexActuel((i) => i + 1); setEtat("attente"); setChoixFait(null); }\n  };`,
    `  const suivant = () => {\n    if (indexActuel + 1 >= nbQuestions) {\n      if (!estConnecte) { setShowPopup(true); return; }\n      setTermine(true);\n    } else {\n      setIndexActuel((i) => i + 1);\n      setEtat("attente");\n      setChoixFait(null);\n    }\n  };`
  );

  // 5. Dans recommencer(), reset showPopup
  contenu = contenu.replace(
    `    setIndexActuel(0); setEtat("attente"); setChoixFait(null); setScore(0); setTermine(false); scoreSaved.current = false;`,
    `    setIndexActuel(0); setEtat("attente"); setChoixFait(null); setScore(0); setTermine(false); scoreSaved.current = false; setShowPopup(false);`
  );

  // 6. Remplacer NB_QUESTIONS par nbQuestions dans la barre de progression
  contenu = contenu.replace(
    /width: `\$\{\(indexActuel \/ NB_QUESTIONS\) \* 100\}%`/g,
    "width: `${(indexActuel / nbQuestions) * 100}%`"
  );

  // 7. Remplacer NB_QUESTIONS par nbQuestions dans "Question X/NB_QUESTIONS"
  contenu = contenu.replace(
    /Question \{indexActuel \+ 1\}\/\{NB_QUESTIONS\}/g,
    "Question {indexActuel + 1}/{nbQuestions}"
  );

  // 8. Remplacer dans le bouton suivant
  contenu = contenu.replace(
    /indexActuel \+ 1 >= NB_QUESTIONS \? "Voir mon score" : "Question suivante →"/g,
    `indexActuel + 1 >= nbQuestions ? "Voir mon score" : "Question suivante →"`
  );

  // 9. Ajouter PopupInscription au début du return principal (après le premier <div style...)
  // On cherche le return de l'écran question
  contenu = contenu.replace(
    `  return (\n    <div style={{ minHeight: "100vh", background: "#0f0f23", padding: "80px 20px 16px 20px" }}>`,
    `  return (\n    <div style={{ minHeight: "100vh", background: "#0f0f23", padding: "80px 20px 16px 20px" }}>\n      {showPopup && <PopupInscription onRecommencer={recommencer} />}`
  );

  fs.writeFileSync(fichier, contenu, "utf8");
  console.log(`✅ ${nom} — patché`);
  modifiees++;
});

console.log(`\n🎉 Terminé ! ${modifiees} fiches patchées, ${ignorees} ignorées.\n`);
