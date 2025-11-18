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

// Puse esta URL base para todas las peticiones
const URL_API = 'php/especialidades_api.php';

let editando = false;

// Cargo la tabla de especialidades desde la base de datos
async function cargarTablaEspecialidades() {
    try {
        let respuesta = await fetch(`${URL_API}?accion=listar`);
        let datos = await respuesta.json();
        
        let tbody = document.getElementById('tablaEspecialidades');
        
        if (!datos.exito || datos.datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay especialidades registradas</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        datos.datos.forEach(especialidad => {
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
    } catch (error) {
        console.error('Error al cargar especialidades:', error);
        alert('Error al cargar las especialidades');
    }
}

function abrirModalNuevo() {
    editando = false;
    document.getElementById('tituloModal').textContent = 'Nueva Especialidad';
    document.getElementById('formularioEspecialidad').reset();
    document.getElementById('idEspecialidad').value = '';
    document.getElementById('modalEspecialidad').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modalEspecialidad').classList.remove('activo');
}

// Edito una especialidad
async function editarEspecialidad(id) {
    try {
        let respuesta = await fetch(`${URL_API}?accion=obtener&id=${id}`);
        let datos = await respuesta.json();
        
        if (datos.exito) {
            editando = true;
            let especialidad = datos.datos;
            
            document.getElementById('tituloModal').textContent = 'Editar Especialidad';
            document.getElementById('idEspecialidad').value = especialidad.idEspecialidad;
            document.getElementById('nombreEspecialidad').value = especialidad.nombreEspecialidad;
            document.getElementById('descripcion').value = especialidad.descripcion || '';
            
            document.getElementById('modalEspecialidad').classList.add('activo');
        } else {
            alert('Error: ' + datos.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener la especialidad');
    }
}

// Elimino una especialidad
async function eliminarEspecialidad(id) {
    if (confirm('¿Estas seguro de eliminar esta especialidad?')) {
        try {
            let respuesta = await fetch(`${URL_API}?accion=eliminar&id=${id}`);
            let datos = await respuesta.json();
            
            if (datos.exito) {
                alert(datos.mensaje);
                cargarTablaEspecialidades();
            } else {
                alert('Error: ' + datos.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la especialidad');
        }
    }
}

// Manejo el formulario
document.getElementById('formularioEspecialidad').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    let especialidad = {
        nombreEspecialidad: document.getElementById('nombreEspecialidad').value,
        descripcion: document.getElementById('descripcion').value
    };
    
    if (editando) {
        especialidad.idEspecialidad = parseInt(document.getElementById('idEspecialidad').value);
    }
    
    try {
        let accion = editando ? 'actualizar' : 'crear';
        let respuesta = await fetch(`${URL_API}?accion=${accion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(especialidad)
        });
        
        let datos = await respuesta.json();
        
        if (datos.exito) {
            alert(datos.mensaje);
            cerrarModal();
            cargarTablaEspecialidades();
        } else {
            alert('Error: ' + datos.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la especialidad');
    }
});

// Busqueda de especialidades
document.getElementById('buscarEspecialidad').addEventListener('input', function(e) {
    let termino = e.target.value.toLowerCase();
    let filas = document.querySelectorAll('#tablaEspecialidades tr');
    
    filas.forEach(fila => {
        let texto = fila.textContent.toLowerCase();
        if (texto.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
});

// Cargo la tabla al iniciar
cargarTablaEspecialidades();