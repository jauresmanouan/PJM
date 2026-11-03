# Voix off — vidéo d'inscription 2026

Le texte de référence est dans `voix.json`. C'est lui que `mixer.js` utilise pour placer chaque phrase. Si vous changez une phrase, changez-la là-bas.

## Ton général

Une voix posée, chaleureuse et confiante, comme une invitation et pas comme une publicité. On sourit dans la voix sans en faire trop. Le rythme est calme au début, s'anime sur les trois étapes et sur les coupes rapides, puis redevient solennel sur la date et l'appel final.

La plupart des participants sont en Côte d'Ivoire et au Cameroun. Dans la Voice Library d'ElevenLabs, filtrez sur le français et comparez une voix de France avec une voix au léger accent d'Afrique de l'Ouest : la seconde peut parler plus directement au public.

## Le texte, phrase par phrase

Générez **une phrase par fichier** et nommez chaque fichier avec son numéro (`01.mp3`, `02.mp3`… `11a.mp3`). Déposez-les dans `Video/voix/`. « Place » indique la durée maximale pour que la phrase finisse avant le plan suivant.

| N° | Début | Place | À l'écran | Texte à faire lire | Intention |
|---|---|---|---|---|---|
| 01 | 0:00.6 | 6,2 s | Un jour. / Une Mère. / Des milliers de roses. | Chaque année, un même jour... pour une Mère... des milliers de roses. | Lent, presque murmuré, mystère |
| 02 | 0:09.6 | 5,0 s | Logo, POUR LA JOIE DE MARIE | C'est « Pour la Joie de Marie ». Et en deux mille vingt-six, nous revenons. | Chaleureux, fierté |
| 03 | 0:15.5 | 3,7 s | 1 939 roses offertes | En deux éditions, près de deux mille roses offertes. | Enthousiaste |
| 04 | 0:20.0 | 4,6 s | 9 pays. Un seul bouquet. | Depuis neuf pays... un seul et même bouquet. | Ample, unité |
| 05 | 0:26.0 | 5,4 s | Galerie de photos | Dans chaque paroisse, une rose devient prière. | Doux, recueilli |
| 06 | 0:32.2 | 4,0 s | Cette année, c'est votre tour. | Cette année... c'est votre tour. | Direct, on regarde la personne |
| 07 | 0:37.4 | 2,4 s | 3 gestes. C'est tout. | Trois gestes. C'est tout. | Léger, rassurant |
| 08 | 0:40.4 | 5,3 s | 1 — Je m'inscris | Un : vous vous inscrivez, avec le nombre de roses à offrir. | Clair, explicatif |
| 09 | 0:46.4 | 5,3 s | 2 — J'achète mes roses | Deux : vous achetez vous-même vos roses. Aucun argent à nous envoyer. | Clair, appuyer « aucun argent » |
| 10 | 0:52.4 | 5,3 s | 3 — Je les dépose le 8 décembre | Trois : vous les déposez dans votre paroisse, le huit décembre. | Clair, plus posé |
| 11a | 0:59.5 | 1,0 s | Vos roses. | Vos roses. | Percutant, sur le temps |
| 11b | 1:00.5 | 1,1 s | Votre paroisse. | Votre paroisse. | Percutant |
| 11c | 1:01.6 | 1,0 s | Votre cœur. | Votre cœur. | Plus doux |
| 12 | 1:02.7 | 3,1 s | Le même jour, UNIS | Le même jour, unis partout dans le monde. | Montée, émotion |
| 13 | 1:06.3 | 3,3 s | 8 DÉCEMBRE 2026 | Le huit décembre deux mille vingt-six. | Solennel, détacher chaque mot |
| 14 | 1:10.4 | 2,4 s | Objectif 1 000 roses | Objectif : mille roses. | Élan, défi |
| 15 | 1:13.6 | 5,8 s | Joignez votre rose aux nôtres, Participer | Joignez votre rose aux nôtres. Inscrivez-vous sur pour la joie de marie point com. | Chaleureux puis net sur l'adresse |

Texte d'un seul bloc, pour écouter une voix avant de tout générer :

> Chaque année, un même jour... pour une Mère... des milliers de roses. C'est « Pour la Joie de Marie ». Et en deux mille vingt-six, nous revenons. En deux éditions, près de deux mille roses offertes. Depuis neuf pays... un seul et même bouquet. Dans chaque paroisse, une rose devient prière. Cette année... c'est votre tour. Trois gestes. C'est tout. Un : vous vous inscrivez, avec le nombre de roses à offrir. Deux : vous achetez vous-même vos roses. Aucun argent à nous envoyer. Trois : vous les déposez dans votre paroisse, le huit décembre. Vos roses. Votre paroisse. Votre cœur. Le même jour, unis partout dans le monde. Le huit décembre deux mille vingt-six. Objectif : mille roses. Joignez votre rose aux nôtres. Inscrivez-vous sur pour la joie de marie point com.

## Réglages ElevenLabs conseillés

Ce sont des points de départ ; l'interface peut évoluer, ajustez à l'oreille.

- **Modèle** : un modèle multilingue (Multilingual v2, ou v3 s'il sonne mieux en français pour la voix choisie).
- **Stabilité** : autour de 50 %. Plus bas, la voix est plus expressive mais varie d'une prise à l'autre ; plus haut, elle devient monotone.
- **Similarité** : autour de 75 %.
- **Style / exagération** : bas (0 à 20 %). Au-delà, le ton devient théâtral.
- **Vitesse** : 1,0 par défaut. Si `mixer.js` signale une phrase trop longue, passez à 1,05–1,1 pour cette phrase seulement.
- **Pauses** : les points de suspension « ... » suffisent. Le modèle v2 accepte aussi `<break time="0.5s" />`.
- **Nombres et adresse** : déjà écrits en toutes lettres (« huit décembre », « point com ») pour éviter les lectures hasardeuses.
- Gardez **la même voix et les mêmes réglages** pour toutes les phrases. Générez plusieurs prises de chaque phrase et gardez la meilleure.
- Exportez en **MP3 44,1 kHz** ou en WAV.

## Assembler

```bash
cd Video
npm run mix
```

Le script indique la durée de chaque phrase face à sa place, signale celles qui débordent, baisse la musique sous la voix et produit `PJM-2026-inscription-voix.mp4`. Si la voix est trop faible ou trop forte par rapport à la musique : `GAIN_VOIX=1.3 npm run mix` (ou `0.8`).
