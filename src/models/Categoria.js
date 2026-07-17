const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre de la categoria es obligatorio'], trim: true, unique: true },
    descripcion: { type: String, trim: true, default: '' }
}, { timestamps: true, collection: 'categorias' });

module.exports = mongoose.models.Categoria || mongoose.model('Categoria', categoriaSchema);
