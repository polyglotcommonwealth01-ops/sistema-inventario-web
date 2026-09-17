-- =========================================================
-- TALLER EVALUATIVO - SISTEMA DE INVENTARIO WEB (SENA)
-- PARTE 2. MODIFICACIÓN DE LA BASE DE DATOS
-- Actividad 4: Modificar tabla producto para incluir columna marca
-- =========================================================

-- Seleccionar la base de datos del proyecto
USE sistema_inventario;

-- 1. Sentencia DDL para agregar la columna marca a la tabla producto
ALTER TABLE producto 
ADD COLUMN marca VARCHAR(100) AFTER nombre;

-- 2. Actualizar registros existentes con marcas de ejemplo
UPDATE producto SET marca = 'Redragon' WHERE codigo = 'P001';
UPDATE producto SET marca = 'Logitech' WHERE codigo = 'P002';
UPDATE producto SET marca = 'Samsung' WHERE codigo = 'P003';

-- 3. Comprobar la nueva estructura de la tabla
DESCRIBE producto;

-- 4. Consulta de verificación (SELECT)
SELECT id, codigo, nombre, marca, categoria, proveedor, precio, cantidad, stock_minimo 
FROM producto;
