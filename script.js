const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

// buttons
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("package.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price, description } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image, description };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <div class="products-grid">
          <img src=${product.image} alt="" />
          <div class="align">
            <h3 class="padding">${product.title}</h3>
            <p style="font-size: 0.8rem; margin-bottom: 0.5rem; color: #555;">
            ${product.description}
            </p>
            <h4 class="padding">$${product.price}</h4>
            <button class="bag-btn pointer " data-id=${product.id}>
              add to cart
            </button>
          </div>
        </div>
        `;
    });
    productsDOM.innerHTML = result;
    console.log(products);
  }

  displayCheckoutSummary() {
  const checkoutItemsList = document.getElementById("checkout-items-list");
  const finalCheckoutTotal = document.getElementById("final-checkout-total");
  
  let tempTotal = 0;
  let result = "";
  
  cart.forEach(item => {
      result += `
      <p>
        ${item.title} (x${item.amount}) - $${(item.price * item.amount).toFixed(2)}
      </p>`;
      tempTotal += item.price * item.amount;
  });

  if (checkoutItemsList) {
      checkoutItemsList.innerHTML = result || "<p>Your cart is empty</p>";
      finalCheckoutTotal.innerText = tempTotal.toFixed(2);
  }
}

  // setting values when clicking the button
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In cart";
        event.target.disabled = true;

        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  
  // adding values to the cart
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    if (cartTotal) {
      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    }
    if (cartItems) {
      cartItems.innerHTML = itemsTotal;
    }
  }
  
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
     <img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id =${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id =${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down"  data-id =${item.id}></i>
            </div>
      `;

    if (cartContent) {
      cartContent.appendChild(div);
    }
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    if (cartBtn) {
      cartBtn.addEventListener("click", this.showCart);
    }
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", this.hideCart);
    }
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);

      } else if (event.target.classList.contains("fa-chevron-up")) {
          let addAmount = event.target;
          let id = addAmount.dataset.id;
          let tempItem = cart.find((item) => item.id === id);
          tempItem.amount = tempItem.amount + 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          addAmount.nextElementSibling.innerText = tempItem.amount;

      } else if (event.target.classList.contains("fa-chevron-down")) {
          let lowerAmount = event.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find((item) => item.id === id);
          tempItem.amount = tempItem.amount - 1;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  //   cart functionality
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    console.log(cartItems);
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class ="fas fa-shopping-cart"></i>add to cart`;
    console.log(button);
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage

class Storage {
  static saveProducts(product) {
    localStorage.setItem("products", JSON.stringify(product));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

function completeOrder() {
    alert("Thank you! Your order has been placed via Cash on Delivery!");
    localStorage.removeItem("cart");
    window.location.href = "home.html";
}


document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupAPP();

if (document.querySelector(".products-center")) {
    products.getProducts().then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    }).then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
  }

  if (document.getElementById("checkout-items-list")) {
    ui.displayCheckoutSummary();
  }
});

