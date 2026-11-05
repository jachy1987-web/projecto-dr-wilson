const listaDeTarjetas = document.querySelectorAll('.tarjetas .tarjeta');

if (listaDeTarjetas.length > 0) {
    listaDeTarjetas[0].addEventListener('click', function() {
        window.location.href = 'principal.html'; 
    });
}
