/* ============================================================
   DOCTOR WILSON - HISTORIAS CLÍNICAS
   ============================================================ */

const API_HISTORIAS = "/api/historias-clinicas";
const API_MASCOTAS = "/api/mascotas";
const API_USUARIOS = "/api/usuarios";

/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */

const formHistoria = document.getElementById("form-historia");

const idHistoria = document.getElementById("id_historia");
const idMascota = document.getElementById("id_mascota");
const idUsuario = document.getElementById("id_usuario");
const fecha = document.getElementById("fecha");
const motivoConsulta = document.getElementById("motivo_consulta");
const diagnostico = document.getElementById("diagnostico");
const tratamiento = document.getElementById("tratamiento");
const observaciones = document.getElementById("observaciones");

const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnLimpiar = document.getElementById("btn-limpiar");
const btnActualizar = document.getElementById("btn-actualizar");

const tablaHistorias = document.getElementById("tabla-historias");

const buscarHistoria = document.getElementById("buscar-historia");
const filtroFecha = document.getElementById("filtro-fecha");
const filtroMascota = document.getElementById("filtro-mascota");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

const totalHistorias = document.getElementById("total-historias");
const totalMascotas = document.getElementById("total-mascotas");
const totalConsultas = document.getElementById("total-consultas");

/* ============================================================
   MODAL
   ============================================================ */

const modalDetalle = document.getElementById("modal-detalle");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnCerrarModalFooter = document.getElementById(
    "btn-cerrar-modal-footer"
);

const detalleMascota = document.getElementById("detalle-mascota");
const detalleVeterinario = document.getElementById("detalle-veterinario");
const detalleFecha = document.getElementById("detalle-fecha");
const detalleMotivo = document.getElementById("detalle-motivo");
const detalleDiagnostico = document.getElementById("detalle-diagnostico");
const detalleTratamiento = document.getElementById("detalle-tratamiento");
const detalleObservaciones = document.getElementById(
    "detalle-observaciones"
);

/* ============================================================
   VARIABLES
   ============================================================ */

let historias = [];
let mascotas = [];
let usuarios = [];


/* ============================================================
   INICIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    cargarDatos();

    establecerFechaActual();

});


/* ============================================================
   CARGAR INFORMACIÓN
   ============================================================ */

async function cargarDatos() {

    try {

        mostrarCargando();

        await Promise.all([
            cargarMascotas(),
            cargarUsuarios(),
            cargarHistorias()
        ]);

    } catch (error) {

        console.error("Error al cargar información:", error);

        mostrarError(
            "No fue posible cargar la información del módulo."
        );

    }

}


/* ============================================================
   CARGAR MASCOTAS
   ============================================================ */

async function cargarMascotas() {

    try {

        const respuesta = await fetch(API_MASCOTAS);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las mascotas.");
        }

        const datos = await respuesta.json();

        mascotas = Array.isArray(datos)
            ? datos
            : datos.mascotas || datos.data || [];

        llenarSelectMascotas();

    } catch (error) {

        console.error(error);

        mascotas = [];

        throw error;

    }

}


/* ============================================================
   CARGAR USUARIOS / VETERINARIOS
   ============================================================ */

async function cargarUsuarios() {

    try {

        const respuesta = await fetch(API_USUARIOS);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los usuarios.");
        }

        const datos = await respuesta.json();

        usuarios = Array.isArray(datos)
            ? datos
            : datos.usuarios || datos.data || [];

        llenarSelectUsuarios();

    } catch (error) {

        console.error(error);

        usuarios = [];

        throw error;

    }

}


/* ============================================================
   CARGAR HISTORIAS
   ============================================================ */

async function cargarHistorias() {

    try {

        const respuesta = await fetch(API_HISTORIAS);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las historias clínicas.");
        }

        const datos = await respuesta.json();

        historias = Array.isArray(datos)
            ? datos
            : datos.historias || datos.data || [];

        renderizarHistorias();

        actualizarResumen();

    } catch (error) {

        console.error(error);

        mostrarError(
            "No fue posible cargar las historias clínicas."
        );

        throw error;

    }

}


/* ============================================================
   LLENAR SELECT DE MASCOTAS
   ============================================================ */

function llenarSelectMascotas() {

    if (!idMascota) return;

    idMascota.innerHTML = `
        <option value="">Seleccione una mascota</option>
    `;

    filtroMascota.innerHTML = `
        <option value="">Todas las mascotas</option>
    `;

    mascotas.forEach(mascota => {

        const id = obtenerIdMascota(mascota);
        const nombre = obtenerNombreMascota(mascota);

        if (!id) return;

        idMascota.innerHTML += `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
        `;

        filtroMascota.innerHTML += `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
        `;

    });

}


/* ============================================================
   LLENAR SELECT DE USUARIOS
   ============================================================ */

function llenarSelectUsuarios() {

    if (!idUsuario) return;

    idUsuario.innerHTML = `
        <option value="">Seleccione un veterinario</option>
    `;

    usuarios.forEach(usuario => {

        const id = obtenerIdUsuario(usuario);
        const nombre = obtenerNombreUsuario(usuario);

        if (!id) return;

        idUsuario.innerHTML += `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
        `;

    });

}


/* ============================================================
   OBTENER ID MASCOTA
   ============================================================ */

function obtenerIdMascota(mascota) {

    return (
        mascota.id_mascota ??
        mascota.id ??
        mascota.ID
    );

}


/* ============================================================
   OBTENER NOMBRE MASCOTA
   ============================================================ */

function obtenerNombreMascota(mascota) {

    if (mascota.nombre) {
        return mascota.nombre;
    }

    if (mascota.nombre_mascota) {
        return mascota.nombre_mascota;
    }

    return `Mascota #${obtenerIdMascota(mascota)}`;

}


/* ============================================================
   OBTENER ID USUARIO
   ============================================================ */

function obtenerIdUsuario(usuario) {

    return (
        usuario.id_usuario ??
        usuario.id ??
        usuario.ID
    );

}


/* ============================================================
   OBTENER NOMBRE USUARIO
   ============================================================ */

function obtenerNombreUsuario(usuario) {

    if (usuario.nombre_completo) {
        return usuario.nombre_completo;
    }

    const nombre = usuario.nombre || "";
    const apellido = usuario.apellido || "";

    const completo = `${nombre} ${apellido}`.trim();

    if (completo) {
        return completo;
    }

    if (usuario.usuario) {
        return usuario.usuario;
    }

    if (usuario.correo) {
        return usuario.correo;
    }

    return `Veterinario #${obtenerIdUsuario(usuario)}`;

}


/* ============================================================
   RENDERIZAR TABLA
   ============================================================ */

function renderizarHistorias() {

    const textoBusqueda =
        buscarHistoria?.value.trim().toLowerCase() || "";

    const fechaSeleccionada =
        filtroFecha?.value || "";

    const mascotaSeleccionada =
        filtroMascota?.value || "";

    const resultados = historias.filter(historia => {

        const mascota = buscarMascota(historia.id_mascota);

        const usuario = buscarUsuario(historia.id_usuario);

        const nombreMascota =
            obtenerNombreMascota(mascota || {});

        const nombreUsuario =
            obtenerNombreUsuario(usuario || {});

        const textoHistoria = `
            ${historia.id_historia || ""}
            ${historia.fecha || ""}
            ${nombreMascota}
            ${historia.motivo_consulta || ""}
            ${historia.diagnostico || ""}
            ${historia.tratamiento || ""}
            ${historia.observaciones || ""}
            ${nombreUsuario}
        `.toLowerCase();

        const coincideBusqueda =
            !textoBusqueda ||
            textoHistoria.includes(textoBusqueda);

        const coincideFecha =
            !fechaSeleccionada ||
            convertirFechaParaComparar(historia.fecha) ===
            fechaSeleccionada;

        const coincideMascota =
            !mascotaSeleccionada ||
            String(historia.id_mascota) ===
            String(mascotaSeleccionada);

        return (
            coincideBusqueda &&
            coincideFecha &&
            coincideMascota
        );

    });

    if (resultados.length === 0) {

        tablaHistorias.innerHTML = `
            <tr>
                <td colspan="7" class="vacio">
                    No se encontraron historias clínicas.
                </td>
            </tr>
        `;

        return;

    }

    tablaHistorias.innerHTML = resultados
        .map(historia => construirFila(historia))
        .join("");

}


/* ============================================================
   CONSTRUIR FILA
   ============================================================ */

function construirFila(historia) {

    const mascota =
        buscarMascota(historia.id_mascota);

    const usuario =
        buscarUsuario(historia.id_usuario);

    const nombreMascota =
        obtenerNombreMascota(mascota || {});

    const nombreUsuario =
        obtenerNombreUsuario(usuario || {});

    const fechaMostrar =
        formatearFecha(historia.fecha);

    return `
        <tr>

            <td>
                ${escaparHTML(historia.id_historia)}
            </td>

            <td>
                ${escaparHTML(fechaMostrar)}
            </td>

            <td>
                <strong>
                    ${escaparHTML(nombreMascota)}
                </strong>
            </td>

            <td>
                ${escaparHTML(
                    historia.motivo_consulta || "Sin registrar"
                )}
            </td>

            <td>
                ${escaparHTML(
                    historia.diagnostico || "Sin registrar"
                )}
            </td>

            <td>
                ${escaparHTML(nombreUsuario)}
            </td>

            <td class="acciones">

                <button
                    type="button"
                    class="btn-accion btn-detalle"
                    onclick="verDetalle(${historia.id_historia})"
                    title="Ver detalle"
                >
                    👁️
                </button>

                <button
                    type="button"
                    class="btn-accion btn-editar"
                    onclick="editarHistoria(${historia.id_historia})"
                    title="Editar"
                >
                    ✏️
                </button>

                <button
                    type="button"
                    class="btn-accion btn-eliminar"
                    onclick="eliminarHistoria(${historia.id_historia})"
                    title="Eliminar"
                >
                    🗑️
                </button>

            </td>

        </tr>
    `;

}


/* ============================================================
   BUSCAR MASCOTA
   ============================================================ */

function buscarMascota(id) {

    return mascotas.find(
        mascota =>
            String(obtenerIdMascota(mascota)) ===
            String(id)
    );

}


/* ============================================================
   BUSCAR USUARIO
   ============================================================ */

function buscarUsuario(id) {

    return usuarios.find(
        usuario =>
            String(obtenerIdUsuario(usuario)) ===
            String(id)
    );

}


/* ============================================================
   REGISTRAR / ACTUALIZAR
   ============================================================ */

formHistoria?.addEventListener("submit", async event => {

    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const id = idHistoria.value.trim();

    const datos = {

        id_mascota: Number(idMascota.value),

        id_usuario: Number(idUsuario.value),

        fecha: fecha.value,

        motivo_consulta:
            motivoConsulta.value.trim(),

        diagnostico:
            diagnostico.value.trim(),

        tratamiento:
            tratamiento.value.trim(),

        observaciones:
            observaciones.value.trim()

    };

    try {

        btnGuardar.disabled = true;

        btnGuardar.textContent =
            id
                ? "⏳ Actualizando..."
                : "⏳ Registrando...";

        const url =
            id
                ? `${API_HISTORIAS}/${id}`
                : API_HISTORIAS;

        const metodo =
            id
                ? "PUT"
                : "POST";

        const respuesta = await fetch(url, {

            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado =
            await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No fue posible guardar la historia clínica."
            );

        }

        alert(
            id
                ? "Historia clínica actualizada correctamente."
                : "Historia clínica registrada correctamente."
        );

        limpiarFormulario();

        await cargarHistorias();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Ocurrió un error al guardar la historia clínica."
        );

    } finally {

        btnGuardar.disabled = false;

        btnGuardar.textContent =
            idHistoria.value
                ? "💾 Actualizar historia"
                : "💾 Registrar historia";

    }

});


/* ============================================================
   VALIDAR FORMULARIO
   ============================================================ */

function validarFormulario() {

    if (!idMascota.value) {

        alert("Seleccione una mascota.");

        idMascota.focus();

        return false;

    }

    if (!idUsuario.value) {

        alert("Seleccione el veterinario.");

        idUsuario.focus();

        return false;

    }

    if (!fecha.value) {

        alert("Seleccione la fecha de consulta.");

        fecha.focus();

        return false;

    }

    if (!motivoConsulta.value.trim()) {

        alert("Ingrese el motivo de consulta.");

        motivoConsulta.focus();

        return false;

    }

    const fechaSeleccionada =
        new Date(`${fecha.value}T00:00:00`);

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > hoy) {

        alert(
            "La fecha de la consulta no puede ser futura."
        );

        fecha.focus();

        return false;

    }

    return true;

}


/* ============================================================
   EDITAR HISTORIA
   ============================================================ */

async function editarHistoria(id) {

    try {

        const respuesta =
            await fetch(`${API_HISTORIAS}/${id}`);

        if (!respuesta.ok) {

            throw new Error(
                "No fue posible consultar la historia clínica."
            );

        }

        const datos =
            await respuesta.json();

        const historia =
            datos.data ||
            datos.historia ||
            datos;

        idHistoria.value =
            historia.id_historia;

        idMascota.value =
            historia.id_mascota;

        idUsuario.value =
            historia.id_usuario;

        fecha.value =
            convertirFechaParaInput(historia.fecha);

        motivoConsulta.value =
            historia.motivo_consulta || "";

        diagnostico.value =
            historia.diagnostico || "";

        tratamiento.value =
            historia.tratamiento || "";

        observaciones.value =
            historia.observaciones || "";

        btnGuardar.textContent =
            "💾 Actualizar historia";

        btnCancelar.style.display =
            "inline-flex";

        document
            .getElementById("titulo-formulario")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


/* ============================================================
   ELIMINAR HISTORIA
   ============================================================ */

async function eliminarHistoria(id) {

    const confirmar =
        confirm(
            "¿Está seguro de eliminar esta historia clínica?\n\n" +
            "Esta acción no se puede deshacer."
        );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(`${API_HISTORIAS}/${id}`, {

                method: "DELETE"

            });

        const resultado =
            await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No fue posible eliminar la historia clínica."
            );

        }

        alert(
            "Historia clínica eliminada correctamente."
        );

        await cargarHistorias();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Ocurrió un error al eliminar la historia clínica."
        );

    }

}


/* ============================================================
   VER DETALLE
   ============================================================ */

async function verDetalle(id) {

    try {

        const respuesta =
            await fetch(`${API_HISTORIAS}/${id}`);

        if (!respuesta.ok) {

            throw new Error(
                "No fue posible consultar el detalle."
            );

        }

        const datos =
            await respuesta.json();

        const historia =
            datos.data ||
            datos.historia ||
            datos;

        const mascota =
            buscarMascota(historia.id_mascota);

        const usuario =
            buscarUsuario(historia.id_usuario);

        detalleMascota.textContent =
            obtenerNombreMascota(mascota || {});

        detalleVeterinario.textContent =
            obtenerNombreUsuario(usuario || {});

        detalleFecha.textContent =
            formatearFecha(historia.fecha);

        detalleMotivo.textContent =
            historia.motivo_consulta ||
            "Sin registrar";

        detalleDiagnostico.textContent =
            historia.diagnostico ||
            "Sin registrar";

        detalleTratamiento.textContent =
            historia.tratamiento ||
            "Sin registrar";

        detalleObservaciones.textContent =
            historia.observaciones ||
            "Sin registrar";

        modalDetalle.classList.remove("hidden");

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


/* ============================================================
   CERRAR MODAL
   ============================================================ */

function cerrarModal() {

    modalDetalle?.classList.add("hidden");

}


btnCerrarModal?.addEventListener(
    "click",
    cerrarModal
);

btnCerrarModalFooter?.addEventListener(
    "click",
    cerrarModal
);

modalDetalle?.querySelector(
    ".modal-overlay"
)?.addEventListener(
    "click",
    cerrarModal
);


/* ============================================================
   CANCELAR EDICIÓN
   ============================================================ */

btnCancelar?.addEventListener(
    "click",
    limpiarFormulario
);


/* ============================================================
   LIMPIAR FORMULARIO
   ============================================================ */

btnLimpiar?.addEventListener(
    "click",
    () => {

        setTimeout(() => {

            idHistoria.value = "";

            btnGuardar.textContent =
                "💾 Registrar historia";

            btnCancelar.style.display =
                "none";

        }, 0);

    }
);


function limpiarFormulario() {

    formHistoria.reset();

    idHistoria.value = "";

    establecerFechaActual();

    btnGuardar.textContent =
        "💾 Registrar historia";

    btnCancelar.style.display =
        "none";

}


/* ============================================================
   ACTUALIZAR
   ============================================================ */

btnActualizar?.addEventListener(
    "click",
    async () => {

        btnActualizar.disabled = true;

        btnActualizar.textContent =
            "⏳ Actualizando...";

        try {

            await cargarDatos();

        } finally {

            btnActualizar.disabled = false;

            btnActualizar.textContent =
                "🔄 Actualizar";

        }

    }
);


/* ============================================================
   BUSCADOR
   ============================================================ */

buscarHistoria?.addEventListener(
    "input",
    renderizarHistorias
);


/* ============================================================
   FILTRO FECHA
   ============================================================ */

filtroFecha?.addEventListener(
    "change",
    renderizarHistorias
);


/* ============================================================
   FILTRO MASCOTA
   ============================================================ */

filtroMascota?.addEventListener(
    "change",
    renderizarHistorias
);


/* ============================================================
   LIMPIAR FILTROS
   ============================================================ */

btnLimpiarFiltros?.addEventListener(
    "click",
    () => {

        buscarHistoria.value = "";

        filtroFecha.value = "";

        filtroMascota.value = "";

        renderizarHistorias();

    }
);


/* ============================================================
   RESUMEN
   ============================================================ */

function actualizarResumen() {

    const cantidadHistorias =
        historias.length;

    const mascotasAtendidas =
        new Set(
            historias
                .map(
                    historia =>
                        historia.id_mascota
                )
                .filter(Boolean)
        ).size;

    totalHistorias.textContent =
        cantidadHistorias;

    totalMascotas.textContent =
        mascotasAtendidas;

    totalConsultas.textContent =
        cantidadHistorias;

}


/* ============================================================
   FECHA ACTUAL
   ============================================================ */

function establecerFechaActual() {

    if (!fecha.value) {

        const ahora = new Date();

        const anio =
            ahora.getFullYear();

        const mes =
            String(
                ahora.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                ahora.getDate()
            ).padStart(2, "0");

        fecha.value =
            `${anio}-${mes}-${dia}`;

    }

}


/* ============================================================
   CONVERTIR FECHA PARA INPUT
   ============================================================ */

function convertirFechaParaInput(valor) {

    if (!valor) {
        return "";
    }

    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}/.test(valor)
    ) {

        return valor.substring(0, 10);

    }

    const fechaConvertida =
        new Date(valor);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return "";
    }

    const anio =
        fechaConvertida.getFullYear();

    const mes =
        String(
            fechaConvertida.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fechaConvertida.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}


/* ============================================================
   FORMATEAR FECHA
   ============================================================ */

function formatearFecha(valor) {

    if (!valor) {
        return "Sin fecha";
    }

    const fechaTexto =
        convertirFechaParaInput(valor);

    if (!fechaTexto) {
        return valor;
    }

    const partes =
        fechaTexto.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* ============================================================
   FECHA PARA COMPARACIÓN
   ============================================================ */

function convertirFechaParaComparar(valor) {

    return convertirFechaParaInput(valor);

}


/* ============================================================
   MOSTRAR CARGANDO
   ============================================================ */

function mostrarCargando() {

    tablaHistorias.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="cargando"
            >
                Cargando historias clínicas...
            </td>
        </tr>
    `;

}


/* ============================================================
   MOSTRAR ERROR
   ============================================================ */

function mostrarError(mensaje) {

    tablaHistorias.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="error-tabla"
            >
                ⚠️ ${escaparHTML(mensaje)}
            </td>
        </tr>
    `;

}


/* ============================================================
   SEGURIDAD HTML
   ============================================================ */

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
