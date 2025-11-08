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

let tarifas = JSON.parse(localStorage.getItem('tarifas')) || [];
let especialidades = JSON.parse(localStorage.getItem('especialidades')) || [];
let editando = false;

// Cargo el select de especialidades
function cargarSelectEspecialidades() {
    let select = document.getElementById('especialidadId');
    select.innerHTML = '<option value="">Ninguna</option>';
    
    especialidades.forEach(e => {
        let option = document.createElement('option');
        option.value = e.idEspecialidad;
        option.textContent = e.nombreEspecialidad;
        select.appendChild(option);
    });
}

// Cargo la tabla de tarifas
function cargarTablaTarifas() {
    let tbody = document.getElementById('tablaTarifas');
    
    if (tarifas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay tarifas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    tarifas.forEach(tarifa => {
        let especialidad = especialidades.find(e => e.idEspecialidad === tarifa.especialidadId);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tarifa.idTarifa}</td>
            <td>${tarifa.descripcionServicio}</td>
            <td>$${tarifa.costoBase.toFixed(2)}</td>
            <td>${especialidad ? especialidad.nombreEspecialidad : 'General'}</td>
            <td><span class="estado ${tarifa.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${tarifa.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarTarifa(${tarifa.idTarifa})">Editar</button>
                <button class="boton-icono" onclick="eliminarTarifa(${tarifa.idTarifa})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Abro modal para nueva tarifa
function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nueva Tarifa';
    document.getElementById('formularioTarifa').reset();
    document.getElementById('idTarifa').value = '';
    cargarSelectEspecialidades();
    document.getElementById('modalTarifa').classList.add('activo');
}

// Cierro el modal
function cerrarModal() {
    document.getElementById('modalTarifa').classList.remove('activo');
}

// Edito una tarifa
function editarTarifa(id) {
    editando = true;
    let tarifa = tarifas.find(t => t.idTarifa === id);
    
    if (tarifa) {
        document.getElementById('tituloModal').textContent = 'Editar Tarifa';
        document.getElementById('idTarifa').value = tarifa.idTarifa;
        cargarSelectEspecialidades();
        document.getElementById('descripcionServicio').value = tarifa.descripcionServicio;
        document.getElementById('costoBase').value = tarifa.costoBase;
        document.getElementById('especialidadId').value = tarifa.especialidadId || '';
        document.getElementById('estatus').value = tarifa.estatus;
        
        document.getElementById('modalTarifa').classList.add('activo');
    }
}

// Elimino una tarifa
function eliminarTarifa(id) {
    if (confirm('¿Estas seguro de eliminar esta tarifa?')) {
        tarifas = tarifas.filter(t => t.idTarifa !== id);
        localStorage.setItem('tarifas', JSON.stringify(tarifas));
        cargarTablaTarifas();
    }
}

// Manejo el formulario
document.getElementById('formularioTarifa').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let tarifa = {
        idTarifa: editando ? parseInt(document.getElementById('idTarifa').value) : Date.now(),
        descripcionServicio: document.getElementById('descripcionServicio').value,
        costoBase: parseFloat(document.getElementById('costoBase').value),
        especialidadId: document.getElementById('especialidadId').value ? parseInt(document.getElementById('especialidadId').value) : null,
        estatus: parseInt(document.getElementById('estatus').value)
    };
    
    if (editando) {
        let index = tarifas.findIndex(t => t.idTarifa === tarifa.idTarifa);
        tarifas[index] = tarifa;
    } else {
        tarifas.push(tarifa);
    }
    
    localStorage.setItem('tarifas', JSON.stringify(tarifas));
    cerrarModal();
    cargarTablaTarifas();
});

// Busqueda de tarifas
document.getElementById('buscarTarifa').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let tbody = document.getElementById('tablaTarifas');
    
    if (termino === '') {
        cargarTablaTarifas();
        return;
    }
    
    let tarifasFiltradas = tarifas.filter(t => {
        let especialidad = especialidades.find(e => e.idEspecialidad === t.especialidadId);
        return t.descripcionServicio.toLowerCase().includes(termino) ||
               (especialidad && especialidad.nombreEspecialidad.toLowerCase().includes(termino));
    });
    
    if (tarifasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron tarifas</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    tarifasFiltradas.forEach(tarifa => {
        let especialidad = especialidades.find(e => e.idEspecialidad === tarifa.especialidadId);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tarifa.idTarifa}</td>
            <td>${tarifa.descripcionServicio}</td>
            <td>$${tarifa.costoBase.toFixed(2)}</td>
            <td>${especialidad ? especialidad.nombreEspecialidad : 'General'}</td>
            <td><span class="estado ${tarifa.estatus === 1 ? 'estado-activo' : 'estado-inactivo'}">${tarifa.estatus === 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td class="acciones-tabla">
                <button class="boton-icono" onclick="editarTarifa(${tarifa.idTarifa})">Editar</button>
                <button class="boton-icono" onclick="eliminarTarifa(${tarifa.idTarifa})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});

cargarTablaTarifas();