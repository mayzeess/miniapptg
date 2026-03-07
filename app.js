const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

let cart = [];

const userNameElement = document.getElementById("user-name");
const cartItemsElement = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

const modal = document.getElementById("order-modal");
const closeModalBtn = document.getElementById("close-modal");
const confirmOrderBtn = document.getElementById("confirm-order");

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
                <div class="cart-item-price">${item.price}$</div>
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

orderBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        tg.showAlert("Корзина пуста");
        return;
    }

    modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

confirmOrderBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();

    if (!name || !surname || !email || !address) {
        tg.showAlert("Пожалуйста, заполните все поля");
        return;
    }

    const orderData = {
        action: "create_order",
        user_id: user ? user.id : null,
        username: user ? user.username : null,
        name: name,
        surname: surname,
        email: email,
        address: address,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    tg.sendData(JSON.stringify(orderData));

    modal.classList.add("hidden");

    nameInput.value = "";
    surnameInput.value = "";
    emailInput.value = "";
    addressInput.value = "";
});