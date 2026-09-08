// ========================================================
// 1. FUNCIONALIDAD DE LOS BOTONES VOLVER (CONECTADOS AL MENÚ)
// ========================================================
const btnAtrasArriba = document.getElementById('btn-retroceder-registro');
const btnVolverAbajo = document.getElementById('btn-volver');

// El botón azul flotante de arriba
if (btnAtrasArriba) {
    btnAtrasArriba.addEventListener('click', function() {
        window.location.href = 'menu-pacientes.html'; 
    });
}

// El botón verde de abajo dentro del formulario
if (btnVolverAbajo) {
    btnVolverAbajo.addEventListener('click', function() {
        window.location.href = 'menu-pacientes.html'; 
    });
}


// 2. FUNCIONALIDAD DEL FORMULARIO (GUARDAR EN LOCALSTORAGE Y LIMPIAR)

const formularioPacientes = document.getElementById('form-paciente');
const btnLimpiar = document.getElementById('btn-limpiar');

if (formularioPacientes) {
    formularioPacientes.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita que la página se recargue

        // 1. Captura los valores usando tus ID reales del HTML
        const nombre = document.getElementById('nombre-paciente').value;
        const especieSelect = document.getElementById('especie').value;
        const raza = document.getElementById('raza').value || "No especificado";
        const edad = document.getElementById('edad').value || "0";
        const sexo = document.getElementById('sexo').value;
        const fechaNacimiento = document.getElementById('fecha-nacimiento').value || "No registrada";
        const propietarioID = document.getElementById('propietario-id').value;

        // Formatea el texto de la especie para que se vea bonito en la tabla de búsqueda
        let especieTexto = "Otro";
        if (especieSelect === "canino") especieTexto = "Perro (Canino)";
        if (especieSelect === "felino") especieTexto = "Gato (Felino)";
        if (especieSelect === "ave") especieTexto = "Ave";

        // 2. Lee los pacientes existentes en la memoria del navegador
        let listaPacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

        // 3. Crea el nuevo objeto mascota con todos tus datos
        let nuevoPaciente = {
            mascota: nombre,
            especie: especieTexto,
            raza: raza,
            edad: edad,
            sexo: sexo,
            fecha: fechaNacimiento,
            propietario: "CC: " + propietarioID, // Guardamos la cédula como propietario
            contacto: "ID: " + propietarioID,
            estado: 'Activo'
        };

        // 4. Guardamos la lista actualizada en el navegador
        listaPacientes.push(nuevoPaciente);
        localStorage.setItem('pacientes', JSON.stringify(listaPacientes));

        // 5. Alerta de éxito y redirección
        alert(`¡Paciente registrado con éxito! \n${nombre} ya quedó guardado en el sistema.`);
        formularioPacientes.reset();
        
        //  redirige automáticamente a la pantalla de las 5 opciones
        window.location.href = 'menu-pacientes.html';
    });
}

// Configuración del botón Limpiar para borrar los campos escritos
if (btnLimpiar && formularioPacientes) {
    btnLimpiar.addEventListener('click', function() {
        formularioPacientes.reset();
    });
}
