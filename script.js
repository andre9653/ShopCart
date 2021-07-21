function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.classList = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.classList = className;
  e.innerText = innerText;
  return e;
}

function currencyConvert(number) {
  return new Intl
    .NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
}

function someCart() {
  const productsOfCarts = document.querySelectorAll('.cart__item');
  const elementTotal = document.querySelector('.total-price');
  let total = 0;
  productsOfCarts.forEach((value) => {
    total += value.alt;
  });
  elementTotal.innerText = currencyConvert(total);
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerHTML = `SKU: ${sku} | NAME: ${name} | PRICE: ${currencyConvert(salePrice)}
    <br><button class="legend button">Click para remover</button>`;
  li.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') event.target.parentNode.remove();
    localStorage.removeItem(sku);
    someCart();
  });
  li.alt = salePrice;
  return li;
}

function idFetch(id) {
  const cartItems = document.querySelector('.cart__items');
  const url = `https://api.mercadolibre.com/items/${id}`;
  return fetch(url)
    .then((response) => response.json())
    .then((object) => {
      const product = { sku: object.id, name: object.title, salePrice: object.price };
      localStorage.setItem(`${product.sku}`, JSON.stringify(product));
      return product;
    })
    .then((product) => cartItems.appendChild(createCartItemElement(product)))
    .then(() => someCart());
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item tile is-parent box';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const newButton = createCustomElement(
    'button', 'item__add button button is-success is-active', 'Adicionar ao carrinho!',
    );
    newButton.addEventListener('click', (event) => {
      idFetch(getSkuFromProductItem(event.target.parentNode));
    });
  section.appendChild(newButton);
  return section;
}

function removeLoading() {
  const loading = document.querySelector('.loading');
  if (loading !== null) loading.remove();
}

function castOfProducts(response) {
  return response.results
    .map((product) => ({ sku: product.id, name: product.title, image: product.thumbnail }));
}

function arrayOFProducts(array) {
  array.forEach((product) => {
    const items = document.querySelector('.items');
    items.appendChild(createProductItemElement(product));
  });
}

function itensFetch(inputValue) {
  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${inputValue}`;
  return fetch(url)
    .then((response) => {
      if (!response) throw new Error();
      removeLoading();
      return response.json();
    })
    .then((response) => castOfProducts(response))
    .then((products) => {
      if (inputValue) document.querySelector('.items').innerHTML = '';
      arrayOFProducts(products);
    });
}

function addProductSearch(event) {
  if (event.key === 'Enter' || event.type === 'click') {
    const product = document.querySelector('.inputSearch').value;
    itensFetch(product)
    .then(() => someCart());
  }
}

function eventPress(callback, ...querySelector) {
  querySelector.forEach((element) => {
    if (element.type === 'text') {
      element.addEventListener('keypress', callback);
    } else {
      element.addEventListener('click', callback);
    }
  });
}

function searchProduct() {
  const buttonSearch = document.querySelector('.searchButton');
  const inputSearch = document.querySelector('.inputSearch');
  eventPress(addProductSearch, buttonSearch, inputSearch);
}

function updateLocalStorage() {
  const cartItems = document.querySelector('.cart__items');
  const local = localStorage;
  const arrayOfLocalStorage = Object.values(local);
  arrayOfLocalStorage.forEach((productsObject) => {
    const productConvert = JSON.parse(productsObject);
    cartItems.appendChild(createCartItemElement(productConvert));
  });
}

function buttonForRemove() {
  const button = document.querySelector('.empty-cart');
  button.addEventListener('click', () => {
    const listOfCart = document.getElementById('listOfCart');
    listOfCart.innerHTML = '';
    localStorage.clear();
    someCart();
  });
}

buttonForRemove();
searchProduct();

window.onload = () => {
  itensFetch()
    .then(() => updateLocalStorage())
    .then(() => someCart());
};
