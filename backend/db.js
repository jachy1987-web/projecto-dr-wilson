/**
 * @file Conexión a MySQL.
 */
require("dotenv").config();

const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "doctor_wilson"
});

conexion.connect((error) => {

    if (error) {
        console.error("Error al conectar con MySQL:", error);
        return;
    }

    console.log("Conexión exitosa con la base de datos Doctor Wilson");
});

module.exports = conexion;