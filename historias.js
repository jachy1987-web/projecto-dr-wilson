document.addEventListener("DOMContentLoaded", () => {
    const inputBuscar = document.getElementById('buscador-nombre-ver-historias');
    const listaSugerencias = document.getElementById('lista-sugerencias-ver-historias');

    //  Lee las mascotas registradas en el otro módulo
    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

    if (!inputBuscar || !listaSugerencias) return;

    inputBuscar.addEventListener('input', (e) => {
        let texto = e.target.value.toLowerCase().trim();
        listaSugerencias.innerHTML = '';

        if (texto === '') {
            listaSugerencias.style.display = 'none';
            return;
        }

        // Filtra sobre los pacientes reales registrados en el sistema
        let coincidencias = listaPacientes.filter(p => p.mascota && p.mascota.toLowerCase().includes(texto));

        if (coincidencias.length === 0) {
            listaSugerencias.innerHTML = '<div style="padding:12px; background:white; font-style:italic; color:#64748b;">Mascota no encontrada</div>';
            listaSugerencias.style.display = 'block';
            return;
        }

        coincidencias.forEach(paciente => {
            const divItem = document.createElement('div');
            divItem.style.padding = "12px";
            divItem.style.cursor = "pointer";
            divItem.style.background = "#fff";
            divItem.style.borderBottom = "1px solid #eee";
            divItem.innerHTML = `🐾 <b>${paciente.mascota}</b> (${paciente.especie || 'Paciente'});`;
            
            divItem.addEventListener('click', () => {
                inputBuscar.value = paciente.mascota;
                listaSugerencias.style.display = 'none';

                // Guarda el identificador único o el nombre para la otra pantalla
                localStorage.setItem('mascota_activa', paciente.mascota.toLowerCase());

                // Redirige al menú móvil
                window.location.href = "menu-historias.html";
            });

            listaSugerencias.appendChild(divItem);
        });

        listaSugerencias.style.display = 'block';
    });
});
