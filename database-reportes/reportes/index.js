const express = require('express');
const { Pool } = require('pg'); // <-- Usamos la librería 'pg'
const app = express();

app.set('view engine', 'ejs');

// Conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'user_inventario',
    password: process.env.DB_PASS || 'password_seguro',
    database: process.env.DB_NAME || 'inventario_db',
    port: 5432
});

app.get('/', async (req, res) => {
    try {
        const bajoStock = await pool.query('SELECT * FROM productos WHERE cantidad < 5');
        const topValiosos = await pool.query('SELECT *, (cantidad * precio) AS valor_total FROM productos ORDER BY (cantidad * precio) DESC LIMIT 5');
        const resumen = await pool.query('SELECT COUNT(*) as total, SUM(cantidad * precio) as valor FROM productos');

        res.render('reportes', {
            bajoStock: bajoStock.rows, // <-- En Postgres usamos .rows
            topValiosos: topValiosos.rows,
            totalProductos: resumen.rows[0].total || 0,
            valorInventario: resumen.rows[0].valor || 0
        });
    } catch (error) {
        console.error("Error de base de datos:", error);
        res.status(500).send("Esperando a la base de datos...");
    }
});

app.listen(8000, () => {
    console.log('Servidor corriendo en el puerto 8000');
});