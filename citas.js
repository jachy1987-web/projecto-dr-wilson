const API_URL = "/api";

let citas = [];
let mascotas = [];
let veterinarios = [];

const formCita = document.getElementById("form-cita");
const formularioCita = document.getElementById("formulario-cita");

const btnNuevaCita = document.getElementById("btn-nueva-cita");
const btnCancelarForm = document.getElementById("btn-cancelar-form");
const btnActualizar = document.getElementById("btn-actualizar");
const btnLimpiar = document.getElementById("btn-limpiar");

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
const btnLimpiarFiltros =
    document.getElementById("btn-limpiar-filtros");

const resultadoFiltro =
    document.getElementById("resultado-filtro");

const totalCitas =
    document.getElementById("total-citas");

const citasPendientes =
    document.getElementById("citas-pendientes");

const citasAtendidas =
    document.getElementById("citas-atendidas");

const citasCanceladas =
    document.getElementById("citas-canceladas");

const tituloFormulario =
    document.getElementById("titulo-formulario");

const mensajeTabla =
    document.getElementById("mensaje-tabla");

const modalDetalle =
    document.getElementById("modal-detalle");

const btnCerrarModal =
    document.getElementById("btn-cerrar-modal");

const btnCerrarModalFooter =
    document.getElementById("btn-cerrar-modal-footer");

const detalleEstado =
    document.getElementById("detalle-estado");

const detalleMascota =
    document.getElementById("detalle-mascota");

const detalleVeterinario =
    document.getElementById("detalle-veterinario");

const detalleFecha =
    document.getElementById("detalle-fecha");

const detalleHora =
    document.getElementById("detalle-hora");

const detalleMotivo =
    document.getElementById("detalle-motivo");

const detalleObservaciones =
    document.getElementById("detalle-observaciones");


/* ============================================================
   INICIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    establecerFechaMinima();

    configurarEventos();

    try {

        await cargarMascotas();
        await cargarVeterinarios();
        await cargarCitas();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No fue posible cargar toda la información.",
            "error"
        );

    }
}


/* ============================================================
   EVENTOS
   ============================================================ */

function configurarEventos() {

    btnNuevaCita.addEventListener(
        "click",
        abrirFormulario
    );

    btnCancelarForm.addEventListener(
        "click",
        cerrarFormulario
    );

    btnActualizar.addEventListener(
        "click",
        cargarCitas
    );

    btnLimpiar.addEventListener(
        "click",
        limpiarFormulario
    );

    formCita.addEventListener(
        "submit",
        guardarCita
    );

    buscador.addEventListener(
        "input",
        aplicarFiltros
    );

    filtroEstado.addEventListener(
        "change",
        aplicarFiltros
    );

    filtroFecha.addEventListener(
        "change",
        aplicarFiltros
    );

    btnLimpiarFiltros.addEventListener(
        "click",
        limpiarFiltros
    );

    btnCerrarModal.addEventListener(
        "click",
        cerrarDetalle
    );

    btnCerrarModalFooter.addEventListener(
        "click",
        cerrarDetalle
    );

    document
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            cerrarDetalle
        );

}


/* ============================================================
   CARGAR MASCOTAS
   ============================================================ */

async function cargarMascotas() {

    const respuesta =
        await fetch(`${API_URL}/mascotas`);

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron cargar las mascotas."
        );
    }

    const datos = await respuesta.json();

    mascotas = Array.isArray(datos)
        ? datos
        : datos.mascotas || datos.data || [];

    mascotaSelect.innerHTML =
        `<option value="">
            Seleccionar mascota
        </option>`;

    mascotas.forEach(mascota => {

        const id =
            mascota.id_mascota ??
            mascota.id ??
            mascota.ID;

        const nombre =
            mascota.nombre ||
            mascota.nombre_mascota ||
            "Sin nombre";

        if (!id) return;

        const opcion =
            document.createElement("option");

        opcion.value = id;

        opcion.textContent = nombre;

        mascotaSelect.appendChild(opcion);

    });

}


/* ============================================================
   CARGAR VETERINARIOS
   ============================================================ */

async function cargarVeterinarios() {

    const respuesta =
        await fetch(`${API_URL}/usuarios`);

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron cargar los usuarios."
        );
    }

    const datos = await respuesta.json();

    const usuarios = Array.isArray(datos)
        ? datos
        : datos.usuarios || datos.data || [];

    veterinarios = usuarios.filter(usuario => {

        const rol = String(
            usuario.rol ||
            usuario.nombre_rol ||
            usuario.tipo_rol ||
            ""
        ).toLowerCase();

        return rol.includes("veterin");

    });

    if (!veterinarios.length) {
        veterinarios = usuarios;
    }

    veterinarioSelect.innerHTML =
        `<option value="">
            Seleccionar veterinario
        </option>`;

    veterinarios.forEach(veterinario => {

        const id =
            veterinario.id_usuario ??
            veterinario.id ??
            veterinario.ID;

        if (!id) return;

        const nombre = (
            `${veterinario.nombre || ""}
             ${veterinario.apellido || ""}`
        ).replace(/\s+/g, " ").trim();

        const opcion =
            document.createElement("option");

        opcion.value = id;

        opcion.textContent =
            nombre ||
            veterinario.usuario ||
            `Veterinario #${id}`;

        veterinarioSelect.appendChild(opcion);

    });

}


/* ============================================================
   CARGAR CITAS
   ============================================================ */

async function cargarCitas() {

    mostrarMensaje(
        "Cargando citas...",
        "info"
    );

    const respuesta =
        await fetch(`${API_URL}/citas`);

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron consultar las citas."
        );
    }

    const datos = await respuesta.json();

    citas = Array.isArray(datos)
        ? datos
        : datos.citas || datos.data || [];

    actualizarResumen();

    aplicarFiltros();

    mostrarMensaje("", "");

}


/* ============================================================
   RESUMEN
   ============================================================ */

function actualizarResumen() {

    totalCitas.textContent =
        citas.length;

    citasPendientes.textContent =
        citas.filter(c =>
            normalizarEstado(c.estado) === "programada" ||
            normalizarEstado(c.estado) === "pendiente"
        ).length;

    citasAtendidas.textContent =
        citas.filter(c =>
            normalizarEstado(c.estado) === "atendida"
        ).length;

    citasCanceladas.textContent =
        citas.filter(c =>
            normalizarEstado(c.estado) === "cancelada"
        ).length;
}


/* ============================================================
   FILTROS
   ============================================================ */

function aplicarFiltros() {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();

    const estado =
        filtroEstado.value
            .trim()
            .toLowerCase();

    const fecha =
        filtroFecha.value;

    const resultados =
        citas.filter(cita => {

            const contenido = [
                cita.mascota,
                cita.nombre_mascota,
                cita.veterinario,
                cita.nombre_veterinario,
                cita.motivo,
                cita.observaciones
            ]
                .join(" ")
                .toLowerCase();

            const coincideTexto =
                !texto ||
                contenido.includes(texto);

            const estadoCita =
                normalizarEstado(cita.estado);

            const coincideEstado =
                !estado ||
                estadoCita === estado ||
                (
                    estado === "programada" &&
                    estadoCita === "pendiente"
                );

            const fechaCita =
                obtenerFecha(cita.fecha);

            const coincideFecha =
                !fecha ||
                fechaCita === fecha;

            return (
                coincideTexto &&
                coincideEstado &&
                coincideFecha
            );

        });

    mostrarCitas(resultados);

    resultadoFiltro.textContent =
        resultados.length === citas.length
            ? `Mostrando ${resultados.length} registro(s).`
            : `Mostrando ${resultados.length} de ${citas.length} registro(s).`;

}


/* ============================================================
   TABLA
   ============================================================ */

function mostrarCitas(lista) {

    tablaCitas.innerHTML = "";

    if (!lista.length) {

        tablaCitas.innerHTML = `
            <tr>
                <td colspan="8" class="vacio">
                    📅 No se encontraron citas.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach((cita, indice) => {

        const tr =
            document.createElement("tr");

        const mascota =
            cita.mascota ||
            cita.nombre_mascota ||
            "Sin información";

        const veterinario =
            cita.veterinario ||
            cita.nombre_veterinario ||
            obtenerNombreVeterinario(
                cita.veterinario_id
            );

        const estado =
            normalizarEstado(cita.estado);

        tr.innerHTML = `
            <td>
                <span class="numero">
                    ${indice + 1}
                </span>
            </td>

            <td>
                <strong>
                    ${escaparHTML(mascota)}
                </strong>
            </td>

            <td>
                ${escaparHTML(veterinario)}
            </td>

            <td>
                ${formatearFecha(cita.fecha)}
            </td>

            <td>
                ${cita.hora || "--"}
            </td>

            <td>
                ${escaparHTML(
                    cita.motivo || "Sin motivo"
                )}
            </td>

            <td>
                <span class="estado ${claseEstado(estado)}">
                    ${capitalizarEstado(estado)}
                </span>
            </td>

            <td>

                <div class="acciones">

                    <button
                        type="button"
                        class="btn-accion btn-detalle"
                        title="Ver detalle"
                        onclick="verDetalle(${obtenerId(cita)})"
                    >
                        👁
                    </button>

                    <button
                        type="button"
                        class="btn-accion btn-editar"
                        title="Editar"
                        onclick="editarCita(${obtenerId(cita)})"
                    >
                        ✏
                    </button>

                    <button
                        type="button"
                        class="btn-accion btn-eliminar"
                        title="Eliminar"
                        onclick="eliminarCita(${obtenerId(cita)})"
                    >
                        🗑
                    </button>

                </div>

            </td>
        `;

        tablaCitas.appendChild(tr);

    });

}


/* ============================================================
   GUARDAR / ACTUALIZAR
   ============================================================ */

async function guardarCita(evento) {

    evento.preventDefault();

    const id =
        citaId.value.trim();

    const datos = {

        mascota_id:
            Number(mascotaSelect.value),

        veterinario_id:
            Number(veterinarioSelect.value),

        fecha:
            fechaInput.value,

        hora:
            horaInput.value,

        motivo:
            motivoInput.value.trim(),

        observaciones:
            observacionesInput.value.trim(),

        estado:
            estadoInput.value

    };

    if (
        !datos.mascota_id ||
        !datos.veterinario_id ||
        !datos.fecha ||
        !datos.hora ||
        !datos.motivo
    ) {

        alert(
            "Complete todos los campos obligatorios."
        );

        return;
    }

    const conflicto =
        citas.some(cita => {

            const citaActual =
                String(obtenerId(cita)) === String(id);

            if (citaActual) return false;

            const mascota =
                Number(
                    cita.mascota_id ??
                    cita.id_mascota
                );

            const fecha =
                obtenerFecha(cita.fecha);

            const hora =
                String(cita.hora || "")
                    .slice(0, 5);

            return (
                mascota === datos.mascota_id &&
                fecha === datos.fecha &&
                hora === datos.hora &&
                normalizarEstado(cita.estado)
                    !== "cancelada"
            );

        });

    if (conflicto) {

        alert(
            "La mascota ya tiene una cita registrada para esa fecha y hora."
        );

        return;
    }

    try {

        const url =
            id
                ? `${API_URL}/citas/${id}`
                : `${API_URL}/citas`;

        const metodo =
            id ? "PUT" : "POST";

        const respuesta =
            await fetch(url, {

                method: metodo,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(datos)

            });

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.message ||
                "No fue posible guardar la cita."
            );

        }

        alert(
            id
                ? "Cita actualizada correctamente."
                : "Cita registrada correctamente."
        );

        cerrarFormulario();

        await cargarCitas();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


/* ============================================================
   EDITAR
   ============================================================ */

window.editarCita = function(id) {

    const cita =
        citas.find(
            elemento =>
                String(obtenerId(elemento)) === String(id)
        );

    if (!cita) {
        alert("No se encontró la cita.");
        return;
    }

    citaId.value =
        obtenerId(cita);

    mascotaSelect.value =
        cita.mascota_id ??
        cita.id_mascota ??
        "";

    veterinarioSelect.value =
        cita.veterinario_id ??
        cita.id_usuario ??
        cita.id_veterinario ??
        "";

    fechaInput.value =
        obtenerFecha(cita.fecha);

    horaInput.value =
        String(cita.hora || "")
            .slice(0, 5);

    motivoInput.value =
        cita.motivo || "";

    observacionesInput.value =
        cita.observaciones || "";

    const estado =
        normalizarEstado(cita.estado);

    estadoInput.value =
        estado === "pendiente"
            ? "Programada"
            : capitalizarEstado(estado);

    tituloFormulario.textContent =
        "Editar cita";

    formularioCita.hidden = false;

    formularioCita.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

};


/* ============================================================
   ELIMINAR
   ============================================================ */

window.eliminarCita = async function(id) {

    const confirmar =
        confirm(
            "¿Está seguro de eliminar esta cita?"
        );

    if (!confirmar) return;

    try {

        const respuesta =
            await fetch(
                `${API_URL}/citas/${id}`,
                {
                    method: "DELETE"
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible eliminar la cita."
            );

        }

        alert(
            "Cita eliminada correctamente."
        );

        await cargarCitas();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

};


/* ============================================================
   DETALLE
   ============================================================ */

window.verDetalle = function(id) {

    const cita =
        citas.find(
            elemento =>
                String(obtenerId(elemento)) === String(id)
        );

    if (!cita) return;

    const estado =
        normalizarEstado(cita.estado);

    detalleEstado.textContent =
        capitalizarEstado(estado);

    detalleEstado.className =
        `estado ${claseEstado(estado)}`;

    detalleMascota.textContent =
        cita.mascota ||
        cita.nombre_mascota ||
        "Sin información";

    detalleVeterinario.textContent =
        cita.veterinario ||
        cita.nombre_veterinario ||
        obtenerNombreVeterinario(
            cita.veterinario_id
        );

    detalleFecha.textContent =
        formatearFecha(cita.fecha);

    detalleHora.textContent =
        cita.hora || "--";

    detalleMotivo.textContent =
        cita.motivo || "Sin información";

    detalleObservaciones.textContent =
        cita.observaciones ||
        "Sin observaciones.";

    modalDetalle.hidden = false;

};


/* ============================================================
   FORMULARIO
   ============================================================ */

function abrirFormulario() {

    formCita.reset();

    citaId.value = "";

    tituloFormulario.textContent =
        "Registrar nueva cita";

    estadoInput.value =
        "Programada";

    establecerFechaMinima();

    formularioCita.hidden = false;

    formularioCita.scrollIntoView({
        behavior: "smooth"
    });

}


function cerrarFormulario() {

    formularioCita.hidden = true;

    formCita.reset();

    citaId.value = "";

    tituloFormulario.textContent =
        "Registrar nueva cita";

    estadoInput.value =
        "Programada";

}


function limpiarFormulario() {

    citaId.value = "";

    tituloFormulario.textContent =
        "Registrar nueva cita";

    estadoInput.value =
        "Programada";

}


/* ============================================================
   MODAL
   ============================================================ */

function cerrarDetalle() {
    modalDetalle.hidden = true;
}


/* ============================================================
   FILTROS
   ============================================================ */

function limpiarFiltros() {

    buscador.value = "";

    filtroEstado.value = "";

    filtroFecha.value = "";

    aplicarFiltros();

}


/* ============================================================
   UTILIDADES
   ============================================================ */

function obtenerId(objeto) {

    return (
        objeto.id_cita ??
        objeto.id ??
        objeto.ID
    );

}


function obtenerNombreVeterinario(id) {

    const veterinario =
        veterinarios.find(
            elemento =>
                String(
                    elemento.id_usuario ??
                    elemento.id ??
                    elemento.ID
                ) === String(id)
        );

    if (!veterinario) {
        return "Sin información";
    }

    return (
        `${veterinario.nombre || ""}
         ${veterinario.apellido || ""}`
    ).replace(/\s+/g, " ").trim();

}


function obtenerFecha(fecha) {

    if (!fecha) return "";

    return String(fecha)
        .slice(0, 10);

}


function formatearFecha(fecha) {

    const valor =
        obtenerFecha(fecha);

    if (!valor) return "--";

    const partes =
        valor.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function normalizarEstado(estado) {

    const valor =
        String(estado || "")
            .trim()
            .toLowerCase();

    if (valor === "pendiente") {
        return "pendiente";
    }

    if (valor === "programada") {
        return "programada";
    }

    if (valor === "atendida") {
        return "atendida";
    }

    if (valor === "cancelada") {
        return "cancelada";
    }

    return valor;

}


function capitalizarEstado(estado) {

    if (!estado) return "Sin estado";

    return estado.charAt(0).toUpperCase()
        + estado.slice(1);

}


function claseEstado(estado) {

    switch (estado) {

        case "programada":
        case "pendiente":
            return "estado-programada";

        case "atendida":
            return "estado-atendida";

        case "cancelada":
            return "estado-cancelada";

        default:
            return "";

    }

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function establecerFechaMinima() {

    const hoy =
        new Date()
            .toISOString()
            .slice(0, 10);

    fechaInput.min = hoy;

}


function mostrarMensaje(texto, tipo) {

    mensajeTabla.textContent =
        texto || "";

    mensajeTabla.className =
        `mensaje-tabla ${tipo || ""}`;

}
