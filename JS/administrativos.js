document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formularioAdministrativos');
    const tablaCuerpo = document.querySelector('#tablaAdministrativos tbody');

    // Arreglo temporal para almacenar los registros en memoria
    let listaAdministrativos = [];

    // Manejo del envío del formulario
    formulario.addEventListener('submit', (event) => {
        event.preventDefault();

        // Captura de valores del formulario
        const nuevoAdministrativo = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            tipoDocumento: document.getElementById('tipoDocumento').value,
            documento: document.getElementById('documento').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            cargo: document.getElementById('cargo').value,
            estado: document.getElementById('estado').value
        };

        // Agregar al listado
        listaAdministrativos.push(nuevoAdministrativo);

        // Actualizar la tabla en el DOM
        actualizarTabla();

        // Limpiar el formulario
        formulario.reset();
    });

    // Función para renderizar las filas de la tabla
    function actualizarTabla() {
        tablaCuerpo.innerHTML = '';

        if (listaAdministrativos.length === 0) {
            tablaCuerpo.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #7f8c8d;">
                        No hay personal administrativo registrado.
                    </td>
                </tr>
            `;
            return;
        }

        listaAdministrativos.forEach((persona) => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${persona.tipoDocumento} - ${persona.documento}</td>
                <td>${persona.nombre} ${persona.apellido}</td>
                <td>${persona.telefono}</td>
                <td>${persona.correo}</td>
                <td>${persona.cargo}</td>
                <td><strong>${persona.estado}</strong></td>
            `;

            tablaCuerpo.appendChild(fila);
        });
    }

    // Carga inicial de la tabla limpia
    actualizarTabla();
});