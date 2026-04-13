# 🇭🇹 Guide d'Intégration MonCash - HTFasil

Ce document explique comment configurer et tester l'intégration de paiement MonCash (Mode Sandbox).

## 1. Prérequis
Avant de commencer, assurez-vous d'avoir :
- Un compte **MonCash Business Sandbox** (Portail Développeur Digicel).
- Vos identifiants **Client ID** et **Client Secret**.

## 2. Installation
Le module nécessaire est déjà installé dans le projet `htfasil_admin` :
```bash
npm install moncash-sdk
```

## 3. Configuration (.env)
Pour que le backend puisse communiquer avec MonCash, vous devez configurer les variables d'environnement.

Ouvrez le fichier `c:\wamp64\www\Gadget\htfasil_admin\.env` (ou `.env.backend`) et ajoutez/modifiez ces lignes :

```ini
# Configuration MonCash Sandbox
MONCASH_CLIENT_ID=votre_client_id_ici
MONCASH_CLIENT_SECRET=votre_client_secret_ici
# URL de l'API Sandbox (Par défaut)
MONCASH_API_URL=https://sandbox.moncashbutton.digicelhaiti.com/Api
```

⚠️ **Important :** Après toute modification du fichier `.env`, redémarrez le serveur backend (`npm run dev:backend`).

## 4. Fonctionnement Technique

### Flux de paiement
1. **Checkout (Frontend)** : L'utilisateur choisit "Mon Cash" et clique sur "Passer la commande".
2. **Création Commande** : Une commande est créée avec le statut "En attente".
3. **Appel API** : Le frontend contacte `/api/paiements/init-moncash` avec l'ID de commande et le montant.
4. **Redirection** : Le backend utilise le SDK pour obtenir une URL de paiement MonCash. Le frontend redirige l'utilisateur vers cette URL.
5. **Paiement** : L'utilisateur paie sur le site sécurisé de MonCash.
6. **Retour** : L'utilisateur est redirigé vers la page de succès de HTFasil.

### Fichiers Clés
- **Backend Service** : `src/backend/services/moncash.service.js` (Logique SDK)
- **Backend Route** : `src/backend/routes/paiements.js` (Endpoint API)
- **Frontend View** : `src/views/CheckoutView.vue` (Interface utilisateur)

## 5. Comment Tester (Sandbox)
1. Assurez-vous que le backend tourne sans erreur.
2. Allez sur le site, ajoutez un produit au panier.
3. Allez au Checkout, sélectionnez **Mon Cash**.
4. Cliquez sur **Passer la commande**.
5. Vous devriez être redirigé vers `sandbox.moncashbutton.digicelhaiti.com`.
6. Connectez-vous avec un compte de test MonCash (numéro de téléphone sandbox) pour valider la transaction.

## 6. Dépannage
- **Erreur "Module not found"** : Vérifiez que `moncash-sdk` est bien installé (`npm list moncash-sdk`).
- **Erreur 401/Auth** : Vérifiez vos Client ID/Secret dans le `.env`.
- **Redirection échoue** : Regardez la console du terminal backend pour voir l'erreur exacte retournée par le SDK.
