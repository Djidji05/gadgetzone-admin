# Backend GadgetZone Admin

## Architecture Intégrée

Ce backend est intégré directement dans le projet Vue.js pour créer un système d'administration monolithique.

## Structure

```
backend/
├── config/
│   └── database.js     # Configuration Sequelize
├── models/
│   └── index.js         # Modèles de données
├── routes/
│   ├── index.js        # Routes principales
│   ├── stats.js        # API Statistiques
│   ├── products.js     # API Produits
│   ├── clients.js      # API Clients
│   └── orders.js       # API Commandes
└── server.js           # Serveur Express principal
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer l'environnement :
```bash
cp .env.backend .env
# Éditer .env avec vos configurations
```

3. Démarrer le backend :
```bash
npm run dev:backend
```

## Scripts Disponibles

- `npm run dev:backend` - Démarrer le backend en développement
- `npm run dev:full` - Démarrer frontend + backend simultanément
- `npm run start:backend` - Démarrer le backend en production
- `npm run start:full` - Démarrer frontend + backend en production

## API Endpoints

### Statistiques
- `GET /api/stats/overview` - Statistiques générales
- `GET /api/stats/top-products` - Produits populaires
- `GET /api/stats/top-clients` - Meilleurs clients
- `GET /api/stats/traffic-sources` - Sources de trafic
- `GET /api/stats/conversion-rate` - Taux de conversion

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Mettre à jour un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Clients
- `GET /api/clients` - Liste des clients

### Commandes
- `GET /api/orders` - Liste des commandes

## Configuration Base de Données

Le backend utilise PostgreSQL avec Sequelize. Assurez-vous que PostgreSQL est en cours d'exécution et que la base de données `gadgetzone` existe.

```sql
CREATE DATABASE gadgetzone;
```

## Développement

Le backend est configuré pour:
- Utiliser ES Modules (`"type": "module"`)
- Supporter le hot-reload avec nodemon
- Logger avec Morgan
- Sécurité avec Helmet
- CORS configuré pour le frontend

## Prochaines Étapes

1. Implémenter les modèles Sequelize réels
2. Ajouter l'authentification JWT
3. Ajouter la validation des données
4. Implémenter les logs et monitoring
5. Ajouter les tests unitaires
