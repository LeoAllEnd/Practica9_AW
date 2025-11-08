// Verifico que haya sesion activa al cargar la pagina
if (localStorage.getItem('sesionActiva') !== 'true') {
    window.location.href = 'index.html';
}

// Cargo los datos del usuario
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
document.getElementById('nombreUsuario').textContent = usuarioActual.usuario;

// Funcion para cerrar sesion
function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// Cargo las estadisticas del dashboard
// En produccion esto se cargaria de la base de datos
function cargarEstadisticas() {
    // Simulo datos que vendrian de las tablas
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    let medicos = JSON.parse(localStorage.getItem('medicos')) || [];
    let pagos = JSON.parse(localStorage.getItem('pagos')) || [];
    
    document.getElementById('totalPacientes').textContent = pacientes.length;
    
    // Cuento citas de hoy
    let hoy = new Date().toISOString().split('T')[0];
    let citasHoy = citas.filter(c => c.fechaCita.startsWith(hoy)).length;
    document.getElementById('citasHoy').textContent = citasHoy;
    
    // Cuento medicos activos
    let medicosActivos = medicos.filter(m => m.estatus === 1).length;
    document.getElementById('medicosActivos').textContent = medicosActivos;
    
    // Cuento pagos pendientes
    let pagosPendientes = pagos.filter(p => p.estatusPago === 'Pendiente').length;
    document.getElementById('pagosPendientes').textContent = pagosPendientes;
}

// Cargo las citas recientes
function cargarCitasRecientes() {
    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    let medicos = JSON.parse(localStorage.getItem('medicos')) || [];
    
    let tbody = document.getElementById('tablaCitasRecientes');
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay citas recientes</td></tr>';
        return;
    }
    
    // Muestro las ultimas 5 citas
    tbody.innerHTML = '';
    citas.slice(0, 5).forEach(cita => {
        let paciente = pacientes.find(p => p.idPaciente === cita.idPaciente);
        let medico = medicos.find(m => m.idMedico === cita.idMedico);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${paciente ? paciente.nombreCompleto : 'N/A'}</td>
            <td>${medico ? medico.nombreCompleto : 'N/A'}</td>
            <td>${new Date(cita.fechaCita).toLocaleString()}</td>
            <td><span class="estado estado-${cita.estadoCita.toLowerCase()}">${cita.estadoCita}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Inicializo los datos si no existen
if (!localStorage.getItem('pacientes')) {
    localStorage.setItem('pacientes', JSON.stringify([]));
}
if (!localStorage.getItem('citas')) {
    localStorage.setItem('citas', JSON.stringify([]));
}
if (!localStorage.getItem('medicos')) {
    localStorage.setItem('medicos', JSON.stringify([]));
}
if (!localStorage.getItem('pagos')) {
    localStorage.setItem('pagos', JSON.stringify([]));
}

// Cargo todo al iniciar
cargarEstadisticas();
cargarCitasRecientes();