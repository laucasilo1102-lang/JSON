const express = require('express');
const mongoose = require('mongoose');
const usuariosJson = require('./ejercicio2.json');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let mongoConectado = false;
const usuariosMemoria = [...usuariosJson];

const usuarioSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        collection: 'usuarios',
        timestamps: true
    }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);

function obtenerFiltroPorId(id) {
    if (/^\d+$/.test(id)) {
        return { _id: Number(id) };
    }

    return { _id: id };
}

function ocultarPassword(usuario) {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
}

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, { dbName: 'BaseDeDatos' })
        .then(() => {
            mongoConectado = true;
            console.log("Conexion a MongoDB exitosa");
        })
        .catch(err => console.error("No se pudo conectar a MongoDB. Se usaran los datos del JSON local.", err.message));
} else {
    console.log("MONGO_URI no esta configurado. Se usaran los datos del JSON local.");
}

app.get('/', (req, res) => {
    res.send({ mensaje: "El server esta funcionando" });
});

async function listarUsuarios(req, res) {
    try {
        if (!mongoConectado) {
            return res.status(200).send(usuariosMemoria.map(ocultarPassword));
        }

        const usuarios = await Usuario.find({}, { password: 0, __v: 0 }).lean();
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudieron obtener los usuarios", error: error.message });
    }
}

async function crearUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: "El cuerpo de la peticion no puede estar vacio" });
        }

        if (!mongoConectado) {
            const usuario = {
                _id: usuariosMemoria.length + 1,
                ...req.body
            };
            usuariosMemoria.push(usuario);

            return res.status(201).send({
                mensaje: "Usuario creado correctamente en memoria",
                usuario
            });
        }

        const usuario = await Usuario.create(req.body);
        res.status(201).send({
            mensaje: "Usuario creado correctamente",
            usuario
        });
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudo crear el usuario", error: error.message });
    }
}

async function actualizarUsuario(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: "El cuerpo de la peticion no puede estar vacio" });
        }

        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoConectado) {
            const indice = usuariosMemoria.findIndex(usuario => usuario._id === filtro._id);

            if (indice === -1) {
                return res.status(404).send({ mensaje: "Usuario no encontrado" });
            }

            usuariosMemoria[indice] = {
                ...usuariosMemoria[indice],
                ...req.body
            };

            return res.status(200).send({
                mensaje: "Usuario actualizado correctamente en memoria",
                usuario: usuariosMemoria[indice]
            });
        }

        const usuario = await Usuario.findOneAndUpdate(
            filtro,
            { $set: req.body },
            { new: true, projection: { password: 0, __v: 0 } }
        ).lean();

        if (!usuario) {
            return res.status(404).send({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).send({
            mensaje: "Usuario actualizado correctamente",
            usuario
        });
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudo actualizar el usuario", error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const filtro = obtenerFiltroPorId(req.params.id);

        if (!mongoConectado) {
            const indice = usuariosMemoria.findIndex(usuario => usuario._id === filtro._id);

            if (indice === -1) {
                return res.status(404).send({ mensaje: "Usuario no encontrado" });
            }

            const usuario = usuariosMemoria.splice(indice, 1)[0];

            return res.status(200).send({
                mensaje: "Usuario eliminado correctamente en memoria",
                usuario
            });
        }

        const usuario = await Usuario.findOneAndDelete(filtro, { projection: { password: 0, __v: 0 } }).lean();

        if (!usuario) {
            return res.status(404).send({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).send({
            mensaje: "Usuario eliminado correctamente",
            usuario
        });
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudo eliminar el usuario", error: error.message });
    }
}

app.get('/api/usuarios', listarUsuarios);
app.post('/api/usuarios', crearUsuario);
app.put('/api/usuarios/:id', actualizarUsuario);
app.delete('/api/usuarios/:id', eliminarUsuario);

app.get('/usuarios', listarUsuarios);
app.post('/usuarios', crearUsuario);

app.listen(PORT, () => {
    console.log(`El backend esta escuchando en localhost:${PORT}`);
});
