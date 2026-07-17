const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const usuariosRoutes = require('./src/routes/usuarios');
const categoriasRoutes = require('./src/routes/categorias');
const productosRoutes = require('./src/routes/productos');

const app = express();

app.use(cors());
app.use(express.json());

const middlewareRevision = (req, res, next) => {
    const horaActual = new Date().toLocaleDateString();
    console.log(`[${horaActual}] Peticion entrante: ${req.method} a la ruta ${req.url}`);
    next();
};

app.use(middlewareRevision);

app.get('/', (req, res) => {
    return res.status(200).send({
        mensaje: 'API funcionando correctamente',
        endpoints: {
            usuarios: '/api/v1/usuarios',
            categorias: '/api/v1/categorias',
            productos: '/api/v1/productos'
        }
    });
});
app.use('/api/v1', usuariosRoutes);
app.use('/api/v1/categorias', categoriasRoutes);
app.use('/api/v1/productos', productosRoutes);

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, { dbName: 'BaseDeDatos' })
        .then(() => console.log('Conexion a MongoDB exitosa'))
        .catch((error) => {
            console.error('No se pudo conectar a MongoDB. Se usaran los datos del JSON local.', error.message);
        });
} else {
    console.log('MONGO_URI no esta configurado. Se usaran los datos del JSON local.');
}

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Servidor escuchando en el puerto', PORT));
}

module.exports = app;
