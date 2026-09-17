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
            System.out.println("\n-------------------------------------------");
            System.out.println("📦 PRODUCTOS REGISTRADOS EN BASE DE DATOS:");
            System.out.println("-------------------------------------------");

            try {
                repository.findAll().forEach(producto -> {
                    System.out.println("ID: " + producto.getId() +
                                       " | Código: " + producto.getCodigo() +
                                       " | Nombre: " + producto.getNombre() +
                                       " | Precio: $" + producto.getPrecio() +
                                       " | Stock: " + producto.getCantidad());
                });
            } catch (Exception e) {
                System.out.println("Nota: Conexión lista. Ejecuta los scripts SQL para visualizar datos de la tabla.");
            }

            System.out.println("-------------------------------------------\n");
        };
    }
}
