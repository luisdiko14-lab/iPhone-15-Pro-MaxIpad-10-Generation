const applePayBtn = document.getElementById('apple-pay-btn');
const confirmation = document.getElementById('confirmation');
const quantitySelect = document.getElementById('quantity');
const quantityConfirm = document.getElementById('quantity-confirm');
const itemConfirm = document.getElementById('item-confirm');
const totalConfirm = document.getElementById('total-confirm');
const balanceEl = document.getElementById('balance');
const itemList = document.getElementById('item-list');

let selectedItem = null;
let balance = parseFloat(balanceEl.innerText.replace('$',''));

// RANDOM STORE ITEMS
const storeItems = [
    { name: "Robux Gift Card", price: 10 },
    { name: "VIP Game Pass", price: 15 },
    { name: "Exclusive Hat", price: 5 },
    { name: "Limited Skin", price: 20 },
    { name: "Mystery Box", price: 25 }
];

// Render items
storeItems.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.name}</span> <span>$${item.price}</span>`;
    li.addEventListener('click', () => {
        selectedItem = item;
        // Highlight selection
        document.querySelectorAll('#item-list li').forEach(i => i.style.background = '#3b3b46');
        li.style.background = '#5a5aff';
    });
    itemList.appendChild(li);
});

// Payment click
applePayBtn.addEventListener('click', () => {
    if (!selectedItem) {
        alert("Please select an item!");
        return;
    }

    let quantity = parseInt(quantitySelect.value);
    let totalPrice = selectedItem.price * quantity;

    if (balance < totalPrice) {
        alert("Insufficient balance!");
        return;
    }

    // Fake payment process
    applePayBtn.disabled = true;
    applePayBtn.innerText = "Processing...";

    setTimeout(() => {
        balance -= totalPrice;
        balanceEl.innerText = `$${balance.toFixed(2)}`;

        quantityConfirm.innerText = quantity;
        itemConfirm.innerText = selectedItem.name;
        totalConfirm.innerText = totalPrice;

        confirmation.style.display = 'block';
        applePayBtn.style.display = 'none';
    }, 1200);
});
