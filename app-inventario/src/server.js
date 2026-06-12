require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const pool = require('./db/pool');
const productosRoutes = require('./routes/productos.routes');

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(cors());
app.use(express.json());

// Interfaz gráfica
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'app-inventario'
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      status: 'ok',
      database: 'conectada',
      hora_servidor_db: resultado.rows[0].now
    });
  } catch (error) {
    console.error('Error de conexión con la base de datos:', {
      message: error.message,
      code: error.code
    });

    res.status(500).json({
      status: 'error',
      database: 'no conectada',
      mensaje: error.message,
      codigo: error.code
    });
  }
});

app.use('/productos', productosRoutes);

app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});