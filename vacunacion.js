document.addEventListener("DOMContentLoaded", () => {


    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API = "http://localhost:3001/api";



    // =====================================================
    // ELEMENTOS
    // =====================================================

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


    const cuerpoTabla =
        document.getElementById(
            "cuerpoVacunaciones"
        );


    const btnGuardar =
        document.getElementById(
            "btnGuardar"
        );


    const btnCancelar =
        document.getElementById(
            "btnCancelar"
        );


    const btnActualizar =
        document.getElementById(
            "btnActualizar"
        );


    const buscarInput =
        document.getElementById(
            "buscarVacunacion"
        );


    const tituloFormulario =
        document.getElementById(
            "titulo-formulario"
        );



    // =====================================================
    // VARIABLES
    // =====================================================

    let vacunaciones = [];

    let mascotas = [];

    let vacunas = [];



    // =====================================================
    // CARGAR INFORMACIÓN INICIAL
    // =====================================================

    cargarDatosIniciales();



    async function cargarDatosIniciales() {

        await Promise.all([
            cargarMascotas(),
            cargarVacunas(),
            cargarVacunaciones()
        ]);

    }



    // =====================================================
    // CARGAR MASCOTAS
    // =====================================================

    async function cargarMascotas() {

        try {

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


            mascotaSelect.innerHTML =
                `
                <option value="">
                    Seleccione una mascota
                </option>
                `;


            mascotas.forEach(mascota => {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    mascota.id_mascota;


                opcion.textContent =
                    mascota.nombre;


                mascotaSelect.appendChild(
                    opcion
                );

            });


        } catch (error) {

            console.error(error);


            mascotaSelect.innerHTML =
                `
                <option value="">
                    Error al cargar mascotas
                </option>
                `;

        }

    }



    // =====================================================
    // CARGAR VACUNAS
    // =====================================================

    async function cargarVacunas() {

        try {

            const respuesta =
                await fetch(
                    `${API}/vacunas`
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron cargar las vacunas."
                );

            }


            vacunas =
                await respuesta.json();


            vacunaSelect.innerHTML =
                `
                <option value="">
                    Seleccione una vacuna
                </option>
                `;


            vacunas.forEach(vacuna => {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    vacuna.id_vacuna;


                opcion.textContent =
                    vacuna.nombre;


                vacunaSelect.appendChild(
                    opcion
                );

            });


        } catch (error) {

            console.error(error);


            vacunaSelect.innerHTML =
                `
                <option value="">
                    Error al cargar vacunas
                </option>
                `;

        }

    }



    // =====================================================
    // CARGAR VACUNACIONES
    // =====================================================

    async function cargarVacunaciones() {

        cuerpoTabla.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="cargando"
                >
                    Cargando vacunaciones...
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


            mostrarVacunaciones(
                vacunaciones
            );


            actualizarResumen();


        } catch (error) {

            console.error(error);


            cuerpoTabla.innerHTML =
                `
                <tr>

                    <td
                        colspan="7"
                        class="error-tabla"
                    >

                        ⚠️ No fue posible cargar
                        las vacunaciones.

                        <br><br>

                        Verifique que el servidor
                        de Doctor Wilson esté funcionando.

                    </td>

                </tr>
                `;

        }

    }



    // =====================================================
    // MOSTRAR VACUNACIONES
    // =====================================================

    function mostrarVacunaciones(lista) {

        cuerpoTabla.innerHTML = "";


        if (
            !lista ||
            lista.length === 0
        ) {

            cuerpoTabla.innerHTML =
                `
                <tr>

                    <td
                        colspan="7"
                        class="vacio"
                    >

                        💉 No hay vacunaciones
                        registradas.

                    </td>

                </tr>
                `;

            return;

        }



        lista.forEach(
            (vacunacion, indice) => {


                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML =
                    `

                    <td>

                        <span class="numero">
                            ${indice + 1}
                        </span>

                    </td>


                    <td>

                        <div class="mascota">

                            <span>
                                🐾
                            </span>

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
                                ? `
                                    <span class="proxima-dosis">

                                        📆

                                        ${formatearFecha(
                                            vacunacion.proxima_dosis
                                        )}

                                    </span>
                                  `
                                : `
                                    <span class="sin-dosis">
                                        No programada
                                    </span>
                                  `
                        }

                    </td>


                    <td>

                        <span class="observacion-tabla">

                            ${
                                vacunacion.observaciones
                                    ? escaparHTML(
                                        vacunacion.observaciones
                                    )
                                    : "Sin observaciones"
                            }

                        </span>

                    </td>


                    <td>

                        <div class="acciones">

                            <button
                                type="button"
                                class="btn-accion btn-editar"
                                data-id="${vacunacion.id_vacunacion}"
                                title="Editar vacunación"
                            >
                                ✏️
                            </button>


                            <button
                                type="button"
                                class="btn-accion btn-eliminar"
                                data-id="${vacunacion.id_vacunacion}"
                                title="Eliminar vacunación"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                    `;


                cuerpoTabla.appendChild(
                    fila
                );

            }
        );


        activarBotones();

    }



    // =====================================================
    // ACTIVAR BOTONES
    // =====================================================

    function activarBotones() {


        document
            .querySelectorAll(
                ".btn-editar"
            )
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        editarVacunacion(
                            boton.dataset.id
                        );

                    }
                );

            });



        document
            .querySelectorAll(
                ".btn-eliminar"
            )
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        eliminarVacunacion(
                            boton.dataset.id
                        );

                    }
                );

            });

    }



    // =====================================================
    // GUARDAR / ACTUALIZAR
    // =====================================================

    form.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (
                !mascotaSelect.value ||
                !vacunaSelect.value ||
                !fechaAplicacion.value
            ) {

                alert(
                    "Complete los campos obligatorios."
                );

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


            btnGuardar.disabled =
                true;


            try {

                let respuesta;


                // =========================================
                // ACTUALIZAR
                // =========================================

                if (
                    idVacunacion.value
                ) {

                    respuesta =
                        await fetch(
                            `${API}/vacunaciones/${idVacunacion.value}`,
                            {
                                method: "PUT",

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

                }


                // =========================================
                // REGISTRAR
                // =========================================

                else {

                    respuesta =
                        await fetch(
                            `${API}/vacunaciones`,
                            {
                                method: "POST",

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

                }


                const resultado =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        resultado.error ||
                        resultado.mensaje ||
                        "No fue posible guardar el registro."
                    );

                }


                alert(
                    resultado.mensaje ||
                    "Operación realizada correctamente."
                );


                limpiarFormulario();


                await cargarVacunaciones();


            } catch (error) {

                console.error(error);


                alert(
                    "No fue posible guardar la vacunación.\n\n" +
                    error.message
                );


            } finally {

                btnGuardar.disabled =
                    false;

            }

        }
    );



    // =====================================================
    // EDITAR VACUNACIÓN
    // =====================================================

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


            tituloFormulario.textContent =
                "Editar vacunación";


            btnGuardar.innerHTML =
                "💾 Guardar cambios";


            btnCancelar.style.display =
                "inline-flex";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(error);


            alert(
                "No fue posible cargar la vacunación."
            );

        }

    }



    // =====================================================
    // ELIMINAR VACUNACIÓN
    // =====================================================

    async function eliminarVacunacion(id) {

        const registro =
            vacunaciones.find(
                elemento =>
                    String(
                        elemento.id_vacunacion
                    ) === String(id)
            );


        if (!registro) {

            alert(
                "No se encontró el registro."
            );

            return;

        }


        const confirmar =
            confirm(
                `¿Está seguro de eliminar la vacunación?\n\n` +
                `Mascota: ${registro.mascota}\n` +
                `Vacuna: ${registro.vacuna}\n\n` +
                `Esta acción no se puede deshacer.`
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


            alert(
                resultado.mensaje ||
                "Vacunación eliminada correctamente."
            );


            await cargarVacunaciones();


        } catch (error) {

            console.error(error);


            alert(
                "No fue posible eliminar la vacunación.\n\n" +
                error.message
            );

        }

    }



    // =====================================================
    // CANCELAR EDICIÓN
    // =====================================================

    btnCancelar.addEventListener(
        "click",
        () => {

            limpiarFormulario();

        }
    );



    // =====================================================
    // LIMPIAR FORMULARIO
    // =====================================================

    form.addEventListener(
        "reset",
        () => {

            setTimeout(
                salirModoEdicion,
                50
            );

        }
    );


    function limpiarFormulario() {

        form.reset();

        idVacunacion.value =
            "";

        salirModoEdicion();

    }


    function salirModoEdicion() {

        tituloFormulario.textContent =
            "Registrar vacunación";


        btnGuardar.innerHTML =
            "💾 Registrar vacunación";


        btnCancelar.style.display =
            "none";

    }



    // =====================================================
    // BUSCADOR
    // =====================================================

    buscarInput.addEventListener(
        "input",
        () => {

            const texto =
                buscarInput.value
                    .toLowerCase()
                    .trim();


            if (!texto) {

                mostrarVacunaciones(
                    vacunaciones
                );

                return;

            }


            const resultados =
                vacunaciones.filter(
                    vacunacion => {


                        const mascota =
                            String(
                                vacunacion.mascota ||
                                ""
                            ).toLowerCase();


                        const vacuna =
                            String(
                                vacunacion.vacuna ||
                                ""
                            ).toLowerCase();


                        const observacion =
                            String(
                                vacunacion.observaciones ||
                                ""
                            ).toLowerCase();


                        return (
                            mascota.includes(texto) ||
                            vacuna.includes(texto) ||
                            observacion.includes(texto)
                        );

                    }
                );


            mostrarVacunaciones(
                resultados
            );

        }
    );



    // =====================================================
    // ACTUALIZAR
    // =====================================================

    btnActualizar.addEventListener(
        "click",
        async () => {

            btnActualizar.disabled =
                true;


            await cargarVacunaciones();


            btnActualizar.disabled =
                false;

        }
    );



    // =====================================================
    // RESUMEN
    // =====================================================

    function actualizarResumen() {

        document.getElementById(
            "totalVacunaciones"
        ).textContent =
            vacunaciones.length;


        const mascotasUnicas =
            new Set(
                vacunaciones.map(
                    vacunacion =>
                        vacunacion.id_mascota
                )
            );


        document.getElementById(
            "mascotasVacunadas"
        ).textContent =
            mascotasUnicas.size;


        const hoy =
            new Date();


        hoy.setHours(
            0,
            0,
            0,
            0
        );


        const proximas =
            vacunaciones.filter(
                vacunacion => {

                    if (
                        !vacunacion.proxima_dosis
                    ) {

                        return false;

                    }


                    const fecha =
                        new Date(
                            vacunacion.proxima_dosis
                        );


                    fecha.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    return fecha >= hoy;

                }
            ).length;


        document.getElementById(
            "proximasDosis"
        ).textContent =
            proximas;

    }



    // =====================================================
    // FORMATEAR FECHA
    // =====================================================

    function formatearFecha(valor) {

        if (!valor) {

            return "—";

        }


        const texto =
            String(valor)
                .substring(0, 10);


        const partes =
            texto.split("-");


        if (
            partes.length !== 3
        ) {

            return texto;

        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }



    // =====================================================
    // FECHA PARA INPUT
    // =====================================================

    function obtenerFechaInput(valor) {

        if (!valor) {

            return "";

        }


        return String(valor)
            .replace("T", " ")
            .split(" ")[0];

    }



    // =====================================================
    // SEGURIDAD HTML
    // =====================================================

    function escaparHTML(texto) {

        return String(texto ?? "")
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

});
