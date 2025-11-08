// Verifico sesion
if (localStorage.getItem('sesionActiva') !== 'true') {
    window.location.href = 'index.html';
}

let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
document.getElementById('nombreUsuario').textContent = usuarioActual.usuario;

function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

let bitacoras = JSON.parse(localStorage.getItem('bitacoras')) || [];

// Cargo la tabla de bitacoras
function cargarTablaBitacoras() {
    let tbody = document.getElementById('tablaBitacoras');
    
    if (bitacoras.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros en la bitacora</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    // Muestro las bitacoras mas recientes primero
    let bitacorasOrdenadas = [...bitacoras].reverse();
    
    bitacorasOrdenadas.forEach(bitacora => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bitacora.idBitacora}</td>
            <td>${bitacora.usuario}</td>
            <td>${new Date(bitacora.fechaAcceso).toLocaleString()}</td>
            <td>${bitacora.accionRealizada}</td>
            <td>${bitacora.modulo}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Limpio todas las bitacoras
function limpiarBitacoras() {
    if (confirm('¿Estas seguro de limpiar todas las bitacoras? Esta accion no se puede deshacer.')) {
        bitacoras = [];
        localStorage.setItem('bitacoras', JSON.stringify(bitacoras));
        cargarTablaBitacoras();
        
        // Registro esta accion en la bitacora
        registrarAccion('Limpieza de bitacoras', 'Bitacoras');
    }
}

// Busqueda de bitacoras
document.getElementById('buscarBitacora').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaBitacoras');
    
    if (termino === '') {
        cargarTablaBitacoras();
        return;
    }
    
    let bitacorasFiltradas = bitacoras.filter(b => 
        b.usuario.toLowerCase().includes(termino) ||
        b.accionRealizada.toLowerCase().includes(termino) ||
        b.modulo.toLowerCase().includes(termino)
    );
    
    if (bitacorasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No se encontraron registros</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    let bitacorasOrdenadas = [...bitacorasFiltradas].reverse();
    
    bitacorasOrdenadas.forEach(bitacora => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bitacora.idBitacora}</td>
            <td>${bitacora.usuario}</td>
            <td>${new Date(bitacora.fechaAcceso).toLocaleString()}</td>
            <td>${bitacora.accionRealizada}</td>
            <td>${bitacora.modulo}</td>
        `;
        tbody.appendChild(tr);
    });
});

// Funcion para registrar acciones (esta se usaria en todos los modulos)
function registrarAccion(accion, modulo) {
    let bitacora = {
        idBitacora: Date.now(),
        idUsuario: usuarioActual.idUsuario,
        usuario: usuarioActual.usuario,
        fechaAcceso: new Date().toISOString(),
        accionRealizada: accion,
        modulo: modulo
    };
    
    bitacoras.push(bitacora);
    localStorage.setItem('bitacoras', JSON.stringify(bitacoras));
}

// Registro que el usuario accedio a esta pagina
registrarAccion('Consulta de bitacoras', 'Bitacoras');

cargarTablaBitacoras();