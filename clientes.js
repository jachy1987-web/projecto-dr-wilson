const formulario = document.getElementById("formularioClientes");
formulario.addEventListener("submit", function(event){

    event.preventDefault();

const nombre = document.getElementById("nombre").value.trim();
const apellido = document.getElementById("apellido").value.trim();
const tipoDocumento = document.getElementById("tipoDocumento").value;
const documento = document.getElementById("documento").value.trim();
const telefono = document.getElementById("telefono").value.trim();
const correo = document.getElementById("correo").value.trim();
const direccion = document.getElementById("direccion").value.trim();

if(nombre.length < 3) {
    alert(" el nombre debe tener al menos 3 caracteres");
    return;

}

if(apellido.length < 3) {
    alert("El apellido debe tener al menos 3 caracteres");
    return;
}

if(documento.length < 5) {
    alert("el documento debe tener al menos 5 caracteres");
    return;
}

if(telefono.length < 7) {
    alert("el telefono deber tener al menor 7 caracteres");
    return;

}

if(!correo.includes("@")) {
    alert(" ingrese un correo valido");
    return;

}

if(direccion.length < 5) {
    alert("la direccion debe tener al menos 5 caracteres");
    return;

}

alert("cliente registrado correctamente");


});

