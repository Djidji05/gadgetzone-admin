<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/Database.php';
require_once 'config/Config.php';

$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

$base_path = '/api';
$path = str_replace($base_path, '', $request_uri);
$path = trim($path, '/');

$segments = explode('/', $path);

try {
    switch ($segments[0] ?? '') {
        case '':
            http_response_code(200);
            echo json_encode(['message' => 'API GadgetZone - Online', 'version' => '1.0.0']);
            break;
            
        case 'products':
            require_once 'controllers/ProductController.php';
            $controller = new ProductController();
            $controller->handleRequest($request_method, $segments);
            break;
            
        case 'users':
            require_once 'controllers/UserController.php';
            $controller = new UserController();
            $controller->handleRequest($request_method, $segments);
            break;
            
        case 'orders':
            require_once 'controllers/OrderController.php';
            $controller = new OrderController();
            $controller->handleRequest($request_method, $segments);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}
?>
