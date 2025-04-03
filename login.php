<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require 'config.php';  // Se încarcă fișierul pentru conexiunea la baza de date

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Preia datele trimise din formular
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Căutăm utilizatorul în baza de date
    $sql = "SELECT parola FROM utilizatori WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();

    // Verifică dacă utilizatorul există în baza de date
    if ($stmt->num_rows > 0) {
        // Obține parola din baza de date (fără criptare)
        $stmt->bind_result($parola_db);
        $stmt->fetch();

        // Verifică dacă parola introdusă este aceeași cu cea din baza de date
        if ($password === $parola_db) {
            // Parola este corectă, autentificare reușită
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
            header("Location: manage.html");  // Redirecționează către manage.php
            exit;
        } else {
            // Parola este incorectă
            echo "Parolă incorectă!";
        }
    } else {
        // Utilizatorul nu există în baza de date
        echo "Utilizator inexistent!";
    }

    // Închide conexiunea
    $stmt->close();
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autentificare</title>
</head>
<body>
    <h2>Autentificare</h2>
    <form method="POST" action="login.php">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" placeholder="Introduceti username" required><br><br>
        
        <label for="password">Parolă:</label>
        <input type="password" id="password" name="password" placeholder="Introduceti parola" required><br><br>
        
        <button type="submit">Autentifică-te</button>
    </form>
</body>
</html>
