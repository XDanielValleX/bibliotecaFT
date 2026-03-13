-- 1. Creamos la base de datos y la usamos
CREATE DATABASE IF NOT EXISTS biblioteca_online;
USE biblioteca_online;

-- 2. Tabla de Usuarios
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ESTUDIANTE', 'DOCENTE', 'ADMINISTRADOR') NOT NULL DEFAULT 'ESTUDIANTE',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Libros
CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    editorial VARCHAR(100),
    stock_total INT NOT NULL,      -- Cuántos libros físicos tiene la biblioteca en total
    stock_disponible INT NOT NULL  -- Cuántos quedan para prestar/reservar en este momento
);

-- 4. Tabla de Préstamos y Reservas (Historial)
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATETIME NOT NULL, -- Fecha en la que debe devolver el libro
    fecha_devolucion DATETIME NULL, -- Se llena cuando el usuario entrega el libro
    estado ENUM('RESERVADA', 'ACTIVO', 'DEVUELTO', 'CANCELADO') NOT NULL DEFAULT 'RESERVADA',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_libro) REFERENCES libros(id_libro)
);

-- 5. (Opcional pero recomendado) Insertamos unos datos de prueba para empezar
INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES 
('Juan Perez', 'juan@estudiante.com', '123456', 'ESTUDIANTE'),
('Admin Pro', 'admin@biblioteca.com', 'admin123', 'ADMINISTRADOR');

INSERT INTO libros (titulo, autor, editorial, stock_total, stock_disponible) VALUES 
('Cien Años de Soledad', 'Gabriel García Márquez', 'Sudamericana', 10, 10),
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 5, 5),
('El Señor de los Anillos', 'J.R.R. Tolkien', 'Minotauro', 3, 3);