document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API = "http://localhost:3001/api";


    // =====================================================
    // ELEMENTOS
    // =====================================================

    const formulario =
        document.getElementById("form-historia");

    const idHistoria =
        document.getElementById("id_historia");

    const mascotaSelect =
        document.getElementById("id_mascota");

    const usuarioSelect =
        document.getElementById("id_usuario");

    const fechaInput =
        document.getElementById("fecha");

    const motivoInput =
        document.getElementById("motivo_consulta");

    const diagnosticoInput =
        document.getElementById("diagnostico");

    const tratamientoInput =
        document.getElementById("tratamiento");

    const observacionesInput =
        document.getElementById("observaciones");

    const tablaHistorias =
        document.getElementById("tabla-historias");

    const buscarInput =
        document.getElementById("buscar-historia");

    const btnGuardar =
        document.getElementById("btn-guardar");

    const btnCancelar =
        document.getElementById("btn-cancelar");

    const btnLimpiar =
        document.getElementById("btn-limpiar");

    const btnActualizar =
        document.getElementById("btn-actualizar");

    const tituloFormulario =
        document.getElementById("titulo-formulario");


    // =====================================================
    // VARIABLES
    // =====================================================

    let historias = [];

    let mascotas = [];

    let usuarios = [];



    // =====================================================
    // CARGA INICIAL
    // =====================================================

    cargarDatos();



    async function cargarDatos() {

        try {

            await Promise.all([
                cargarMascotas(),
                cargarUsuarios(),
                cargarHistorias()
            ]);

        } catch (error) {

            console.error(
                "Error cargando datos:",
                error
            );

        }

    }



    // =====================================================
    // CARGAR MASCOTAS
    // =====================================================

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
                `
                <option value="">
                    Seleccione una mascota
                </option>
                `;


            mascotas.forEach(mascota => {

                const opcion =
                    document.createElement("option");


                opcion.value =
                    mascota.id_mascota;


                opcion.textContent =
                    mascota.nombre;


                mascotaSelect.appendChild(opcion);

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
    // CARGAR USUARIOS
    // =====================================================

    async function cargarUsuarios() {

        try {

            const respuesta =
                await fetch(`${API}/usuarios`);


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron cargar los usuarios."
                );

            }


            usuarios =
                await respuesta.json();


            usuarioSelect.innerHTML =
                `
                <option value="">
                    Seleccione un veterinario
                </option>
                `;


            usuarios.forEach(usuario => {

                const opcion =
                    document.createElement("option");


                opcion.value =
                    usuario.id_usuario;


                opcion.textContent =
                    `${usuario.nombre} ${usuario.apellido}`;


                usuarioSelect.appendChild(opcion);

            });


        } catch (error) {

            console.error(error);

            usuarioSelect.innerHTML =
                `
                <option value="">
                    Error al cargar veterinarios
                </option>
                `;

        }

    }



    // =====================================================
    // CARGAR HISTORIAS
    // =====================================================

    async function cargarHistorias() {

        tablaHistorias.innerHTML =
            `
            <tr>
                <td colspan="7" class="cargando">
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
                    "No se pudieron consultar las historias clínicas."
                );

            }


            historias =
                await respuesta.json();


            mostrarHistorias(historias);

            actualizarResumen();


        } catch (error) {

            console.error(error);


            tablaHistorias.innerHTML =
                `
                <tr>
                    <td colspan="7" class="error-tabla">

                        ⚠️ No fue posible cargar
                        las historias clínicas.

                        <br><br>

                        Verifique que el servidor
                        de Doctor Wilson esté funcionando.

                    </td>
                </tr>
                `;

        }

    }



    // =====================================================
    // MOSTRAR HISTORIAS
    // =====================================================

    function mostrarHistorias(lista) {

        tablaHistorias.innerHTML = "";


        if (!lista || lista.length === 0) {

            tablaHistorias.innerHTML =
                `
                <tr>
                    <td colspan="7" class="vacio">

                        📋 No hay historias clínicas
                        registradas.

                    </td>
                </tr>
                `;

            return;
        }


        lista.forEach((historia, indice) => {

            const fila =
                document.createElement("tr");


            fila.innerHTML =
                `

                <td>

                    <span class="numero">
                        ${indice + 1}
                    </span>

                </td>


                <td>
                    ${formatearFecha(historia.fecha)}
                </td>


                <td>

                    <div class="mascota">

                        <span>
                            🐾
                        </span>

                        <strong>
                            ${escaparHTML(
                                historia.mascota
                            )}
                        </strong>

                    </div>

                </td>


                <td>

                    <span class="texto-celda">

                        ${escaparHTML(
                            historia.motivo_consulta
                        )}

                    </span>

                </td>


                <td>

                    <span class="texto-celda">

                        ${
                            historia.diagnostico
                                ? escaparHTML(
                                    historia.diagnostico
                                )
                                : "Sin diagnóstico registrado"
                        }

                    </span>

                </td>


                <td>

                    ${escaparHTML(
                        historia.veterinario ||
                        "Sin asignar"
                    )}

                </td>


                <td>

                    <div class="acciones">

                        <button
                            type="button"
                            class="btn-accion btn-editar"
                            data-id="${historia.id_historia}"
                            title="Editar historia"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="btn-accion btn-eliminar"
                            data-id="${historia.id_historia}"
                            title="Eliminar historia"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

                `;


            tablaHistorias.appendChild(fila);

        });


        activarBotones();

    }



    // =====================================================
    // BOTONES EDITAR / ELIMINAR
    // =====================================================

    function activarBotones() {

        document
            .querySelectorAll(".btn-editar")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        editarHistoria(
                            boton.dataset.id
                        );

                    }
                );

            });


        document
            .querySelectorAll(".btn-eliminar")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        eliminarHistoria(
                            boton.dataset.id
                        );

                    }
                );

            });

    }



    // =====================================================
    // GUARDAR / ACTUALIZAR
    // =====================================================

    formulario.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (
                !mascotaSelect.value ||
                !usuarioSelect.value
            ) {

                alert(
                    "Debe seleccionar la mascota y el veterinario."
                );

                return;

            }


            const datos = {

                fecha:
                    `${fechaInput.value} 00:00:00`,

                motivo_consulta:
                    motivoInput.value.trim(),

                diagnostico:
                    diagnosticoInput.value.trim(),

                tratamiento:
                    tratamientoInput.value.trim(),

                observaciones:
                    observacionesInput.value.trim(),

                id_mascota:
                    Number(mascotaSelect.value),

                id_usuario:
                    Number(usuarioSelect.value)

            };


            btnGuardar.disabled = true;


            try {

                let respuesta;


                // =========================================
                // ACTUALIZAR
                // =========================================

                if (idHistoria.value) {

                    respuesta =
                        await fetch(
                            `${API}/historias-clinicas/${idHistoria.value}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(datos)
                            }
                        );

                }


                // =========================================
                // INSERTAR
                // =========================================

                else {

                    respuesta =
                        await fetch(
                            `${API}/historias-clinicas`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(datos)
                            }
                        );

                }


                const resultado =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        resultado.error ||
                        resultado.mensaje ||
                        "No fue posible guardar la historia."
                    );

                }


                if (idHistoria.value) {

                    alert(
                        "Historia clínica actualizada correctamente."
                    );

                } else {

                    alert(
                        "Historia clínica registrada correctamente."
                    );

                }


                limpiarFormulario();

                await cargarHistorias();


            } catch (error) {

                console.error(error);


                alert(
                    "No fue posible guardar la historia clínica.\n\n" +
                    error.message
                );


            } finally {

                btnGuardar.disabled = false;

            }

        }
    );



    // =====================================================
    // EDITAR HISTORIA
    // =====================================================

    async function editarHistoria(id) {

        try {

            const respuesta =
                await fetch(
                    `${API}/historias-clinicas/${id}`
                );


            if (!respuesta.ok) {

                throw new Error(
                    "Historia clínica no encontrada."
                );

            }


            const historia =
                await respuesta.json();


            idHistoria.value =
                historia.id_historia;


            mascotaSelect.value =
                historia.id_mascota;


            usuarioSelect.value =
                historia.id_usuario;


            fechaInput.value =
                obtenerFechaInput(
                    historia.fecha
                );


            motivoInput.value =
                historia.motivo_consulta ||
                "";


            diagnosticoInput.value =
                historia.diagnostico ||
                "";


            tratamientoInput.value =
                historia.tratamiento ||
                "";


            observacionesInput.value =
                historia.observaciones ||
                "";


            tituloFormulario.textContent =
                "Editar historia clínica";


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
                "No fue posible cargar la historia clínica."
            );

        }

    }



    // =====================================================
    // ELIMINAR HISTORIA
    // =====================================================

    async function eliminarHistoria(id) {

        const historia =
            historias.find(
                elemento =>
                    String(elemento.id_historia) ===
                    String(id)
            );


        if (!historia) {

            alert(
                "No se encontró la historia clínica."
            );

            return;

        }


        const confirmar =
            confirm(
                `¿Está seguro de eliminar la historia clínica de ${historia.mascota}?\n\n` +
                `Motivo: ${historia.motivo_consulta}\n\n` +
                `Esta acción no se puede deshacer.`
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
                    resultado.error ||
                    resultado.mensaje ||
                    "No fue posible eliminar la historia."
                );

            }


            alert(
                "Historia clínica eliminada correctamente."
            );


            await cargarHistorias();


        } catch (error) {

            console.error(error);


            alert(
                "No fue posible eliminar la historia clínica.\n\n" +
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
    // LIMPIAR
    // =====================================================

    formulario.addEventListener(
        "reset",
        () => {

            setTimeout(
                salirModoEdicion,
                50
            );

        }
    );


    btnLimpiar.addEventListener(
        "click",
        () => {

            setTimeout(
                salirModoEdicion,
                50
            );

        }
    );


    function limpiarFormulario() {

        formulario.reset();

        idHistoria.value = "";

        salirModoEdicion();

    }


    function salirModoEdicion() {

        tituloFormulario.textContent =
            "Registrar historia clínica";


        btnGuardar.innerHTML =
            "💾 Registrar historia";


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


            if (texto === "") {

                mostrarHistorias(historias);

                return;

            }


            const resultados =
                historias.filter(historia => {

                    const mascota =
                        String(
                            historia.mascota || ""
                        ).toLowerCase();


                    const motivo =
                        String(
                            historia.motivo_consulta || ""
                        ).toLowerCase();


                    const diagnostico =
                        String(
                            historia.diagnostico || ""
                        ).toLowerCase();


                    const veterinario =
                        String(
                            historia.veterinario || ""
                        ).toLowerCase();


                    return (
                        mascota.includes(texto) ||
                        motivo.includes(texto) ||
                        diagnostico.includes(texto) ||
                        veterinario.includes(texto)
                    );

                });


            mostrarHistorias(resultados);

        }
    );



    // =====================================================
    // ACTUALIZAR
    // =====================================================

    btnActualizar.addEventListener(
        "click",
        async () => {

            btnActualizar.disabled = true;

            await cargarHistorias();

            btnActualizar.disabled = false;

        }
    );



    // =====================================================
    // RESUMEN
    // =====================================================

    function actualizarResumen() {

        const total =
            historias.length;


        const mascotasUnicas =
            new Set(
                historias.map(
                    historia =>
                        historia.id_mascota
                )
            );


        document.getElementById(
            "total-historias"
        ).textContent =
            total;


        document.getElementById(
            "total-mascotas"
        ).textContent =
            mascotasUnicas.size;


        document.getElementById(
            "total-consultas"
        ).textContent =
            total;

    }



    // =====================================================
    // FECHA PARA MOSTRAR
    // =====================================================

    function formatearFecha(valor) {

        if (!valor) {

            return "-";

        }


        const fecha =
            new Date(valor);


        if (isNaN(fecha.getTime())) {

            return String(valor)
                .substring(0, 10);

        }


        return fecha.toLocaleDateString(
            "es-CO"
        );

    }



    // =====================================================
    // FECHA PARA INPUT
    // =====================================================

    function obtenerFechaInput(valor) {

        if (!valor) {

            return "";

        }


        const texto =
            String(valor)
                .replace("T", " ");


        return texto
            .split(" ")[0];

    }



    // =====================================================
    // SEGURIDAD
    // =====================================================

    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
