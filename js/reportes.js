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

let reportes = JSON.parse(localStorage.getItem('reportes')) || [];
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let medicos = JSON.parse(localStorage.getItem('medicos')) || [];

// Cargo los selects
function cargarSelects() {
    let selectPaciente = document.getElementById('idPaciente');
    let selectMedico = document.getElementById('idMedico');
    
    selectPaciente.innerHTML = '<option value="">Todos</option>';
    selectMedico.innerHTML = '<option value="">Todos</option>';
    
    pacientes.forEach(p => {
        let option = document.createElement('option');
        option.value = p.idPaciente;
        option.textContent = p.nombreCompleto;
        selectPaciente.appendChild(option);
    });
    
    medicos.forEach(m => {
        let option = document.createElement('option');
        option.value = m.idMedico;
        option.textContent = m.nombreCompleto;
        selectMedico.appendChild(option);
    });
}

// Cargo la tabla de reportes
function cargarTablaReportes() {
    let tbody = document.getElementById('tablaReportes');
    
    if (reportes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay reportes generados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    reportes.forEach(reporte => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reporte.idReporte}</td>
            <td>${reporte.tipoReporte}</td>
            <td>${new Date(reporte.fechaGeneracion).toLocaleString()}</td>
            <td>${reporte.generadoPor}</td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="verReporte(${reporte.idReporte})">Ver</button>
                <button class="boton-icono" onclick="eliminarReporte(${reporte.idReporte})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Manejo el formulario de generar reporte
document.getElementById('formularioReporte').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let reporte = {
        idReporte: Date.now(),
        tipoReporte: document.getElementById('tipoReporte').value,
        idPaciente: document.getElementById('idPaciente').value ? parseInt(document.getElementById('idPaciente').value) : null,
        idMedico: document.getElementById('idMedico').value ? parseInt(document.getElementById('idMedico').value) : null,
        fechaGeneracion: new Date().toISOString(),
        rutaArchivo: `/reportes/${Date.now()}.pdf`,
        descripcion: `Reporte ${document.getElementById('tipoReporte').value}`,
        generadoPor: usuarioActual.usuario
    };
    
    reportes.push(reporte);
    localStorage.setItem('reportes', JSON.stringify(reportes));
    
    alert('Reporte generado exitosamente');
    document.getElementById('formularioReporte').reset();
    cargarTablaReportes();
});

// Ver detalles del reporte
function verReporte(id) {
    let reporte = reportes.find(r => r.idReporte === id);
    if (reporte) {
        alert(`Reporte ID: ${reporte.idReporte}\nTipo: ${reporte.tipoReporte}\nFecha: ${new Date(reporte.fechaGeneracion).toLocaleString()}\nRuta: ${reporte.rutaArchivo}`);
    }
}

// Elimino un reporte
function eliminarReporte(id) {
    if (confirm('¿Estas seguro de eliminar este reporte?')) {
        reportes = reportes.filter(r => r.idReporte !== id);
        localStorage.setItem('reportes', JSON.stringify(reportes));
        cargarTablaReportes();
    }
}

cargarSelects();
cargarTablaReportes();