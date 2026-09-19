const API_URL = "/api";

// ===============================
// ELEMENTOS DEL DOM
// ===============================

const formCita = document.getElementById("form-cita");
const formularioCita = document.getElementById("formulario-cita");

const btnNuevaCita = document.getElementById("btn-nueva-cita");
const btnCancelarForm = document.getElementById("btn-cancelar-form");

const tablaCitas = document.getElementById("tabla-citas");

const mascotaSelect = document.getElementById("mascota_id");
const veterinarioSelect = document.getElementById("veterinario_id");

const citaId = document.getElementById("cita-id");
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const motivoInput = document.getElementById("motivo");
const observacionesInput = document.getElementById("observaciones");
const estadoInput = document.getElementById("estado");

const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtro-estado");
const filtroFecha = document.getElementById("filtro-fecha");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

const totalCitas = document.getElementById("total-citas");
const citasPendientes = document.getElementById("citas-pendientes");
const citasAtendidas = document.getElementById("citas-atendidas");
const citasCanceladas = document.getElementById("citas-canceladas");

const tituloFormulario = document.getElementById("titulo-formulario");
const mensajeTabla = document.getElementById("mensaje-tabla");

// Modal
const modalDetalle = document.getElementById("modal-detalle");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnCerrarModalFooter = document.getElementById("btn-cerrar-modal-footer");

const detalleEstado = document.getElementById("detalle-estado");
const detalleMascota = document.getElementById("detalle-mascota");
const detalleVeterinario = document.getElementById("detalle-veterinario");
const detalleFecha = document.getElementById("detalle-fecha");
const detalleHora = document.getElementById("detalle-hora");
const detalleMotivo = document.getElementById("detalle-motivo");
const detalleObservaciones = document.getElementById("detalle-observaciones");

let citas = [];
let mascotas = [];
let veterinarios = [];

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    establecerFechaMinima();

    await cargarMascotas();
    await cargarVeterinarios();
    await cargarCitas();

    configurarEventos();

});

// ===============================
// EVENTOS
// ===============================

function configurarEventos() {

    btnNuevaCita.addEventListener("click", () => {
        abrirFormulario();
    });

    btnCancelarForm.addEventListener("click", () => {
        cerrarFormulario();
    });

    formCita.addEventListener("submit", guardarCita);

    buscador.addEventListener("input", aplicarFiltros);
    filtroEstado.addEventListener("change", aplicarFiltros);
    filtroFecha.addEventListener("change", aplicarFiltros);

    btnLimpiarFiltros.addEventListener("click", limpiarFiltros);

    btnCerrarModal.addEventListener("click", cerrarDetalle);
    btnCerrarModalFooter.addEventListener("click", cerrarDetalle);

    document.querySelector(".modal-overlay")
        .addEventListener("click", cerrarDetalle);

}

// ===============================
// CARGAR MASCOTAS
// ===============================

async function cargarMascotas() {

    try {

        const response = await fetch(`${API_URL}/mascotas`);

        if (!response.ok) {
            throw new Error("No fue posible obtener las mascotas.");
        }

        mascotas = await response.json();

        mascotaSelect.innerHTML =
            '<option value="">Seleccionar mascota</option>';

        mascotas.forEach(mascota => {

            const option = document.createElement("option");

            option.value = mascota.id;

            option.textContent =
                `${mascota.nombre || "Sin nombre"}${mascota.raza ? ` - ${mascota.raza}` : ""}`;

            mascotaSelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No fue posible cargar las mascotas.",
            "error"
        );

    }

}

// ===============================
// CARGAR VETERINARIOS
// ===============================

async function cargarVeterinarios() {

    try {

        const response = await fetch(`${API_URL}/usuarios`);

        if (!response.ok) {
            throw new Error("No fue posible obtener los usuarios.");
        }

        const usuarios = await response.json();

        veterinarios = usuarios.filter(usuario => {

            const rol = String(
                usuario.rol ||
                usuario.nombre_rol ||
                usuario.tipo_rol ||
                ""
            ).toLowerCase();

            return rol.includes("veterin");

        });

        // Si el backend no devuelve rol,
        // se muestran los usuarios disponibles.
        if (veterinarios.length === 0) {
            veterinarios = usuarios;
        }

        veterinarioSelect.innerHTML =
            '<option value="">Seleccionar veterinario</option>';

        veterinarios.forEach(veterinario => {

            const option = document.createElement("option");

            option.value = veterinario.id;

            option.textContent =
                `${veterinario.nombre || ""} ${veterinario.apellido || ""}`.trim()
                || veterinario.usuario
                || `Veterinario #${veterinario.id}`;

            veterinarioSelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No fue posible cargar los veterinarios.",
            "error"
        );

    }

}

// ===============================
// CARGAR CITAS
// ===============================

async function cargarCitas() {

    try {

        const response = await fetch(`${API_URL}/citas`);

        if (!response.ok) {
            throw new Error("No fue posible obtener las citas.");
        }

        citas = await response.json();

        actualizarResumen();

        aplicarFiltros();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No fue posible cargar las citas.",
            "error"
        );

    }

}

// ===============================
// MOSTRAR CITAS
// ===============================

function mostrarCitas(lista) {

    tablaCitas.innerHTML = "";

    if (!lista.length) {

        tablaCitas.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No se encontraron citas.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(cita => {

        const fila = document.createElement("tr");

        const mascotaNombre =
            obtenerNombreMascota(cita);

        const veterinarioNombre =
            obtenerNombreVeterinario(cita);

        const fechaHora =
            separarFechaHora(cita.fecha_hora);

        fila.innerHTML = `
            <td>
                <strong>${escaparHTML(mascotaNombre)}</strong>
            </td>

            <td>
                ${escaparHTML(veterinarioNombre)}
            </td>

            <td>
                ${formatearFecha(fechaHora.fecha)}
            </td>

            <td>
                ${fechaHora.hora || "-"}
            </td>

            <td>
                ${escaparHTML(cita.motivo || "-")}
            </td>

            <td>
                <span class="status-badge ${obtenerClaseEstado(cita.estado)}">
                    ${escaparHTML(cita.estado || "Pendiente")}
                </span>
            </td>

            <td class="actions-cell">

                <button
                    class="btn-action btn-detail"
                    data-action="detalle"
                    data-id="${cita.id}"
                    title="Ver detalle">
                    👁
                </button>

                <button
                    class="btn-action btn-edit"
                    data-action="editar"
                    data-id="${cita.id}"
                    title="Editar cita">
                    ✏️
                </button>

                <button
                    class="btn-action btn-delete"
                    data-action="eliminar"
                    data-id="${cita.id}"
                    title="Eliminar cita">
                    🗑️
                </button>

            </td>
        `;

        tablaCitas.appendChild(fila);

    });

    document.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", () => {

            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "detalle") {
                mostrarDetalle(id);
            }

            if (action === "editar") {
                editarCita(id);
            }

            if (action === "eliminar") {
                eliminarCita(id);
            }

        });

    });

}

// ===============================
// GUARDAR CITA
// ===============================

async function guardarCita(event) {

    event.preventDefault();

    const mascotaId = mascotaSelect.value;
    const veterinarioId = veterinarioSelect.value;
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const motivo = motivoInput.value.trim();
    const observaciones = observacionesInput.value.trim();
    const estado = estadoInput.value;

    if (!mascotaId ||
        !veterinarioId ||
        !fecha ||
        !hora ||
        !motivo) {

        mostrarMensaje(
            "Completa todos los campos obligatorios.",
            "error"
        );

        return;
    }

    // Validar fecha
    const fechaSeleccionada =
        new Date(`${fecha}T${hora}`);

    const ahora = new Date();

    if (fechaSeleccionada < ahora) {

        mostrarMensaje(
            "La fecha y hora de la cita no pueden estar en el pasado.",
            "error"
        );

        return;
    }

    // Evitar citas duplicadas
    const idActual = Number(citaId.value);

    const existeCita = citas.some(cita => {

        if (Number(cita.id) === idActual) {
            return false;
        }

        const fechaExistente =
            normalizarFechaHora(cita.fecha_hora);

        const nuevaFecha =
            `${fecha} ${hora}`;

        return (
            Number(cita.mascota_id) === Number(mascotaId) &&
            fechaExistente === nuevaFecha &&
            String(cita.estado).toLowerCase() !== "cancelada"
        );

    });

    if (existeCita) {

        mostrarMensaje(
            "La mascota ya tiene una cita registrada en esa fecha y hora.",
            "error"
        );

        return;
    }

    const datos = {
        mascota_id: Number(mascotaId),
        veterinario_id: Number(veterinarioId),
        fecha_hora: `${fecha} ${hora}:00`,
        motivo,
        observaciones,
        estado
    };

    try {

        const esEdicion = Boolean(citaId.value);

        const url = esEdicion
            ? `${API_URL}/citas/${citaId.value}`
            : `${API_URL}/citas`;

        const method = esEdicion
            ? "PUT"
            : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(
                resultado.error ||
                "No fue posible guardar la cita."
            );
        }

        mostrarMensaje(
            esEdicion
                ? "Cita actualizada correctamente."
                : "Cita registrada correctamente.",
            "success"
        );

        cerrarFormulario();

        await cargarCitas();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

// ===============================
// EDITAR CITA
// ===============================

function editarCita(id) {

    const cita = citas.find(
        item => Number(item.id) === Number(id)
    );

    if (!cita) {
        return;
    }

    citaId.value = cita.id;

    mascotaSelect.value =
        cita.mascota_id || "";

    veterinarioSelect.value =
        cita.veterinario_id || "";

    const fechaHora =
        separarFechaHora(cita.fecha_hora);

    fechaInput.value =
        fechaHora.fecha || "";

    horaInput.value =
        fechaHora.hora || "";

    motivoInput.value =
        cita.motivo || "";

    observacionesInput.value =
        cita.observaciones || "";

    estadoInput.value =
        cita.estado || "Pendiente";

    tituloFormulario.textContent =
        "Editar cita";

    formularioCita.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ===============================
// ELIMINAR CITA
// ===============================

async function eliminarCita(id) {

    const cita = citas.find(
        item => Number(item.id) === Number(id)
    );

    if (!cita) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas eliminar la cita de ${obtenerNombreMascota(cita)}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/citas/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await response.json();

        if (!response.ok) {

            throw new Error(
                resultado.error ||
                "No fue posible eliminar la cita."
            );

        }

        mostrarMensaje(
            "Cita eliminada correctamente.",
            "success"
        );

        await cargarCitas();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );

    }

}

// ===============================
// DETALLE
// ===============================

function mostrarDetalle(id) {

    const cita = citas.find(
        item => Number(item.id) === Number(id)
    );

    if (!cita) {
        return;
    }

    const fechaHora =
        separarFechaHora(cita.fecha_hora);

    detalleEstado.textContent =
        cita.estado || "Pendiente";

    detalleMascota.textContent =
        obtenerNombreMascota(cita);

    detalleVeterinario.textContent =
        obtenerNombreVeterinario(cita);

    detalleFecha.textContent =
        formatearFecha(fechaHora.fecha);

    detalleHora.textContent =
        fechaHora.hora || "-";

    detalleMotivo.textContent =
        cita.motivo || "-";

    detalleObservaciones.textContent =
        cita.observaciones || "Sin observaciones.";

    modalDetalle.classList.remove("hidden");

}

function cerrarDetalle() {

    modalDetalle.classList.add("hidden");

}

// ===============================
// FORMULARIO
// ===============================

function abrirFormulario() {

    formCita.reset();

    citaId.value = "";

    estadoInput.value = "Pendiente";

    tituloFormulario.textContent =
        "Registrar nueva cita";

    establecerFechaMinima();

    formularioCita.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function cerrarFormulario() {

    formularioCita.classList.add("hidden");

    formCita.reset();

    citaId.value = "";

    estadoInput.value = "Pendiente";

}

// ===============================
// FILTROS
// ===============================

function aplicarFiltros() {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();

    const estado =
        filtroEstado.value;

    const fecha =
        filtroFecha.value;

    const filtradas =
        citas.filter(cita => {

            const mascota =
                obtenerNombreMascota(cita)
                    .toLowerCase();

            const veterinario =
                obtenerNombreVeterinario(cita)
                    .toLowerCase();

            const motivo =
                String(cita.motivo || "")
                    .toLowerCase();

            const coincideTexto =
                !texto ||
                mascota.includes(texto) ||
                veterinario.includes(texto) ||
                motivo.includes(texto);

            const coincideEstado =
                !estado ||
                String(cita.estado)
                    .toLowerCase() === estado.toLowerCase();

            const fechaCita =
                normalizarFechaHora(cita.fecha_hora)
                    .substring(0, 10);

            const coincideFecha =
                !fecha ||
                fechaCita === fecha;

            return (
                coincideTexto &&
                coincideEstado &&
                coincideFecha
            );

        });

    mostrarCitas(filtradas);

}

function limpiarFiltros() {

    buscador.value = "";
    filtroEstado.value = "";
    filtroFecha.value = "";

    aplicarFiltros();

}

// ===============================
// RESUMEN
// ===============================

function actualizarResumen() {

    totalCitas.textContent =
        citas.length;

    citasPendientes.textContent =
        citas.filter(cita =>
            String(cita.estado).toLowerCase() === "pendiente"
        ).length;

    citasAtendidas.textContent =
        citas.filter(cita =>
            String(cita.estado).toLowerCase() === "atendida"
        ).length;

    citasCanceladas.textContent =
        citas.filter(cita =>
            String(cita.estado).toLowerCase() === "cancelada"
        ).length;

}

// ===============================
// FUNCIONES AUXILIARES
// ===============================

function obtenerNombreMascota(cita) {

    if (cita.mascota_nombre) {
        return cita.mascota_nombre;
    }

    if (cita.nombre_mascota) {
        return cita.nombre_mascota;
    }

    const mascota =
        mascotas.find(
            item => Number(item.id) === Number(cita.mascota_id)
        );

    return mascota?.nombre || "Sin nombre";

}

function obtenerNombreVeterinario(cita) {

    if (cita.veterinario_nombre) {
        return cita.veterinario_nombre;
    }

    if (cita.nombre_veterinario) {
        return cita.nombre_veterinario;
    }

    const veterinario =
        veterinarios.find(
            item => Number(item.id) === Number(cita.veterinario_id)
        );

    if (!veterinario) {
        return "Sin asignar";
    }

    return (
        `${veterinario.nombre || ""} ${veterinario.apellido || ""}`
            .trim()
        || veterinario.usuario
        || "Sin asignar"
    );

}

function obtenerClaseEstado(estado) {

    switch (
        String(estado || "")
            .toLowerCase()
    ) {

        case "atendida":
            return "status-success";

        case "cancelada":
            return "status-danger";

        case "pendiente":
        default:
            return "status-warning";

    }

}

function separarFechaHora(valor) {

    if (!valor) {
        return {
            fecha: "",
            hora: ""
        };
    }

    const texto =
        String(valor);

    const match =
        texto.match(
            /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/
        );

    if (match) {

        return {
            fecha: match[1],
            hora: match[2]
        };

    }

    const fecha =
        new Date(valor);

    if (Number.isNaN(fecha.getTime())) {

        return {
            fecha: "",
            hora: ""
        };

    }

    const año =
        fecha.getFullYear();

    const mes =
        String(fecha.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(fecha.getDate())
            .padStart(2, "0");

    const hora =
        String(fecha.getHours())
            .padStart(2, "0");

    const minutos =
        String(fecha.getMinutes())
            .padStart(2, "0");

    return {
        fecha: `${año}-${mes}-${dia}`,
        hora: `${hora}:${minutos}`
    };

}

function normalizarFechaHora(valor) {

    const partes =
        separarFechaHora(valor);

    if (!partes.fecha) {
        return "";
    }

    return `${partes.fecha} ${partes.hora}`;

}

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const partes =
        fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function establecerFechaMinima() {

    const hoy =
        obtenerFechaActual();

    fechaInput.min = hoy;

}

function obtenerFechaActual() {

    const fecha =
        new Date();

    const año =
        fecha.getFullYear();

    const mes =
        String(fecha.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(fecha.getDate())
            .padStart(2, "0");

    return `${año}-${mes}-${dia}`;

}

function mostrarMensaje(texto, tipo) {

    if (!mensajeTabla) {
        return;
    }

    mensajeTabla.textContent =
        texto;

    mensajeTabla.className =
        `message ${tipo}`;

    mensajeTabla.classList.remove("hidden");

    setTimeout(() => {

        mensajeTabla.classList.add("hidden");

    }, 4000);

}

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto == null ? "" : String(texto);

    return div.innerHTML;

}
