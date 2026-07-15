const express = require('express');
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstado
} = require('../controllers/usuarioController');

const router = express.Router();

router.get('/usuarios', obtenerUsuarios);
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);
router.patch('/actualizar-estado/:id', actualizarEstado);

module.exports = router;
