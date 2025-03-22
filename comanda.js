document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("finalizeaza-comanda");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Oprire trimitere normală

        let formData = new FormData(form); // Preluare date formular

        // Adăugăm produsele din coș la formData
        formData.append("cart", JSON.stringify(cart));

        // Trimitem datele către `index.php`
        fetch("index.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert(data); // Afișăm răspunsul serverului
            if (data.includes("Comanda a fost trimisă")) {
                cart = []; // Golim coșul
                saveCartToLocalStorage();
                renderCartItems();
                updateTotal();
                form.reset();
            }
        })
        .catch(error => console.error("Eroare:", error));
    });
});
