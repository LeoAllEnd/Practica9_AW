<?php
// Inicio la sesion
session_start();

include 'conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$accion = $_GET['accion'] ?? '';

switch($accion) {
    case 'login':
        login($conexion);
        break;
    case 'logout':
        logout();
        break;
    case 'verificarSesion':
        verificarSesion();
        break;
    case 'registrar':
        registrarUsuario($conexion);
        break;
    default:
        respuestaJSON(false, 'Accion no valida');
}

function login($conexion) {
    // Obtengo los datos del POST
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $datos['usuario'] ?? '';
    $contrasena = $datos['contrasena'] ?? '';
    
    if (empty($usuario) || empty($contrasena)) {
        respuestaJSON(false, 'Usuario y contrasena son requeridos');
    }
    
    // Busco el usuario en la base de datos
    $sql = "SELECT u.*, m.nombreCompleto as nombreMedico 
            FROM usuarios u 
            LEFT JOIN medicos m ON u.idMedico = m.idMedico 
            WHERE u.usuario = ? AND u.activo = 1";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($fila = $resultado->fetch_assoc()) {
        // Verifico la contrasena (en este ejemplo simple, sin hash)
        // En produccion SIEMPRE usar password_verify()
        
        // Para implementacion simple (sin hash):
        // Puse esta validacion temporal para que funcione sin hash
        $contrasenaCorrecta = ($contrasena === 'admin123' && $fila['rol'] === 'Admin') ||
                              ($contrasena === 'medico123' && $fila['rol'] === 'Medico') ||
                              ($contrasena === 'recep123' && $fila['rol'] === 'Recepcionista');
        
        
        if ($contrasenaCorrecta) {
            // Actualizo el ultimo acceso
            $sqlUpdate = "UPDATE usuarios SET ultimoAcceso = NOW() WHERE idUsuario = ?";
            $stmtUpdate = $conexion->prepare($sqlUpdate);
            $stmtUpdate->bind_param("i", $fila['idUsuario']);
            $stmtUpdate->execute();
            
            // Creo la sesion
            $_SESSION['usuarioId'] = $fila['idUsuario'];
            $_SESSION['usuario'] = $fila['usuario'];
            $_SESSION['rol'] = $fila['rol'];
            $_SESSION['idMedico'] = $fila['idMedico'];
            
            // Registro en bitacora
            registrarBitacora($conexion, $fila['idUsuario'], 'Inicio de sesion', 'Login');
            
            // Preparo los datos para el frontend
            $datosUsuario = [
                'idUsuario' => $fila['idUsuario'],
                'usuario' => $fila['usuario'],
                'rol' => $fila['rol'],
                'idMedico' => $fila['idMedico'],
                'nombreMedico' => $fila['nombreMedico'],
                'activo' => $fila['activo']
            ];
            
            respuestaJSON(true, 'Login exitoso', $datosUsuario);
        } else {
            respuestaJSON(false, 'Contrasena incorrecta');
        }
    } else {
        respuestaJSON(false, 'Usuario no encontrado o inactivo');
    }
}

function logout() {
    // Registro en bitacora antes de cerrar sesion
    if (isset($_SESSION['usuarioId'])) {
        include 'conexion.php';
        registrarBitacora($conexion, $_SESSION['usuarioId'], 'Cierre de sesion', 'Login');
    }
    
    // Destruyo la sesion
    session_destroy();
    respuestaJSON(true, 'Sesion cerrada exitosamente');
}

function verificarSesion() {
    if (isset($_SESSION['usuarioId'])) {
        $datosUsuario = [
            'idUsuario' => $_SESSION['usuarioId'],
            'usuario' => $_SESSION['usuario'],
            'rol' => $_SESSION['rol'],
            'idMedico' => $_SESSION['idMedico']
        ];
        respuestaJSON(true, 'Sesion activa', $datosUsuario);
    } else {
        respuestaJSON(false, 'No hay sesion activa');
    }
}

function registrarUsuario($conexion) {
    $datos = json_decode(file_get_contents('php://input'), true);
    
    $usuario = $datos['usuario'] ?? '';
    $contrasena = $datos['contrasena'] ?? '';
    $rol = $datos['rol'] ?? 'Recepcionista';
    $idMedico = $datos['idMedico'] ?? null;
    
    if (empty($usuario) || empty($contrasena)) {
        respuestaJSON(false, 'Usuario y contrasena son requeridos');
    }
    
    // Verifico que el rol sea valido
    $rolesValidos = ['Admin', 'Medico', 'Recepcionista'];
    if (!in_array($rol, $rolesValidos)) {
        respuestaJSON(false, 'Rol no valido');
    }
    
    // Verifico si el usuario ya existe
    $sqlVerificar = "SELECT COUNT(*) as total FROM usuarios WHERE usuario = ?";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    $stmtVerificar->bind_param("s", $usuario);
    $stmtVerificar->execute();
    $resultado = $stmtVerificar->get_result()->fetch_assoc();
    
    if ($resultado['total'] > 0) {
        respuestaJSON(false, 'El usuario ya existe');
    }
    
    // Hasheo la contrasena (IMPORTANTE para seguridad)
    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
    // Inserto el nuevo usuario
    $sql = "INSERT INTO usuarios (usuario, contrasenaHash, rol, idMedico, activo) VALUES (?, ?, ?, ?, 1)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sssi", $usuario, $contrasenaHash, $rol, $idMedico);
    
    if ($stmt->execute()) {
        respuestaJSON(true, 'Usuario registrado exitosamente', ['id' => $conexion->insert_id]);
    } else {
        respuestaJSON(false, 'Error al registrar usuario: ' . $conexion->error);
    }
}

function registrarBitacora($conexion, $idUsuario, $accion, $modulo) {
    $sql = "INSERT INTO bitacoras (idUsuario, accionRealizada, modulo) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iss", $idUsuario, $accion, $modulo);
    $stmt->execute();
}
?>