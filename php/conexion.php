<?php
// Archivo de conexion a la base de datos
// Puse estos datos porque son los que vienen por defecto en XAMPP
$servidor = "localhost";
$usuario = "admin";
$contrasena = "bd47f317327554de46ab4133b088bbeaf79f082a1018a1c3";
$baseDatos = "expediente_clinico";

// Creo la conexion
$conexion = new mysqli($servidor, $usuario, $contrasena, $baseDatos);

// Verifico si hubo error en la conexion
if ($conexion->connect_error) {
    die("Error de conexion: " . $conexion->connect_error);
}

// Configuro el charset a UTF8 para que no haya problemas con acentos
$conexion->set_charset("utf8");

// Añadi esta funcion para devolver respuestas JSON
function respuestaJSON($exito, $mensaje, $datos = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'exito' => $exito,
        'mensaje' => $mensaje,
        'datos' => $datos
    ]);
    exit;
}
?>