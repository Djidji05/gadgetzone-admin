<?php
require_once '../config/Database.php';

class UserController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function handleRequest($method, $segments) {
        $id = $segments[1] ?? null;
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getUser($id);
                } else {
                    $this->getUsers();
                }
                break;
                
            case 'POST':
                $this->createUser();
                break;
                
            case 'PUT':
                if ($id) {
                    $this->updateUser($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                }
                break;
                
            case 'DELETE':
                if ($id) {
                    $this->deleteUser($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                }
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
        }
    }
    
    private function getUsers() {
        try {
            $sql = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
            $users = $this->db->fetchAll($sql);
            
            http_response_code(200);
            echo json_encode($users);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users']);
        }
    }
    
    private function getUser($id) {
        try {
            $sql = "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
            $user = $this->db->fetchOne($sql, [$id]);
            
            if ($user) {
                http_response_code(200);
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch user']);
        }
    }
    
    private function createUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name, email, and password are required']);
                return;
            }
            
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                'role' => $data['role'] ?? 'user',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $userId = $this->db->insert('users', $userData);
            
            http_response_code(201);
            echo json_encode(['message' => 'User created successfully', 'id' => $userId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }
    
    private function updateUser($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['error' => 'No data provided']);
                return;
            }
            
            $updateData = [];
            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['email'])) $updateData['email'] = $data['email'];
            if (isset($data['password'])) $updateData['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            if (isset($data['role'])) $updateData['role'] = $data['role'];
            
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            $rowsAffected = $this->db->update('users', $updateData, 'id = ?', [$id]);
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'User updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user']);
        }
    }
    
    private function deleteUser($id) {
        try {
            $rowsAffected = $this->db->delete('users', 'id = ?', [$id]);
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'User deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user']);
        }
    }
}
?>
