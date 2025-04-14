const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './db/basededonne.db'
    },
    useNullAsDefault: true
  });
  
  (async () => {
    const hasUsers = await knex.schema.hasTable('users');
    if (!hasUsers) {
      await knex.schema.createTable('users', table => {
        table.increments('id');
        table.string('name');
        table.string('email').unique();
        table.string('password');
        table.string('role');
      });
      console.log('la table "users" a été créée');
    }
  
    const hasTickets = await knex.schema.hasTable('tickets');
    if (!hasTickets) {
      await knex.schema.createTable('tickets', table => {
        table.increments('id');
        table.string('title');
        table.string('description');
        table.string('status');
        table.integer('userId');
        table.integer('technicianId').nullable();
        table.date('createdAt');
        table.date('closedAt').nullable();
      });
      console.log('la table "tickets" a été créée');
    }
  })();
  
  module.exports = knex;
  