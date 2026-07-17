const usuariosJson = require('../../ejercicio2.json');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');

const usuariosMemoria = [...usuariosJson];

function mongoEstaConectado() {
    return Usuario.db.readyState === 1;
}

function obtenerFiltroPorId(id) {
    return { _id: /^\d+$/.test(id) ? Number(id) : id };
}

function ocultarPassword(usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
}

async function productosExisten(productos = []) {
    if (!productos.length) return true;
    const idsUnicos = [...new Set(productos.map(String))];
    const cantidad = await Producto.countDocuments({ _id: { $in: idsUnicos } });
    return cantidad === idsUnicos.length;
}

async function obtenerSiguienteId() {
    if (!mongoEstaConectado()) {
        return Math.max(0, ...usuariosMemoria.map((usuario) => Number(usuario._id) || 0)) + 1;
    }

    const ultimoUsuario = await Usuario.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();
    return (Number(ultimoUsuario?._id) || 0) + 1;
}

function responderError(res, error, mensaje) {
    console.error(error);

    if (
        error.name === 'ValidationError' ||
        (error.message && error.message.includes('validation failed'))
    ) {
        const errores = error.errors
            ? Object.values(error.errors).map(detalle => detalle.message)
            : [error.message];

        return res.status(400).send({
            mensaje: 'Los datos enviados no son validos',
            errores
        });
    }

    if (error.code === 11000) {
        return res.status(409).send({
            mensaje: 'Ya existe un usuario con ese email'
        });
    }
    return res.status(500).send({
        mensaje,
        error: error.message
    });
}


async function obtenerUsuarios(req, res) {
    try {
        if (!mongoEstaConectado()) {
            return res.status(200).send(usuariosMemoria.map(ocultarPassword));
        }

        const usuarios = await Usuario.find({}, { password: 0, __v: 0 }).lean();
        const idsProductos = usuarios.flatMap(usuario => usuario.productos || [])
            .filter(productoId => mongoose.isObjectIdOrHexString(productoId));
        const productos = await Producto.find({ _id: { $in: idsProductos } }).populate('categoria').lean();
        const productosPorId = new Map(productos.map(producto => [String(producto._id), producto]));
        for (const usuario of usuarios) {
            usuario.productos = (usuario.productos || []).map(producto =>
                mongoose.isObjectIdOrHexString(producto) ? productosPorId.get(String(producto)) || producto : producto
            );
        }
        return res.status(200).send(usuarios);
    } catch (error) {
        return responderError(res, error, 'No se pudieron obtener los usuarios');
    }
}

async function crearUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: 'El cuerpo de la peticion no puede estar vacio' });
        }

        const datosUsuario = {
            _id: req.body._id ?? await obtenerSiguienteId(),
            ...req.body
        };
        if (mongoEstaConectado() && !await productosExisten(datosUsuario.productos)) {
            return res.status(400).send({ mensaje: 'Uno o mas productos indicados no existen' });
        }
        const usuarioNuevo = new Usuario(datosUsuario);

        await usuarioNuevo.validate();

        if (!mongoEstaConectado()) {
            const usuario = usuarioNuevo.toObject();
            usuariosMemoria.push(usuario);
            return res.status(201).send({ mensaje: 'Usuario creado correctamente en memoria', usuario: ocultarPassword(usuario) });
        }

        const usuario = await usuarioNuevo.save();
        await usuario.populate({ path: 'productos', populate: { path: 'categoria' } });
        return res.status(201).send({ mensaje: 'Usuario creado correctamente', usuario: ocultarPassword(usuario.toObject()) });
    } catch (error) {
        return responderError(res, error, 'No se pudo crear el usuario');
    }
}

async function actualizarUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: 'El cuerpo de la peticion no puede estar vacio' });
        }

        const filtro = obtenerFiltroPorId(req.params.id);
        if (mongoEstaConectado() && req.body.productos && !await productosExisten(req.body.productos)) {
            return res.status(400).send({ mensaje: 'Uno o mas productos indicados no existen' });
        }

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);
            if (indice === -1) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

            usuariosMemoria[indice] = { ...usuariosMemoria[indice], ...req.body };
            return res.status(200).send({
                mensaje: 'Usuario actualizado correctamente en memoria',
                usuario: ocultarPassword(usuariosMemoria[indice])
            });
        }

        const usuario = await Usuario.findOneAndUpdate(
            filtro,
            { $set: req.body },
            { new: true, runValidators: true, projection: { password: 0, __v: 0 } }
        ).populate({ path: 'productos', populate: { path: 'categoria' } }).lean();

        if (!usuario) return res.status(404).send({ mensaje: 'Usuario no encontrado' });
        return res.status(200).send({ mensaje: 'Usuario actualizado correctamente', usuario });
    } catch (error) {
        return responderError(res, error, 'No se pudo actualizar el usuario');
    }
}

async function eliminarUsuario(req, res) {
    try {
        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);
            if (indice === -1) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

            const usuario = usuariosMemoria.splice(indice, 1)[0];
            return res.status(200).send({ mensaje: 'Usuario eliminado correctamente en memoria', usuario: ocultarPassword(usuario) });
        }

        const usuario = await Usuario.findOneAndDelete(filtro, { projection: { password: 0, __v: 0 } }).lean();
        if (!usuario) return res.status(404).send({ mensaje: 'Usuario no encontrado' });

        return res.status(200).send({ mensaje: 'Usuario eliminado correctamente', usuario });
    } catch (error) {
        return responderError(res, error, 'No se pudo eliminar el usuario');
    }
}

async function actualizarEstado(req, res) {
    try {
        const estadosValidos = ['pendiente', 'procesado', 'finalizado'];
        const { estado } = req.body;

        if (!estadosValidos.includes(estado)) {
            return res.status(400).send({ mensaje: 'El estado debe ser pendiente, procesado o finalizado' });
        }

        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoEstaConectado()) {
            const indice = usuariosMemoria.findIndex((usuario) => usuario._id === filtro._id);
            if (indice === -1) return res.status(404).send({ mensaje: 'Usuario no encontrado' });
            if (usuariosMemoria[indice].estado === 'finalizado') {
                return res.status(403).send({ mensaje: 'No se puede modificar un usuario con estado finalizado' });
            }

            usuariosMemoria[indice].estado = estado;
            return res.status(200).send({
                mensaje: 'Estado actualizado correctamente',
                usuario: ocultarPassword(usuariosMemoria[indice])
            });
        }

        const usuario = await Usuario.findOne(filtro).lean();
        if (!usuario) return res.status(404).send({ mensaje: 'Usuario no encontrado' });
        if (usuario.estado === 'finalizado') {
            return res.status(403).send({ mensaje: 'No se puede modificar un usuario con estado finalizado' });
        }

        const usuarioActualizado = await Usuario.findOneAndUpdate(
            filtro,
            { $set: { estado } },
            { new: true, runValidators: true, projection: { password: 0, __v: 0 } }
        ).lean();

        return res.status(200).send({ mensaje: 'Estado actualizado correctamente', usuario: usuarioActualizado });
    } catch (error) {
        return responderError(res, error, 'No se pudo actualizar el estado');
    }
}

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarEstado
};
