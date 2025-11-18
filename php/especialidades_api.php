<?php
// Incluyo el archivo de conexion
include 'conexion.php';

// Puse esto para permitir peticiones desde el frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Obtengo la accion que se quiere realizar
$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarEspecialidades($conexion);
        break;
    case 'obtener':
        obtenerEspecialidad($conexion);
        break;
    case 'crear':
        crearEspecialidad($conexion);
        break;
    case 'actualizar':
        actualizarEspecialidad($conexion);
        break;
    case 'eliminar':
        eliminarEspecialidad($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarEspecialidades($conexion) {
    $sql = "SELECT * FROM especialidades ORDER BY nombreEspecialidad";
    $resultado = $conexion->query($sql);
    
    $especialidades = [];
    while($fila = $resultado->fetch_assoc()) {
        $especialidades[] = $fila;
    }
    
    respuestaJSON(true, 'Especialidades obtenidas', $especialidades);
}

function obtenerEspecialidad($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT * FROM especialidades WHERE idEspecialidad = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        respuestaJSON(true, 'Especialidad encontrada', $fila);
    } else {
        respuestaJSON(false, 'Especialidad no encontrada');
    }
}

function crearEspecialidad($conexion) {
    // Obtengo los datos del POST
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $nombre = $datos['nombreEspecialidad'];
    $descripcion = $datos['descripcion'] ?? '';
    
    $sql = "INSERT INTO especialidades (nombreEspecialidad, descripcion) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $nombre, $descripcion);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Especialidad creada exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al crear especialidad: ' . $conexion->error);
    }
}

function actualizarEspecialidad($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idEspecialidad'];
    $nombre = $datos['nombreEspecialidad'];
    $descripcion = $datos['descripcion'] ?? '';
    
    $sql = "UPDATE especialidades SET nombreEspecialidad = ?, descripcion = ? WHERE idEspecialidad = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssi", $nombre, $descripcion, $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Especialidad actualizada exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar especialidad: ' . $conexion->error);
    }
}

function eliminarEspecialidad($conexion) {
    $id = $_GET['id'] ?? 0;
    
    // Verifico si hay medicos con esta especialidad
    $sqlVerificar = "SELECT COUNT(*) as total FROM medicos WHERE especialidadId = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("i", $id);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        respuestaJSON(false, 'No se puede eliminar. Hay medicos asociados a esta especialidad');
    }
    
    $sql = "DELETE FROM especialidades WHERE idEspecialidad = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Especialidad eliminada exitosamente');
    } else {
        respuestaJSON(false, 'Error al eliminar especialidad: ' . $conexion->error);
    }
}
?>