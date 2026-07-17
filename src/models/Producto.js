const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre del producto es obligatorio'], trim: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: [true, 'La categoria del producto es obligatoria'] },
    precio: { type: Number, required: [true, 'El precio del producto es obligatorio'], min: [0, 'El precio no puede ser negativo'] },
    stock: { type: Number, required: [true, 'El stock del producto es obligatorio'], min: [0, 'El stock no puede ser negativo'] },
    disponible: { type: Boolean, default: true }
}, { timestamps: true, collection: 'productos' });

module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
