# GadgetZone API Backend

Une API REST PHP pour la gestion de l'application e-commerce GadgetZone.

## Configuration

### Prérequis
- PHP 8.0 ou supérieur
- PostgreSQL
- WAMP/XAMPP (pour le développement local)

### Installation

1. **Configurer la base de données**
   ```bash
   # Créer la base de données PostgreSQL
   createdb gadgetzone
   
   # Importer le schéma
   psql -d gadgetzone -f database.sql
   ```

2. **Configurer les variables d'environnement**
   - Copiez `.env` et modifiez les valeurs selon votre configuration
   - Mettez à jour `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

3. **Configuration WAMP**
   - Assurez-vous que l'extension PostgreSQL est activée dans `php.ini`
   - Redémarrez Apache

## Endpoints API

### Base URL
```
http://localhost/gadgetzone_admin/api/
```

### Authentification
- Actuellement en mode développement (pas d'authentification requise)
- JWT à implémenter pour la production

### Endpoints disponibles

#### Produits
- `GET /api/products` - Lister tous les produits
- `GET /api/products/{id}` - Obtenir un produit spécifique
- `POST /api/products` - Créer un nouveau produit
- `PUT /api/products/{id}` - Mettre à jour un produit
- `DELETE /api/products/{id}` - Supprimer un produit

#### Utilisateurs
- `GET /api/users` - Lister tous les utilisateurs
- `GET /api/users/{id}` - Obtenir un utilisateur spécifique
- `POST /api/users` - Créer un nouvel utilisateur
- `PUT /api/users/{id}` - Mettre à jour un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

#### Commandes
- `GET /api/orders` - Lister toutes les commandes
- `GET /api/orders/{id}` - Obtenir une commande spécifique
- `POST /api/orders` - Créer une nouvelle commande
- `PUT /api/orders/{id}` - Mettre à jour une commande
- `DELETE /api/orders/{id}` - Supprimer une commande

## Exemples d'utilisation

### Créer un produit
```bash
curl -X POST http://localhost/gadgetzone_admin/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau produit",
    "description": "Description du produit",
    "price": 99.99,
    "stock": 50,
    "category_id": 1
  }'
```

### Lister les produits
```bash
curl http://localhost/gadgetzone_admin/api/products
```

## Structure du projet

```
api/
├── index.php              # Point d'entrée principal
├── config/
│   ├── Database.php       # Gestion de la base de données
│   └── Config.php         # Configuration de l'application
├── controllers/
│   ├── ProductController.php
│   ├── UserController.php
│   └── OrderController.php
├── database.sql           # Schéma de la base de données
├── .env                   # Variables d'environnement
└── README.md
```

## Sécurité

- Utilisation de PDO avec requêtes préparées
- Hashage des mots de passe avec `password_hash()`
- Configuration CORS pour les requêtes cross-origin
- Validation des entrées utilisateur

## Développement

Pour activer le mode développement, définissez `APP_ENV=development` dans votre fichier `.env`. Cela affichera les messages d'erreur détaillés.

## Prochaines améliorations

- Implémentation JWT pour l'authentification
- Validation plus robuste des entrées
- Tests unitaires
- Documentation Swagger/OpenAPI
- Rate limiting
- Logging des erreurs
