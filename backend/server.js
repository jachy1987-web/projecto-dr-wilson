const express = require("express");

const conexion = require("./db");

const cors = require("cors");

const bcrypt = require("bcryptjs");


const app = express();

app.use(cors());
app.use(express.json());


const PORT = 3001;

app.get("/", function(req, res) {
    res.send("Servidor de Doctor Wilson funcionando correctamente");
});

app.post("/api/propietarios", function(req, res) {

    const {
        nombre,
        apellido,
        tipo_documento,
        documento,
        telefono,
        correo,
        direccion
    } = req.body;

    const sql = `
        INSERT INTO propietarios
        (nombre, apellido, tipo_documento, documento, telefono, correo, direccion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            tipo_documento,
            documento,
            telefono,
            correo,
            direccion
        ],
        function(error, resultado) {

            if (error) {
                console.error(error);

                res.status(500).json({
                    mensaje: "Error al registrar el propietario"
                });

                return;
            }

            res.status(201).json({
                mensaje: "Propietario registrado correctamente",
                id_propietario: resultado.insertId
            });
        }
    );
});

app.get("/api/propietarios", function(req, res) {

    const sql = "SELECT * FROM propietarios";

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al consultar los propietarios"
            });
            return;
        }

        res.json(resultado);
    });

});


app.post("/api/usuarios/registro", async function(req, res) {

    const {
        nombre,
        apellido,
        documento,
        correo,
        contrasena
    } = req.body;

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const idRol = 4;

    const sql = `
        INSERT INTO usuarios
        (nombre, apellido, documento, correo, contrasena, id_rol)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    conexion.query(
        sql,
        [
            nombre,
            apellido,
            documento,
            correo,
            contrasenaHash,
            idRol
        ],
        function(error, resultado) {

            if (error) {
                console.error(error);

                res.status(500).json({
                    mensaje: "Error al registrar el usuario"
                });

                return;
            }

            res.status(201).json({
                mensaje: "Usuario registrado correctamente",
                id_usuario: resultado.insertId
            });
        }
    );
});

app.post("/api/usuarios/login", function(req, res) {

    const {
        correo,
        contrasena
    } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(
        sql,
        [correo],
        async function(error, resultados) {

            if (error) {
                console.error(error);

                res.status(500).json({
                    mensaje: "Error al iniciar sesión"
                });

                return;
            }

            if (resultados.length === 0) {

                res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos"
                });

                return;
            }

            const usuario = resultados[0];

            const contrasenaCorrecta = await bcrypt.compare(
                contrasena,
                usuario.contrasena
            );

            if (!contrasenaCorrecta) {

                res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos"
                });

                return;
            }

            res.status(200).json({
                mensaje: "Inicio de sesión exitoso",
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                id_rol: usuario.id_rol
            });
        }
    );
});


app.get("/api/usuarios", function(req, res) {

    const sql = "SELECT * FROM usuarios";

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al consultar los usuarios"
            });
            return;
        }

        res.json(resultado);

    });

});


app.put("/api/usuarios/:id", function(req, res) {

    const id = req.params.id;
    const { nombre, apellido, documento, correo } = req.body;

    const sql = "UPDATE usuarios SET nombre = ?, apellido = ?, documento = ?, correo = ? WHERE id_usuario = ?";

    conexion.query(sql, [nombre, apellido, documento, correo, id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al actualizar el usuario"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Usuario actualizado correctamente"
        });

    });

});


app.delete("/api/usuarios/:id", function(req, res) {

    const id = req.params.id;

    const sql = "DELETE FROM usuarios WHERE id_usuario = ?";

    conexion.query(sql, [id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al eliminar el usuario"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Usuario eliminado correctamente"
        });

    });

});

app.put("/api/propietarios/:id", function(req, res) {

    const id = req.params.id;

    const {
        nombre,
        apellido,
        tipo_documento,
        documento,
        telefono,
        correo,
        direccion
    } = req.body;

    const sql = `
        UPDATE propietarios
        SET nombre = ?, apellido = ?, tipo_documento = ?, documento = ?,
            telefono = ?, correo = ?, direccion = ?
        WHERE id_propietario = ?
    `;

    conexion.query(
        sql,
        [nombre, apellido, tipo_documento, documento, telefono, correo, direccion, id],
        function(error) {

            if (error) {
                console.error(error);
                res.status(500).json({
                    mensaje: "Error al actualizar el propietario"
                });
                return;
            }

            res.status(200).json({
                mensaje: "Propietario actualizado correctamente"
            });
        }
    );
});

app.delete("/api/propietarios/:id", function(req, res) {

    const id = req.params.id;

    const sql = "DELETE FROM propietarios WHERE id_propietario = ?";

    conexion.query(sql, [id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al eliminar el propietario"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Propietario eliminado correctamente"
        });
    });

});

app.delete("/api/propietarios/:id", function(req, res) {

    const id = req.params.id;

    const sql = "DELETE FROM propietarios WHERE id_propietario = ?";

    conexion.query(sql, [id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al eliminar el propietario"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Propietario eliminado correctamente"
        });
    });

});

app.post("/api/roles", function(req, res) {

    const {
        nombre,
        descripcion
    } = req.body;

    const sql = `
        INSERT INTO roles
        (nombre, descripcion)
        VALUES (?, ?)
    `;

    conexion.query(
        sql,
        [nombre, descripcion],
        function(error, resultado) {

           if (error) {
    console.error(error);
    res.status(500).json({
        mensaje: "Error al registrar el rol",
        error: error.message
    });
    return;
} 

            res.status(201).json({
                mensaje: "Rol registrado correctamente",
                id_rol: resultado.insertId
            });
        }
    );

});

app.get("/api/roles", function(req, res) {

    const sql = "SELECT * FROM roles";

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al consultar los roles"
            });
            return;
        }

        res.json(resultado);
    });

});

app.put("/api/roles/:id", function(req, res) {

    const id = req.params.id;

    const { nombre, descripcion } = req.body;

    const sql = `
        UPDATE roles
        SET nombre = ?, descripcion = ?
        WHERE id_rol = ?
    `;

    conexion.query(
        sql,
        [nombre, descripcion, id],
        function(error) {

            if (error) {
                console.error(error);
                res.status(500).json({
                    mensaje: "Error al actualizar el rol"
                });
                return;
            }

            res.status(200).json({
                mensaje: "Rol actualizado correctamente"
            });
        }
    );

});

app.delete("/api/roles/:id", function(req, res) {

    const id = req.params.id;

    const sql = "DELETE FROM roles WHERE id_rol = ?";

    conexion.query(sql, [id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al eliminar el rol"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Rol eliminado correctamente"
        });
    });

});

app.post("/api/mascotas", function(req, res) {

    const {
        nombre,
        sexo,
        fecha_nacimiento,
        color,
        id_especie,
        id_raza,
        id_propietario
    } = req.body;

    const sql = `
        INSERT INTO mascotas
        (nombre, sexo, fecha_nacimiento, color, id_especie, id_raza, id_propietario)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            sexo,
            fecha_nacimiento,
            color,
            id_especie,
            id_raza,
            id_propietario
        ],
        function(error, resultado) {

            if (error) {
    console.error(error);
    res.status(500).json({
        mensaje: "Error al registrar la mascota",
        error: error.message
    });
    return;
}

            res.status(201).json({
                mensaje: "Mascota registrada correctamente",
                id_mascota: resultado.insertId
            });
        }
    );

});

app.get("/api/mascotas", function(req, res) {

    const sql = "SELECT * FROM mascotas";

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al consultar las mascotas"
            });
            return;
        }

        res.json(resultado);
    });

});

app.put("/api/mascotas/:id", function(req, res) {

    const id = req.params.id;

    const {
        nombre,
        sexo,
        fecha_nacimiento,
        color,
        id_especie,
        id_raza,
        id_propietario
    } = req.body;

    const sql = `
        UPDATE mascotas
        SET nombre = ?, sexo = ?, fecha_nacimiento = ?, color = ?,
            id_especie = ?, id_raza = ?, id_propietario = ?
        WHERE id_mascota = ?
    `;

    conexion.query(
        sql,
        [
            nombre,
            sexo,
            fecha_nacimiento,
            color,
            id_especie,
            id_raza,
            id_propietario,
            id
        ],
        function(error) {

            if (error) {
    console.error(error);
    res.status(500).json({
        mensaje: "Error al actualizar la mascota",
        error: error.message
    });
    return;
}

            res.status(200).json({
                mensaje: "Mascota actualizada correctamente"
            });
        }
    );

});

app.delete("/api/mascotas/:id", function(req, res) {

    const id = req.params.id;

    const sql = "DELETE FROM mascotas WHERE id_mascota = ?";

    conexion.query(sql, [id], function(error) {

        if (error) {
            console.error(error);
            res.status(500).json({
                mensaje: "Error al eliminar la mascota"
            });
            return;
        }

        res.status(200).json({
            mensaje: "Mascota eliminada correctamente"
        });
    });

});

app.listen(PORT, function() {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


