const express = require("express");
const conexion = require("./db");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

function esIdValido(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

function esObligatorio(valor) {
    return valor !== undefined &&
           valor !== null &&
           String(valor).trim() !== "";
}

function responderError(res, error, mensaje) {
    console.error(mensaje, error);

    return res.status(500).json({
        mensaje: mensaje
    });
}

// ======================================================
// INICIO
// ======================================================

app.get("/", function (req, res) {
    res.json({
        mensaje: "Servidor de Doctor Wilson funcionando correctamente",
        puerto: PORT,
        estado: "activo"
    });
});

// ======================================================
// PROPIETARIOS
// ======================================================

// CREAR
app.post("/api/propietarios", function (req, res) {

    const {
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        direccion
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(apellido) ||
        !esObligatorio(documento) ||
        !esObligatorio(telefono)
    ) {
        return res.status(400).json({
            mensaje: "Nombre, apellido, documento y teléfono son obligatorios"
        });
    }

    const sql = `
        INSERT INTO propietarios
        (
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            apellido.trim(),
            documento.trim(),
            telefono.trim(),
            correo || null,
            direccion || null
        ],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "El documento o correo ya está registrado"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al registrar el propietario"
                );
            }

            res.status(201).json({
                mensaje: "Propietario registrado correctamente",
                id_propietario: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/propietarios", function (req, res) {

    const sql = `
        SELECT
            id_propietario,
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion
        FROM propietarios
        ORDER BY nombre ASC, apellido ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar los propietarios"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNO
app.get("/api/propietarios/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de propietario no válido"
        });
    }

    const sql = `
        SELECT
            id_propietario,
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion
        FROM propietarios
        WHERE id_propietario = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar el propietario"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Propietario no encontrado"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/propietarios/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de propietario no válido"
        });
    }

    const {
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        direccion
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(apellido) ||
        !esObligatorio(documento) ||
        !esObligatorio(telefono)
    ) {
        return res.status(400).json({
            mensaje: "Nombre, apellido, documento y teléfono son obligatorios"
        });
    }

    const sql = `
        UPDATE propietarios
        SET
            nombre = ?,
            apellido = ?,
            documento = ?,
            telefono = ?,
            correo = ?,
            direccion = ?
        WHERE id_propietario = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            apellido.trim(),
            documento.trim(),
            telefono.trim(),
            correo || null,
            direccion || null,
            id
        ],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "El documento o correo ya está registrado"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al actualizar el propietario"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Propietario no encontrado"
                });
            }

            res.json({
                mensaje: "Propietario actualizado correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/propietarios/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de propietario no válido"
        });
    }

    const sql = `
        DELETE FROM propietarios
        WHERE id_propietario = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar el propietario porque tiene mascotas o facturas asociadas"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar el propietario"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Propietario no encontrado"
            });
        }

        res.json({
            mensaje: "Propietario eliminado correctamente"
        });
    });
});

// ======================================================
// USUARIOS
// ======================================================

// REGISTRO
app.post("/api/usuarios/registro", async function (req, res) {

    const {
        nombre,
        apellido,
        documento,
        correo,
        contrasena
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(apellido) ||
        !esObligatorio(documento) ||
        !esObligatorio(correo) ||
        !esObligatorio(contrasena)
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    try {

        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        const sql = `
            INSERT INTO usuarios
            (
                nombre,
                apellido,
                documento,
                correo,
                contrasena,
                id_rol
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // Rol 4 utilizado por el proyecto para usuarios registrados.
        const idRol = 4;

        conexion.query(
            sql,
            [
                nombre.trim(),
                apellido.trim(),
                documento.trim(),
                correo.trim(),
                contrasenaHash,
                idRol
            ],
            function (error, resultado) {

                if (error) {

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensaje: "El documento o correo ya está registrado"
                        });
                    }

                    return responderError(
                        res,
                        error,
                        "Error al registrar el usuario"
                    );
                }

                res.status(201).json({
                    mensaje: "Usuario registrado correctamente",
                    id_usuario: resultado.insertId
                });
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al procesar la contraseña"
        });
    }
});

// LOGIN
app.post("/api/usuarios/login", function (req, res) {

    const {
        correo,
        contrasena
    } = req.body;

    if (
        !esObligatorio(correo) ||
        !esObligatorio(contrasena)
    ) {
        return res.status(400).json({
            mensaje: "Correo y contraseña son obligatorios"
        });
    }

    const sql = `
        SELECT
            id_usuario,
            nombre,
            apellido,
            documento,
            correo,
            contrasena,
            id_rol
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(
        sql,
        [correo.trim()],
        async function (error, resultados) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al iniciar sesión"
                );
            }

            if (resultados.length === 0) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos"
                });
            }

            const usuario = resultados[0];

            try {

                const correcta = await bcrypt.compare(
                    contrasena,
                    usuario.contrasena
                );

                if (!correcta) {
                    return res.status(401).json({
                        mensaje: "Correo o contraseña incorrectos"
                    });
                }

                res.json({
                    mensaje: "Inicio de sesión exitoso",
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo,
                    id_rol: usuario.id_rol
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    mensaje: "Error al validar la contraseña"
                });
            }
        }
    );
});

// CONSULTAR
app.get("/api/usuarios", function (req, res) {

    const sql = `
        SELECT
            id_usuario,
            nombre,
            apellido,
            documento,
            correo,
            id_rol
        FROM usuarios
        ORDER BY nombre ASC, apellido ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar los usuarios"
            );
        }

        res.json(resultado);
    });
});

// ACTUALIZAR
app.put("/api/usuarios/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de usuario no válido"
        });
    }

    const {
        nombre,
        apellido,
        documento,
        correo
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(apellido) ||
        !esObligatorio(documento) ||
        !esObligatorio(correo)
    ) {
        return res.status(400).json({
            mensaje: "Nombre, apellido, documento y correo son obligatorios"
        });
    }

    const sql = `
        UPDATE usuarios
        SET
            nombre = ?,
            apellido = ?,
            documento = ?,
            correo = ?
        WHERE id_usuario = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            apellido.trim(),
            documento.trim(),
            correo.trim(),
            id
        ],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "El documento o correo ya está registrado"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al actualizar el usuario"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado"
                });
            }

            res.json({
                mensaje: "Usuario actualizado correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/usuarios/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de usuario no válido"
        });
    }

    const sql = `
        DELETE FROM usuarios
        WHERE id_usuario = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar el usuario porque tiene registros asociados"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar el usuario"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario eliminado correctamente"
        });
    });
});

// ======================================================
// ROLES
// ======================================================

// CREAR
app.post("/api/roles", function (req, res) {

    const {
        nombre,
        descripcion
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre del rol es obligatorio"
        });
    }

    const sql = `
        INSERT INTO roles
        (
            nombre,
            descripcion
        )
        VALUES (?, ?)
    `;

    conexion.query(
        sql,
        [nombre.trim(), descripcion || null],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al registrar el rol"
                );
            }

            res.status(201).json({
                mensaje: "Rol registrado correctamente",
                id_rol: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/roles", function (req, res) {

    const sql = `
        SELECT
            id_rol,
            nombre,
            descripcion
        FROM roles
        ORDER BY nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar los roles"
            );
        }

        res.json(resultado);
    });
});

// ACTUALIZAR
app.put("/api/roles/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de rol no válido"
        });
    }

    const {
        nombre,
        descripcion
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre del rol es obligatorio"
        });
    }

    const sql = `
        UPDATE roles
        SET
            nombre = ?,
            descripcion = ?
        WHERE id_rol = ?
    `;

    conexion.query(
        sql,
        [nombre.trim(), descripcion || null, id],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al actualizar el rol"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Rol no encontrado"
                });
            }

            res.json({
                mensaje: "Rol actualizado correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/roles/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de rol no válido"
        });
    }

    const sql = `
        DELETE FROM roles
        WHERE id_rol = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar el rol porque tiene usuarios asociados"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar el rol"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Rol no encontrado"
            });
        }

        res.json({
            mensaje: "Rol eliminado correctamente"
        });
    });
});

// ======================================================
// ESPECIES
// ======================================================

// CREAR
app.post("/api/especies", function (req, res) {

    const {
        nombre,
        descripcion
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre de la especie es obligatorio"
        });
    }

    const sql = `
        INSERT INTO especies
        (
            nombre,
            descripcion
        )
        VALUES (?, ?)
    `;

    conexion.query(
        sql,
        [nombre.trim(), descripcion || null],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "La especie ya está registrada"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al registrar la especie"
                );
            }

            res.status(201).json({
                mensaje: "Especie registrada correctamente",
                id_especie: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/especies", function (req, res) {

    const sql = `
        SELECT
            id_especie,
            nombre,
            descripcion
        FROM especies
        ORDER BY nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las especies"
            );
        }

        res.json(resultado);
    });
});

// ACTUALIZAR
app.put("/api/especies/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de especie no válido"
        });
    }

    const {
        nombre,
        descripcion
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre de la especie es obligatorio"
        });
    }

    const sql = `
        UPDATE especies
        SET
            nombre = ?,
            descripcion = ?
        WHERE id_especie = ?
    `;

    conexion.query(
        sql,
        [nombre.trim(), descripcion || null, id],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "La especie ya está registrada"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al actualizar la especie"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Especie no encontrada"
                });
            }

            res.json({
                mensaje: "Especie actualizada correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/especies/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de especie no válido"
        });
    }

    const sql = `
        DELETE FROM especies
        WHERE id_especie = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar la especie porque tiene razas o mascotas asociadas"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar la especie"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Especie no encontrada"
            });
        }

        res.json({
            mensaje: "Especie eliminada correctamente"
        });
    });
});

// ======================================================
// RAZAS
// ======================================================

// CREAR
app.post("/api/razas", function (req, res) {

    const {
        nombre,
        descripcion,
        id_especie
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(id_especie)
    ) {
        return res.status(400).json({
            mensaje: "Nombre e especie son obligatorios"
        });
    }

    const sql = `
        INSERT INTO razas
        (
            nombre,
            descripcion,
            id_especie
        )
        VALUES (?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            descripcion || null,
            id_especie
        ],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "La raza ya está registrada"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al registrar la raza"
                );
            }

            res.status(201).json({
                mensaje: "Raza registrada correctamente",
                id_raza: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/razas", function (req, res) {

    const sql = `
        SELECT
            r.id_raza,
            r.nombre,
            r.descripcion,
            r.id_especie,
            e.nombre AS especie
        FROM razas r
        INNER JOIN especies e
            ON r.id_especie = e.id_especie
        ORDER BY r.nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las razas"
            );
        }

        res.json(resultado);
    });
});

// ACTUALIZAR
app.put("/api/razas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de raza no válido"
        });
    }

    const {
        nombre,
        descripcion,
        id_especie
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(id_especie)
    ) {
        return res.status(400).json({
            mensaje: "Nombre y especie son obligatorios"
        });
    }

    const sql = `
        UPDATE razas
        SET
            nombre = ?,
            descripcion = ?,
            id_especie = ?
        WHERE id_raza = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            descripcion || null,
            id_especie,
            id
        ],
        function (error, resultado) {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "La raza ya está registrada"
                    });
                }

                return responderError(
                    res,
                    error,
                    "Error al actualizar la raza"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Raza no encontrada"
                });
            }

            res.json({
                mensaje: "Raza actualizada correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/razas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de raza no válido"
        });
    }

    const sql = `
        DELETE FROM razas
        WHERE id_raza = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar la raza porque tiene mascotas asociadas"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar la raza"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Raza no encontrada"
            });
        }

        res.json({
            mensaje: "Raza eliminada correctamente"
        });
    });
});

// ======================================================
// MASCOTAS
// ======================================================

// CREAR
app.post("/api/mascotas", function (req, res) {

    const {
        nombre,
        sexo,
        fecha_nacimiento,
        color,
        id_especie,
        id_raza,
        id_propietario
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(sexo) ||
        !esObligatorio(id_especie) ||
        !esObligatorio(id_propietario)
    ) {
        return res.status(400).json({
            mensaje: "Nombre, sexo, especie y propietario son obligatorios"
        });
    }

    if (sexo !== "Macho" && sexo !== "Hembra") {
        return res.status(400).json({
            mensaje: "El sexo debe ser Macho o Hembra"
        });
    }

    const sql = `
        INSERT INTO mascotas
        (
            nombre,
            sexo,
            fecha_nacimiento,
            color,
            id_especie,
            id_raza,
            id_propietario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            sexo,
            fecha_nacimiento || null,
            color || null,
            id_especie,
            id_raza || null,
            id_propietario
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al registrar la mascota"
                );
            }

            res.status(201).json({
                mensaje: "Mascota registrada correctamente",
                id_mascota: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/mascotas", function (req, res) {

    const sql = `
        SELECT
            m.id_mascota,
            m.nombre,
            m.sexo,
            m.fecha_nacimiento,
            m.color,
            m.id_especie,
            m.id_raza,
            m.id_propietario,
            e.nombre AS especie,
            r.nombre AS raza,
            CONCAT(p.nombre, ' ', p.apellido) AS propietario
        FROM mascotas m
        INNER JOIN especies e
            ON m.id_especie = e.id_especie
        LEFT JOIN razas r
            ON m.id_raza = r.id_raza
        INNER JOIN propietarios p
            ON m.id_propietario = p.id_propietario
        ORDER BY m.nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las mascotas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNA
app.get("/api/mascotas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de mascota no válido"
        });
    }

    const sql = `
        SELECT
            m.id_mascota,
            m.nombre,
            m.sexo,
            m.fecha_nacimiento,
            m.color,
            m.id_especie,
            m.id_raza,
            m.id_propietario,
            e.nombre AS especie,
            r.nombre AS raza,
            CONCAT(p.nombre, ' ', p.apellido) AS propietario
        FROM mascotas m
        INNER JOIN especies e
            ON m.id_especie = e.id_especie
        LEFT JOIN razas r
            ON m.id_raza = r.id_raza
        INNER JOIN propietarios p
            ON m.id_propietario = p.id_propietario
        WHERE m.id_mascota = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar la mascota"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Mascota no encontrada"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/mascotas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de mascota no válido"
        });
    }

    const {
        nombre,
        sexo,
        fecha_nacimiento,
        color,
        id_especie,
        id_raza,
        id_propietario
    } = req.body;

    if (
        !esObligatorio(nombre) ||
        !esObligatorio(sexo) ||
        !esObligatorio(id_especie) ||
        !esObligatorio(id_propietario)
    ) {
        return res.status(400).json({
            mensaje: "Nombre, sexo, especie y propietario son obligatorios"
        });
    }

    if (sexo !== "Macho" && sexo !== "Hembra") {
        return res.status(400).json({
            mensaje: "El sexo debe ser Macho o Hembra"
        });
    }

    const sql = `
        UPDATE mascotas
        SET
            nombre = ?,
            sexo = ?,
            fecha_nacimiento = ?,
            color = ?,
            id_especie = ?,
            id_raza = ?,
            id_propietario = ?
        WHERE id_mascota = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            sexo,
            fecha_nacimiento || null,
            color || null,
            id_especie,
            id_raza || null,
            id_propietario,
            id
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al actualizar la mascota"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Mascota no encontrada"
                });
            }

            res.json({
                mensaje: "Mascota actualizada correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/mascotas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de mascota no válido"
        });
    }

    const sql = `
        DELETE FROM mascotas
        WHERE id_mascota = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar la mascota porque tiene citas, historias clínicas o vacunaciones asociadas"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar la mascota"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Mascota no encontrada"
            });
        }

        res.json({
            mensaje: "Mascota eliminada correctamente"
        });
    });
});

// ======================================================
// CITAS
// ======================================================

// CREAR
app.post("/api/citas", function (req, res) {

    const {
        fecha_hora,
        motivo,
        estado,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    if (
        !esObligatorio(fecha_hora) ||
        !esObligatorio(motivo) ||
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_usuario)
    ) {
        return res.status(400).json({
            mensaje: "Fecha, motivo, mascota y veterinario son obligatorios"
        });
    }

    const estadoFinal = estado || "Programada";

    if (
        estadoFinal !== "Programada" &&
        estadoFinal !== "Atendida" &&
        estadoFinal !== "Cancelada"
    ) {
        return res.status(400).json({
            mensaje: "Estado de cita no válido"
        });
    }

    const verificarSql = `
        SELECT id_cita
        FROM citas
        WHERE id_mascota = ?
        AND fecha_hora = ?
        AND estado <> 'Cancelada'
    `;

    conexion.query(
        verificarSql,
        [id_mascota, fecha_hora],
        function (error, existentes) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al verificar la disponibilidad de la cita"
                );
            }

            if (existentes.length > 0) {
                return res.status(409).json({
                    mensaje: "La mascota ya tiene una cita en esa fecha y hora"
                });
            }

            const sql = `
                INSERT INTO citas
                (
                    fecha_hora,
                    motivo,
                    estado,
                    observaciones,
                    id_mascota,
                    id_usuario
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            conexion.query(
                sql,
                [
                    fecha_hora,
                    motivo.trim(),
                    estadoFinal,
                    observaciones || null,
                    id_mascota,
                    id_usuario
                ],
                function (error, resultado) {

                    if (error) {
                        return responderError(
                            res,
                            error,
                            "Error al registrar la cita"
                        );
                    }

                    res.status(201).json({
                        mensaje: "Cita registrada correctamente",
                        id_cita: resultado.insertId
                    });
                }
            );
        }
    );
});

// CONSULTAR
app.get("/api/citas", function (req, res) {

    const sql = `
        SELECT
            c.id_cita,
            c.fecha_hora,
            c.motivo,
            c.estado,
            c.observaciones,
            c.id_mascota,
            c.id_usuario,
            m.nombre AS mascota,
            CONCAT(u.nombre, ' ', u.apellido) AS veterinario
        FROM citas c
        INNER JOIN mascotas m
            ON c.id_mascota = m.id_mascota
        INNER JOIN usuarios u
            ON c.id_usuario = u.id_usuario
        ORDER BY c.fecha_hora ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las citas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNA
app.get("/api/citas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de cita no válido"
        });
    }

    const sql = `
        SELECT
            c.id_cita,
            c.fecha_hora,
            c.motivo,
            c.estado,
            c.observaciones,
            c.id_mascota,
            c.id_usuario,
            m.nombre AS mascota,
            CONCAT(u.nombre, ' ', u.apellido) AS veterinario
        FROM citas c
        INNER JOIN mascotas m
            ON c.id_mascota = m.id_mascota
        INNER JOIN usuarios u
            ON c.id_usuario = u.id_usuario
        WHERE c.id_cita = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar la cita"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Cita no encontrada"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/citas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de cita no válido"
        });
    }

    const {
        fecha_hora,
        motivo,
        estado,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    if (
        !esObligatorio(fecha_hora) ||
        !esObligatorio(motivo) ||
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_usuario)
    ) {
        return res.status(400).json({
            mensaje: "Fecha, motivo, mascota y veterinario son obligatorios"
        });
    }

    const estadoFinal = estado || "Programada";

    if (
        estadoFinal !== "Programada" &&
        estadoFinal !== "Atendida" &&
        estadoFinal !== "Cancelada"
    ) {
        return res.status(400).json({
            mensaje: "Estado de cita no válido"
        });
    }

    const verificarSql = `
        SELECT id_cita
        FROM citas
        WHERE id_mascota = ?
        AND fecha_hora = ?
        AND estado <> 'Cancelada'
        AND id_cita <> ?
    `;

    conexion.query(
        verificarSql,
        [id_mascota, fecha_hora, id],
        function (error, existentes) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al verificar la cita"
                );
            }

            if (existentes.length > 0) {
                return res.status(409).json({
                    mensaje: "La mascota ya tiene otra cita en esa fecha y hora"
                });
            }

            const sql = `
                UPDATE citas
                SET
                    fecha_hora = ?,
                    motivo = ?,
                    estado = ?,
                    observaciones = ?,
                    id_mascota = ?,
                    id_usuario = ?
                WHERE id_cita = ?
            `;

            conexion.query(
                sql,
                [
                    fecha_hora,
                    motivo.trim(),
                    estadoFinal,
                    observaciones || null,
                    id_mascota,
                    id_usuario,
                    id
                ],
                function (error, resultado) {

                    if (error) {
                        return responderError(
                            res,
                            error,
                            "Error al actualizar la cita"
                        );
                    }

                    if (resultado.affectedRows === 0) {
                        return res.status(404).json({
                            mensaje: "Cita no encontrada"
                        });
                    }

                    res.json({
                        mensaje: "Cita actualizada correctamente"
                    });
                }
            );
        }
    );
});

// ELIMINAR
app.delete("/api/citas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de cita no válido"
        });
    }

    const sql = `
        DELETE FROM citas
        WHERE id_cita = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al eliminar la cita"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Cita no encontrada"
            });
        }

        res.json({
            mensaje: "Cita eliminada correctamente"
        });
    });
});
// ======================================================
// HISTORIAS CLÍNICAS
// ======================================================

// CREAR
app.post("/api/historias-clinicas", function (req, res) {

    const {
        fecha,
        motivo_consulta,
        antecedentes,
        diagnostico,
        tratamiento,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    if (
        !esObligatorio(fecha) ||
        !esObligatorio(motivo_consulta) ||
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_usuario)
    ) {
        return res.status(400).json({
            mensaje: "Fecha, motivo, mascota y veterinario son obligatorios"
        });
    }

    const sql = `
        INSERT INTO historias_clinicas
        (
            fecha,
            motivo_consulta,
            antecedentes,
            diagnostico,
            tratamiento,
            observaciones,
            id_mascota,
            id_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha,
            motivo_consulta.trim(),
            antecedentes || null,
            diagnostico || null,
            tratamiento || null,
            observaciones || null,
            id_mascota,
            id_usuario
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al registrar la historia clínica"
                );
            }

            res.status(201).json({
                mensaje: "Historia clínica registrada correctamente",
                id_historia: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/historias-clinicas", function (req, res) {

    const sql = `
        SELECT
            h.id_historia,
            h.fecha,
            h.motivo_consulta,
            h.antecedentes,
            h.diagnostico,
            h.tratamiento,
            h.observaciones,
            h.id_mascota,
            h.id_usuario,
            m.nombre AS mascota,
            CONCAT(u.nombre, ' ', u.apellido) AS veterinario
        FROM historias_clinicas h
        INNER JOIN mascotas m
            ON h.id_mascota = m.id_mascota
        INNER JOIN usuarios u
            ON h.id_usuario = u.id_usuario
        ORDER BY h.fecha DESC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las historias clínicas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNA
app.get("/api/historias-clinicas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de historia clínica no válido"
        });
    }

    const sql = `
        SELECT
            h.id_historia,
            h.fecha,
            h.motivo_consulta,
            h.antecedentes,
            h.diagnostico,
            h.tratamiento,
            h.observaciones,
            h.id_mascota,
            h.id_usuario,
            m.nombre AS mascota,
            CONCAT(u.nombre, ' ', u.apellido) AS veterinario
        FROM historias_clinicas h
        INNER JOIN mascotas m
            ON h.id_mascota = m.id_mascota
        INNER JOIN usuarios u
            ON h.id_usuario = u.id_usuario
        WHERE h.id_historia = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar la historia clínica"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Historia clínica no encontrada"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/historias-clinicas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de historia clínica no válido"
        });
    }

    const {
        fecha,
        motivo_consulta,
        antecedentes,
        diagnostico,
        tratamiento,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    if (
        !esObligatorio(fecha) ||
        !esObligatorio(motivo_consulta) ||
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_usuario)
    ) {
        return res.status(400).json({
            mensaje: "Fecha, motivo, mascota y veterinario son obligatorios"
        });
    }

    const sql = `
        UPDATE historias_clinicas
        SET
            fecha = ?,
            motivo_consulta = ?,
            antecedentes = ?,
            diagnostico = ?,
            tratamiento = ?,
            observaciones = ?,
            id_mascota = ?,
            id_usuario = ?
        WHERE id_historia = ?
    `;

    conexion.query(
        sql,
        [
            fecha,
            motivo_consulta.trim(),
            antecedentes || null,
            diagnostico || null,
            tratamiento || null,
            observaciones || null,
            id_mascota,
            id_usuario,
            id
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al actualizar la historia clínica"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Historia clínica no encontrada"
                });
            }

            res.json({
                mensaje: "Historia clínica actualizada correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/historias-clinicas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de historia clínica no válido"
        });
    }

    const sql = `
        DELETE FROM historias_clinicas
        WHERE id_historia = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al eliminar la historia clínica"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Historia clínica no encontrada"
            });
        }

        res.json({
            mensaje: "Historia clínica eliminada correctamente"
        });
    });
});

// ======================================================
// VACUNAS
// ======================================================

// CREAR
app.post("/api/vacunas", function (req, res) {

    const {
        nombre,
        descripcion,
        dosis,
        fabricante
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre de la vacuna es obligatorio"
        });
    }

    const sql = `
        INSERT INTO vacunas
        (
            nombre,
            descripcion,
            dosis,
            fabricante
        )
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            descripcion || null,
            dosis || null,
            fabricante || null
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al registrar la vacuna"
                );
            }

            res.status(201).json({
                mensaje: "Vacuna registrada correctamente",
                id_vacuna: resultado.insertId
            });
        }
    );
});

// CONSULTAR
app.get("/api/vacunas", function (req, res) {

    const sql = `
        SELECT
            id_vacuna,
            nombre,
            descripcion,
            dosis,
            fabricante
        FROM vacunas
        ORDER BY nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las vacunas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNA
app.get("/api/vacunas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacuna no válido"
        });
    }

    const sql = `
        SELECT
            id_vacuna,
            nombre,
            descripcion,
            dosis,
            fabricante
        FROM vacunas
        WHERE id_vacuna = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar la vacuna"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Vacuna no encontrada"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/vacunas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacuna no válido"
        });
    }

    const {
        nombre,
        descripcion,
        dosis,
        fabricante
    } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre de la vacuna es obligatorio"
        });
    }

    const sql = `
        UPDATE vacunas
        SET
            nombre = ?,
            descripcion = ?,
            dosis = ?,
            fabricante = ?
        WHERE id_vacuna = ?
    `;

    conexion.query(
        sql,
        [
            nombre.trim(),
            descripcion || null,
            dosis || null,
            fabricante || null,
            id
        ],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al actualizar la vacuna"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Vacuna no encontrada"
                });
            }

            res.json({
                mensaje: "Vacuna actualizada correctamente"
            });
        }
    );
});

// ELIMINAR
app.delete("/api/vacunas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacuna no válido"
        });
    }

    const sql = `
        DELETE FROM vacunas
        WHERE id_vacuna = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    mensaje: "No se puede eliminar la vacuna porque tiene vacunaciones asociadas"
                });
            }

            return responderError(
                res,
                error,
                "Error al eliminar la vacuna"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Vacuna no encontrada"
            });
        }

        res.json({
            mensaje: "Vacuna eliminada correctamente"
        });
    });
});

// ======================================================
// VACUNACIONES
// ======================================================

// CREAR
app.post("/api/vacunaciones", function (req, res) {

    const {
        id_mascota,
        id_vacuna,
        fecha_aplicacion,
        proxima_dosis,
        observaciones
    } = req.body;

    if (
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_vacuna) ||
        !esObligatorio(fecha_aplicacion)
    ) {
        return res.status(400).json({
            mensaje: "Mascota, vacuna y fecha de aplicación son obligatorios"
        });
    }

    if (proxima_dosis && String(proxima_dosis) < String(fecha_aplicacion)) {
        return res.status(400).json({
            mensaje: "La próxima dosis no puede ser anterior a la fecha de aplicación"
        });
    }

    const verificarSql = `
        SELECT id_vacunacion
        FROM vacunaciones
        WHERE id_mascota = ?
        AND id_vacuna = ?
        AND fecha_aplicacion = ?
    `;

    conexion.query(
        verificarSql,
        [
            id_mascota,
            id_vacuna,
            fecha_aplicacion
        ],
        function (error, existentes) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al verificar la vacunación"
                );
            }

            if (existentes.length > 0) {
                return res.status(409).json({
                    mensaje: "Esta vacunación ya está registrada para la mascota en esa fecha"
                });
            }

            const sql = `
                INSERT INTO vacunaciones
                (
                    id_mascota,
                    id_vacuna,
                    fecha_aplicacion,
                    proxima_dosis,
                    observaciones
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            conexion.query(
                sql,
                [
                    id_mascota,
                    id_vacuna,
                    fecha_aplicacion,
                    proxima_dosis || null,
                    observaciones || null
                ],
                function (error, resultado) {

                    if (error) {
                        return responderError(
                            res,
                            error,
                            "Error al registrar la vacunación"
                        );
                    }

                    res.status(201).json({
                        mensaje: "Vacunación registrada correctamente",
                        id_vacunacion: resultado.insertId
                    });
                }
            );
        }
    );
});

// CONSULTAR
app.get("/api/vacunaciones", function (req, res) {

    const sql = `
        SELECT
            v.id_vacunacion,
            v.id_mascota,
            v.id_vacuna,
            v.fecha_aplicacion,
            v.proxima_dosis,
            v.observaciones,
            m.nombre AS mascota,
            va.nombre AS vacuna
        FROM vacunaciones v
        INNER JOIN mascotas m
            ON v.id_mascota = m.id_mascota
        INNER JOIN vacunas va
            ON v.id_vacuna = va.id_vacuna
        ORDER BY v.fecha_aplicacion DESC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las vacunaciones"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR UNA
app.get("/api/vacunaciones/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacunación no válido"
        });
    }

    const sql = `
        SELECT
            v.id_vacunacion,
            v.id_mascota,
            v.id_vacuna,
            v.fecha_aplicacion,
            v.proxima_dosis,
            v.observaciones,
            m.nombre AS mascota,
            va.nombre AS vacuna
        FROM vacunaciones v
        INNER JOIN mascotas m
            ON v.id_mascota = m.id_mascota
        INNER JOIN vacunas va
            ON v.id_vacuna = va.id_vacuna
        WHERE v.id_vacunacion = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar la vacunación"
            );
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: "Vacunación no encontrada"
            });
        }

        res.json(resultado[0]);
    });
});

// ACTUALIZAR
app.put("/api/vacunaciones/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacunación no válido"
        });
    }

    const {
        id_mascota,
        id_vacuna,
        fecha_aplicacion,
        proxima_dosis,
        observaciones
    } = req.body;

    if (
        !esObligatorio(id_mascota) ||
        !esObligatorio(id_vacuna) ||
        !esObligatorio(fecha_aplicacion)
    ) {
        return res.status(400).json({
            mensaje: "Mascota, vacuna y fecha de aplicación son obligatorios"
        });
    }

    if (proxima_dosis && String(proxima_dosis) < String(fecha_aplicacion)) {
        return res.status(400).json({
            mensaje: "La próxima dosis no puede ser anterior a la fecha de aplicación"
        });
    }

    const verificarSql = `
        SELECT id_vacunacion
        FROM vacunaciones
        WHERE id_mascota = ?
        AND id_vacuna = ?
        AND fecha_aplicacion = ?
        AND id_vacunacion <> ?
    `;

    conexion.query(
        verificarSql,
        [
            id_mascota,
            id_vacuna,
            fecha_aplicacion,
            id
        ],
        function (error, existentes) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al verificar la vacunación"
                );
            }

            if (existentes.length > 0) {
                return res.status(409).json({
                    mensaje: "Ya existe otra vacunación igual para esta mascota"
                });
            }

            const sql = `
                UPDATE vacunaciones
                SET
                    id_mascota = ?,
                    id_vacuna = ?,
                    fecha_aplicacion = ?,
                    proxima_dosis = ?,
                    observaciones = ?
                WHERE id_vacunacion = ?
            `;

            conexion.query(
                sql,
                [
                    id_mascota,
                    id_vacuna,
                    fecha_aplicacion,
                    proxima_dosis || null,
                    observaciones || null,
                    id
                ],
                function (error, resultado) {

                    if (error) {
                        return responderError(
                            res,
                            error,
                            "Error al actualizar la vacunación"
                        );
                    }

                    if (resultado.affectedRows === 0) {
                        return res.status(404).json({
                            mensaje: "Vacunación no encontrada"
                        });
                    }

                    res.json({
                        mensaje: "Vacunación actualizada correctamente"
                    });
                }
            );
        }
    );
});

// ELIMINAR
app.delete("/api/vacunaciones/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de vacunación no válido"
        });
    }

    const sql = `
        DELETE FROM vacunaciones
        WHERE id_vacunacion = ?
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al eliminar la vacunación"
            );
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Vacunación no encontrada"
            });
        }

        res.json({
            mensaje: "Vacunación eliminada correctamente"
        });
    });
});

// ======================================================
// FACTURAS
// ======================================================

// CREAR FACTURA + DETALLES
app.post("/api/facturas", function (req, res) {

    const {
        id_propietario,
        fecha,
        subtotal,
        impuesto,
        total,
        estado,
        detalles
    } = req.body;

    if (
        !esObligatorio(id_propietario) ||
        !esObligatorio(fecha) ||
        !Array.isArray(detalles) ||
        detalles.length === 0
    ) {
        return res.status(400).json({
            mensaje: "Propietario, fecha y al menos un detalle son obligatorios"
        });
    }

    const subtotalFinal = Number(subtotal);
    const impuestoFinal = Number(impuesto || 0);
    const totalFinal = Number(total);

    if (
        !Number.isFinite(subtotalFinal) ||
        !Number.isFinite(impuestoFinal) ||
        !Number.isFinite(totalFinal)
    ) {
        return res.status(400).json({
            mensaje: "Los valores de la factura no son válidos"
        });
    }

    conexion.beginTransaction(function (error) {

        if (error) {
            return responderError(
                res,
                error,
                "No se pudo iniciar la transacción de la factura"
            );
        }

        const sqlFactura = `
            INSERT INTO facturas
            (
                id_propietario,
                fecha,
                subtotal,
                impuesto,
                total,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        conexion.query(
            sqlFactura,
            [
                id_propietario,
                fecha,
                subtotalFinal,
                impuestoFinal,
                totalFinal,
                estado || "pendiente"
            ],
            function (error, resultadoFactura) {

                if (error) {

                    return conexion.rollback(function () {

                        responderError(
                            res,
                            error,
                            "Error al registrar la factura"
                        );

                    });
                }

                const idFactura = resultadoFactura.insertId;

                const valoresDetalles = detalles.map(function (detalle) {

                    const cantidad = Number(detalle.cantidad);
                    const precio = Number(
                        detalle.precio_unitario !== undefined
                            ? detalle.precio_unitario
                            : detalle.precio
                    );

                    const subtotalDetalle = Number(
                        detalle.subtotal !== undefined
                            ? detalle.subtotal
                            : cantidad * precio
                    );

                    return [
                        idFactura,
                        detalle.descripcion,
                        cantidad,
                        precio,
                        subtotalDetalle
                    ];
                });

                const sqlDetalles = `
                    INSERT INTO detalle_factura
                    (
                        id_factura,
                        descripcion,
                        cantidad,
                        precio_unitario,
                        subtotal
                    )
                    VALUES ?
                `;

                conexion.query(
                    sqlDetalles,
                    [valoresDetalles],
                    function (error) {

                        if (error) {

                            return conexion.rollback(function () {

                                responderError(
                                    res,
                                    error,
                                    "Error al registrar los detalles de la factura"
                                );

                            });
                        }

                        conexion.commit(function (error) {

                            if (error) {

                                return conexion.rollback(function () {

                                    responderError(
                                        res,
                                        error,
                                        "Error al confirmar la factura"
                                    );

                                });
                            }

                            res.status(201).json({
                                mensaje: "Factura registrada correctamente",
                                id_factura: idFactura
                            });
                        });
                    }
                );
            }
        );
    });
});

// CONSULTAR FACTURAS
app.get("/api/facturas", function (req, res) {

    const sql = `
        SELECT
            f.id_factura,
            f.id_propietario,
            CONCAT(p.nombre, ' ', p.apellido) AS cliente,
            f.fecha,
            f.subtotal,
            f.impuesto,
            f.total,
            f.estado
        FROM facturas f
        INNER JOIN propietarios p
            ON f.id_propietario = p.id_propietario
        ORDER BY f.fecha DESC, f.id_factura DESC
    `;

    conexion.query(sql, function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar las facturas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR FACTURA CON DETALLES
app.get("/api/facturas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de factura no válido"
        });
    }

    const sqlFactura = `
        SELECT
            f.id_factura,
            f.id_propietario,
            CONCAT(p.nombre, ' ', p.apellido) AS cliente,
            f.fecha,
            f.subtotal,
            f.impuesto,
            f.total,
            f.estado
        FROM facturas f
        INNER JOIN propietarios p
            ON f.id_propietario = p.id_propietario
        WHERE f.id_factura = ?
    `;

    const sqlDetalles = `
        SELECT
            id_detalle,
            id_factura,
            descripcion,
            cantidad,
            precio_unitario,
            subtotal
        FROM detalle_factura
        WHERE id_factura = ?
        ORDER BY id_detalle ASC
    `;

    conexion.query(
        sqlFactura,
        [id],
        function (error, facturas) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al consultar la factura"
                );
            }

            if (facturas.length === 0) {
                return res.status(404).json({
                    mensaje: "Factura no encontrada"
                });
            }

            conexion.query(
                sqlDetalles,
                [id],
                function (error, detalles) {

                    if (error) {
                        return responderError(
                            res,
                            error,
                            "Error al consultar los detalles de la factura"
                        );
                    }

                    res.json({
                        factura: facturas[0],
                        detalles: detalles
                    });
                }
            );
        }
    );
});

// ACTUALIZAR ESTADO DE FACTURA
app.put("/api/facturas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de factura no válido"
        });
    }

    const {
        estado
    } = req.body;

    if (!esObligatorio(estado)) {
        return res.status(400).json({
            mensaje: "El estado es obligatorio"
        });
    }

    const sql = `
        UPDATE facturas
        SET estado = ?
        WHERE id_factura = ?
    `;

    conexion.query(
        sql,
        [estado, id],
        function (error, resultado) {

            if (error) {
                return responderError(
                    res,
                    error,
                    "Error al actualizar la factura"
                );
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Factura no encontrada"
                });
            }

            res.json({
                mensaje: "Factura actualizada correctamente"
            });
        }
    );
});

// ELIMINAR FACTURA Y SUS DETALLES
app.delete("/api/facturas/:id", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de factura no válido"
        });
    }

    conexion.beginTransaction(function (error) {

        if (error) {
            return responderError(
                res,
                error,
                "No se pudo iniciar la eliminación de la factura"
            );
        }

        const sqlDetalles = `
            DELETE FROM detalle_factura
            WHERE id_factura = ?
        `;

        conexion.query(
            sqlDetalles,
            [id],
            function (error) {

                if (error) {

                    return conexion.rollback(function () {

                        responderError(
                            res,
                            error,
                            "Error al eliminar los detalles de la factura"
                        );

                    });
                }

                const sqlFactura = `
                    DELETE FROM facturas
                    WHERE id_factura = ?
                `;

                conexion.query(
                    sqlFactura,
                    [id],
                    function (error, resultado) {

                        if (error) {

                            return conexion.rollback(function () {

                                responderError(
                                    res,
                                    error,
                                    "Error al eliminar la factura"
                                );

                            });
                        }

                        if (resultado.affectedRows === 0) {

                            return conexion.rollback(function () {

                                res.status(404).json({
                                    mensaje: "Factura no encontrada"
                                });

                            });
                        }

                        conexion.commit(function (error) {

                            if (error) {

                                return conexion.rollback(function () {

                                    responderError(
                                        res,
                                        error,
                                        "Error al confirmar la eliminación de la factura"
                                    );

                                });
                            }

                            res.json({
                                mensaje: "Factura eliminada correctamente"
                            });
                        });
                    }
                );
            }
        );
    });
});

// ======================================================
// DETALLES DE FACTURA
// ======================================================

// CONSULTAR DETALLES
app.get("/api/facturas/:id/detalles", function (req, res) {

    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({
            mensaje: "ID de factura no válido"
        });
    }

    const sql = `
        SELECT
            id_detalle,
            id_factura,
            descripcion,
            cantidad,
            precio_unitario,
            subtotal
        FROM detalle_factura
        WHERE id_factura = ?
        ORDER BY id_detalle ASC
    `;

    conexion.query(sql, [id], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al consultar los detalles"
            );
        }

        res.json(resultado);
    });
});

// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, function () {

    console.log("==========================================");
    console.log("   DOCTOR WILSON - SERVIDOR BACKEND");
    console.log("==========================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Base de datos: doctor_wilson");
    console.log("Estado: ACTIVO");
    console.log("==========================================");
});
// ======================================================
// MÓDULO DE EDWARD: ESPECIES
// ======================================================

// CREAR ESPECIE
app.post("/api/especies", function (req, res) {
    const { nombre, descripcion } = req.body;

    if (!esObligatorio(nombre)) {
        return res.status(400).json({
            mensaje: "El nombre de la especie es obligatorio"
        });
    }

    const sql = "INSERT INTO especies (nombre, descripcion) VALUES (?, ?)";

    conexion.query(sql, [nombre.trim(), descripcion || null], function (error, resultado) {
        if (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ mensaje: "Esta especie ya está registrada" });
            }
            return responderError(res, error, "Error al registrar la especie");
        }
        res.status(201).json({
            mensaje: "Especie registrada correctamente",
            id_especie: resultado.insertId
        });
    });
});

// CONSULTAR ESPECIES
app.get("/api/especies", function (req, res) {
    const sql = "SELECT id_especie, nombre, descripcion FROM especies ORDER BY nombre ASC";

    conexion.query(sql, function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al consultar las especies");
        }
        res.json(resultado);
    });
});

// ACTUALIZAR ESPECIE
app.put("/api/especies/:id", function (req, res) {
    const id = req.params.id;
    const { nombre, descripcion } = req.body;

    if (!esIdValido(id)) {
        return res.status(400).json({ mensaje: "ID de especie no válido" });
    }
    if (!esObligatorio(nombre)) {
        return res.status(400).json({ mensaje: "El nombre de la especie es obligatorio" });
    }

    const sql = "UPDATE especies SET nombre = ?, descripcion = ? WHERE id_especie = ?";

    conexion.query(sql, [nombre.trim(), descripcion || null, id], function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al actualizar la especie");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Especie no encontrada" });
        }
        res.json({ mensaje: "Especie actualizada correctamente" });
    });
});

// ELIMINAR ESPECIE
app.delete("/api/especies/:id", function (req, res) {
    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({ mensaje: "ID de especie no válido" });
    }

    const sql = "DELETE FROM especies WHERE id_especie = ?";

    conexion.query(sql, [id], function (error, resultado) {
        if (error) {
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ mensaje: "No se puede eliminar la especie porque tiene razas o mascotas asociadas" });
            }
            return responderError(res, error, "Error al eliminar la especie");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Especie no encontrada" });
        }
        res.json({ mensaje: "Especie eliminada correctamente" });
    });
});


// ======================================================
// MÓDULO DE EDWARD: RAZAS
// ======================================================

// CREAR RAZA
app.post("/api/razas", function (req, res) {
    const { nombre, descripcion, id_especie } = req.body;

    if (!esObligatorio(nombre) || !esObligatorio(id_especie)) {
        return res.status(400).json({
            mensaje: "El nombre de la raza y la especie son obligatorios"
        });
    }

    const sql = "INSERT INTO razas (nombre, descripcion, id_especie) VALUES (?, ?, ?)";

    conexion.query(sql, [nombre.trim(), descripcion || null, id_especie], function (error, resultado) {
        if (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ mensaje: "Esta raza ya está registrada" });
            }
            return responderError(res, error, "Error al registrar la raza");
        }
        res.status(201).json({
            mensaje: "Raza registrada correctamente",
            id_raza: resultado.insertId
        });
    });
});

// CONSULTAR RAZAS
app.get("/api/razas", function (req, res) {
    const sql = `
        SELECT r.id_raza, r.nombre AS nombre_raza, r.descripcion, r.id_especie, e.nombre AS nombre_especie 
        FROM razas r
        INNER JOIN especies e ON r.id_especie = e.id_especie
        ORDER BY r.nombre ASC
    `;

    conexion.query(sql, function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al consultar las razas");
        }
        res.json(resultado);
    });
});

// ACTUALIZAR RAZA
app.put("/api/razas/:id", function (req, res) {
    const id = req.params.id;
    const { nombre, descripcion, id_especie } = req.body;

    if (!esIdValido(id)) {
        return res.status(400).json({ mensaje: "ID de raza no válido" });
    }
    if (!esObligatorio(nombre) || !esObligatorio(id_especie)) {
        return res.status(400).json({ mensaje: "Nombre y especie son obligatorios" });
    }

    const sql = "UPDATE razas SET nombre = ?, descripcion = ?, id_especie = ? WHERE id_raza = ?";

    conexion.query(sql, [nombre.trim(), descripcion || null, id_especie, id], function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al actualizar la raza");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Raza no encontrada" });
        }
        res.json({ mensaje: "Raza actualizada correctamente" });
    });
});

// ELIMINAR RAZA
app.delete("/api/razas/:id", function (req, res) {
    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({ mensaje: "ID de raza no válido" });
    }

    const sql = "DELETE FROM razas WHERE id_raza = ?";

    conexion.query(sql, [id], function (error, resultado) {
        if (error) {
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({ mensaje: "No se puede eliminar la raza porque tiene mascotas asociadas" });
            }
            return responderError(res, error, "Error al eliminar la raza");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Raza no encontrada" });
        }
        res.json({ mensaje: "Raza eliminada correctamente" });
    });
});
// ======================================================
// MÓDULO DE EDWARD: FACTURAS Y DETALLES
// ======================================================

// CREAR FACTURA CON SUS DETALLES (Uso de Transacción)
app.post("/api/facturas", function (req, res) {
    const { id_propietario, subtotal, impuesto, total, estado, detalles } = req.body;

    if (!esObligatorio(id_propietario) || !esObligatorio(subtotal) || !esObligatorio(total) || !detalles || detalles.length === 0) {
        return res.status(400).json({
            mensaje: "Propietario, subtotal, total y al menos un producto en el detalle son obligatorios"
        });
    }

    conexion.beginTransaction(function (err) {
        if (err) { return responderError(res, err, "Error al iniciar la facturación"); }

        const sqlFactura = `
            INSERT INTO facturas (id_propietario, fecha, subtotal, impuesto, total, estado) 
            VALUES (?, NOW(), ?, ?, ?, ?)
        `;
        
        conexion.query(
            sqlFactura, 
            [id_propietario, subtotal, impuesto || 0.00, total, estado || 'pendiente'], 
            function (errorFactura, resultadoFactura) {
                
                if (errorFactura) {
                    return conexion.rollback(function () {
                        responderError(res, errorFactura, "Error al crear el encabezado de la factura");
                    });
                }

                const idNuevaFactura = resultadoFactura.insertId;
                
                // Mapeamos los detalles calculando automáticamente el subtotal de cada ítem
                const sqlDetalle = "INSERT INTO detalle_factura (id_factura, descripcion, cantidad, precio_unitario, subtotal) VALUES ?";
                const valoresDetalle = detalles.map(d => [
                    idNuevaFactura, 
                    d.descripcion.trim(), 
                    d.cantidad, 
                    d.precio_unitario, 
                    (d.cantidad * d.precio_unitario)
                ]);

                conexion.query(sqlDetalle, [valoresDetalle], function (errorDetalle) {
                    if (errorDetalle) {
                        return conexion.rollback(function () {
                            responderError(res, errorDetalle, "Error al insertar los detalles de la factura");
                        });
                    }

                    conexion.commit(function (errCommit) {
                        if (errCommit) {
                            return conexion.rollback(function () {
                                responderError(res, errCommit, "Error al guardar la factura definitivamente");
                            });
                        }
                        res.status(201).json({
                            mensaje: "Factura y detalles guardados con éxito",
                            id_factura: idNuevaFactura
                        });
                    });
                });
            }
        );
    });
});

// CONSULTAR HISTORIAL DE FACTURAS
app.get("/api/facturas", function (req, res) {
    const sql = `
        SELECT f.id_factura, f.fecha, f.subtotal, f.impuesto, f.total, f.estado, p.nombre, p.apellido 
        FROM facturas f
        INNER JOIN propietarios p ON f.id_propietario = p.id_propietario
        ORDER BY f.fecha DESC
    `;

    conexion.query(sql, function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al consultar las facturas");
        }
        res.json(resultado);
    });
});

// CONSULTAR LOS DETALLES DE UNA FACTURA ESPECÍFICA
app.get("/api/facturas/:id/detalles", function (req, res) {
    const id = req.params.id;

    if (!esIdValido(id)) {
        return res.status(400).json({ mensaje: "ID de factura no válido" });
    }

    const sql = "SELECT id_detalle, descripcion, cantidad, precio_unitario, subtotal FROM detalle_factura WHERE id_factura = ?";

    conexion.query(sql, [id], function (error, resultado) {
        if (error) {
            return responderError(res, error, "Error al consultar los detalles de la factura");
        }
        res.json(resultado);
    });
});
