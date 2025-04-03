document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addProductForm').addEventListener('submit', handleFormSubmit);
    document.body.addEventListener('click', handleButtonClick);
    loadProducts();
});

// Adaugă sau editează produs
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('id', document.getElementById('productId').value || '');
    formData.append('name', document.getElementById('name').value.trim());
    formData.append('price', document.getElementById('price').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('inStock', document.getElementById('inStock').value);
    formData.append('section', document.getElementById('section').value.trim().toLowerCase());
    formData.append('action', document.getElementById('productId').value ? 'edit' : 'add');

    // Adaugă imaginea la formData (dacă există)
    const imageInput = document.getElementById('image');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Răspuns de la server:', data);
        if (data.success) {
            loadProducts();
            resetForm();
        } else {
            alert(data.message || 'Eroare la salvarea produsului!');
        }
    })
    .catch(error => console.error('Eroare:', error));
}

// Gestionează butoanele de editare, ștergere și schimbare stoc
function handleButtonClick(event) {
    const target = event.target;
    if (target.matches('.editButton')) editProduct(target.dataset.id);
    if (target.matches('.deleteButton')) deleteProduct(target.dataset.id);
    if (target.matches('.toggleStockButton')) toggleStock(target.dataset.id, target.dataset.instock);
}

// Încarcă toate produsele
function loadProducts() {
    const formData = new FormData();
    formData.append('action', 'getAll');

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Răspuns de la server:', data);

        // Verificăm dacă răspunsul conține 'success' și 'data'
        if (data.success === false || !Array.isArray(data.data)) {
            console.error('Eroare: Răspunsul nu este un array de produse sau acțiunea nu a reușit', data);
            return;
        }

        resetProductSections(); // Curăță secțiunile produselor
        data.data.forEach(product => {  // Accesăm array-ul 'data'
            const section = product.section?.toLowerCase() || 'alte';
            appendProductToSection(section, createProductHTML(product)); // Adaugă produsul în secțiunea potrivită
        });
    })
    .catch(error => {
        console.error('Eroare la încărcarea produselor:', error);
    });
}

// Curăță secțiunile produselor
function resetProductSections() {
    const sections = ['burger', 'kebab', 'salata', 'cartofi', 'bowl', 'bauturi', 'deserturi', 'cafea'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(`${section}Section`);
        if (sectionElement) sectionElement.innerHTML = '';
    });
}

// Creează HTML pentru fiecare produs
function createProductHTML(product) {
    const imageSrc = product.image ? `data:image/jpeg;base64,${product.image}` : 'default.jpg';
    
    return `
        <div class="product-item">
            <img src="${imageSrc}" alt="${product.name}" class="product-image" />
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Preț: ${product.price} MDL</p>
            <p>Status: ${product.inStock == '1' ? 'În stoc' : 'Nu este în stoc'}</p>
            <button class="editButton" data-id="${product.id}">Editează</button>
            <button class="deleteButton" data-id="${product.id}">Șterge</button>
            <button class="toggleStockButton" data-id="${product.id}" data-instock="${product.inStock}">
                ${product.inStock == '1' ? 'Scoate din stoc' : 'Adaugă în stoc'}
            </button>
        </div>
    `;
}

// Adaugă produs în secțiunea potrivită
function appendProductToSection(section, productHTML) {
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.insertAdjacentHTML('beforeend', productHTML);
    }
}

// Editare produs
function editProduct(id) {
    const formData = new FormData();
    formData.append('action', 'getById');
    formData.append('id', id);

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(product => {
        if (!product || !product.id) {
            alert('Eroare: Produsul nu a fost găsit!');
            return;
        }

        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('description').value = product.description;
        document.getElementById('inStock').value = product.inStock;
        document.getElementById('section').value = product.section;
    })
    .catch(error => console.error('Eroare la editare:', error));
}

// Ștergere produs
function deleteProduct(id) {
    if (!confirm('Sigur vrei să ștergi acest produs?')) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadProducts();
        } else {
            alert('Eroare la ștergere: ' + (data.message || 'Produsul nu a putut fi șters!'));
        }
    })
    .catch(error => console.error('Eroare:', error));
}

// Schimbă statusul stocului
function toggleStock(id, currentStock) {
    const formData = new FormData();
    formData.append('action', 'updateStock');
    formData.append('id', id);
    formData.append('inStock', currentStock == '1' ? '0' : '1');

    fetch('manage_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadProducts();
        } else {
            alert('Eroare la actualizare stoc!');
        }
    })
    .catch(error => console.error('Eroare:', error));
}

// Resetează formularul după trimitere
function resetForm() {
    document.getElementById('addProductForm').reset();
    document.getElementById('productId').value = '';
}
