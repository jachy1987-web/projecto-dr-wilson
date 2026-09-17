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



// ======================================================
// CRUD DE CITAS
// ======================================================

// INSERTAR CITA
app.post("/api/citas", function(req, res) {

    const {
        fecha_hora,
        motivo,
        estado,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    const sql = `
        INSERT INTO citas
        (fecha_hora, motivo, estado, observaciones, id_mascota, id_usuario)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha_hora,
            motivo,
            estado || "Programada",
            observaciones || null,
            id_mascota,
            id_usuario
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al registrar cita:", error);

                res.status(500).json({
                    mensaje: "Error al registrar la cita",
                    error: error.message
                });

                return;
            }

            res.status(201).json({
                mensaje: "Cita registrada correctamente",
                id_cita: resultado.insertId
            });
        }
    );
});


// CONSULTAR CITAS
app.get("/api/citas", function(req, res) {

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

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error("Error al consultar citas:", error);

            res.status(500).json({
                mensaje: "Error al consultar las citas",
                error: error.message
            });

            return;
        }

        res.json(resultado);
    });
});


// CONSULTAR UNA CITA
app.get("/api/citas/:id", function(req, res) {

    const id = req.params.id;

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

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al consultar la cita:", error);

            res.status(500).json({
                mensaje: "Error al consultar la cita",
                error: error.message
            });

            return;
        }

        if (resultado.length === 0) {
            res.status(404).json({
                mensaje: "Cita no encontrada"
            });

            return;
        }

        res.json(resultado[0]);
    });
});


// ACTUALIZAR CITA
app.put("/api/citas/:id", function(req, res) {

    const id = req.params.id;

    const {
        fecha_hora,
        motivo,
        estado,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

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
            motivo,
            estado,
            observaciones || null,
            id_mascota,
            id_usuario,
            id
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al actualizar cita:", error);

                res.status(500).json({
                    mensaje: "Error al actualizar la cita",
                    error: error.message
                });

                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).json({
                    mensaje: "Cita no encontrada"
                });

                return;
            }

            res.json({
                mensaje: "Cita actualizada correctamente"
            });
        }
    );
});


// ELIMINAR CITA
app.delete("/api/citas/:id", function(req, res) {

    const id = req.params.id;

    const sql = `
        DELETE FROM citas
        WHERE id_cita = ?
    `;

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al eliminar cita:", error);

            res.status(500).json({
                mensaje: "Error al eliminar la cita",
                error: error.message
            });

            return;
        }

        if (resultado.affectedRows === 0) {
            res.status(404).json({
                mensaje: "Cita no encontrada"
            });

            return;
        }

        res.json({
            mensaje: "Cita eliminada correctamente"
        });
    });
});



// ======================================================
// CRUD DE HISTORIAS CLÍNICAS
// ======================================================

// INSERTAR HISTORIA CLÍNICA
app.post("/api/historias-clinicas", function(req, res) {

    const {
        fecha,
        motivo_consulta,
        diagnostico,
        tratamiento,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    const sql = `
        INSERT INTO historias_clinicas
        (
            fecha,
            motivo_consulta,
            diagnostico,
            tratamiento,
            observaciones,
            id_mascota,
            id_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha,
            motivo_consulta,
            diagnostico || null,
            tratamiento || null,
            observaciones || null,
            id_mascota,
            id_usuario
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al registrar historia clínica:", error);

                res.status(500).json({
                    mensaje: "Error al registrar la historia clínica",
                    error: error.message
                });

                return;
            }

            res.status(201).json({
                mensaje: "Historia clínica registrada correctamente",
                id_historia: resultado.insertId
            });
        }
    );
});


// CONSULTAR HISTORIAS CLÍNICAS
app.get("/api/historias-clinicas", function(req, res) {

    const sql = `
        SELECT
            h.id_historia,
            h.fecha,
            h.motivo_consulta,
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

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error("Error al consultar historias clínicas:", error);

            res.status(500).json({
                mensaje: "Error al consultar las historias clínicas",
                error: error.message
            });

            return;
        }

        res.json(resultado);
    });
});


// CONSULTAR UNA HISTORIA CLÍNICA
app.get("/api/historias-clinicas/:id", function(req, res) {

    const id = req.params.id;

    const sql = `
        SELECT
            h.id_historia,
            h.fecha,
            h.motivo_consulta,
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

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al consultar historia clínica:", error);

            res.status(500).json({
                mensaje: "Error al consultar la historia clínica",
                error: error.message
            });

            return;
        }

        if (resultado.length === 0) {
            res.status(404).json({
                mensaje: "Historia clínica no encontrada"
            });

            return;
        }

        res.json(resultado[0]);
    });
});


// ACTUALIZAR HISTORIA CLÍNICA
app.put("/api/historias-clinicas/:id", function(req, res) {

    const id = req.params.id;

    const {
        fecha,
        motivo_consulta,
        diagnostico,
        tratamiento,
        observaciones,
        id_mascota,
        id_usuario
    } = req.body;

    const sql = `
        UPDATE historias_clinicas
        SET
            fecha = ?,
            motivo_consulta = ?,
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
            motivo_consulta,
            diagnostico || null,
            tratamiento || null,
            observaciones || null,
            id_mascota,
            id_usuario,
            id
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al actualizar historia clínica:", error);

                res.status(500).json({
                    mensaje: "Error al actualizar la historia clínica",
                    error: error.message
                });

                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).json({
                    mensaje: "Historia clínica no encontrada"
                });

                return;
            }

            res.json({
                mensaje: "Historia clínica actualizada correctamente"
            });
        }
    );
});


// ELIMINAR HISTORIA CLÍNICA
app.delete("/api/historias-clinicas/:id", function(req, res) {

    const id = req.params.id;

    const sql = `
        DELETE FROM historias_clinicas
        WHERE id_historia = ?
    `;

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al eliminar historia clínica:", error);

            res.status(500).json({
                mensaje: "Error al eliminar la historia clínica",
                error: error.message
            });

            return;
        }

        if (resultado.affectedRows === 0) {
            res.status(404).json({
                mensaje: "Historia clínica no encontrada"
            });

            return;
        }

        res.json({
            mensaje: "Historia clínica eliminada correctamente"
        });
    });
});



// ======================================================
// CRUD DE VACUNAS
// ======================================================

// INSERTAR VACUNA
app.post("/api/vacunas", function(req, res) {

    const {
        nombre,
        descripcion,
        dosis,
        fabricante
    } = req.body;

    const sql = `
        INSERT INTO vacunas
        (nombre, descripcion, dosis, fabricante)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            descripcion || null,
            dosis || null,
            fabricante || null
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al registrar vacuna:", error);

                res.status(500).json({
                    mensaje: "Error al registrar la vacuna",
                    error: error.message
                });

                return;
            }

            res.status(201).json({
                mensaje: "Vacuna registrada correctamente",
                id_vacuna: resultado.insertId
            });
        }
    );
});


// CONSULTAR VACUNAS
app.get("/api/vacunas", function(req, res) {

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

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error("Error al consultar vacunas:", error);

            res.status(500).json({
                mensaje: "Error al consultar las vacunas",
                error: error.message
            });

            return;
        }

        res.json(resultado);
    });
});


// CONSULTAR UNA VACUNA
app.get("/api/vacunas/:id", function(req, res) {

    const id = req.params.id;

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

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al consultar vacuna:", error);

            res.status(500).json({
                mensaje: "Error al consultar la vacuna",
                error: error.message
            });

            return;
        }

        if (resultado.length === 0) {
            res.status(404).json({
                mensaje: "Vacuna no encontrada"
            });

            return;
        }

        res.json(resultado[0]);
    });
});


// ACTUALIZAR VACUNA
app.put("/api/vacunas/:id", function(req, res) {

    const id = req.params.id;

    const {
        nombre,
        descripcion,
        dosis,
        fabricante
    } = req.body;

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
            nombre,
            descripcion || null,
            dosis || null,
            fabricante || null,
            id
        ],
        function(error, resultado) {

            if (error) {
                console.error("Error al actualizar vacuna:", error);

                res.status(500).json({
                    mensaje: "Error al actualizar la vacuna",
                    error: error.message
                });

                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).json({
                    mensaje: "Vacuna no encontrada"
                });

                return;
            }

            res.json({
                mensaje: "Vacuna actualizada correctamente"
            });
        }
    );
});


// ELIMINAR VACUNA
app.delete("/api/vacunas/:id", function(req, res) {

    const id = req.params.id;

    const sql = `
        DELETE FROM vacunas
        WHERE id_vacuna = ?
    `;

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al eliminar vacuna:", error);

            res.status(500).json({
                mensaje: "Error al eliminar la vacuna",
                error: error.message
            });

            return;
        }

        if (resultado.affectedRows === 0) {
            res.status(404).json({
                mensaje: "Vacuna no encontrada"
            });

            return;
        }

        res.json({
            mensaje: "Vacuna eliminada correctamente"
        });
    });
});



// ======================================================
// CRUD DE VACUNACIONES
// ======================================================

// INSERTAR VACUNACIÓN
app.post("/api/vacunaciones", function(req, res) {

    const {
        id_mascota,
        id_vacuna,
        fecha_aplicacion,
        proxima_dosis,
        observaciones
    } = req.body;

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
        function(error, resultado) {

            if (error) {
                console.error("Error al registrar vacunación:", error);

                res.status(500).json({
                    mensaje: "Error al registrar la vacunación",
                    error: error.message
                });

                return;
            }

            res.status(201).json({
                mensaje: "Vacunación registrada correctamente",
                id_vacunacion: resultado.insertId
            });
        }
    );
});


// CONSULTAR VACUNACIONES
app.get("/api/vacunaciones", function(req, res) {

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

    conexion.query(sql, function(error, resultado) {

        if (error) {
            console.error("Error al consultar vacunaciones:", error);

            res.status(500).json({
                mensaje: "Error al consultar las vacunaciones",
                error: error.message
            });

            return;
        }

        res.json(resultado);
    });
});


// CONSULTAR UNA VACUNACIÓN
app.get("/api/vacunaciones/:id", function(req, res) {

    const id = req.params.id;

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

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al consultar vacunación:", error);

            res.status(500).json({
                mensaje: "Error al consultar la vacunación",
                error: error.message
            });

            return;
        }

        if (resultado.length === 0) {
            res.status(404).json({
                mensaje: "Vacunación no encontrada"
            });

            return;
        }

        res.json(resultado[0]);
    });
});


// ACTUALIZAR VACUNACIÓN
app.put("/api/vacunaciones/:id", function(req, res) {

    const id = req.params.id;

    const {
        id_mascota,
        id_vacuna,
        fecha_aplicacion,
        proxima_dosis,
        observaciones
    } = req.body;

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
        function(error, resultado) {

            if (error) {
                console.error("Error al actualizar vacunación:", error);

                res.status(500).json({
                    mensaje: "Error al actualizar la vacunación",
                    error: error.message
                });

                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).json({
                    mensaje: "Vacunación no encontrada"
                });

                return;
            }

            res.json({
                mensaje: "Vacunación actualizada correctamente"
            });
        }
    );
});


// ELIMINAR VACUNACIÓN
app.delete("/api/vacunaciones/:id", function(req, res) {

    const id = req.params.id;

    const sql = `
        DELETE FROM vacunaciones
        WHERE id_vacunacion = ?
    `;

    conexion.query(sql, [id], function(error, resultado) {

        if (error) {
            console.error("Error al eliminar vacunación:", error);

            res.status(500).json({
                mensaje: "Error al eliminar la vacunación",
                error: error.message
            });

            return;
        }

        if (resultado.affectedRows === 0) {
            res.status(404).json({
                mensaje: "Vacunación no encontrada"
            });

            return;
        }

        res.json({
            mensaje: "Vacunación eliminada correctamente"
        });
    });
});

app.listen(PORT, function() {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


