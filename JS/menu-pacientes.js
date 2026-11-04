//  ARCHIVO DE LÓGICA REFORZADO: menu-pacientes.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. BOTÓN ATRÁS
    const btnRetroceder = document.getElementById('btn-retroceder');
    if (btnRetroceder) {
        btnRetroceder.addEventListener('click', () => { window.location.href = 'principal.html'; });
    }

    // 2. REGISTRAR
    const btnRegistrar = document.getElementById('sub-registrar');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', () => { window.location.href = 'Pacientes.html'; });
    }

    // 3. BUSCAR
    const btnBuscar = document.getElementById('sub-buscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => { window.location.href = 'buscar-paciente.html'; });
    }

    // 4. EDITAR
    const btnEditar = document.getElementById('sub-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => { window.location.href = 'editar-paciente.html'; });
    }

    // 5. FICHA
    const btnFicha = document.getElementById('sub-ficha');
    if (btnFicha) {
        btnFicha.addEventListener('click', () => { window.location.href = 'ficha-paciente.html'; });
    }

    // 6. ELIMINAR 
    const btnEliminar = document.getElementById('sub-eliminar');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => { 
            window.location.href = 'eliminar-paciente.html'; 
        });
    }
});
