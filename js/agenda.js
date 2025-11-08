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

let citas = JSON.parse(localStorage.getItem('citas')) || [];
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let medicos = JSON.parse(localStorage.getItem('medicos')) || [];
let editando = false;

// Cargo los selects de pacientes y medicos
function cargarSelects() {
    let selectPaciente = document.getElementById('idPaciente');
    let selectMedico = document.getElementById('idMedico');
    
    selectPaciente.innerHTML = '<option value="">Seleccionar paciente</option>';
    selectMedico.innerHTML = '<option value="">Seleccionar medico</option>';
    
    pacientes.forEach(p => {
        if (p.estatus === 1) {
            let option = document.createElement('option');
            option.value = p.idPaciente;
            option.textContent = p.nombreCompleto;
            selectPaciente.appendChild(option);
        }
    });
    
    medicos.forEach(m => {
        if (m.estatus === 1) {
            let option = document.createElement('option');
            option.value = m.idMedico;
            option.textContent = m.nombreCompleto;
            selectMedico.appendChild(option);
        }
    });
}

// Cargo la tabla de citas
function cargarTablaCitas() {
    let tbody = document.getElementById('tablaCitas');
    
    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay citas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    citas.forEach(cita => {
        let paciente = pacientes.find(p => p.idPaciente === cita.idPaciente);
        let medico = medicos.find(m => m.idMedico === cita.idMedico);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cita.idCita}</td>
            <td>${paciente ? paciente.nombreCompleto : 'N/A'}</td>
            <td>${medico ? medico.nombreCompleto : 'N/A'}</td>
            <td>${new Date(cita.fechaCita).toLocaleString()}</td>
            <td>${cita.motivoConsulta}</td>
            <td><span class="estado estado-${cita.estadoCita.toLowerCase()}">${cita.estadoCita}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarCita(${cita.idCita})">Editar</button>
                <button class="boton-icono" onclick="eliminarCita(${cita.idCita})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nueva cita
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nueva Cita';
    document.getElementById('formularioCita').reset();
    document.getElementById('idCita').value = '';
    cargarSelects();
    document.getElementById('modalCita').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalCita').classList.remove('activo');
}

// Edito una cita
function editarCita(id) {
    editando = true;
    let cita = citas.find(c => c.idCita === id);
    
    if (cita) {
        document.getElementById('tituloModal').textContent = 'Editar Cita';
        document.getElementById('idCita').value = cita.idCita;
        cargarSelects();
        document.getElementById('idPaciente').value = cita.idPaciente;
        document.getElementById('idMedico').value = cita.idMedico;
        document.getElementById('fechaCita').value = cita.fechaCita.substring(0, 16);
        document.getElementById('motivoConsulta').value = cita.motivoConsulta;
        document.getElementById('estadoCita').value = cita.estadoCita;
        document.getElementById('observaciones').value = cita.observaciones;
        
        document.getElementById('modalCita').classList.add('activo');
    }
}

// Elimino una cita
function eliminarCita(id) {
    if (confirm('¿Estas seguro de eliminar esta cita?')) {
        citas = citas.filter(c => c.idCita !== id);
        localStorage.setItem('citas', JSON.stringify(citas));
        cargarTablaCitas();
    }
}

// Manejo el formulario
document.getElementById('formularioCita').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let cita = {
        idCita: editando ? parseInt(document.getElementById('idCita').value) : Date.now(),
        idPaciente: parseInt(document.getElementById('idPaciente').value),
        idMedico: parseInt(document.getElementById('idMedico').value),
        fechaCita: document.getElementById('fechaCita').value,
        motivoConsulta: document.getElementById('motivoConsulta').value,
        estadoCita: document.getElementById('estadoCita').value,
        observaciones: document.getElementById('observaciones').value,
        fechaRegistro: editando ? citas.find(c => c.idCita === parseInt(document.getElementById('idCita').value)).fechaRegistro : new Date().toISOString()
    };
    
    if (editando) {
        let index = citas.findIndex(c => c.idCita === cita.idCita);
        citas[index] = cita;
    } else {
        citas.push(cita);
    }
    
    localStorage.setItem('citas', JSON.stringify(citas));
    cerrarModal();
    cargarTablaCitas();
});

// Busqueda de citas
document.getElementById('buscarCita').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaCitas');
    
    if (termino === '') {
        cargarTablaCitas();
        return;
    }
    
    let citasFiltradas = citas.filter(c => {
        let paciente = pacientes.find(p => p.idPaciente === c.idPaciente);
        let medico = medicos.find(m => m.idMedico === c.idMedico);
        return (paciente && paciente.nombreCompleto.toLowerCase().includes(termino)) ||
               (medico && medico.nombreCompleto.toLowerCase().includes(termino)) ||
               c.motivoConsulta.toLowerCase().includes(termino);
    });
    
    if (citasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron citas</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    citasFiltradas.forEach(cita => {
        let paciente = pacientes.find(p => p.idPaciente === cita.idPaciente);
        let medico = medicos.find(m => m.idMedico === cita.idMedico);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cita.idCita}</td>
            <td>${paciente ? paciente.nombreCompleto : 'N/A'}</td>
            <td>${medico ? medico.nombreCompleto : 'N/A'}</td>
            <td>${new Date(cita.fechaCita).toLocaleString()}</td>
            <td>${cita.motivoConsulta}</td>
            <td><span class="estado estado-${cita.estadoCita.toLowerCase()}">${cita.estadoCita}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarCita(${cita.idCita})">Editar</button>
                <button class="boton-icono" onclick="eliminarCita(${cita.idCita})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

cargarTablaCitas();