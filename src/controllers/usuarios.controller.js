const mongoose = require('mongoose');
const usuariosJson = require('../../ejercicio2.json');

const usuariosMemoria = [...usuariosJson];

const usuarioSchema = new mongoose.Schema({}, {
    strict: false,
    collection: 'usuarios',
    timestamps: true
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

function mongoEstaConectado() {
    return mongoose.connection.readyState === 1;
}

function obtenerFiltroPorId(id) {
    return { _id: /^\d+$/.test(id) ? Number(id) : id };
}

function ocultarPassword(usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
}

async function listarUsuarios(req, res) {
    try {
        if (!mongoEstaConectado()) {
            return res.status(200).send(usuariosMemoria.map(ocultarPassword));
        }

        const usuarios = await Usuario.find({}, { password: 0, __v: 0 }).lean();
        return res.status(200).send(usuarios);
    } catch (error) {
        return res.status(500).send({ mensaje: 'No se pudieron obtener los usuarios', error: error.message });
    }
}

async function crearUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: 'El cuerpo de la peticion no puede estar vacio' });
        }

        if (!mongoEstaConectado()) {
            const usuario = { _id: usuariosMemoria.length + 1, ...req.body };
            usuariosMemoria.push(usuario);
            return res.status(201).send({ mensaje: 'Usuario creado correctamente en memoria', usuario });
        }

        const usuario = await Usuario.create(req.body);
        return res.status(201).send({ mensaje: 'Usuario creado correctamente', usuario });
    } catch (error) {
        return res.status(500).send({ mensaje: 'No se pudo crear el usuario', error: error.message });
    }
}

async function actualizarUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: 'El cuerpo de la peticion no puede estar vacio' });
        }

        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);
            if (indice === -1) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

            usuariosMemoria[indice] = { ...usuariosMemoria[indice], ...req.body };
            return res.status(200).send({
                mensaje: 'Usuario actualizado correctamente en memoria',
                usuario: usuariosMemoria[indice]
            });
        }

        const usuario = await Usuario.findOneAndUpdate(
            filtro,
            { $set: req.body },
            { new: true, projection: { password: 0, __v: 0 } }
        ).lean();

        if (!usuario) return res.status(404).send({ mensaje: 'Usuario no encontrado' });
        return res.status(200).send({ mensaje: 'Usuario actualizado correctamente', usuario });
    } catch (error) {
        return res.status(500).send({ mensaje: 'No se pudo actualizar el usuario', error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);
            if (indice === -1) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

            const usuario = usuariosMemoria.splice(indice, 1)[0];
            return res.status(200).send({ mensaje: 'Usuario eliminado correctamente en memoria', usuario });
        }

        const usuario = await Usuario.findOneAndDelete(filtro, { projection: { password: 0, __v: 0 } }).lean();
        if (!usuario) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

        return res.status(200).send({ mensaje: 'Usuario eliminado correctamente', usuario });
    } catch (error) {
        return res.status(500).send({ mensaje: 'No se pudo eliminar el usuario', error: error.message });
    }
}

async function actualizarEstadoUsuario(req, res) {
    try {
        const estadosValidos = ['pendiente', 'procesado', 'finalizado'];
        const { estado } = req.body;

        if (!estadosValidos.includes(estado)) {
            return res.status(400).send({
                mensaje: 'El estado debe ser pendiente, procesado o finalizado'
            });
        }

        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);

            if (indice === -1) {
                return res.status(404).send({ mensaje: 'Usuario no encontrado' });
            }

            if (usuariosMemoria[indice].estado === 'finalizado') {
                return res.status(403).send({
                    mensaje: 'No se puede modificar un usuario con estado finalizado'
                });
            }

            usuariosMemoria[indice].estado = estado;
            return res.status(200).send({
                mensaje: 'Estado actualizado correctamente',
                usuario: ocultarPassword(usuariosMemoria[indice])
            });
        }

        const usuario = await Usuario.findOne(filtro).lean();

        if (!usuario) {
            return res.status(404).send({ mensaje: 'Usuario no encontrado' });
        }

        if (usuario.estado === 'finalizado') {
            return res.status(403).send({
                mensaje: 'No se puede modificar un usuario con estado finalizado'
            });
        }

        const usuarioActualizado = await Usuario.findOneAndUpdate(
            filtro,
            { $set: { estado } },
            { new: true, projection: { password: 0, __v: 0 } }
        ).lean();

        return res.status(200).send({
            mensaje: 'Estado actualizado correctamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        return res.status(500).send({
            mensaje: 'No se pudo actualizar el estado',
            error: error.message
        });
    }
}

module.exports = {
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstadoUsuario
};
