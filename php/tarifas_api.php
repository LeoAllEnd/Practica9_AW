<?php
include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarTarifas($conexion);
        break;
    case 'obtener':
        obtenerTarifa($conexion);
        break;
    case 'crear':
        crearTarifa($conexion);
        break;
    case 'actualizar':
        actualizarTarifa($conexion);
        break;
    case 'eliminar':
        eliminarTarifa($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarTarifas($conexion) {
    $sql = "SELECT t.*, e.nombreEspecialidad 
            FROM tarifas t 
            LEFT JOIN especialidades e ON t.especialidadId = e.idEspecialidad 
            ORDER BY t.descripcionServicio";
    $resultado = $conexion->query($sql);
    
    $tarifas = [];
    while($fila = $resultado->fetch_assoc()) {
        $tarifas[] = $fila;
    }
    
    respuestaJSON(true, 'Tarifas obtenidas', $tarifas);
}

function obtenerTarifa($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT t.*, e.nombreEspecialidad 
            FROM tarifas t 
            LEFT JOIN especialidades e ON t.especialidadId = e.idEspecialidad 
            WHERE t.idTarifa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        respuestaJSON(true, 'Tarifa encontrada', $fila);
    } else {
        respuestaJSON(false, 'Tarifa no encontrada');
    }
}

function crearTarifa($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $descripcionServicio = $datos['descripcionServicio'];
    $costoBase = $datos['costoBase'];
    $especialidadId = $datos['especialidadId'] ?? null;
    $estatus = $datos['estatus'] ?? 1;
    
    $sql = "INSERT INTO tarifas (descripcionServicio, costoBase, especialidadId, estatus) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sdii", $descripcionServicio, $costoBase, $especialidadId, $estatus);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Tarifa creada exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al crear tarifa: ' . $conexion->error);
    }
}

function actualizarTarifa($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idTarifa'];
    $descripcionServicio = $datos['descripcionServicio'];
    $costoBase = $datos['costoBase'];
    $especialidadId = $datos['especialidadId'] ?? null;
    $estatus = $datos['estatus'] ?? 1;
    
    $sql = "UPDATE tarifas SET descripcionServicio = ?, costoBase = ?, especialidadId = ?, estatus = ? WHERE idTarifa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sdiii", $descripcionServicio, $costoBase, $especialidadId, $estatus, $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Tarifa actualizada exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar tarifa: ' . $conexion->error);
    }
}

function eliminarTarifa($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "DELETE FROM tarifas WHERE idTarifa = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Tarifa eliminada exitosamente');
    } else {
        respuestaJSON(false, 'Error al eliminar tarifa: ' . $conexion->error);
    }
}
?>