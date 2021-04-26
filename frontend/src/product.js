import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './style.scss';
import {ajax} from './utils.js';

let urlParams = new URLSearchParams(window.location.search);

ajax('http://localhost:3000/api/teddies/' + urlParams.get('id')).then((product) => 
{
    displayProduct(product);
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
        <p class="description">${product.description}</p>
    </div>
    `;
    galery.innerHTML = productHtml;
}