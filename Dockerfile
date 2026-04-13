# Étape 1 : Build de l'interface Admin
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copie des fichiers de package pour le cache
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Construction de l'interface Admin (Vite)
RUN npm run build-only

# Étape 2 : Runtime Node.js
FROM node:20-alpine

WORKDIR /app

# Copie du package.json et package-lock.json
COPY package*.json ./
RUN npm install --production

# Copie du serveur et des fichiers nécessaires
COPY server.js ./
COPY src/backend ./src/backend
# Copie du dossier dist construit à l'étape 1
COPY --from=build-stage /app/dist ./dist

# Création du dossier d'uploads (persistent volume)
RUN mkdir -p public/uploads/products

# Configuration environnement
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Lancement du serveur
CMD ["node", "server.js"]
