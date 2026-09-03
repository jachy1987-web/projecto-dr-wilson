CREATE DATABASE doctor_wilson;
USE doctor_wilson;
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150)
    
);
SHOW TABLES;
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
    );
    SHOW TABLES;
    
    CREATE TABLE propietarios (
    id_propietario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    direccion VARCHAR(150)
);
SHOW TABLES;

CREATE TABLE especies (
id_especie INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);
SHOW TABLES;
DESCRIBE roles;
DESCRIBE usuarios;
DESCRIBE propietarios;
DESCRIBE especies;

CREATE TABLE razas (
    id_raza INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    id_especie INT NOT NULL,
    CONSTRAINT fk_raza_especie
        FOREIGN KEY (id_especie)
        REFERENCES especies(id_especie)
);

CREATE TABLE mascotas (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL, 
    sexo ENUM('Macho','Hembra') NOT NULL, 
    fecha_nacimiento DATE, 
    color VARCHAR(50), 
    id_especie INT NOT NULL, 
    id_raza INT, 
    id_propietario INT NOT NULL, 
    CONSTRAINT fk_mascota_especie 
        FOREIGN KEY (id_especie) 
        REFERENCES especies(id_especie), 
    CONSTRAINT fk_mascota_raza 
        FOREIGN KEY (id_raza) 
        REFERENCES razas(id_raza), 
    CONSTRAINT fk_mascota_propietario 
        FOREIGN KEY (id_propietario) 
        REFERENCES propietarios(id_propietario) 
);

CREATE TABLE historias_clinicas ( 
    id_historia INT AUTO_INCREMENT PRIMARY KEY, 
    fecha DATETIME NOT NULL, 
    motivo_consulta VARCHAR(200) NOT NULL, 
    diagnostico TEXT, 
    tratamiento TEXT, 
    observaciones TEXT, 
    id_mascota INT NOT NULL, 
    id_usuario INT NOT NULL, 
    CONSTRAINT fk_historia_mascota 
        FOREIGN KEY (id_mascota) 
        REFERENCES mascotas(id_mascota), 
    CONSTRAINT fk_historia_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) 
);

CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY, 
    fecha_hora DATETIME NOT NULL, 
    motivo VARCHAR(200) NOT NULL, 
    estado ENUM('Programada','Atendida','Cancelada') 
        NOT NULL DEFAULT 'Programada', 
    observaciones VARCHAR(250), 
    id_mascota INT NOT NULL, 
    id_usuario INT NOT NULL, 
    CONSTRAINT fk_cita_mascota 
        FOREIGN KEY (id_mascota) 
        REFERENCES mascotas(id_mascota), 
    CONSTRAINT fk_cita_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) 
);
CREATE TABLE vacunas (
id_vacuna INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
descripcion VARCHAR(255),
dosis VARCHAR(50),
fabricante VARCHAR(100)
);
CREATE TABLE vacunaciones (
id_vacunacion INT AUTO_INCREMENT PRIMARY KEY,
id_mascota INT NOT NULL,
id_vacuna INT NOT NULL,
fecha_aplicacion DATE NOT NULL,
proxima_dosis DATE,
observaciones TEXT,
 CONSTRAINT fk_vacunaciones_mascota
 FOREIGN KEY (id_mascota)
 REFERENCES mascotas(id_mascota),
 CONSTRAINT fk_vacunaciones_vacuna
 FOREIGN KEY (id_vacuna)
 REFERENCES vacunas(id_vacuna)
 );
 CREATE TABLE facturas (
 id_factura INT AUTO_INCREMENT PRIMARY KEY,
 id_propietario INT NOT NULL,
 fecha DATE NOT NULL,
 subtotal DECIMAL(10,2) NOT NULL,
 impuesto DECIMAL(10,2) DEFAULT 0.00,
 total DECIMAL(10,2) NOT NULL,
 estado VARCHAR(20) DEFAULT 'pendiente',
 CONSTRAINT fk_facturas_propietario
 FOREIGN KEY (id_propietario)
 REFERENCES propietarios(id_propietario)
 );
 CREATE TABLE detalle_factura (
 id_detalle INT AUTO_INCREMENT PRIMARY KEY,
 id_factura INT NOT NULL,
 descripcion VARCHAR(150) NOT NULL,
 cantidad INT NOT NULL,
 precio_unitario DECIMAL(10,2) NOT NULL,
 subtotal DECIMAL(10,2) NOT NULL,
 CONSTRAINT fk_detalle_factura
 FOREIGN KEY (id_factura)
 REFERENCES facturas(id_factura)
 );
