document.addEventListener("DOMContentLoaded", () => {
    const tablaCuerpo = document.getElementById('tabla-cuerpo-citas');
    let listaCitas = JSON.parse(localStorage.getItem('citas')) || [];

    // 🔄 FUNCIÓN PARA DIBUJAR LA TABLA DE CITAS CON ESTADOS Y DOBLE BOTÓN
    function cargarTablaCitas() {
        tablaCuerpo.innerHTML = '';

        if (listaCitas.length === 0) {
            tablaCuerpo.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #64748b; font-style: italic; padding: 20px;">
                        No hay ninguna cita médica programada actualmente.
                    </td>
                </tr>
            `;
            return;
        }

        listaCitas.forEach((cita, index) => {
            // Si la cita no tiene estado asignado al registrarse, por defecto está 'Pendiente'
            if (!cita.estado) {
                cita.estado = 'Pendiente';
            }

            // Definimos el estilo de la etiqueta según el estado
            let badgeClase = cita.estado === 'Atendido' ? 'estado-atendido' : 'estado-pendiente';

            // Si ya fue atendida, oculta los botones para que no se altere el registro
            let botonesHTML = '';
            if (cita.estado === 'Pendiente') {
                botonesHTML = `
                    <button class="btn-confirmar-cita" data-index="${index}">Confirmar</button>
                    <button class="btn-cancelar-cita" data-index="${index}">Cancelar Cita</button>
                `;
            } else {
                botonesHTML = `<span style="color: #64748b; font-style: italic; font-size: 14px;">Cita Completada</span>`;
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><b>${cita.mascota}</b></td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.motivo}</td>
                <td><span class="badge-estado ${badgeClase}">${cita.estado}</span></td>
                <td style="text-align: center; display: flex; justify-content: center; gap: 5px;">
                    ${botonesHTML}
                </td>
            `;
            tablaCuerpo.appendChild(fila);
        });

        // Activa los eventos para ambos botones
        asignarEventosAcciones();
    }

    // ⚡ CONTROLADOR DE CLICS (CONFIRMAR Y CANCELAR)
    function asignarEventosAcciones() {
        // 1. Acciones para el botón verde Confirmar
        const botonesConfirmar = document.querySelectorAll('.btn-confirmar-cita');
        botonesConfirmar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                
                // Cambia el estado a Atendido en la memoria
                listaCitas[index].estado = 'Atendido';
                localStorage.setItem('citas', JSON.stringify(listaCitas));
                
                alert(`¡Cita de ${listaCitas[index].mascota} marcada como Atendida con éxito!`);
                cargarTablaCitas(); // Refrescar la interfaz
            });
        });

        // 2. Acciones para el botón rojo Cancelar
        const botonesCancelar = document.querySelectorAll('.btn-cancelar-cita');
        botonesCancelar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                const nombreMascota = listaCitas[index].mascota;

                if (confirm(`¿Está seguro de que desea cancelar de forma permanente la cita de ${nombreMascota}?`)) {
                    listaCitas.splice(index, 1); // La removemos
                    localStorage.setItem('citas', JSON.stringify(listaCitas));
                    cargarTablaCitas(); // Refrescamos
                    alert("Cita cancelada con éxito.");
                }
            });
        });
    }

    cargarTablaCitas();
});
