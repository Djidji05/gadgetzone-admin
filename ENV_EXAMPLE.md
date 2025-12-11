# Configuration complète - GadgetZone Admin

## Variables d'environnement requises

### Backend & Serveur
BACKEND_PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

### Base de Données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gadgetzone
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

### Authentification JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=24h

### Email (Optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@gadgetzone.com

### OAuth (Optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

### Paiements (Optionnel)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

### Upload & Monitoring (Optionnel)
MAX_FILE_SIZE=10
UPLOAD_DIR=./public/uploads
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
