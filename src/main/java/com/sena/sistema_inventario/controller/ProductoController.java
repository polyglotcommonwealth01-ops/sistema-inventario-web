package com.sena.sistema_inventario.controller;

import com.sena.sistema_inventario.model.Producto;
import com.sena.sistema_inventario.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    // CLASE 13: GET /productos (y soporte para /api/productos)
    @GetMapping({"/productos", "/api/productos"})
    public List<Producto> listarProductos() {
        return service.listarProductos();
    }

    // CLASE 13 (Paso 18): Segundo endpoint didáctico
    @GetMapping("/categorias")
    public List<String> listarCategorias() {
        return List.of("Tecnología", "Papelería", "Accesorios", "Otros");
    }

    // CLASE 13 (Paso 20): Reto para el aprendiz
    @GetMapping("/proveedores")
    public List<String> listarProveedores() {
        return List.of("Tecno SAS", "PrintCorp", "DataStore");
    }

    // Endpoints complementarios para CRUD posterior (Clases 14 y 15)
    @GetMapping({"/productos/{id}", "/api/productos/{id}"})
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Actividad 8: Búsqueda de productos por nombre (GET /productos/buscar/{nombre})
    @GetMapping({"/productos/buscar/{nombre}", "/api/productos/buscar/{nombre}"})
    public List<Producto> buscarPorNombre(@PathVariable String nombre) {
        return service.buscarPorNombre(nombre);
    }

    // CLASE 19 - REGISTRAR PRODUCTOS (POST)
    @PostMapping({"/productos", "/api/productos"})
    public Producto registrarProducto(@RequestBody Producto producto) {
        return service.registrarProducto(producto);
    }

    // CLASE 20 - MODIFICAR PRODUCTOS (PUT)
    @PutMapping({"/productos/{id}", "/api/productos/{id}"})
    public ResponseEntity<Producto> modificarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        Producto actualizado = service.modificarProducto(id, producto);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }

    // CLASE 21 - ELIMINAR PRODUCTOS (DELETE)
    @DeleteMapping({"/productos/{id}", "/api/productos/{id}"})
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        service.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}
