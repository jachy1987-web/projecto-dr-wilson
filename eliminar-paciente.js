document.addEventListener("DOMContentLoaded", () => {
    const btnVolver = document.getElementById('btn-volver-menu');
    const inputBuscar = document.getElementById('buscador-nombre-eliminar');
    const listaSugerencias = document.getElementById('lista-sugerencias-eliminar');
    const seccionConfirmacion = document.getElementById('seccion-confirmacion');
    const btnConfirmar = document.getElementById('btn-confirmar-baja');
    const btnCancelar = document.getElementById('btn-cancelar-baja');

    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    let indiceSeleccionado = null;

    // ⬅️ Botón Atrás
    if (btnVolver) {
        btnVolver.addEventListener('click', () => { window.location.href = 'menu-pacientes.html'; });
    }

    if (!inputBuscar || !listaSugerencias) return;

    // 🔍 Escuchar la escritura del usuario
    inputBuscar.addEventListener('input', (e) => {
        let texto = e.target.value.toLowerCase().trim();
        listaSugerencias.innerHTML = '';

        if (texto === '') {
            seccionConfirmacion.style.display = 'none';
            listaSugerencias.style.display = 'none';
            return;
        }

        // Busca coincidencias en la memoria (LocalStorage)
        let coincidencias = [];
        listaPacientes.forEach((paciente, index) => {
            if (paciente.mascota && paciente.mascota.toLowerCase().includes(texto)) {
                coincidencias.push({ paciente, index });
            }
        });

        if (coincidencias.length === 0) {
            listaSugerencias.innerHTML = '<div style="padding: 12px; color: #64748b; font-style: italic; background: white; border: 1px solid #cbd5e1; border-radius: 8px;">No se encontraron mascotas</div>';
            listaSugerencias.style.display = 'block';
            seccionConfirmacion.style.display = 'none';
            return;
        }

        // Dibuja las sugerencias flotantes con fondo blanco
        coincidencias.forEach(item => {
            const divItem = document.createElement('div');
            divItem.style.padding = '12px';
            divItem.style.cursor = 'pointer';
            divItem.style.borderBottom = '1px solid #f1f5f9';
            divItem.style.background = 'white';
            divItem.style.color = '#1e293b';
            divItem.style.textAlign = 'left';
            divItem.style.fontSize = '15px';
            divItem.innerHTML = `🐾 <b>${item.paciente.mascota}</b> (${item.paciente.especie || 'Mascota'})`;

            divItem.addEventListener('mouseover', () => divItem.style.background = '#f8fafc');
            divItem.addEventListener('mouseout', () => divItem.style.background = 'white');

            // Clic en la sugerencia para seleccionarla
            divItem.addEventListener('click', () => {
                indiceSeleccionado = item.index;
                inputBuscar.value = item.paciente.mascota;
                listaSugerencias.style.display = 'none';

                // Inyecta los datos en el cuadro de advertencia
                document.getElementById('lbl-eliminar-nombre').textContent = item.paciente.mascota;
                document.getElementById('lbl-eliminar-dueño').textContent = item.paciente.propietario || "No registrado";

                // Muestra el recuadro rojo de confirmación
                seccionConfirmacion.style.display = "block";
            });

            listaSugerencias.appendChild(divItem);
        });

        listaSugerencias.style.display = 'block';
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target !== inputBuscar && e.target !== listaSugerencias) {
            listaSugerencias.style.display = 'none';
        }
    });

    // 🗑️ Confirmar Eliminación (Borrado real de la memoria)
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (indiceSeleccionado === null) return;

            let nombreMascota = listaPacientes[indiceSeleccionado].mascota;

            // Saca el paciente de la lista
            listaPacientes.splice(indiceSeleccionado, 1);

            // Guarda la lista recortada de vuelta en el navegador
            localStorage.setItem('pacientes', JSON.stringify(listaPacientes));

            alert(`El paciente "${nombreMascota}" ha sido eliminado del sistema con éxito.`);
            window.location.href = 'menu-pacientes.html'; // Nos regresa al submenú
        });
    }

    // Botón Cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            seccionConfirmacion.style.display = "none";
            inputBuscar.value = "";
            indiceSeleccionado = null;
        });
    }
});
