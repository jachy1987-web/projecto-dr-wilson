async function ingresar() {

    const correo = document.getElementById("correo").value.trim();

    const contrasena = document.getElementById("contrasena").value.trim();

    if(correo === "" || contrasena === "") {

        alert("Debe ingresar correo y contraseña");

        return;
    }

    const datos = {
        correo: correo,
        contrasena: contrasena
    };

    try {

        const respuesta = await fetch("http://localhost:3001/api/usuarios/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado = await respuesta.json();

        if(respuesta.ok) {

            alert(resultado.mensaje);

            window.location.href = "principal.html";

        } else {

            alert(resultado.mensaje);

        }

    } catch(error) {

        console.error(error);

        alert("No fue posible conectar con el servidor");

    }

}