import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
// import '../../node_modules/bootstrap-icons/font/bootstrap-icons.css';
import {ajax} from './utils.js';

let urlParams = new URLSearchParams(window.location.search);
let cartButton = document.getElementById('cartButton');
let itemQuantity = document.getElementById('itemQuantity');

ajax('http://localhost:3000/api/teddies/' + urlParams.get('id')).then((product) => 
{
    displayProduct(product);
    quantityInCart(product);
    // localStorage.clear();
    console.log(localStorage.length);
})

cartButton.addEventListener('click',() =>
{
    ajax('http://localhost:3000/api/teddies/' + urlParams.get('id')).then((product) => 
        {
            addToCart(product);
        })
})

clearCartButton.addEventListener('click', ()=>
{
    localStorage.clear();
    itemQuantity.value = 0;
    displayCart();
})

function displayProduct(product)
{
    let galery = document.getElementById('galery');
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
        productHtml += `
            <option value="${element}">${element}</option>
        `;
    });
    productHtml += `
                </select>
        </div>
        <p class="description">${product.description}</p>
    </div>
    `;
    galery.innerHTML = productHtml;

    model.addEventListener('change', () =>
    {
        quantityInCart(product);
    });
}

function addToCart(product)
{
    let model = document.getElementById('model');
    if (localStorage.getItem(product._id + '_' + model.value)) {
        if (itemQuantity.value == 0) {
            localStorage.removeItem(product._id + '_' + model.value);
        } else {
            let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
            item.quantity = parseInt(item.quantity, 10) + parseInt(itemQuantity.value, 10);
            item.totPrice = item.quantity * item.price;
            localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
        }
    } else {
        let item = {
            name: product.name,
            model: model.value,
            price: product.price,
            quantity: parseInt(itemQuantity.value, 10),
            totPrice: product.price * itemQuantity.value
        };
        localStorage.setItem(product._id + '_' + model.value, JSON.stringify(item));
    }
    displayCart();
}

function quantityInCart(product)
{
    let model = document.getElementById('model');
    if (localStorage.getItem(product._id + '_' + model.value)) {
        let item = JSON.parse(localStorage.getItem(product._id + '_' + model.value));
        itemQuantity.value = item.quantity;
    } else {
        itemQuantity.value = 0;
    }
}

function displayCart()
{
    let msg = "";
    if (localStorage.length == 0) {
        msg = "Votre panier est vide.";
    } else {
        msg = "Votre panier comporte :";
        let totCart = 0;
        for (let i=0; i<localStorage.length; i++) {
            let item = JSON.parse(localStorage.getItem(localStorage.key(i)));
            msg += `\r${item.quantity} peluche(s) ${item.name} de couleur ${item.model}, pour un prix de ${item.totPrice/100}€`;
            totCart += item.totPrice;
        }
        msg += `\rMontant total de votre panier : ${totCart/100}€`;
    }
    alert(msg);
}