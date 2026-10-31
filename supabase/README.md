# Base de données et emails

## Mise en place

1. **Supabase** : créer le projet, puis coller `schema.sql` dans SQL Editor et l'exécuter (rejouable sans risque).
2. **Resend** : ajouter et vérifier le domaine d'envoi (enregistrements DNS SPF et DKIM), créer une clé API.
3. **Vercel** : renseigner les variables de `.env.example` (Settings > Environment Variables) et déployer.
   Le cron quotidien (`vercel.json`) appelle `/api/relances` chaque jour à 08h00 UTC.
4. **Webhook Resend** : Webhooks > ajouter `https://<votre-site>/api/resend-webhook`, événements
   `email.bounced` et `email.complained`, puis copier le secret dans `RESEND_WEBHOOK_SECRET`.

## Emails envoyés

| Type | Quand | Qui |
| --- | --- | --- |
| `confirmation` | à l'inscription (et à chaque modification) | le participant |
| `relance_j14` | de J-14 à J-8 | inscrits depuis 2 jours ou plus |
| `relance_j7` | de J-7 à J-2 | idem |
| `relance_j1` | la veille | inscrits depuis 1 jour ou plus |
| `jour_j` | le 8 décembre | idem |
| `merci` | de J+1 à J+7 | idem |

Règles : un type d'email n'est envoyé qu'une fois par personne (table `email_logs`) ; deux relances ne
partent jamais à moins de 5 jours d'écart ; les personnes désabonnées, ou dont l'adresse a rebondi ou
signalé un spam, ne reçoivent plus de campagnes. Les dates viennent de la table `editions`.

## Tester sans rien envoyer

```
curl -H "Authorization: Bearer $CRON_SECRET" "https://<votre-site>/api/relances?dry=1"
```

Renvoie, par édition, le type d'email du jour et le nombre de destinataires. Pour forcer un type :
`&kind=relance_j7`. La logique de calendrier et les modèles se vérifient avec `npm run check:mail`.

## Développement local

`vercel dev` (et non `vite`) sert le site et le dossier `api/` ensemble.
