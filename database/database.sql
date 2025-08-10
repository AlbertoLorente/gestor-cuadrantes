-- Crear la base de datos
CREATE DATABASE gestor_cuadrantes;
USE gestor_cuadrantes;

-- Crear la tabla de usuarios
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY, -- Clave primaria
    nombre VARCHAR(100) NOT NULL, -- Nombre del usuario
    email VARCHAR(100) NOT NULL UNIQUE, -- Email único
    password VARCHAR(255) NOT NULL, -- Contraseña cifrada
    rol ENUM('administrador', 'vigilante') NOT NULL -- Rol del usuario
);

-- Crear la tabla de cuadrantes
CREATE TABLE Cuadrantes (
    id_cuadrante INT AUTO_INCREMENT PRIMARY KEY, -- Clave primaria
    id_vigilante INT NOT NULL, -- Clave foránea a Usuarios
    fecha DATE NOT NULL, -- Fecha del turno
    hora_inicio TIME NOT NULL, -- Hora de inicio del turno
    hora_fin TIME NOT NULL, -- Hora de fin del turno
    area_vigilancia VARCHAR(255) NOT NULL, -- Área asignada
    FOREIGN KEY (id_vigilante) REFERENCES Usuarios(id_usuario) -- Relación con Usuarios
);

-- Crear la tabla de incidencias
CREATE TABLE Incidencias (
    id_incidencia INT AUTO_INCREMENT PRIMARY KEY, -- Clave primaria
    id_vigilante INT NOT NULL, -- Clave foránea a Usuarios
    fecha DATE NOT NULL, -- Fecha de la incidencia
    hora TIME NOT NULL, -- Hora de la incidencia
    descripcion TEXT NOT NULL, -- Descripción de la incidencia
    estado ENUM('pendiente', 'resuelta') NOT NULL, -- Estado de la incidencia
    FOREIGN KEY (id_vigilante) REFERENCES Usuarios(id_usuario) -- Relación con Usuarios
);

-- Verificar la estructura de las tablas
SHOW TABLES;

-- Consultar las columnas de cada tabla
DESCRIBE Usuarios;
DESCRIBE Cuadrantes;
DESCRIBE Incidencias;
