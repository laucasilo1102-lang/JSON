const express = require('express');
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productoController');

const router = express.Router();
router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);
module.exports = router;
