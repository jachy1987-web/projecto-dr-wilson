const API = "http://localhost:3001/api";

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


const form =
    document.getElementById(
        "formularioVacunacion"
    );

const idVacunacion =
    document.getElementById(
        "id_vacunacion"
    );

const mascotaSelect =
    document.getElementById(
        "mascota"
    );

const vacunaSelect =
    document.getElementById(
        "vacuna"
    );

const fechaAplicacion =
    document.getElementById(
        "fechaAplicacion"
    );

const proximaDosis =
    document.getElementById(
        "proximaDosis"
    );

const observaciones =
    document.getElementById(
        "observaciones"
    );

const tabla =
    document.getElementById(
        "cuerpoVacunaciones"
    );

const mensaje =
    document.getElementById(
        "mensajeFormulario"
    );

const modal =
    document.getElementById(
        "modalDetalle"
    );

let vacunaciones = [];


async function iniciar() {

    fechaAplicacion.max =
        hoy();


    try {

        await Promise.all([
            cargarMascotas(),
            cargarVacunas()
        ]);


        await cargarVacunaciones();


        configurarEventos();


        actualizarContador();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


function configurarEventos() {

    form.addEventListener(
        "submit",
        guardar
    );


    document
        .getElementById(
            "btnCancelar"
        )
        .addEventListener(
            "click",
            limpiarFormulario
        );


    document
        .getElementById(
            "btnLimpiar"
        )
        .addEventListener(
            "click",
            limpiarFormulario
        );


    document
        .getElementById(
            "btnActualizar"
        )
        .addEventListener(
            "click",
            cargarVacunaciones
        );


    document
        .getElementById(
            "buscarVacunacion"
        )
        .addEventListener(
            "input",
            aplicarFiltros
        );


    document
        .getElementById(
            "filtroEstado"
        )
        .addEventListener(
            "change",
            aplicarFiltros
        );


    document
        .getElementById(
            "btnLimpiarFiltros"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "buscarVacunacion"
                    )
                    .value = "";


                document
                    .getElementById(
                        "filtroEstado"
                    )
                    .value =
                    "todos";


                aplicarFiltros();
            }
        );


    observaciones.addEventListener(
        "input",
        actualizarContador
    );


    document
        .getElementById(
            "btnCerrarModal"
        )
        .addEventListener(
            "click",
            cerrarModal
        );


    document
        .getElementById(
            "btnCerrarModalFooter"
        )
        .addEventListener(
            "click",
            cerrarModal
        );


    modal
        .querySelector(
            ".modal-overlay"
        )
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


    const mascotas =
        await respuesta.json();


    mascotaSelect.innerHTML =
        `
        <option value="">
            Seleccione una mascota
        </option>
        `;


    mascotas.forEach(
        mascota => {

            mascotaSelect.insertAdjacentHTML(
                "beforeend",
                `
                <option
                    value="${mascota.id_mascota}">
                    ${esc(
                        mascota.nombre
                    )}
                </option>
                `
            );

        }
    );
}


async function cargarVacunas() {

    const respuesta =
        await fetch(
            `${API}/vacunas`
        );


    if (!respuesta.ok) {

        throw new Error(
            "No se pudieron cargar las vacunas."
        );
    }


    const vacunas =
        await respuesta.json();


    vacunaSelect.innerHTML =
        `
        <option value="">
            Seleccione una vacuna
        </option>
        `;


    vacunas.forEach(
        vacuna => {

            vacunaSelect.insertAdjacentHTML(
                "beforeend",
                `
                <option
                    value="${vacuna.id_vacuna}">
                    ${esc(vacuna.nombre)}
                    ${
                        vacuna.dosis
                            ? ` - ${esc(
                                vacuna.dosis
                            )}`
                            : ""
                    }
                </option>
                `
            );

        }
    );
}


async function cargarVacunaciones() {

    tabla.innerHTML =
        `
        <tr>
            <td
                colspan="7"
                class="cargando">
                Cargando registros...
            </td>
        </tr>
        `;


    try {

        const respuesta =
            await fetch(
                `${API}/vacunaciones`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron consultar las vacunaciones."
            );
        }


        vacunaciones =
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
                    class="error-tabla">
                    ${esc(error.message)}
                </td>
            </tr>
            `;
    }
}


function aplicarFiltros() {

    const texto =
        document
            .getElementById(
                "buscarVacunacion"
            )
            .value
            .trim()
            .toLowerCase();


    const estado =
        document
            .getElementById(
                "filtroEstado"
            )
            .value;


    const resultados =
        vacunaciones.filter(
            registro => {

                const contenido =
                    `
                    ${registro.mascota || ""}
                    ${registro.vacuna || ""}
                    ${registro.observaciones || ""}
                    ${fechaTexto(
                        registro.fecha_aplicacion
                    )}
                    ${fechaTexto(
                        registro.proxima_dosis
                    )}
                    `
                    .toLowerCase();


                const coincideTexto =
                    !texto ||
                    contenido.includes(
                        texto
                    );


                const coincideEstado =
                    estado === "todos" ||
                    estadoDosis(
                        registro
                    ) === estado;


                return (
                    coincideTexto &&
                    coincideEstado
                );
            }
        );


    mostrarVacunaciones(
        resultados
    );


    document
        .getElementById(
            "resultadoFiltro"
        )
        .textContent =
        `Mostrando ${
            resultados.length
        } de ${
            vacunaciones.length
        } registro(s).`;
}


function mostrarVacunaciones(
    lista
) {

    if (!lista.length) {

        tabla.innerHTML =
            `
            <tr>
                <td
                    colspan="7"
                    class="vacio">
                    💉 No se encontraron
                    vacunaciones con los filtros
                    seleccionados.
                </td>
            </tr>
            `;

        return;
    }


    tabla.innerHTML =
        lista.map(
            (registro, indice) => {

                const estado =
                    estadoDosis(
                        registro
                    );


                const estadoTexto =
                    estado === "vencida"
                        ? "Vencida"
                        :
                        estado === "pendiente"
                            ? "Próxima"
                            :
                            "Sin programación";


                return `
                    <tr>

                        <td>
                            <span class="numero">
                                ${indice + 1}
                            </span>
                        </td>

                        <td>
                            <strong>
                                ${esc(
                                    registro.mascota ||
                                    "Sin nombre"
                                )}
                            </strong>
                        </td>

                        <td>
                            <span class="vacuna-nombre">
                                💉
                                ${esc(
                                    registro.vacuna ||
                                    "Sin vacuna"
                                )}
                            </span>
                        </td>

                        <td>
                            ${formatearFecha(
                                registro.fecha_aplicacion
                            )}
                        </td>

                        <td>

                            ${
                                registro.proxima_dosis
                                    ? formatearFecha(
                                        registro.proxima_dosis
                                    )
                                    : "No programada"
                            }

                            <br>

                            <span
                                class="estado-dosis
                                ${estado}">
                                ${estadoTexto}
                            </span>

                        </td>

                        <td>

                            <span
                                class="observacion-tabla"
                                title="${esc(
                                    registro.observaciones ||
                                    "Sin observaciones"
                                )}">

                                ${esc(
                                    registro.observaciones ||
                                    "Sin observaciones"
                                )}

                            </span>

                        </td>

                        <td>

                            <div class="acciones">

                                <button
                                    type="button"
                                    class="btn-accion btn-detalle"
                                    data-id="${registro.id_vacunacion}">
                                    👁️
                                </button>

                                <button
                                    type="button"
                                    class="btn-accion btn-editar"
                                    data-id="${registro.id_vacunacion}">
                                    ✏️
                                </button>

                                <button
                                    type="button"
                                    class="btn-accion btn-eliminar"
                                    data-id="${registro.id_vacunacion}">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        )
        .join("");


    tabla
        .querySelectorAll(
            ".btn-detalle"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        mostrarDetalle(
                            boton.dataset.id
                        )
                );

            }
        );


    tabla
        .querySelectorAll(
            ".btn-editar"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        editarVacunacion(
                            boton.dataset.id
                        )
                );

            }
        );


    tabla
        .querySelectorAll(
            ".btn-eliminar"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        eliminarVacunacion(
                            boton.dataset.id
                        )
                );

            }
        );
}


async function guardar(event) {

    event.preventDefault();


    if (!validarFormulario()) {
        return;
    }


    const datos = {

        id_mascota:
            Number(
                mascotaSelect.value
            ),

        id_vacuna:
            Number(
                vacunaSelect.value
            ),

        fecha_aplicacion:
            fechaAplicacion.value,

        proxima_dosis:
            proximaDosis.value ||
            null,

        observaciones:
            observaciones.value.trim()
            || null

    };


    const editando =
        Boolean(
            idVacunacion.value
        );


    const boton =
        document.getElementById(
            "btnGuardar"
        );


    boton.disabled = true;

    boton.textContent =
        editando
            ? "⏳ Guardando cambios..."
            : "⏳ Registrando...";


    try {

        const respuesta =
            await fetch(
                editando
                    ? `${API}/vacunaciones/${idVacunacion.value}`
                    : `${API}/vacunaciones`,
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
                "No fue posible guardar la vacunación."
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            "Operación realizada correctamente.",
            "exito"
        );


        limpiarFormulario();

        await cargarVacunaciones();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

    } finally {

        boton.disabled = false;

    }
}


function validarFormulario() {

    if (
        !mascotaSelect.value ||
        !vacunaSelect.value ||
        !fechaAplicacion.value
    ) {

        mostrarMensaje(
            "Complete los campos obligatorios.",
            "error"
        );

        return false;
    }


    if (
        fechaAplicacion.value >
        hoy()
    ) {

        mostrarMensaje(
            "La fecha de aplicación no puede ser posterior a hoy.",
            "error"
        );

        return false;
    }


    if (
        proximaDosis.value &&
        proximaDosis.value <
        fechaAplicacion.value
    ) {

        mostrarMensaje(
            "La próxima dosis no puede ser anterior a la fecha de aplicación.",
            "error"
        );

        return false;
    }


    const duplicado =
        vacunaciones.some(
            registro =>

                String(
                    registro.id_mascota
                ) ===
                mascotaSelect.value

                &&

                String(
                    registro.id_vacuna
                ) ===
                vacunaSelect.value

                &&

                fechaTexto(
                    registro.fecha_aplicacion
                ) ===
                fechaAplicacion.value

                &&

                String(
                    registro.id_vacunacion
                ) !==
                String(
                    idVacunacion.value ||
                    ""
                )
        );


    if (duplicado) {

        mostrarMensaje(
            "Ya existe una vacunación para esta mascota, vacuna y fecha.",
            "error"
        );

        return false;
    }


    return true;
}


async function editarVacunacion(
    id
) {

    try {

        const respuesta =
            await fetch(
                `${API}/vacunaciones/${id}`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se encontró la vacunación."
            );
        }


        const vacunacion =
            await respuesta.json();


        idVacunacion.value =
            vacunacion.id_vacunacion;

        mascotaSelect.value =
            vacunacion.id_mascota;

        vacunaSelect.value =
            vacunacion.id_vacuna;

        fechaAplicacion.value =
            fechaTexto(
                vacunacion.fecha_aplicacion
            );

        proximaDosis.value =
            fechaTexto(
                vacunacion.proxima_dosis
            );

        observaciones.value =
            vacunacion.observaciones ||
            "";


        actualizarContador();


        document
            .getElementById(
                "titulo-formulario"
            )
            .textContent =
            "Editar vacunación";


        document
            .getElementById(
                "btnGuardar"
            )
            .textContent =
            "💾 Guardar cambios";


        document
            .getElementById(
                "btnCancelar"
            )
            .hidden =
            false;


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


async function eliminarVacunacion(
    id
) {

    const registro =
        vacunaciones.find(
            item =>
                String(
                    item.id_vacunacion
                ) ===
                String(id)
        );


    if (!registro) return;


    const confirmar =
        confirm(
            `¿Desea eliminar la vacunación?

Mascota: ${
    registro.mascota
}

Vacuna: ${
    registro.vacuna
}

Fecha: ${
    formatearFecha(
        registro.fecha_aplicacion
    )
}

Esta acción no se puede deshacer.`
        );


    if (!confirmar) return;


    try {

        const respuesta =
            await fetch(
                `${API}/vacunaciones/${id}`,
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
                "No fue posible eliminar el registro."
            );
        }


        mostrarMensaje(
            resultado.mensaje ||
            "Vacunación eliminada correctamente.",
            "exito"
        );


        await cargarVacunaciones();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}


function mostrarDetalle(id) {

    const registro =
        vacunaciones.find(
            item =>
                String(
                    item.id_vacunacion
                ) ===
                String(id)
        );


    if (!registro) return;


    document.getElementById(
        "detalleMascota"
    ).textContent =
        registro.mascota ||
        "—";


    document.getElementById(
        "detalleVacuna"
    ).textContent =
        registro.vacuna ||
        "—";


    document.getElementById(
        "detalleAplicacion"
    ).textContent =
        formatearFecha(
            registro.fecha_aplicacion
        );


    document.getElementById(
        "detalleProxima"
    ).textContent =
        registro.proxima_dosis
            ? formatearFecha(
                registro.proxima_dosis
            )
            : "No programada";


    document.getElementById(
        "detalleObservaciones"
    ).textContent =
        registro.observaciones ||
        "Sin observaciones";


    modal.hidden =
        false;
}


function cerrarModal() {

    modal.hidden =
        true;
}


function limpiarFormulario() {

    form.reset();

    idVacunacion.value = "";

    fechaAplicacion.max =
        hoy();


    document
        .getElementById(
            "titulo-formulario"
        )
        .textContent =
        "Registrar vacunación";


    document
        .getElementById(
            "btnGuardar"
        )
        .textContent =
        "💾 Registrar vacunación";


    document
        .getElementById(
            "btnCancelar"
        )
        .hidden =
        true;


    actualizarContador();
}


function estadoDosis(
    registro
) {

    if (
        !registro.proxima_dosis
    ) {
        return "sin";
    }


    return fechaTexto(
        registro.proxima_dosis
    ) < hoy()

        ? "vencida"

        : "pendiente";
}


function actualizarResumen() {

    document.getElementById(
        "totalVacunaciones"
    ).textContent =
        vacunaciones.length;


    document.getElementById(
        "mascotasVacunadas"
    ).textContent =
        new Set(
            vacunaciones.map(
                registro =>
                    registro.id_mascota
            )
        ).size;


    document.getElementById(
        "proximasDosis"
    ).textContent =
        vacunaciones.filter(
            registro =>
                estadoDosis(
                    registro
                ) === "pendiente"
        ).length;


    document.getElementById(
        "dosisVencidas"
    ).textContent =
        vacunaciones.filter(
            registro =>
                estadoDosis(
                    registro
                ) === "vencida"
        ).length;
}


function actualizarContador() {

    document.getElementById(
        "contadorObservaciones"
    ).textContent =
        observaciones.value.length;
}


function mostrarMensaje(
    texto,
    tipo
) {

    mensaje.textContent =
        texto;

    mensaje.className =
        `mensaje-formulario ${tipo}`;
}


function fechaTexto(valor) {

    if (!valor) return "";

    return String(valor)
        .replace("T", " ")
        .substring(0, 10);
}


function formatearFecha(valor) {

    const fecha =
        fechaTexto(valor);


    if (!fecha) return "—";


    const partes =
        fecha.split("-");


    return `
        ${partes[2]}/
        ${partes[1]}/
        ${partes[0]}
    `;
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
