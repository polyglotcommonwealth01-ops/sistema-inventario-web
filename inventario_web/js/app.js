/**
 * PROYECTO INTEGRADOR GESTIÓN DE INVENTARIOS - SENA (ADSO)
 * Archivo: js/app.js
 * Descripción: Lógica de integración Frontend (JavaScript) <-> Backend (Spring Boot + JPA + MySQL).
 * Implementa consumo de API REST (GET, POST, PUT, DELETE, GET por búsqueda)
 * y funcionalidades avanzadas del Taller Evaluativo SENA:
 * - Atributo 'marca' en formulario y tabla de catálogo.
 * - Búsqueda en tiempo real por nombre (/productos/buscar/{nombre}).
 * - Opción A: Total de productos en inicio.
 * - Opción B: Valor total del inventario (sumatoria de precio * cantidad).
 * - Opción C: Confirmación explícita antes de eliminar.
 * - Opción D: Validaciones de campos obligatorios y valores no negativos.
 */

const API_URL = (window.location.protocol.startsWith("http") && (window.location.port === "8080" || window.location.port === "8081"))
    ? "/productos"
    : "http://localhost:8080/productos";

// Datos de demostración y respaldo por si el backend aún no ha sido iniciado
const productosInicialesRespaldo = [
    {
        id: 1,
        codigo: "P001",
        nombre: "Teclado Mecánico RGB",
        marca: "Logitech",
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
        marca: "Razer",
        categoria: "tecnologia",
        proveedor: "Tecno SAS",
        precio: 85000,
        cantidad: 5,
        stockMinimo: 8
    },
    {
        id: 3,
        codigo: "P003",
        nombre: "Monitor 24 Pulgadas Full HD",
        marca: "Samsung",
        categoria: "tecnologia",
        proveedor: "Global Corp",
        precio: 550000,
        cantidad: 8,
        stockMinimo: 3
    }
];

let listaProductosMemoria = [];
let codigoEditando = null;
let idEditando = null;

// Formateador de moneda en pesos colombianos (COP)
function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor || 0);
}

// 1. CARGAR PRODUCTOS DESDE EL BACKEND (GET /productos o /api/productos)
async function cargarProductos() {
    console.log("Consultando API REST:", API_URL);
    try {
        const respuesta = await fetch(API_URL);
        console.log("Estado de la respuesta HTTP:", respuesta.status);
        if (respuesta.ok) {
            listaProductosMemoria = await respuesta.json();
            console.log("✅ PRODUCTOS RECIBIDOS desde MySQL/Spring Boot:", listaProductosMemoria);
            guardarEnLocalStorage();
        } else {
            throw new Error("Error en el servidor al consultar API");
        }
    } catch (error) {
        console.warn("⚠️ No se pudo conectar al Backend Spring Boot. Usando datos locales de respaldo.", error);
        const guardados = localStorage.getItem("inventario_productos");
        listaProductosMemoria = guardados ? JSON.parse(guardados) : productosInicialesRespaldo;
    }

    renderizarInterfaz();
}

// Guardar copia local de seguridad en el navegador
function guardarEnLocalStorage() {
    localStorage.setItem("inventario_productos", JSON.stringify(listaProductosMemoria));
}

// Renderizar tabla y métricas del dashboard
function renderizarInterfaz() {
    mostrarProductosTabla();
    actualizarMetricasInicio();
}

// 2. RENDERIZAR TABLA DE PRODUCTOS (CON COLUMNAS MARCA Y VALOR TOTAL)
function mostrarProductosTabla() {
    const tabla = document.getElementById("tablaProductos");
    const contenedorTotal = document.getElementById("totalInventarioGeneral");

    if (!tabla) return;

    tabla.innerHTML = "";

    if (!listaProductosMemoria || listaProductosMemoria.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    No hay productos registrados o que coincidan con la búsqueda.
                </td>
            </tr>
        `;
        if (contenedorTotal) contenedorTotal.textContent = formatearMoneda(0);
        return;
    }

    listaProductosMemoria.forEach(function (producto) {
        const totalProducto = (producto.precio || 0) * (producto.cantidad || 0);

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
        const nombreCategoria = categoriasMap[producto.categoria] || producto.categoria || "General";

        const fila = `
            <tr>
                <td class="text-center"><span class="badge bg-secondary">${producto.id || '-'}</span></td>
                <td><span class="badge bg-dark">${producto.codigo}</span></td>
                <td class="fw-bold text-dark">${producto.nombre}</td>
                <td><span class="badge bg-light text-dark border px-2 py-1">${producto.marca || 'N/A'}</span></td>
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

    // Opción B: Valor total del inventario general (Suma de precio * cantidad)
    if (contenedorTotal) {
        const valorTotalGeneral = listaProductosMemoria.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 0)), 0);
        contenedorTotal.textContent = formatearMoneda(valorTotalGeneral);
    }
}

// Mostrar alertas Bootstrap en la parte superior del formulario
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
    }, 4500);
}

// 3. ENVIAR O ACTUALIZAR PRODUCTO (POST / PUT) CON VALIDACIONES (OPCIÓN D)
async function procesarFormulario(event) {
    event.preventDefault();

    const codigoInput = document.getElementById("codigo");
    const nombreInput = document.getElementById("nombre");
    const marcaInput = document.getElementById("marca");
    const categoriaInput = document.getElementById("categoria");
    const proveedorInput = document.getElementById("proveedor");
    const precioInput = document.getElementById("precio");
    const cantidadInput = document.getElementById("cantidad");
    const stockMinimoInput = document.getElementById("stockMinimo");

    const codigo = codigoInput ? codigoInput.value.trim().toUpperCase() : "";
    const nombre = nombreInput ? nombreInput.value.trim() : "";
    const marca = marcaInput ? marcaInput.value.trim() : "";
    const categoria = categoriaInput ? categoriaInput.value : "tecnologia";
    const proveedor = (proveedorInput && proveedorInput.value.trim()) || "Tecno SAS";
    const precio = Number(precioInput ? precioInput.value : 0);
    const cantidad = Number(cantidadInput ? cantidadInput.value : 0);
    const stockMinimo = (stockMinimoInput && Number(stockMinimoInput.value)) || 5;

    // Opción D: Validaciones estrictas
    if (!codigo) {
        mostrarMensaje("El campo Código es obligatorio.", "warning");
        if (codigoInput) codigoInput.focus();
        return;
    }
    if (!nombre) {
        mostrarMensaje("El campo Nombre del Producto es obligatorio.", "warning");
        if (nombreInput) nombreInput.focus();
        return;
    }
    if (!marca) {
        mostrarMensaje("El campo Marca es obligatorio (Requerimiento Parte 2 y 3).", "warning");
        if (marcaInput) marcaInput.focus();
        return;
    }
    if (isNaN(precio) || precio < 0) {
        mostrarMensaje("El precio no puede ser negativo ni estar vacío.", "warning");
        if (precioInput) precioInput.focus();
        return;
    }
    if (isNaN(cantidad) || cantidad < 0) {
        mostrarMensaje("La cantidad (stock) no puede ser negativa ni estar vacía.", "warning");
        if (cantidadInput) cantidadInput.focus();
        return;
    }

    const objetoProducto = {
        id: idEditando,
        codigo: codigo,
        nombre: nombre,
        marca: marca,
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
                ? `Producto "${productoGuardado.nombre}" modificado correctamente.`
                : `Producto "${productoGuardado.nombre}" registrado con éxito en MySQL.`;

            alert(mensajeExito);
            mostrarMensaje(mensajeExito, "success");
            resetearFormulario();
            await cargarProductos();

            // Si se registró desde registrar.html, redirigir a productos.html
            if (window.location.pathname.endsWith("registrar.html") && !esEdicion) {
                window.location.href = "productos.html";
            }
        } else {
            const mensajeError = idEditando
                ? "No fue posible modificar el producto."
                : "No fue posible registrar el producto.";
            alert(mensajeError);
            const errorMsg = await respuesta.text();
            throw new Error(errorMsg || mensajeError);
        }
    } catch (error) {
        console.error("❌ Error conectando con el backend:", error);
        mostrarMensaje(`<strong>¡No se pudo guardar en la base de datos!</strong><br>El servidor Spring Boot (puerto 8080) no responde o hubo un error.<br><small class="text-muted">Asegúrate de haber ejecutado el proyecto en NetBeans o consola.</small>`, "danger");
    }
}

// Cargar producto al formulario para edición (PUT /productos/{id})
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

    if (document.getElementById("codigo")) {
        document.getElementById("codigo").value = producto.codigo;
        document.getElementById("codigo").setAttribute("readonly", "true");
    }
    if (document.getElementById("nombre")) document.getElementById("nombre").value = producto.nombre;
    if (document.getElementById("marca")) document.getElementById("marca").value = producto.marca || "";
    if (document.getElementById("categoria")) document.getElementById("categoria").value = producto.categoria;
    if (document.getElementById("proveedor")) document.getElementById("proveedor").value = producto.proveedor || "";
    if (document.getElementById("precio")) document.getElementById("precio").value = producto.precio;
    if (document.getElementById("cantidad")) document.getElementById("cantidad").value = producto.cantidad;
    if (document.getElementById("stockMinimo")) document.getElementById("stockMinimo").value = producto.stockMinimo || 5;

    const btnSubmit = form.querySelector("button[type='submit']");
    if (btnSubmit) {
        btnSubmit.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i>Actualizar Producto`;
        btnSubmit.className = "btn btn-warning px-4 text-dark fw-bold";
    }

    form.scrollIntoView({ behavior: "smooth" });
    mostrarMensaje(`Editando producto: <strong>${producto.nombre}</strong> (Marca: ${producto.marca || 'N/A'}, ID: ${producto.id || '-'})`, "info");
}

// 4. ELIMINAR PRODUCTO CON CONFIRMACIÓN (OPCIÓN C - DELETE /productos/{id})
async function eliminarProducto(idOrCodigo) {
    const confirmar = confirm("¿Está seguro de que desea eliminar este producto del inventario?");
    if (!confirmar) return;

    const producto = listaProductosMemoria.find(p => p.id == idOrCodigo || p.codigo === idOrCodigo);
    const id = (producto && producto.id) ? producto.id : idOrCodigo;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            alert("Producto eliminado correctamente");
            mostrarMensaje("Producto eliminado correctamente de la base de datos.", "danger");
            await cargarProductos();
        } else {
            alert("No fue posible eliminar el producto");
        }
    } catch (error) {
        console.warn("Error eliminando en el backend:", error);
        alert("No fue posible eliminar el producto en el servidor.");
    }
}

// 5. BÚSQUEDA DE PRODUCTOS POR NOMBRE (PARTE 4 - GET /productos/buscar/{nombre})
async function buscarProductos(event) {
    if (event) event.preventDefault();
    const inputBuscar = document.getElementById("inputBuscar");
    const infoBusqueda = document.getElementById("resultadoBusquedaInfo");
    if (!inputBuscar) return;

    const termino = inputBuscar.value.trim();
    if (!termino) {
        if (infoBusqueda) infoBusqueda.style.display = "none";
        await cargarProductos();
        return;
    }

    try {
        const urlBusqueda = `${API_URL}/buscar/${encodeURIComponent(termino)}`;
        console.log("🔎 Consultando endpoint de búsqueda:", urlBusqueda);
        const respuesta = await fetch(urlBusqueda);
        if (respuesta.ok) {
            listaProductosMemoria = await respuesta.json();
            console.log("✅ Coincidencias encontradas en backend:", listaProductosMemoria);
        } else {
            throw new Error("Respuesta no satisfactoria del endpoint de búsqueda");
        }
    } catch (error) {
        console.warn("⚠️ Búsqueda directa en API falló, aplicando filtrado en cliente:", error);
        const guardados = localStorage.getItem("inventario_productos");
        const base = guardados ? JSON.parse(guardados) : productosInicialesRespaldo;
        listaProductosMemoria = base.filter(p => p.nombre && p.nombre.toLowerCase().includes(termino.toLowerCase()));
    }

    mostrarProductosTabla();

    if (infoBusqueda) {
        infoBusqueda.style.display = "block";
        infoBusqueda.innerHTML = `Mostrando resultados para: <strong>"${termino}"</strong> &mdash; <strong>${listaProductosMemoria.length}</strong> producto(s) encontrado(s).`;
    }
}

// Limpiar filtro de búsqueda y restaurar todos los productos
async function limpiarBusqueda() {
    const inputBuscar = document.getElementById("inputBuscar");
    const infoBusqueda = document.getElementById("resultadoBusquedaInfo");
    if (inputBuscar) inputBuscar.value = "";
    if (infoBusqueda) infoBusqueda.style.display = "none";
    await cargarProductos();
}

// Resetear formulario a su estado original
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

// Actualizar métricas del dashboard en index.html (OPCIÓN A y OPCIÓN B)
function actualizarMetricasInicio() {
    const totalProductosEl = document.getElementById("totalProductosCount");
    const disponiblesEl = document.getElementById("disponiblesCount");
    const agotadosEl = document.getElementById("agotadosCount");
    const totalValorInventarioEl = document.getElementById("totalValorInventarioCount");

    const totalCount = listaProductosMemoria ? listaProductosMemoria.length : 0;
    const disponiblesCount = listaProductosMemoria ? listaProductosMemoria.filter(p => p.cantidad > 0).length : 0;
    const agotadosCount = listaProductosMemoria ? listaProductosMemoria.filter(p => p.cantidad <= 5).length : 0;
    const valorTotalInventario = listaProductosMemoria ? listaProductosMemoria.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 0)), 0) : 0;

    // Opción A: Total de productos registrados
    if (totalProductosEl) totalProductosEl.textContent = totalCount;
    if (disponiblesEl) disponiblesEl.textContent = disponiblesCount;
    if (agotadosEl) agotadosEl.textContent = agotadosCount;

    // Opción B: Valor total del inventario
    if (totalValorInventarioEl) totalValorInventarioEl.textContent = formatearMoneda(valorTotalInventario);

    // Renderizar tarjetas de los últimos productos
    const contenedorUltimos = document.getElementById("contenedorUltimosProductos");
    if (contenedorUltimos && listaProductosMemoria) {
        contenedorUltimos.innerHTML = "";
        const ultimos = listaProductosMemoria.slice(-3).reverse();

        ultimos.forEach(p => {
            const card = `
                <div class="col-12 col-md-4">
                    <div class="card h-100 border-1 border-light shadow-sm">
                        <div class="card-body">
                            <span class="badge bg-primary mb-2">${p.categoria}</span>
                            <h4 class="card-title h5 text-dark">${p.nombre}</h4>
                            <p class="card-text text-muted mb-1"><strong>Marca:</strong> ${p.marca || 'N/A'}</p>
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

// Inicialización de escuchadores de eventos al cargar el DOM
document.addEventListener("DOMContentLoaded", async function () {
    // Formulario de creación y edición
    const formProducto = document.getElementById("formProducto");
    if (formProducto) {
        formProducto.addEventListener("submit", procesarFormulario);
        formProducto.addEventListener("reset", resetearFormulario);
    }

    // Barra de búsqueda por nombre (Parte 4)
    const formBuscar = document.getElementById("formBuscar");
    if (formBuscar) {
        formBuscar.addEventListener("submit", buscarProductos);
    }
    const btnLimpiarBuscar = document.getElementById("btnLimpiarBuscar");
    if (btnLimpiarBuscar) {
        btnLimpiarBuscar.addEventListener("click", limpiarBusqueda);
    }

    // Cargar productos desde el backend o almacenamiento local
    await cargarProductos();

    // Soporte para editar desde registrar.html pasando ?id=... o ?codigo=...
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get("id");
    const paramCodigo = urlParams.get("codigo");
    if (paramId || paramCodigo) {
        editarProducto(paramId || paramCodigo);
    }
});
