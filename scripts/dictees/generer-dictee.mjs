// Génère les MP3 d'une dictée avec Piper (voix fr_FR-siwis-medium).
// Usage (depuis le dossier scolafree) :
//   .\scripts\dictees\generer-dictee.bat <identifiant> [--ecraser]
// Exemple : .\scripts\dictees\generer-dictee.bat ce1-1
//
// Les phrases viennent de lib/entrainement/dictees.ts (une seule source).
// Les MP3 sont écrits aux chemins indiqués par les champs `audio` et `audioComplet`.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PIPER_DIR =
  process.env.PIPER_DIR ?? "C:\\Users\\cedri\\Desktop\\Projets dev\\ScolaFree\\piper";
const PIPER_EXE = path.join(PIPER_DIR, "piper", "piper.exe");
const MODELE = path.join(PIPER_DIR, "fr_FR-siwis-medium.onnx");

// Mêmes réglages que la dictée ce2-1 : voix lente, pause entre les phrases.
const VITESSE = "1.3";
const PAUSE = "1.2";

function echec(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

// --- Arguments -------------------------------------------------------------
const args = process.argv.slice(2);
const ecraser = args.includes("--ecraser");
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  echec("Il manque l'identifiant de la dictée. Exemple : .\\scripts\\dictees\\generer-dictee.bat ce1-1");
}

// --- La dictée ---------------------------------------------------------------
const { DICTEES } = await import(
  pathToFileURL(path.join(RACINE, "lib", "entrainement", "dictees.ts")).href
);
const dictee = DICTEES.find((d) => d.id === id);
if (!dictee) {
  echec(`Dictée « ${id} » introuvable dans lib/entrainement/dictees.ts.\n   Identifiants disponibles : ${DICTEES.map((d) => d.id).join(", ")}`);
}

// --- Outils ----------------------------------------------------------------
if (!existsSync(PIPER_EXE)) echec(`Piper est introuvable : ${PIPER_EXE}`);
if (!existsSync(MODELE)) echec(`Le modèle de voix est introuvable : ${MODELE}`);
const ffmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
if (ffmpeg.error || ffmpeg.status !== 0) {
  echec("ffmpeg est introuvable. Il doit être installé et accessible dans le PATH.");
}

// --- Liste des fichiers à produire -----------------------------------------
function cheminDisque(urlAudio) {
  const attendu = `/audio/dictees/${dictee.id}/`;
  if (!urlAudio.startsWith(attendu) || !urlAudio.endsWith(".mp3")) {
    echec(`Chemin audio inattendu dans la dictée : ${urlAudio}\n   Il doit commencer par ${attendu} et finir par .mp3`);
  }
  return path.join(RACINE, "public", ...urlAudio.split("/").filter(Boolean));
}

const fichiers = [
  ...dictee.phrases.map((p, i) => ({
    nom: `phrase ${i + 1}`,
    texte: p.texte,
    sortie: cheminDisque(p.audio),
  })),
  {
    nom: "dictée complète",
    texte: dictee.phrases.map((p) => p.texte).join(" "),
    sortie: cheminDisque(dictee.audioComplet),
  },
];

// --- Avertissement sur les liaisons fautives ---------------------------------
// La voix lit « grand et » comme « grant et » : on signale tout mot en -d ou -t suivi de « et ».
const LIAISON = /(^|[^\p{L}])(\p{L}*[dt])\s+et(?![\p{L}])/giu;
const suspects = [];
for (const p of dictee.phrases) {
  for (const m of p.texte.matchAll(LIAISON)) suspects.push({ mot: m[2], phrase: p.texte });
}
if (suspects.length > 0) {
  console.warn("\n⚠️  Liaison possible entre un mot en -d ou -t et « et » (la voix peut lire « grant et ») :");
  for (const s of suspects) console.warn(`   « ${s.mot} et » dans : ${s.phrase}`);
  console.warn("   Réécoute ces phrases, ou change le mot avant de publier.");
}

// --- On n'écrase rien sans l'option --ecraser -----------------------------------
const existants = fichiers.filter((f) => existsSync(f.sortie));
if (existants.length > 0 && !ecraser) {
  echec(
    `Des MP3 existent déjà pour « ${dictee.id} » :\n   ${existants.map((f) => path.relative(RACINE, f.sortie)).join("\n   ")}\n` +
      "   Rien n'a été modifié. Ajoute --ecraser pour les remplacer.",
  );
}

// --- Génération ---------------------------------------------------------------
const dossierTmp = mkdtempSync(path.join(tmpdir(), "dictee-"));
console.log(`\nDictée « ${dictee.id} » : ${dictee.titre} (${dictee.phrases.length} phrases)\n`);

try {
  fichiers.forEach((f, i) => {
    console.log(`Génération : ${f.nom} → ${path.relative(RACINE, f.sortie)}`);
    mkdirSync(path.dirname(f.sortie), { recursive: true });
    const wav = path.join(dossierTmp, `${i}.wav`);

    const piper = spawnSync(
      PIPER_EXE,
      ["--model", MODELE, "--length_scale", VITESSE, "--sentence_silence", PAUSE, "--output_file", wav],
      { input: f.texte, encoding: "utf8", stdio: ["pipe", "ignore", "pipe"] },
    );
    if (piper.error || piper.status !== 0 || !existsSync(wav)) {
      echec(`Piper a échoué sur la ${f.nom}.\n${piper.stderr ?? piper.error?.message ?? ""}`);
    }

    const conv = spawnSync(
      "ffmpeg",
      ["-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "64k", f.sortie],
      { encoding: "utf8" },
    );
    if (conv.error || conv.status !== 0) {
      echec(`ffmpeg a échoué sur la ${f.nom}.\n${conv.stderr ?? conv.error?.message ?? ""}`);
    }
  });
} finally {
  rmSync(dossierTmp, { recursive: true, force: true });
}

console.log("\n✅ Terminé. Fichiers créés :");
for (const f of fichiers) {
  const ko = Math.round(statSync(f.sortie).size / 1024);
  console.log(`   ${path.relative(RACINE, f.sortie)} (${ko} Ko)`);
}
console.log("\n👂 Réécoute chaque MP3 avant de publier (liaisons, prononciation, rythme).\n");
