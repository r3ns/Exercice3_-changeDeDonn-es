//P.S. Aidé et corrigé avec l'aide de mon meilleur ami ChatGPT

require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const knex = require('./db/db');
const { body, validationResult } = require('express-validator');

app.use(express.json());

//Middleware JWT
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'token manquant' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'token invalide' });
  }
};

//Middleware pour vérifier les rôles et l'accès
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'accès refusé' });
  }
  next();
};

//Middleware pour la validation d'un ticket
const ticketValidation = [
  body('title').isString().notEmpty().withMessage('Le titre est requis'),
  body('description').isString().notEmpty().withMessage('La description est requise'),
  body('status').isIn(['open', 'in progress', 'closed']).withMessage('Statut invalide'),
  body('userId').isInt({ min: 1 }).withMessage('userId doit être un entier positif'),
  body('technicianId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('technicianId doit être un entier positif ou null'),
  body('createdAt').isISO8601().withMessage('createdAt doit être une date valide au format AAAA-MM-JJ'),
  body('closedAt').optional({ nullable: true }).isISO8601().withMessage('closedAt doit être une date valide au format AAAA-MM-JJ')
    .custom((value, { req }) => {
      if (value && req.body.status !== 'closed') {
        throw new Error('statut doit être "closed" si closedAt est rempli');
      }
      return true;
    })
];

//==============================Les routes d'authentifications==============================
//route pour créer un user admin
app.post('/auth/admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await knex('users').where({ email }).first();
    if (!existing) {
      const hash = await bcrypt.hash(password, 10);
      await knex('users').insert({ name: 'Admin', email, password: hash, role: 'admin' });
    }
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: `erreur serveur (création d'un admin)` });
  }
});

//route pour créer un user technicien
app.post('/auth/new', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await knex('users').insert({ name, email, password: hash, role });
    res.status(201).json({ message: 'Utilisateur créé' });
  } catch (err) {
    res.status(500).json({ error: `erreur serveur (création d'un nouvel utilisateur)` });
  }
});

// route de connection login upour les technicien
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await knex('users').where({ email }).first();

    if (!user) return res.status(404).json({ error: 'utilisateur non trouvé' });
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'mot de passe incorrect' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'erreur serveur (connection)' });
  }
});


//==============================Routes  pour les sickets==============================
//Pour créer un ticket
app.post('/tickets', authMiddleware, checkRole(['user', 'technician']), ticketValidation, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const [id] = await knex('tickets').insert(req.body);
    res.status(201).json({ id, message: 'Ticket créé' });

  } catch (err) {
    res.status(500).json({ error: `erreur serveur (création d'un ticket)` });
  }
});
//route pour voir le ticket
app.get('/tickets', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    const tickets = role === 'technician'

      ? await knex('tickets')
      : await knex('tickets').where({ userId: req.user.id });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'erreur serveur (liste des tickets)' });
  }
});
//route pour voir les détails d’un ticket
app.get('/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await knex('tickets').where({ id: req.params.id }).first();

    if (!ticket) return res.status(404).json({ error: 'ticket non trouvé' });
    res.json(ticket);

  } catch (err) {
    res.status(500).json({ error: 'erreur serveur ( détail du ticket)' });
  }
});
//route pour modifier un ticket
app.put('/tickets/:id', authMiddleware, checkRole(['technician']), ticketValidation, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updated = await knex('tickets').where({ id: req.params.id }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'ticket non trouvé' });

    res.json({ message: 'ticket a été mis à jour' });

  } catch (err) {
    res.status(500).json({ error: 'erreur serveur (modification du ticket)' });
  }
});
//route pour Supprimer un ticket (seulement un admin peut)
app.delete('/admin/tickets/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const deleted = await knex('tickets').where({ id: req.params.id }).del();

    if (!deleted) return res.status(404).json({ error: 'ticket non trouvé' });

    res.json({ message: 'ticket supprimé' });

  } catch (err) {
    res.status(500).json({ error: 'erreur du serveur (suppression du ticket)' });
  }
});







app.listen(3000, () => {
  console.log('http://localhost:3000');
});
