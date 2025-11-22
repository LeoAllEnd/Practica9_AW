<?php
session_start();
include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarCitas($conexion);
        break;
    case 'obtener':
        obtenerCita($conexion);
        break;
    case 'crear':
        crearCita($conexion);
        break;
    case 'actualizar':
        actualizarCita($conexion);
        break;
    case 'eliminar':
        eliminarCita($conexion);
        break;
    case 'verificarDisponibilidad':
        verificarDisponibilidad($conexion);
        break;
    case 'citasPorFecha':
        citasPorFecha($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarCitas($conexion) {
    // Puse este JOIN para traer toda la informacion relacionada
    $sql = "SELECT 
                c.idCita,
                c.fechaCita,
                c.motivoConsulta,
                c.estadoCita,
                c.observaciones,
                c.fechaRegistro,
                p.idPaciente,
                p.nombreCompleto as nombrePaciente,
                p.telefono as telefonoPaciente,
                m.idMedico,
                m.nombreCompleto as nombreMedico,
                e.nombreEspecialidad
            FROM citas c
            INNER JOIN pacientes p ON c.idPaciente = p.idPaciente
            INNER JOIN medicos m ON c.idMedico = m.idMedico
            LEFT JOIN especialidades e ON m.especialidadId = e.idEspecialidad
            ORDER BY c.fechaCita DESC";
    
    $resultado = $conexion->query($sql);
    
    $citas = [];
    while($fila = $resultado->fetch_assoc()) {
        $citas[] = $fila;
    }
    
    respuestaJSON(true, 'Citas obtenidas', $citas);
}

function obtenerCita($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT 
                c.*,
                p.nombreCompleto as nombrePaciente,
                m.nombreCompleto as nombreMedico,
                e.nombreEspecialidad
            FROM citas c
            INNER JOIN pacientes p ON c.idPaciente = p.idPaciente
            INNER JOIN medicos m ON c.idMedico = m.idMedico
            LEFT JOIN especialidades e ON m.especialidadId = e.idEspecialidad
            WHERE c.idCita = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        respuestaJSON(true, 'Cita encontrada', $fila);
    } else {
        respuestaJSON(false, 'Cita no encontrada');
    }
}

function crearCita($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $idPaciente = $datos['idPaciente'];
    $idMedico = $datos['idMedico'];
    $fechaCita = $datos['fechaCita'];
    $motivoConsulta = $datos['motivoConsulta'];
    $estadoCita = $datos['estadoCita'] ?? 'Programada';
    $observaciones = $datos['observaciones'] ?? '';
    
    // Verifico disponibilidad del medico en ese horario
    $sqlVerificar = "SELECT COUNT(*) as total FROM citas 
                     WHERE idMedico = ? 
                     AND fechaCita = ? 
                     AND estadoCita != 'Cancelada'";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("is", $idMedico, $fechaCita);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        respuestaJSON(false, 'El medico ya tiene una cita en ese horario');
    }
    
    // Creo la cita
    $sql = "INSERT INTO citas (idPaciente, idMedico, fechaCita, motivoConsulta, estadoCita, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iissss", $idPaciente, $idMedico, $fechaCita, $motivoConsulta, $estadoCita, $observaciones);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Cita creada exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al crear cita: ' . $conexion->error);
    }
}

function actualizarCita($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idCita'];
    $idPaciente = $datos['idPaciente'];
    $idMedico = $datos['idMedico'];
    $fechaCita = $datos['fechaCita'];
    $motivoConsulta = $datos['motivoConsulta'];
    $estadoCita = $datos['estadoCita'];
    $observaciones = $datos['observaciones'] ?? '';
    
    // Si cambio la fecha o el medico, verifico disponibilidad
    $sqlVerificar = "SELECT COUNT(*) as total FROM citas 
                     WHERE idMedico = ? 
                     AND fechaCita = ? 
                     AND idCita != ? 
                     AND estadoCita != 'Cancelada'";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("isi", $idMedico, $fechaCita, $id);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        respuestaJSON(false, 'El medico ya tiene una cita en ese horario');
    }
    
    $sql = "UPDATE citas 
            SET idPaciente = ?, idMedico = ?, fechaCita = ?, motivoConsulta = ?, estadoCita = ?, observaciones = ? 
            WHERE idCita = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iissssi", $idPaciente, $idMedico, $fechaCita, $motivoConsulta, $estadoCita, $observaciones, $id);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Cita actualizada exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar cita: ' . $conexion->error);
    }
}

function eliminarCita($conexion) {
    $id = $_GET['id'] ?? 0;
    
    // Verifico si tiene pagos asociados
    $sqlVerificar = "SELECT COUNT(*) as total FROM pagos WHERE idCita = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("i", $id);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        // En lugar de eliminar, la cancelo
        $sql = "UPDATE citas SET estadoCita = 'Cancelada' WHERE idCita = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            respuestaJSON(true, 'Cita cancelada exitosamente (tiene pagos asociados)');
        } else {
            respuestaJSON(false, 'Error al cancelar cita');
        }
    } else {
        // Si no tiene pagos, la elimino
        $sql = "DELETE FROM citas WHERE idCita = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            respuestaJSON(true, 'Cita eliminada exitosamente');
        } else {
            respuestaJSON(false, 'Error al eliminar cita: ' . $conexion->error);
        }
    }
}

function verificarDisponibilidad($conexion) {
    $idMedico = $_GET['idMedico'] ?? 0;
    $fecha = $_GET['fecha'] ?? '';
    
    $sql = "SELECT c.*, p.nombreCompleto as nombrePaciente
            FROM citas c
            INNER JOIN pacientes p ON c.idPaciente = p.idPaciente
            WHERE c.idMedico = ? 
            AND DATE(c.fechaCita) = DATE(?) 
            AND c.estadoCita != 'Cancelada'
            ORDER BY c.fechaCita";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("is", $idMedico, $fecha);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $citasOcupadas = [];
    while($fila = $resultado->fetch_assoc()) {
        $citasOcupadas[] = $fila;
    }
    
    respuestaJSON(true, 'Disponibilidad obtenida', $citasOcupadas);
}

function citasPorFecha($conexion) {
    $fechaInicio = $_GET['fechaInicio'] ?? '';
    $fechaFin = $_GET['fechaFin'] ?? '';
    
    $sql = "SELECT 
                c.*,
                p.nombreCompleto as nombrePaciente,
                m.nombreCompleto as nombreMedico
            FROM citas c
            INNER JOIN pacientes p ON c.idPaciente = p.idPaciente
            INNER JOIN medicos m ON c.idMedico = m.idMedico
            WHERE DATE(c.fechaCita) BETWEEN ? AND ?
            ORDER BY c.fechaCita";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $fechaInicio, $fechaFin);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $citas = [];
    while($fila = $resultado->fetch_assoc()) {
        $citas[] = $fila;
    }
    
    respuestaJSON(true, 'Citas obtenidas', $citas);
}
?>