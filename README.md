# formation-github-agentic
Atelier pratique GitHub workflow agentic

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Retourne `{"status":"ok"}` |
| GET | `/version` | Retourne la version depuis `package.json` |
| POST | `/auth/login` | Authentification (rate limité) |
| POST | `/auth/reset-password` | Réinitialisation de mot de passe (rate limité) |
| POST | `/auth/verify-code` | Vérification de code (rate limité) |

## Rate Limiting

Les endpoints d'authentification (`/auth/*`) sont protégés par un rate limiter in-memory configurable.

| Variable d'environnement | Description | Défaut |
|--------------------------|-------------|--------|
| `RATE_LIMIT_WINDOW_MS` | Durée de la fenêtre fixe (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Nombre max de requêtes par fenêtre et par IP | `5` |
| `TRUST_PROXY` | `false` pour désactiver le trust proxy Express | activé (1 hop) |

Quand la limite est dépassée, l'API retourne :

~~~http
HTTP 429 Too Many Requests
Retry-After: <secondes>

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in X second(s).",
  "retryAfter": 42
}
~~~

## Démarrage

```bash
npm install
node index.js
```

## Tests

```bash
npm test
```
