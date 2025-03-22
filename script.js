// Definirea variabilelor globale
let cart = [];
const cartItemsContainer = document.querySelector('.cart-items');
const totalDisplay = document.getElementById('total');
const emptyCartBtn = document.getElementById('empty-cart');
const toggleCartBtn = document.getElementById('toggle-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartContainer = document.getElementById('cart');
const overlay = document.querySelector('.overlay');
const sectorRadios = document.querySelectorAll('input[name="sector"]');

// Încarcă coșul din Local Storage la încărcarea paginii
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    updateTotal(); // Actualizează totalul pe index.html
});

// Adăugarea unui produs în coș
function addToCart(name, price, event) {
    const existingProduct = cart.find(item => item.name === name);

    if (existingProduct) {
        existingProduct.quantity += 1; // Crește cantitatea dacă produsul există deja
    } else {
        cart.push({ name, price, quantity: 1 }); // Adaugă produsul dacă nu există
    }

    updateCart(); // Actualizează coșul după adăugare
    animateProductToCart(event.target); // Animația produsului
}

// Renderizează produsele din coș
function renderCartItems() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = ''; // Curăță coșul existent

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        li.innerHTML = `
            <div class="cart-item-details">
                <span class="item-name">${item.name}</span> - 
                <span class="item-price">${item.price} MDL</span>
                <button class="quantity-btn decrease" data-index="${index}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-index="${index}">+</button>
            </div>
            <button class="remove-btn" data-index="${index}">Șterge</button>
        `;

        cartItemsContainer.appendChild(li);
    });

    // Adaugă evenimente pentru butoanele de modificare cantitate și eliminare
    attachCartItemEvents();
}

// Actualizează totalul coșului (fără livrare)
function updateTotal() {
    if (!totalDisplay) return;

    const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    totalDisplay.textContent = `${totalProducts.toFixed(2)} MDL`; // Afișează totalul cu 2 zecimale
}

// Modifică cantitatea unui produs
function changeQuantity(index, change) {
    index = Number(index);
    if (cart[index]) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity >= 1 && newQuantity <= 20) {
            cart[index].quantity = newQuantity;
            updateCart();
        }
    }
}

// Șterge un produs din coș
function removeFromCart(index) {
    index = Number(index);
    if (cart[index]) {
        cart.splice(index, 1);
        updateCart();
    }
}

// Actualizează coșul și salvează-l în Local Storage
function updateCart() {
    renderCartItems();
    updateTotal(); // Actualizează totalul produselor
    saveCartToLocalStorage();
}

// Salvează coșul în Local Storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Încarcă coșul din Local Storage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            if (!Array.isArray(cart)) cart = [];
        } catch (e) {
            cart = [];
        }
    }
    updateCart();
}

// Afișează și ascunde coșul
if (toggleCartBtn && cartContainer && closeCartBtn) {
    toggleCartBtn.addEventListener('click', () => {
        cartContainer.style.display = "block";
        overlay.style.display = "block";
    });

    closeCartBtn.addEventListener('click', () => {
        cartContainer.style.display = "none";
        overlay.style.display = "none";
    });

    overlay.addEventListener('click', () => {
        cartContainer.style.display = "none";
        overlay.style.display = "none";
    });
}

// Adăugarea evenimentelor pentru butoanele de modificare cantitate și eliminare
function attachCartItemEvents() {
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(btn.dataset.index, -1));
    });

    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(btn.dataset.index, 1));
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.index));
    });
}

// Funcția de golire a coșului
if (emptyCartBtn) {
    emptyCartBtn.addEventListener('click', () => {
        cart = [];
        updateCart();
    });
}

// Funcție pentru a verifica intervalul de timp
function checkCheckoutAvailability() {
    const now = new Date();
    const hour = now.getHours();
    return !(hour >= 22 || hour < 9); // Permite doar între 09:00 și 22:00
}

// Eveniment la click pe link-ul de checkout
document.getElementById("checkoutLink").addEventListener("click", function(event) {
    if (!checkCheckoutAvailability()) {
        alert("Nu poți face comenzi între orele 22:00 și 09:00. Te rugăm să revii mai târziu.");
        event.preventDefault(); // Previne redirecționarea
    }
});

// Funcția care animă produsul spre coș
function animateProductToCart(button) {
    const productImage = button.closest('.product').querySelector('img');
    if (!productImage) return;

    const flyingProduct = productImage.cloneNode();
    flyingProduct.classList.add('flying-product');
    document.body.appendChild(flyingProduct);

    const cartButton = document.getElementById('toggle-cart');
    const productRect = productImage.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    flyingProduct.style.position = 'absolute';
    flyingProduct.style.left = `${productRect.left + window.scrollX}px`;
    flyingProduct.style.top = `${productRect.top + window.scrollY}px`;

    setTimeout(() => {
        flyingProduct.style.left = `${cartRect.left + window.scrollX}px`;
        flyingProduct.style.top = `${cartRect.top + window.scrollY}px`;
    }, 0);

    flyingProduct.addEventListener('animationend', () => {
        flyingProduct.remove();
    });
}

// Actualizează prețul livrării în funcție de sectorul ales
function updateDeliveryPrice() {
    let deliveryPrice = 0;
    sectorRadios.forEach(radio => {
        if (radio.checked) {
            deliveryPrice = parseFloat(radio.dataset.price);
        }
    });

    // Salvează prețul livrării în localStorage
    localStorage.setItem('deliveryPrice', deliveryPrice);

    document.getElementById('livrarePret').textContent = deliveryPrice;
    updateTotal(); // Actualizează totalul produselor
}

// Eveniment pentru actualizarea prețului livrării când se selectează un sector
sectorRadios.forEach(radio => {
    radio.addEventListener('change', updateDeliveryPrice);
});
