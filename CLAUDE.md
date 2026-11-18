# ScolaFree

Plateforme éducative gratuite du CP à la 3e (français, maths, anglais), alignée sur les programmes Éduscol. En ligne sur scolafree.vercel.app. Je développe seul. Tout l'apprentissage doit rester gratuit.

## Stack

- Next.js 16 (App Router), TypeScript
- Supabase (auth et données)
- Hébergement Vercel, déploiement depuis la branche `main` sur GitHub
- Assistant Scolou sur Gemini 2.5 Flash, offre gratuite (choix assumé, ne pas proposer d'API payante)
- PWA avec service worker (`sw.js`), app Android en TWA via Bubblewrap

## Mon poste

Windows, VS Code, PowerShell. Explique-moi les étapes simplement, en français, et dis-moi ce que fait chaque modification importante : j'apprends en faisant.

## Comment travailler avec moi

- Avant une tâche de plus de deux ou trois fichiers, présente-moi un plan et attends mon accord.
- Ne modifie jamais un fichier ou un template existant au-delà de ce que je demande. Si tu vois autre chose à corriger, signale-le sans y toucher.
- Enregistre tous les fichiers en UTF-8. Les textes sont en français avec accents, ils doivent rester intacts.
- Git : demande-moi mon accord avant chaque commit et chaque push. Quand tu me proposes des commandes, donne-les une par une, en syntaxe PowerShell, jamais enchaînées avec `&&`.
- Ne travaille jamais directement sur `main`. Chaque lot se fait sur sa propre branche créée depuis `main` (ex. `entrainement-vague1-lot1`). La fusion dans `main` se fait seulement après mon test sur la version de test Vercel.
- Après chaque série de modifications, lance `npx tsc --noEmit`. L'erreur sur `globals.css` est un faux positif connu, ignore-la. Toute autre erreur doit être corrigée avant de me rendre la main.
- Termine en me disant quoi tester : la page à ouvrir, ce qu'il faut cliquer, le résultat attendu.

## Règles techniques

- Supabase : `getSession()`, jamais `getUser()`.
- Routes dynamiques (Next.js 16) : `params` est une Promise. Écrire `const { id } = await params`.
- Mélange des questions : `useState<Type[]>([])` puis le mélange dans un `useEffect`. Jamais d'initialiseur avec `Math.random()` (ça casse l'hydratation). Ajouter `if (!question) return null` avant le rendu.
- Bilans : `scoreRef` et `scoreSaved` en `useRef`. Format CE2 : score sur 20, barres de résultat par thème.
- Déblocage de la classe suivante à 16/20 sur les bilans (`bilan` et `bilan-2`).
- Dans le texte JSX, éviter les caractères `×`, `÷`, `²`, `³` et la séquence `<-`. Utiliser des entités HTML ou des échappements Unicode.
- À chaque déploiement, monter `CACHE_NAME` dans `sw.js`.

## Android (Bubblewrap / TWA)

Je m'en occupe moi-même, dans une fenêtre PowerShell séparée, depuis `C:\Users\cedri\Desktop\Projets dev\ScolaFree\ScolaFree_android\`. Pour mémoire : copier `android.keystore` (alias `android`) dans ce dossier avant `bubblewrap build`, et remettre `targetSdkVersion 36` dans `app\build.gradle` après chaque `bubblewrap update`. Ne lance pas ces commandes toi-même.

## Chantier en cours : section « Entraînement »

Entraînement à l'orthographe et à la grammaire par séries d'exercices courts, avec des dictées. Décisions déjà prises, à respecter :

- Nouvelle section transversale nommée « Entraînement ». N'utilise jamais le mot « Bled » (marque Hachette), ni dans le code, ni dans les textes, ni dans les noms de fichiers.
- Les séries sont rangées par notion (é/er/ez, participe passé, pluriels, a/à, et/est...). Chaque série porte une étiquette de niveau. On met en avant les séries de la classe de l'élève, sans bloquer l'accès aux autres.
- Les dictées sont rangées par classe. L'audio est en MP3 pré-générés (voix Piper fr-siwis-medium), stockés dans `public/audio/`. Pas de Web Speech API : elle ne fonctionne pas dans toutes les webviews, dont la TWA.
- Pas de doublon de contenu. La règle complète reste dans la fiche Fondamentaux. La série reprend seulement une micro-règle et se relie à la fiche par un identifiant de notion commun (par exemple `et-est`).
- Chaque fiche Fondamentaux qui a une série associée reçoit un bouton « S'entraîner davantage ». Si une notion n'a pas encore de fiche, on crée la fiche d'abord.
- L'Entraînement est hors du système de déblocage à 16/20 : rien n'y est verrouillé et rien n'y débloque une classe.

## Plan de l'Entraînement : c'est toi qui le mènes

Le plan complet est dans `docs/plan-entrainement.md` : 48 notions, 6 vagues, les dictées par classe et les chantiers techniques. Tu t'occupes de tout, y compris de rédiger le contenu. Méthode :

- Avance lot par lot (3 à 5 notions), dans l'ordre des vagues. Au début de chaque lot, présente-moi la liste des notions et attends mon accord.
- Si une fiche Fondamentaux manque, crée-la d'abord, sur le modèle de `app/fondamentaux/francais/et-est/` et en respectant les règles techniques ci-dessus.
- Rédige toi-même les phrases des séries et des dictées, la micro-règle et les explications. Relis l'orthographe de chaque phrase deux fois : une faute dans un exercice d'orthographe est inacceptable.
- Écris pour un enfant de la classe visée : tutoiement, phrases courtes, mots simples, l'astuce de la fiche (« était », « avait », « les siens »…). Chaque explication dit pourquoi, pas seulement la bonne réponse.
- Phrases d'exercice : nouvelles (pas celles de la fiche), du quotidien d'un enfant, sans nom de marque, sans contenu qui pourrait gêner un parent.
- Dictées : 5 phrases pour le primaire, plus pour le collège, avec une aide écrite pour chaque mot piège. Génère l'audio avec le script de `scripts/dictees/` (Piper est dans `C:\Users\cedri\Desktop\Projets dev\ScolaFree\piper`). Évite les liaisons fautives de la voix (adjectif en -d ou -t suivi de « et ») et demande-moi de réécouter les MP3.
- À la fin de chaque lot : `npx tsc --noEmit`, la liste précise de ce qu'il faut tester, puis propose le commit et le push de la branche. Mets à jour `docs/plan-entrainement.md` (notion faite) dans le même commit.
- Les chantiers techniques du plan se font au moment indiqué, chacun présenté d'abord sous forme de plan.
