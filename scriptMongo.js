var conexion = new Mongo("mongodb+srv://laucasilo1102_db_user:TU_PASSWORD@cluster0.mr5yhcg.mongodb.net/");
var db = conexion.getDB("BaseDeDatos");

print("=== CONEXION EXITOSA ===");

// =======================================
// 1. LOGIN (Buscar por email)
// =======================================
print("\n1. LOGIN");
var email = "ana@gmail.com";
var usuario = db.usuarios.findOne({ email: email });

if (usuario) {
    print("Acceso permitido");
    printjson(usuario);

    // =======================================
    // 2. Listar usuarios menores de 10 anos ($lt)
    // =======================================
    print("\n2. Usuarios menores de 10 anos");
    db.usuarios.find(
        { edad: { $lt: 10 } }
    ).forEach(printjson);

    // =======================================
    // 3. Actualizar perfil
    // =======================================
    print("\n3. Actualizando perfil");
    db.usuarios.updateOne(
        { email: "ana@gmail.com" },
        {
            $set: {
                "perfil.telefono": "3209999999",
                "perfil.ciudad": "Tunja"
            }
        }
    );
    print("Perfil actualizado");

    // =======================================
    // 4. Insertar nueva anidacion obligatoria (producto)
    // =======================================
    print("\n4. Agregando producto anidado");
    db.usuarios.updateOne(
        { email: "ana@gmail.com" },
        {
            $push: {
                productos: {
                    producto: {
                        id: 101,
                        nombre: "PlayGo",
                        categoria: "Tecnologia",
                        precio: 89900,
                        stock: 25,
                        disponible: true
                    }
                }
            }
        }
    );
    print("Producto agregado");

    // =======================================
    // 5. Listar todos los usuarios
    // =======================================
    print("\n5. Todos los usuarios");
    db.usuarios.find().forEach(printjson);

    // =======================================
    // 6. Buscar usuarios por ciudad
    // =======================================
    print("\n6. Usuarios de Bogota");
    db.usuarios.find(
        { "perfil.ciudad": "Bogota" }
    ).forEach(printjson);

    // =======================================
    // 7. Usuarios mayores de edad
    // =======================================
    print("\n7. Usuarios mayores de edad");
    db.usuarios.find(
        { edad: { $gte: 18 } }
    ).forEach(printjson);

    // =======================================
    // 8. Ordenar usuarios por edad
    // =======================================
    print("\n8. Usuarios ordenados por edad");
    db.usuarios.find().sort(
        { edad: 1 }
    ).forEach(printjson);

    // =======================================
    // 9. Buscar usuarios con productos
    // =======================================
    print("\n9. Usuarios con productos");
    db.usuarios.find(
        { productos: { $exists: true, $ne: [] } }
    ).forEach(printjson);

    // =======================================
    // 10. Buscar producto PlayGo anidado
    // =======================================
    print("\n10. Usuarios que tienen el producto PlayGo");
    db.usuarios.find(
        { "productos.producto.nombre": "PlayGo" }
    ).forEach(printjson);

    // =======================================
    // 11. Eliminar producto anidado por id
    // =======================================
    print("\n11. Eliminar producto PlayGo");
    db.usuarios.updateOne(
        { email: "ana@gmail.com" },
        {
            $pull: {
                productos: {
                    "producto.id": 101
                }
            }
        }
    );
    print("Producto eliminado");
} else {
    print("Usuario no existe.");
    print("No se ejecutan las demas consultas.");
}
