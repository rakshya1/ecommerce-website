// =================================================================
//                 NYMPH ECOMMERCE - FINAL JAVASCRIPT
// This single file handles all frontend logic for the site.
// =================================================================

// --- 1. DUMMY PRODUCT DATA ---
// In a real application, you would fetch this from a server/API.
// Make sure you have an 'images' folder with product-1.jpg, product-2.jpg, etc.
const products = [
  {
    id: 1,
    name: "Elegant Floral Dress",
    price: 2500,
    image: "images/product-1.jpg",
  },
  {
    id: 2,
    name: "Classic Denim Jacket",
    price: 3200,
    image: "images/product-2.jpg",
  },
  {
    id: 3,
    name: "Summer Vibe T-Shirt",
    price: 1200,
    image: "images/product-3.jpg",
  },
  {
    id: 4,
    name: "Formal Office Blazer",
    price: 4500,
    image: "images/product-4.jpg",
  },
  {
    id: 5,
    name: "Cozy Knit Sweater",
    price: 2800,
    image: "images/product-5.jpg",
  },
  {
    id: 6,
    name: "Casual Striped Shirt",
    price: 1800,
    image: "images/product-6.jpg",
  },
  {
    id: 7,
    name: "Bohemian Maxi Skirt",
    price: 2200,
    image: "images/product-7.jpg",
  },
  {
    id: 8,
    name: "Athletic Jogger Pants",
    price: 1900,
    image: "images/product-8.jpg",
  },
];

// --- 2. GLOBAL CART STATE ---
// This 'cart' array will hold the items the user has added.
let cart = [];

// --- 3. CORE CART FUNCTIONS (USING BROWSER'S LOCAL STORAGE) ---

/**
 * Loads the cart from the browser's local storage when a page loads.
 * This makes the cart "remembered" across different pages.
 */
function loadCartFromLocalStorage() {
  const cartString = localStorage.getItem("cart");
  cart = cartString ? JSON.parse(cartString) : [];
}

/**
 * Saves the current cart array to the browser's local storage.
 * This is called every time the cart is modified.
 */
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Updates the little number badge on the cart icon in the navbar.
 */
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.innerText = totalItems;
  }
}

/**
 * Shows a temporary notification message (a "toast").
 * @param {string} message - The message to display.
 */
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast-notification show";
  setTimeout(() => {
    toast.className = "toast-notification";
  }, 3000); // The toast disappears after 3 seconds.
}

// --- 4. PAGE-SPECIFIC RENDERING FUNCTIONS ---

/**
 * Renders product cards into a container (used for Home and Shop pages).
 * @param {Array} productList - The list of products to display.
 * @param {string} containerId - The ID of the HTML element where products will be added.
 */
function renderProducts(productList, containerId) {
  const productGrid = document.getElementById(containerId);
  if (!productGrid) return; // Exit if the container doesn't exist on the current page

  productGrid.innerHTML = ""; // Clear the "Loading..." message
  productList.forEach((product) => {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
    cardWrapper.innerHTML = `<div class="card h-100"><img src="${
      product.image
    }" class="card-img-top" alt="${
      product.name
    }"><div class="card-body d-flex flex-column"><h5 class="card-title title">${
      product.name
    }</h5><p class="card-text price mt-auto">Rs ${product.price.toFixed(
      2
    )}</p><button class="btn add-to-cart-btn" data-product-id="${
      product.id
    }">Add to Cart</button></div></div>`;
    productGrid.appendChild(cardWrapper);
  });
  document
    .querySelectorAll(".add-to-cart-btn")
    .forEach((button) => button.addEventListener("click", handleAddToCart));
}

/**
 * Renders the full cart page with items, quantities, totals, and controls.
 */
function renderCartPage() {
  const cartContainer = document.getElementById("cart-container");
  const emptyMessage = document.getElementById("cart-empty-message");
  const summaryContainer = document.getElementById("cart-summary-container");
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.style.display = "none";
    summaryContainer.style.display = "none";
    emptyMessage.style.display = "block";
    return;
  }

  cartContainer.style.display = "block";
  summaryContainer.style.display = "block";
  emptyMessage.style.display = "none";
  cartContainer.innerHTML = `<table class="table cart-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Remove</th></tr></thead><tbody id="cart-items-body"></tbody></table>`;
  const cartItemsBody = document.getElementById("cart-items-body");
  let subtotal = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;
    const itemTotal = item.quantity * product.price;
    subtotal += itemTotal;
    const row = document.createElement("tr");
    row.innerHTML = `<td><div class="d-flex align-items-center"><img src="${
      product.image
    }" alt="${
      product.name
    }" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;"><span>${
      product.name
    }</span></div></td><td>Rs ${product.price.toFixed(
      2
    )}</td><td><input type="number" class="form-control quantity-input" value="${
      item.quantity
    }" min="1" data-product-id="${item.id}"></td><td>Rs ${itemTotal.toFixed(
      2
    )}</td><td><button class="btn btn-danger btn-sm remove-item-btn" data-product-id="${
      item.id
    }">×</button></td>`;
    cartItemsBody.appendChild(row);
  });
  document.getElementById("cart-subtotal").innerText = `Rs ${subtotal.toFixed(
    2
  )}`;
  document.getElementById("cart-total").innerText = `Rs ${subtotal.toFixed(2)}`;
  document
    .querySelectorAll(".quantity-input")
    .forEach((input) => input.addEventListener("change", handleQuantityChange));
  document
    .querySelectorAll(".remove-item-btn")
    .forEach((button) => button.addEventListener("click", handleRemoveItem));
}

/**
 * Renders the order summary on the checkout page.
 */
function loadCartForCheckout() {
  const orderSummaryList = document.getElementById(
    "checkout-order-summary-list"
  );
  if (!orderSummaryList) return;
  const totalPriceElement = document.getElementById("checkout-total-price");
  const checkoutContent = document.getElementById("checkout-content");
  const emptyMessage = document.getElementById("checkout-empty-message");
  if (cart.length === 0) {
    checkoutContent.style.display = "none";
    emptyMessage.style.display = "block";
    return;
  }
  checkoutContent.style.display = "block";
  emptyMessage.style.display = "none";
  orderSummaryList.innerHTML = "";
  let totalPrice = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return;
    const listItem = document.createElement("li");
    listItem.className = "d-flex justify-content-between py-2";
    const itemName = `${product.name} (x${item.quantity})`;
    const itemPrice = (product.price * item.quantity).toFixed(2);
    listItem.innerHTML = `<span>${itemName}</span><span>Rs ${itemPrice}</span>`;
    orderSummaryList.appendChild(listItem);
    totalPrice += product.price * item.quantity;
  });
  totalPriceElement.innerText = `Rs ${totalPrice.toFixed(2)}`;
}

// --- 5. EVENT HANDLER FUNCTIONS ---
function handleAddToCart(event) {
  const productId = parseInt(event.target.dataset.productId);
  const product = products.find((p) => p.id === productId);
  if (product) {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) existingItem.quantity++;
    else
      cart.push({
        id: productId,
        quantity: 1,
        price: product.price,
        name: product.name,
      });
    saveCartToLocalStorage();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
  }
}

function handleQuantityChange(event) {
  const productId = parseInt(event.target.dataset.productId);
  const newQuantity = parseInt(event.target.value);
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem && newQuantity > 0) {
    cartItem.quantity = newQuantity;
    saveCartToLocalStorage();
    updateCartCount();
    renderCartPage();
  }
}

function handleRemoveItem(event) {
  const productId = parseInt(event.target.dataset.productId);
  cart = cart.filter((item) => item.id !== productId);
  saveCartToLocalStorage();
  updateCartCount();
  renderCartPage();
  showToast(`Item removed from cart.`);
}

/**
 * Main function to handle the Khalti checkout process.
 */
function handleKhaltiCheckout(event) {
  event.preventDefault(); // Stop the form from submitting and reloading the page

  if (cart.length === 0) {
    showToast("Your cart is empty. Please add items before paying.");
    return;
  }

  const totalAmountText = document.getElementById(
    "checkout-total-price"
  ).innerText;
  const totalAmount = parseFloat(totalAmountText.replace(/Rs\s*/, ""));
  const orderId = `NYMPH-KLT-${Date.now()}`;

  // Khalti's configuration object
  const config = {
    // Replace with your TEST PUBLIC KEY from sandbox.khalti.com
    publicKey: "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
    productIdentity: orderId,
    productName: "Nymph Ecommerce Order",
    productUrl: window.location.origin,
    paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING"],
    eventHandler: {
      onSuccess(payload) {
        // This function is called after the user completes payment in the popup.
        // The payment is NOT yet verified. We must do that on our backend.
        console.log("Khalti Success Payload:", payload);

        // Send the payload to your backend server for verification.
        // NOTE: The URL 'http://localhost:3000/verify-khalti' must match your running backend server.
        fetch("http://localhost:3000/verify-khalti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: payload.token,
            amount: payload.amount,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // This means our server confirmed the payment with Khalti.
              console.log("Payment successfully verified by server!");
              alert("Payment successful and verified!");
              localStorage.removeItem("cart"); // Clear the cart
              window.location.href = "/payment-success.html"; // Redirect to final success page
            } else {
              // This means our server told us the verification failed.
              alert("Payment verification failed! Please contact support.");
              window.location.href = "/payment-failure.html";
            }
          })
          .catch((error) => {
            // This happens if our backend server is down or there's a network error.
            console.error("Verification request to your server failed:", error);
            alert(
              "Could not connect to the server for verification. Please contact support."
            );
          });
      },
      onError(error) {
        console.error("Khalti Error:", error);
        alert("Khalti payment failed.");
      },
      onClose() {
        console.log("Khalti widget was closed by the user.");
      },
    },
  };

  const checkout = new KhaltiCheckout(config);
  // Launch the Khalti popup. Amount must be in Paisa.
  checkout.show({ amount: totalAmount * 100 });
}

// --- 6. MAIN EXECUTION SCRIPT (The Starting Point) ---
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocalStorage();
  updateCartCount();

  // Check which page we are on and run the corresponding functions.
  if (document.getElementById("featured-product-grid")) {
    renderProducts(products.slice(0, 4), "featured-product-grid");
  }
  if (document.getElementById("shop-product-grid")) {
    renderProducts(products, "shop-product-grid");
  }
  if (document.getElementById("cart-container")) {
    renderCartPage();
  }
  if (document.getElementById("checkoutForm")) {
    loadCartForCheckout();
    // Attach the payment handler to the form's submit event.
    document
      .getElementById("checkoutForm")
      .addEventListener("submit", handleKhaltiCheckout);
  }
});
