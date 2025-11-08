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

let medicos = JSON.parse(localStorage.getItem('medicos')) || [];
let especialidades = JSON.parse(localStorage.getItem('especialidades')) || [];
let editando = false;

// Cargo el select de especialidades
function cargarSelectEspecialidades() {
    let select = document.getElementById('especialidadId');
    select.innerHTML = '<option value="">Seleccionar</option>';
    
    especialidades.forEach(e => {
        let option = document.createElement('option');
        option.value = e.idEspecialidad;
        option.textContent = e.nombreEspecialidad;
        select.appendChild(option);
    });
}

// Cargo la tabla de medicos
function cargarTablaMedicos() {
    let tbody = document.getElementById('tablaMedicos');
    
    if (medicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay medicos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    medicos.forEach(medico => {
        let especialidad = especialidades.find(e => e.idEspecialidad === medico.especialidadId);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${medico.idMedico}</td>
            <td>${medico.nombreCompleto}</td>
            <td>${medico.cedulaProfesional}</td>
            <td>${especialidad ? especialidad.nombreEspecialidad : 'N/A'}</td>
            <td>${medico.telefono}</td>
            <td><span class="estado ${medico.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${medico.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarMedico(${medico.idMedico})">Editar</button>
                <button class="boton-icono" onclick="eliminarMedico(${medico.idMedico})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nuevo medico
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nuevo Medico';
    document.getElementById('formularioMedico').reset();
    document.getElementById('idMedico').value = '';
    cargarSelectEspecialidades();
    document.getElementById('modalMedico').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalMedico').classList.remove('activo');
}

// Edito un medico
function editarMedico(id) {
    editando = true;
    let medico = medicos.find(m => m.idMedico === id);
    
    if (medico) {
        document.getElementById('tituloModal').textContent = 'Editar Medico';
        document.getElementById('idMedico').value = medico.idMedico;
        cargarSelectEspecialidades();
        document.getElementById('nombreCompleto').value = medico.nombreCompleto;
        document.getElementById('cedulaProfesional').value = medico.cedulaProfesional;
        document.getElementById('especialidadId').value = medico.especialidadId;
        document.getElementById('telefono').value = medico.telefono;
        document.getElementById('correoElectronico').value = medico.correoElectronico;
        document.getElementById('horarioAtencion').value = medico.horarioAtencion;
        document.getElementById('estatus').value = medico.estatus;
        
        document.getElementById('modalMedico').classList.add('activo');
    }
}

// Elimino un medico
function eliminarMedico(id) {
    if (confirm('¿Estas seguro de eliminar este medico?')) {
        medicos = medicos.filter(m => m.idMedico !== id);
        localStorage.setItem('medicos', JSON.stringify(medicos));
        cargarTablaMedicos();
    }
}

// Manejo el formulario
document.getElementById('formularioMedico').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let medico = {
        idMedico: editando ? parseInt(document.getElementById('idMedico').value) : Date.now(),
        nombreCompleto: document.getElementById('nombreCompleto').value,
        cedulaProfesional: document.getElementById('cedulaProfesional').value,
        especialidadId: parseInt(document.getElementById('especialidadId').value),
        telefono: document.getElementById('telefono').value,
        correoElectronico: document.getElementById('correoElectronico').value,
        horarioAtencion: document.getElementById('horarioAtencion').value,
        fechaIngreso: editando ? medicos.find(m => m.idMedico === parseInt(document.getElementById('idMedico').value)).fechaIngreso : new Date().toISOString(),
        estatus: parseInt(document.getElementById('estatus').value)
    };
    
    if (editando) {
        let index = medicos.findIndex(m => m.idMedico === medico.idMedico);
        medicos[index] = medico;
    } else {
        medicos.push(medico);
    }
    
    localStorage.setItem('medicos', JSON.stringify(medicos));
    cerrarModal();
    cargarTablaMedicos();
});

// Busqueda de medicos
document.getElementById('buscarMedico').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaMedicos');
    
    if (termino === '') {
        cargarTablaMedicos();
        return;
    }
    
    let medicosFiltrados = medicos.filter(m => {
        let especialidad = especialidades.find(e => e.idEspecialidad === m.especialidadId);
        return m.nombreCompleto.toLowerCase().includes(termino) ||
               m.cedulaProfesional.toLowerCase().includes(termino) ||
               (especialidad && especialidad.nombreEspecialidad.toLowerCase().includes(termino));
    });
    
    if (medicosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron medicos</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    medicosFiltrados.forEach(medico => {
        let especialidad = especialidades.find(e => e.idEspecialidad === medico.especialidadId);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${medico.idMedico}</td>
            <td>${medico.nombreCompleto}</td>
            <td>${medico.cedulaProfesional}</td>
            <td>${especialidad ? especialidad.nombreEspecialidad : 'N/A'}</td>
            <td>${medico.telefono}</td>
            <td><span class="estado ${medico.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${medico.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarMedico(${medico.idMedico})">Editar</button>
                <button class="boton-icono" onclick="eliminarMedico(${medico.idMedico})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

cargarTablaMedicos();