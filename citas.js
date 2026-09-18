document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const API = "http://localhost:3001/api";


    // =====================================================
    // ELEMENTOS DEL DOM
    // =====================================================

    const formulario = document.getElementById("form-cita");

    const idCita = document.getElementById("id_cita");

    const mascotaSelect = document.getElementById("id_mascota");

    const usuarioSelect = document.getElementById("id_usuario");

    const fechaInput = document.getElementById("fecha");

    const horaInput = document.getElementById("hora");

    const motivoInput = document.getElementById("motivo");

    const estadoSelect = document.getElementById("estado");

    const observacionesInput =
        document.getElementById("observaciones");

    const tablaCitas =
        document.getElementById("tabla-citas");

    const buscarInput =
        document.getElementById("buscar-cita");

    const btnGuardar =
        document.getElementById("btn-guardar");

    const btnCancelarEdicion =
        document.getElementById("btn-cancelar-edicion");

    const btnLimpiar =
        document.getElementById("btn-limpiar");

    const btnRecargar =
        document.getElementById("btn-recargar");

    const tituloFormulario =
        document.getElementById("titulo-formulario");


    // =====================================================
    // VARIABLES
    // =====================================================

    let citas = [];

    let mascotas = [];

    let usuarios = [];



    // =====================================================
    // CARGAR INFORMACIÓN INICIAL
    // =====================================================

    async function cargarDatosIniciales() {

        try {

            await Promise.all([
                cargarMascotas(),
                cargarUsuarios(),
                cargarCitas()
            ]);

        } catch (error) {

            console.error(
                "Error cargando información:",
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
                    "No se pudieron cargar las mascotas"
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

        } catch (error) {

            console.error(error);

            mascotaSelect.innerHTML =
                '<option value="">Error al cargar mascotas</option>';

        }

    }



    // =====================================================
    // CARGAR USUARIOS / VETERINARIOS
    // =====================================================

    async function cargarUsuarios() {

        try {

            const respuesta =
                await fetch(`${API}/usuarios`);

            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron cargar los usuarios"
                );

            }

            usuarios = await respuesta.json();

            usuarioSelect.innerHTML =
                '<option value="">Seleccione un veterinario</option>';


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
                '<option value="">Error al cargar veterinarios</option>';

        }

    }



    // =====================================================
    // CARGAR CITAS
    // =====================================================

    async function cargarCitas() {

        tablaCitas.innerHTML = `
            <tr>
                <td colspan="8" class="cargando">
                    Cargando citas...
                </td>
            </tr>
        `;


        try {

            const respuesta =
                await fetch(`${API}/citas`);

            if (!respuesta.ok) {

                throw new Error(
                    "No se pudieron consultar las citas"
                );

            }

            citas = await respuesta.json();

            mostrarCitas(citas);

            actualizarResumen();

        } catch (error) {

            console.error(error);

            tablaCitas.innerHTML = `
                <tr>
                    <td colspan="8" class="error-tabla">
                        ⚠️ No fue posible cargar las citas.
                        <br>
                        Verifique que el servidor de Doctor Wilson esté funcionando.
                    </td>
                </tr>
            `;

        }

    }



    // =====================================================
    // MOSTRAR CITAS
    // =====================================================

    function mostrarCitas(lista) {

        tablaCitas.innerHTML = "";


        if (!lista || lista.length === 0) {

            tablaCitas.innerHTML = `
                <tr>
                    <td colspan="8" class="vacio">
                        📅 No hay citas registradas.
                    </td>
                </tr>
            `;

            return;
        }


        lista.forEach((cita, indice) => {

            const fila =
                document.createElement("tr");


            const fechaHora =
                separarFechaHora(cita.fecha_hora);


            const estadoClase =
                obtenerClaseEstado(cita.estado);


            fila.innerHTML = `

                <td>
                    <span class="numero-cita">
                        ${indice + 1}
                    </span>
                </td>


                <td>

                    <div class="mascota-tabla">

                        <span class="icono-mascota">
                            🐾
                        </span>

                        <strong>
                            ${escaparHTML(cita.mascota)}
                        </strong>

                    </div>

                </td>


                <td>
                    ${fechaHora.fecha}
                </td>


                <td>
                    ${fechaHora.hora}
                </td>


                <td>

                    <span class="motivo-tabla">

                        ${escaparHTML(cita.motivo)}

                    </span>

                </td>


                <td>
                    ${escaparHTML(
                        cita.veterinario || "Sin asignar"
                    )}
                </td>


                <td>

                    <span class="estado ${estadoClase}">

                        ${obtenerIconoEstado(cita.estado)}

                        ${escaparHTML(cita.estado)}

                    </span>

                </td>


                <td>

                    <div class="acciones">

                        <button
                            type="button"
                            class="btn-accion btn-editar"
                            data-id="${cita.id_cita}"
                            title="Editar cita"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="btn-accion btn-eliminar"
                            data-id="${cita.id_cita}"
                            title="Eliminar cita"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            tablaCitas.appendChild(fila);

        });


        activarBotonesAcciones();

    }



    // =====================================================
    // ACTIVAR BOTONES DE EDITAR Y ELIMINAR
    // =====================================================

    function activarBotonesAcciones() {

        const botonesEditar =
            document.querySelectorAll(".btn-editar");


        botonesEditar.forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.id;

                    editarCita(id);

                }
            );

        });


        const botonesEliminar =
            document.querySelectorAll(".btn-eliminar");


        botonesEliminar.forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.id;

                    eliminarCita(id);

                }
            );

        });

    }



    // =====================================================
    // REGISTRAR / ACTUALIZAR CITA
    // =====================================================

    formulario.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();


            const fecha =
                fechaInput.value;

            const hora =
                horaInput.value;


            const fechaHora =
                `${fecha} ${hora}:00`;


            const datos = {

                fecha_hora: fechaHora,

                motivo:
                    motivoInput.value.trim(),

                estado:
                    estadoSelect.value,

                observaciones:
                    observacionesInput.value.trim(),

                id_mascota:
                    Number(mascotaSelect.value),

                id_usuario:
                    Number(usuarioSelect.value)

            };


            if (
                !datos.id_mascota ||
                !datos.id_usuario
            ) {

                alert(
                    "Debe seleccionar la mascota y el veterinario."
                );

                return;
            }


            if (!fecha || !hora) {

                alert(
                    "Debe seleccionar la fecha y la hora de la cita."
                );

                return;
            }


            btnGuardar.disabled = true;


            try {

                let respuesta;


                // ==========================================
                // ACTUALIZAR
                // ==========================================

                if (idCita.value) {

                    respuesta =
                        await fetch(
                            `${API}/citas/${idCita.value}`,
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


                // ==========================================
                // REGISTRAR
                // ==========================================

                else {

                    respuesta =
                        await fetch(
                            `${API}/citas`,
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
                        "No fue posible guardar la cita"
                    );

                }


                if (idCita.value) {

                    alert(
                        "Cita actualizada correctamente."
                    );

                } else {

                    alert(
                        "Cita registrada correctamente."
                    );

                }


                limpiarFormulario();

                await cargarCitas();


            } catch (error) {

                console.error(error);

                alert(
                    "No fue posible guardar la cita.\n\n" +
                    error.message
                );

            } finally {

                btnGuardar.disabled = false;

            }

        }
    );



    // =====================================================
    // EDITAR CITA
    // =====================================================

    async function editarCita(id) {

        try {

            const respuesta =
                await fetch(
                    `${API}/citas/${id}`
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No se encontró la cita"
                );

            }


            const cita =
                await respuesta.json();


            idCita.value =
                cita.id_cita;


            mascotaSelect.value =
                cita.id_mascota;


            usuarioSelect.value =
                cita.id_usuario;


            const fechaHora =
                separarFechaHoraInput(
                    cita.fecha_hora
                );


            fechaInput.value =
                fechaHora.fecha;


            horaInput.value =
                fechaHora.hora;


            motivoInput.value =
                cita.motivo || "";


            estadoSelect.value =
                cita.estado || "Programada";


            observacionesInput.value =
                cita.observaciones || "";


            tituloFormulario.textContent =
                "Editar cita";


            btnGuardar.innerHTML =
                "💾 Guardar cambios";


            btnCancelarEdicion.style.display =
                "inline-flex";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(error);

            alert(
                "No fue posible cargar la información de la cita."
            );

        }

    }



    // =====================================================
    // ELIMINAR CITA
    // =====================================================

    async function eliminarCita(id) {

        const cita =
            citas.find(
                elemento =>
                    String(elemento.id_cita) === String(id)
            );


        if (!cita) {

            alert(
                "No se encontró la cita."
            );

            return;
        }


        const confirmar =
            confirm(
                `¿Está seguro de eliminar la cita de ${cita.mascota}?\n\n` +
                `Fecha: ${separarFechaHora(cita.fecha_hora).fecha}\n` +
                `Hora: ${separarFechaHora(cita.fecha_hora).hora}\n\n` +
                `Esta acción no se puede deshacer.`
            );


        if (!confirmar) {

            return;
        }


        try {

            const respuesta =
                await fetch(
                    `${API}/citas/${id}`,
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
                    "No fue posible eliminar la cita"
                );

            }


            alert(
                "Cita eliminada correctamente."
            );


            await cargarCitas();


        } catch (error) {

            console.error(error);

            alert(
                "No fue posible eliminar la cita.\n\n" +
                error.message
            );

        }

    }



    // =====================================================
    // CANCELAR EDICIÓN
    // =====================================================

    btnCancelarEdicion.addEventListener(
        "click",
        () => {

            limpiarFormulario();

        }
    );



    // =====================================================
    // LIMPIAR FORMULARIO
    // =====================================================

    formulario.addEventListener(
        "reset",
        () => {

            setTimeout(
                () => {

                    salirModoEdicion();

                },
                50
            );

        }
    );


    btnLimpiar.addEventListener(
        "click",
        () => {

            setTimeout(
                () => {

                    salirModoEdicion();

                },
                50
            );

        }
    );



    function limpiarFormulario() {

        formulario.reset();

        idCita.value = "";

        salirModoEdicion();

    }



    function salirModoEdicion() {

        tituloFormulario.textContent =
            "Registrar nueva cita";


        btnGuardar.innerHTML =
            "💾 Registrar cita";


        btnCancelarEdicion.style.display =
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

                mostrarCitas(citas);

                return;
            }


            const resultados =
                citas.filter(cita => {

                    const mascota =
                        String(
                            cita.mascota || ""
                        ).toLowerCase();


                    const motivo =
                        String(
                            cita.motivo || ""
                        ).toLowerCase();


                    const veterinario =
                        String(
                            cita.veterinario || ""
                        ).toLowerCase();


                    const estado =
                        String(
                            cita.estado || ""
                        ).toLowerCase();


                    return (
                        mascota.includes(texto) ||
                        motivo.includes(texto) ||
                        veterinario.includes(texto) ||
                        estado.includes(texto)
                    );

                });


            mostrarCitas(resultados);

        }
    );



    // =====================================================
    // BOTÓN RECARGAR
    // =====================================================

    btnRecargar.addEventListener(
        "click",
        async () => {

            btnRecargar.disabled = true;

            await cargarCitas();

            btnRecargar.disabled = false;

        }
    );



    // =====================================================
    // ACTUALIZAR RESUMEN
    // =====================================================

    function actualizarResumen() {

        const total =
            citas.length;


        const programadas =
            citas.filter(
                cita =>
                    cita.estado === "Programada"
            ).length;


        const atendidas =
            citas.filter(
                cita =>
                    cita.estado === "Atendida"
            ).length;


        const canceladas =
            citas.filter(
                cita =>
                    cita.estado === "Cancelada"
            ).length;


        document.getElementById(
            "total-citas"
        ).textContent = total;


        document.getElementById(
            "citas-programadas"
        ).textContent = programadas;


        document.getElementById(
            "citas-atendidas"
        ).textContent = atendidas;


        document.getElementById(
            "citas-canceladas"
        ).textContent = canceladas;

    }



    // =====================================================
    // SEPARAR FECHA Y HORA PARA MOSTRAR
    // =====================================================

    function separarFechaHora(valor) {

        if (!valor) {

            return {
                fecha: "-",
                hora: "-"
            };

        }


        const fecha =
            new Date(valor);


        if (isNaN(fecha.getTime())) {

            const partes =
                String(valor).split(" ");

            return {

                fecha:
                    partes[0] || "-",

                hora:
                    partes[1]
                        ? partes[1].substring(0, 5)
                        : "-"

            };

        }


        return {

            fecha:
                fecha.toLocaleDateString(
                    "es-CO"
                ),

            hora:
                fecha.toLocaleTimeString(
                    "es-CO",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

        };

    }



    // =====================================================
    // FORMATO PARA INPUT DATE / TIME
    // =====================================================

    function separarFechaHoraInput(valor) {

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
                partes[1]
                    ? partes[1].substring(0, 5)
                    : ""

        };

    }



    // =====================================================
    // CLASE DEL ESTADO
    // =====================================================

    function obtenerClaseEstado(estado) {

        switch (estado) {

            case "Atendida":
                return "estado-atendida";

            case "Cancelada":
                return "estado-cancelada";

            default:
                return "estado-programada";

        }

    }



    // =====================================================
    // ICONO DEL ESTADO
    // =====================================================

    function obtenerIconoEstado(estado) {

        switch (estado) {

            case "Atendida":
                return "✓";

            case "Cancelada":
                return "✕";

            default:
                return "●";

        }

    }



    // =====================================================
    // SEGURIDAD PARA TEXTO HTML
    // =====================================================

    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }



    // =====================================================
    // INICIAR
    // =====================================================

    cargarDatosIniciales();

});
