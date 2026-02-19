# Cahier des charges — Noxello

## 1) Contexte & objectifs
Noxello est une application de gestion de projets inspirée de Trello. L’objectif est de permettre à un utilisateur de créer des tableaux, organiser des listes (colonnes) et gérer des cartes avec des informations détaillées, tout en offrant une UX fluide et un système de collaboration.

## 2) Périmètre fonctionnel (réalisé)

### Authentification
- Inscription / connexion
- JWT côté API
- Profil utilisateur

### Tableaux (Boards)
- Créer, renommer, supprimer un tableau
- Affichage des tableaux personnels et partagés
- Accès partagé via membres

### Listes (Colonnes)
- Créer, renommer, supprimer une liste
- Réordonner les listes

### Cartes
- Créer, renommer, supprimer une carte
- Réordonner les cartes
- Déplacer des cartes entre listes
- Drag & drop fluide avec aperçu

### Détails d’une carte
- Titre + description
- Date limite (sélecteur personnalisé)
- Labels (couleurs, création, suppression)
- Checklist avec progression
- Commentaires avec auteur et date
- Archivage et désarchivage

### Collaboration
- Inviter des membres sur un board
- Accepter / refuser une invitation
- Rôles simples (owner/membre)
- Liste des membres avec suppression par l’owner

### UX / UI
- Modales custom (confirmation, prompt)
- Thème visuel cohérent
- Interactions fluides
- Mise à jour silencieuse des données

### Déploiement
- Backend déployé sur Render
- Frontend déployé sur Vercel
- CORS configurable
- Santé API (`/healthz`)

## 3) Contraintes techniques
- Backend: Node.js, Express, TypeScript, Prisma
- Base de données: PostgreSQL
- Frontend: React + Vite + TypeScript
- Authentification par JWT
- API REST

## 4) Livrables
- Code source complet (frontend + backend)
- README clair
- Documentation (contribution, cahier des charges)
- Déploiement opérationnel (Vercel + Render)

## 5) Idées d’évolution (roadmap)
- Drag & drop des listes
- Notifications en temps réel (WebSocket)
- Mentions dans les commentaires
- Rôles avancés (admin, éditeur, lecteur)
- Historique des actions (activity log)
- Filtres avancés (par membre, date, label)
- Recherche globale multi‑boards
- Thèmes personnalisés
- Export CSV / PDF

