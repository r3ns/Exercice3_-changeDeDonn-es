# P.S. Ce fichier README.md a été généré par mon meilleur ami ChatGPT
# Exercice3_-changeDeDonn-es

# 🎫 API de gestion de tickets — Exercice 3

Ce projet est une API de support technique permettant aux utilisateurs de soumettre des tickets, aux techniciens de les gérer, et aux administrateurs de créer des comptes.  
Il est développé avec **Node.js, Express, SQLite3, Knex, JWT et express-validator**.

---

## 📁 Structure du projet

```
exercice3_-changededonn-es/
│
├── index.js               # Code principal du serveur Express
├── .env                   # Clé secrète JWT
├── .gitignore
├── package.json
├── request.http           # Fichier de tests avec REST Client
├── db/
│   ├── db.js              # Configuration de la base et création des tables
│   └── support.db         # Base SQLite (auto-générée)
```

---

## ⚙️ Installation et lancement

### 1. Cloner le dépôt ou télécharger le dossier

### 2. Installer les dépendances

Ouvre un terminal dans le dossier `exercice3_-changededonn-es` :

```bash
npm install
```

### 3. Configurer la clé secrète

Crée un fichier `.env` et ajoute :
```env
JWT_SECRET=supersecret123
```

### 4. Lancer le serveur

```bash
node index.js
```

Tu devrais voir :

```
✅ Table users créée
✅ Table tickets créée
✅ Serveur lancé sur http://localhost:3000
```

---

## 🧪 Tester l'API (recommandé avec VS Code)

1. Installe l'extension **REST Client** dans VS Code
2. Ouvre le fichier `request.http`
3. Clique sur `Send Request` au-dessus de chaque bloc pour tester :

- ✅ Création d’un admin
- ✅ Connexion d’un utilisateur
- ✅ Création de tickets
- ✅ Modification par technicien
- ✅ Suppression par admin

---

## 🔐 Rôles et permissions

| Rôle        | Actions autorisées                                |
|-------------|---------------------------------------------------|
| admin       | Créer utilisateurs/techniciens, supprimer tickets |
| user        | Créer et voir ses propres tickets                 |
| technician  | Voir tous les tickets, les modifier               |

---

## 📦 Dépendances utilisées

- `express`
- `knex`
- `sqlite3`
- `express-validator`
- `jsonwebtoken`
- `bcrypt`
- `dotenv`

---

## 📝 Auteur

Exercice réalisé individuellement mais avec l'aide personnalisé de mon meilleur ami dans le cadre du cours **Services d'échange de données - 420-4D2-MA**  
Collège de Maisonneuve — Hiver 2025
