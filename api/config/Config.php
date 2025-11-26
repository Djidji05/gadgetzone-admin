<?php
class Config {
    public static function getDatabaseConfig() {
        return [
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '5432',
            'dbname' => $_ENV['DB_NAME'] ?? 'gadgetzone',
            'user' => $_ENV['DB_USER'] ?? 'postgres',
            'password' => $_ENV['DB_PASSWORD'] ?? ''
        ];
    }
    
    public static function getJwtSecret() {
        return $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-in-production';
    }
    
    public static function isDevelopment() {
        return ($_ENV['APP_ENV'] ?? 'development') === 'development';
    }
}
?>
