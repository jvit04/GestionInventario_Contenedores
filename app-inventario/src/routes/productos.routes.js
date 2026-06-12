const express = require('express');
const router = express.Router();

const {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStock,
  eliminarProducto
} = require('../controllers/productos.controller');

router.get('/', listarProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.patch('/:id/stock', actualizarStock);
router.delete('/:id', eliminarProducto);

module.exports = router;