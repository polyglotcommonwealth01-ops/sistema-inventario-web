package com.sena.sistema_inventario;

import com.sena.sistema_inventario.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SistemaInventarioApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaInventarioApplication.class, args);
    }

    @Bean
    CommandLineRunner probarRepositorio(ProductoRepository repository) {
        return args -> {
            try {
                if (repository.count() == 0) {
                    repository.save(new com.sena.sistema_inventario.model.Producto("P001", "Teclado Mecánico RGB", "Logitech", "tecnologia", "Tecno SAS", 120000.0, 10, 5));
                    repository.save(new com.sena.sistema_inventario.model.Producto("P002", "Mouse Inalámbrico Pro", "Razer", "tecnologia", "Tecno SAS", 85000.0, 5, 8));
                    repository.save(new com.sena.sistema_inventario.model.Producto("P003", "Monitor 24 Pulgadas Full HD", "Samsung", "tecnologia", "Global Corp", 550000.0, 8, 3));
                    System.out.println("✅ Base de datos inicializada con productos por defecto.");
                }

                System.out.println("\n-------------------------------------------");
                System.out.println("📦 PRODUCTOS REGISTRADOS EN BASE DE DATOS:");
                System.out.println("-------------------------------------------");

                repository.findAll().forEach(producto -> {
                    System.out.println("ID: " + producto.getId() +
                                       " | Código: " + producto.getCodigo() +
                                       " | Nombre: " + producto.getNombre() +
                                       " | Marca: " + producto.getMarca() +
                                       " | Precio: $" + producto.getPrecio() +
                                       " | Stock: " + producto.getCantidad());
                });
            } catch (Exception e) {
                System.out.println("Nota: Inicialización de base de datos: " + e.getMessage());
            }

            System.out.println("-------------------------------------------\n");
        };
    }
}
