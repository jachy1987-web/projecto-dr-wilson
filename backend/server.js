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

app.get("/api/propietarios", function(req, res) {

    const sql = "SELECT * FROM propietarios";

    conexion.query(sql, function(error, resultados) {

        if (error) {
            console.error(error);

            res.status(500).json({
                mensaje: "Error al consultar los propietarios"
            });

            return;
        }

        res.json(resultados);
    });
});

app.listen(PORT, function() {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});