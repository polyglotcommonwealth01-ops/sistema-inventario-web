/**
 * PROYECTO INTEGRADOR GESTIÓN DE INVENTARIOS - SENA (ADSO)
 * Archivo: js/app.js
 * Descripción: Lógica de integración Frontend (JS) <-> Backend (Spring Boot + MySQL).
 * Utiliza fetch API para consumir el servicio REST en http://localhost:8080/api/productos
 */

const API_URL = (window.location.protocol.startsWith("http") && (window.location.port === "8080" || window.location.port === "8081"))
    ? "/productos"
    : "http://localhost:8080/productos";

// Productos iniciales de respaldo por si el servidor no está corriendo aún
const productosInicialesRespaldo = [
    {
        id: 1,
        codigo: "P001",
        nombre: "Teclado Mecánico RGB",
        categoria: "tecnologia",
        proveedor: "Tecno SAS",
        precio: 120000,
        cantidad: 10,
        stockMinimo: 5
    },
    {
        id: 2,
        codigo: "P002",
        nombre: "Mouse Inalámbrico Pro",
        categoria: "tecnologia",
        proveedor: "Tecno SAS",
        precio: 85000,
        cantidad: 5,
        stockMinimo: 8
    }
];

let listaProductosMemoria = [];
let codigoEditando = null;
let idEditando = null;

// Formateador de moneda en pesos colombianos
function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor || 0);
}

// 1. CARGAR PRODUCTOS DESDE EL BACKEND (GET /productos) - CLASE 18
async function cargarProductos() {
    console.log("Consultando API REST:", API_URL);
    try {
        const respuesta = await fetch(API_URL);
        console.log("Estado de la respuesta HTTP:", respuesta.status);
        if (respuesta.ok) {
            listaProductosMemoria = await respuesta.json();
            console.log("✅ PRODUCTOS RECIBIDOS desde MySQL/Spring Boot:", listaProductosMemoria);
        } else {
            throw new Error("Error en el servidor al consultar API");
        }
    } catch (error) {
        console.warn("⚠️ No se pudo conectar al Backend Spring Boot. Usando copia local en memoria/localStorage.", error);
        const guardados = localStorage.getItem("inventario_productos");
        listaProductosMemoria = guardados ? JSON.parse(guardados) : productosInicialesRespaldo;
    }

    renderizarInterfaz();
}

// Guardar copia local de seguridad
function guardarEnLocalStorage() {
    localStorage.setItem("inventario_productos", JSON.stringify(listaProductosMemoria));
}

// Renderizar tabla y métricas
function renderizarInterfaz() {
    mostrarProductosTabla();
    actualizarMetricasInicio();
}

// 2. RENDERIZAR TABLA DE PRODUCTOS (CLASE 18 + RETO COLUMNA ID)
function mostrarProductosTabla() {
    const tabla = document.getElementById("tablaProductos");
    const contenedorTotal = document.getElementById("totalInventarioGeneral");

    if (!tabla) return;

    tabla.innerHTML = "";

    if (listaProductosMemoria.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    No hay productos registrados en el inventario.
                </td>
            </tr>
        `;
        if (contenedorTotal) contenedorTotal.textContent = formatearMoneda(0);
        return;
    }

    listaProductosMemoria.forEach(function (producto) {
        const totalProducto = producto.precio * producto.cantidad;

        let estadoBadge = producto.cantidad > 0
            ? `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Disponible</span>`
            : `<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Agotado</span>`;

        let stockBadge = `<span class="badge bg-secondary">${producto.cantidad} u.</span>`;
        if (producto.cantidad === 0) {
            stockBadge = `<span class="badge bg-danger">0 u. (Agotado)</span>`;
        } else if (producto.cantidad <= (producto.stockMinimo || 5)) {
            stockBadge = `<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>${producto.cantidad} u. (Stock bajo)</span>`;
        }

        const categoriasMap = {
            tecnologia: "Tecnología",
            papeleria: "Papelería",
            accesorios: "Accesorios",
            insumos: "Insumos Médicos",
            otros: "Otros"
        };
        const nombreCategoria = categoriasMap[producto.categoria] || producto.categoria;

        const fila = `
            <tr>
                <td class="text-center"><span class="badge bg-secondary">${producto.id || '-'}</span></td>
                <td><span class="badge bg-dark">${producto.codigo}</span></td>
                <td class="fw-bold text-dark">${producto.nombre}</td>
                <td><span class="badge bg-info text-dark">${nombreCategoria}</span></td>
                <td>${producto.proveedor || 'Tecno SAS'}</td>
                <td class="text-end fw-semibold">${formatearMoneda(producto.precio)}</td>
                <td class="text-center">${stockBadge}</td>
                <td class="text-end fw-bold text-primary">${formatearMoneda(totalProducto)}</td>
                <td class="text-center">${estadoBadge}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-warning" onclick="editarProducto('${producto.codigo}')" title="Editar Producto">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="eliminarProducto(${producto.id || `'${producto.codigo}'`})" title="Eliminar Producto">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;

        tabla.innerHTML += fila;
    });

    if (contenedorTotal) {
        const valorTotalGeneral = listaProductosMemoria.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        contenedorTotal.textContent = formatearMoneda(valorTotalGeneral);
    }
}

// Mostrar alertas Bootstrap
function mostrarMensaje(mensaje, tipo = "success") {
    const contenedorMensaje = document.getElementById("mensaje");
    if (!contenedorMensaje) return;

    contenedorMensaje.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-${tipo === 'success' ? 'check-circle-fill' : tipo === 'danger' ? 'exclamation-octagon-fill' : 'info-circle-fill'} me-2"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alertEl = contenedorMensaje.querySelector('.alert');
        if (alertEl) {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 200);
        }
    }, 4000);
}

// 3. ENVIAR O ACTUALIZAR PRODUCTO (POST /api/productos)
async function procesarFormulario(event) {
    event.preventDefault();

    const codigoInput = document.getElementById("codigo");
    const nombreInput = document.getElementById("nombre");
    const categoriaInput = document.getElementById("categoria");
    const proveedorInput = document.getElementById("proveedor");
    const precioInput = document.getElementById("precio");
    const cantidadInput = document.getElementById("cantidad");
    const stockMinimoInput = document.getElementById("stockMinimo");

    const codigo = codigoInput.value.trim().toUpperCase();
    const nombre = nombreInput.value.trim();
    const categoria = categoriaInput.value;
    const proveedor = (proveedorInput && proveedorInput.value.trim()) || "Tecno SAS";
    const precio = Number(precioInput.value);
    const cantidad = Number(cantidadInput.value);
    const stockMinimo = (stockMinimoInput && Number(stockMinimoInput.value)) || 5;

    // Validaciones de formulario
    if (!codigo || !nombre) {
        mostrarMensaje("Debe ingresar un código y nombre válidos.", "warning");
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        mostrarMensaje("El precio debe ser mayor a cero.", "warning");
        return;
    }
    if (isNaN(cantidad) || cantidad < 0) {
        mostrarMensaje("La cantidad no puede ser negativa.", "warning");
        return;
    }

    const objetoProducto = {
        id: idEditando,
        codigo: codigo,
        nombre: nombre,
        categoria: categoria,
        proveedor: proveedor,
        precio: precio,
        cantidad: cantidad,
        stockMinimo: stockMinimo
    };

    try {
        const metodoHttp = idEditando ? "PUT" : "POST";
        const urlPeticion = idEditando ? `${API_URL}/${idEditando}` : API_URL;

        const respuesta = await fetch(urlPeticion, {
            method: metodoHttp,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objetoProducto)
        });

        if (respuesta.ok) {
            const productoGuardado = await respuesta.json();
            const esEdicion = !!idEditando;
            const mensajeExito = esEdicion
                ? "Producto modificado correctamente"
                : "Producto registrado correctamente";

            alert(mensajeExito);
            mostrarMensaje(`¡Producto "${productoGuardado.nombre}" ${esEdicion ? "actualizado" : "guardado"} con éxito en MySQL!`, "success");
            resetearFormulario();
            await cargarProductos();

            // Si se registró desde registrar.html, redirigir a productos.html (Clase 19 pág. 206)
            if (window.location.pathname.endsWith("registrar.html") && !esEdicion) {
                window.location.href = "productos.html";
            }
        } else {
            const mensajeError = idEditando
                ? "No fue posible modificar el producto"
                : "No fue posible registrar el producto";
            alert(mensajeError);
            const errorMsg = await respuesta.text();
            throw new Error(errorMsg || mensajeError);
        }
    } catch (error) {
        console.error("❌ Error conectando con el backend:", error);
        mostrarMensaje(`<strong>¡No se pudo guardar en la base de datos!</strong><br>El servidor Backend (Spring Boot en el puerto 8080) no está corriendo o no responde.<br><small class="text-muted">Inicia tu proyecto en NetBeans o ejecuta Spring Boot para que se guarde en MySQL / phpMyAdmin.</small>`, "danger");
    }
}

// Cargar producto al formulario para edición (CLASE 20 - PUT)
function editarProducto(codigoOrId) {
    const producto = listaProductosMemoria.find(p => p.codigo === codigoOrId || p.id == codigoOrId);
    if (!producto) return;

    const form = document.getElementById("formProducto");
    if (!form) {
        window.location.href = `registrar.html?id=${producto.id}`;
        return;
    }

    codigoEditando = producto.codigo;
    idEditando = producto.id || null;

    document.getElementById("codigo").value = producto.codigo;
    document.getElementById("codigo").setAttribute("readonly", "true");
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("categoria").value = producto.categoria;
    if (document.getElementById("proveedor")) document.getElementById("proveedor").value = producto.proveedor || "";
    document.getElementById("precio").value = producto.precio;
    document.getElementById("cantidad").value = producto.cantidad;
    if (document.getElementById("stockMinimo")) document.getElementById("stockMinimo").value = producto.stockMinimo || 5;

    const btnSubmit = form.querySelector("button[type='submit']");
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i>Actualizar Producto`;
        btnSubmit.className = "btn btn-warning px-4 text-dark fw-bold";
    }

    form.scrollIntoView({ behavior: "smooth" });
    mostrarMensaje(`Editando producto: <strong>${producto.nombre}</strong> (ID: ${producto.id || '-'}, Código: ${producto.codigo})`, "info");
}

// 4. ELIMINAR PRODUCTO (CLASE 21 - DELETE /productos/{id})
async function eliminarProducto(idOrCodigo) {
    const confirmar = confirm("¿Está seguro de eliminar este producto?");
    if (!confirmar) return;

    const producto = listaProductosMemoria.find(p => p.id == idOrCodigo || p.codigo === idOrCodigo);
    const id = (producto && producto.id) ? producto.id : idOrCodigo;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            alert("Producto eliminado correctamente");
            mostrarMensaje("Producto eliminado correctamente", "danger");
            await cargarProductos();
        } else {
            alert("No fue posible eliminar el producto");
        }
    } catch (error) {
        console.warn("Error eliminando en el backend:", error);
        alert("No fue posible eliminar el producto");
    }
}

// Resetear formulario
function resetearFormulario() {
    codigoEditando = null;
    idEditando = null;
    const codigoInput = document.getElementById("codigo");
    if (codigoInput) codigoInput.removeAttribute("readonly");

    const form = document.getElementById("formProducto");
    if (form) form.reset();

    const btnSubmit = document.querySelector("#formProducto button[type='submit']");
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-save me-1"></i>Guardar Producto`;
        btnSubmit.className = "btn btn-primary px-4";
    }
}

// Actualizar métricas del inicio
function actualizarMetricasInicio() {
    const totalProductosEl = document.getElementById("totalProductosCount");
    const disponiblesEl = document.getElementById("disponiblesCount");
    const agotadosEl = document.getElementById("agotadosCount");

    if (!totalProductosEl && !disponiblesEl && !agotadosEl) return;

    const totalCount = listaProductosMemoria.length;
    const disponiblesCount = listaProductosMemoria.filter(p => p.cantidad > 0).length;
    const agotadosCount = listaProductosMemoria.filter(p => p.cantidad <= 5).length;

    if (totalProductosEl) totalProductosEl.textContent = totalCount;
    if (disponiblesEl) disponiblesEl.textContent = disponiblesCount;
    if (agotadosEl) agotadosEl.textContent = agotadosCount;

    const contenedorUltimos = document.getElementById("contenedorUltimosProductos");
    if (contenedorUltimos) {
        contenedorUltimos.innerHTML = "";
        const ultimos = listaProductosMemoria.slice(-3).reverse();

        ultimos.forEach(p => {
            const card = `
                <div class="col-12 col-md-4">
                    <div class="card h-100 border-1 border-light shadow-sm">
                        <div class="card-body">
                            <span class="badge bg-primary mb-2">${p.categoria}</span>
                            <h4 class="card-title h5 text-dark">${p.nombre}</h4>
                            <p class="card-text text-muted mb-1"><strong>Código:</strong> ${p.codigo}</p>
                            <p class="card-text text-muted mb-1"><strong>Precio:</strong> ${formatearMoneda(p.precio)}</p>
                            <p class="card-text text-muted mb-0"><strong>Stock:</strong> ${p.cantidad} unidades</p>
                        </div>
                    </div>
                </div>
            `;
            contenedorUltimos.innerHTML += card;
        });
    }
}

// Evento al cargar la página
document.addEventListener("DOMContentLoaded", async function () {
    const formProducto = document.getElementById("formProducto");
    if (formProducto) {
        formProducto.addEventListener("submit", procesarFormulario);
        formProducto.addEventListener("reset", resetearFormulario);
    }

    await cargarProductos();

    // Soporte para editar desde registrar.html pasando ?id=... o ?codigo=...
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get("id");
    const paramCodigo = urlParams.get("codigo");
    if (paramId || paramCodigo) {
        editarProducto(paramId || paramCodigo);
    }
});
