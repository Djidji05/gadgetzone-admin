<?php
require_once '../config/Database.php';

class OrderController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function handleRequest($method, $segments) {
        $id = $segments[1] ?? null;
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getOrder($id);
                } else {
                    $this->getOrders();
                }
                break;
                
            case 'POST':
                $this->createOrder();
                break;
                
            case 'PUT':
                if ($id) {
                    $this->updateOrder($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Order ID required']);
                }
                break;
                
            case 'DELETE':
                if ($id) {
                    $this->deleteOrder($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Order ID required']);
                }
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
        }
    }
    
    private function getOrders() {
        try {
            $sql = "
                SELECT o.*, u.name as user_name, u.email as user_email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                ORDER BY o.created_at DESC
            ";
            $orders = $this->db->fetchAll($sql);
            
            http_response_code(200);
            echo json_encode($orders);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch orders']);
        }
    }
    
    private function getOrder($id) {
        try {
            $sql = "
                SELECT o.*, u.name as user_name, u.email as user_email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?
            ";
            $order = $this->db->fetchOne($sql, [$id]);
            
            if ($order) {
                $orderItemsSql = "
                    SELECT oi.*, p.name as product_name 
                    FROM order_items oi 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = ?
                ";
                $order['items'] = $this->db->fetchAll($orderItemsSql, [$id]);
                
                http_response_code(200);
                echo json_encode($order);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch order']);
        }
    }
    
    private function createOrder() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['user_id']) || !isset($data['items']) || empty($data['items'])) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID and items are required']);
                return;
            }
            
            $this->db->getConnection()->beginTransaction();
            
            $orderData = [
                'user_id' => $data['user_id'],
                'total_amount' => $data['total_amount'] ?? 0,
                'status' => $data['status'] ?? 'pending',
                'shipping_address' => $data['shipping_address'] ?? '',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $orderId = $this->db->insert('orders', $orderData);
            
            foreach ($data['items'] as $item) {
                $orderItemData = [
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ];
                $this->db->insert('order_items', $orderItemData);
            }
            
            $this->db->getConnection()->commit();
            
            http_response_code(201);
            echo json_encode(['message' => 'Order created successfully', 'id' => $orderId]);
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create order']);
        }
    }
    
    private function updateOrder($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['error' => 'No data provided']);
                return;
            }
            
            $updateData = [];
            if (isset($data['status'])) $updateData['status'] = $data['status'];
            if (isset($data['total_amount'])) $updateData['total_amount'] = $data['total_amount'];
            if (isset($data['shipping_address'])) $updateData['shipping_address'] = $data['shipping_address'];
            
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            $rowsAffected = $this->db->update('orders', $updateData, 'id = ?', [$id]);
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'Order updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update order']);
        }
    }
    
    private function deleteOrder($id) {
        try {
            $this->db->getConnection()->beginTransaction();
            
            $this->db->delete('order_items', 'order_id = ?', [$id]);
            $rowsAffected = $this->db->delete('orders', 'id = ?', [$id]);
            
            $this->db->getConnection()->commit();
            
            if ($rowsAffected > 0) {
                http_response_code(200);
                echo json_encode(['message' => 'Order deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
            }
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete order']);
        }
    }
}
?>
