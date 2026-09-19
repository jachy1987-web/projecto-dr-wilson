document.addEventListener("DOMContentLoaded", () => {

    const API = "http://localhost:3001/api";

    const formulario = document.getElementById("form-historia");
    const idHistoria = document.getElementById("id_historia");
    const mascotaSelect = document.getElementById("id_mascota");
    const usuarioSelect = document.getElementById("id_usuario");
    const fechaInput = document.getElementById("fecha");
    const motivoInput = document.getElementById("motivo_consulta");
    const diagnosticoInput = document.getElementById("diagnostico");
    const tratamientoInput = document.getElementById("tratamiento");
    const observacionesInput = document.getElementById("observaciones");
    const tablaHistorias = document.getElementById("tabla-historias");
    const buscarInput = document.getElementById("buscar-historia");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const btnActualizar = document.getElementById("btn-actualizar");
    const tituloFormulario = document.getElementById("titulo-formulario");

    const filtroFecha = document.getElementById("filtro-fecha");
    const filtroMascota = document.getElementById("filtro-mascota");
    const btnLimpiarFiltros =
        document.getElementById("btn-limpiar-filtros");

    const modalDetalle =
        document.getElementById("modal-detalle");

    const btnCerrarModal =
        document.getElementById("btn-cerrar-modal");

    const btnCerrarModalFooter =
        document.getElementById("btn-cerrar-modal-footer");

    let historias = [];
    let mascotas = [];
    let usuarios = [];

    cargarDatos();

    async function cargarDatos() {

        try {

            await Promise.all([
                cargarMascotas(),
                cargarUsuarios(),
                cargarHistorias()
            ]);

            establecerFechaMinima();

        } catch (error) {

            console.error(
                "Error cargando datos:",
                error
            );

        }

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

            llenarMascotas();

        } catch (error) {

            console.error(error);

            mascotaSelect.innerHTML =
                `<option value="">
                    Error al cargar mascotas
                </option>`;

        }

    }

    function llenarMascotas() {

        mascotaSelect.innerHTML =
            `<option value="">
                Seleccione una mascota
            </option>`;

        filtroMascota.innerHTML =
            `<option value="">
                Todas las mascotas
            </option>`;

        mascotas.forEach(mascota => {

            const id =
                mascota.id_mascota ??
                mascota.id;

            const nombre =
                mascota.nombre ||
                "Sin nombre";

            const opcion =
                document.createElement("option");

            opcion.value = id;
            opcion.textContent = nombre;

            mascotaSelect.appendChild(opcion);

            const filtro =
                document.createElement("option");

            filtro.value = id;
            filtro.textContent = nombre;

            filtroMascota.appendChild(filtro);

        });

    }

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
                `<option value="">
                    Seleccione un veterinario
                </option>`;

            usuarios.forEach(usuario => {

                const id =
                    usuario.id_usuario ??
                    usuario.id;

                const nombre =
                    `${usuario.nombre || ""}
                    ${usuario.apellido || ""}`
                    .trim()
                    || usuario.usuario
                    || `Usuario #${id}`;

                const opcion =
                    document.createElement("option");

                opcion.value = id;
                opcion.textContent = nombre;

                usuarioSelect.appendChild(opcion);

            });

        } catch (error) {

            console.error(error);

            usuarioSelect.innerHTML =
                `<option value="">
                    Error al cargar veterinarios
                </option>`;

        }

    }

    async function cargarHistorias() {

        tablaHistorias.innerHTML =
            `<tr>
                <td colspan="7" class="cargando">
                    Cargando historias clínicas...
                </td>
            </tr>`;

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

            actualizarResumen();

            aplicarFiltros();

        } catch (error) {

            console.error(error);

            tablaHistorias.innerHTML =
                `<tr>
                    <td colspan="7" class="error-tabla">
                        ⚠️ No fue posible cargar
                        las historias clínicas.
                        <br><br>
                        Verifique que el servidor
                        de Doctor Wilson esté funcionando.
                    </td>
                </tr>`;

        }

    }

    function mostrarHistorias(lista) {

        tablaHistorias.innerHTML = "";

        if (!lista.length) {

            tablaHistorias.innerHTML =
                `<tr>
                    <td colspan="7" class="vacio">
                        📋 No se encontraron historias clínicas
                        con los filtros seleccionados.
                    </td>
                </tr>`;

            return;
        }

        lista.forEach((historia, indice) => {

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
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
                        <span>🐾</span>

                        <strong>
                            ${escaparHTML(
                                historia.mascota ||
                                "Sin nombre"
                            )}
                        </strong>
                    </div>
                </td>

                <td>
                    <span class="texto-celda">
                        ${escaparHTML(
                            historia.motivo_consulta ||
                            "Sin motivo"
                        )}
                    </span>
                </td>

                <td>
                    <span class="texto-celda">
                        ${escaparHTML(
                            historia.diagnostico ||
                            "Sin diagnóstico registrado"
                        )}
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
                            class="btn-accion btn-detalle"
                            data-id="${historia.id_historia}"
                            title="Ver detalle">
                            👁️
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-editar"
                            data-id="${historia.id_historia}"
                            title="Editar historia">
                            ✏️
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-eliminar"
                            data-id="${historia.id_historia}"
                            title="Eliminar historia">
                            🗑️
                        </button>

                    </div>

                </td>
            `;

            tablaHistorias.appendChild(fila);

        });

        activarBotones();

    }

    function activarBotones() {

        document
            .querySelectorAll(".btn-detalle")
            .forEach(boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        mostrarDetalle(
                            boton.dataset.id
                        );

                    }
                );

            });

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

    formulario.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();

            if (
                !mascotaSelect.value ||
                !usuarioSelect.value ||
                !fechaInput.value ||
                !motivoInput.value.trim()
            ) {

                alert(
                    "Complete todos los campos obligatorios."
                );

                return;

            }

            if (
                fechaInput.value >
                obtenerFechaActual()
            ) {

                alert(
                    "La fecha de la historia clínica no puede ser futura."
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

                const editando =
                    Boolean(idHistoria.value);

                const url =
                    editando
                        ? `${API}/historias-clinicas/${idHistoria.value}`
                        : `${API}/historias-clinicas`;

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
                        "No fue posible guardar la historia."
                    );

                }

                alert(
                    editando
                        ? "Historia clínica actualizada correctamente."
                        : "Historia clínica registrada correctamente."
                );

                limpiarFormulario();

                await cargarHistorias();

            } catch (error) {

                console.error(error);

                alert(
                    `No fue posible guardar la historia clínica.

${error.message}`
                );

            } finally {

                btnGuardar.disabled = false;

            }

        }
    );

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

    async function eliminarHistoria(id) {

        const historia =
            historias.find(
                elemento =>
                    String(elemento.id_historia) ===
                    String(id)
            );

        if (!historia) {
            return;
        }

        const confirmar =
            confirm(
                `¿Está seguro de eliminar la historia clínica de ${
                    historia.mascota ||
                    "la mascota"
                }?

Esta acción no se puede deshacer.`
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
                `No fue posible eliminar la historia clínica.

${error.message}`
            );

        }

    }

    function mostrarDetalle(id) {

        const historia =
            historias.find(
                item =>
                    String(item.id_historia) ===
                    String(id)
            );

        if (!historia) {
            return;
        }

        document.getElementById(
            "detalle-mascota"
        ).textContent =
            historia.mascota ||
            "Sin nombre";

        document.getElementById(
            "detalle-veterinario"
        ).textContent =
            historia.veterinario ||
            "Sin asignar";

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
            "Sin motivo";

        document.getElementById(
            "detalle-diagnostico"
        ).textContent =
            historia.diagnostico ||
            "Sin diagnóstico registrado.";

        document.getElementById(
            "detalle-tratamiento"
        ).textContent =
            historia.tratamiento ||
            "Sin tratamiento registrado.";

        document.getElementById(
            "detalle-observaciones"
        ).textContent =
            historia.observaciones ||
            "Sin observaciones.";

        modalDetalle.classList.remove(
            "hidden"
        );

    }

    function cerrarDetalle() {

        modalDetalle.classList.add(
            "hidden"
        );

    }

    btnCerrarModal.addEventListener(
        "click",
        cerrarDetalle
    );

    btnCerrarModalFooter.addEventListener(
        "click",
        cerrarDetalle
    );

    modalDetalle
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            cerrarDetalle
        );

    btnCancelar.addEventListener(
        "click",
        limpiarFormulario
    );

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

        establecerFechaMinima();

    }

    function salirModoEdicion() {

        tituloFormulario.textContent =
            "Registrar historia clínica";

        btnGuardar.innerHTML =
            "💾 Registrar historia";

        btnCancelar.style.display =
            "none";

    }

    buscarInput.addEventListener(
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
        () => {

            buscarInput.value = "";
            filtroFecha.value = "";
            filtroMascota.value = "";

            aplicarFiltros();

        }
    );

    btnActualizar.addEventListener(
        "click",
        async () => {

            btnActualizar.disabled = true;

            await cargarHistorias();

            btnActualizar.disabled = false;

        }
    );

    function aplicarFiltros() {

        const texto =
            buscarInput.value
                .toLowerCase()
                .trim();

        const fecha =
            filtroFecha.value;

        const mascota =
            filtroMascota.value;

        const resultados =
            historias.filter(historia => {

                const contenido = [

                    historia.mascota,
                    historia.motivo_consulta,
                    historia.diagnostico,
                    historia.tratamiento,
                    historia.observaciones,
                    historia.veterinario

                ].map(
                    valor =>
                        String(
                            valor || ""
                        ).toLowerCase()
                );

                const coincideTexto =
                    !texto ||
                    contenido.some(
                        valor =>
                            valor.includes(texto)
                    );

                const coincideFecha =
                    !fecha ||
                    obtenerFechaInput(
                        historia.fecha
                    ) === fecha;

                const coincideMascota =
                    !mascota ||
                    String(
                        historia.id_mascota
                    ) === String(mascota);

                return (
                    coincideTexto &&
                    coincideFecha &&
                    coincideMascota
                );

            });

        mostrarHistorias(
            resultados
        );

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
                    h =>
                        h.id_mascota
                )
            ).size;

        document.getElementById(
            "total-consultas"
        ).textContent =
            historias.length;

    }

    function formatearFecha(valor) {

        const fecha =
            obtenerFechaInput(valor);

        if (!fecha) {
            return "-";
        }

        const [
            año,
            mes,
            dia
        ] =
            fecha.split("-");

        return `${dia}/${mes}/${año}`;

    }

    function obtenerFechaInput(valor) {

        if (!valor) {
            return "";
        }

        return String(valor)
            .replace("T", " ")
            .split(" ")[0];

    }

    function obtenerFechaActual() {

        const fecha =
            new Date();

        return `${fecha.getFullYear()}-${
            String(
                fecha.getMonth() + 1
            ).padStart(2, "0")
        }-${
            String(
                fecha.getDate()
            ).padStart(2, "0")
        }`;

    }

    function establecerFechaMinima() {

        fechaInput.max =
            obtenerFechaActual();

    }

    function escaparHTML(texto) {

        return String(
            texto ?? ""
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

});
