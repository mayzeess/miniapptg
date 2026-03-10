const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

let cart = [];

const userNameElement = document.getElementById("user-name");
const cartItemsElement = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

const orderModal = document.getElementById("order-modal");
const confirmModal = document.getElementById("confirm-modal");
const successModal = document.getElementById("success-modal");

const closeModalBtn = document.getElementById("close-modal");
const continueOrderBtn = document.getElementById("continue-order");
const finalConfirmOrderBtn = document.getElementById("final-confirm-order");
const backToFormBtn = document.getElementById("back-to-form");
const closeSuccessBtn = document.getElementById("close-success");

const confirmSummary = document.getElementById("confirm-summary");

const nameInput = document.getElementById("name");
const surnameInput = document.getElementById("surname");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");

const user = tg.initDataUnsafe?.user;

if (user) {
    userNameElement.textContent = `Привет, ${user.first_name}${user.last_name ? " " + user.last_name : ""}!`;
} else {
    userNameElement.textContent = "Привет! Пользователь Telegram не определён.";
}

function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsElement.innerHTML = `<p class="empty-cart">Корзина пока пуста</p>`;
        totalPriceElement.textContent = "0";
        return;
    }

    cartItemsElement.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price}руб</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Удалить</button>
        `;

        cartItemsElement.appendChild(cartItem);
    });

    totalPriceElement.textContent = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function clearForm() {
    nameInput.value = "";
    surnameInput.value = "";
    emailInput.value = "";
    addressInput.value = "";
}

function buildSummary(name, surname, email, address) {
    const itemsHtml = cart
        .map(item => `<p>• ${item.name} — ${item.price}$</p>`)
        .join("");

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    confirmSummary.innerHTML = `
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Фамилия:</strong> ${surname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Адрес:</strong> ${address}</p>

        <div class="summary-items">
            <p><strong>Товары:</strong></p>
            ${itemsHtml}
        </div>

        <p class="summary-total">Итого: ${total}руб</p>
    `;
}

orderBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        tg.showAlert("Корзина пуста");
        return;
    }

    orderModal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
    orderModal.classList.add("hidden");
});

continueOrderBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();

    if (!name || !surname || !email || !address) {
        tg.showAlert("Пожалуйста, заполните все поля");
        return;
    }

    buildSummary(name, surname, email, address);

    orderModal.classList.add("hidden");
    confirmModal.classList.remove("hidden");
});

backToFormBtn.addEventListener("click", () => {
    confirmModal.classList.add("hidden");
    orderModal.classList.remove("hidden");
});

finalConfirmOrderBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();

    const orderData = {
        action: "create_order",
        user_id: user ? user.id : null,
        username: user ? user.username : null,
        name,
        surname,
        email,
        address,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    tg.sendData(JSON.stringify(orderData));

    confirmModal.classList.add("hidden");
    successModal.classList.remove("hidden");

    clearCart();
    clearForm();
});

closeSuccessBtn.addEventListener("click", () => {
    successModal.classList.add("hidden");
    tg.close();
});

async function loadProducts() {

    const response = await fetch("http://127.0.0.1:8000/goods");
    const goods = await response.json();

    const grid = document.querySelector(".products-grid");
    grid.innerHTML = "";

    goods.forEach(product => {

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}">
            <h3>${product.name}</h3>
            <p class="description">${product.description}</p>
            <p class="price">${product.price} руб</p>
            <button onclick="addToCart('${product.name}', ${product.price})">
                Добавить
            </button>
        `;

        grid.appendChild(card);
    });
}

loadProducts()
