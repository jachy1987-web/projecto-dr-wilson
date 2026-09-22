const API = window.DOCTOR_WILSON_API;

const form = document.getElementById("form-cita");
const formulario = document.getElementById("formulario-cita");
const tabla = document.getElementById("tabla-citas");

const mascotaSelect = document.getElementById("mascota_id");
const usuarioSelect = document.getElementById("veterinario_id");

const idInput = document.getElementById("cita-id");
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const motivoInput = document.getElementById("motivo");
const observacionesInput = document.getElementById("observaciones");
const estadoInput = document.getElementById("estado");

const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtro-estado");
const filtroFecha = document.getElementById("filtro-fecha");

const mensajeTabla = document.getElementById("mensaje-tabla");
const modal = document.getElementById("modal-detalle");

let citas = [];
let mascotas = [];
let usuarios = [];

const $ = id => document.getElementById(id);


window.addEventListener("DOMContentLoaded", iniciar);


async function iniciar() {

    fechaInput.min = hoy();

    await Promise.all([
        cargarMascotas(),
        cargarUsuarios()
    ]);

    await cargarCitas();

    configurarEventos();
}


function configurarEventos() {

    $("btn-nueva-cita")
        .addEventListener("click", abrirFormulario);

    $("btn-cancelar-form")
        .addEventListener("click", cerrarFormulario);

    form.addEventListener("submit", guardarCita);

    buscador.addEventListener("input", aplicarFiltros);

    filtroEstado.addEventListener(
        "change",
        aplicarFiltros
    );

    filtroFecha.addEventListener(
        "change",
        aplicarFiltros
    );

    $("btn-limpiar-filtros")
        .addEventListener(
            "click",
            limpiarFiltros
        );

    $("btn-cerrar-modal")
        .addEventListener(
            "click",
            cerrarModal
        );

    $("btn-cerrar-modal-footer")
        .addEventListener(
            "click",
            cerrarModal
        );

    modal
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            cerrarModal
        );
}


async function cargarMascotas() {

    try {

        const respuesta =
            await fetch(`${API}/mascotas`);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar las mascotas."
            );
        }

        mascotas =
            await respuesta.json();

        mascotaSelect.innerHTML =
            `<option value="">
                Seleccionar mascota
            </option>`;

        mascotas.forEach(mascota => {

            mascotaSelect.insertAdjacentHTML(
                "beforeend",
                `
                <option value="${mascota.id_mascota}">
                    ${escapeHtml(mascota.nombre)}
                    ${mascota.raza
                        ? ` - ${escapeHtml(mascota.raza)}`
                        : ""}
                </option>
                `
            );

        });

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


async function cargarUsuarios() {

    try {

        const respuesta =
            await fetch(`${API}/usuarios`);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los veterinarios."
            );
        }

        usuarios =
            await respuesta.json();

        usuarioSelect.innerHTML =
            `<option value="">
                Seleccionar veterinario
            </option>`;

        usuarios.forEach(usuario => {

            const nombre =
                `${usuario.nombre || ""}
                 ${usuario.apellido || ""}`
                    .trim()
                || usuario.correo
                || `Usuario #${usuario.id_usuario}`;

            usuarioSelect.insertAdjacentHTML(
                "beforeend",
                `
                <option value="${usuario.id_usuario}">
                    ${escapeHtml(nombre)}
                </option>
                `
            );

        });

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


async function cargarCitas() {

    try {

        const respuesta =
            await fetch(`${API}/citas`);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar las citas."
            );
        }

        citas =
            await respuesta.json();

        actualizarResumen();

        aplicarFiltros();

    } catch (error) {

        console.error(error);

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No fue posible cargar las citas.
                    Verifique que el servidor esté funcionando.
                </td>
            </tr>
        `;
    }
}


function mostrarCitas(lista) {

    if (!lista.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No se encontraron citas.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        lista.map(cita => {

            const fechaHora =
                separarFechaHora(
                    cita.fecha_hora
                );

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                cita.mascota ||
                                "Sin nombre"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            cita.veterinario ||
                            "Sin asignar"
                        )}
                    </td>

                    <td>
                        ${formatearFecha(
                            fechaHora.fecha
                        )}
                    </td>

                    <td>
                        ${fechaHora.hora || "-"}
                    </td>

                    <td>
                        ${escapeHtml(
                            cita.motivo || "-"
                        )}
                    </td>

                    <td>
                        <span
                            class="status-badge
                            ${claseEstado(cita.estado)}">
                            ${escapeHtml(
                                cita.estado
                            )}
                        </span>
                    </td>

                    <td class="actions-cell">

                        <button
                            class="btn-action btn-detail"
                            data-action="detalle"
                            data-id="${cita.id_cita}"
                            title="Ver detalle">
                            👁
                        </button>

                        <button
                            class="btn-action btn-edit"
                            data-action="editar"
                            data-id="${cita.id_cita}"
                            title="Editar cita">
                            ✏️
                        </button>

                        <button
                            class="btn-action btn-delete"
                            data-action="eliminar"
                            data-id="${cita.id_cita}"
                            title="Eliminar cita">
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    tabla
        .querySelectorAll("[data-action]")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            boton.dataset.id
                        );

                    if (
                        boton.dataset.action ===
                        "detalle"
                    ) {
                        mostrarDetalle(id);
                    }

                    if (
                        boton.dataset.action ===
                        "editar"
                    ) {
                        editarCita(id);
                    }

                    if (
                        boton.dataset.action ===
                        "eliminar"
                    ) {
                        eliminarCita(id);
                    }

                }
            );

        });
}


async function guardarCita(event) {

    event.preventDefault();

    const datos = {

        id_mascota:
            Number(
                mascotaSelect.value
            ),

        id_usuario:
            Number(
                usuarioSelect.value
            ),

        fecha_hora:
            `${fechaInput.value}
             ${horaInput.value}:00`,

        motivo:
            motivoInput.value.trim(),

        observaciones:
            observacionesInput.value.trim()
            || null,

        estado:
            estadoInput.value

    };


    if (
        !datos.id_mascota ||
        !datos.id_usuario ||
        !fechaInput.value ||
        !horaInput.value ||
        !datos.motivo
    ) {

        mostrarMensaje(
            "Complete todos los campos obligatorios.",
            "error"
        );

        return;
    }


    try {

        const editando =
            Boolean(idInput.value);

        const respuesta =
            await fetch(
                editando
                    ? `${API}/citas/${idInput.value}`
                    : `${API}/citas`,
                {
                    method:
                        editando
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datos)
                }
            );


        const resultado =
            await respuesta
                .json()
                .catch(() => ({}));


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible guardar la cita."
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            "Cita guardada correctamente.",
            "success"
        );


        cerrarFormulario();

        await cargarCitas();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


function editarCita(id) {

    const cita =
        citas.find(
            item =>
                Number(item.id_cita) ===
                Number(id)
        );

    if (!cita) return;


    idInput.value =
        cita.id_cita;

    mascotaSelect.value =
        cita.id_mascota;

    usuarioSelect.value =
        cita.id_usuario;


    const fechaHora =
        separarFechaHora(
            cita.fecha_hora
        );


    fechaInput.value =
        fechaHora.fecha;

    horaInput.value =
        fechaHora.hora;

    motivoInput.value =
        cita.motivo || "";

    observacionesInput.value =
        cita.observaciones || "";

    estadoInput.value =
        cita.estado || "Programada";


    $("titulo-formulario")
        .textContent =
        "Editar cita";


    formulario.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function eliminarCita(id) {

    const cita =
        citas.find(
            item =>
                Number(item.id_cita) ===
                Number(id)
        );

    if (!cita) return;


    const confirmar =
        confirm(
            `¿Desea eliminar la cita de ${
                cita.mascota ||
                "la mascota"
            }?`
        );


    if (!confirmar) return;


    try {

        const respuesta =
            await fetch(
                `${API}/citas/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await respuesta
                .json()
                .catch(() => ({}));


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible eliminar la cita."
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            "Cita eliminada correctamente.",
            "success"
        );


        await cargarCitas();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


function mostrarDetalle(id) {

    const cita =
        citas.find(
            item =>
                Number(item.id_cita) ===
                Number(id)
        );

    if (!cita) return;


    const fechaHora =
        separarFechaHora(
            cita.fecha_hora
        );


    $("detalle-estado").textContent =
        cita.estado || "-";

    $("detalle-mascota").textContent =
        cita.mascota || "-";

    $("detalle-veterinario").textContent =
        cita.veterinario || "-";

    $("detalle-fecha").textContent =
        formatearFecha(
            fechaHora.fecha
        );

    $("detalle-hora").textContent =
        fechaHora.hora || "-";

    $("detalle-motivo").textContent =
        cita.motivo || "-";

    $("detalle-observaciones").textContent =
        cita.observaciones ||
        "Sin observaciones.";


    modal.classList.remove(
        "hidden"
    );
}


function cerrarModal() {

    modal.classList.add(
        "hidden"
    );
}


function abrirFormulario() {

    form.reset();

    idInput.value = "";

    estadoInput.value =
        "Programada";

    fechaInput.min =
        hoy();

    $("titulo-formulario")
        .textContent =
        "Registrar nueva cita";

    formulario.classList.remove(
        "hidden"
    );
}


function cerrarFormulario() {

    formulario.classList.add(
        "hidden"
    );

    form.reset();

    idInput.value = "";

    estadoInput.value =
        "Programada";
}


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

            const textoCita =
                `
                ${cita.mascota || ""}
                ${cita.veterinario || ""}
                ${cita.motivo || ""}
                ${cita.observaciones || ""}
                `.toLowerCase();


            const fechaCita =
                separarFechaHora(
                    cita.fecha_hora
                ).fecha;


            return (

                (!texto ||
                    textoCita.includes(texto))

                &&

                (!estado ||
                    cita.estado === estado)

                &&

                (!fecha ||
                    fechaCita === fecha)

            );

        });


    mostrarCitas(
        filtradas
    );
}


function limpiarFiltros() {

    buscador.value = "";
    filtroEstado.value = "";
    filtroFecha.value = "";

    aplicarFiltros();
}


function actualizarResumen() {

    $("total-citas").textContent =
        citas.length;

    $("citas-pendientes").textContent =
        citas.filter(
            cita =>
                cita.estado ===
                "Programada"
        ).length;

    $("citas-atendidas").textContent =
        citas.filter(
            cita =>
                cita.estado ===
                "Atendida"
        ).length;

    $("citas-canceladas").textContent =
        citas.filter(
            cita =>
                cita.estado ===
                "Cancelada"
        ).length;
}


function mostrarMensaje(
    texto,
    tipo = ""
) {

    if (!mensajeTabla) return;

    mensajeTabla.textContent =
        texto;

    mensajeTabla.className =
        `message ${tipo}`;

    clearTimeout(
        window.mensajeCita
    );

    window.mensajeCita =
        setTimeout(() => {

            mensajeTabla.textContent =
                "";

            mensajeTabla.className =
                "message hidden";

        }, 3500);
}


function claseEstado(estado) {

    return String(
        estado || ""
    ).toLowerCase();
}


function separarFechaHora(valor) {

    if (!valor) {

        return {
            fecha: "",
            hora: ""
        };
    }


    const texto =
        String(valor)
            .replace("T", " ");


    const partes =
        texto.split(" ");


    return {

        fecha:
            partes[0] || "",

        hora:
            (partes[1] || "")
                .substring(0, 5)

    };
}


function formatearFecha(valor) {

    if (!valor) return "-";

    const partes =
        valor
            .substring(0, 10)
            .split("-");


    if (partes.length !== 3) {
        return valor;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function hoy() {

    return new Date()
        .toISOString()
        .slice(0, 10);
}


function escapeHtml(valor) {

    return String(
        valor ?? ""
    ).replace(
        /[&<>'"]/g,
        caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[caracter])
    );
}

