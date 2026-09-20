const API = "http://localhost:3001/api";

const form = document.getElementById("form-historia");

const idHistoria =
    document.getElementById("id_historia");

const idMascota =
    document.getElementById("id_mascota");

const idUsuario =
    document.getElementById("id_usuario");

const fecha =
    document.getElementById("fecha");

const motivo =
    document.getElementById("motivo_consulta");

const diagnostico =
    document.getElementById("diagnostico");

const tratamiento =
    document.getElementById("tratamiento");

const observaciones =
    document.getElementById("observaciones");

const tabla =
    document.getElementById("tabla-historias");

const buscar =
    document.getElementById("buscar-historia");

const filtroFecha =
    document.getElementById("filtro-fecha");

const filtroMascota =
    document.getElementById("filtro-mascota");

const modal =
    document.getElementById("modal-detalle");

let historias = [];
let mascotas = [];
let usuarios = [];


window.addEventListener(
    "DOMContentLoaded",
    iniciar
);


async function iniciar() {

    fecha.max = hoy();

    try {

        await Promise.all([
            cargarMascotas(),
            cargarUsuarios()
        ]);

        await cargarHistorias();

        configurarEventos();

    } catch (error) {

        console.error(error);

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="vacio">
                    ${esc(error.message)}
                </td>
            </tr>
        `;
    }
}


function configurarEventos() {

    buscar.addEventListener(
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


    document
        .getElementById("btn-limpiar-filtros")
        .addEventListener(
            "click",
            limpiarFiltros
        );


    document
        .getElementById("btn-actualizar")
        .addEventListener(
            "click",
            cargarHistorias
        );


    document
        .getElementById("btn-cancelar")
        .addEventListener(
            "click",
            cancelarEdicion
        );


    document
        .getElementById("btn-limpiar")
        .addEventListener(
            "click",
            () => {

                setTimeout(
                    resetFormulario,
                    0
                );

            }
        );


    form.addEventListener(
        "submit",
        guardarHistoria
    );


    document
        .getElementById("btn-cerrar-modal")
        .addEventListener(
            "click",
            cerrarModal
        );


    document
        .getElementById("btn-cerrar-modal-footer")
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

    const respuesta =
        await fetch(
            `${API}/mascotas`
        );


    if (!respuesta.ok) {

        throw new Error(
            "No se pudieron cargar las mascotas."
        );
    }


    mascotas =
        await respuesta.json();


    idMascota.innerHTML =
        `
        <option value="">
            Seleccione una mascota
        </option>
        `;


    filtroMascota.innerHTML =
        `
        <option value="">
            Todas las mascotas
        </option>
        `;


    mascotas.forEach(
        mascota => {

            idMascota.insertAdjacentHTML(
                "beforeend",
                `
                <option
                    value="${mascota.id_mascota}">
                    ${esc(mascota.nombre)}
                </option>
                `
            );


            filtroMascota.insertAdjacentHTML(
                "beforeend",
                `
                <option
                    value="${mascota.id_mascota}">
                    ${esc(mascota.nombre)}
                </option>
                `
            );

        }
    );
}


async function cargarUsuarios() {

    const respuesta =
        await fetch(
            `${API}/usuarios`
        );


    if (!respuesta.ok) {

        throw new Error(
            "No se pudieron cargar los veterinarios."
        );
    }


    usuarios =
        await respuesta.json();


    idUsuario.innerHTML =
        `
        <option value="">
            Seleccione un veterinario
        </option>
        `;


    usuarios.forEach(
        usuario => {

            const nombre =
                `${usuario.nombre || ""}
                 ${usuario.apellido || ""}`
                    .trim()
                ||
                usuario.correo
                ||
                `Usuario #${usuario.id_usuario}`;


            idUsuario.insertAdjacentHTML(
                "beforeend",
                `
                <option
                    value="${usuario.id_usuario}">
                    ${esc(nombre)}
                </option>
                `
            );

        }
    );
}


async function cargarHistorias() {

    tabla.innerHTML =
        `
        <tr>
            <td
                colspan="7"
                class="cargando">
                Cargando historias clínicas...
            </td>
        </tr>
        `;


    try {

        const respuesta =
            await fetch(
                `${API}/historias-clinicas`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las historias clínicas."
            );
        }


        historias =
            await respuesta.json();


        actualizarResumen();

        aplicarFiltros();

    } catch (error) {

        console.error(error);

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    class="vacio">
                    ${esc(error.message)}
                </td>
            </tr>
            `;
    }
}


function aplicarFiltros() {

    const texto =
        buscar.value
            .trim()
            .toLowerCase();

    const fechaSeleccionada =
        filtroFecha.value;

    const mascotaSeleccionada =
        filtroMascota.value;


    const resultados =
        historias.filter(
            historia => {

                const contenido =
                    `
                    ${historia.mascota || ""}
                    ${historia.veterinario || ""}
                    ${historia.motivo_consulta || ""}
                    ${historia.diagnostico || ""}
                    ${historia.tratamiento || ""}
                    ${historia.observaciones || ""}
                    `
                    .toLowerCase();


                const coincideTexto =
                    !texto ||
                    contenido.includes(
                        texto
                    );


                const coincideFecha =
                    !fechaSeleccionada ||
                    fechaDB(
                        historia.fecha
                    ) ===
                    fechaSeleccionada;


                const coincideMascota =
                    !mascotaSeleccionada ||
                    String(
                        historia.id_mascota
                    ) ===
                    String(
                        mascotaSeleccionada
                    );


                return (
                    coincideTexto &&
                    coincideFecha &&
                    coincideMascota
                );

            }
        );


    if (!resultados.length) {

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    class="vacio">
                    No se encontraron historias clínicas.
                </td>
            </tr>
            `;

        return;
    }


    tabla.innerHTML =
        resultados
            .map(construirFila)
            .join("");


    tabla
        .querySelectorAll("[data-accion]")
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                boton.dataset.id
                            );


                        if (
                            boton.dataset.accion ===
                            "detalle"
                        ) {
                            verDetalle(id);
                        }


                        if (
                            boton.dataset.accion ===
                            "editar"
                        ) {
                            editarHistoria(id);
                        }


                        if (
                            boton.dataset.accion ===
                            "eliminar"
                        ) {
                            eliminarHistoria(id);
                        }

                    }
                );

            }
        );
}


function construirFila(historia) {

    return `
        <tr>

            <td>
                ${historia.id_historia}
            </td>

            <td>
                ${formatearFecha(
                    historia.fecha
                )}
            </td>

            <td>
                <strong>
                    ${esc(
                        historia.mascota ||
                        "Sin nombre"
                    )}
                </strong>
            </td>

            <td>
                ${esc(
                    historia.motivo_consulta ||
                    "Sin registrar"
                )}
            </td>

            <td>
                ${esc(
                    historia.diagnostico ||
                    "Sin registrar"
                )}
            </td>

            <td>
                ${esc(
                    historia.veterinario ||
                    "Sin asignar"
                )}
            </td>

            <td class="acciones">

                <button
                    type="button"
                    class="btn-accion btn-detalle"
                    data-accion="detalle"
                    data-id="${historia.id_historia}"
                    title="Ver detalle">
                    👁️
                </button>

                <button
                    type="button"
                    class="btn-accion btn-editar"
                    data-accion="editar"
                    data-id="${historia.id_historia}"
                    title="Editar">
                    ✏️
                </button>

                <button
                    type="button"
                    class="btn-accion btn-eliminar"
                    data-accion="eliminar"
                    data-id="${historia.id_historia}"
                    title="Eliminar">
                    🗑️
                </button>

            </td>

        </tr>
    `;
}


async function guardarHistoria(event) {

    event.preventDefault();


    if (
        !idMascota.value ||
        !idUsuario.value ||
        !fecha.value ||
        !motivo.value.trim()
    ) {

        alert(
            "Complete los campos obligatorios."
        );

        return;
    }


    const datos = {

        fecha:
            `${fecha.value} 00:00:00`,

        motivo_consulta:
            motivo.value.trim(),

        diagnostico:
            diagnostico.value.trim()
            || null,

        tratamiento:
            tratamiento.value.trim()
            || null,

        observaciones:
            observaciones.value.trim()
            || null,

        id_mascota:
            Number(
                idMascota.value
            ),

        id_usuario:
            Number(
                idUsuario.value
            )

    };


    const id =
        idHistoria.value;


    const boton =
        document.getElementById(
            "btn-guardar"
        );


    boton.disabled = true;


    boton.textContent =
        id
            ? "⏳ Actualizando..."
            : "⏳ Registrando...";


    try {

        const respuesta =
            await fetch(
                id
                    ? `${API}/historias-clinicas/${id}`
                    : `${API}/historias-clinicas`,
                {

                    method:
                        id
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            datos
                        )
                }
            );


        const resultado =
            await respuesta
                .json()
                .catch(() => ({}));


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No fue posible guardar la historia clínica."
            );
        }


        alert(
            resultado.mensaje ||
            "Operación realizada correctamente."
        );


        resetFormulario();

        await cargarHistorias();

    } catch (error) {

        alert(
            error.message
        );

    } finally {

        boton.disabled = false;

        boton.textContent =
            "💾 Registrar historia";
    }
}


function editarHistoria(id) {

    const historia =
        historias.find(
            item =>
                Number(
                    item.id_historia
                ) ===
                Number(id)
        );


    if (!historia) return;


    idHistoria.value =
        historia.id_historia;

    idMascota.value =
        historia.id_mascota;

    idUsuario.value =
        historia.id_usuario;

    fecha.value =
        fechaDB(
            historia.fecha
        );

    motivo.value =
        historia.motivo_consulta ||
        "";

    diagnostico.value =
        historia.diagnostico ||
        "";

    tratamiento.value =
        historia.tratamiento ||
        "";

    observaciones.value =
        historia.observaciones ||
        "";


    document
        .getElementById(
            "titulo-formulario"
        )
        .textContent =
        "Editar historia clínica";


    document
        .getElementById(
            "btn-guardar"
        )
        .textContent =
        "💾 Guardar cambios";


    document
        .getElementById(
            "btn-cancelar"
        )
        .style.display =
        "inline-flex";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function eliminarHistoria(id) {

    const historia =
        historias.find(
            item =>
                Number(
                    item.id_historia
                ) ===
                Number(id)
        );


    if (!historia) return;


    const confirmar =
        confirm(
            `¿Desea eliminar la historia clínica de ${
                historia.mascota ||
                "la mascota"
            }?`
        );


    if (!confirmar) return;


    try {

        const respuesta =
            await fetch(
                `${API}/historias-clinicas/${id}`,
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
                "No fue posible eliminar la historia clínica."
            );
        }


        alert(
            resultado.mensaje ||
            "Historia clínica eliminada correctamente."
        );


        await cargarHistorias();

    } catch (error) {

        alert(
            error.message
        );
    }
}


function verDetalle(id) {

    const historia =
        historias.find(
            item =>
                Number(
                    item.id_historia
                ) ===
                Number(id)
        );


    if (!historia) return;


    document.getElementById(
        "detalle-mascota"
    ).textContent =
        historia.mascota ||
        "-";


    document.getElementById(
        "detalle-veterinario"
    ).textContent =
        historia.veterinario ||
        "-";


    document.getElementById(
        "detalle-fecha"
    ).textContent =
        formatearFecha(
            historia.fecha
        );


    document.getElementById(
        "detalle-motivo"
    ).textContent =
        historia.motivo_consulta ||
        "-";


    document.getElementById(
        "detalle-diagnostico"
    ).textContent =
        historia.diagnostico ||
        "Sin registrar";


    document.getElementById(
        "detalle-tratamiento"
    ).textContent =
        historia.tratamiento ||
        "Sin registrar";


    document.getElementById(
        "detalle-observaciones"
    ).textContent =
        historia.observaciones ||
        "Sin observaciones";


    modal.classList.remove(
        "hidden"
    );
}


function cerrarModal() {

    modal.classList.add(
        "hidden"
    );
}


function cancelarEdicion() {

    resetFormulario();
}


function resetFormulario() {

    form.reset();

    idHistoria.value = "";

    fecha.max = hoy();


    document
        .getElementById(
            "titulo-formulario"
        )
        .textContent =
        "Registrar historia clínica";


    document
        .getElementById(
            "btn-guardar"
        )
        .textContent =
        "💾 Registrar historia";


    document
        .getElementById(
            "btn-cancelar"
        )
        .style.display =
        "none";
}


function limpiarFiltros() {

    buscar.value = "";

    filtroFecha.value = "";

    filtroMascota.value = "";

    aplicarFiltros();
}


function actualizarResumen() {

    document.getElementById(
        "total-historias"
    ).textContent =
        historias.length;


    document.getElementById(
        "total-mascotas"
    ).textContent =
        new Set(
            historias.map(
                historia =>
                    historia.id_mascota
            )
        ).size;


    document.getElementById(
        "total-consultas"
    ).textContent =
        historias.length;
}


function fechaDB(valor) {

    if (!valor) return "";

    return String(valor)
        .replace("T", " ")
        .substring(0, 10);
}


function formatearFecha(valor) {

    const fechaTexto =
        fechaDB(valor);


    if (!fechaTexto) return "-";


    const partes =
        fechaTexto.split("-");


    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}


function hoy() {

    return new Date()
        .toISOString()
        .slice(0, 10);
}


function esc(valor) {

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


window.verDetalle =
    verDetalle;

window.editarHistoria =
    editarHistoria;

window.eliminarHistoria =
    eliminarHistoria;
