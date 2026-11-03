# Vidéo d'inscription — méthode

Vidéo motion design de 80 s (1080p, 30 i/s) produite entièrement par du code : aucune banque d'images ni de sons, aucun logiciel de montage.

| Fichier | Rôle |
|---|---|
| `annee.json` | **Tout ce qui change chaque année** : année, chiffres, pays, objectif, photos |
| `scene.html` | L'animation. Chaque image est une fonction du temps `seek(t)` dessinée sur un canvas |
| `render.js` | Ouvre `scene.html` dans Chrome sans interface, capture les 2 400 images, encode `muet.mp4` |
| `audio.js` | Synthétise la musique (120 BPM, ré majeur) et les bruitages calés sur l'image → `son.wav` |
| `voix.json` | Texte de la voix off, avec le début et la durée disponible de chaque phrase |
| `voix-off.md` | Le texte à donner à ElevenLabs, avec le ton et les réglages |
| `mixer.js` | Pose la voix, baisse la musique sous la voix, assemble la vidéo finale |

## Prérequis

- Node, ffmpeg (`brew install ffmpeg`), Google Chrome.
- Polices installées sur le Mac : **Raleway** (textes) et **Montserrat Black** (chiffres : ceux de Raleway sont « à l'ancienne », le 9 descend sous la ligne).
- Une fois : `cd Video && npm install`.

## Refaire la vidéo une nouvelle année

1. **Mettre à jour `annee.json`** : `annee`, `rosesOffertes` (somme des éditions passées, voir `Bilan.tsx`), `editions` (« EN TROIS ÉDITIONS »…), `nbPays` et `pays`, `objectif`, et la liste `photos` (noms sans `.JPG`, pris dans `public/images/photos/`).
2. **Vérifier quelques images** sans tout rendre :
   ```bash
   node render.js still 13 17.5 22 30 49 67.5 72 76.5
   ```
   Cela produit `still-<t>.jpg`. Regardez si un texte déborde (un nom de pays ou un chiffre plus long qu'avant, par exemple).
3. **Rendre l'image** : `npm run images` (environ 4 minutes).
4. **Rendre le son** : `npm run son` (quelques secondes).
5. **Voix off** : adapter `voix.json` (l'année, les chiffres, en toutes lettres), puis :
   - `npm run test-voix` produit une version avec une voix provisoire du Mac, pour vérifier le calage ;
   - générer les phrases avec ElevenLabs :
     ```bash
     VOICE_ID=JBFqnCBsd6RMkjVDRZzb npm run voix
     ```
     La clé va dans `Video/.env.local` (`ELEVENLABS_API_KEY=...`), avec les permissions *Text to Speech* et *Voices (Read)*. En 2026 : voix « George », modèle `eleven_v3`, texte déclaré en français. Le script garde la prise brute dans `voix/brut/` (supprimer un fichier pour régénérer cette phrase seulement). Il retire les silences et accélère d'au plus 15 %, sans changer la hauteur, les phrases qui débordent de leur plan. On peut aussi déposer des MP3 faits sur le site d'ElevenLabs dans `voix/01.mp3`, `voix/02.mp3`…
   - `npm run mix` produit `PJM-<année>-inscription-voix.mp4`. La musique baisse sous la voix (la voix passe 9 à 17 LU au-dessus) ; `GAIN_VOIX=1.5 npm run mix` pour ajuster.

Sans voix off, la vidéo seule s'obtient avec :
```bash
ffmpeg -i muet.mp4 -i son.wav -c:v copy -c:a aac -b:a 256k -shortest PJM-2026-inscription.mp4
```

## Modifier l'animation

- Le film est une suite de scènes déclarées dans `scene.html` par `scene(début, fin, dessin, transition)`. La transition (`whip` : panoramique avec traînée, `zoom` : zoom flou et flash, `flash`, `cut`) se joue à l'entrée de la scène.
- Outils de dessin réutilisables : `letters` (révélation lettre par lettre avec flou), `words` (mot par mot), `txt` (texte avec flou, traînée de vitesse, contour), `logo` (tracé progressif et étoiles), `card` (photo encadrée), `petals`, `bokeh`, `rays`, `warp`, `ring`.
- **Si vous déplacez un instant dans `scene.html`, déplacez le bruitage correspondant dans `audio.js`** (section « bruitages calés sur l'image ») et la phrase dans `voix.json`. Les trois fichiers partagent la même horloge en secondes ; un temps musical vaut 0,5 s.
- Couleurs : celles du site (`bleu #0A71B8`, `jaune #F39200`), dans l'objet `C` en tête de `scene.html`.
- Le logo est lu directement dans `public/images/logoPJM3.svg` : un nouveau logo au même format s'anime tout seul.

Les rendus (`*.mp4`, `*.wav`) ne sont pas versionnés : ils se régénèrent avec les commandes ci-dessus.
