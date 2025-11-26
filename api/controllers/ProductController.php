<?php
require_once '../config/Database.php';

class ProductController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function handleRequest($method, $segments) {
        $id = $segments[1] ?? null;
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getProduct($id);
                } else {
                    $this->getProducts();
                }
                break;
                
            case 'POST':
                $this->createProduct();
                break;
                
            case 'PUT':
                if ($id) {
                    $this->updateProduct($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Product ID required']);
                }
                break;
                
            case 'DELETE':
                if ($id) {
                    $this->deleteProduct($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Product ID required']);
                }
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
        }
    }
    
    private function getProducts() {
        try {
            $sql = "SELECT * FROM products ORDER BY created_at DESC";
            $products = $this->db->fetchAll($sql);
            
            http_response_code(200);
            echo json_encode($products);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch products']);
        }
    }
    
    private function getProduct($id) {
        try {
            $sql = "SELECT * FROM products WHERE id = ?";
            $product = $this->db->fetchOne($sql, [$id]);
            
            if ($product) {
                http_response_code(200);
                echo json_encode($product);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch product']);
        }
    }
    
    private function createProduct() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['price'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name and price are required']);
                return;
            }
            
            $productData = [
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'price' => $data['price'],
                'stock' => $data['stock'] ?? 0,
                'category_id' => $data['category_id'] ?? null,
                'image_url' => $data['image_url'] ?? '',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $productId = $this->db->insert('products', $productData);
            
            http_response_code(201);
            echo json_encode(['message' => 'Product created successfully', 'id' => $productId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product']);
        }
    }
    
    private function updateProduct($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['error' => 'No data provided']);
                return;
            }
            
            $updateData = [];
            if (isset($data['name'])) $updateData['name'] = $data['name'];
            if (isset($data['description'])) $updateData['description'] = $data['description'];
            if (isset($data['price'])) $updateData['price'] = $data['price'];
            if (isset($data['stock'])) $updateData['stock'] = $data['stock'];
            if (isset($data['category_id'])) $updateData['category_id'] = $data['category_id'];
            if (isset($data['image_url'])) $updateData['image_url'] = $data['image_url'];
            
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            $rowsAffected = $this->db->update('products', $updateData, 'id = ?', [$id]);
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'Product updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update product']);
        }
    }
    
    private function deleteProduct($id) {
        try {
            $rowsAffected = $this->db->delete('products', 'id = ?', [$id]);
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'Product deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product']);
        }
    }
}
?>
