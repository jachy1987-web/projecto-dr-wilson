document.addEventListener("DOMContentLoaded", () => {
    const btnVolver = document.getElementById('btn-volver-menu');
    const inputBuscar = document.getElementById('buscador-nombre-edit');
    const listaSugerencias = document.getElementById('lista-sugerencias-edit');
    const seccionFormulario = document.getElementById('seccion-formulario');
    const formEditar = document.getElementById('form-editar');
    const btnCancelar = document.getElementById('btn-cancelar');

    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    let indiceSeleccionado = null;

    if (btnVolver) {
        btnVolver.addEventListener('click', () => { window.location.href = 'menu-pacientes.html'; });
    }

    if (!inputBuscar || !listaSugerencias) return;

    // Escuchar la escritura del usuario en tiempo real
    inputBuscar.addEventListener('input', (e) => {
        let texto = e.target.value.toLowerCase().trim();
        listaSugerencias.innerHTML = '';

        if (texto === '') {
            listaSugerencias.style.display = 'none';
            return;
        }

        let coincidencias = [];
        listaPacientes.forEach((paciente, index) => {
            if (paciente.mascota && paciente.mascota.toLowerCase().includes(texto)) {
                coincidencias.push({ paciente, index });
            }
        });

        if (coincidencias.length === 0) {
            listaSugerencias.innerHTML = '<div style="padding: 12px; color: #64748b; font-style: italic; background: white; border: 1px solid #cbd5e1; border-radius: 8px;">No se encontraron mascotas</div>';
            listaSugerencias.style.display = 'block';
            return;
        }

        // Dibujar dinámicamente la lista de sugerencias con sus estilos limpios
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

            // Clic en una mascota de la lista predictiva
            divItem.addEventListener('click', () => {
                indiceSeleccionado = item.index;
                inputBuscar.value = item.paciente.mascota;
                listaSugerencias.style.display = 'none';

                // Llena el formulario de edición con los datos de la memoria
                document.getElementById('edit-nombre').value = item.paciente.mascota;
                document.getElementById('edit-especie').value = item.paciente.especie || 'Perro (Canino)';
                document.getElementById('edit-raza').value = item.paciente.raza || "";
                document.getElementById('edit-edad').value = item.paciente.edad || "0";
                document.getElementById('edit-sexo').value = item.paciente.sexo || "macho";
                document.getElementById('edit-fecha').value = item.paciente.fecha || "";
                
                if (item.paciente.propietario) {
                    document.getElementById('edit-propietario').value = item.paciente.propietario.replace("CC: ", "");
                }

                seccionFormulario.style.display = "block";
            });

            listaSugerencias.appendChild(divItem);
        });

        listaSugerencias.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (e.target !== inputBuscar && e.target !== listaSugerencias) {
            listaSugerencias.style.display = 'none';
        }
    });

    if (formEditar) {
        formEditar.addEventListener('submit', (event) => {
            event.preventDefault();
            if (indiceSeleccionado === null) return;

            const propietarioID = document.getElementById('edit-propietario').value;

            listaPacientes[indiceSeleccionado] = {
                mascota: document.getElementById('edit-nombre').value,
                especie: document.getElementById('edit-especie').value,
                raza: document.getElementById('edit-raza').value || "No especificado",
                edad: document.getElementById('edit-edad').value || "0",
                sexo: document.getElementById('edit-sexo').value,
                fecha: document.getElementById('edit-fecha').value || "No registrada",
                propietario: "CC: " + propietarioID,
                contacto: "ID: " + propietarioID,
                estado: 'Activo'
            };

            localStorage.setItem('pacientes', JSON.stringify(listaPacientes));
            alert("¡Los datos del paciente han sido actualizados con éxito!");
            window.location.href = 'menu-pacientes.html';
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            seccionFormulario.style.display = "none";
            formEditar.reset();
            inputBuscar.value = "";
        });
    }
});
