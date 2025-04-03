<?php
$servername = "localhost";  // Adresa serverului MySQL
$username = "root";         // Numele de utilizator MySQL
$password = "";             // Parola MySQL
$dbname = "autentificare";  // Numele bazei de date

// Creează conexiunea
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifică conexiunea
if ($conn->connect_error) {
    die("Conexiune eșuată: " . $conn->connect_error);
}
?>
