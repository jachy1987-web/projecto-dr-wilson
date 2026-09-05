const formulario = document.getElementById("formularioRegistro");

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const confirmarContrasena = document.getElementById("confirmarContrasena").value.trim();

    if(
        nombre === "" ||
        apellido === "" ||
        documento === "" ||
        correo === "" ||
        contrasena === "" ||
        confirmarContrasena === ""
    ) {
        alert("Todos los campos son obligatorios");
        return;
    }

    if(contrasena !== confirmarContrasena) {
        alert("Las contraseñas no coinciden");
        return;
    }

    if(!correo.includes("@")) {
        alert("Ingrese un correo válido");
        return;
    }

    const datos = {
        nombre: nombre,
        apellido: apellido,
        documento: documento,
        correo: correo,
        contrasena: contrasena
    };

    try {

        const respuesta = await fetch(
            "http://localhost:3001/api/usuarios/registro",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if(respuesta.ok) {

            alert(resultado.mensaje);

            formulario.reset();

            window.location.href = "inicio.html";

        } else {

            alert(resultado.mensaje);

        }

    } catch(error) {

        console.error(error);

        alert("No fue posible conectar con el servidor");

    }

});