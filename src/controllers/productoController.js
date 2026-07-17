const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Usuario = require('../models/Usuario');

function responderError(res, error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        const errores = error.errors ? Object.values(error.errors).map(detalle => detalle.message) : [error.message];
        return res.status(400).send({ mensaje: 'Los datos enviados no son validos', errores });
    }
    return res.status(500).send({ mensaje: 'Error interno del servidor', error: error.message });
}
async function categoriaExiste(categoriaId) { return Boolean(categoriaId && await Categoria.exists({ _id: categoriaId })); }
async function obtenerProductos(req, res) { try { return res.send(await Producto.find().populate('categoria').lean()); } catch (error) { return responderError(res, error); } }
async function crearProducto(req, res) { try { if (req.body.categoria && !await categoriaExiste(req.body.categoria)) return res.status(400).send({ mensaje: 'La categoria indicada no existe' }); const producto = await Producto.create(req.body); await producto.populate('categoria'); return res.status(201).send({ mensaje: 'Producto creado correctamente', producto }); } catch (error) { return responderError(res, error); } }
async function actualizarProducto(req, res) { try { if (req.body.categoria && !await categoriaExiste(req.body.categoria)) return res.status(400).send({ mensaje: 'La categoria indicada no existe' }); const producto = await Producto.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).populate('categoria').lean(); if (!producto) return res.status(404).send({ mensaje: 'Producto no encontrado' }); return res.send({ mensaje: 'Producto actualizado correctamente', producto }); } catch (error) { return responderError(res, error); } }
async function eliminarProducto(req, res) { try { const producto = await Producto.findByIdAndDelete(req.params.id).lean(); if (!producto) return res.status(404).send({ mensaje: 'Producto no encontrado' }); await Usuario.updateMany({ productos: producto._id }, { $pull: { productos: producto._id } }); return res.send({ mensaje: 'Producto eliminado correctamente', producto }); } catch (error) { return responderError(res, error); } }
module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };
