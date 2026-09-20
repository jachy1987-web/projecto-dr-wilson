/* ============================================================
   DOCTOR WILSON
   MÓDULO CRUD - HISTORIAS CLÍNICAS
   ============================================================ */

const API = "/api";

let historias = [];
let mascotas = [];
let usuarios = [];


/* ============================================================
   ELEMENTOS
   ============================================================ */

const formHistoria = document.getElementById("form-historia");

const idHistoria = document.getElementById("id_historia");
const idMascota = document.getElementById("id_mascota");
const idUsuario = document.getElementById("id_usuario");
const fecha = document.getElementById("fecha");
const motivoConsulta =
    document.getElementById("motivo_consulta");
const diagnostico =
    document.getElementById("diagnostico");
const tratamiento =
    document.getElementById("tratamiento");
const observaciones =
    document.getElementById("observaciones");

const btnGuardar =
    document.getElementById("btn-guardar");

const btnCancelar =
    document.getElementById("btn-cancelar");

const btnLimpiar =
    document.getElementById("btn-limpiar");

const btnActualizar =
    document.getElementById("btn-actualizar");

const tablaHistorias =
    document.getElementById("tabla-historias");

const buscarHistoria =
    document.getElementById("buscar-historia");

const filtroFecha =
    document.getElementById("filtro-fecha");

const filtroMascota =
    document.getElementById("filtro-mascota");

const btnLimpiarFiltros =
    document.getElementById("btn-limpiar-filtros");

const totalHistorias =
    document.getElementById("total-historias");

const totalMascotas =
    document.getElementById("total-mascotas");

const totalConsultas =
    document.getElementById("total-consultas");

const tituloFormulario =
    document.getElementById("titulo-formulario");


/* ============================================================
   MODAL
   ============================================================ */

const modalDetalle =
    document.getElementById("modal-detalle");

const btnCerrarModal =
    document.getElementById("btn-cerrar-modal");

const btnCerrarModalFooter =
    document.getElementById(
        "btn-cerrar-modal-footer"
    );

const detalleMascota =
    document.getElementById("detalle-mascota");

const detalleVeterinario =
    document.getElementById("detalle-veterinario");

const detalleFecha =
    document.getElementById("detalle-fecha");

const detalleMotivo =
    document.getElementById("detalle-motivo");

const detalleDiagnostico =
    document.getElementById("detalle-diagnostico");

const detalleTratamiento =
    document.getElementById("detalle-tratamiento");

const detalleObservaciones =
    document.getElementById(
        "detalle-observaciones"
    );


/* ============================================================
   INICIO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    iniciarHistorias
);


async function iniciarHistorias() {

    establecerFechaActual();

    configurarEventos();

    await cargarInformacion();

}


/* ============================================================
   EVENTOS
   ============================================================ */

function configurarEventos() {

    formHistoria.addEventListener(
        "submit",
        guardarHistoria
    );

    btnCancelar.addEventListener(
        "click",
        cancelarEdicion
    );

    btnLimpiar.addEventListener(
        "click",
        limpiarFormulario
    );

    btnActualizar.addEventListener(
        "click",
        cargarInformacion
    );

    buscarHistoria.addEventListener(
        "input",
        aplicarFiltros
    );

    filtroFecha.addEventListener(
        "change",
        aplicarFiltros
    );

    filtroMascota.addEventListener(
        "change",
        aplicarFiltros
    );

    btnLimpiarFiltros.addEventListener(
        "click",
        limpiarFiltros
    );

    btnCerrarModal.addEventListener(
        "click",
        cerrarModal
    );

    btnCerrarModalFooter.addEventListener(
        "click",
        cerrarModal
    );

    document
        .querySelector(
            "#modal-detalle .modal-overlay"
        )
        ?.addEventListener(
            "click",
            cerrarModal
        );

}


/* ============================================================
   CARGAR INFORMACIÓN
   ============================================================ */

async function cargarInformacion() {

    mostrarEstadoTabla(
        "Cargando información..."
    );

    try {

        await Promise.all([
            cargarMascotas(),
            cargarUsuarios(),
            cargarHistorias()
        ]);

        actualizarResumen();

    } catch (error) {

        console.error(error);

        mostrarEstadoTabla(
            "No fue posible cargar la información. Verifique el servidor.",
            true
        );

    }

}


/* ============================================================
   MASCOTAS
   ============================================================ */

async function cargarMascotas() {

    const respuesta =
        await fetch(`${API}/mascotas`);

    if (!respuesta.ok) {

        throw new Error(
            "Error al consultar mascotas."
        );

    }

    const datos =
        await respuesta.json();

    mascotas =
        Array.isArray(datos)
            ? datos
            : datos.mascotas ||
              datos.data ||
              [];

    llenarMascotas();

}


/* ============================================================
   USUARIOS / VETERINARIOS
   ============================================================ */

async function cargarUsuarios() {

    const respuesta =
        await fetch(`${API}/usuarios`);

    if (!respuesta.ok) {

        throw new Error(
            "Error al consultar usuarios."
        );

    }

    const datos =
        await respuesta.json();

    const usuariosCargados =
        Array.isArray(datos)
            ? datos
            : datos.usuarios ||
              datos.data ||
              [];

    /*
       Se conserva la lógica del proyecto:
       si existen usuarios con rol veterinario,
       solamente ellos aparecen como veterinarios.
    */

    const veterinarios =
        usuariosCargados.filter(usuario => {

            const rol =
                String(
                    usuario.rol ||
                    usuario.nombre_rol ||
                    usuario.tipo_rol ||
                    ""
                ).toLowerCase();

            return rol.includes("veterin");

        });

    usuarios =
        veterinarios.length
            ? veterinarios
            : usuariosCargados;

    llenarUsuarios();

}


/* ============================================================
   HISTORIAS
   ============================================================ */

async function cargarHistorias() {

    const respuesta =
        await fetch(
            `${API}/historias-clinicas`
        );

    if (!respuesta.ok) {

        throw new Error(
            "Error al consultar historias clínicas."
        );

    }

    const datos =
        await respuesta.json();

    historias =
        Array.isArray(datos)
            ? datos
            : datos.historias ||
              datos.data ||
              [];

    actualizarResumen();

    aplicarFiltros();

}


/* ============================================================
   LLENAR SELECT MASCOTAS
   ============================================================ */

function llenarMascotas() {

    idMascota.innerHTML = `
        <option value="">
            Seleccione una mascota
        </option>
    `;

    filtroMascota.innerHTML = `
        <option value="">
            Todas las mascotas
        </option>
    `;

    mascotas.forEach(mascota => {

        const id =
            mascota.id_mascota ??
            mascota.id ??
            mascota.ID;

        const nombre =
            mascota.nombre ||
            mascota.nombre_mascota ||
            `Mascota #${id}`;

        if (!id) return;

        idMascota.insertAdjacentHTML(
            "beforeend",
            `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
            `
        );

        filtroMascota.insertAdjacentHTML(
            "beforeend",
            `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
            `
        );

    });

}


/* ============================================================
   LLENAR SELECT VETERINARIOS
   ============================================================ */

function llenarUsuarios() {

    idUsuario.innerHTML = `
        <option value="">
            Seleccione un veterinario
        </option>
    `;

    usuarios.forEach(usuario => {

        const id =
            usuario.id_usuario ??
            usuario.id ??
            usuario.ID;

        if (!id) return;

        const nombre =
            obtenerNombreUsuario(usuario);

        idUsuario.insertAdjacentHTML(
            "beforeend",
            `
            <option value="${id}">
                ${escaparHTML(nombre)}
            </option>
            `
        );

    });

}


/* ============================================================
   FILTROS
   ============================================================ */

function aplicarFiltros() {

    const texto =
        buscarHistoria.value
            .trim()
            .toLowerCase();

    const fechaFiltro =
        filtroFecha.value;

    const mascotaFiltro =
        filtroMascota.value;

    const resultados =
        historias.filter(historia => {

            const mascota =
                buscarMascota(
                    historia.id_mascota
                );

            const usuario =
                buscarUsuario(
                    historia.id_usuario
                );

            const nombreMascota =
                historia.mascota ||
                obtenerNombreMascota(
                    mascota
                );

            const nombreVeterinario =
                historia.veterinario ||
                obtenerNombreUsuario(
                    usuario
                );

            const texto =
                [
                    historia.id_historia,
                    nombreMascota,
                    nombreVeterinario,
                    historia.motivo_consulta,
                    historia.diagnostico,
                    historia.tratamiento,
                    historia.observaciones,
                    historia.fecha
                ]
                    .join(" ")
                    .toLowerCase();

            const coincideTexto =
                !texto ||
                texto.includes(texto);

            const coincideFecha =
                !fechaFiltro ||
                obtenerFecha(
                    historia.fecha
                ) === fechaFiltro;

            const coincideMascota =
                !mascotaFiltro ||
                String(
                    historia.id_mascota
                ) === String(
                    mascotaFiltro
                );

            return (
                coincideTexto &&
                coincideFecha &&
                coincideMascota
            );

        });

    /*
       Corrección importante:
       se vuelve a calcular correctamente la búsqueda.
    */

    const resultadosFinales =
        historias.filter(historia => {

            const mascota =
                buscarMascota(
                    historia.id_mascota
                );

            const usuario =
                buscarUsuario(
                    historia.id_usuario
                );

            const nombreMascota =
                historia.mascota ||
                obtenerNombreMascota(
                    mascota
                );

            const nombreVeterinario =
                historia.veterinario ||
                obtenerNombreUsuario(
                    usuario
                );

            const texto =
                [
                    historia.id_historia,
                    nombreMascota,
                    nombreVeterinario,
                    historia.motivo_consulta,
                    historia.diagnostico,
                    historia.tratamiento,
                    historia.observaciones
                ]
                    .join(" ")
                    .toLowerCase();

            return (
                (!texto || texto.includes(textoBusquedaActual())) &&
                (
                    !fechaFiltro ||
                    obtenerFecha(
                        historia.fecha
                    ) === fechaFiltro
                ) &&
                (
                    !mascotaFiltro ||
                    String(
                        historia.id_mascota
                    ) === String(
                        mascotaFiltro
                    )
                )
            );

        });

    renderizarTabla(
        resultadosFinales
    );

}


/* ============================================================
   TEXTO ACTUAL DE BÚSQUEDA
   ============================================================ */

function textoBusquedaActual() {

    return buscarHistoria.value
        .trim()
        .toLowerCase();

}


/* ============================================================
   RENDER TABLA
   ============================================================ */

function renderizarTabla(lista) {

    tablaHistorias.innerHTML = "";

    if (!lista.length) {

        tablaHistorias.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="vacio"
                >
                    📋 No se encontraron historias clínicas.
                </td>
            </tr>
        `;

        return;

    }

    lista.forEach(
        (historia, indice) => {

            const mascota =
                buscarMascota(
                    historia.id_mascota
                );

            const usuario =
                buscarUsuario(
                    historia.id_usuario
                );

            const nombreMascota =
                historia.mascota ||
                obtenerNombreMascota(
                    mascota
                );

            const nombreVeterinario =
                historia.veterinario ||
                obtenerNombreUsuario(
                    usuario
                );

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <span class="numero">
                        ${indice + 1}
                    </span>
                </td>

                <td>
                    ${escaparHTML(
                        formatearFecha(
                            historia.fecha
                        )
                    )}
                </td>

                <td>
                    <strong>
                        ${escaparHTML(
                            nombreMascota
                        )}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(
                        historia.motivo_consulta ||
                        "Sin registrar"
                    )}
                </td>

                <td>
                    <span class="texto-tabla">
                        ${escaparHTML(
                            historia.diagnostico ||
                            "Sin diagnóstico"
                        )}
                    </span>
                </td>

                <td>
                    ${escaparHTML(
                        nombreVeterinario
                    )}
                </td>

                <td class="acciones">

                    <button
                        type="button"
                        class="btn-accion btn-detalle"
                        title="Ver detalle"
                        onclick="verDetalle(${historia.id_historia})"
                    >
                        👁️
                    </button>

                    <button
                        type="button"
                        class="btn-accion btn-editar"
                        title="Editar"
                        onclick="editarHistoria(${historia.id_historia})"
                    >
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="btn-accion btn-eliminar"
                        title="Eliminar"
                        onclick="eliminarHistoria(${historia.id_historia})"
                    >
                        🗑️
                    </button>

                </td>
            `;

            tablaHistorias.appendChild(
                fila
            );

        }
    );

}


/* ============================================================
   GUARDAR / ACTUALIZAR
   ============================================================ */

async function guardarHistoria(evento) {

    evento.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const id =
        idHistoria.value.trim();

    const datos = {

        fecha:
            fecha.value,

        motivo_consulta:
            motivoConsulta.value.trim(),

        diagnostico:
            diagnostico.value.trim(),

        tratamiento:
            tratamiento.value.trim(),

        observaciones:
            observaciones.value.trim(),

        id_mascota:
            Number(idMascota.value),

        id_usuario:
            Number(idUsuario.value)

    };

    try {

        bloquearFormulario(true);

        const url =
            id
                ? `${API}/historias-clinicas/${id}`
                : `${API}/historias-clinicas`;

        const metodo =
            id
                ? "PUT"
                : "POST";

        const respuesta =
            await fetch(
                url,
                {
                    method: metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datos)
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.message ||
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
            error.message
        );

    } finally {

        bloquearFormulario(false);

    }

}


/* ============================================================
   EDITAR
   ============================================================ */

window.editarHistoria =
    function(id) {

        const historia =
            historias.find(
                item =>
                    String(
                        item.id_historia
                    ) === String(id)
            );

        if (!historia) {

            alert(
                "No se encontró la historia clínica."
            );

            return;
        }

        idHistoria.value =
            historia.id_historia;

        idMascota.value =
            historia.id_mascota;

        idUsuario.value =
            historia.id_usuario;

        fecha.value =
            obtenerFecha(
                historia.fecha
            );

        motivoConsulta.value =
            historia.motivo_consulta || "";

        diagnostico.value =
            historia.diagnostico || "";

        tratamiento.value =
            historia.tratamiento || "";

        observaciones.value =
            historia.observaciones || "";

        tituloFormulario.textContent =
            "Editar historia clínica";

        btnGuardar.textContent =
            "💾 Actualizar historia";

        btnCancelar.style.display =
            "inline-flex";

        document
            .querySelector(
                ".formulario-tarjeta"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    };


/* ============================================================
   ELIMINAR
   ============================================================ */

window.eliminarHistoria =
    async function(id) {

        const historia =
            historias.find(
                item =>
                    String(
                        item.id_historia
                    ) === String(id)
            );

        if (!historia) {
            return;
        }

        const confirmar =
            confirm(
                `¿Está seguro de eliminar la historia clínica #${id}?`
            );

        if (!confirmar) {
            return;
        }

        try {

            const respuesta =
                await fetch(
                    `${API}/historias-clinicas/${id}`,
                    {
                        method: "DELETE"
                    }
                );

            const resultado =
                await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
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
                error.message
            );

        }

    };


/* ============================================================
   DETALLE
   ============================================================ */

window.verDetalle =
    function(id) {

        const historia =
            historias.find(
                item =>
                    String(
                        item.id_historia
                    ) === String(id)
            );

        if (!historia) {
            return;
        }

        const mascota =
            buscarMascota(
                historia.id_mascota
            );

        const usuario =
            buscarUsuario(
                historia.id_usuario
            );

        detalleMascota.textContent =
            historia.mascota ||
            obtenerNombreMascota(
                mascota
            );

        detalleVeterinario.textContent =
            historia.veterinario ||
            obtenerNombreUsuario(
                usuario
            );

        detalleFecha.textContent =
            formatearFecha(
                historia.fecha
            );

        detalleMotivo.textContent =
            historia.motivo_consulta ||
            "Sin registrar";

        detalleDiagnostico.textContent =
            historia.diagnostico ||
            "Sin diagnóstico registrado.";

        detalleTratamiento.textContent =
            historia.tratamiento ||
            "Sin tratamiento registrado.";

        detalleObservaciones.textContent =
            historia.observaciones ||
            "Sin observaciones.";

        modalDetalle.classList.remove(
            "hidden"
        );

        modalDetalle.style.display =
            "flex";

    };


/* ============================================================
   CERRAR MODAL
   ============================================================ */

function cerrarModal() {

    modalDetalle.classList.add(
        "hidden"
    );

    modalDetalle.style.display =
        "none";

}


/* ============================================================
   VALIDACIÓN
   ============================================================ */

function validarFormulario() {

    if (!idMascota.value) {

        alert(
            "Seleccione una mascota."
        );

        idMascota.focus();

        return false;
    }

    if (!idUsuario.value) {

        alert(
            "Seleccione el veterinario."
        );

        idUsuario.focus();

        return false;
    }

    if (!fecha.value) {

        alert(
            "Seleccione la fecha de consulta."
        );

        fecha.focus();

        return false;
    }

    if (!motivoConsulta.value.trim()) {

        alert(
            "Ingrese el motivo de consulta."
        );

        motivoConsulta.focus();

        return false;
    }

    return true;

}


/* ============================================================
   LIMPIAR FORMULARIO
   ============================================================ */

function limpiarFormulario() {

    formHistoria.reset();

    idHistoria.value = "";

    establecerFechaActual();

    tituloFormulario.textContent =
        "Registrar historia clínica";

    btnGuardar.textContent =
        "💾 Registrar historia";

    btnCancelar.style.display =
        "none";

}


/* ============================================================
   CANCELAR EDICIÓN
   ============================================================ */

function cancelarEdicion() {

    limpiarFormulario();

}


/* ============================================================
   LIMPIAR FILTROS
   ============================================================ */

function limpiarFiltros() {

    buscarHistoria.value = "";

    filtroFecha.value = "";

    filtroMascota.value = "";

    aplicarFiltros();

}


/* ============================================================
   RESUMEN
   ============================================================ */

function actualizarResumen() {

    totalHistorias.textContent =
        historias.length;

    const mascotasUnicas =
        new Set(
            historias
                .map(
                    historia =>
                        historia.id_mascota
                )
                .filter(Boolean)
        );

    totalMascotas.textContent =
        mascotasUnicas.size;

    totalConsultas.textContent =
        historias.length;

}


/* ============================================================
   UTILIDADES
   ============================================================ */

function buscarMascota(id) {

    return mascotas.find(
        mascota =>
            String(
                mascota.id_mascota ??
                mascota.id ??
                mascota.ID
            ) === String(id)
    );

}


function buscarUsuario(id) {

    return usuarios.find(
        usuario =>
            String(
                usuario.id_usuario ??
                usuario.id ??
                usuario.ID
            ) === String(id)
    );

}


function obtenerNombreMascota(mascota) {

    if (!mascota) {
        return "Sin información";
    }

    return (
        mascota.nombre ||
        mascota.nombre_mascota ||
        `Mascota #${
            mascota.id_mascota ??
            mascota.id ??
            ""
        }`
    );

}


function obtenerNombreUsuario(usuario) {

    if (!usuario) {
        return "Sin información";
    }

    if (usuario.nombre_completo) {
        return usuario.nombre_completo;
    }

    const nombre =
        usuario.nombre || "";

    const apellido =
        usuario.apellido || "";

    const completo =
        `${nombre} ${apellido}`
            .replace(/\s+/g, " ")
            .trim();

    if (completo) {
        return completo;
    }

    if (usuario.usuario) {
        return usuario.usuario;
    }

    return `Veterinario #${
        usuario.id_usuario ??
        usuario.id ??
        ""
    }`;

}


function obtenerFecha(fechaValor) {

    if (!fechaValor) {
        return "";
    }

    return String(
        fechaValor
    ).substring(0, 10);

}


function formatearFecha(fechaValor) {

    const fechaISO =
        obtenerFecha(
            fechaValor
        );

    if (!fechaISO) {
        return "--";
    }

    const partes =
        fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `
        ${partes[2]}/
        ${partes[1]}/
        ${partes[0]}
    `.replace(/\s+/g, "");

}


function establecerFechaActual() {

    if (!fecha) {
        return;
    }

    if (!idHistoria.value) {

        fecha.value =
            new Date()
                .toISOString()
                .substring(0, 10);

    }

}


function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function bloquearFormulario(bloquear) {

    btnGuardar.disabled =
        bloquear;

    btnCancelar.disabled =
        bloquear;

    btnLimpiar.disabled =
        bloquear;

}


function mostrarEstadoTabla(
    mensaje,
    error = false
) {

    tablaHistorias.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="${error ? "error-tabla" : "cargando"}"
            >
                ${escaparHTML(mensaje)}
            </td>
        </tr>
    `;

}
