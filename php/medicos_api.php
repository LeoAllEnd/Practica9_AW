<?php
include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarMedicos($conexion);
        break;
    case 'obtener':
        obtenerMedico($conexion);
        break;
    case 'crear':
        crearMedico($conexion);
        break;
    case 'actualizar':
        actualizarMedico($conexion);
        break;
    case 'eliminar':
        eliminarMedico($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarMedicos($conexion) {
    // Hago un JOIN para traer tambien el nombre de la especialidad
    $sql = "SELECT m.*, e.nombreEspecialidad 
            FROM medicos m 
            LEFT JOIN especialidades e ON m.especialidadId = e.idEspecialidad 
            ORDER BY m.nombreCompleto";
    $resultado = $conexion->query($sql);
    
    $medicos = [];
    while($fila = $resultado->fetch_assoc()) {
        $medicos[] = $fila;
    }
    
    respuestaJSON(true, 'Medicos obtenidos', $medicos);
}

function obtenerMedico($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT m.*, e.nombreEspecialidad 
            FROM medicos m 
            LEFT JOIN especialidades e ON m.especialidadId = e.idEspecialidad 
            WHERE m.idMedico = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        respuestaJSON(true, 'Medico encontrado', $fila);
    } else {
        respuestaJSON(false, 'Medico no encontrado');
    }
}

function crearMedico($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombreCompleto = $datos['nombreCompleto'];
    $cedulaProfesional = $datos['cedulaProfesional'];
    $especialidadId = $datos['especialidadId'];
    $telefono = $datos['telefono'];
    $correoElectronico = $datos['correoElectronico'];
    $horarioAtencion = $datos['horarioAtencion'] ?? '';
    $estatus = $datos['estatus'] ?? 1;
    
    $sql = "INSERT INTO medicos (nombreCompleto, cedulaProfesional, especialidadId, telefono, correoElectronico, horarioAtencion, estatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssisssi", $nombreCompleto, $cedulaProfesional, $especialidadId, $telefono, $correoElectronico, $horarioAtencion, $estatus);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Medico creado exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al crear medico: ' . $conexion->error);
    }
}

function actualizarMedico($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idMedico'];
    $nombreCompleto = $datos['nombreCompleto'];
    $cedulaProfesional = $datos['cedulaProfesional'];
    $especialidadId = $datos['especialidadId'];
    $telefono = $datos['telefono'];
    $correoElectronico = $datos['correoElectronico'];
    $horarioAtencion = $datos['horarioAtencion'] ?? '';
    $estatus = $datos['estatus'] ?? 1;
    
    $sql = "UPDATE medicos SET nombreCompleto = ?, cedulaProfesional = ?, especialidadId = ?, 
            telefono = ?, correoElectronico = ?, horarioAtencion = ?, estatus = ? 
            WHERE idMedico = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssisssii", $nombreCompleto, $cedulaProfesional, $especialidadId, $telefono, $correoElectronico, $horarioAtencion, $estatus, $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Medico actualizado exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar medico: ' . $conexion->error);
    }
}

function eliminarMedico($conexion) {
    $id = $_GET['id'] ?? 0;
    
    // Verifico si hay citas asociadas
    $sqlVerificar = "SELECT COUNT(*) as total FROM citas WHERE idMedico = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("i", $id);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        respuestaJSON(false, 'No se puede eliminar. Hay citas asociadas a este medico');
    }
    
    $sql = "DELETE FROM medicos WHERE idMedico = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Medico eliminado exitosamente');
    } else {
        respuestaJSON(false, 'Error al eliminar medico: ' . $conexion->error);
    }
}
?>