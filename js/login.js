// Puse este listener para manejar el formulario de login
document.getElementById('formularioLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let usuario = document.getElementById('usuario').value;
    let contrasena = document.getElementById('contrasena').value;
    let mensajeError = document.getElementById('mensajeError');
    
    // Aqui validaria contra la base de datos pero por ahora solo simulo el login
    // En produccion esto se conectaria a la tabla usuarios
    if (usuario && contrasena) {
        // Guardo los datos del usuario en localStorage para usarlos en otras paginas
        let datosUsuario = {
            idUsuario: 1,
            usuario: usuario,
            rol: 'Admin',
            activo: true
        };
        
        localStorage.setItem('usuarioActual', JSON.stringify(datosUsuario));
        localStorage.setItem('sesionActiva', 'true');
        
        // Redirijo al dashboard
        window.location.href = 'dashboard.html';
    } else {
        mensajeError.textContent = 'Por favor ingresa usuario y contrasena';
        mensajeError.style.display = 'block';
    }
});

// Verifico si ya hay una sesion activa
if (localStorage.getItem('sesionActiva') === 'true') {
    window.location.href = 'dashboard.html';
}