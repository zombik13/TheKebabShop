document.addEventListener('DOMContentLoaded', () => {
    loadProducts(); // Încarcă produsele când pagina este gata
});

// Funcție pentru încărcarea produselor de pe server
function loadProducts() {
    const formData = new FormData();
    formData.append('action', 'getAll'); // Setează acțiunea ca 'getAll'

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json()) // Parcurge răspunsul JSON
    .then(data => handleProductData(data)) // Tratează datele primite
    .catch(error => console.error('Eroare la încărcarea produselor:', error));
}

// Tratează datele produse primite
function handleProductData(data) {
    console.log('Răspuns de la server:', data);

    // Verifică dacă răspunsul conține 'success' și 'data' corect
    if (!data.success || !Array.isArray(data.data)) {
        console.error('Eroare: Răspunsul nu este un array de produse sau acțiunea nu a reușit', data);
        return;
    }

    resetProductSections(); // Curăță secțiunile produselor

    // Parcurge fiecare produs și adaugă-l în secțiunea corespunzătoare
    data.data.forEach(product => {
        const section = (product.section?.toLowerCase() || 'alte'); // Dacă nu există secțiune, folosește 'alte'
        const productHTML = createProductHTML(product);
        appendProductToSection(section, productHTML); // Adaugă produsul în secțiunea corectă
    });
}

// Curăță conținutul secțiunilor de produse
function resetProductSections() {
    const sections = ['burger', 'kebab', 'salata', 'cartofi', 'bowl', 'bauturi', 'deserturi', 'cafea'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(`${section}Section`);
        if (sectionElement) {
            sectionElement.innerHTML = ''; // Curăță secțiunea
        }
    });
}

// Creează HTML pentru un produs
function createProductHTML(product) {
    const imageSrc = product.image ? `data:image/jpeg;base64,${product.image}` : 'default.jpg'; // Setează imaginea sau o imagine implicită
    
    return `
        <div class="product-item">
            <img src="${imageSrc}" alt="${product.name}" class="product-image" />
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Preț: ${product.price} MDL</p>
            <p>Status: ${product.inStock == '1' ? 'În stoc' : 'Nu este în stoc'}</p>
        </div>
    `;
}

// Adaugă produsul în secțiunea corespunzătoare
function appendProductToSection(section, productHTML) {
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.insertAdjacentHTML('beforeend', productHTML); // Adaugă produsul în secțiune
    }
}
