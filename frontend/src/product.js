import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {ajax} from './utils.js';
import {iconGen} from './jmicons.js';
import {addToCart, getQuantityInCart, displayCart, storeProduct} from './storage.js';

iconGen();

let urlParams = new URLSearchParams(window.location.search);

ajax('http://localhost:3000/api/teddies/' + urlParams.get('id')).then((product) => 
{
    displayProduct(product);
    getQuantityInCart(product);
    setModelChangeListener(product);
    setAddCartButtonListener(product);
    setClearCartButtonListener();
});

function displayProduct(product)
{
    document.getElementById('galery').innerHTML = renderProduct(product);
}

function renderProduct (product)
{
    let productHtml = `
    <div class="item">
        <img class="image" src=${product.imageUrl} alt=${product.name}>
        <div class="div">
            <h3 class="nom">${product.name}</h3>
            <p class="price">${product.price/100} €</p>
        </div>
        <div>
            <label for="model">Choisissez un modèle : </label>
            <select name="model" id="model">
    `;
    product.colors.forEach(element => {
        productHtml += `<option value="${element}">${element}</option>`;
    });
    productHtml += `
            </select>
        </div>
        <p class="description">${product.description}</p>
    </div>
    `;
    return productHtml;
}

function setAddCartButtonListener (product)
{
    document.getElementById('cartButton').addEventListener('click',() =>
    {
        // addToCart(product);
        storeProduct(product, document.getElementById('itemQuantity').value, document.getElementById('model').value);
    })
}

function setClearCartButtonListener ()
{
    document.getElementById('clearCartButton').addEventListener('click', ()=>
    {
        localStorage.clear();
        document.getElementById('itemQuantity').value = 0;
        displayCart();
    })
}

function setModelChangeListener (product)
{
    document.getElementById('model').addEventListener('change', () =>
    {
        getQuantityInCart(product);
    });
}