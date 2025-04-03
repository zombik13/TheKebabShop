<?php
// Activează afișarea erorilor pentru depanare
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Încarcă autoloader-ul Composer pentru PHPMailer
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Preluare și filtrare date
    $nume = htmlspecialchars($_POST["nume"] ?? '');
    $telefon = htmlspecialchars($_POST["telefon"] ?? '');
    $sector = htmlspecialchars($_POST["sector"] ?? ''); // Preluăm sectorul selectat
    $adresa = htmlspecialchars($_POST["adresa"] ?? '');
    $email = filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL);
    $bloc = htmlspecialchars($_POST["bloc"] ?? '');
    $etaj = htmlspecialchars($_POST["etaj"] ?? '');
    $apartament = htmlspecialchars($_POST["apartament"] ?? '');
    $interfon = htmlspecialchars($_POST["interfon"] ?? ''); 
    $metoda_livrare = htmlspecialchars($_POST["metoda_livrare"] ?? '');
    $metoda_plata = htmlspecialchars($_POST["metoda_plata"] ?? '');

    // Verifică validitatea email-ului
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Adresa de email nu este validă!");
    }

    // Verificare și preluare coș de cumpărături
    $cartData = json_decode($_POST["cartData"] ?? '[]', true);
    if (!is_array($cartData) || empty($cartData)) {
        die("Coșul de cumpărături este gol sau datele sunt corupte!");
    }

    // Calcularea totalului produselor
    $total = 0;
    $cartHtmlRestaurant = "<ul>";
    $cartHtmlClient = "<ul>";
    foreach ($cartData as $item) {
        $nume_produs = htmlspecialchars($item['name'] ?? 'Produs necunoscut');
        $cantitate = intval($item['quantity'] ?? 1);
        $pret = floatval($item['price'] ?? 0);
        $total += $pret * $cantitate;

        // Adăugăm produsele la mesajul restaurantului și al clientului
        $cartHtmlRestaurant .= "<li>$nume_produs - Cantitate: $cantitate - Preț: $pret MDL</li>";
        $cartHtmlClient .= "<li>$nume_produs - Cantitate: $cantitate</li>";
    }
    $cartHtmlRestaurant .= "</ul><p><strong>Total comanda: $total MDL</strong></p>";
    $cartHtmlClient .= "</ul><p><strong>Total comanda: $total MDL</strong></p>";

    // Calculul prețului livrării pe baza sectorului selectat
    $deliveryPrices = [
        'riscanovca' => 50,
        'ciocana' => 75,
        'botanica' => 90,
        'telecentru' => 90,
        'buiucani' => 100
    ];
    $deliveryPrice = $deliveryPrices[$sector] ?? 0;  // Obținem prețul livrării
    $totalComanda = $total + $deliveryPrice;  // Calculăm totalul comenzii cu livrarea inclusă

    // Adăugăm prețul livrării și totalul final la mesajul restaurantului
    $cartHtmlRestaurant .= "<p><strong>Cost livrare: $deliveryPrice MDL</strong></p>";
    $cartHtmlRestaurant .= "<p><strong>Total comanda (incluzând livrarea): $totalComanda MDL</strong></p>";

    // Crearea obiectului PHPMailer
    $mail = new PHPMailer(true);

    try {
        // Configurare server SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'chetrusca.daniel13@gmail.com';  // Adresa ta Gmail
        $mail->Password = 'qxsl sckl ggih zgcg';  // Parola aplicației (nu o posta public!)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Setează expeditor
        $mail->setFrom('chetrusca.daniel13@gmail.com', 'Restaurant');

        // Trimitere email către restaurant
        $mail->addAddress('chetrusca.daniel13@gmail.com');
        $mail->isHTML(true);
        $mail->Subject = "Comandă nouă de la $nume";
        $mail->Body = "<h2>Comandă nouă</h2>
        <p><strong>Nume:</strong> $nume</p>
        <p><strong>Telefon:</strong> $telefon</p>
        <p><strong>Sectorul de livrare:</strong> $sector</p>
        <p><strong>Adresă:</strong> $adresa</p>
        <p><strong>Bloc:</strong> $bloc</p>
        <p><strong>Etaj:</strong> $etaj</p>
        <p><strong>Apartament:</strong> $apartament</p>
        <p><strong>Interfon:</strong> $interfon</p>
        <p><strong>Email:</strong> $email</p>
        <h3>Produse comandate:</h3>
        $cartHtmlRestaurant
        <p><strong>Metoda de livrare:</strong> $metoda_livrare</p>
        <p><strong>Metoda de plată:</strong> $metoda_plata</p>";

        // Trimitere email către restaurant
        if (!$mail->send()) {
            throw new Exception("Mesajul către restaurant nu a putut fi trimis.");
        }

        // Trimitere email către client
        $mail->clearAddresses();
        $mail->addAddress($email);

        // Generare salut în funcție de oră
        $ora_curenta = date('H');
        $salut = ($ora_curenta < 12) ? 'Bună dimineața' :
                 (($ora_curenta < 18) ? 'Bună ziua' : 'Bună seara');

        $mail->Subject = "Confirmare comandă";
        $mail->Body = "<strong>$salut, $nume</strong><br>
                       Comanda dvs. a fost primită cu succes!<br><br>
                       <h3>Detalii comandă:</h3>
                       $cartHtmlClient
                       <p>Vă vom contacta pentru livrare.</p>";

        if ($mail->send()) {
            // Golirea coșului de cumpărături
            unset($_POST["cartData"]);

            // Setarea unei sesiuni pentru succes (opțional, pentru feedback vizual pe pagină)
            session_start();
            $_SESSION['order_success'] = 'Comanda a fost trimisă cu succes!';

            // Redirecționare către index.html după trimiterea emailului
            header("Location: index.html");
            exit();
        } else {
            die('Mesajul către client nu a putut fi trimis.');
        }
    } catch (Exception $e) {
        die("Eroare la trimiterea emailului: {$mail->ErrorInfo}");
    }
} else {
    die("Acces interzis!");
}
?>
