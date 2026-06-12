const pool = require('../db/pool');

function validarId(id) {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0;
}

function validarProducto({ nombre, descripcion, cantidad, precio }) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return 'El nombre del producto es obligatorio.';
  }

  if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
    return 'La descripción debe ser texto.';
  }

  if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 0) {
    return 'La cantidad debe ser un número entero mayor o igual a 0.';
  }

  if (isNaN(Number(precio)) || Number(precio) < 0) {
    return 'El precio debe ser un número mayor o igual a 0.';
  }

  return null;
}

async function listarProductos(req, res) {
  try {
    const { nombre } = req.query;

    let resultado;

    if (nombre) {
      resultado = await pool.query(
        `SELECT id, nombre, descripcion, cantidad, precio, created_at, updated_at
         FROM productos
         WHERE nombre ILIKE $1
         ORDER BY id ASC`,
        [`%${nombre}%`]
      );
    } else {
      resultado = await pool.query(
        `SELECT id, nombre, descripcion, cantidad, precio, created_at, updated_at
         FROM productos
         ORDER BY id ASC`
      );
    }

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar productos:', error.message);
    res.status(500).json({
      mensaje: 'Error al listar productos.'
    });
  }
}

async function obtenerProductoPorId(req, res) {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        mensaje: 'ID inválido.'
      });
    }

    const resultado = await pool.query(
      `SELECT id, nombre, descripcion, cantidad, precio, created_at, updated_at
       FROM productos
       WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado.'
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error.message);
    res.status(500).json({
      mensaje: 'Error al obtener producto.'
    });
  }
}

async function crearProducto(req, res) {
  try {
    const { nombre, descripcion, cantidad, precio } = req.body;

    const errorValidacion = validarProducto({
      nombre,
      descripcion,
      cantidad,
      precio
    });

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const resultado = await pool.query(
      `INSERT INTO productos (nombre, descripcion, cantidad, precio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, descripcion, cantidad, precio, created_at, updated_at`,
      [
        nombre.trim(),
        descripcion || null,
        Number(cantidad),
        Number(precio)
      ]
    );

    res.status(201).json({
      mensaje: 'Producto creado correctamente.',
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({
      mensaje: 'Error al crear producto.'
    });
  }
}

async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, cantidad, precio } = req.body;

    if (!validarId(id)) {
      return res.status(400).json({
        mensaje: 'ID inválido.'
      });
    }

    const errorValidacion = validarProducto({
      nombre,
      descripcion,
      cantidad,
      precio
    });

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const resultado = await pool.query(
      `UPDATE productos
       SET nombre = $1,
           descripcion = $2,
           cantidad = $3,
           precio = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, nombre, descripcion, cantidad, precio, created_at, updated_at`,
      [
        nombre.trim(),
        descripcion || null,
        Number(cantidad),
        Number(precio),
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado.'
      });
    }

    res.json({
      mensaje: 'Producto actualizado correctamente.',
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({
      mensaje: 'Error al actualizar producto.'
    });
  }
}

async function actualizarStock(req, res) {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!validarId(id)) {
      return res.status(400).json({
        mensaje: 'ID inválido.'
      });
    }

    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 0) {
      return res.status(400).json({
        mensaje: 'La cantidad debe ser un número entero mayor o igual a 0.'
      });
    }

    const resultado = await pool.query(
      `UPDATE productos
       SET cantidad = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, nombre, descripcion, cantidad, precio, created_at, updated_at`,
      [Number(cantidad), id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado.'
      });
    }

    res.json({
      mensaje: 'Stock actualizado correctamente.',
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error.message);
    res.status(500).json({
      mensaje: 'Error al actualizar stock.'
    });
  }
}

async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({
        mensaje: 'ID inválido.'
      });
    }

    const resultado = await pool.query(
      `DELETE FROM productos
       WHERE id = $1
       RETURNING id, nombre, descripcion, cantidad, precio, created_at, updated_at`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado.'
      });
    }

    res.json({
      mensaje: 'Producto eliminado correctamente.',
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({
      mensaje: 'Error al eliminar producto.'
    });
  }
}

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStock,
  eliminarProducto
};