const express = require('express');
const {
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstadoUsuario
} = require('../controllers/usuarios.controller');

const router = express.Router();

router.get('/usuarios', listarUsuarios);
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);
router.patch('/actualizar-estado/:id', actualizarEstadoUsuario);

module.exports = router;
