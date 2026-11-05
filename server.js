const express = require("express");
const conexion = require("./backend/db");
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

    const limite = Number(req.query.limite) || 50;

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
        LIMIT ?
    `;

    conexion.query(sql, [limite], function (error, resultado) {

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

// CONSULTAR USUARIOS
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

// ======================================================
// ESPECIES
// ======================================================

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

// ======================================================
// RAZAS
// ======================================================

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

// ======================================================
// MASCOTAS
// ======================================================

// CREAR MASCOTA
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

// BUSCAR MASCOTAS POR NOMBRE (Debe ir antes de la ruta general)
app.get("/api/mascotas/buscar", function (req, res) {

    const termino = req.query.termino || "";

    const sql = `
        SELECT
            m.id_mascota,
            m.nombre,
            m.sexo,
            m.fecha_nacimiento,
            m.color,
            e.nombre AS especie,
            r.nombre AS raza,
            CONCAT(p.nombre, ' ', p.apellido) AS propietario
        FROM mascotas m
        INNER JOIN especies e ON m.id_especie = e.id_especie
        LEFT JOIN razas r ON m.id_raza = r.id_raza
        INNER JOIN propietarios p ON m.id_propietario = p.id_propietario
        WHERE m.nombre LIKE ?
        ORDER BY m.nombre ASC
    `;

    conexion.query(sql, [`%${termino}%`], function (error, resultado) {

        if (error) {
            return responderError(
                res,
                error,
                "Error al buscar las mascotas"
            );
        }

        res.json(resultado);
    });
});

// CONSULTAR MASCOTAS (con paginación y filtro por propietario)
app.get("/api/mascotas", function (req, res) {

    const limite = Number(req.query.limite) || 50;
    const id_propietario = req.query.id_propietario;

    let sql = `
        SELECT
            m.id_mascota,
            m.nombre,
            m.sexo,
            m.fecha_nacimiento,
            m.color,
            e.nombre AS especie,
            r.nombre AS raza,
            CONCAT(p.nombre, ' ', p.apellido) AS propietario
        FROM mascotas m
        INNER JOIN especies e ON m.id_especie = e.id_especie
        LEFT JOIN razas r ON m.id_raza = r.id_raza
        INNER JOIN propietarios p ON m.id_propietario = p.id_propietario
    `;

    let parametros = [];

    if (id_propietario) {
        sql += ` WHERE m.id_propietario = ?`;
        parametros.push(id_propietario);
    }

    sql += ` ORDER BY m.nombre ASC LIMIT ?`;
    parametros.push(limite);

    conexion.query(sql, parametros, function (error, resultado) {

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

//=======================================================
// VACUNAS
//=======================================================

// CONSULTAR
// ======================================================
// VACUNAS  (Johnny)
// ======================================================

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
        (nombre, descripcion, dosis, fabricante)
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
                    mensaje: "No se puede eliminar la vacuna porque tiene aplicaciones registradas"
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

                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        mensaje: "La mascota o la vacuna no existen"
                    });
                }

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
});


// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

app.listen(PORT, function () {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});