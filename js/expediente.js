document.addEventListener("DOMContentLoaded", () => {
    const mascotaActiva = localStorage.getItem('mascota_activa');
    const seccionActiva = localStorage.getItem('seccion_activa');
    
    let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    let listaHistoriales = JSON.parse(localStorage.getItem('historiales')) || [];

    if (!mascotaActiva) {
        window.location.href = "historias.html";
        return;
    }

    // 1. Buscar datos maestros del paciente
    const indicePaciente = listaPacientes.findIndex(p => p.mascota.toLowerCase() === mascotaActiva);
    const paciente = listaPacientes[indicePaciente];

    // 2. Buscar si ya tiene un historial clínico registrado
    let historial = listaHistoriales.find(h => h.mascota.toLowerCase() === mascotaActiva);
    if (!historial) {
        historial = { peso: "", temperatura: "", diagnostico: "", vacunas: "", tratamiento: "" };
    }

    if (paciente) {
        // Cargar inputs generales
        document.getElementById('hj-mascota').value = paciente.mascota;
        document.getElementById('hj-especie').value = paciente.especie || "";
        document.getElementById('hj-propietario-id').value = paciente.propietario || "";
        document.getElementById('hj-propietario-nombre').value = paciente.propietarioNombre || "";
        
        // Cargar inputs clínicos
        document.getElementById('hj-peso').value = historial.peso || "";
        document.getElementById('hj-temp').value = historial.temperatura || "";
        document.getElementById('hj-diagnostico').value = historial.diagnostico || "";
        document.getElementById('hj-vacunas-input').value = historial.vacunas || "";
        document.getElementById('hj-tratamiento').value = historial.tratamiento || "";
    }

    // Pone el cursor en el campo que elegiste en la tarjeta
    if (seccionActiva) {
        setTimeout(() => {
            const elemento = document.getElementById(seccionActiva);
            if (elemento) {
                elemento.focus();
                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);
    }

    // 4. 💾 GUARDAR EXPEDIENTE CLÍNICO
    document.getElementById('form-hoja-grande').addEventListener('submit', (e) => {
        e.preventDefault();

        if (indicePaciente === -1) return;

        // Actualizar datos maestros en pacientes
        listaPacientes[indicePaciente].mascota = document.getElementById('hj-mascota').value;
        listaPacientes[indicePaciente].especie = document.getElementById('hj-especie').value;
        listaPacientes[indicePaciente].propietario = document.getElementById('hj-propietario-id').value;
        listaPacientes[indicePaciente].propietarioNombre = document.getElementById('hj-propietario-nombre').value;
        localStorage.setItem('pacientes', JSON.stringify(listaPacientes));

        // Actualizar o insertar en historiales clínicos
        let indiceHistorial = listaHistoriales.findIndex(h => h.mascota.toLowerCase() === mascotaActiva);
        const nuevosDatosHistorial = {
            mascota: document.getElementById('hj-mascota').value,
            peso: document.getElementById('hj-peso').value,
            temperatura: document.getElementById('hj-temp').value,
            diagnostico: document.getElementById('hj-diagnostico').value,
            vacunas: document.getElementById('hj-vacunas-input').value,
            tratamiento: document.getElementById('hj-tratamiento').value
        };

        if (indiceHistorial !== -1) {
            listaHistoriales[indiceHistorial] = nuevosDatosHistorial;
        } else {
            listaHistoriales.push(nuevosDatosHistorial);
        }

        localStorage.setItem('historiales', JSON.stringify(listaHistoriales));
        localStorage.setItem('mascota_activa', nuevosDatosHistorial.mascota.toLowerCase());

        // Regresar de manera directa y limpia al menú móvil sin alertas intermedias
        window.location.href = "menu-historias.html";
    });
});
