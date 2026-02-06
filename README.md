# 🎉 Event Manager - Application de Gestion d'Événements

Une application web moderne pour créer, découvrir et gérer des événements avec un système d'inscription et de gestion des participants.

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?style=flat&logo=postgresql)

## ✨ Fonctionnalités

### 👤 Authentification
- Inscription et connexion sécurisées
- Gestion de profil avec photo de profil
- Sessions persistantes avec JWT

### 📅 Gestion des Événements
- Créer des événements avec image, titre, description, date et nombre de places
- Modifier et supprimer ses propres événements
- Uploader des images pour les événements
- Validation : impossible de créer un événement dans le passé

### 🔍 Découverte
- Parcourir tous les événements disponibles
- Recherche par titre
- Filtrer les événements complets
- Voir les détails (description, image, organisateur, participants)
- S'inscrire/se désinscrire des événements

### 🎨 Interface Utilisateur
- Design moderne en dark mode par défaut
- **Mode sombre/clair** avec toggle persistant
- Interface responsive (mobile, tablette, desktop)
- Animations fluides
- Notifications toast élégantes
- Modals de confirmation

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **React Router** pour la navigation
- **Vite** comme bundler
- **Lucide React** pour les icônes
- **React Hot Toast** pour les notifications

### Backend
- **Node.js** avec Express
- **PostgreSQL** comme base de données
- **JWT** pour l'authentification
- **Bcrypt** pour le hashage des mots de passe
- **Multer** pour l'upload de fichiers

## 📋 Prérequis

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **PostgreSQL** >= 15.x

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/event-manager.git
cd event-manager
```

### 2. Configuration Backend

```bash
cd backend
npm install
```

#### Créer la base de données PostgreSQL

```sql
-- Connectez-vous à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE event_manager;

-- Se connecter à la base
\c event_manager

-- Créer la table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    event_image VARCHAR(255),
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table event_registrations
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);
```

#### Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=event_manager

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Server
PORT=5000
```

#### Créer le dossier uploads

```bash
mkdir uploads
```

### 3. Configuration Frontend

```bash
cd ../frontend  # ou retournez à la racine si le frontend est là
npm install
```

#### Vérifier la configuration Vite

Assurez-vous que `vite.config.ts` contient :

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## 🎯 Lancement de l'Application

### Démarrer le Backend

```bash
cd backend
npm start
# ou en mode développement :
npm run dev
```

Le serveur backend démarre sur `http://localhost:5000`

### Démarrer le Frontend

Dans un autre terminal :

```bash
cd frontend  # ou à la racine
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### Accéder à l'application

Ouvrez votre navigateur sur : **http://localhost:5173**

## 📁 Structure du Projet

```
event-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # Configuration PostgreSQL
│   ├── controllers/
│   │   ├── auth.controller.js    # Logique d'authentification
│   │   └── event.controller.js   # Logique des événements
│   ├── middleware/
│   │   ├── auth.middleware.js    # Vérification JWT
│   │   └── upload.middleware.js  # Configuration Multer
│   ├── routes/
│   │   ├── auth.routes.js        # Routes auth
│   │   └── event.routes.js       # Routes événements
│   ├── uploads/                  # Dossier des images uploadées
│   ├── utils/
│   │   └── jwt.js                # Utilitaires JWT
│   ├── server.js                 # Point d'entrée
│   └── package.json
│
├── frontend/ (ou src/)
│   ├── hooks/
│   │   └── useTheme.ts           # Hook pour dark/light mode
│   ├── pages/
│   │   ├── App.tsx               # Login/Signup
│   │   ├── Profile.tsx           # Profil utilisateur
│   │   ├── CreateEvent.tsx       # Création d'événement
│   │   ├── EditEvent.tsx         # Modification d'événement
│   │   └── DiscoverEvent.tsx     # Découverte d'événements
│   ├── styles/
│   │   ├── index.css             # Point d'entrée CSS
│   │   ├── themes.css            # Thèmes dark/light
│   │   ├── buttons.css           # Styles des boutons
│   │   ├── components.css        # Composants
│   │   ├── forms.css             # Formulaires
│   │   ├── images.css            # Images et uploads
│   │   ├── modal.css             # Modals
│   │   └── ...
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

## 🔐 Sécurité

- Mots de passe hashés avec **bcrypt**
- Authentification par **JWT** (JSON Web Tokens)
- Validation des fichiers uploadés (type et taille)
- Protection contre les injections SQL avec requêtes paramétrées
- CORS configuré

## 🎨 Personnalisation

### Changer le thème

Le thème est géré dans `frontend/src/styles/themes.css`. Vous pouvez personnaliser les couleurs :

```css
[data-theme="dark"] {
  --primary: #10b981;
  --bg-dark: #0f172a;
  /* ... autres variables */
}

[data-theme="light"] {
  --primary: #059669;
  --bg-dark: #f8fafc;
  /* ... autres variables */
}
```

### Modifier le port

**Backend** : Dans `.env`, changez `PORT=5000`

**Frontend** : Dans `vite.config.ts`, changez `port: 5173`

## 🐛 Résolution de Problèmes

### Les images ne s'affichent pas

1. Vérifiez que le dossier `backend/uploads/` existe
2. Vérifiez que `vite.config.ts` contient le proxy `/uploads`
3. Redémarrez frontend et backend

### Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les credentials dans `.env`
3. Vérifiez que la base `event_manager` existe

### Le thème ne change pas

1. Videz le cache du navigateur (Ctrl + Shift + R)
2. Vérifiez que `themes.css` est importé en premier dans `index.css`

## 📝 Scripts Disponibles

### Backend

```bash
npm start          # Démarre le serveur
npm run dev        # Démarre en mode développement avec nodemon
```

### Frontend

```bash
npm run dev        # Démarre le serveur de développement
npm run build      # Build pour la production
npm run preview    # Prévisualise le build de production
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**Votre Nom**
- GitHub: [@votre-username](https://github.com/votre-username)

## 🙏 Remerciements

- React et l'équipe Vite pour les outils incroyables
- Lucide pour les icônes
- La communauté open source

---

**Fait avec ❤️ et React**
