const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const usuariosRoutes = require('./src/routes/usuarios');

const app = express();

app.use(cors());
app.use(express.json());

const middlewareRevision = (req, res, next) => {
    const horaActual = new Date().toLocaleDateString();
    console.log(`[${horaActual}] Peticion entrante: ${req.method} a la ruta ${req.url}`);
    next();
};

app.use(middlewareRevision);
app.use('/api/v1', usuariosRoutes);

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, { dbName: 'BaseDeDatos' })
        .then(() => console.log('Conexion a MongoDB exitosa'))
        .catch((error) => {
            console.error('No se pudo conectar a MongoDB. Se usaran los datos del JSON local.', error.message);
        });
} else {
    console.log('MONGO_URI no esta configurado. Se usaran los datos del JSON local.');
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Servidor escuchando en el puerto', PORT);
});
