document.addEventListener("DOMContentLoaded", () => {

    const API = "http://localhost:3001/api";

    const form =
        document.getElementById("formularioVacunacion");

    const idVacunacion =
        document.getElementById("id_vacunacion");

    const mascotaSelect =
        document.getElementById("mascota");

    const vacunaSelect =
        document.getElementById("vacuna");

    const fechaAplicacion =
        document.getElementById("fechaAplicacion");

    const proximaDosis =
        document.getElementById("proximaDosis");

    const observaciones =
        document.getElementById("observaciones");

    const cuerpoTabla =
        document.getElementById("cuerpoVacunaciones");

    const btnGuardar =
        document.getElementById("btnGuardar");

    const btnCancelar =
        document.getElementById("btnCancelar");

    const btnLimpiar =
        document.getElementById("btnLimpiar");

    const btnActualizar =
        document.getElementById("btnActualizar");

    const buscarInput =
        document.getElementById("buscarVacunacion");

    const filtroEstado =
        document.getElementById("filtroEstado");

    const btnLimpiarFiltros =
        document.getElementById("btnLimpiarFiltros");

    const resultadoFiltro =
        document.getElementById("resultadoFiltro");

    const tituloFormulario =
        document.getElementById("titulo-formulario");

    const mensajeFormulario =
        document.getElementById("mensajeFormulario");

    const contadorObservaciones =
        document.getElementById("contadorObservaciones");

    const modal =
        document.getElementById("modalDetalle");

    const btnCerrarModal =
        document.getElementById("btnCerrarModal");

    const btnCerrarModalFooter =
        document.getElementById("btnCerrarModalFooter");


    let vacunaciones = [];
    let mascotas = [];
    let vacunas = [];


    function hoyISO() {

        return new Date()
            .toISOString()
            .slice(0, 10);

    }


    cargarDatosIniciales();


    async function cargarDatosIniciales() {

        try {

            await Promise.all([
                cargarMascotas(),
                cargarVacunas(),
                cargarVacunaciones()
            ]);

        } catch (error) {

            console.error(error);

        }

    }


    // ============================
    // CARGAR MASCOTAS
    // ============================

    async function cargarMascotas() {

        const respuesta =
            await fetch(`${API}/mascotas`);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las mascotas."
            );

        }

        mascotas = await respuesta.json();

        mascotaSelect.innerHTML =
            '<option value="">Seleccione una mascota</option>';

        mascotas.forEach(mascota => {

            const opcion =
                document.createElement("option");

            opcion.value =
                mascota.id_mascota;

            opcion.textContent =
                mascota.nombre;

            mascotaSelect.appendChild(opcion);

        });

    }


    // ============================
    // CARGAR VACUNAS
    // ============================

    async function cargarVacunas() {

        const respuesta =
            await fetch(`${API}/vacunas`);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las vacunas."
            );

        }

        vacunas = await respuesta.json();

        vacunaSelect.innerHTML =
            '<option value="">Seleccione una vacuna</option>';

        vacunas.forEach(vacuna => {

            const opcion =
                document.createElement("option");

            opcion.value =
                vacuna.id_vacuna;

            opcion.textContent =
                vacuna.nombre;

            vacunaSelect.appendChild(opcion);

        });

    }


    // ============================
    // CARGAR VACUNACIONES
    // ============================

    async function cargarVacunaciones() {

        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" class="cargando">
                    Cargando vacunaciones...
                </td>
            </tr>
        `;

        try {

            const respuesta =
                await fetch(`${API}/vacunaciones`);

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

            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="7" class="error-tabla">
                        ⚠️ No fue posible cargar las vacunaciones.
                        Verifique que el servidor esté funcionando.
                    </td>
                </tr>
            `;

        }

    }


    // ============================
    // FILTROS
    // ============================

    function aplicarFiltros() {

        const texto =
            buscarInput.value
                .toLowerCase()
                .trim();

        const estado =
            filtroEstado.value;


        const resultados =
            vacunaciones.filter(registro => {

                const contenido = [

                    registro.mascota,
                    registro.vacuna,
                    registro.observaciones,
                    formatearFecha(
                        registro.fecha_aplicacion
                    ),
                    formatearFecha(
                        registro.proxima_dosis
                    )

                ]
                    .join(" ")
                    .toLowerCase();


                const coincideTexto =
                    !texto ||
                    contenido.includes(texto);


                const coincideEstado =
                    estado === "todos" ||
                    obtenerEstadoDosis(registro) === estado;


                return coincideTexto &&
                    coincideEstado;

            });


        mostrarVacunaciones(resultados);


        resultadoFiltro.textContent =
            resultados.length === vacunaciones.length
                ? `Mostrando ${resultados.length} registro(s).`
                : `Mostrando ${resultados.length} de ${vacunaciones.length} registro(s).`;

    }


    // ============================
    // MOSTRAR TABLA
    // ============================

    function mostrarVacunaciones(lista) {

        cuerpoTabla.innerHTML = "";


        if (!lista.length) {

            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="7" class="vacio">
                        💉 No se encontraron vacunaciones
                        con los filtros seleccionados.
                    </td>
                </tr>
            `;

            return;

        }


        lista.forEach((vacunacion, indice) => {

            const fila =
                document.createElement("tr");


            const estado =
                obtenerEstadoDosis(vacunacion);


            const estadoTexto =
                estado === "vencida"
                    ? "Vencida"
                    : estado === "pendiente"
                        ? "Próxima"
                        : "Sin programación";


            fila.innerHTML = `

                <td>
                    <span class="numero">
                        ${indice + 1}
                    </span>
                </td>


                <td>

                    <div class="mascota">

                        <span>🐾</span>

                        <strong>
                            ${escaparHTML(
                                vacunacion.mascota
                            )}
                        </strong>

                    </div>

                </td>


                <td>

                    <span class="vacuna-nombre">

                        💉
                        ${escaparHTML(
                            vacunacion.vacuna
                        )}

                    </span>

                </td>


                <td>
                    ${formatearFecha(
                        vacunacion.fecha_aplicacion
                    )}
                </td>


                <td>

                    ${
                        vacunacion.proxima_dosis

                        ?

                        `
                        <span
                            class="proxima-dosis ${estado}">

                            📆
                            ${formatearFecha(
                                vacunacion.proxima_dosis
                            )}

                        </span>

                        <small class="estado-dosis">
                            ${estadoTexto}
                        </small>
                        `

                        :

                        `
                        <span class="sin-dosis">
                            No programada
                        </span>
                        `
                    }

                </td>


                <td>

                    <span
                        class="observacion-tabla"
                        title="${escaparHTML(
                            vacunacion.observaciones ||
                            "Sin observaciones"
                        )}">

                        ${escaparHTML(
                            vacunacion.observaciones ||
                            "Sin observaciones"
                        )}

                    </span>

                </td>


                <td>

                    <div class="acciones">

                        <button
                            type="button"
                            class="btn-accion btn-detalle"
                            data-id="${vacunacion.id_vacunacion}"
                            title="Ver detalle">

                            👁️

                        </button>


                        <button
                            type="button"
                            class="btn-accion btn-editar"
                            data-id="${vacunacion.id_vacunacion}"
                            title="Editar">

                            ✏️

                        </button>


                        <button
                            type="button"
                            class="btn-accion btn-eliminar"
                            data-id="${vacunacion.id_vacunacion}"
                            title="Eliminar">

                            🗑️

                        </button>

                    </div>

                </td>

            `;


            cuerpoTabla.appendChild(fila);

        });


        cuerpoTabla
            .querySelectorAll(".btn-detalle")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        mostrarDetalle(
                            boton.dataset.id
                        )
                );

            });


        cuerpoTabla
            .querySelectorAll(".btn-editar")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        editarVacunacion(
                            boton.dataset.id
                        )
                );

            });


        cuerpoTabla
            .querySelectorAll(".btn-eliminar")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () =>
                        eliminarVacunacion(
                            boton.dataset.id
                        )
                );

            });

    }


    // ============================
    // ESTADO DE DOSIS
    // ============================

    function obtenerEstadoDosis(registro) {

        if (!registro.proxima_dosis) {

            return "sin";

        }


        return obtenerFechaInput(
            registro.proxima_dosis
        ) < hoyISO()

            ? "vencida"

            : "pendiente";

    }


    // ============================
    // GUARDAR
    // ============================

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            ocultarMensaje();


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

            };


            const editando =
                Boolean(idVacunacion.value);


            btnGuardar.disabled = true;

            btnGuardar.textContent =
                editando
                    ? "⏳ Guardando cambios..."
                    : "⏳ Registrando...";


            try {

                const url =
                    editando

                        ? `${API}/vacunaciones/${idVacunacion.value}`

                        : `${API}/vacunaciones`;


                const respuesta =
                    await fetch(
                        url,
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
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        resultado.error ||
                        resultado.mensaje ||
                        "No fue posible guardar el registro."
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

                console.error(error);

                mostrarMensaje(
                    error.message,
                    "error"
                );

            } finally {

                btnGuardar.disabled = false;

                btnGuardar.textContent =
                    idVacunacion.value
                        ? "💾 Guardar cambios"
                        : "💾 Registrar vacunación";

            }

        }
    );


    // ============================
    // VALIDACIONES
    // ============================

    function validarFormulario() {

        if (
            !mascotaSelect.value ||
            !vacunaSelect.value ||
            !fechaAplicacion.value
        ) {

            mostrarMensaje(
                "Complete todos los campos obligatorios.",
                "error"
            );

            return false;

        }


        if (
            fechaAplicacion.value >
            hoyISO()
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
            vacunaciones.some(registro =>

                String(registro.id_mascota) ===
                mascotaSelect.value &&

                String(registro.id_vacuna) ===
                vacunaSelect.value &&

                obtenerFechaInput(
                    registro.fecha_aplicacion
                ) ===
                fechaAplicacion.value &&

                String(
                    registro.id_vacunacion
                ) !==
                String(
                    idVacunacion.value || ""
                )

            );


        if (duplicado) {

            mostrarMensaje(
                "Ya existe un registro para esta mascota, vacuna y fecha de aplicación.",
                "error"
            );

            return false;

        }


        return true;

    }


    // ============================
    // EDITAR
    // ============================

    async function editarVacunacion(id) {

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
                obtenerFechaInput(
                    vacunacion.fecha_aplicacion
                );


            proximaDosis.value =
                obtenerFechaInput(
                    vacunacion.proxima_dosis
                );


            observaciones.value =
                vacunacion.observaciones ||
                "";


            actualizarContador();


            tituloFormulario.textContent =
                "Editar vacunación";


            btnGuardar.textContent =
                "💾 Guardar cambios";


            btnCancelar.hidden = false;


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


    // ============================
    // ELIMINAR
    // ============================

    async function eliminarVacunacion(id) {

        const registro =
            vacunaciones.find(
                item =>
                    String(
                        item.id_vacunacion
                    ) === String(id)
            );


        if (!registro) {

            return;

        }


        const confirmar =
            confirm(
                `¿Desea eliminar esta vacunación?

Mascota: ${registro.mascota}
Vacuna: ${registro.vacuna}
Fecha: ${formatearFecha(
    registro.fecha_aplicacion
)}

Esta acción no se puede deshacer.`
            );


        if (!confirmar) {

            return;

        }


        try {

            const respuesta =
                await fetch(
                    `${API}/vacunaciones/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.error ||
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


    // ============================
    // DETALLE
    // ============================

    function mostrarDetalle(id) {

        const registro =
            vacunaciones.find(
                item =>
                    String(
                        item.id_vacunacion
                    ) === String(id)
            );


        if (!registro) {

            return;

        }


        document.getElementById(
            "detalleMascota"
        ).textContent =
            registro.mascota || "—";


        document.getElementById(
            "detalleVacuna"
        ).textContent =
            registro.vacuna || "—";


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


        modal.hidden = false;

        document.body.classList.add(
            "modal-abierto"
        );

    }


    // ============================
    // CERRAR MODAL
    // ============================

    function cerrarModal() {

        modal.hidden = true;

        document.body.classList.remove(
            "modal-abierto"
        );

    }


    btnCerrarModal.addEventListener(
        "click",
        cerrarModal
    );


    btnCerrarModalFooter.addEventListener(
        "click",
        cerrarModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.dataset
                    .cerrarModal !==
                undefined
            ) {

                cerrarModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                cerrarModal();

            }

        }
    );


    // ============================
    // LIMPIAR FORMULARIO
    // ============================

    btnCancelar.addEventListener(
        "click",
        limpiarFormulario
    );


    btnLimpiar.addEventListener(
        "click",
        limpiarFormulario
    );


    function limpiarFormulario() {

        form.reset();

        idVacunacion.value = "";

        salirModoEdicion();

        ocultarMensaje();

        actualizarContador();

    }


    function salirModoEdicion() {

        tituloFormulario.textContent =
            "Registrar vacunación";


        btnGuardar.textContent =
            "💾 Registrar vacunación";


        btnCancelar.hidden = true;

    }


    // ============================
    // BUSCAR Y FILTRAR
    // ============================

    buscarInput.addEventListener(
        "input",
        aplicarFiltros
    );


    filtroEstado.addEventListener(
        "change",
        aplicarFiltros
    );


    btnLimpiarFiltros.addEventListener(
        "click",
        () => {

            buscarInput.value = "";

            filtroEstado.value = "todos";

            aplicarFiltros();

        }
    );


    // ============================
    // ACTUALIZAR
    // ============================

    btnActualizar.addEventListener(
        "click",
        async () => {

            btnActualizar.disabled = true;

            btnActualizar.textContent =
                "⏳ Actualizando...";


            await cargarVacunaciones();


            btnActualizar.disabled = false;

            btnActualizar.textContent =
                "🔄 Actualizar";

        }
    );


    // ============================
    // CONTADOR
    // ============================

    observaciones.addEventListener(
        "input",
        actualizarContador
    );


    function actualizarContador() {

        contadorObservaciones.textContent =
            observaciones.value.length;

    }


    // ============================
    // RESUMEN
    // ============================

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
                    obtenerEstadoDosis(
                        registro
                    ) === "pendiente"
            ).length;


        document.getElementById(
            "dosisVencidas"
        ).textContent =
            vacunaciones.filter(
                registro =>
                    obtenerEstadoDosis(
                        registro
                    ) === "vencida"
            ).length;

    }


    // ============================
    // MENSAJES
    // ============================

    function mostrarMensaje(
        texto,
        tipo
    ) {

        mensajeFormulario.textContent =
            texto;

        mensajeFormulario.className =
            `mensaje-formulario ${tipo}`;

    }


    function ocultarMensaje() {

        mensajeFormulario.textContent =
            "";

        mensajeFormulario.className =
            "mensaje-formulario";

    }


    // ============================
    // FORMATO DE FECHAS
    // ============================

    function formatearFecha(valor) {

        if (!valor) {

            return "—";

        }


        const texto =
            String(valor)
                .substring(0, 10);


        const partes =
            texto.split("-");


        return partes.length === 3

            ? `${partes[2]}/${partes[1]}/${partes[0]}`

            : texto;

    }


    function obtenerFechaInput(valor) {

        if (!valor) {

            return "";

        }


        return String(valor)
            .replace("T", " ")
            .split(" ")[0];

    }


    // ============================
    // SEGURIDAD HTML
    // ============================

    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
