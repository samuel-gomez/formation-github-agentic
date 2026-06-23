# formation-github-agentic

> Atelier pratique — découvrir et maîtriser le **workflow agentic GitHub Copilot** en conditions réelles.

## Objectif
Ce dépôt sert à simuler un cycle complet avec Copilot en mode agentic.

---

## 🎯 Objectifs pédagogiques

À l'issue de cet atelier, vous saurez :

1. **Formuler** une demande claire à un agent Copilot (contexte, objectif, contraintes).
2. **Lire et valider** un diff généré avant de l'accepter.
3. **Vérifier** que les tests passent après chaque modification agentique.
4. **Commiter et pousser** une branche depuis l'agent.
5. **Ouvrir et relire** une Pull Request avec un regard critique.

---

## 🛠 Prérequis

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| Node.js | 18+ | `node -v` |
| Git | 2.40+ | `git --version` |
| GitHub CLI (`gh`) | 2.40+ | `gh --version` |
| GitHub Copilot CLI | dernière | `gh copilot --version` |

> Vous devez être connecté : `gh auth login`

---

## 🚀 Démarrage rapide

```bash
git clone https://github.com/samuel-gomez/formation-github-agentic.git
cd formation-github-agentic
npm install
npm test        # 12 tests doivent passer
node index.js   # serveur sur http://localhost:3000
```

---

## 🔄 Cycle agentic — déroulé pas-à-pas

Un cycle complet se déroule en **5 étapes** :

### 1. Formuler la demande

Rédigez un prompt précis avec :
- **Contexte** : quel fichier, quelle couche, quel comportement existant
- **Objectif** : ce qui doit changer / être ajouté
- **Contraintes** : ne pas casser X, rester en Y, utiliser Z

```
Exemple :
"Dans ce repo Express, ajoute un endpoint GET /ping qui retourne
{"pong": true}. Ajoute le test associé dans app.test.js.
Ne modifie pas les autres routes. Lance les tests."
```

### 2. Lire le diff avant d'accepter

Avant toute validation, inspectez :

- [ ] Les fichiers modifiés correspondent-ils au périmètre demandé ?
- [ ] Aucun fichier hors-scope n'a été touché ?
- [ ] Le code ajouté est lisible et cohérent avec le style existant ?
- [ ] Pas de secret, de `console.log` de debug ou de `TODO` laissé ?

### 3. Vérifier les tests

```bash
npm test
```

- Tous les tests existants doivent rester **verts**.
- Les nouveaux tests doivent couvrir le **cas nominal**, le **cas d'erreur** et les **cas limites**.

### 4. Commiter avec un message explicite

Convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: add GET /ping endpoint
fix: handle missing body in POST /auth/login
docs: add rate limiting section to README
```

```bash
git add <fichiers>
git commit -m "feat: ..."
git push -u origin <branche>
```

### 5. Ouvrir et relire la PR

```bash
gh pr create --title "..." --body "..."
```

Utilisez le **template de PR** fourni (`.github/pull_request_template.md`).

---

## ✅ Checklist de revue de PR

Avant d'approuver une PR générée par un agent :

**Fonctionnel**
- [ ] Le comportement décrit dans le titre correspond au code
- [ ] Les tests couvrent les cas nominaux et les cas d'erreur
- [ ] `npm test` passe sans modification manuelle

**Qualité**
- [ ] Aucune régression sur les routes existantes
- [ ] Pas de dépendance externe non justifiée
- [ ] Messages de commit clairs et atomiques

**Sécurité**
- [ ] Pas de secret ou de donnée sensible dans le diff
- [ ] Les nouvelles routes sont validées / protégées si nécessaire

**Documentation**
- [ ] Le README reflète les changements si besoin
- [ ] Les variables d'environnement nouvelles sont documentées

---

## 📁 Structure du projet

```
.
├── app.js                        # Application Express (routes)
├── app.test.js                   # Tests /health et /version
├── index.js                      # Point d'entrée (serveur)
├── middleware/
│   └── rateLimiter.js            # Rate limiter in-memory
├── routes/
│   ├── auth.js                   # Routes /auth/* (login, reset, verify)
│   └── auth.test.js              # Tests rate limiting
└── .github/
    ├── CODEOWNERS                # Revue obligatoire
    ├── pull_request_template.md  # Template de PR
    └── ISSUE_TEMPLATE/
        └── atelier-task.yml      # Template d'exercice
```

---

## 🌐 API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Retourne `status`, `requestId`, `timestamp` |
| GET | `/version` | Retourne `version` et `requestId` |
| POST | `/auth/login` | Authentification (rate limité) |
| POST | `/auth/reset-password` | Réinitialisation de mot de passe (rate limité) |
| POST | `/auth/verify-code` | Vérification de code (rate limité) |

---

## 🔎 Traçabilité des requêtes

L'API expose un `requestId` pour faciliter le suivi des logs :

- Si le client envoie `x-request-id`, la valeur est réutilisée.
- Sinon, l'API génère un identifiant unique.
- La réponse inclut toujours l'en-tête `X-Request-Id`.

Exemple :

```http
GET /health
X-Request-Id: training-id-001
```

```json
{
  "status": "ok",
  "requestId": "training-id-001",
  "timestamp": "2026-06-23T13:00:00.000Z"
}
```

---

## ⚙️ Rate Limiting

Les endpoints `/auth/*` sont protégés par un rate limiter in-memory configurable.

| Variable d'environnement | Description | Défaut |
|--------------------------|-------------|--------|
| `RATE_LIMIT_WINDOW_MS` | Durée de la fenêtre fixe (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Nombre max de requêtes par fenêtre et par IP | `5` |
| `TRUST_PROXY` | Valeur Express `trust proxy` pour un déploiement derrière reverse proxy (`false` pour désactiver) | `1` |

Réponse en cas de dépassement :

```http
HTTP 429 Too Many Requests
Retry-After: <secondes>

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in X second(s).",
  "retryAfter": 42
}
```

---

## ✅ Validation des payloads `/auth/*`

Les routes d'authentification valident désormais la présence/forme minimale des entrées :

| Route | Payload attendu |
|-------|-----------------|
| `POST /auth/login` | `{ "username": "string", "password": "string" }` |
| `POST /auth/reset-password` | `{ "email": "user@example.com" }` |
| `POST /auth/verify-code` | `{ "code": "123456" }` (6 chiffres) |

En cas d'entrée invalide :

```http
HTTP 400 Bad Request
X-Request-Id: <id>

{
  "error": "Bad Request",
  "message": "<explication>",
  "requestId": "<id>"
}
```

> Le header `X-Request-Id` est toujours présent sur les réponses d'erreur (400, 429) pour faciliter la corrélation des logs côté support.

---

## 🧪 Tests

```bash
npm test
```

---

## 🧩 Exercice review #2
Objectif : pratiquer le traitement des commentaires de revue dans une PR.

### Critères de done
- [ ] Tous les commentaires inline sont traités et résolus
- [ ] Aucun fichier hors `README.md` n'a été modifié
- [ ] La description de PR est mise à jour avec le résumé des corrections

### Étapes
1. Lire les commentaires de review
2. Corriger la documentation dans le périmètre demandé
3. Valider que rien n'est cassé : `npm test`
4. Mettre à jour la PR avec un résumé des changements

---

## 🧩 Exercice blocage #3
Objectif : pratiquer la gestion d'un agent bloqué ou hors périmètre.

### Critères de done
- [ ] Les corrections sont limitées à la section demandée dans `README.md`
- [ ] `npm test` passe sans modification manuelle
- [ ] La description de PR est mise à jour avec le résumé des corrections

### Scénario
- L'agent modifie des sections non demandées du README.
- Les changements répondent partiellement à la demande initiale.

### Étapes proposées
1. Demander un diagnostic structuré en 3 parties
2. Choisir l'option de correction recommandée
3. Valider que rien n'est cassé : `npm test`
4. Appliquer uniquement la correction ciblée
5. Mettre à jour la description de PR
