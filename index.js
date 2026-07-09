const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const usuarioSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        collection: 'usuarios',
        timestamps: true
    }
);

const Usuario = mongoose.model('Usuario', usuarioSchema);

mongoose.connect(process.env.MONGO_URI, { dbName: 'BaseDeDatos' })
    .then(() => console.log("Conexion exitosa"))
    .catch(err => console.error("No se pudo conectar", err));

app.get('/', (req, res) => {
    res.send({ mensaje: "El server esta funcionando" });
});

app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().lean();
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudieron obtener los usuarios", error: error.message });
    }
});



app.post('/usuarios', async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ mensaje: "El cuerpo de la peticion no puede estar vacio" });
        }

        const usuario = await Usuario.create(req.body);
        res.status(201).send({
            mensaje: "Usuario creado correctamente",
            usuario
        });
    } catch (error) {
        res.status(500).send({ mensaje: "No se pudo crear el usuario", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`El backend esta escuchando en localhost:${PORT}`);
});
