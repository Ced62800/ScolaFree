# Plan de construction de l'Entraînement

Version du 18 novembre 2026. Document de référence pour Claude Code : on suit ce plan vague par vague, lot par lot.

## Où on en est

En ligne : les séries et/est, a/as/à, on/ont (CE1-CE2), son/sont, ces/ses/c'est/s'est, ça/sa (CE2-CM1), leur/leurs, tout/tous/toute/toutes (CE2-CM2) et les dictées CE2 « Au parc » (`ce2-1`) et CE1 « Les petits mots » (`ce1-1`, a/à, on/ont, pluriel des noms). Vague 1 terminée (lots 1 et 2). Filtres par classe et par famille sur l'accueil. Vague 2, lot 1 : pluriel des noms, accord dans le groupe nominal (CE1-CM1), lettres muettes (CE1-CE2), avec leurs fiches. Vague 2, lot 2 : accord sujet-verbe (série CE2-CM1, sujets simples puis éloignés ; le sujet inversé reste un cas bonus dans la fiche) et finale en [é] (CE2-6e), avec leurs fiches. Vague 2 terminée. La dictée CE1 « Les petits mots » (`ce1-1`) et le script de dictée générique sont faits. Exercice de saisie (« écris la bonne forme ») en ligne : une série peut mélanger boutons et saisie. Vague 3, lot 1 : être et avoir au présent (CP-CE1), présent des verbes en -er (CE1-CE2), présent des verbes courants (CE2-6e : aller, faire, dire, venir, prendre, pouvoir ; vouloir et voir restent à faire dans une 2e série), avec leurs fiches à boutons et leurs séries de saisie. Reste pour la vague 3 : imparfait, futur simple, passé composé. Le moteur accepte n'importe quelle notion : ajouter une série revient à écrire des données.

- 41 fiches Fondamentaux français existent dans `app/fondamentaux/francais/`. Les nouvelles fiches acceptent des boutons propres à chaque question (champ `choix`).
- Cours de primaire (CP au CM2) : 8 thèmes par classe (orthographe, grammaire, conjugaison, vocabulaire, deux leçons chacun).
- Cours de collège : accords, homophones, présent, imparfait, passé simple, conditionnel, subjonctif, plus des thèmes de littérature.
- Nouveaux programmes de français depuis la rentrée 2025 (cycle 2, CM1, 6e), CM2 à la rentrée 2026.

## Principes

- L'Entraînement couvre ce qui s'apprend en répétant : homophones, accords, terminaisons de conjugaison, sons et lettres muettes. La littérature et le vocabulaire restent dans les cours.
- Une notion = une fiche Fondamentaux (règle complète) + une ou plusieurs séries. Fiche manquante : on la crée d'abord, sur le modèle de `et-est`.
- Une série : environ 15 phrases nouvelles (10 tirées au hasard), une micro-règle, une étiquette de niveau.
- Chaque phrase a son explication, écrite pour un enfant de la classe visée. En cas d'erreur, un message dit aussi pourquoi le mot choisi ne marche pas (champ `erreurs`, affiché « Tu as mis « x » ? … »).
- Une dictée : 5 phrases (plus pour les grands), audio Piper, une aide écrite pour chaque mot piège. Réécouter chaque MP3 avant publication.
- Tout reste ouvert à toutes les classes, mise en avant de la classe de l'élève, rien ne compte pour le déblocage à 16/20.

## Carte des notions

| Famille | Notion | Classes | Fiche | Vague |
| --- | --- | --- | --- | --- |
| Sons et lettres | Sons simples (o/au/eau, s/ss/c/ç) | CP-CE1 | à créer | 6 |
| Sons et lettres | m devant m, b, p | CE1 | à créer | 6 |
| Sons et lettres | c/ç et g/ge/gu | CE1-CE2 | cedille (c/ç seulement) | 6 |
| Sons et lettres | Lettres muettes en fin de mot | CE1-CE2 | lettres-muettes | fait |
| Homophones | et / est | CE1-CE2 | et-est | fait |
| Homophones | a / as / à | CE1-CE2 | a-as-a | fait |
| Homophones | on / ont | CE1-CE2 | on-ont | fait |
| Homophones | son / sont | CE2-CM1 | son-sont | fait |
| Homophones | ces / ses / c'est / s'est | CE2-CM1 | ces-ses | fait |
| Homophones | ça / sa | CE2-CM1 | ca-sa | fait |
| Homophones | leur / leurs | CE2-CM2 | leur-leurs | fait |
| Homophones | tout / tous / toute / toutes | CE2-CM2 | tout-tous | fait |
| Homophones | ou / où | CM1 | ou-ou | 4 |
| Homophones | ce / se | CM1-CM2 | ce-se | 4 |
| Homophones | la / là / l'a | CM1-CM2 | la-la | 4 |
| Homophones | mais / mes | CM1 | mais-mes | 4 |
| Homophones | peu / peut / peux | CM1-CM2 | peu-peux-peut | 4 |
| Homophones | ça / çà / ç'a | CM1-CM2 | ca-ca-ca | 4 |
| Homophones | quand / quant / qu'en | CM2-6e | quand-quant-quen | 4 |
| Homophones | sans / s'en | CM2-5e | sans-sen | 4 |
| Homophones | ni / n'y et si / s'y | CM2-5e | ni-ny, si-sy | 4 |
| Homophones | on a / on n'a | CM2-6e | on-a-on-na | 4 |
| Homophones | quel / quelle / qu'elle | CM2-5e | quel-quelle | 5 |
| Homophones | dans / d'en | 6e | dans-den | 5 |
| Homophones | près / prêt | 6e-5e | pres-pret | 5 |
| Homophones | j'ai / j'aie, ai / ais | 6e-5e | ai-ais | 5 |
| Homophones | soi / soit | 5e-4e | soi-soit | 5 |
| Homophones | plutôt / plus tôt | 5e-4e | plutot-plus-tot | 5 |
| Homophones | quelque / quel que | 4e-3e | quelque | 5 |
| Homophones | quoique / quoi que | 4e-3e | quoique | 5 |
| Homophones | même / mêmes | 4e-3e | meme-memes | 5 |
| Homophones | davantage / d'avantage | 4e-3e | davantage | 5 |
| Homophones | parce que / par ce que | 4e-3e | parce-que | 5 |
| Homophones | voici / voilà | 5e-4e | voici-voila | 5 |
| Accords | Pluriel des noms (-s, -x, -aux) | CE1-CE2 | pluriel-noms | fait |
| Accords | Accord dans le groupe nominal | CE1-CM1 | accord-groupe-nominal | fait |
| Accords | Accord sujet-verbe (sujet éloigné ou inversé) | CE2-6e | accord-sujet-verbe | fait |
| Accords | Finale en [é] : é, er, ez, ait | CE2-6e | finale-e | fait |
| Accords | Participe passé avec être et avec avoir | CM1-4e | participe-passe | 4 |
| Conjugaison | Être et avoir au présent | CP-CE1 | etre-avoir | fait |
| Conjugaison | Présent des verbes en -er | CE1-CE2 | present-er | fait |
| Conjugaison | Présent des verbes courants (aller, faire, venir, prendre…) | CE2-6e | present-courants | fait (6 verbes ; vouloir et voir à venir) |
| Conjugaison | Imparfait | CE2-CM1 | à créer | 3 |
| Conjugaison | Futur simple | CE2-CM1 | à créer | 3 |
| Conjugaison | Passé composé | CE2-CM1 | à créer | 3 |
| Conjugaison | Passé simple | CM2-5e | à créer | 5 |
| Conjugaison | Futur ou conditionnel (-rai / -rais) | CM2-4e | à créer | 5 |
| Conjugaison | Subjonctif présent | 4e-3e | à créer | 5 |

## Ordre de construction

| Vague | Contenu | Travail en plus des séries | Séries |
| --- | --- | --- | --- |
| 1 | a/à, on/ont, son/sont, ces/ses, ça/sa, leur/leurs, tout/tous | aucun, les fiches existent | 7 |
| 2 | pluriel des noms, accord GN, accord sujet-verbe, finale en [é], lettres muettes | 5 fiches à créer | 5 |
| 3 | être et avoir, présent -er, présent des verbes courants, imparfait, futur, passé composé | 6 fiches + exercice de saisie | 6 |
| 4 | ou/où, ce/se, la/là, mais/mes, peu/peut/peux, ça/çà, quand/quant, sans/s'en, ni/n'y et si/s'y, on n'a, participe passé | aucun | 11 |
| 5 | 12 homophones du collège, passé simple, futur ou conditionnel, subjonctif | 3 fiches | 15 |
| 6 | sons simples, m devant m/b/p, c/ç et g/ge/gu | 2 fiches + exercices avec audio | 3 |

Chaque vague se fait en lots de 3 à 5 notions, testés et mis en ligne un par un.

## Dictées

Objectif : deux dictées par classe (18 au total), qui reprennent les notions déjà en ligne.

| Classe | Format | Notions | Quand |
| --- | --- | --- | --- |
| CP | 3 phrases très courtes | sons simples, être et avoir | après la vague 6 |
| CE1 | 4 phrases courtes | a/à, on/ont, pluriel des noms | faite (`ce1-1`), 1 à faire |
| CE2 | 5 phrases | et/est, accords du GN | 1 faite, 1 à faire |
| CM1 | 5 à 6 phrases | son/sont, ces/ses, imparfait | avec la vague 3 |
| CM2 | 6 à 8 phrases | participe passé, finale en [é] | avec la vague 4 |
| 6e | texte d'environ 80 mots | sujet-verbe, homophones du CM | avec la vague 4 |
| 5e | texte d'environ 100 mots | passé simple, homophones du collège | avec la vague 5 |
| 4e | texte d'environ 120 mots | participe passé, conditionnel | avec la vague 5 |
| 3e | texte façon brevet | subjonctif, tous les accords | avec la vague 5 |

Audio : le script est générique. Une seule commande, `.\scripts\dictees\generer-dictee.bat <id>` (ex. `ce1-1`), lit les phrases dans `lib/entrainement/dictees.ts` et génère les MP3 ; il refuse d'écraser des MP3 existants sans `--ecraser` et avertit si un mot en -d ou -t précède « et ». L'ancien `generer-ce2-1.bat` et ses `.txt` ne servent plus. Piper est installé dans `C:\Users\cedri\Desktop\Projets dev\ScolaFree\piper` (son fichier `.onnx.json` a été nettoyé des phonèmes à plusieurs caractères). Attention aux liaisons fautives de la voix (ex. « grand et » lu « grant et ») : éviter adjectif en -d ou -t suivi de « et », et réécouter.

## Chantiers techniques

| Chantier | Quand |
| --- | --- |
| Un fichier de données par notion (`lib/entrainement/series/<notion>.ts`) | fait |
| Filtres par classe et par famille sur l'accueil Entraînement (famille déclarée dans chaque fichier de notion) | fait |
| Exercice « écris la bonne forme » (saisie) | fait |
| Exercices avec audio (écouter puis choisir) | avant la vague 6 |
| Script de dictée générique | fait |
| Page /offline manquante | tâche séparée, dès que possible |
| Réglage eslint à retirer de next.config.js | fait |
| getUser() à remplacer par getSession() | tâche séparée |
| Mélange des questions dans les fiches Fondamentaux (Math.random dans useState) | fait pour et-est, a-as-a, on-ont, son-sont, ces-ses, ca-sa, leur-leurs, tout-tous ; les autres quand on y touche |
| Bouton Scolou qui cache le bas des cartes et des boutons sur téléphone | fait (bouton compact et espace en bas de page sur téléphone) |
