// Definirea variabilelor globale pentru coș
let cart = [];
const cartItemsContainer = document.querySelector('.cart-items');
const totalDisplay = document.getElementById('total');
const emptyCartBtn = document.getElementById('empty-cart');
const toggleCartBtn = document.getElementById('toggle-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartContainer = document.getElementById('cart');
const overlay = document.querySelector('.overlay');

// Încarcă coșul din Local Storage la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    updateTotal();

    // Verifică dacă elementele de deschidere și închidere a coșului există
    if (toggleCartBtn && cartContainer && overlay) {
        console.log("Toggle button și containerul coșului sunt găsite!");

        // Eveniment pentru deschiderea coșului
        toggleCartBtn.addEventListener('click', () => {
            console.log("Butonul pentru deschiderea coșului a fost apăsat");
            cartContainer.style.display = "block";
            overlay.style.display = "block";
        });

        // Eveniment pentru închiderea coșului
        closeCartBtn.addEventListener('click', () => {
            console.log("Butonul pentru închiderea coșului a fost apăsat");
            cartContainer.style.display = "none";
            overlay.style.display = "none";
        });

        // Eveniment pentru închiderea coșului prin click pe overlay
        overlay.addEventListener('click', () => {
            console.log("Click pe overlay");
            cartContainer.style.display = "none";
            overlay.style.display = "none";
        });
    } else {
        console.log("Elementele pentru deschiderea/închiderea coșului nu sunt găsite");
    }
});

// Adăugarea unui produs în coș
function addToCart(name, price, event) {
    const existingProduct = cart.find(item => item.name === name);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
    animateProductToCart(event.target); // Funcția pentru animarea produsului adăugat
}

// Renderizează produsele din coș
function renderCartItems() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = ''; // Curăță lista actuală a produselor
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
    attachCartItemEvents(); // Reasociază evenimentele pentru produsele adăugate
}

// Actualizează totalul coșului
function updateTotal() {
    if (!totalDisplay) return;
    const totalProducts = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    totalDisplay.textContent = `${totalProducts.toFixed(2)} MDL`;
}

// Modifică cantitatea unui produs
function changeQuantity(index, change) {
    index = Number(index);
    if (cart[index]) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity >= 1 && newQuantity <= 20) { // Limitează cantitatea între 1 și 20
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

// Actualizează coșul și salvează în Local Storage
function updateCart() {
    renderCartItems();
    updateTotal();
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
            if (!Array.isArray(cart)) cart = []; // Verifică dacă datele sunt într-un format valid
        } catch (e) {
            cart = [];
        }
    }
    updateCart();
}

// Adăugarea evenimentelor pentru modificare cantitate și eliminare
function attachCartItemEvents() {
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(btn.dataset.index, -1)); // Reducerea cantității
    });
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(btn.dataset.index, 1)); // Creșterea cantității
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.index)); // Ștergerea produsului
    });
}

// Funcția de golire a coșului
if (emptyCartBtn) {
    emptyCartBtn.addEventListener('click', () => {
        cart = [];
        updateCart();
    });
}
