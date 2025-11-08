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

let especialidades = JSON.parse(localStorage.getItem('especialidades')) || [];
let editando = false;

// Cargo la tabla de especialidades
function cargarTablaEspecialidades() {
    let tbody = document.getElementById('tablaEspecialidades');
    
    if (especialidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay especialidades registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    especialidades.forEach(especialidad => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${especialidad.idEspecialidad}</td>
            <td>${especialidad.nombreEspecialidad}</td>
            <td>${especialidad.descripcion || 'Sin descripcion'}</td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarEspecialidad(${especialidad.idEspecialidad})">Editar</button>
                <button class="boton-icono" onclick="eliminarEspecialidad(${especialidad.idEspecialidad})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nueva especialidad
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nueva Especialidad';
    document.getElementById('formularioEspecialidad').reset();
    document.getElementById('idEspecialidad').value = '';
    document.getElementById('modalEspecialidad').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalEspecialidad').classList.remove('activo');
}

// Edito una especialidad
function editarEspecialidad(id) {
    editando = true;
    let especialidad = especialidades.find(e => e.idEspecialidad === id);
    
    if (especialidad) {
        document.getElementById('tituloModal').textContent = 'Editar Especialidad';
        document.getElementById('idEspecialidad').value = especialidad.idEspecialidad;
        document.getElementById('nombreEspecialidad').value = especialidad.nombreEspecialidad;
        document.getElementById('descripcion').value = especialidad.descripcion || '';
        
        document.getElementById('modalEspecialidad').classList.add('activo');
    }
}

// Elimino una especialidad
function eliminarEspecialidad(id) {
    if (confirm('¿Estas seguro de eliminar esta especialidad?')) {
        especialidades = especialidades.filter(e => e.idEspecialidad !== id);
        localStorage.setItem('especialidades', JSON.stringify(especialidades));
        cargarTablaEspecialidades();
    }
}

// Manejo el formulario
document.getElementById('formularioEspecialidad').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let especialidad = {
        idEspecialidad: editando ? parseInt(document.getElementById('idEspecialidad').value) : Date.now(),
        nombreEspecialidad: document.getElementById('nombreEspecialidad').value,
        descripcion: document.getElementById('descripcion').value
    };
    
    if (editando) {
        let index = especialidades.findIndex(e => e.idEspecialidad === especialidad.idEspecialidad);
        especialidades[index] = especialidad;
    } else {
        especialidades.push(especialidad);
    }
    
    localStorage.setItem('especialidades', JSON.stringify(especialidades));
    cerrarModal();
    cargarTablaEspecialidades();
});

// Busqueda de especialidades
document.getElementById('buscarEspecialidad').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaEspecialidades');
    
    if (termino === '') {
        cargarTablaEspecialidades();
        return;
    }
    
    let especialidadesFiltradas = especialidades.filter(esp => 
        esp.nombreEspecialidad.toLowerCase().includes(termino) ||
        (esp.descripcion && esp.descripcion.toLowerCase().includes(termino))
    );
    
    if (especialidadesFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No se encontraron especialidades</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    especialidadesFiltradas.forEach(especialidad => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${especialidad.idEspecialidad}</td>
            <td>${especialidad.nombreEspecialidad}</td>
            <td>${especialidad.descripcion || 'Sin descripcion'}</td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarEspecialidad(${especialidad.idEspecialidad})">Editar</button>
                <button class="boton-icono" onclick="eliminarEspecialidad(${especialidad.idEspecialidad})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

// Inicializo con algunas especialidades por defecto si no hay ninguna
if (especialidades.length === 0) {
    especialidades = [
        { idEspecialidad: 1, nombreEspecialidad: 'Medicina General', descripcion: 'Atencion medica general' },
        { idEspecialidad: 2, nombreEspecialidad: 'Pediatria', descripcion: 'Especialidad enfocada en ninos' },
        { idEspecialidad: 3, nombreEspecialidad: 'Cardiologia', descripcion: 'Especialidad del corazon' }
    ];
    localStorage.setItem('especialidades', JSON.stringify(especialidades));
}

cargarTablaEspecialidades();