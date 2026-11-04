/* ================================================= */
/* 1. CONFIGURACIÓN INICIAL Y REFERENCIAS DEL DOM    */
/* ================================================= */

// कांfiigirashinii API fi elementoota fuula wajjin wal qunnamsiisuu
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

// Gabaabsii elementii argachuuf tajaajilu (Helper function)
const $ = id => document.getElementById(id);


/* ================================================= */
/* 2. INICIALIZACIÓN Y CARGA DE DATOS ASÍNCRONOS     */
/* ================================================= */

// Yeroo fuulli fe’amu jalqaba hojjetamu
window.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
    // Guyyaa har'aa irraa eegalee qofa akka filatamu taasisuu
    fechaInput.min = hoy();

    // Odeeffannoo bineensotaa fi ogeeyyii wal faana fe'uu
    await Promise.all([
        cargarMascotas(),
        cargarUsuarios()
    ]);

    // Cuuluu (Citas) hunda fe'uu
    await cargarCitas();

    // Qabiyyee ta'ii (Event Listeners) qindeessuu
    configurarEventos();
}


/* ================================================= */
/* 3. CONFIGURACIÓN DE EVENTOS DE LA INTERFAZ        */
/* ================================================= */

function configurarEventos() {
    // Buttons fi filannoowwan garagaraaf hojii kennuu
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


/* ================================================= */
/* 4. CONSUMO DE API (CARGAR MASCOTAS Y USUARIOS)    */
/* ================================================= */

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


/* ================================================= */
/* 5. GESTIÓN Y RENDERIZADO DE CITAS                 */
