const formulario = document.getElementById("formularioClientes");

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const tipoDocumento = document.getElementById("tipoDocumento").value;
    const documento = document.getElementById("documento").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    if(nombre.length < 3) {
        alert("El nombre debe tener al menos 3 caracteres");
        return;
    }

    if(apellido.length < 3) {
        alert("El apellido debe tener al menos 3 caracteres");
        return;
    }

    if(documento.length < 5) {
        alert("El documento debe tener al menos 5 caracteres");
        return;
    }

    if(telefono.length < 7) {
        alert("El teléfono debe tener al menos 7 caracteres");
        return;
    }

    if(!correo.includes("@")) {
        alert("Ingrese un correo válido");
        return;
    }

    if(direccion.length < 5) {
        alert("La dirección debe tener al menos 5 caracteres");
        return;
    }

    const datos = {
        nombre: nombre,
        apellido: apellido,
        tipo_documento: tipoDocumento,
        documento: documento,
        telefono: telefono,
        correo: correo,
        direccion: direccion
    };

    try {

        const respuesta = await fetch("http://localhost:3001/api/propietarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if(respuesta.ok) {
            alert(resultado.mensaje);
            formulario.reset();
        } else {
            alert(resultado.mensaje);
        }

    } catch(error) {

        console.error(error);
        alert("No fue posible conectar con el servidor");

    }

});

async function cargarPropietarios() {

    const respuesta = await fetch("http://localhost:3001/api/propietarios");

    const propietarios = await respuesta.json();

    const cuerpoTabla = document.getElementById("cuerpoTablaPropietarios");

    propietarios.forEach(function(propietario) {
        const fila = document.createElement("tr");

        fila.innerHTML = `
      <td>${propietario.id_propietario}</td>
<td>${propietario.nombre}</td>
<td>${propietario.apellido}</td>
<td>${propietario.tipo_documento}</td>
<td>${propietario.documento}</td>
<td>${propietario.telefono}</td>
<td>${propietario.correo}</td>
<td>${propietario.direccion}</td> 

        `;

        cuerpoTabla.appendChild(fila);


});



}

cargarPropietarios();