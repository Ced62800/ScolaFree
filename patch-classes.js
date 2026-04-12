const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\cedri\\Desktop\\Scolafree_site\\scolafree";

// Fichiers a patcher avec leur classe et niveau
const cibles = [
  {
    file: "app/cours/primaire/cp/page.tsx",
    classe: "cp",
    niveau: "primaire",
    retour: "/cours/primaire",
  },
  {
    file: "app/cours/primaire/ce1/page.tsx",
    classe: "ce1",
    niveau: "primaire",
    retour: "/cours/primaire",
  },
  {
    file: "app/cours/primaire/ce2/page.tsx",
    classe: "ce2",
    niveau: "primaire",
    retour: "/cours/primaire",
  },
  {
    file: "app/cours/primaire/cm1/page.tsx",
    classe: "cm1",
    niveau: "primaire",
    retour: "/cours/primaire",
  },
  {
    file: "app/cours/primaire/cm2/page.tsx",
    classe: "cm2",
    niveau: "primaire",
    retour: "/cours/primaire",
  },
  {
    file: "app/cours/college/6eme/page.tsx",
    classe: "6eme",
    niveau: "college",
    retour: "/cours/college",
  },
  {
    file: "app/cours/college/5eme/page.tsx",
    classe: "5eme",
    niveau: "college",
    retour: "/cours/college",
  },
  {
    file: "app/cours/college/4eme/page.tsx",
    classe: "4eme",
    niveau: "college",
    retour: "/cours/college",
  },
  {
    file: "app/cours/college/3eme/page.tsx",
    classe: "3eme",
    niveau: "college",
    retour: "/cours/college",
  },
];

// Nouveau bloc useEffect a injecter (remplace l'ancien)
function nouveauUseEffect(classe) {
  return `
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      setEstConnecte(!!user);
      if (user) {
        const { data } = await supabase
          .from("scores")
          .select("matiere, theme, score, total")
          .eq("user_id", user.id)
          .eq("classe", "${classe}")
          .in("theme", ["bilan", "bilan-2"])
          .order("score", { ascending: false });
        if (data) {
          const statutsMap: Record<string, "valide" | "en-cours"> = {};
          const parMatiere: Record<string, { score: number; total: number }[]> = {};
          for (const s of data) {
            if (!parMatiere[s.matiere]) parMatiere[s.matiere] = [];
            parMatiere[s.matiere].push(s);
          }
          for (const [matiere, scores] of Object.entries(parMatiere)) {
            const meilleur = scores.reduce((best, s) =>
              s.score / s.total > best.score / best.total ? s : best
            );
            statutsMap[matiere] = meilleur.score / meilleur.total >= 0.8 ? "valide" : "en-cours";
          }
          setStatutsMatieres(statutsMap);
        }
      }
      setChargement(false);
    };
    init();
  }, []);`;
}

// Badge bilan a afficher sur la carte
const badgeBilan = `
              {estConnecte && !chargement && statutsMatieres[m.id] && (
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.2rem",
                }}>
                  {statutsMatieres[m.id] === "valide" ? "✅" : "🟡"}
                </div>
              )}`;

for (const cible of cibles) {
  const filePath = path.join(
    process.cwd(),
    cible.file.replace(/\//g, path.sep),
  );
  if (!fs.existsSync(filePath)) {
    console.log("MISSING:", filePath);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // 1. Ajouter l'import useState si pas deja present (il l'est)
  // 2. Ajouter le state statutsMatieres
  // Chercher la ligne avec setChargement(true/false) dans le state declarations
  if (!content.includes("statutsMatieres")) {
    content = content.replace(
      /const \[chargement, setChargement\] = useState\(true\);/,
      `const [chargement, setChargement] = useState(true);\n  const [statutsMatieres, setStatutsMatieres] = useState<Record<string, "valide" | "en-cours">>({});`,
    );
  }

  // 3. Remplacer le useEffect
  const useEffectRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/;
  if (useEffectRegex.test(content)) {
    content = content.replace(
      useEffectRegex,
      nouveauUseEffect(cible.classe).trim(),
    );
  }

  // 4. Ajouter le badge apres la div position:relative dans la carte
  // On cherche la div theme-card et on insere le badge apres le badge Decouverte
  // On cherche le pattern du badge decouverte et on insere apres
  if (!content.includes("statutsMatieres[m.id]")) {
    // Inserer le badge juste avant <div className="theme-emoji">
    content = content.replace(
      /<div className="theme-emoji">/g,
      badgeBilan.trim() + '\n            <div className="theme-emoji">',
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("PATCHED:", cible.file);
}

console.log("DONE");
