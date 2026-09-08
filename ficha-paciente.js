document.addEventListener("DOMContentLoaded", () => {
    const btnVolver = document.getElementById('btn-volver-menu');
    const inputBuscar = document.getElementById('buscador-nombre-ficha');
    const listaSugerencias = document.getElementById('lista-sugerencias-ficha');
    const seccionFicha = document.getElementById('seccion-ficha');
    const btnCerrar = document.getElementById('btn-cerrar-ficha');

    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

    if (btnVolver) {
        btnVolver.addEventListener('click', () => { window.location.href = 'menu-pacientes.html'; });
    }

    // Si falta algún ID en el HTML, nos avisa en la consola del navegador (F12)
    if (!inputBuscar || !listaSugerencias) {
        console.error("Faltan IDs en ficha-paciente.html. Verifique 'buscador-nombre-ficha' y 'lista-sugerencias-ficha'");
        return;
    }

    // 🔍 Escuchar la escritura del usuario para filtrar la ficha
    inputBuscar.addEventListener('input', (e) => {
        let texto = e.target.value.toLowerCase().trim();
        listaSugerencias.innerHTML = '';

        if (texto === '') {
            listaSugerencias.style.display = 'none';
            return;
        }

        // Busca coincidencias en la memoria
        let coincidencias = [];
        listaPacientes.forEach((paciente, index) => {
            if (paciente.mascota && paciente.mascota.toLowerCase().includes(texto)) {
                coincidencias.push({ paciente, index });
            }
        });

        if (coincidencias.length === 0) {
            listaSugerencias.innerHTML = '<div style="padding: 12px; color: #64748b; font-style: italic; background: white;">No se encontraron mascotas</div>';
            listaSugerencias.style.display = 'block';
            return;
        }

        // Dibuja el cuadro con los resultados predictivos
        coincidencias.forEach(item => {
            const divItem = document.createElement('div');
            divItem.style.padding = '12px';
            divItem.style.cursor = 'pointer';
            divItem.style.borderBottom = '1px solid #f1f5f9';
            divItem.style.background = 'white';
            divItem.style.color = '#1e293b';
            divItem.style.textAlign = 'left';
            divItem.innerHTML = `🐾 <b>${item.paciente.mascota}</b> (${item.paciente.especie || 'Mascota'})`;

            divItem.addEventListener('mouseover', () => divItem.style.background = '#f8fafc');
            divItem.addEventListener('mouseout', () => divItem.style.background = 'white');

            // Al hacer clic en el nombre de la mascota sugerida
            divItem.addEventListener('click', () => {
                inputBuscar.value = item.paciente.mascota;
                listaSugerencias.style.display = 'none';

                // Inyecta los datos en el reporte clínico visual de la pantalla
                document.getElementById('lbl-nombre').textContent = item.paciente.mascota;
                document.getElementById('lbl-especie').textContent = item.paciente.especie || "No especificado";
                document.getElementById('lbl-raza').textContent = item.paciente.raza || "No especificado";
                document.getElementById('lbl-edad').textContent = (item.paciente.edad || "0") + " Años";
                document.getElementById('lbl-sexo').textContent = (item.paciente.sexo === "macho") ? "♂ Macho" : "♀ Hembra";
                document.getElementById('lbl-fecha').textContent = item.paciente.fecha || "No registrada";
                document.getElementById('lbl-propietario').textContent = item.paciente.propietario || "No especificado";

                // Mostramos el contenedor del Resumen Clínico
                seccionFicha.style.display = "block";
            });

            listaSugerencias.appendChild(divItem);
        });

        listaSugerencias.style.display = 'block';
    });

    // Cerrar el buscador flotante si el usuario hace clic en otra parte de la pantalla
    document.addEventListener('click', (e) => {
        if (e.target !== inputBuscar && e.target !== listaSugerencias) {
            listaSugerencias.style.display = 'none';
        }
    });

    // Acción del botón para ocultar la ficha abierta
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            seccionFicha.style.display = "none";
            inputBuscar.value = "";
        });
    }
});
