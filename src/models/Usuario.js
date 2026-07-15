const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: [true, 'El id del producto es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    categoria: {
        type: String,
        required: [true, 'La categoria del producto es obligatoria'],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio del producto es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, 'El stock del producto es obligatorio'],
        min: [0, 'El stock no puede ser negativo']
    },
    disponible: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: [true, 'El id del usuario es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
    edad: {
        type: Number,
        required: [true, 'La edad es obligatoria'],
        min: [0, 'La edad no puede ser negativa']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'El email no es valido']
    },
    estado: {
        type: String,
        enum: ['pendiente', 'procesado', 'finalizado'],
        default: 'pendiente'
    },
    password: {
        type: String,
        required: [true, 'La contrasena es obligatoria'],
        minlength: [6, 'La contrasena debe tener al menos 6 caracteres']
    },
    perfil: {
        telefono: {
            type: String,
            required: [true, 'El telefono es obligatorio'],
            trim: true
        },
        ciudad: {
            type: String,
            required: [true, 'La ciudad es obligatoria'],
            trim: true
        }
    },
    productos: [{
        producto: productoSchema
    }]
}, {
    timestamps: true,
    collection: 'usuarios'
});

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);
