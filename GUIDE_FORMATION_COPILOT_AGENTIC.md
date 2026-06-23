# Récapitulatif formation GitHub Copilot Agentic

Ce document résume toutes les étapes parcourues, avec pour chacune :
- un **descriptif**,
- un **objectif**,
- un **prompt solution** à copier-coller dans Copilot.

---

## Étape 1 — Installation et prérequis
**Descriptif** : vérifier l’environnement local et l’authentification GitHub.  
**Objectif** : partir d’une base stable avant d’automatiser avec Copilot.

**Prompt solution (Copilot)** :
```text
Vérifie que mon environnement est prêt pour un workflow agentic :
1) versions de git, gh et copilot
2) statut d’authentification gh
3) check rapide des prérequis manquants
Puis donne un plan d’actions court pour corriger ce qui manque.
```

## Étape 2 — Première session agentic guidée
**Descriptif** : exécuter la boucle complète demande -> diff -> test -> commit -> PR.  
**Objectif** : maîtriser le cycle de base.

**Prompt solution** :
```text
Dans ce repo, ajoute un endpoint GET /health qui retourne {"status":"ok"} avec les tests associés.
Ensuite montre le diff, lance les tests, commit, push et ouvre une PR.
```

## Étape 3 — Prompting efficace
**Descriptif** : structurer la demande avec contexte, contraintes, validation, livrables.  
**Objectif** : réduire les ambiguïtés et obtenir un résultat complet du premier coup.

**Prompt solution** :
```text
Contexte: [stack/fichiers]
Tâche: [changement exact]
Contraintes: [périmètre + règles]
Validation: [commandes]
Livrables Git: [commit/push/PR]
Exécute de bout en bout.
```

## Étape 4 — Revue critique du diff
**Descriptif** : contrôler qualité, périmètre, sécurité et cohérence.  
**Objectif** : garder la responsabilité finale du résultat.

**Prompt solution** :
```text
Fais une revue critique de ta PR :
1) exactitude fonctionnelle
2) périmètre des fichiers
3) sécurité
4) qualité tests
Puis propose les corrections prioritaires seulement.
```

## Étape 5 — Itération ciblée
**Descriptif** : corriger précisément sans “refaire tout”.  
**Objectif** : gagner en fiabilité et en vitesse sur les retours de review.

**Prompt solution** :
```text
Corrige uniquement [problème précis].
Conserve le reste inchangé.
Montre le diff des fichiers modifiés.
Relance uniquement les validations pertinentes.
```

## Étape 6 — Délégation multi-étapes
**Descriptif** : faire exécuter une tâche en phases (analyse, implémentation, tests, PR).  
**Objectif** : piloter les sujets complexes avec traçabilité.

**Prompt solution** :
```text
Découpe la tâche en 4 phases: analyse, implémentation, tests, PR.
Avant chaque phase, donne un mini-plan (3-5 points), exécute, puis résume:
- ce qui a été fait
- fichiers modifiés
- risques restants
Continue automatiquement sauf blocage.
```

## Étape 7 — Gestion des commentaires de review
**Descriptif** : traiter les retours PR un par un.  
**Objectif** : reproduire le workflow d’équipe réel.

**Prompt solution** :
```text
Prends les commentaires de review ouverts.
Traite-les un par un sans élargir le périmètre.
Pour chaque commentaire: changement effectué + fichier impacté.
Relance les tests pertinents puis mets à jour la description de PR.
```

## Étape 8 — PR “ready to merge”
**Descriptif** : clôturer le cycle de correction sans fermer/merger automatiquement.  
**Objectif** : livrer une PR propre, laissée ouverte pour validation humaine.

**Prompt solution** :
```text
Traite tous les commentaires de review ouverts.
Reste strictement dans le périmètre.
Pousse les corrections sur la même branche.
Mets à jour la description de PR (changements + validation + risques).
Laisse la PR ouverte.
```

## Étape 9 — Gestion des blocages
**Descriptif** : imposer un diagnostic structuré quand Copilot patine.  
**Objectif** : transformer l’échec en décision pilotée.

**Prompt solution** :
```text
Tu es bloqué. Stoppe l’implémentation et fais un diagnostic en 3 parties:
1) cause probable
2) options de correction (max 3)
3) option recommandée avec justification
Ensuite applique uniquement l’option recommandée, valide, puis résume.
```

## Étape 10 — Prompt “runbook” standard
**Descriptif** : utiliser un format unique réutilisable pour toutes les missions.  
**Objectif** : industrialiser la collaboration avec Copilot.

**Prompt solution** :
```text
Contexte: [repo/PR/zone]
Objectif: [résultat attendu]
Périmètre: [fichiers autorisés/interdits]
Plan: propose 3-5 étapes puis exécute
Validation: [commandes]
Livrables: [commit/push/update PR]
Contraintes: [sécurité/style/pas de dépendances inutiles]
Rendu: résumé final + fichiers modifiés + risques restants
```

## Étape 11 — Definition of Done (DoD)
**Descriptif** : définir des critères de sortie non négociables.  
**Objectif** : passer de “ça marche” à “c’est livrable”.

**Prompt solution** :
```text
Considère la tâche terminée uniquement si:
1) tous les commentaires sont traités
2) diff strictement dans le périmètre
3) tests pertinents passés
4) description PR à jour
5) aucun secret/debug/TODO injustifié
Sinon continue jusqu’à conformité complète.
```

## Étape 12 — Mission autonome de bout en bout
**Descriptif** : laisser Copilot piloter une mission complète sous contraintes.  
**Objectif** : valider la maîtrise du mode production-ready.

**Prompt solution** :
```text
Mission complète:
1) analyser la demande
2) proposer un plan court
3) implémenter
4) mettre à jour tests/doc
5) lancer validation
6) commit + push
7) ouvrir/mettre à jour PR
8) traiter les reviews jusqu’à ready to merge
Contraintes: périmètre strict, pas de dépendances inutiles, PR laissée ouverte.
```

## Étape 13 (bonus) — Mode Lead Reviewer
**Descriptif** : piloter Copilot comme un tech lead (priorisation P1/P2).  
**Objectif** : améliorer la qualité décisionnelle en revue.

**Prompt solution** :
```text
Je veux une revue de niveau senior sur ta PR.
Donne:
1) risques fonctionnels
2) risques sécurité/performance
3) zones non testées
4) améliorations prioritaires (P1/P2)
Ensuite applique uniquement les P1, relance les tests, et mets à jour la PR.
```

---

## Template final “prêt à l’emploi” (copier-coller)
```text
Prends [PR/repo].
Objectif: [résultat attendu].

Definition of Done:
1) commentaires traités
2) périmètre respecté
3) tests passés
4) description PR à jour
5) aucun changement parasite

Instructions:
1) lire les commentaires
2) proposer mini-plan
3) exécuter corrections ciblées
4) lancer validation
5) commit + push
6) mettre à jour la PR

Contraintes:
- pas de dépendance nouvelle sans justification
- pas de refactor hors sujet
- PR laissée ouverte
```
