<?php
include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarPagos($conexion);
        break;
    case 'obtener':
        obtenerPago($conexion);
        break;
    case 'crear':
        crearPago($conexion);
        break;
    case 'actualizar':
        actualizarPago($conexion);
        break;
    case 'eliminar':
        eliminarPago($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarPagos($conexion) {
    // Hago JOIN con pacientes para traer el nombre del paciente
    $sql = "SELECT p.*, pac.nombreCompleto as nombrePaciente 
            FROM pagos p 
            LEFT JOIN pacientes pac ON p.idPaciente = pac.idPaciente 
            ORDER BY p.fechaPago DESC";
    $resultado = $conexion->query($sql);
    
    $pagos = [];
    while($fila = $resultado->fetch_assoc()) {
        $pagos[] = $fila;
    }
    
    respuestaJSON(true, 'Pagos obtenidos', $pagos);
}

function obtenerPago($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT p.*, pac.nombreCompleto as nombrePaciente 
            FROM pagos p 
            LEFT JOIN pacientes pac ON p.idPaciente = pac.idPaciente 
            WHERE p.idPago = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        respuestaJSON(true, 'Pago encontrado', $fila);
    } else {
        respuestaJSON(false, 'Pago no encontrado');
    }
}

function crearPago($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $idCita = $datos['idCita'];
    $idPaciente = $datos['idPaciente'];
    $monto = $datos['monto'];
    $metodoPago = $datos['metodoPago'];
    $referencia = $datos['referencia'] ?? '';
    $estatusPago = $datos['estatusPago'] ?? 'Pendiente';
    
    $sql = "INSERT INTO pagos (idCita, idPaciente, monto, metodoPago, referencia, estatusPago) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iidsss", $idCita, $idPaciente, $monto, $metodoPago, $referencia, $estatusPago);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Pago registrado exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al registrar pago: ' . $conexion->error);
    }
}

function actualizarPago($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idPago'];
    $idCita = $datos['idCita'];
    $idPaciente = $datos['idPaciente'];
    $monto = $datos['monto'];
    $metodoPago = $datos['metodoPago'];
    $referencia = $datos['referencia'] ?? '';
    $estatusPago = $datos['estatusPago'] ?? 'Pendiente';
    
    $sql = "UPDATE pagos SET idCita = ?, idPaciente = ?, monto = ?, metodoPago = ?, referencia = ?, estatusPago = ? 
            WHERE idPago = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iidsssi", $idCita, $idPaciente, $monto, $metodoPago, $referencia, $estatusPago, $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Pago actualizado exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar pago: ' . $conexion->error);
    }
}

function eliminarPago($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "DELETE FROM pagos WHERE idPago = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Pago eliminado exitosamente');
    } else {
        respuestaJSON(false, 'Error al eliminar pago: ' . $conexion->error);
    }
}
?>