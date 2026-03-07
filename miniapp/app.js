const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что Mini App готов
tg.ready();

// Просим раскрыть окно приложения на максимум
tg.expand();

// Простая корзина
let cart = [];

// Получаем элементы со страницы
const userNameElement = document.getElementById("user-name");
const cartItemsElement = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

// Показываем данные пользователя, если они есть
const user = tg.initDataUnsafe?.user;

if (user) {
    userNameElement.textContent = `Привет, ${user.first_name}${user.last_name ? " " + user.last_name : ""}!`;
} else {
    userNameElement.textContent = "Привет! Пользователь Telegram не определён.";
}

// Добавление товара в корзину
function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
}

// Отрисовка корзины
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
            <button onclick="removeFromCart(${index})">Удалить</button>
        `;

        cartItemsElement.appendChild(cartItem);
    });

    totalPriceElement.textContent = total;
}

// Удаление товара
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// Оформление заказа
orderBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        tg.showAlert("Корзина пуста");
        return;
    }

    const orderData = {
        action: "create_order",
        user_id: user ? user.id : null,
        username: user ? user.username : null,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    // Отправляем данные обратно боту
    tg.sendData(JSON.stringify(orderData));
});