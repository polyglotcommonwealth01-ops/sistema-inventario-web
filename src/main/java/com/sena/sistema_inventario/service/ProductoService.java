package com.sena.sistema_inventario.service;

import com.sena.sistema_inventario.model.Producto;
import com.sena.sistema_inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public List<Producto> listarProductos() {
        return repository.findAll();
    }

    public Producto guardarProducto(Producto producto) {
        return repository.save(producto);
    }

    public Optional<Producto> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void eliminarProducto(Long id) {
        repository.deleteById(id);
    }

    public Producto actualizarProducto(Long id, Producto producto) {
        return repository.findById(id).map(p -> {
            p.setCodigo(producto.getCodigo());
            p.setNombre(producto.getNombre());
            p.setMarca(producto.getMarca());
            p.setCategoria(producto.getCategoria());
            p.setProveedor(producto.getProveedor());
            p.setPrecio(producto.getPrecio());
            p.setCantidad(producto.getCantidad());
            p.setStockMinimo(producto.getStockMinimo());
            return repository.save(p);
        }).orElse(null);
    }

    // Actividad 8: Implementar búsqueda de productos por nombre
    public List<Producto> buscarPorNombre(String nombre) {
        return repository.findByNombreContainingIgnoreCase(nombre);
    }

    // Métodos alias para coincidir exactamente con la nomenclatura de las clases 19 y 20 de la guía SENA
    public Producto registrarProducto(Producto producto) {
        return guardarProducto(producto);
    }

    public Producto modificarProducto(Long id, Producto producto) {
        return actualizarProducto(id, producto);
    }
}
