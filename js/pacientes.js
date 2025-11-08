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

let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let editando = false;

// Cargo la tabla de pacientes
function cargarTablaPacientes() {
    let tbody = document.getElementById('tablaPacientes');
    
    if (pacientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pacientes registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    pacientes.forEach(paciente => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${paciente.idPaciente}</td>
            <td>${paciente.nombreCompleto}</td>
            <td>${paciente.curp}</td>
            <td>${paciente.telefono}</td>
            <td><span class="estado ${paciente.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${paciente.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarPaciente(${paciente.idPaciente})">Editar</button>
                <button class="boton-icono" onclick="eliminarPaciente(${paciente.idPaciente})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nuevo paciente
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nuevo Paciente';
    document.getElementById('formularioPaciente').reset();
    document.getElementById('idPaciente').value = '';
    document.getElementById('modalPaciente').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalPaciente').classList.remove('activo');
}

// Edito un paciente
function editarPaciente(id) {
    editando = true;
    let paciente = pacientes.find(p => p.idPaciente === id);
    
    if (paciente) {
        document.getElementById('tituloModal').textContent = 'Editar Paciente';
        document.getElementById('idPaciente').value = paciente.idPaciente;
        document.getElementById('nombreCompleto').value = paciente.nombreCompleto;
        document.getElementById('curp').value = paciente.curp;
        document.getElementById('fechaNacimiento').value = paciente.fechaNacimiento;
        document.getElementById('sexo').value = paciente.sexo;
        document.getElementById('telefono').value = paciente.telefono;
        document.getElementById('correoElectronico').value = paciente.correoElectronico;
        document.getElementById('direccion').value = paciente.direccion;
        document.getElementById('contactoEmergencia').value = paciente.contactoEmergencia;
        document.getElementById('telefonoEmergencia').value = paciente.telefonoEmergencia;
        document.getElementById('alergias').value = paciente.alergias;
        document.getElementById('antecedentesMedicos').value = paciente.antecedentesMedicos;
        document.getElementById('estatus').value = paciente.estatus;
        
        document.getElementById('modalPaciente').classList.add('activo');
    }
}

// Elimino un paciente
function eliminarPaciente(id) {
    if (confirm('¿Estas seguro de eliminar este paciente?')) {
        pacientes = pacientes.filter(p => p.idPaciente !== id);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
        cargarTablaPacientes();
    }
}

// Manejo el formulario
document.getElementById('formularioPaciente').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let paciente = {
        idPaciente: editando ? parseInt(document.getElementById('idPaciente').value) : Date.now(),
        nombreCompleto: document.getElementById('nombreCompleto').value,
        curp: document.getElementById('curp').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        sexo: document.getElementById('sexo').value,
        telefono: document.getElementById('telefono').value,
        correoElectronico: document.getElementById('correoElectronico').value,
        direccion: document.getElementById('direccion').value,
        contactoEmergencia: document.getElementById('contactoEmergencia').value,
        telefonoEmergencia: document.getElementById('telefonoEmergencia').value,
        alergias: document.getElementById('alergias').value,
        antecedentesMedicos: document.getElementById('antecedentesMedicos').value,
        fechaRegistro: editando ? pacientes.find(p => p.idPaciente === parseInt(document.getElementById('idPaciente').value)).fechaRegistro : new Date().toISOString(),
        estatus: parseInt(document.getElementById('estatus').value)
    };
    
    if (editando) {
        // Actualizo el paciente existente
        let index = pacientes.findIndex(p => p.idPaciente === paciente.idPaciente);
        pacientes[index] = paciente;
    } else {
        // Agrego nuevo paciente
        pacientes.push(paciente);
    }
    
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    cerrarModal();
    cargarTablaPacientes();
});

// Busqueda de pacientes
document.getElementById('buscarPaciente').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaPacientes');
    
    if (termino === '') {
        cargarTablaPacientes();
        return;
    }
    
    let pacientesFiltrados = pacientes.filter(p => 
        p.nombreCompleto.toLowerCase().includes(termino) ||
        p.curp.toLowerCase().includes(termino) ||
        p.telefono.includes(termino)
    );
    
    if (pacientesFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron pacientes</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    pacientesFiltrados.forEach(paciente => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${paciente.idPaciente}</td>
            <td>${paciente.nombreCompleto}</td>
            <td>${paciente.curp}</td>
            <td>${paciente.telefono}</td>
            <td><span class="estado ${paciente.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${paciente.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarPaciente(${paciente.idPaciente})">Editar</button>
                <button class="boton-icono" onclick="eliminarPaciente(${paciente.idPaciente})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

cargarTablaPacientes();