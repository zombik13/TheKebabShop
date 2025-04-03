<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Detalii pentru conexiunea la baza de date
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "restaurant";

// Creează conexiunea
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifică conexiunea
if ($conn->connect_error) {
    sendResponse(['success' => false, 'message' => 'Conexiune eșuată: ' . $conn->connect_error]);
}

// Funcție pentru trimiterea răspunsului JSON
function sendResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Funcție pentru procesarea cererilor POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
        case 'edit':
            handleProductAddOrEdit($conn, $action);
            break;
        case 'getAll':
            handleGetAllProducts($conn);
            break;
        case 'getById':
            handleGetProductById($conn);
            break;
        case 'delete':
            handleDeleteProduct($conn);
            break;
        case 'updateStock':
            handleUpdateStock($conn);
            break;
        default:
            sendResponse(['success' => false, 'message' => 'Acțiune invalidă']);
            break;
    }
}

$conn->close();

// Funcție pentru adăugarea sau editarea unui produs
function handleProductAddOrEdit($conn, $action) {
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? 0;
    $description = $_POST['description'] ?? '';
    $inStock = $_POST['inStock'] ?? 0;
    $section = $_POST['section'] ?? '';
    $imageData = null;

    // Procesarea imaginii dacă există
    if (!empty($_FILES['image']['tmp_name'])) {
        if (is_uploaded_file($_FILES['image']['tmp_name'])) {
            $imageData = file_get_contents($_FILES['image']['tmp_name']);
        } else {
            sendResponse(['success' => false, 'message' => 'Eroare la încărcarea imaginii.']);
        }
    }

    // Validarea datelor
    if (!empty($name) && $price >= 0 && !empty($section)) {
        if ($action == 'add') {
            // Adăugare produs nou
            $stmt = $conn->prepare("INSERT INTO products (name, price, description, inStock, section, image) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sdsiss", $name, $price, $description, $inStock, $section, $imageData);
        } else {
            // Editare produs existent
            $id = $_POST['id'] ?? 0;
            if ($id > 0) {
                if ($imageData) {
                    $stmt = $conn->prepare("UPDATE products SET name = ?, price = ?, description = ?, inStock = ?, section = ?, image = ? WHERE id = ?");
                    $stmt->bind_param("sdsissi", $name, $price, $description, $inStock, $section, $imageData, $id);
                } else {
                    $stmt = $conn->prepare("UPDATE products SET name = ?, price = ?, description = ?, inStock = ?, section = ? WHERE id = ?");
                    $stmt->bind_param("sdsisi", $name, $price, $description, $inStock, $section, $id);
                }
            } else {
                sendResponse(['success' => false, 'message' => 'ID invalid pentru editare']);
            }
        }

        // Execută query-ul
        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Produsul a fost salvat!']);
        } else {
            sendResponse(['success' => false, 'message' => 'Eroare la salvarea produsului: ' . $stmt->error]);
        }
    } else {
        sendResponse(['success' => false, 'message' => 'Date invalide pentru produs']);
    }
}

// Funcție pentru obținerea tuturor produselor
function handleGetAllProducts($conn) {
    $result = $conn->query("SELECT id, name, price, description, inStock, section, image FROM products");
    $products = [];

    while ($row = $result->fetch_assoc()) {
        // Codifică imaginea în base64
        if (!empty($row['image'])) {
            $row['image'] = base64_encode($row['image']);
        }
        $products[] = $row;
    }

    // Dacă nu sunt produse
    if (empty($products)) {
        sendResponse(['success' => false, 'message' => 'Nu există produse în baza de date.']);
    }

    sendResponse(['success' => true, 'data' => $products]);
}

// Funcție pentru obținerea unui produs după ID
function handleGetProductById($conn) {
    $id = $_POST['id'] ?? 0;
    if ($id > 0) {
        $stmt = $conn->prepare("SELECT id, name, price, description, inStock, section, image FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $product = $result->fetch_assoc();
            // Codifică imaginea în base64 dacă există
            if (!empty($product['image'])) {
                $product['image'] = base64_encode($product['image']);
            }
            sendResponse(['success' => true, 'data' => $product]);
        } else {
            sendResponse(['success' => false, 'message' => 'Produsul nu a fost găsit.']);
        }
    } else {
        sendResponse(['success' => false, 'message' => 'ID invalid']);
    }
}

// Funcție pentru ștergerea unui produs
function handleDeleteProduct($conn) {
    $id = $_POST['id'] ?? 0;
    if ($id > 0) {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Produsul a fost șters!']);
        } else {
            sendResponse(['success' => false, 'message' => 'Eroare la ștergerea produsului']);
        }
    } else {
        sendResponse(['success' => false, 'message' => 'ID invalid']);
    }
}

// Funcție pentru actualizarea stocului
function handleUpdateStock($conn) {
    $id = $_POST['id'] ?? 0;
    $inStock = $_POST['inStock'] ?? 0;
    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE products SET inStock = ? WHERE id = ?");
        $stmt->bind_param("ii", $inStock, $id);
        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Statusul stocului a fost actualizat!']);
        } else {
            sendResponse(['success' => false, 'message' => 'Eroare la actualizarea statusului stocului']);
        }
    } else {
        sendResponse(['success' => false, 'message' => 'ID invalid']);
    }
}
?>
