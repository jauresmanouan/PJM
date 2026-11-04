# Vidéo d'inscription — méthode

Vidéo motion design de 90 s (1080p, 30 i/s) produite entièrement par du code : aucune banque d'images ni de sons, aucun logiciel de montage.

| Fichier | Rôle |
|---|---|
| `annee.json` | **Tout ce qui change chaque année** : année, chiffres, pays, objectif, photos |
| `roses/` | Vraies roses détourées (6 formes × 4 couleurs), bouton, rose ouverte, photo du bouquet |
| `scene.html` | L'animation. Chaque image est une fonction du temps `seek(t)` dessinée sur un canvas |
| `render.js` | Ouvre `scene.html` dans Chrome sans interface, capture toutes les images, encode `muet.mp4` |
| `audio.js` | Synthétise la musique (120 BPM, ré majeur) et les bruitages calés sur l'image → `son.wav` |
| `voix/voix-off.mp3` | La voix off enregistrée sur ElevenLabs : **le film est construit sur elle** |
| `aligner.py` | Horodate chaque mot de la voix avec Whisper → `voix/mots.json` |
| `mixer.js` | Pose la voix, baisse la musique sous la voix, assemble la vidéo finale |

## Prérequis

- Node, ffmpeg (`brew install ffmpeg`), Google Chrome.
- Polices installées sur le Mac : **Raleway** (textes) et **Montserrat Black** (chiffres : ceux de Raleway sont « à l'ancienne », le 9 descend sous la ligne).
- Une fois : `cd Video && npm install`.

## Refaire la vidéo une nouvelle année

1. **Écrire le texte et enregistrer la voix** sur ElevenLabs (2026 : voix « Manon », nombres en toutes lettres), puis la déposer dans `voix/voix-off.mp3`.
2. **Horodater la voix** : `pip install faster-whisper`, puis `npm run aligner`. On obtient `voix/mots.json` : chaque mot avec son instant. Whisper place parfois un mot un peu tôt après un silence : vérifier les débuts de phrase avec `ffmpeg -i voix/voix-off.mp3 -af silencedetect=n=-38dB:d=0.28 -f null -`.
3. **Mettre à jour `annee.json`** : `annee`, `rosesOffertes` (somme des éditions passées, voir `Bilan.tsx`), `editions` (« EN TROIS ÉDITIONS »…), `nbPays` et `pays`, `objectif`, la liste `photos` (noms sans `.JPG`, pris dans `public/images/photos/`), `hook` (durée de l'accroche avant la voix) `duree` et `vitesseVoix` (la voix est accélérée de ce facteur, sans changer sa hauteur : `hook` + durée de la voix / `vitesseVoix` + 1,5 s = `duree` ; rester sous 1,05 pour que cela ne s'entende pas).
4. **Recaler `scene.html` et `audio.js` sur la voix** : les scènes `sceneV(a, b, …)` et les bruitages `…V(t)` sont écrits en temps voix. Reporter dans chaque `letters(…, v, instant)` l'instant du mot dans `mots.json`.
5. **Vérifier quelques images** sans tout rendre : `node render.js still 1 8 20 50` (temps film = temps voix / `vitesseVoix` + `hook`) produit `still-<t>.jpg`.
6. **Rendre** : `npm run images` (environ 5 minutes), `npm run son`, `npm run mix` → `PJM-<année>-inscription-voix.mp4`. La musique baisse sous la voix ; `GAIN_VOIX=2.5 npm run mix` pour ajuster.

Sans voix off, la vidéo seule s'obtient avec :
```bash
ffmpeg -i muet.mp4 -i son.wav -c:v copy -c:a aac -b:a 256k -shortest PJM-2026-inscription.mp4
```

## Modifier l'animation

- Le film est une suite de scènes déclarées dans `scene.html` par `sceneV(début, fin, dessin, transition)`. La transition (`petales` : vague de pétales aux changements de chapitre, `whip` : panoramique avec traînée, `zoom` : zoom flou et flash, `flash`, `cut`) se joue à l'entrée de la scène.
- Outils de dessin réutilisables : `letters` (révélation lettre par lettre avec flou), `words` (mot par mot), `txt` (texte avec flou, traînée de vitesse, contour), `logo` (tracé progressif et étoiles), `sprite` et `roseHero` (roses de `roses/`, du bouton à la fleur ouverte), `card` (photo encadrée), `plaque` (photo plein écran teintée), `galerie`, `petals`, `bokeh`, `rays`, `warp`, `ring`.
- **Si vous déplacez un instant dans `scene.html`, déplacez le bruitage correspondant dans `audio.js`** (section « bruitages calés sur l'image »). Les deux fichiers partagent la même horloge en secondes ; un temps musical vaut 0,5 s.
- Couleurs : celles du site (`bleu #0A71B8`, `jaune #F39200`), dans l'objet `C` en tête de `scene.html`.
- Le logo est lu directement dans `public/images/logoPJM3.svg` : un nouveau logo au même format s'anime tout seul.

Les rendus (`*.mp4`, `*.wav`) ne sont pas versionnés : ils se régénèrent avec les commandes ci-dessus.
