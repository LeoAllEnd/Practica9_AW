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

let pagos = JSON.parse(localStorage.getItem('pagos')) || [];
let citas = JSON.parse(localStorage.getItem('citas')) || [];
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let editando = false;

// Cargo los selects
function cargarSelects() {
    let selectCita = document.getElementById('idCita');
    let selectPaciente = document.getElementById('idPaciente');
    
    selectCita.innerHTML = '<option value="">Seleccionar cita</option>';
    selectPaciente.innerHTML = '<option value="">Seleccionar paciente</option>';
    
    citas.forEach(c => {
        let option = document.createElement('option');
        option.value = c.idCita;
        option.textContent = `Cita #${c.idCita} - ${new Date(c.fechaCita).toLocaleString()}`;
        selectCita.appendChild(option);
    });
    
    pacientes.forEach(p => {
        let option = document.createElement('option');
        option.value = p.idPaciente;
        option.textContent = p.nombreCompleto;
        selectPaciente.appendChild(option);
    });
}

// Cargo la tabla de pagos
function cargarTablaPagos() {
    let tbody = document.getElementById('tablaPagos');
    
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay pagos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    pagos.forEach(pago => {
        let paciente = pacientes.find(p => p.idPaciente === pago.idPaciente);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pago.idPago}</td>
            <td>${pago.idCita}</td>
            <td>${paciente ? paciente.nombreCompleto : 'N/A'}</td>
            <td>$${pago.monto.toFixed(2)}</td>
            <td>${pago.metodoPago}</td>
            <td><span class="estado estado-${pago.estatusPago.toLowerCase()}">${pago.estatusPago}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarPago(${pago.idPago})">Editar</button>
                <button class="boton-icono" onclick="eliminarPago(${pago.idPago})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nuevo pago
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Registrar Pago';
    document.getElementById('formularioPago').reset();
    document.getElementById('idPago').value = '';
    cargarSelects();
    document.getElementById('modalPago').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalPago').classList.remove('activo');
}

// Edito un pago
function editarPago(id) {
    editando = true;
    let pago = pagos.find(p => p.idPago === id);
    
    if (pago) {
        document.getElementById('tituloModal').textContent = 'Editar Pago';
        document.getElementById('idPago').value = pago.idPago;
        cargarSelects();
        document.getElementById('idCita').value = pago.idCita;
        document.getElementById('idPaciente').value = pago.idPaciente;
        document.getElementById('monto').value = pago.monto;
        document.getElementById('metodoPago').value = pago.metodoPago;
        document.getElementById('referencia').value = pago.referencia;
        document.getElementById('estatusPago').value = pago.estatusPago;
        
        document.getElementById('modalPago').classList.add('activo');
    }
}

// Elimino un pago
function eliminarPago(id) {
    if (confirm('¿Estas seguro de eliminar este pago?')) {
        pagos = pagos.filter(p => p.idPago !== id);
        localStorage.setItem('pagos', JSON.stringify(pagos));
        cargarTablaPagos();
    }
}

// Manejo el formulario
document.getElementById('formularioPago').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let pago = {
        idPago: editando ? parseInt(document.getElementById('idPago').value) : Date.now(),
        idCita: parseInt(document.getElementById('idCita').value),
        idPaciente: parseInt(document.getElementById('idPaciente').value),
        monto: parseFloat(document.getElementById('monto').value),
        metodoPago: document.getElementById('metodoPago').value,
        fechaPago: new Date().toISOString(),
        referencia: document.getElementById('referencia').value,
        estatusPago: document.getElementById('estatusPago').value
    };
    
    if (editando) {
        let index = pagos.findIndex(p => p.idPago === pago.idPago);
        pagos[index] = pago;
    } else {
        pagos.push(pago);
    }
    
    localStorage.setItem('pagos', JSON.stringify(pagos));
    cerrarModal();
    cargarTablaPagos();
});

// Busqueda de pagos
document.getElementById('buscarPago').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaPagos');
    
    if (termino === '') {
        cargarTablaPagos();
        return;
    }
    
    let pagosFiltrados = pagos.filter(p => {
        let paciente = pacientes.find(pac => pac.idPaciente === p.idPaciente);
        return p.idPago.toString().includes(termino) ||
               p.metodoPago.toLowerCase().includes(termino) ||
               p.estatusPago.toLowerCase().includes(termino) ||
               (paciente && paciente.nombreCompleto.toLowerCase().includes(termino));
    });
    
    if (pagosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron pagos</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    pagosFiltrados.forEach(pago => {
        let paciente = pacientes.find(p => p.idPaciente === pago.idPaciente);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pago.idPago}</td>
            <td>${pago.idCita}</td>
            <td>${paciente ? paciente.nombreCompleto : 'N/A'}</td>
            <td>$${pago.monto.toFixed(2)}</td>
            <td>${pago.metodoPago}</td>
            <td><span class="estado estado-${pago.estatusPago.toLowerCase()}">${pago.estatusPago}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarPago(${pago.idPago})">Editar</button>
                <button class="boton-icono" onclick="eliminarPago(${pago.idPago})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

cargarTablaPagos();