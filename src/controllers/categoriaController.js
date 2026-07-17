const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

function responderError(res, error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        const errores = error.errors ? Object.values(error.errors).map(detalle => detalle.message) : [error.message];
        return res.status(400).send({ mensaje: 'Los datos enviados no son validos', errores });
    }
    if (error.code === 11000) return res.status(409).send({ mensaje: 'Ya existe una categoria con ese nombre' });
    return res.status(500).send({ mensaje: 'Error interno del servidor', error: error.message });
}

async function obtenerCategorias(req, res) { try { return res.send(await Categoria.find().lean()); } catch (error) { return responderError(res, error); } }
async function crearCategoria(req, res) { try { const categoria = await Categoria.create(req.body); return res.status(201).send({ mensaje: 'Categoria creada correctamente', categoria }); } catch (error) { return responderError(res, error); } }
async function actualizarCategoria(req, res) { try { const categoria = await Categoria.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean(); if (!categoria) return res.status(404).send({ mensaje: 'Categoria no encontrada' }); return res.send({ mensaje: 'Categoria actualizada correctamente', categoria }); } catch (error) { return responderError(res, error); } }
async function eliminarCategoria(req, res) { try { if (await Producto.exists({ categoria: req.params.id })) return res.status(409).send({ mensaje: 'No se puede eliminar una categoria que tiene productos asociados' }); const categoria = await Categoria.findByIdAndDelete(req.params.id).lean(); if (!categoria) return res.status(404).send({ mensaje: 'Categoria no encontrada' }); return res.send({ mensaje: 'Categoria eliminada correctamente', categoria }); } catch (error) { return responderError(res, error); } }

module.exports = { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria };
