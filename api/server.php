<?php
// Serveur de développement PHP intégré
// Usage: php -S localhost:8080 server.php

// Désactiver l'affichage des erreurs en production
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Gérer les requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Router toutes les requêtes vers index.php
if (file_exists(__DIR__ . '/index.php')) {
    require_once __DIR__ . '/index.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
}
?>
