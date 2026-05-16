const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());

const PORT = 3000;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function conectarDB() {
  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id SERIAL PRIMARY KEY,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Conectado a PostgreSQL');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
  }
}

conectarDB();

app.get('/', async (req, res) => {
  try {
    await client.query('INSERT INTO visitas DEFAULT VALUES');

    const resultado = await client.query('SELECT COUNT(*) FROM visitas');

    res.send(`
Backend funcionando correctamente.
Conexión a PostgreSQL exitosa.
Número de visitas registradas: ${resultado.rows[0].count}
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar la base de datos');
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
