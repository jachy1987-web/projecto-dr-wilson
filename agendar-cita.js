document.addEventListener("DOMContentLoaded", () => {
    const inputBuscar = document.getElementById('cita-paciente');
    const listaSugerencias = document.getElementById('lista-sugerencias-citas');
    const formCita = document.getElementById('form-agendar-cita');

    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

    //  Motor predictivo para enlazar la cita a una mascota real
    inputBuscar.addEventListener('input', (e) => {
        let texto = e.target.value.toLowerCase().trim();
        listaSugerencias.innerHTML = '';

        if (texto === '') {
            listaSugerencias.style.display = 'none';
            return;
        }

        let coincidencias = listaPacientes.filter(p => p.mascota && p.mascota.toLowerCase().includes(texto));

        if (coincidencias.length === 0) {
            listaSugerencias.innerHTML = '<div style="padding: 12px; color: #64748b; font-style: italic; background: white;">Mascota no registrada (Se guardará como texto)</div>';
            listaSugerencias.style.display = 'block';
            return;
        }

        coincidencias.forEach(paciente => {
            const divItem = document.createElement('div');
            divItem.style.background = 'white';
            divItem.innerHTML = `🐾 <b>${paciente.mascota}</b> (${paciente.especie})`;
            
            divItem.addEventListener('click', () => {
                inputBuscar.value = paciente.mascota;
                listaSugerencias.style.display = 'none';
            });
            listaSugerencias.appendChild(divItem);
        });

        listaSugerencias.style.display = 'block';
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target !== inputBuscar) listaSugerencias.style.display = 'none';
    });

    //  Guardar la cita en LocalStorage
    if (formCita) {
        formCita.addEventListener('submit', (e) => {
            e.preventDefault();

            let listaCitas = JSON.parse(localStorage.getItem('citas')) || [];

            let nuevaCita = {
                mascota: document.getElementById('cita-paciente').value,
                fecha: document.getElementById('cita-fecha').value,
                hora: document.getElementById('cita-hora').value,
                motivo: document.getElementById('cita-motivo').value
            };

            listaCitas.push(nuevaCita);
            localStorage.setItem('citas', JSON.stringify(listaCitas));

            alert(`¡Cita para ${nuevaCita.mascota} programada con éxito!`);
            formCita.reset();
            window.location.href = 'menu-citas.html';
        });
    }
});
