document.addEventListener("DOMContentLoaded", () => {
    const mascotaActiva = localStorage.getItem('mascota_activa');
    const listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

    if (!mascotaActiva) {
        window.location.href = "historias.html";
        return;
    }

    // Cargar datos en los inputs superiores de la tarjeta móvil
    const paciente = listaPacientes.find(p => p.mascota.toLowerCase() === mascotaActiva);
    if (paciente) {
        document.getElementById('txt-clinico-nombre').value = paciente.mascota.toUpperCase();
        document.getElementById('txt-clinico-id').value = paciente.propietario || paciente.contacto || "S/N";
        document.getElementById('txt-clinico-dueño').value = paciente.propietarioNombre || "No registrado";
    }

    // REDIRECCIÓN DIRECTA A CADA PÁGINA ESPECÍFICA
    document.getElementById('tarjeta-datos').addEventListener('click', () => {
        window.location.href = "datos-mascota.html";
    });
    document.getElementById('tarjeta-antecedentes').addEventListener('click', () => {
        window.location.href = "antecedentes.html";
    });
    document.getElementById('tarjeta-vacunas').addEventListener('click', () => {
    window.location.href = "vacunacion-historias.html"; 
});

    document.getElementById('tarjeta-tratamientos').addEventListener('click', () => {
        window.location.href = "tratamientos.html";
    });
});
