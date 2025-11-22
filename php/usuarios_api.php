<?php
session_start();
include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Verifico que el usuario tenga sesion y sea Admin
if (!isset($_SESSION['usuarioId']) || $_SESSION['rol'] !== 'Admin') {
    respuestaJSON(false, 'No tienes permiso para realizar esta accion');
}

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'listar':
        listarUsuarios($conexion);
        break;
    case 'obtener':
        obtenerUsuario($conexion);
        break;
    case 'crear':
        crearUsuario($conexion);
        break;
    case 'actualizar':
        actualizarUsuario($conexion);
        break;
    case 'eliminar':
        eliminarUsuario($conexion);
        break;
    case 'cambiarEstado':
        cambiarEstadoUsuario($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function listarUsuarios($conexion) {
    $sql = "SELECT u.*, m.nombreCompleto as nombreMedico 
            FROM usuarios u 
            LEFT JOIN medicos m ON u.idMedico = m.idMedico 
            ORDER BY u.usuario";
    $resultado = $conexion->query($sql);
    
    $usuarios = [];
    while($fila = $resultado->fetch_assoc()) {
        // No envio el hash de contrasena al frontend
        unset($fila['contrasenaHash']);
        $usuarios[] = $fila;
    }
    
    respuestaJSON(true, 'Usuarios obtenidos', $usuarios);
}

function obtenerUsuario($conexion) {
    $id = $_GET['id'] ?? 0;
    
    $sql = "SELECT u.*, m.nombreCompleto as nombreMedico 
            FROM usuarios u 
            LEFT JOIN medicos m ON u.idMedico = m.idMedico 
            WHERE u.idUsuario = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($fila = $resultado->fetch_assoc()) {
        unset($fila['contrasenaHash']);
        respuestaJSON(true, 'Usuario encontrado', $fila);
    } else {
        respuestaJSON(false, 'Usuario no encontrado');
    }
}

function crearUsuario($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $datos['usuario'];
    $contrasena = $datos['contrasena'];
    $rol = $datos['rol'];
    $idMedico = $datos['idMedico'] ?? null;
    
    // Verifico que el usuario no exista
    $sqlVerificar = "SELECT COUNT(*) as total FROM usuarios WHERE usuario = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("s", $usuario);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if ($resultado['total'] > 0) {
        respuestaJSON(false, 'El usuario ya existe');
    }
    
    // Hasheo la contrasena
    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO usuarios (usuario, contrasenaHash, rol, idMedico, activo) 
            VALUES (?, ?, ?, ?, 1)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sssi", $usuario, $contrasenaHash, $rol, $idMedico);
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Usuario creado exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al crear usuario: ' . $conexion->error);
    }
}

function actualizarUsuario($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $id = $datos['idUsuario'];
    $usuario = $datos['usuario'];
    $rol = $datos['rol'];
    $idMedico = $datos['idMedico'] ?? null;
    $activo = $datos['activo'];
    
    // Si viene una nueva contrasena, la actualizo
    if (!empty($datos['nuevaContrasena'])) {
        $contrasenaHash = password_hash($datos['nuevaContrasena'], PASSWORD_DEFAULT);
        $sql = "UPDATE usuarios SET usuario = ?, contrasenaHash = ?, rol = ?, idMedico = ?, activo = ? WHERE idUsuario = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("sssiii", $usuario, $contrasenaHash, $rol, $idMedico, $activo, $id);
    } else {
        // Si no viene contrasena, solo actualizo los demas campos
        $sql = "UPDATE usuarios SET usuario = ?, rol = ?, idMedico = ?, activo = ? WHERE idUsuario = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ssiii", $usuario, $rol, $idMedico, $activo, $id);
    }
    
    if($stmt->execute()) {
        respuestaJSON(true, 'Usuario actualizado exitosamente');
    } else {
        respuestaJSON(false, 'Error al actualizar usuario: ' . $conexion->error);
    }
}

function eliminarUsuario($conexion) {
    $id = $_GET['id'] ?? 0;
    
    // No permito eliminar al admin principal (id=1)
    if ($id == 1) {
        respuestaJSON(false, 'No se puede eliminar el usuario administrador principal');
    }
    
    // Verifico si tiene registros en bitacoras
    $sqlVerificar = "SELECT COUNT(*) as total FROM bitacoras WHERE idUsuario = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("i", $id);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if($resultado['total'] > 0) {
        // En lugar de eliminar, desactivo el usuario
        $sql = "UPDATE usuarios SET activo = 0 WHERE idUsuario = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            respuestaJSON(true, 'Usuario desactivado exitosamente (tiene registros en bitacoras)');
        } else {
            respuestaJSON(false, 'Error al desactivar usuario');
        }
    } else {
        // Si no tiene registros, puedo eliminarlo
        $sql = "DELETE FROM usuarios WHERE idUsuario = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            respuestaJSON(true, 'Usuario eliminado exitosamente');
        } else {
            respuestaJSON(false, 'Error al eliminar usuario: ' . $conexion->error);
        }
    }
}

function cambiarEstadoUsuario($conexion) {
    $id = $_GET['id'] ?? 0;
    $nuevoEstado = $_GET['estado'] ?? 1;
    
    $sql = "UPDATE usuarios SET activo = ? WHERE idUsuario = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ii", $nuevoEstado, $id);
    
    if($stmt->execute()) {
        $mensaje = $nuevoEstado == 1 ? 'Usuario activado' : 'Usuario desactivado';
        respuestaJSON(true, $mensaje);
    } else {
        respuestaJSON(false, 'Error al cambiar estado del usuario');
    }
}
?>