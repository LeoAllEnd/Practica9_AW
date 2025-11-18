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

const URL_API = 'php/medicos_api.php';
const URL_API_ESPECIALIDADES = 'php/especialidades_api.php';

let editando = false;

// Cargo el select de especialidades desde la base de datos
async function cargarSelectEspecialidades() {
    try {
        let respuesta = await fetch(`${URL_API_ESPECIALIDADES}?accion=listar`);
        let datos = await respuesta.json();
        
        let select = document.getElementById('especialidadId');
        select.innerHTML = '<option value="">Seleccionar</option>';
        
        if (datos.exito) {
            datos.datos.forEach(e => {
                let option = document.createElement('option');
                option.value = e.idEspecialidad;
                option.textContent = e.nombreEspecialidad;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
    }
}

// Cargo la tabla de medicos desde la base de datos
async function cargarTablaMedicos() {
    try {
        let respuesta = await fetch(`${URL_API}?accion=listar`);
        let datos = await respuesta.json();
        
        let tbody = document.getElementById('tablaMedicos');
        
        if (!datos.exito || datos.datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay medicos registrados</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        datos.datos.forEach(medico => {
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${medico.idMedico}</td>
                <td>${medico.nombreCompleto}</td>
                <td>${medico.cedulaProfesional}</td>
                <td>${medico.nombreEspecialidad || 'N/A'}</td>
                <td>${medico.telefono}</td>
                <td><span class="estado ${medico.estatus == 1 ? 'estado-activo' : 'estado-inactivo'}">${medico.estatus == 1 ? 'Activo' : 'Inactivo'}</span></td>
                <td class="acciones-tabla">
                    <button class="boton-icono" onclick="editarMedico(${medico.idMedico})">Editar</button>
                    <button class="boton-icono" onclick="eliminarMedico(${medico.idMedico})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar medicos:', error);
        alert('Error al cargar los medicos');
    }
}

async function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nuevo Medico';
    document.getElementById('formularioMedico').reset();
    document.getElementById('idMedico').value = '';
    await cargarSelectEspecialidades();
    document.getElementById('modalMedico').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modalMedico').classList.remove('activo');
}

async function editarMedico(id) {
    try {
        let respuesta = await fetch(`${URL_API}?accion=obtener&id=${id}`);
        let datos = await respuesta.json();
        
        if (datos.exito) {
            editando = true;
            let medico = datos.datos;
            
            document.getElementById('tituloModal').textContent = 'Editar Medico';
            document.getElementById('idMedico').value = medico.idMedico;
            await cargarSelectEspecialidades();
            document.getElementById('nombreCompleto').value = medico.nombreCompleto;
            document.getElementById('cedulaProfesional').value = medico.cedulaProfesional;
            document.getElementById('especialidadId').value = medico.especialidadId;
            document.getElementById('telefono').value = medico.telefono;
            document.getElementById('correoElectronico').value = medico.correoElectronico;
            document.getElementById('horarioAtencion').value = medico.horarioAtencion;
            document.getElementById('estatus').value = medico.estatus;
            
            document.getElementById('modalMedico').classList.add('activo');
        } else {
            alert('Error: ' + datos.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener el medico');
    }
}

async function eliminarMedico(id) {
    if (confirm('¿Estas seguro de eliminar este medico?')) {
        try {
            let respuesta = await fetch(`${URL_API}?accion=eliminar&id=${id}`);
            let datos = await respuesta.json();
            
            if (datos.exito) {
                alert(datos.mensaje);
                cargarTablaMedicos();
            } else {
                alert('Error: ' + datos.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el medico');
        }
    }
}

document.getElementById('formularioMedico').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let medico = {
        nombreCompleto: document.getElementById('nombreCompleto').value,
        cedulaProfesional: document.getElementById('cedulaProfesional').value,
        especialidadId: parseInt(document.getElementById('especialidadId').value),
        telefono: document.getElementById('telefono').value,
        correoElectronico: document.getElementById('correoElectronico').value,
        horarioAtencion: document.getElementById('horarioAtencion').value,
        estatus: parseInt(document.getElementById('estatus').value)
    };
    
    if (editando) {
        medico.idMedico = parseInt(document.getElementById('idMedico').value);
    }
    
    try {
        let accion = editando ? 'actualizar' : 'crear';
        let respuesta = await fetch(`${URL_API}?accion=${accion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medico)
        });
        
        let datos = await respuesta.json();
        
        if (datos.exito) {
            alert(datos.mensaje);
            cerrarModal();
            cargarTablaMedicos();
        } else {
            alert('Error: ' + datos.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el medico');
    }
});

document.getElementById('buscarMedico').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let filas = document.querySelectorAll('#tablaMedicos tr');
    
    filas.forEach(fila => {
        let texto = fila.textContent.toLowerCase();
        if (texto.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
});

cargarTablaMedicos();