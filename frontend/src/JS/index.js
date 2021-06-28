import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '../style/style.scss';

import {displayIcons} from './jmicons.js';
import * as utils from './utils.js';


fetch('http://localhost:3000/api/teddies')
    .then((response) => 
    {
        return response.json();
    })
    .then((products) => 
    {
        displayProducts(products);
        displayIcons();
        utils.displayCartCount();
    })

function displayProducts(products) 
{
    let galery = document.getElementById('galery');
    products.forEach(product => 
    {
        galery.innerHTML += renderProduct(product);
    });
}

function renderProduct(product)
{
    return `
    <a class="item" href="./pages/product.html?id=${product._id}">
        <img class="image" src=${product.imageUrl} alt=${product.name}>
        <div class="div">
            <h3 class="nom">${product.name}</h3>
            <p class="price">${product.price/100} €</p>
        </div>
        <p class="description">${product.description}</p>
    </a>
    `;
}